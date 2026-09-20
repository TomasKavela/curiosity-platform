import type { StructuredPrompt } from "../ai/AIProvider";
import { STRATEGY_MOMENT_TYPE } from "./selectStrategy";
import { FEW_SHOTS } from "./prompts/fewShots";
import type { EngineContext, Strategy } from "./types";

const BASE_SYSTEM_PROMPT = `És o motor de curiosidade de uma plataforma de exploração e aprendizagem.

REGRA CENTRAL: não maximizes respostas — maximiza descobertas que gerem novas perguntas.
Nem toda interação deve terminar em pergunta. O ritmo certo é:
pergunta -> resposta -> descoberta (facto, simulação, pausa ou proposta de experiência) -> nova pergunta.
Nunca encadeies várias perguntas seguidas.

Regras rígidas:
- Faz UM turno curto de cada vez (uma pergunta, OU um facto, OU uma simulação, OU uma pausa, OU uma proposta). Nunca uma explicação longa.
- Linguagem simples, mas com uma ideia inesperada e relevância pessoal.
- Se o turno for uma pergunta: nunca entregues a resposta dentro dela.
- Se o turno for uma descoberta (facto/simulação/pausa/proposta): não termines forçosamente com uma pergunta — o objetivo é dar espaço para pensar, não continuar a interrogar.
- Nunca repitas um turno já feito nesta exploração.
- Nunca soes como uma prova, avaliação ou aula escolar.
- "Não sei" é uma resposta válida — nunca a trates como erro.
- Responde APENAS com o texto do turno. Sem preâmbulo, sem aspas, sem markdown.`;

function formatProfile(context: EngineContext): string {
  const { profile } = context;
  const parts: string[] = [];
  if (profile.fieldOfStudy) parts.push(`formação: ${profile.fieldOfStudy}`);
  if (profile.interests.length) parts.push(`interesses: ${profile.interests.join(", ")}`);
  if (profile.hobbies.length) parts.push(`hobbies: ${profile.hobbies.join(", ")}`);
  if (profile.technicalInterests.length)
    parts.push(`interesses técnicos: ${profile.technicalInterests.join(", ")}`);
  return parts.length ? parts.join(" | ") : "perfil ainda pouco conhecido";
}

function formatMemories(context: EngineContext): string {
  if (context.relevantMemories.length === 0) return "";
  const lines = context.relevantMemories.map((m) => `- ${m.summary} (tags: ${m.tags.join(", ")})`);
  return `\nExplorações anteriores relacionadas:\n${lines.join("\n")}`;
}

const DEPTH_HINT: Record<EngineContext["depth"], string> = {
  explorar: "A pessoa está só a explorar — mantém tudo leve e acessível.",
  aprofundar: "A pessoa quer aprofundar — podes assumir mais contexto já partilhado.",
  investigar: "A pessoa quer investigar a sério — simulações e factos podem ser mais específicos.",
  criar: "A pessoa quer criar/experimentar — favorece propostas concretas de ação.",
};

export function buildPrompt(context: EngineContext, strategy: Strategy): StructuredPrompt {
  const momentType = STRATEGY_MOMENT_TYPE[strategy];
  const system = `${BASE_SYSTEM_PROMPT}

Perfil da pessoa: ${formatProfile(context)}${formatMemories(context)}

Profundidade escolhida pela pessoa: ${context.depth}. ${DEPTH_HINT[context.depth]}

Tipo de turno a gerar agora: ${momentType} (estratégia: ${strategy})
${FEW_SHOTS[strategy]}`;

  const messages = context.activeThread.map((m) => ({
    role: (m.role === "question" ? "assistant" : "user") as "user" | "assistant",
    content: m.content,
  }));

  return {
    system,
    messages,
    temperature: strategy === "SIMPLIFY" ? 0.6 : 0.85,
  };
}