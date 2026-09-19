# Segurança

## Autenticação e sessão

- Sessão anónima por `device_token` aleatório (`crypto.randomUUID()`), guardado
  em cookie `httpOnly`, `secure`, `sameSite=Lax`. Nunca acessível a JavaScript
  no browser.
- Sem passwords no MVP — reduz superfície de ataque (nada para vazar, nada para
  forçar por brute-force). Upgrade por email fica para uma fase posterior.

## Autorização

- Todas as queries a `explorations`, `messages`, `memories`, `notifications`
  filtram por `user_id` extraído da sessão — nunca confiam em IDs vindos do
  cliente para decidir "de quem é" um recurso.
- Recurso de outro utilizador → `404`, nunca `403` (evita confirmar existência).

## Validação de entrada

- Todos os bodies de POST/PATCH validados com Zod antes de tocar em D1 ou na IA
  (`src/worker/schemas/index.ts`). Limites de tamanho em todos os campos de
  texto livre (evita prompts desproporcionalmente grandes para a IA).

## Rate limiting

- KV com TTL, por utilizador, nos 3 endpoints que chamam IA — protege o
  recurso mais escasso do projeto (orçamento de Workers AI).

## Segredos

- Nenhuma credencial de IA é necessária ou exposta — Workers AI usa o binding
  nativo `env.AI`, autenticado pela própria execução do Worker na conta
  Cloudflare, nunca uma API key manuseada pelo código.
- `wrangler.jsonc` não contém segredos reais — apenas placeholders
  `<configure-me>` para `database_id` e `id` do KV, que são identificadores de
  recursos, não credenciais secretas.
- Se um AIProvider futuro (Gemini/Claude/OpenAI) exigir API key, essa key
  entra via `wrangler secret put`, nunca em `wrangler.jsonc` nem no
  repositório.

## Logs

- Sem logging de conteúdo de exploração (perguntas/respostas) nos logs
  estruturados — apenas metadados (IDs, estratégia usada, latência, sucesso/
  falha da chamada de IA).

## Privacidade / dados de menores

- MVP restrito a adultos/estudantes — sem suporte a utilizadores menores de
  idade. Ver DECISIONS.md para o raciocínio.
- Conteúdo das explorações nunca é usado para treinar/afinar modelos externos.

## Pendente antes de produção real com utilizadores

- Política de privacidade e termos de serviço (texto legal, fora do âmbito de
  engenharia deste MVP).
- Fluxo de exportação/eliminação de dados do utilizador (endpoint ainda não
  implementado — estrutura de dados já permite, é trabalho de API).
- Auditoria de custos reais de Workers AI em produção antes de abrir a
  utilização publicamente sem convite.
