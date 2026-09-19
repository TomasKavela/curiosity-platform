# Decisões Técnicas

Formato: decisão → alternativas consideradas → porquê.

## 1. Curiosity Engine como módulo interno, não serviço separado
**Alternativas:** Worker dedicado, Durable Object, fila.
**Porquê:** MVP com orçamento zero não justifica a complexidade operacional de
múltiplos serviços comunicando entre si. A fronteira já é modular no código
(`src/worker/curiosity-engine/`), então extrair depois é barato se necessário.

## 2. Memória sem Vectorize no MVP
**Alternativas:** Vectorize + embeddings desde o início.
**Porquê:** Volume de memórias por utilizador é pequeno no MVP. Um resumo
estruturado em D1 (`memories` table) com tags + busca `LIKE` resolve a maior
parte do valor pedido ("há três semanas estavas a explorar X") sem custo de
embeddings. Schema desenhado para que adicionar Vectorize depois seja aditivo,
não uma reescrita.

## 3. Autenticação anónima, sem password
**Alternativas:** email/password desde o início, OAuth.
**Porquê:** Onboarding de um produto de curiosidade espontânea não pode ter
fricção de conta. Sessão por device token + upgrade opcional por email cobre
o essencial sem gerir passwords.

## 4. "Projetos/Experimentos" fundidos em Explorations
**Alternativas:** entidade `Project` própria, como no briefing original.
**Porquê:** Do ponto de vista do utilizador, um projeto é uma exploração que
"virou" algo mais concreto. Uma flag `type: 'project'` em `explorations`
entrega a mesma funcionalidade percebida sem duplicar modelo de dados.

## 5. Quality check por heurísticas explícitas, não score único de IA
**Alternativas:** pedir ao próprio modelo para se autoavaliar com um número.
**Porquê:** Um único "curiosity_score" gerado por IA é ele próprio sujeito a
alucinação e inconsistência. Heurísticas determinísticas (comprimento,
sobreposição de palavras com perguntas anteriores, contagem de frases
declarativas) são mais previsíveis e mais baratas de correr.

## 6. Suporte a crianças fora do MVP
**Alternativas:** incluir desde já com avisos de segurança básicos.
**Porquê:** Suporte real a menores implica consentimento parental, retenção de
dados diferenciada e moderação reforçada — tratar isto como "adicionar depois"
seria negligente. Fica como requisito de uma fase dedicada, com avaliação
legal própria.

## 7. Modelo de IA: Qwen3 via Workers AI, sem fallback a modelo maior no MVP
**Alternativas:** reservar orçamento mínimo para um modelo maior só na geração
da pergunta.
**Porquê:** Consistente com o requisito de orçamento praticamente zero. Risco
aceite e documentado: a qualidade das perguntas pode ficar abaixo do ideal
descrito no briefing em domínios muito nichados. Mitigado com few-shots fixos
no prompt (`prompts/fewShots.ts`) para compensar o menor raciocínio do modelo.
Reavaliar se a validação da hipótese do produto justificar o custo extra.

## 8. Notificações apenas in-app no MVP
**Alternativas:** push notifications, email.
**Porquê:** Push exige service workers e gestão de permissões do browser;
email exige provedor externo. Nenhum dos dois é essencial para validar a
hipótese central do produto.
