import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthedVariables } from "../middleware/auth";
import { WorkersAIProvider } from "../ai/WorkersAIProvider";
import { onboardingAnswerSchema } from "../schemas";

export const onboardingRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

// Perguntas fixas do onboarding conversacional (Secção 4 do briefing).
// A última pergunta ("o que gostas nisso?") repete-se adaptativamente — por
// isso o array tem um número de passos fixo, mas o texto de cada passo é
// montado no frontend a partir da resposta anterior quando fizer sentido.
const ONBOARDING_STEPS = [
  "Como preferes que te trate?",
  "O que estudas ou fazes?",
  "Dentro disso, o que mais gostas?",
  "E fora disso — que hobby ou interesse genuinamente te ocupa o tempo livre?",
  "O que exatamente gostas nisso?",
] as const;

onboardingRoute.get("/steps", (c) => c.json({ steps: ONBOARDING_STEPS }));

onboardingRoute.post("/answer", zValidator("json", onboardingAnswerSchema), async (c) => {
  const userId = c.get("userId");
  const { step, answer } = c.req.valid("json");

  const profile = await c.env.DB.prepare(
    `SELECT candidate_json FROM profiles WHERE user_id = ?`
  )
    .bind(userId)
    .first<{ candidate_json: string }>();

  const candidate = profile ? JSON.parse(profile.candidate_json) : {};

  // Extração de sinais é assíncrona-lógica mas aguardada aqui (MVP simples) —
  // podemos mover para fila/waitUntil mais tarde se a latência incomodar.
  const ai = new WorkersAIProvider(c.env.AI);
  const signals = await ai.extractProfileSignals(`Pergunta: ${ONBOARDING_STEPS[step] ?? ""}\nResposta: ${answer}`);

  const mergedCandidate = {
    interests: [...new Set([...(candidate.interests ?? []), ...signals.interests])],
    hobbies: [...new Set([...(candidate.hobbies ?? []), ...signals.hobbies])],
    technicalInterests: [
      ...new Set([...(candidate.technicalInterests ?? []), ...signals.technicalInterests]),
    ],
  };

  const isLastStep = step >= ONBOARDING_STEPS.length - 1;

  await c.env.DB.prepare(
    `UPDATE profiles SET
       candidate_json = ?,
       onboarding_step = ?,
       onboarding_done = ?,
       display_name = CASE WHEN ? = 0 THEN ? ELSE display_name END,
       updated_at = datetime('now')
     WHERE user_id = ?`
  )
    .bind(
      JSON.stringify(mergedCandidate),
      step + 1,
      isLastStep ? 1 : 0,
      step,
      answer,
      userId
    )
    .run();

  return c.json({
    nextStep: isLastStep ? null : step + 1,
    nextQuestion: isLastStep ? null : ONBOARDING_STEPS[step + 1],
    done: isLastStep,
    candidateProfile: mergedCandidate,
  });
});
