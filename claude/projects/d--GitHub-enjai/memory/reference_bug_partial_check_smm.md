---
name: reference_bug_partial_check_smm
description: Bug corrigido 2026-09-21: cron check-smm-status não tratava "partial" como final → pedidos pagos presos em PROCESSANDO pra sempre (tickets "recebimento incompleto"). Também: OpenPix caiu ~4min e não há gateway de fallback (MP desabilitado).
metadata:
  type: reference
---

**Sintoma (reclamação do Anderson 2026-09-21, enjai):** clientes reclamando de "erro de recebimento". Investigação no banco mostrou 3 coisas distintas.

**1. Bug `partial` (corrigido nos 4 sites 2026-09-21):** em `app/api/cron/check-smm-status/route.ts`, `statusFinais = ["completed","canceled","erro","refunded"]` NÃO incluía `"partial"` (painel SMM entregou só parte e parou = estado terminal). Resultado: 6 pedidos pagos (R$ 313,42, um de R$ 199,50) ficaram em PROCESSANDO por semanas, sem fechar, sem alerta, sem reembolso → tickets "Entrega parcial"/"Recebimento incompleto". **Fix:** `"partial"` entrou em statusFinais; `temParcial = some(smmStatus==="partial")`; o ramo que marca **ERRO** passou a `(todosCanceladosOuErro || temParcial)`; alerta Telegram ganhou título "ENTREGA PARCIAL no painel: verificar reembolso" e corpo distinto. **Seguro contra entrega dupla:** `retry-erros` só reenvia itens SEM `smmOrderId` (trava linha ~98); itens partial já têm smmOrderId → nunca reenviados. Marcar ERRO também evita o e-mail "entrega concluída" e o fluxo pós-entrega (que exigem CONCLUIDO). Ação humana após o alerta: reembolsar a diferença (valor ∝ smmRemains/quantidade) ou reenviar manualmente. O `sincronizar-smm` (admin) já tratava partial como finalizado; só o cron estava errado.

**2. Queda do PIX (transitória):** ~16:11–16:15 UTC de 21/09 o OpenPix devolveu `500` na criação de cobrança; `[checkout] Erro ao criar cobrança PIX (ambos gateways)`. Uma cliente tentou 17× → 17 pedidos ERRO **sem pagamento** (ninguém cobrado, só venda perdida). Às 17:00 já criava PIX de novo; teste direto na API (GET /api/v1/charge com OPENPIX_APP_ID) = 200. **Lacuna estrutural:** ordem de gateway é Mercado Pago > PagBank > OpenPix, mas `MERCADOPAGO_HABILITADO=false` (token existe) e sem PAGBANK_TOKEN → **na prática não há fallback**; qualquer soluço do OpenPix derruba o checkout. Decisão de habilitar MP é do Anderson (gateway/taxas) — recomendado, pendente.

**3. Pedidos pagos cancelados pelo painel** (ERRO com pagoEm, itens com smmOrderId "canceled"): retry-erros não reenvia (têm smmOrderId) → precisam ação manual (reembolso ou reenvio). Ex: tororopereira R$ 5,98 (cmtuxyo41...), mariaeduarda R$ 0,95 (cmu1hwdld...). Pedidos "in progress"/"active" no painel por semanas (14547 desde 29/08, 14595/14603 desde 31/08) = painel travado, checar manualmente no painel SMM.

Ver [[project_smm_duplicacao_504]] (outro bug de painel, pendente) e [[project_fluxos_email]].

**Verificado 2026-09-21 17:10 UTC:** fix no ar nos 4 sites; o cron fechou os 6 pedidos partial (viraram ERRO na 1ª execução após o deploy). **Anderson decidiu NÃO habilitar o Mercado Pago** (MP segue desligado; OpenPix continua gateway único, sem fallback). Ruído conhecido: `reconciliar-pix` erra "OpenPix error: 500" a cada 15 min para 2 pedidos CANCELADO da janela da queda (cobrança nunca foi criada no OpenPix); só log, sem efeito no cliente.
