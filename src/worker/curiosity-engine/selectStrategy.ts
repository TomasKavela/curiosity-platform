import type { EngineContext, MomentType, Strategy } from "./types";

const VAGUE_ANSWERS = ["não sei", "nao sei", "sei lá", "não faço ideia", "talvez", "sla"];

export const STRATEGY_MOMENT_TYPE: Record<Strategy, MomentType> = {
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

function isVague(answer: string): boolean {
  const normalized = answer.trim().toLowerCase();
  return normalized.length < 4 || VAGUE_ANSWERS.some((v) => normalized.includes(v));
}

function mentionsAnyTechnicalInterest(text: string, technicalInterests: string[]): boolean {
  const stem = (word: string) => word.slice(0, Math.max(4, word.length - 3));
  return technicalInterests.some((t) => {
    const interestStem = stem(t.toLowerCase());
    return text.split(/\W+/).some((word) => word.startsWith(interestStem));
  });
}

function lastAiMomentType(context: EngineContext): MomentType | null {
  const lastAiTurn = [...context.activeThread].reverse().find((m) => m.role === "question");
  if (!lastAiTurn?.strategy) return null;
  return STRATEGY_MOMENT_TYPE[lastAiTurn.strategy as Strategy] ?? "question";
}

export function selectStrategy(context: EngineContext): Strategy {
  if (context.isSpontaneousIdea) {
    return "ACKNOWLEDGE_IDEA";
  }

  const lastAnswer = [...context.activeThread].reverse().find((m) => m.role === "answer");

  if (!lastAnswer) {
    return "PROBE_DEEPER";
  }

  if (isVague(lastAnswer.content)) {
    return "SIMPLIFY";
  }

  const lastMoment = lastAiMomentType(context);
  const normalized = lastAnswer.content.trim().toLowerCase();
  const isRich = normalized.length > 80;
  const mentionsTechnicalInterest = mentionsAnyTechnicalInterest(
    normalized,
    context.profile.technicalInterests
  );

  if (lastMoment === "question" || lastMoment === null) {
    if (context.depth === "criar") return "SUGGEST_EXPERIMENT";
    if (context.depth === "investigar") return "PROPOSE_SIMULATION";
    if (isRich && mentionsTechnicalInterest) return "SHARE_INSIGHT";
    if (isRich) return "PROPOSE_SIMULATION";
    return "INVITE_REFLECTION";
  }

  if (isRich && mentionsTechnicalInterest) {
    return context.relevantMemories.length > 0 ? "CONNECT" : "CHALLENGE";
  }
  return "PROBE_DEEPER";
}