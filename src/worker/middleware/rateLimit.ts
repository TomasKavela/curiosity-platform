import type { Context, Next } from "hono";
import type { AuthedVariables } from "./auth";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 20; // chamadas que tocam IA, por utilizador, por minuto

/**
 * Limita chamadas caras (as que geram perguntas via IA) por utilizador.
 * Usa KV com TTL — não precisa de exatidão perfeita, só de proteger custo.
 */
export async function aiRateLimit(
  c: Context<{ Bindings: Env; Variables: AuthedVariables }>,
  next: Next
) {
  const userId = c.get("userId");
  const key = `ratelimit:ai:${userId}`;

  const current = await c.env.SESSIONS_KV.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return c.json({ error: "rate_limited", retryAfterSeconds: WINDOW_SECONDS }, 429);
  }

  await c.env.SESSIONS_KV.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
  await next();
}
