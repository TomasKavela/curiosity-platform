import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthedVariables } from "../middleware/auth";
import { aiRateLimit } from "../middleware/rateLimit";
import { WorkersAIProvider } from "../ai/WorkersAIProvider";
import { runCuriosityEngine } from "../curiosity-engine";
import { createExplorationSchema, postMessageSchema } from "../schemas";

export const explorationsRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

explorationsRoute.get("/", async (c) => {
  const userId = c.get("userId");
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, type, origin, status, created_at, updated_at
     FROM explorations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`
  )
    .bind(userId)
    .all();
  return c.json({ explorations: results ?? [] });
});

explorationsRoute.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const exploration = await c.env.DB.prepare(
    `SELECT * FROM explorations WHERE id = ? AND user_id = ?`
  )
    .bind(id, userId)
    .first();

  if (!exploration) return c.json({ error: "not_found" }, 404);

  const { results: messages } = await c.env.DB.prepare(
    `SELECT role, strategy, content, created_at FROM exploration_messages
     WHERE exploration_id = ? ORDER BY created_at ASC`
  )
    .bind(id)
    .all();

  return c.json({ exploration, messages: messages ?? [] });
});

explorationsRoute.post("/", zValidator("json", createExplorationSchema), aiRateLimit, async (c) => {
  const userId = c.get("userId");
  const { firstMessage, origin } = c.req.valid("json");

  const explorationId = crypto.randomUUID();
  const title = firstMessage.slice(0, 80);

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO explorations (id, user_id, title, origin) VALUES (?, ?, ?, ?)`
    ).bind(explorationId, userId, title, origin),
    c.env.DB.prepare(
      `INSERT INTO exploration_messages (id, exploration_id, role, content) VALUES (?, ?, 'answer', ?)`
    ).bind(crypto.randomUUID(), explorationId, firstMessage),
  ]);

  const ai = new WorkersAIProvider(c.env.AI);
  const result = await runCuriosityEngine({ db: c.env.DB, ai }, userId, explorationId, {
    isSpontaneousIdea: origin === "spontaneous",
  });

  await c.env.DB.prepare(
    `INSERT INTO exploration_messages (id, exploration_id, role, strategy, content) VALUES (?, ?, 'question', ?, ?)`
  )
    .bind(crypto.randomUUID(), explorationId, result.strategyUsed, result.question)
    .run();

  return c.json({ explorationId, question: result.question, strategyUsed: result.strategyUsed }, 201);
});

explorationsRoute.post(
  "/:id/messages",
  zValidator("json", postMessageSchema),
  aiRateLimit,
  async (c) => {
    const userId = c.get("userId");
    const explorationId = c.req.param("id");
    const { content } = c.req.valid("json");

    const owned = await c.env.DB.prepare(
      `SELECT id FROM explorations WHERE id = ? AND user_id = ?`
    )
      .bind(explorationId, userId)
      .first();

    if (!owned) return c.json({ error: "not_found" }, 404);

    await c.env.DB.prepare(
      `INSERT INTO exploration_messages (id, exploration_id, role, content) VALUES (?, ?, 'answer', ?)`
    )
      .bind(crypto.randomUUID(), explorationId, content)
      .run();

    const ai = new WorkersAIProvider(c.env.AI);
    const result = await runCuriosityEngine({ db: c.env.DB, ai }, userId, explorationId);

    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO exploration_messages (id, exploration_id, role, strategy, content) VALUES (?, ?, 'question', ?, ?)`
      ).bind(crypto.randomUUID(), explorationId, result.strategyUsed, result.question),
      c.env.DB.prepare(`UPDATE explorations SET updated_at = datetime('now') WHERE id = ?`).bind(
        explorationId
      ),
    ]);

    return c.json({ question: result.question, strategyUsed: result.strategyUsed });
  }
);
