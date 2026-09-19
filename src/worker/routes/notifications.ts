import { Hono } from "hono";
import type { AuthedVariables } from "../middleware/auth";

export const notificationsRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

notificationsRoute.get("/", async (c) => {
  const userId = c.get("userId");
  const { results } = await c.env.DB.prepare(
    `SELECT id, content, related_exploration_id, read, created_at FROM notifications
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
  )
    .bind(userId)
    .all();
  return c.json({ notifications: results ?? [] });
});

notificationsRoute.patch("/:id/read", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  await c.env.DB.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .run();
  return c.json({ ok: true });
});
