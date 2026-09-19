# curiosity-platform (nome provisório)

Uma plataforma de IA para exploração de curiosidade: parte de um hobby ou dúvida
genuína e, através de perguntas personalizadas geradas por IA, ajuda a pessoa a
entrar num ciclo espontâneo de descoberta — sem aulas, sem pontos, sem ranking.

Ver `PRODUCT.md` para a visão completa, `ARCHITECTURE.md` para as decisões
técnicas, e `DECISIONS.md` para o histórico de escolhas e alternativas.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Cloudflare Workers + Hono
- **IA:** Cloudflare Workers AI (Qwen3, via `env.AI.run`, sem API keys)
- **Dados:** Cloudflare D1 (relacional) + KV (sessões/rate limiting)
- **Deployment:** Cloudflare Workers com Static Assets, via `@cloudflare/vite-plugin`

## Desenvolvimento local

```bash
npm install
npm run cf-typegen     # gera worker-configuration.d.ts a partir do wrangler.jsonc
npm run db:migrate:local
npm run dev             # http://localhost:5173, corre o Worker localmente via workerd
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (frontend + worker, com HMR) |
| `npm run build` | `tsc -b` + build de produção do frontend/worker |
| `npm run preview` | Pré-visualiza o build de produção localmente |
| `npm run typecheck` | Typecheck sem emitir ficheiros |
| `npm run lint` | ESLint |
| `npm test` | Testes com Vitest |
| `npm run deploy` | Build + `wrangler deploy` |
| `npm run db:migrate:local` / `:remote` | Aplica `db/schema.sql` ao D1 local/remoto |
| `npm run cf-typegen` | Regera tipos a partir de `wrangler.jsonc` |

## Configurar a Cloudflare (antes do primeiro deploy)

1. **Autenticar:** `npx wrangler login`
2. **Criar a base de dados D1:**
   ```bash
   npx wrangler d1 create curiosity-platform-db
   ```
   Copiar o `database_id` devolvido para `wrangler.jsonc` (substitui `<configure-me>`).
3. **Criar o namespace KV:**
   ```bash
   npx wrangler kv namespace create SESSIONS_KV
   ```
   Copiar o `id` devolvido para `wrangler.jsonc`.
4. **Aplicar o schema:**
   ```bash
   npm run db:migrate:remote
   ```
5. **Workers AI:** não precisa de configuração — o binding `AI` em `wrangler.jsonc`
   já dá acesso, sem API key, desde que a conta Cloudflare tenha Workers AI ativo
   (incluído no plano gratuito, com 10.000 neurons/dia).

## Deploy

```bash
npm run deploy
```

A CLI do `wrangler` imprime o URL de produção (`https://curiosity-platform.<subdomínio>.workers.dev`,
ou o domínio próprio se configurado).

## Troubleshooting

- **"database_id inválido" ao fazer deploy:** falta substituir `<configure-me>`
  em `wrangler.jsonc` pelo ID real do D1 (passo 2 acima).
- **Erros de tipos após mudar `wrangler.jsonc`:** correr `npm run cf-typegen` de novo.
- **`env.AI.run` devolve erro de modelo não encontrado:** o catálogo de modelos
  da Cloudflare muda com frequência — confirmar o ID atual com
  `npx wrangler ai models list` e atualizar `CHAT_MODEL` em
  `src/worker/ai/WorkersAIProvider.ts`.
- **`Error: Binding AI needs to be run remotely` ao testar localmente:** Workers
  AI não tem emulação local — o binding `ai.remote: true` em `wrangler.jsonc`
  já assume isto. Corre `npx wrangler login` antes de `npm run dev` para que a
  chamada real à Cloudflare funcione durante o desenvolvimento. Sem login, as
  rotas que não tocam IA (`/api/health`, `/api/profile`, onboarding sem
  extração de sinais) continuam a funcionar normalmente.
