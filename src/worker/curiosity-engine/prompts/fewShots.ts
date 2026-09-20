import type { Strategy } from "../types";

export const FEW_SHOTS: Record<Strategy, string> = {
  PROBE_DEEPER: `
Exemplo (pergunta):
Pessoa: "Gosto de cozinhar."
Pergunta: "O que mais gostas em cozinhar?"

Exemplo (pergunta):
Pessoa (Sistemas de Informação, interesse em otimização): [início de exploração]
Pergunta: "O que estás realmente a tentar otimizar?"`,

  CONNECT: `
Exemplo (pergunta):
Pessoa disse gostar de temperatura ao cozinhar, e já foi partilhado um facto sobre sensores.
Pergunta: "Que variável precisarias medir para automatizar isso?"`,

  CHALLENGE: `
Exemplo (pergunta):
Pessoa descreveu uma solução de otimização em detalhe.
Pergunta: "E se a melhor solução não for a solução certa? Quem decidiu que isso é o melhor?"`,

  SUGGEST_EXPERIMENT: `
Exemplo (proposta de experiência, NÃO é uma pergunta a exigir resposta imediata):
Pessoa descreveu uma ideia sobre desenhar florestas que ainda não existem.
Proposta: "Experimenta desenhar essa floresta só com 3 espécies. Repara no que tens de decidir primeiro."`,

  SIMPLIFY: `
Exemplo (pergunta mais acessível):
Pessoa: "Não sei."
Resposta: "Tudo bem. Vamos descobrir." — seguida de uma pergunta mais concreta,
nunca uma repetição da pergunta anterior.`,

  ACKNOWLEDGE_IDEA: `
Exemplo (pergunta que acolhe a ideia):
Pessoa: "E se uma IA conseguisse prever quando uma planta precisa de água?"
Resposta: acolhe a ideia como válida e transforma-a numa pergunta que abre exploração,
ex.: "Que sinal a planta dá antes de precisar de água?"`,

  SHARE_INSIGHT: `
Exemplo (facto surpreendente, SEM pergunta no fim):
Pessoa descreveu como controla a temperatura ao cozinhar.
Facto: "Curioso: os chefs profissionais usam sondas de precisão pelo mesmo motivo
que os engenheiros usam sensores — controlar uma variável que a maioria gere a olho."`,

  PROPOSE_SIMULATION: `
Exemplo (cenário para imaginar, não uma pergunta pessoal direta):
Pessoa falou sobre otimizar um sistema.
Simulação: "Imagina que a solução perfeita já existe, mas ninguém a está a usar.
Repara em quantas razões diferentes conseguem explicar isso."`,

  INVITE_REFLECTION: `
Exemplo (pausa, sem pergunta):
Depois de uma resposta rica da pessoa.
Reflexão: "Fica com isso um bocado antes de continuares — nem tudo precisa de resposta imediata."`,
};