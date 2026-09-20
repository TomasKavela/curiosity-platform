import type { Depth, EngineContext, ProfileSnapshot, RelevantMemory, ThreadMessage } from "./types";

const ACTIVE_THREAD_WINDOW = 12;
const MAX_RELEVANT_MEMORIES = 5;

interface BuildContextDeps {
  db: D1Database;
}

export async function buildContext(
  deps: BuildContextDeps,
  userId: string,
  explorationId: string,
  isSpontaneousIdea: boolean,
  depth: Depth = "explorar"
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
      `SELECT role, strategy, content FROM exploration_messages
       WHERE exploration_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(explorationId, ACTIVE_THREAD_WINDOW)
    .all<{ role: ThreadMessage["role"]; strategy: string | null; content: string }>();

  const activeThread = (threadRows.results ?? []).reverse();

  const candidateTags = [
    ...profile.interests,
    ...profile.hobbies,
    ...profile.technicalInterests,
  ];

  let relevantMemories: RelevantMemory[] = [];
  if (candidateTags.length > 0) {
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

  return { profile, activeThread, relevantMemories, isSpontaneousIdea, depth };
}