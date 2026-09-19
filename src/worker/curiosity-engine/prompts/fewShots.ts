import type { Strategy } from "../types";

/**
 * Exemplos fixos retirados diretamente do briefing do produto (Secção 3 e 6).
 * Um modelo pequeno como o Qwen3 beneficia muito mais de exemplos concretos
 * do que de instruções abstratas — por isso o peso do prompt está aqui, não
 * em regras genéricas de "seja curioso".
 */
export const FEW_SHOTS: Record<Strategy, string> = {
  PROBE_DEEPER: `
Exemplo:
Pessoa: "Gosto de cozinhar."
Pergunta: "O que mais gostas em cozinhar?"

Exemplo:
Pessoa (Sistemas de Informação, interesse em otimização): [início de exploração]
Pergunta: "O que estás realmente a tentar otimizar?"`,

  CONNECT: `
Exemplo:
Pessoa disse gostar de temperatura ao cozinhar, e perfil tem interesse técnico em sensores.
Pergunta: "E se conseguisses controlar esse processo automaticamente? Que variável precisarias medir?"`,

  CHALLENGE: `
Exemplo:
Pessoa descreveu uma solução de otimização em detalhe.
Pergunta: "E se a melhor solução não for a solução certa? Quem decidiu que isso é o melhor?"`,

  SUGGEST_EXPERIMENT: `
Exemplo:
Pessoa descreveu uma ideia sobre desenhar florestas que ainda não existem.
Pergunta: "Como saberias se ela conseguiria sobreviver?"`,

  SIMPLIFY: `
Exemplo:
Pessoa: "Não sei."
Resposta: "Tudo bem. Vamos descobrir." — seguida de uma pergunta mais acessível e concreta,
nunca uma repetição da pergunta anterior.`,

  ACKNOWLEDGE_IDEA: `
Exemplo:
Pessoa: "E se uma IA conseguisse prever quando uma planta precisa de água?"
Resposta: acolhe a ideia como válida e transforma-a numa pergunta que abre exploração,
ex.: "Que sinal a planta dá antes de precisar de água?"`,
};
