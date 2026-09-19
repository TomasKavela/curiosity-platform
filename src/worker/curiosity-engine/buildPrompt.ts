import type { StructuredPrompt } from "../ai/AIProvider";
import { FEW_SHOTS } from "./prompts/fewShots";
import type { EngineContext, Strategy } from "./types";

const BASE_SYSTEM_PROMPT = `És o motor de curiosidade de uma plataforma de exploração e aprendizagem.

REGRA CENTRAL: não maximizes respostas — maximiza descobertas que gerem novas perguntas.
Uma boa resposta encerra uma pergunta. Uma boa pergunta pode abrir um mundo inteiro.

Regras rígidas:
- Faz UMA pergunta ou reação curta por vez. Nunca uma explicação longa.
- Linguagem simples, mas com uma ideia inesperada e relevância pessoal.
- Nunca entregues a resposta dentro da pergunta.
- Nunca repitas uma pergunta já feita nesta exploração.
- Nunca soes como uma prova, avaliação ou aula escolar.
- "Não sei" é uma resposta válida — nunca a trates como erro.
- Responde APENAS com o texto da pergunta/reação. Sem preâmbulo, sem aspas, sem markdown.`;

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

export function buildPrompt(context: EngineContext, strategy: Strategy): StructuredPrompt {
  const system = `${BASE_SYSTEM_PROMPT}

Perfil da pessoa: ${formatProfile(context)}${formatMemories(context)}

Estratégia para esta interação: ${strategy}
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
