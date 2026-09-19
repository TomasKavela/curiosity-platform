# API

Base: `/api`. Todas as rotas (exceto `/health`) exigem sessão — criada
automaticamente no primeiro pedido via cookie `cp_session` (httpOnly).

## Saúde

`GET /health` → `{ status: "ok", environment: string }`

## Onboarding

`GET /onboarding/steps` → `{ steps: string[] }`

`POST /onboarding/answer`
Body: `{ step: number, answer: string }`
→ `{ nextStep: number | null, nextQuestion: string | null, done: boolean, candidateProfile }`

## Perfil

`GET /profile` → `Profile` (ver `src/frontend/lib/api.ts` para a forma exata)

`PATCH /profile`
Body: `{ displayName?, fieldOfStudy?, confirmed?: { interests?, hobbies?, technicalInterests? } }`
→ `{ ok: true }`

## Explorações

`GET /explorations` → `{ explorations: ExplorationSummaryItem[] }`

`GET /explorations/:id` → `{ exploration, messages: ExplorationMessage[] }`

`POST /explorations`
Body: `{ firstMessage: string, origin?: "guided" | "spontaneous" }`
→ `{ explorationId, question, strategyUsed }` (201)
Sujeito a rate limiting (chamada de IA).

`POST /explorations/:id/messages`
Body: `{ content: string }`
→ `{ question, strategyUsed }`
Sujeito a rate limiting.

## Ideias espontâneas

`POST /ideas`
Body: `{ content: string, fromExplorationId?: string }`
→ `{ explorationId, question }` (201)
Sujeito a rate limiting.

## Memórias

`GET /memories` → `{ memories: Array<{ id, summary, tags, exploration_id, created_at }> }`

## Notificações

`GET /notifications` → `{ notifications: [...] }`

`PATCH /notifications/:id/read` → `{ ok: true }`

## Rate limiting

Endpoints que chamam IA (`POST /explorations`, `POST /explorations/:id/messages`,
`POST /ideas`) estão limitados a 20 pedidos/minuto por sessão. Resposta ao
exceder: `429 { error: "rate_limited", retryAfterSeconds: 60 }`.

## Erros

Erros de validação (Zod) devolvem `400` com detalhes do schema. Recursos não
encontrados ou de outro utilizador devolvem `404 { error: "not_found" }`
(nunca `403`, para não confirmar a existência do recurso a quem não é dono).
