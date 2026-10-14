---
name: feedback-indexacao-so-com-ordem
description: Apex só com ordem expressa; desde 12/10/2026 lançar a URL no pedido NÃO envia mais sozinho (lupa para conferir, botão manual)
metadata:
  type: feedback
---

Nunca enviar ao Apex por conta própria, nem ao lançar link publicado.

**Mudança de 12/10/2026:** lançar a URL na entrega do pedido (admin) e adicionar entrega com URL
deixaram de enviar ao Apex. Na linha da URL há a lupa "Indexada?" (confere no Google via Serper e
atualiza os selos) e, se não estiver indexada e ainda não enviada, o botão manual "Enviar ao Apex"
(com confirmação, grava quem clicou). Código: `monitor-actions.ts` (`enviarApexManual`) e
`EntregaUrlForm.tsx`. Continuam automáticos, de propósito: `publicar-conteudo.ts` (publicação
direta no portal, aprovada em 10/09/2026) e os dois pedidos expressos (cliente em minha-conta e
reenvio pelo Telegram).

**Why:** o pedido 146 (30 URLs de portais de alta autoridade, total zero) gastaria 90 créditos sem
ordem, e portais fortes indexam rápido sozinhos.

**How to apply:** não reativar o envio automático ao lançar URL; se o pedido for do marketplace
publicado pelo sistema, o envio vem de `publicar-conteudo.ts`.
