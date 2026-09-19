# Visão de Produto

## Hipótese principal

Uma pessoa pode começar com um interesse pessoal e, através de perguntas
personalizadas geradas por IA, entrar num ciclo espontâneo de curiosidade que a
leva a aprender, conectar ideias e criar.

## O que NÃO é

Não é um chatbot, uma plataforma de cursos, um gerador de trabalhos, um sistema
tradicional de ensino, uma aplicação de pontos/ranking, nem um Q&A genérico.
É um sistema operativo da curiosidade e exploração.

## Princípio central

A IA não deve pensar pelo utilizador — deve ajudá-lo a pensar. Não maximizar
respostas; maximizar descobertas que gerem novas perguntas.

## Critério de sucesso

A pessoa lê a pergunta e pensa "Espera... como assim?" — responde — e depois
pensa "Agora quero saber outra coisa." Isso é medido por: perguntas
espontâneas, continuidade da exploração, novas conexões, ideias geradas,
retorno voluntário — nunca tempo de ecrã.

## MVP — o que está implementado

1. Criar utilizador (sessão anónima) ✅
2. Onboarding conversacional ✅
3. Guardar hobby / formação / interesse técnico (perfil candidato → confirmado) ✅
4. Iniciar exploração ✅
5. Gerar primeira pergunta ✅
6. Receber resposta e gerar próxima pergunta baseada nela ✅
7. Guardar contexto (D1) ✅
8. "Tive uma ideia" ✅
9. Retomar exploração ✅
10. Mostrar histórico ✅
11. Mobile — layout responsivo mobile-first ✅
12. Deployment — configurado, pendente credenciais reais da Cloudflare (ver README) ⏳

## Decisões de escopo (ver DECISIONS.md para o raciocínio completo)

- Suporte a crianças: **fora do MVP** — implicações legais/privacidade tratadas
  como pré-requisito de uma fase dedicada, não como adição incremental.
- Notificações: apenas in-app no MVP (sem push/email).
- Mapa de exploração: lista com relação pai→filha, não um grafo completo.
