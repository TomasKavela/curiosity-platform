import { describe, expect, it } from "vitest";
import { selectStrategy } from "../../src/worker/curiosity-engine/selectStrategy";
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

describe("selectStrategy — ritmo pergunta/descoberta", () => {
  it("usa ACKNOWLEDGE_IDEA para ideias espontâneas, independentemente da thread", () => {
    const ctx = baseContext({ isSpontaneousIdea: true });
    expect(selectStrategy(ctx)).toBe("ACKNOWLEDGE_IDEA");
  });

  it("usa PROBE_DEEPER (pergunta) quando é a primeira interação da exploração", () => {
    const ctx = baseContext({ activeThread: [] });
    expect(selectStrategy(ctx)).toBe("PROBE_DEEPER");
  });

  it('trata "não sei" como SIMPLIFY mesmo depois de uma descoberta (quebra o ritmo)', () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", strategy: "SHARE_INSIGHT", content: "Curioso: ..." },
        { role: "answer", content: "Não sei." },
      ],
    });
    expect(selectStrategy(ctx)).toBe("SIMPLIFY");
  });

  it("depois de UMA PERGUNTA respondida com riqueza técnica, oferece uma descoberta (SHARE_INSIGHT), não outra pergunta", () => {
    const ctx = baseContext({
      profile: {
        displayName: null,
        fieldOfStudy: "Sistemas de Informação",
        interests: [],
        hobbies: [],
        technicalInterests: ["otimização"],
      },
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "O que estás a tentar otimizar?" },
        {
          role: "answer",
          content:
            "Estou a tentar otimizar o tempo de resposta de um sistema de recomendação que construí para a faculdade, considerando várias variáveis de contexto do utilizador.",
        },
      ],
    });
    expect(selectStrategy(ctx)).toBe("SHARE_INSIGHT");
  });

  it("depois de uma pergunta respondida sem termo técnico específico, propõe uma simulação em vez de nova pergunta", () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "O que mais gostas em cozinhar?" },
        {
          role: "answer",
          content:
            "Gosto principalmente de controlar o tempo com precisão e ver como isso muda a textura final dos alimentos ao longo do processo todo.",
        },
      ],
    });
    expect(selectStrategy(ctx)).toBe("PROPOSE_SIMULATION");
  });

  it("depois de uma pergunta respondida de forma breve, convida a uma pausa (INVITE_REFLECTION)", () => {
    const ctx = baseContext({
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "O que mais gostas em cozinhar?" },
        { role: "answer", content: "O tempero." },
      ],
    });
    expect(selectStrategy(ctx)).toBe("INVITE_REFLECTION");
  });

  it("depois de UMA DESCOBERTA (não pergunta), volta a perguntar — nunca encadeia duas descobertas seguidas", () => {
    const ctx = baseContext({
      profile: {
        displayName: null,
        fieldOfStudy: null,
        interests: [],
        hobbies: [],
        technicalInterests: ["otimização"],
      },
      relevantMemories: [{ summary: "explorou sensores", tags: ["sensores"] }],
      activeThread: [
        { role: "question", strategy: "SHARE_INSIGHT", content: "Curioso: os sensores..." },
        {
          role: "answer",
          content:
            "Isso faz-me pensar que devia medir a temperatura em tempo real para otimizar melhor o processo todo.",
        },
      ],
    });
    expect(selectStrategy(ctx)).toBe("CONNECT");
  });

  it("nunca escolhe duas estratégias de descoberta seguidas (alterna sempre)", () => {
    const discoveryStrategies = ["SHARE_INSIGHT", "PROPOSE_SIMULATION", "INVITE_REFLECTION", "SUGGEST_EXPERIMENT"];
    for (const priorStrategy of discoveryStrategies) {
      const ctx = baseContext({
        activeThread: [
          { role: "question", strategy: priorStrategy, content: "..." },
          { role: "answer", content: "Uma resposta normal, nem muito curta nem muito longa." },
        ],
      });
      const next = selectStrategy(ctx);
      expect(discoveryStrategies).not.toContain(next);
    }
  });

  it("profundidade 'criar' favorece SUGGEST_EXPERIMENT depois de uma pergunta respondida", () => {
    const ctx = baseContext({
      depth: "criar",
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "..." },
        { role: "answer", content: "Uma resposta qualquer." },
      ],
    });
    expect(selectStrategy(ctx)).toBe("SUGGEST_EXPERIMENT");
  });

  it("profundidade 'investigar' favorece PROPOSE_SIMULATION depois de uma pergunta respondida", () => {
    const ctx = baseContext({
      depth: "investigar",
      activeThread: [
        { role: "question", strategy: "PROBE_DEEPER", content: "..." },
        { role: "answer", content: "Uma resposta qualquer." },
      ],
    });
    expect(selectStrategy(ctx)).toBe("PROPOSE_SIMULATION");
  });
});