---
name: project_campanha_reativacao
description: "Campanha e-mail reativação cupom 30% (link único/compra única) p/ clientes que compraram 1x — NO AR/cadenciada desde 2026-08-04"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-09-11T07:57:10.141Z
---

**Campanha de reativação — NO AR (cadenciada) desde 2026-08-04. Mockup aprovado pelo dono.**

**COMO ESTÁ RODANDO:** script `campanha_enviar.mjs` + `email_template.mjs` em cada `/var/www/<site>/` (usa `pg` do app + Resend HTTP). Modos: `dry` (conta), `test:<email>`, `run <N|auto>`. `auto` faz ramp de reputação (150→250→400/dia conforme já enviados). **Cron dias úteis 13:00 UTC (=10h BRT)**: enjai+portuga no srv1166087 (node nvm v20), skipark no opengravity (/usr/bin/node) — `run auto`, log `/var/log/campanha-reativacao.log`. **Desativar:** `crontab -e` remover linha `campanha_enviar.mjs`. Alvos: enjai 3725, portuga 411, skipark 174. Canário inicial já enviado (enjai 30, portuga 10, skipark 10 — 0 falhas, 1 bounce skipark). E-mail de teste aprovado foi p/ anderson.gna@gmail.com. Rotas no ar: `/promo/[token]` (seta cookie httpOnly `promo_reativacao` 30d), `/descadastrar?e=&t=` (HMAC NEXTAUTH_SECRET, grava DescadastroEmail, GET+POST one-click). Checkout aplica max(cupom,VIP)% e grava `Pedido.cupomReativacaoToken`; `processarPagamentoConfirmado` marca cupom `usado` (só no pagamento, não queima Pix abandonado). Supressão: script pula quem está em DescadastroEmail e quem já tem cupom com enviadoEm.

**Alerta de venda no Telegram (`enviarAlerta` "pedido-pago" em `lib/processar-pagamento.ts`) leva prefixo com o cupom do pedido.** ⚠️ CORRIGIDO 2026-09-02: o prefixo era FIXO `[PROMO30%]` e disparava pra QUALQUER `cupomReativacaoToken` — inclusive o cupom de 10% do app (token `app-`, que mora na mesma tabela CupomReativacao), rotulando venda de 10% como "30%". Agora é DINÂMICO: lê `percentDesconto` real + tipo do token → `[APP 10%]` (token app-) ou `[PROMO 30%]` (reativação). Aplicado em enjai/portuga/skipark 2026-09-02. truenet NÃO tem esse bloco de promoTag (nunca teve o bug). Números medidos 2026-09-02 no enjai: cupons reativação 30% = 3998 criados/3997 enviados/1 usado; cupons app 10% = 28/4 usados.

**2026-09-11: copy do e-mail de reativação limpa (assunto sem 👀; template sem 👋 😉 e sem travessão) nos 3 sites**, por conta da regra [[feedback_no_emojis]]. Lógica intocada, `node --check` OK. Sobraram só travessões em comentários de código/log interno (não vão pro cliente). Cron continua igual.

**Relatório diário Telegram (`/root/relatorio-ferramentas.sh`) agora inclui seção da campanha:** enviados hoje/total, 🎁 **redimidos** (=usado=true=2ª compra, métrica de sucesso), descadastros — por site + total. skipark vem via endpoint `/api/cron/leads-stats` (estendido com campos `camp_*`); enjai/portuga via docker psql.


**Objetivo:** e-mail p/ clientes que compraram **exatamente 1 vez** oferecendo **cupom de 30%** via **link único = compra única** (consumido após usar). Gancho secundário: virar afiliado.

**Audiência real (medida):** clientes c/ 1 pedido pago e e-mail válido — enjai **3.725**, portuga **411**, skipark **173**, truenet 0. Total **~4.309**. Dono quis TODOS (sem filtro de tempo).

**Decisões travadas:**
- Oferta = **cupom 30%, link único, compra única** (não há sistema de cupom hoje → precisa criar model `CupomReativacao`).
- VIP fica em **3 pedidos** (opção A, sem mexer). Texto NÃO promete VIP na 2ª compra; diz "compre 3×+ e vire VIP c/ desconto pra sempre".
- **CTA único** = link dos 30%; afiliado (`/afiliados/cadastro`) vira P.S.
- Cadência lenta (aquecimento reputação): ~150→500/dia por site, dias úteis manhã BRT. Sem pressa.
- Envio pela **API transacional do Resend** (50k/mês, cabe), NÃO Broadcasts (marketing grátis só 1k contatos). Ver [[project_resend_dominios]].
- **Funil / campanha 2 (depois):** quem tem 2 compras e não virou VIP → novo desconto p/ empurrar à 3ª (=Bronze). Reusar mesmo sistema.

**Precisa construir:** model+tabela CupomReativacao (token único por cliente); rota `/promo/[token]` (valida+cookie+redirect loja); checkout aplica 30% logo após `valorBruto` (ponto em `app/api/checkout/route.ts` onde entra `aplicarDescontoVip`) + marca token usado; **descadastro/supressão LGPD** (não existe hoje no layout de e-mail!) + List-Unsubscribe; template HTML (layout Resend `layoutEmail`); script gera tokens + disparo em lotes com throttle e registro de enviados. Definição "comprou" = Pedido status NOT IN (AGUARDANDO_PAGAMENTO,CANCELADO,ERRO).
