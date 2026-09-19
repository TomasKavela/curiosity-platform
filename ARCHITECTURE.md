# Arquitetura

## Visão geral

```
Frontend (React/Vite, Static Assets)
        │ fetch JSON
        ▼
Worker (Hono) ── auth (sessão anónima) ── rate limit (KV)
        │
        ├── rotas de CRUD simples (profile, memories, notifications)
        │
        └── Curiosity Engine (módulo interno, não serviço separado)
                 buildContext → selectStrategy → buildPrompt → AIProvider → qualityCheck
                                                                      │
                                                              WorkersAIProvider
                                                                      │
                                                          Cloudflare Workers AI (Qwen3)

Dados: D1 (relacional) + KV (sessão/cache) — sem Vectorize no MVP (ver DECISIONS.md)
```

## Curiosity Engine

O componente mais importante do produto. Pipeline de funções puras e testáveis
em `src/worker/curiosity-engine/`:

1. **`buildContext`** — junta perfil confirmado, últimas mensagens da exploração
   ativa (janela de 12, sem sumarização) e memórias antigas relacionadas por
   sobreposição de tags (não busca vetorial — ver decisão em DECISIONS.md).
2. **`selectStrategy`** — regras explícitas (não um classificador de ML) que
   decidem a intenção da próxima interação: `PROBE_DEEPER`, `CONNECT`,
   `CHALLENGE`, `SUGGEST_EXPERIMENT`, `SIMPLIFY`, `ACKNOWLEDGE_IDEA`.
3. **`buildPrompt`** — monta o system prompt com few-shots fixos por estratégia
   (`prompts/fewShots.ts`, tirados diretamente dos exemplos do briefing do
   produto) — importante para compensar o menor raciocínio de um modelo
   pequeno como o Qwen3.
4. **`AIProvider.generateQuestion`** — chamada real ao modelo.
5. **`qualityCheck`** — heurísticas explícitas (comprimento, repetição,
   "entrega a resposta"), não um único `curiosity_score` mágico.
6. Se falhar o quality check: **1 retry**; se falhar outra vez: pergunta de
   fallback genérica — a exploração nunca fica sem resposta.

## AIProvider

Interface em `src/worker/ai/AIProvider.ts`. Única implementação real no MVP:
`WorkersAIProvider` (Qwen3 via `env.AI.run`, modelo `@cf/qwen/qwen3-30b-a3b-fp8`
— confirmar periodicamente com `wrangler ai models list`, o catálogo muda).
Nenhum outro módulo chama `env.AI` diretamente.

## Estratégia de memória

Três camadas, todas dentro do mesmo Worker (ver DECISIONS.md para o porquê de
não usar Vectorize no MVP):

- **Curto prazo:** últimas mensagens da exploração ativa, enviadas tal e qual.
- **Médio prazo:** ao pausar/fechar uma exploração, um resumo (2-3 frases) +
  tags é gerado via `AIProvider.summarizeExploration` e guardado em `memories`.
- **Longo prazo:** sinais extraídos ao longo do onboarding e das explorações
  alimentam um "perfil candidato" (`profiles.candidate_json`), que o utilizador
  confirma explicitamente antes de passar a `confirmed_json`.

## Modelo de dados

Ver `db/schema.sql`. Simplificação relevante: "Projetos/Experimentos" não são
uma entidade própria — são `explorations` com `type = 'project'`.

## Autenticação

Sessão anónima por `device_token` (cookie httpOnly), sem password. Upgrade
opcional por email (magic link) fica preparado na estrutura de dados mas fora
do MVP obrigatório — ver DECISIONS.md.
