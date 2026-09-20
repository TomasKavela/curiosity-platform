import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthedVariables } from "../middleware/auth";
import { WorkersAIProvider } from "../ai/WorkersAIProvider";
import { onboardingAnswerSchema } from "../schemas";

export const onboardingRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

const ONBOARDING_STEPS = [
  "Como preferes que te trate?",
  "O que estudas ou fazes, e o que mais gostas nisso?",
  "E fora disso — que hobby ou interesse genuinamente te ocupa o tempo livre?",
] as const;

onboardingRoute.get("/steps", (c) => c.json({ steps: ONBOARDING_STEPS }));

async function extractAndMergeSignalsInBackground(
  db: D1Database,
  ai: WorkersAIProvider,
  userId: string,
  question: string,
  answer: string
): Promise<void> {
  try {
    const profile = await db
      .prepare(`SELECT candidate_json FROM profiles WHERE user_id = ?`)
      .bind(userId)
      .first<{ candidate_json: string }>();

    const candidate = profile ? JSON.parse(profile.candidate_json) : {};
    const signals = await ai.extractProfileSignals(`Pergunta: ${question}\nResposta: ${answer}`);

    const mergedCandidate = {
      interests: [...new Set([...(candidate.interests ?? []), ...signals.interests])],
      hobbies: [...new Set([...(candidate.hobbies ?? []), ...signals.hobbies])],
      technicalInterests: [
        ...new Set([...(candidate.technicalInterests ?? []), ...signals.technicalInterests]),
      ],
    };

    await db
      .prepare(`UPDATE profiles SET candidate_json = ?, updated_at = datetime('now') WHERE user_id = ?`)
      .bind(JSON.stringify(mergedCandidate), userId)
      .run();
  } catch {
    // Falha na extração de sinais nunca deve afetar a experiência da pessoa.
  }
}

onboardingRoute.post("/answer", zValidator("json", onboardingAnswerSchema), async (c) => {
  const userId = c.get("userId");
  const { step, answer } = c.req.valid("json");
  const isLastStep = step >= ONBOARDING_STEPS.length - 1;

  await c.env.DB.prepare(
    `UPDATE profiles SET
       onboarding_step = ?,
       onboarding_done = ?,
       display_name = CASE WHEN ? = 0 THEN ? ELSE display_name END,
       updated_at = datetime('now')
     WHERE user_id = ?`
  )
    .bind(step + 1, isLastStep ? 1 : 0, step, answer, userId)
    .run();

  const ai = new WorkersAIProvider(c.env.AI);
  c.executionCtx.waitUntil(
    extractAndMergeSignalsInBackground(c.env.DB, ai, userId, ONBOARDING_STEPS[step] ?? "", answer)
  );

  return c.json({
    nextStep: isLastStep ? null : step + 1,
    nextQuestion: isLastStep ? null : ONBOARDING_STEPS[step + 1],
    done: isLastStep,
  });
});