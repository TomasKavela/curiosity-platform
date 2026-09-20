export type MomentType = "question" | "insight" | "simulation" | "reflection" | "experiment";

const STRATEGY_MOMENT_TYPE: Record<string, MomentType> = {
  PROBE_DEEPER: "question",
  CONNECT: "question",
  CHALLENGE: "question",
  SIMPLIFY: "question",
  ACKNOWLEDGE_IDEA: "question",
  SUGGEST_EXPERIMENT: "experiment",
  SHARE_INSIGHT: "insight",
  PROPOSE_SIMULATION: "simulation",
  INVITE_REFLECTION: "reflection",
};

export function momentTypeFor(strategy: string | null | undefined): MomentType {
  if (!strategy) return "question";
  return STRATEGY_MOMENT_TYPE[strategy] ?? "question";
}

export const MOMENT_LABEL: Record<MomentType, string> = {
  question: "",
  insight: "descoberta",
  simulation: "e se...",
  reflection: "pausa",
  experiment: "experimenta",
};