# Melhorias Pendentes — QMIX Digital

Lista de melhorias sugeridas e aprovadas pelo usuário para implementação gradual.

## Concluído
- [x] Google Analytics (GA4) — G-ZE1KR55GKD
- [x] Página /pacotes-de-backlinks com listagem e detalhe [slug]
- [x] Pacotes removidos de /comprar-backlinks + link no menu/footer
- [x] E-mails transacionais (Resend) — pedido criado, pagamento confirmado (emails.ts)
- [x] Fix pedidos duplicados na retentativa de pagamento
- [x] Fix checkout criando pedidos "zumbi" quando Asaas falha
- [x] Cache force-dynamic em pagamento/confirmação
- [x] Botão "Pagar" na Minha Conta para pedidos pendentes
- [x] Logos QMIX no admin (Icon no nav bar)
- [x] E-mails transacionais (Resend) — todos os templates implementados
- [x] Lista de favoritos / "Salvar para depois" (localStorage + FavoritesProvider)
- [x] Avaliações/reviews — campos nota/totalAvaliacoes nos produtos + StarRating + AggregateRating JSON-LD
- [x] Breadcrumb Schema JSON-LD — blog, blog/[slug], perguntas-frequentes, pacotes-de-backlinks, pacotes/[slug]
- [x] Trust Badges no checkout (Lock, ShieldCheck, MessageCircle, Shield)
- [x] Sistema de Perguntas e Respostas (estilo MercadoLivre) — collection PerguntasRespostas + formulário + accordion + honeypot anti-bot + FAQPage JSON-LD

## Pendente — Prioridade Alta
- [ ] Sistema de cupons/códigos promocionais no checkout

## Pendente — Prioridade Média
- [ ] Recuperação de carrinho abandonado (e-mail lembrete)
- [ ] Página de Cases / Resultados com dados reais
- [ ] Blog com mais conteúdo (meta: 15-20 artigos)

## Bugs conhecidos
- [ ] Logomarca QMIX na sidebar do admin (beforeNavLinks não aparece)
