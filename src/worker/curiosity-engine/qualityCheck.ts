import type { EngineContext, MomentType } from "./types";

const MIN_LENGTH = 8;
const MAX_LENGTH: Record<MomentType, number> = {
  question: 260,
  reflection: 200,
  insight: 320,
  simulation: 320,
  experiment: 300,
};

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  for (const w of wordsA) if (wordsB.has(w)) shared++;
  return shared / Math.min(wordsA.size, wordsB.size);
}

export interface QualityResult {
  passed: boolean;
  flags: string[];
}

export function qualityCheck(
  candidate: string,
  context: EngineContext,
  momentType: MomentType = "question"
): QualityResult {
  const flags: string[] = [];
  const trimmed = candidate.trim();
  const maxLength = MAX_LENGTH[momentType];

  if (trimmed.length < MIN_LENGTH) flags.push("demasiado curta");
  if (trimmed.length > maxLength) flags.push("demasiado longa para este tipo de turno");

  const priorTurns = context.activeThread.filter((m) => m.role === "question");
  for (const prior of priorTurns) {
    if (wordOverlap(trimmed, prior.content) > 0.7) {
      flags.push("possível repetição de um turno anterior");
      break;
    }
  }

  if (momentType === "question") {
    const beforeQuestionMark = trimmed.split("?")[0] ?? trimmed;
    const declarativeSentences = beforeQuestionMark.split(/[.!]/).filter((s) => s.trim().length > 15);
    if (declarativeSentences.length > 2) flags.push("pode estar a entregar a resposta em vez de perguntar");
  }

  const passed =
    trimmed.length >= MIN_LENGTH &&
    trimmed.length <= maxLength &&
    !flags.includes("possível repetição de um turno anterior") &&
    !flags.includes("pode estar a entregar a resposta em vez de perguntar");

  return { passed, flags };
}