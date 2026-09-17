---
name: reference_tickets_regras
description: Regras de abertura de ticket de suporte (enjai/portuga/skipark) — exige pedido válido + anti-duplicata por pedido
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-07-20T22:39:58.489Z
---

**Abertura de ticket de suporte** (`app/api/suporte/route.ts` + form `app/(loja)/suporte/TicketForm.tsx` + `app/api/suporte/validar-pedido/route.ts`) — regras implementadas 2026-06-22 nos 3 sites (motivo: ~17% dos tickets eram duplicados do mesmo cliente/dia; `matheusmarotta187` abriu 10 num dia só):

1. **Exige número de pedido VÁLIDO.** Sem pedido ou pedido inexistente → 400. Removido o checkbox "Não tenho pedido ainda" do form. Dúvidas pré-compra → WhatsApp.
2. **Anti-duplicata por pedido:** se já existe QUALQUER ticket `ABERTO`/`EM_ANDAMENTO` para o mesmo `pedidoId` (sem janela de tempo — enquanto aberto é a conversa ativa), a mensagem é ANEXADA ao ticket existente (`prisma.ticketMensagem.create`) + alerta Telegram "Nova mensagem no chamado #X" (com emoji VIP). Retorna `{ok:true, numero, anexado:true}`. Não cria novo.
3. **Pedido ANÔNIMO valida só pelo número:** `validar-pedido` aceita qualquer e-mail válido quando `emailCliente` do pedido começa com `anonimo@` (cliente anônimo não sabe que o e-mail é anonimo@). Pedido identificado exige e-mail = e-mail da compra.
4. **Validação de formato de e-mail** no form/route (regex leve).
5. **Case do número:** o número é exibido em MAIÚSCULAS (`id.slice(-6).toUpperCase()`); a busca usa `lowercase` + `endsWith mode:insensitive` (senão "Pedido não encontrado" para o número que o cliente recebe). Bug que peguei em teste.

Tickets `anonimo@` no banco (29) são pendências GERADAS PELO SISTEMA (abrir-pendencia, categoria "Link incorreto"), não do form. Verificado end-to-end no enjai (6 testes).

**Bolinha de leitura na lista admin (`/admin/tickets`), 2026-07-20, nos 3 sites:** campo `Ticket.lidoAdmin Boolean @default(false)`. 🔴 = não lido / 🟢 = lido. Escrita: admin abre o detalhe (`app/admin/tickets/[id]/page.tsx`) → `lidoAdmin=true`; cliente responde (`app/api/suporte/responder`) → `false`; admin responde (`app/api/admin/tickets/[id]/route.ts` + `app/api/webhook/telegram/route.ts`) → `true`. Bolinha renderizada na lista (`app/admin/tickets/page.tsx`, card mobile + tabela desktop), independente do selo "Aguardando" (=`ultimaMsgPorCliente`, "precisa responder"). Backfill inicial: todos os existentes → lido (não havia pendentes). Aplicar schema Prisma: ver [[feedback_deploy_prisma_generate]] (enjai/portuga) e [[reference_deploy_skipark]] (skipark Node 22 gera na VPS).
