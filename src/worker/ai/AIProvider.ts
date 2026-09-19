/**
 * Abstração do fornecedor de IA. Nenhum outro módulo deve chamar
 * env.AI diretamente — tudo passa por aqui, para que trocar de
 * Qwen/Workers AI para Gemini/Claude/OpenAI seja uma nova classe,
 * não uma reescrita do Curiosity Engine.
 */

export interface ProfileSignals {
  interests: string[];
  hobbies: string[];
  technicalInterests: string[];
}

export interface ExplorationSummary {
  summary: string;
  tags: string[];
}

export interface GeneratedQuestion {
  /** Texto da pergunta/resposta gerada, já pronto para mostrar ao utilizador. */
  text: string;
  /** Estratégia que o modelo diz ter seguido (para logging/qualidade). */
  strategyUsed?: string;
}

export interface StructuredPrompt {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  /** Dica de temperatura/criatividade; cada provider mapeia como quiser. */
  temperature?: number;
}

export interface AIProvider {
  generateQuestion(prompt: StructuredPrompt): Promise<GeneratedQuestion>;
  extractProfileSignals(conversationChunk: string): Promise<ProfileSignals>;
  summarizeExploration(
    messages: Array<{ role: string; content: string }>
  ): Promise<ExplorationSummary>;
}
