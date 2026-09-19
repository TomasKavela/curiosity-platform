export type Strategy =
  | "PROBE_DEEPER"
  | "CONNECT"
  | "CHALLENGE"
  | "SUGGEST_EXPERIMENT"
  | "SIMPLIFY"
  | "ACKNOWLEDGE_IDEA";

export interface ProfileSnapshot {
  displayName: string | null;
  fieldOfStudy: string | null;
  interests: string[];
  hobbies: string[];
  technicalInterests: string[];
}

export interface ThreadMessage {
  role: "question" | "answer" | "idea" | "system_note";
  content: string;
}

export interface RelevantMemory {
  summary: string;
  tags: string[];
}

export interface EngineContext {
  profile: ProfileSnapshot;
  activeThread: ThreadMessage[]; // últimas N mensagens da exploração atual
  relevantMemories: RelevantMemory[];
  isSpontaneousIdea: boolean;
}

export interface EngineResult {
  question: string;
  strategyUsed: Strategy;
  qualityFlags: string[]; // avisos não-bloqueantes (ex.: "possível repetição")
}
