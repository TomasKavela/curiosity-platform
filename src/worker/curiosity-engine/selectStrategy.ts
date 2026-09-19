import type { EngineContext, Strategy } from "./types";

const VAGUE_ANSWERS = ["não sei", "nao sei", "sei lá", "não faço ideia", "talvez", "sla"];

/**
 * Escolhe a estratégia da próxima interação por regras explícitas, não por um
 * classificador de ML separado (ver ARCHITECTURE.md — overengineering evitado
 * de propósito no MVP). O próprio LLM ainda tem liberdade dentro da estratégia
 * escolhida; isto só define a "intenção" que orienta o prompt.
 */
export function selectStrategy(context: EngineContext): Strategy {
  if (context.isSpontaneousIdea) {
    return "ACKNOWLEDGE_IDEA";
  }

  const lastAnswer = [...context.activeThread].reverse().find((m) => m.role === "answer");

  if (!lastAnswer) {
    // Primeira pergunta da exploração — sempre parte do perfil, nunca genérica.
    return "PROBE_DEEPER";
  }

  const normalized = lastAnswer.content.trim().toLowerCase();

  if (normalized.length < 4 || VAGUE_ANSWERS.some((v) => normalized.includes(v))) {
    return "SIMPLIFY";
  }

  // Resposta rica (heurística simples: comprimento + presença de termos técnicos
  // do perfil) tende a render mais em CONNECT ou CHALLENGE do que em PROBE_DEEPER.
  const isRich = normalized.length > 80;
  // Correspondência por raiz da palavra (não substring exata), para apanhar
  // "otimizar" quando o interesse guardado é "otimização", por exemplo.
  const stem = (word: string) => word.slice(0, Math.max(4, word.length - 3));
  const mentionsTechnicalInterest = context.profile.technicalInterests.some((t) => {
    const interestStem = stem(t.toLowerCase());
    return normalized.split(/\W+/).some((word) => word.startsWith(interestStem));
  });

  if (isRich && mentionsTechnicalInterest) {
    return context.relevantMemories.length > 0 ? "CONNECT" : "CHALLENGE";
  }

  if (isRich) {
    return "SUGGEST_EXPERIMENT";
  }

  return "PROBE_DEEPER";
}
