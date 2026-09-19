import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthedVariables } from "../middleware/auth";
import { patchProfileSchema } from "../schemas";

export const profileRoute = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

profileRoute.get("/", async (c) => {
  const userId = c.get("userId");
  const row = await c.env.DB.prepare(`SELECT * FROM profiles WHERE user_id = ?`)
    .bind(userId)
    .first();
  if (!row) return c.json({ error: "not_found" }, 404);

  return c.json({
    displayName: row.display_name,
    userType: row.user_type,
    fieldOfStudy: row.field_of_study,
    confirmed: JSON.parse(row.confirmed_json as string),
    candidate: JSON.parse(row.candidate_json as string),
    onboardingStep: row.onboarding_step,
    onboardingDone: Boolean(row.onboarding_done),
  });
});

profileRoute.patch("/", zValidator("json", patchProfileSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const current = await c.env.DB.prepare(`SELECT confirmed_json FROM profiles WHERE user_id = ?`)
    .bind(userId)
    .first<{ confirmed_json: string }>();

  const currentConfirmed = current ? JSON.parse(current.confirmed_json) : {};
  const mergedConfirmed = { ...currentConfirmed, ...(body.confirmed ?? {}) };

  await c.env.DB.prepare(
    `UPDATE profiles SET
       display_name = COALESCE(?, display_name),
       field_of_study = COALESCE(?, field_of_study),
       confirmed_json = ?,
       updated_at = datetime('now')
     WHERE user_id = ?`
  )
    .bind(body.displayName ?? null, body.fieldOfStudy ?? null, JSON.stringify(mergedConfirmed), userId)
    .run();

  return c.json({ ok: true });
});
