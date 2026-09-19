import type { AIProvider } from "../ai/AIProvider";
import { buildContext } from "./buildContext";
import { buildPrompt } from "./buildPrompt";
import { qualityCheck } from "./qualityCheck";
import { selectStrategy } from "./selectStrategy";
import type { EngineContext, EngineResult } from "./types";

interface RunEngineDeps {
  db: D1Database;
  ai: AIProvider;
}

const FALLBACK_QUESTIONS: Record<string, string> = {
  default: "O que é que, dentro disto, ainda não faz sentido para ti?",
};

async function generateOnce(ai: AIProvider, context: EngineContext) {
  const strategy = selectStrategy(context);
  const prompt = buildPrompt(context, strategy);
  const result = await ai.generateQuestion(prompt);
  return { strategy, text: result.text };
}

/**
 * Ponto de entrada único do Curiosity Engine: dado um utilizador e uma
 * exploração, decide e gera a próxima pergunta. Faz no máximo 1 retry se a
 * primeira geração falhar no quality check; depois cai para uma pergunta de
 * fallback genérica (nunca deixa a exploração sem resposta).
 */
export async function runCuriosityEngine(
  deps: RunEngineDeps,
  userId: string,
  explorationId: string,
  options: { isSpontaneousIdea?: boolean } = {}
): Promise<EngineResult> {
  const context = await buildContext(
    { db: deps.db },
    userId,
    explorationId,
    options.isSpontaneousIdea ?? false
  );

  const first = await generateOnce(deps.ai, context);
  const firstCheck = qualityCheck(first.text, context);

  if (firstCheck.passed) {
    return { question: first.text, strategyUsed: first.strategy, qualityFlags: firstCheck.flags };
  }

  // Retry único — mesma estratégia, o modelo tenta de novo (a aleatoriedade da
  // temperatura costuma bastar para sair de uma repetição pontual).
  const retry = await generateOnce(deps.ai, context);
  const retryCheck = qualityCheck(retry.text, context);

  if (retryCheck.passed) {
    return { question: retry.text, strategyUsed: retry.strategy, qualityFlags: retryCheck.flags };
  }

  return {
    question: FALLBACK_QUESTIONS.default,
    strategyUsed: retry.strategy,
    qualityFlags: [...retryCheck.flags, "fallback usado após 2 tentativas"],
  };
}
