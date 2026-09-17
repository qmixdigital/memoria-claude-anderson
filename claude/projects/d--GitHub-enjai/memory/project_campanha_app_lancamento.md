---
name: project_campanha_app_lancamento
description: "Campanha e-mail \"lançamento do app\" (10% + 7 dias) via Resend — portuga disparado 2026-08-21 (637 envios), replicar em truenet/skipark/enjai"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-21T15:08:40.325Z
---

**Campanha de e-mail anunciando o app (lançamento), via Resend (NÃO SendPulse — o usuário disse SendPulse mas quis dizer Resend).** Estratégia decidida: **10% de desconto + oferta válida 7 dias, SEM teto de "1000 primeiros"** (dupla escassez confunde; o app vale mais que os 10%; hoje o cupom já é dado a todos que instalam). Público: **clientes que compraram + leads das ferramentas grátis**, menos quem descadastrou.

**Infra (tudo em `/tmp/camp/` no srv1166087):**
- `campanha_app.py <site> <count|sample|send>` — genérico p/ os 4 sites. Lê env do próprio site (`.env.local`: NEXTAUTH_SECRET/CRON_SECRET, NEXT_PUBLIC_SITE_URL, RESEND_API_KEY), template HTML por marca (cores do manifest), envia individual via Resend com `List-Unsubscribe` + `List-Unsubscribe-Post: One-Click`, ~0,18s entre envios, retry em 429. `sample` manda p/ qmixdigital@gmail.com.
- Lista de destinatários: `docker exec <site>-postgres psql` → distinct de `Pedido` (status<>AGUARDANDO_PAGAMENTO, sem anonimo@) UNION `UsuarioFerramenta`, menos `DescadastroEmail`, salvo em `/tmp/camp/<site>_rec.txt`.
- **Descadastro/unsubscribe JÁ existia**: rota `/descadastrar?e=EMAIL&t=HMAC` (GET+POST one-click RFC8058); `t = HMAC-SHA256(NEXTAUTH_SECRET||CRON_SECRET||"enjai-unsub", email.lower())[:24]`; grava em tabela `DescadastroEmail`. Validado (token certo=200, errado=400).
- Resend: 1 conta (chave `re_JJTwP...` no .env.local do enjai), 4 domínios verificados (enjai/truenet/skipark/portugaldigital). ⚠️ Cloudflare na frente da API bloqueia User-Agent do urllib (403 code 1010) → mandar header `User-Agent: Mozilla/...`.

**Status 2026-08-21 (TODOS disparados):** portuga 637/637 ✅ · truenet 6/6 ✅ · skipark 385 (enviando) · **enjai 8.017 (enviando, delay 0,6s ~80min)**. Total ~9.045. Assunto: "Chegou o app da <Marca> 📲 (10% de desconto)".
- Anti-spam aplicado: **clientes que compraram PRIMEIRO, leads depois** (ordenação MIN(ord) buyers=0/leads=1 na query); espaçamento por site (enjai 0,6s / skipark 0,4s / truenet 0,3s); domínios separados enviados em paralelo (reputação independente).
- Script agora aceita 3º arg = delay: `campanha_app.py <site> send <delay_seg>`.
- **skipark roda no opengravity** (DB Postgres LOCAL via `psql "$DATABASE_URL"`, NÃO docker; script + rec em /tmp/camp/ do opengravity). enjai/portuga/truenet no srv1166087 via docker.
- Open-tracking DESLIGADO nos domínios (sem taxa de abertura). Métricas de sucesso = cupons `app-` novos + descadastros.

Ver [[project_app_pwa]] (o recurso do app) e [[reference_dominios_sites]] (portuga = portugaldigital.com.br).
