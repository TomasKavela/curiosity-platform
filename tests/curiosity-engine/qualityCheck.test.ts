import { describe, expect, it } from "vitest";
import { qualityCheck } from "../../src/worker/curiosity-engine/qualityCheck";
import type { EngineContext } from "../../src/worker/curiosity-engine/types";

function baseContext(overrides: Partial<EngineContext> = {}): EngineContext {
  return {
    profile: { displayName: null, fieldOfStudy: null, interests: [], hobbies: [], technicalInterests: [] },
    activeThread: [],
    relevantMemories: [],
    isSpontaneousIdea: false,
    ...overrides,
  };
}

describe("qualityCheck", () => {
  it("aceita uma pergunta curta e clara", () => {
    const result = qualityCheck("O que mais gostas nisso?", baseContext());
    expect(result.passed).toBe(true);
  });

  it("rejeita uma pergunta vazia ou demasiado curta", () => {
    const result = qualityCheck("Ok?", baseContext());
    expect(result.passed).toBe(false);
  });

  it("rejeita texto longo demais (parece explicação, não pergunta)", () => {
    const long = "Isto acontece porque ".repeat(30) + "e por isso, o que achas?";
    const result = qualityCheck(long, baseContext());
    expect(result.passed).toBe(false);
    expect(result.flags).toContain("demasiado longa — parece explicação, não pergunta");
  });

  it("sinaliza e rejeita repetição de uma pergunta já feita na exploração", () => {
    const ctx = baseContext({
      activeThread: [{ role: "question", content: "O que estás realmente a tentar otimizar?" }],
    });
    const result = qualityCheck("O que estás realmente a tentar otimizar?", ctx);
    expect(result.passed).toBe(false);
    expect(result.flags).toContain("possível repetição de pergunta anterior");
  });

  it("não rejeita perguntas diferentes mesmo que partilhem algumas palavras", () => {
    const ctx = baseContext({
      activeThread: [{ role: "question", content: "O que estás a tentar otimizar?" }],
    });
    const result = qualityCheck("Quem decidiu que essa é a melhor abordagem?", ctx);
    expect(result.passed).toBe(true);
  });
});
