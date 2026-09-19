import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const SESSION_COOKIE = "cp_session";
const SESSION_TTL_DAYS = 365;

export interface AuthedVariables {
  userId: string;
}

/**
 * Garante uma sessão anónima válida em cada request. Se não existir cookie,
 * cria um novo utilizador (device-bound). Não há password no MVP — ver
 * DECISIONS.md secção "Autenticação".
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: AuthedVariables }>, next: Next) {
  let token = getCookie(c, SESSION_COOKIE);

  if (!token) {
    token = crypto.randomUUID();
    setCookie(c, SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
      path: "/",
    });
  }

  const existing = await c.env.DB.prepare(`SELECT id FROM users WHERE device_token = ?`)
    .bind(token)
    .first<{ id: string }>();

  let userId: string;

  if (existing) {
    userId = existing.id;
    await c.env.DB.prepare(`UPDATE users SET last_seen_at = datetime('now') WHERE id = ?`)
      .bind(userId)
      .run();
  } else {
    userId = crypto.randomUUID();
    await c.env.DB.batch([
      c.env.DB.prepare(`INSERT INTO users (id, device_token) VALUES (?, ?)`).bind(userId, token),
      c.env.DB.prepare(`INSERT INTO profiles (user_id) VALUES (?)`).bind(userId),
    ]);
  }

  c.set("userId", userId);
  await next();
}
