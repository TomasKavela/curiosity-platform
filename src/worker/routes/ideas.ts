import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthedVariables } from "../middleware/auth";
import { aiRateLimit } from "../middleware/rateLimit";
import { WorkersAIProvider } from "../ai/WorkersAIProvider";
import { runCuriosityEngine } from "../curiosity-engine";
import { postIdeaSchema } from "../schemas";

export const ideasRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

// "Tive uma ideia" cria sempre uma nova exploração (origin: spontaneous),
// opcionalmente referenciando a exploração que estava ativa — ver Fase 1, §2.5.
ideasRoute.post("/", zValidator("json", postIdeaSchema), aiRateLimit, async (c) => {
  const userId = c.get("userId");
  const { content, fromExplorationId } = c.req.valid("json");

  const explorationId = crypto.randomUUID();
  const title = content.slice(0, 80);

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO explorations (id, user_id, parent_exploration_id, title, origin) VALUES (?, ?, ?, ?, 'spontaneous')`
    ).bind(explorationId, userId, fromExplorationId ?? null, title),
    c.env.DB.prepare(
      `INSERT INTO exploration_messages (id, exploration_id, role, content) VALUES (?, ?, 'idea', ?)`
    ).bind(crypto.randomUUID(), explorationId, content),
  ]);

  const ai = new WorkersAIProvider(c.env.AI);
  const result = await runCuriosityEngine({ db: c.env.DB, ai }, userId, explorationId, {
    isSpontaneousIdea: true,
  });

  await c.env.DB.prepare(
    `INSERT INTO exploration_messages (id, exploration_id, role, strategy, content) VALUES (?, ?, 'question', ?, ?)`
  )
    .bind(crypto.randomUUID(), explorationId, result.strategyUsed, result.question)
    .run();

  return c.json({ explorationId, question: result.question }, 201);
});
