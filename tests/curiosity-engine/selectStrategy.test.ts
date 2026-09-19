import { describe, expect, it } from "vitest";
import { selectStrategy } from "../../src/worker/curiosity-engine/selectStrategy";
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

describe("selectStrategy", () => {
  it("usa ACKNOWLEDGE_IDEA para ideias espontâneas, independentemente da thread", () => {
    const ctx = baseContext({ isSpontaneousIdea: true });
    expect(selectStrategy(ctx)).toBe("ACKNOWLEDGE_IDEA");
  });

  it("usa PROBE_DEEPER quando é a primeira pergunta da exploração", () => {
    const ctx = baseContext({ activeThread: [] });
    expect(selectStrategy(ctx)).toBe("PROBE_DEEPER");
  });

  it('trata "não sei" como SIMPLIFY, nunca como erro', () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", content: "O que estás a tentar otimizar?" },
        { role: "answer", content: "Não sei." },
      ],
    });
    expect(selectStrategy(ctx)).toBe("SIMPLIFY");
  });

  it("usa CONNECT quando a resposta é rica, toca num interesse técnico e há memórias relacionadas", () => {
    const ctx = baseContext({
      profile: {
        displayName: null,
        fieldOfStudy: "Sistemas de Informação",
        interests: [],
        hobbies: [],
        technicalInterests: ["otimização"],
      },
      relevantMemories: [{ summary: "explorou sensores", tags: ["sensores"] }],
      activeThread: [
        { role: "question", content: "O que estás a tentar otimizar?" },
        {
          role: "answer",
          content:
            "Estou a tentar otimizar o tempo de resposta de um sistema de recomendação que construí para a faculdade, considerando várias variáveis de contexto do utilizador.",
        },
      ],
    });
    expect(selectStrategy(ctx)).toBe("CONNECT");
  });

  it("usa SUGGEST_EXPERIMENT para respostas ricas sem memórias relacionadas nem termo técnico", () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", content: "O que mais gostas em cozinhar?" },
        {
          role: "answer",
          content:
            "Gosto principalmente de controlar a temperatura com precisão e ver como isso muda a textura final dos alimentos ao longo do tempo.",
        },
      ],
    });
    expect(selectStrategy(ctx)).toBe("SUGGEST_EXPERIMENT");
  });

  it("não força o fluxo original perante uma resposta completamente inesperada", () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", content: "O que estás a tentar otimizar?" },
        { role: "answer", content: "Sinceramente só queria falar de dinossauros." },
      ],
    });
    // resposta curta/inesperada não deve tentar aprofundar o tópico anterior à força
    expect(["PROBE_DEEPER", "SUGGEST_EXPERIMENT"]).toContain(selectStrategy(ctx));
  });
});
