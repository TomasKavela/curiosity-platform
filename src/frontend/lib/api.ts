const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type Depth = "explorar" | "aprofundar" | "investigar" | "criar";

export interface ExplorationSummaryItem {
  id: string;
  title: string;
  type: "exploration" | "project";
  origin: "guided" | "spontaneous";
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ExplorationMessage {
  role: "question" | "answer" | "idea" | "system_note";
  strategy?: string | null;
  content: string;
  created_at: string;
}

export interface Profile {
  displayName: string | null;
  userType: string | null;
  fieldOfStudy: string | null;
  confirmed: { interests?: string[]; hobbies?: string[]; technicalInterests?: string[] };
  candidate: { interests?: string[]; hobbies?: string[]; technicalInterests?: string[] };
  onboardingStep: number;
  onboardingDone: boolean;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  onboarding: {
    steps: () => request<{ steps: string[] }>("/onboarding/steps"),
    answer: (step: number, answer: string) =>
      request<{
        nextStep: number | null;
        nextQuestion: string | null;
        done: boolean;
      }>("/onboarding/answer", { method: "POST", body: JSON.stringify({ step, answer }) }),
  },

  profile: {
    get: () => request<Profile>("/profile"),
    patch: (body: Partial<Pick<Profile, "displayName" | "fieldOfStudy">> & { confirmed?: Profile["confirmed"] }) =>
      request<{ ok: true }>("/profile", { method: "PATCH", body: JSON.stringify(body) }),
  },

  explorations: {
    list: () => request<{ explorations: ExplorationSummaryItem[] }>("/explorations"),
    get: (id: string) =>
      request<{ exploration: ExplorationSummaryItem; messages: ExplorationMessage[] }>(
        `/explorations/${id}`
      ),
    create: (firstMessage: string, origin: "guided" | "spontaneous" = "guided", depth: Depth = "explorar") =>
      request<{ explorationId: string; question: string; strategyUsed: string; momentType: string }>(
        "/explorations",
        { method: "POST", body: JSON.stringify({ firstMessage, origin, depth }) }
      ),
    sendMessage: (id: string, content: string, depth: Depth = "explorar") =>
      request<{ question: string; strategyUsed: string; momentType: string }>(
        `/explorations/${id}/messages`,
        { method: "POST", body: JSON.stringify({ content, depth }) }
      ),
  },

  ideas: {
    create: (content: string, fromExplorationId?: string) =>
      request<{ explorationId: string; question: string }>("/ideas", {
        method: "POST",
        body: JSON.stringify({ content, fromExplorationId }),
      }),
  },

  memories: {
    list: () =>
      request<{ memories: Array<{ id: string; summary: string; tags: string[]; created_at: string }> }>(
        "/memories"
      ),
  },

  notifications: {
    list: () =>
      request<{
        notifications: Array<{ id: string; content: string; read: number; created_at: string }>;
      }>("/notifications"),
    markRead: (id: string) => request<{ ok: true }>(`/notifications/${id}/read`, { method: "PATCH" }),
  },
};