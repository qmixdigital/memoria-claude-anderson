---
name: project_smm_duplicacao_504
description: Auditoria 2026-06-23 — pedido duplicou no painel SMM por HTTP 504 (timeout) + retry cego; correção PENDENTE de decisão do dono
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
---

**Incidente (2026-06-23, portuga, pedido cmqql4767000618i5dwy0od97 — item TikTok Seguidores Mundiais qty 200):** o pedido foi enviado **2x** ao painel `painelseguidores.agency` (09:00 e 09:10 BR) → cliente recebeu 200+200 e pagamos o painel 2x.

**Causa raiz (confirmada por log):** o painel devolveu **`SMM Panel error: 504`** (timeout de gateway) no 1º envio — MAS já tinha criado a ordem (madrugada com instabilidade no painel, confirmada pelo suporte do painel). Fluxo:
1. `processar-pagamento` envia → painel cria a ordem (09:00:04) mas responde **504** ~60s depois.
2. `smmRequest` (lib/smm-panel.ts) faz `if (!res.ok) throw` → catch marca item `smmStatus="erro"` SEM salvar `smmOrderId`.
3. Cron `retry-erros` (a cada 10min) vê item `!smmOrderId || smmStatus==="erro"` → **reenvia** → 2ª ordem (8971). A janela anti-duplicata do painel (~5min) já tinha expirado.

**Bug central:** HTTP 5xx/timeout é AMBÍGUO (ordem pode ter sido criada), mas o código trata igual a rejeição definitiva e reenvia cego. Além disso, `smmRequest` NÃO tem timeout.

**Frequência:** raro — 1 erro 504 em 30 dias no portuga, 0 no enjai (os 16 reenvios do enjai são falhas legítimas, sem 504, não duplicatas).

**Correção RECOMENDADA (PENDENTE — dono escolheu "só auditar, decidir depois" em 2026-06-23):**
1. Falha ambígua (5xx/timeout) → NÃO reenviar automático; marcar `envio-incerto` + alerta Telegram p/ verificação manual no painel. (essencial)
2. Disjuntor: 3+ falhas 5xx em 5min → pausar envios automaticamente + alerta; pedidos pagos ficam na fila (PROCESSANDO) até o painel voltar. (blinda contra quedas)
3. Timeout explícito no `smmRequest`. (essencial)

Arquivos a mexer quando for implementar: `lib/smm-panel.ts`, `lib/processar-pagamento.ts`, `app/api/cron/retry-erros/route.ts` — nos 3 sites. Ver [[reference_tickets_regras]] (mesma sessão).
