import { Hono } from "hono";
import type { AuthedVariables } from "../middleware/auth";

export const memoriesRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

memoriesRoute.get("/", async (c) => {
  const userId = c.get("userId");
  const { results } = await c.env.DB.prepare(
    `SELECT id, summary, tags_json, exploration_id, created_at FROM memories
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
  )
    .bind(userId)
    .all();

  return c.json({
    memories: (results ?? []).map((r) => ({ ...r, tags: JSON.parse(r.tags_json as string) })),
  });
});
