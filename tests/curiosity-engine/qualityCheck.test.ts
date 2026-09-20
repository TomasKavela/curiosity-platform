import { describe, expect, it } from "vitest";
import { qualityCheck } from "../../src/worker/curiosity-engine/qualityCheck";
import type { EngineContext } from "../../src/worker/curiosity-engine/types";

function baseContext(overrides: Partial<EngineContext> = {}): EngineContext {
  return {
    profile: { displayName: null, fieldOfStudy: null, interests: [], hobbies: [], technicalInterests: [] },
    activeThread: [],
    relevantMemories: [],
    isSpontaneousIdea: false,
    depth: "explorar",
    ...overrides,
  };
}

describe("qualityCheck", () => {
  it("aceita uma pergunta curta e clara", () => {
    const result = qualityCheck("O que mais gostas nisso?", baseContext(), "question");
    expect(result.passed).toBe(true);
  });

  it("rejeita uma pergunta vazia ou demasiado curta", () => {
    const result = qualityCheck("Ok?", baseContext(), "question");
    expect(result.passed).toBe(false);
  });

  it("rejeita texto longo demais para uma pergunta (parece explicação)", () => {
    const long = "Isto acontece porque ".repeat(30) + "e por isso, o que achas?";
    const result = qualityCheck(long, baseContext(), "question");
    expect(result.passed).toBe(false);
    expect(result.flags).toContain("demasiado longa para este tipo de turno");
  });

  it("sinaliza e rejeita repetição de um turno já feito na exploração", () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "O que estás realmente a tentar otimizar?" },
      ],
    });
    const result = qualityCheck("O que estás realmente a tentar otimizar?", ctx, "question");
    expect(result.passed).toBe(false);
    expect(result.flags).toContain("possível repetição de um turno anterior");
  });

  it("não rejeita perguntas diferentes mesmo que partilhem algumas palavras", () => {
    const ctx = baseContext({
      activeThread: [{ role: "question", strategy: "PROBE_DEEPER", content: "O que estás a tentar otimizar?" }],
    });
    const result = qualityCheck("Quem decidiu que essa é a melhor abordagem?", ctx, "question");
    expect(result.passed).toBe(true);
  });

  it("não penaliza um facto (insight) por ser declarativo — isso é suposto", () => {
    const declarativo =
      "Curioso: os chefs usam sondas de precisão. Fazem-no pelo mesmo motivo que os engenheiros usam sensores. É controlar uma variável que a maioria gere a olho.";
    const result = qualityCheck(declarativo, baseContext(), "insight");
    expect(result.passed).toBe(true);
  });

  it("aceita um facto/simulação um pouco mais longo do que aceitaria numa pergunta", () => {
    const text = "Repara nisto: ".repeat(20) + "interessante, não?";
    const asQuestion = qualityCheck(text, baseContext(), "question");
    const asInsight = qualityCheck(text, baseContext(), "insight");
    expect(asQuestion.passed).toBe(false);
    expect(asInsight.flags).not.toContain("demasiado longa para este tipo de turno");
  });

  it("uma pausa (reflection) muito longa continua a ser rejeitada — deve ser curta", () => {
    const long = "Fica com isto um bocado. ".repeat(20);
    const result = qualityCheck(long, baseContext(), "reflection");
    expect(result.passed).toBe(false);
  });
});