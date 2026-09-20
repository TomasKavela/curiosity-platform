export type Strategy =
  | "PROBE_DEEPER"
  | "CONNECT"
  | "CHALLENGE"
  | "SUGGEST_EXPERIMENT"
  | "SIMPLIFY"
  | "ACKNOWLEDGE_IDEA"
  | "SHARE_INSIGHT"
  | "PROPOSE_SIMULATION"
  | "INVITE_REFLECTION";

export type MomentType = "question" | "insight" | "simulation" | "reflection" | "experiment";

export type Depth = "explorar" | "aprofundar" | "investigar" | "criar";

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
  strategy?: string | null;
}

export interface RelevantMemory {
  summary: string;
  tags: string[];
}

export interface EngineContext {
  profile: ProfileSnapshot;
  activeThread: ThreadMessage[];
  relevantMemories: RelevantMemory[];
  isSpontaneousIdea: boolean;
  depth: Depth;
}

export interface EngineResult {
  question: string;
  strategyUsed: Strategy;
  momentType: MomentType;
  qualityFlags: string[];
}