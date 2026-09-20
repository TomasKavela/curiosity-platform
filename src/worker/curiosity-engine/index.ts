import type { AIProvider } from "../ai/AIProvider";
import { buildContext } from "./buildContext";
import { buildPrompt } from "./buildPrompt";
import { qualityCheck } from "./qualityCheck";
import { selectStrategy, STRATEGY_MOMENT_TYPE } from "./selectStrategy";
import type { Depth, EngineContext, EngineResult } from "./types";

interface RunEngineDeps {
  db: D1Database;
  ai: AIProvider;
}

const FALLBACK_TEXT = "O que é que, dentro disto, ainda não faz sentido para ti?";

async function generateOnce(ai: AIProvider, context: EngineContext) {
  const strategy = selectStrategy(context);
  const prompt = buildPrompt(context, strategy);
  const result = await ai.generateQuestion(prompt);
  return { strategy, text: result.text, momentType: STRATEGY_MOMENT_TYPE[strategy] };
}

export async function runCuriosityEngine(
  deps: RunEngineDeps,
  userId: string,
  explorationId: string,
  options: { isSpontaneousIdea?: boolean; depth?: Depth } = {}
): Promise<EngineResult> {
  const context = await buildContext(
    { db: deps.db },
    userId,
    explorationId,
    options.isSpontaneousIdea ?? false,
    options.depth ?? "explorar"
  );

  const first = await generateOnce(deps.ai, context);
  const firstCheck = qualityCheck(first.text, context, first.momentType);

  if (firstCheck.passed) {
    return {
      question: first.text,
      strategyUsed: first.strategy,
      momentType: first.momentType,
      qualityFlags: firstCheck.flags,
    };
  }

  const retry = await generateOnce(deps.ai, context);
  const retryCheck = qualityCheck(retry.text, context, retry.momentType);

  if (retryCheck.passed) {
    return {
      question: retry.text,
      strategyUsed: retry.strategy,
      momentType: retry.momentType,
      qualityFlags: retryCheck.flags,
    };
  }

  return {
    question: FALLBACK_TEXT,
    strategyUsed: retry.strategy,
    momentType: "question",
    qualityFlags: [...retryCheck.flags, "fallback usado após 2 tentativas"],
  };
}