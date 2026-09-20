import type {
  AIProvider,
  ExplorationSummary,
  GeneratedQuestion,
  ProfileSignals,
  StructuredPrompt,
} from "./AIProvider";

const CHAT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function extractResponseText(response: unknown): string {
  if (typeof response === "string") return response;
  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (typeof obj.response === "string") return obj.response;
    if (Array.isArray(obj.tool_calls) && obj.tool_calls.length > 0) {
      return JSON.stringify(obj.tool_calls);
    }
  }
  return "";
}

function extractJson<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

export class WorkersAIProvider implements AIProvider {
  constructor(private readonly ai: Ai) {}

  async generateQuestion(prompt: StructuredPrompt): Promise<GeneratedQuestion> {
    const response = await this.ai.run(CHAT_MODEL, {
      messages: [{ role: "system", content: prompt.system }, ...prompt.messages],
      max_tokens: 220,
      temperature: prompt.temperature ?? 0.8,
    });

    const text = extractResponseText(response);
    return { text: text.trim() };
  }

  async extractProfileSignals(conversationChunk: string): Promise<ProfileSignals> {
    const response = await this.ai.run(CHAT_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "Extrai sinais de perfil da conversa seguinte. Responde APENAS com JSON " +
            'no formato {"interests":[],"hobbies":[],"technicalInterests":[]}. ' +
            "Sem texto antes ou depois do JSON. Se não houver sinal claro para um campo, devolve lista vazia.",
        },
        { role: "user", content: conversationChunk },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const text = extractResponseText(response);
    return extractJson<ProfileSignals>(text, {
      interests: [],
      hobbies: [],
      technicalInterests: [],
    });
  }

  async summarizeExploration(
    messages: Array<{ role: string; content: string }>
  ): Promise<ExplorationSummary> {
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

    const response = await this.ai.run(CHAT_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "Resume esta exploração em 2-3 frases (o que a pessoa explorou, não o processo) " +
            'e propõe 2-5 tags temáticas curtas. Responde APENAS com JSON: {"summary":"...","tags":["..."]}.',
        },
        { role: "user", content: transcript },
      ],
      max_tokens: 250,
      temperature: 0.3,
    });

    const text = extractResponseText(response);
    return extractJson<ExplorationSummary>(text, { summary: "", tags: [] });
  }
}