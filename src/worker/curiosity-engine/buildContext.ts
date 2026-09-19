import type { EngineContext, ProfileSnapshot, RelevantMemory, ThreadMessage } from "./types";

const ACTIVE_THREAD_WINDOW = 12; // últimas N mensagens enviadas ao modelo sem sumarização
const MAX_RELEVANT_MEMORIES = 5;

interface BuildContextDeps {
  db: D1Database;
}

/**
 * Recolhe tudo o que o Curiosity Engine precisa para decidir a próxima pergunta:
 * perfil confirmado, a conversa em curso, e memórias antigas relacionadas por tag.
 *
 * Deliberadamente NÃO faz busca vetorial (ver ARCHITECTURE.md — Vectorize fica
 * fora do MVP). A relação é por sobreposição simples de tags com os interesses
 * do perfil e com o conteúdo textual da thread ativa.
 */
export async function buildContext(
  deps: BuildContextDeps,
  userId: string,
  explorationId: string,
  isSpontaneousIdea: boolean
): Promise<EngineContext> {
  const { db } = deps;

  const profileRow = await db
    .prepare(
      `SELECT display_name, field_of_study, confirmed_json FROM profiles WHERE user_id = ?`
    )
    .bind(userId)
    .first<{ display_name: string | null; field_of_study: string | null; confirmed_json: string }>();

  const confirmed = profileRow
    ? (JSON.parse(profileRow.confirmed_json) as {
        interests?: string[];
        hobbies?: string[];
        technicalInterests?: string[];
      })
    : {};

  const profile: ProfileSnapshot = {
    displayName: profileRow?.display_name ?? null,
    fieldOfStudy: profileRow?.field_of_study ?? null,
    interests: confirmed.interests ?? [],
    hobbies: confirmed.hobbies ?? [],
    technicalInterests: confirmed.technicalInterests ?? [],
  };

  const threadRows = await db
    .prepare(
      `SELECT role, content FROM exploration_messages
       WHERE exploration_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(explorationId, ACTIVE_THREAD_WINDOW)
    .all<{ role: ThreadMessage["role"]; content: string }>();

  const activeThread = (threadRows.results ?? []).reverse();

  const candidateTags = [
    ...profile.interests,
    ...profile.hobbies,
    ...profile.technicalInterests,
  ];

  let relevantMemories: RelevantMemory[] = [];
  if (candidateTags.length > 0) {
    // LIKE simples por tag — suficiente para o volume esperado no MVP (ver decisão em DECISIONS.md).
    const likeClauses = candidateTags.map(() => `tags_json LIKE ?`).join(" OR ");
    const likeParams = candidateTags.map((t) => `%${t}%`);

    const memoryRows = await db
      .prepare(
        `SELECT summary, tags_json FROM memories
         WHERE user_id = ? AND (${likeClauses})
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .bind(userId, ...likeParams, MAX_RELEVANT_MEMORIES)
      .all<{ summary: string; tags_json: string }>();

    relevantMemories = (memoryRows.results ?? []).map((row) => ({
      summary: row.summary,
      tags: JSON.parse(row.tags_json) as string[],
    }));
  }

  return { profile, activeThread, relevantMemories, isSpontaneousIdea };
}
