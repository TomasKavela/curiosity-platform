import type { EngineContext } from "./types";

const MAX_QUESTION_LENGTH = 260; // caracteres — queremos pergunta, não explicação
const MIN_QUESTION_LENGTH = 8;

/** Similaridade grosseira por sobreposição de palavras — suficiente para detetar repetição óbvia. */
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

export function qualityCheck(candidate: string, context: EngineContext): QualityResult {
  const flags: string[] = [];
  const trimmed = candidate.trim();

  if (trimmed.length < MIN_QUESTION_LENGTH) flags.push("demasiado curta");
  if (trimmed.length > MAX_QUESTION_LENGTH) flags.push("demasiado longa — parece explicação, não pergunta");

  const priorQuestions = context.activeThread.filter((m) => m.role === "question");
  for (const prior of priorQuestions) {
    if (wordOverlap(trimmed, prior.content) > 0.7) {
      flags.push("possível repetição de pergunta anterior");
      break;
    }
  }

  // Heurística de "entrega a resposta": muitas frases declarativas antes do "?"
  // costuma indicar que o modelo explicou em vez de perguntar.
  const beforeQuestionMark = trimmed.split("?")[0] ?? trimmed;
  const declarativeSentences = beforeQuestionMark.split(/[.!]/).filter((s) => s.trim().length > 15);
  if (declarativeSentences.length > 2) flags.push("pode estar a entregar a resposta em vez de perguntar");

  const passed =
    trimmed.length >= MIN_QUESTION_LENGTH &&
    trimmed.length <= MAX_QUESTION_LENGTH &&
    !flags.includes("possível repetição de pergunta anterior");

  return { passed, flags };
}
