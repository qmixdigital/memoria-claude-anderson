---
name: project_vip_tiers
description: "Programa VIP de descontos (ConfigVip) padronizado nos 3 sites em 2026-06-17 — Bronze 3/3%, Silver 5/5%, Gold 10/10%"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
---

Programa VIP (desconto por recorrência) — tabela `ConfigVip`, lógica em `lib/vip.ts`. Cliente acumula pedidos **status CONCLUIDO** e desbloqueia o tier mais alto cujo `minPedidos` ele atinge; o % é aplicado **automaticamente no checkout** (lido ao vivo do banco, SEM cache e SEM deploy — UPDATE no ConfigVip vale na hora). Email `anonimo@` nunca recebe.

**Escada padronizada nos 3 sites (decisão do dono 2026-06-17 — objetivo: FIDELIZAR):**
- 🥉 Bronze: minPedidos **3** → **3%**
- 🥈 Silver: minPedidos **5** → **5%**
- 🥇 Gold: minPedidos **10** → **10%**

Correções aplicadas nessa data:
- enjai: Bronze tinha minPedidos=5 (sobrepunha Silver=5, gerava 3% ou 5% imprevisível p/ 5-9 pedidos) → mudado p/ 3.
- portuga: Gold dava 8% → subido p/ 10%.
- skipark: `ConfigVip` estava **VAZIA** (sistema no ar mas dormente) → inseridos os 3 tiers (ids cvip-bronze/silver/gold). DB skipark é Postgres nativo (ver [[reference_deploy_skipark]]); enjai/portuga são docker (ver [[project_migracao_enjai_srv1166087]]).

**Beneficiários no momento do ajuste:** enjai 386 (46 Gold/100 Silver/240 Bronze), portuga 5, skipark 11.

**Nota raw SQL:** `atualizadoEm` é `@updatedAt` do Prisma (sem default no DB) — em INSERT/UPDATE manual, setar `"atualizadoEm"=now()` explicitamente.

**Exposição ao cliente — IMPLEMENTADO 2026-06-17 (nos 3 sites):** o VIP só aparece **APÓS o pagamento** (decisão do dono: não expor antes, senão concorrente copia — ele para no checkout). Surfaces:
- **Tela do pedido** (`pedido/[id]`): bloco VIP renderizado quando `status` ∈ {PAGO,PROCESSANDO,EM_ANDAMENTO,CONCLUIDO}. Componente `components/loja/VipBloco.tsx` (estilo inline, idêntico nos 3 sites). Inclusive p/ anônimo (mostra convite a usar e-mail).
- **E-mails** "Pagamento confirmado" (com economia do pedido) e "Entrega concluída" (tier + progresso) — `lib/email.ts`.
- **Página `/vip`** (`app/(loja)/vip/page.tsx`): explica tiers lendo `ConfigVip`. **noindex + fora de menu/rodapé/sitemap** — só acessível pelo link nos pontos pós-pagamento.

Lógica central: `montarMensagemVip()` + `vipBlocoEmailHtml()` em `lib/vip.ts` (3 tipos: "vip"=já é, "quase"=perto, "convite"=anônimo/sem tier). Economia calculada na hora (bruto dos itens − valorTotal) — **sem mudança de schema** (fugindo do bloqueio Node 18/Prisma). Rollout: `lib/vip.ts` + VipBloco + `/vip` são idênticos (copiados); `email.ts`/`pedido page.tsx`/`PedidoPix.tsx` diferem por marca/design → patch via `d:\tmp\patch-vip.py` (modos page/pedidopix/email, validado no enjai HEAD). Nota: portuga/skipark importam PedidoPix com `nextDynamic ssr:false` (bloco não aparece no SSR/curl, só no browser); enjai é SSR direto.

**Comunicação refinada — IMPLEMENTADO 2026-06-17 (nos 3 sites, aprovado por testes p/ anderson.gna@gmail.com):**
- **E-mail "Você subiu de nível 🎉"**: `verificarSubiuDeNivel(emailCliente)` + `enviarEmailSubiuDeNivel()` em `lib/email.ts`. Gatilho: chamado logo após `enviarEmailEntregaConcluida` nos 3 pontos onde o pedido vira CONCLUIDO — `app/api/cron/check-smm-status`, `app/api/admin/pedidos/[id]/verificar-smm`, `app/api/admin/pedidos/sincronizar-smm`. Detecção de cruzamento de tier SEM tabela de controle: dispara quando `count(CONCLUIDO) === tier.minPedidos` exato (cada conclusão = +1, então match exato = 1 e-mail por tier). Evita mudança de schema (bloqueio Node 18/Prisma).
- **Badge + progresso no painel "Meus pedidos"** (`app/(loja)/meus-pedidos/[token]/page.tsx`): o badge do tier já existia; adicionou-se linha "Faltam N pedidos para [próximo] (X% off)" e um card "quase VIP" para quem ainda não tem tier. Usa `prisma.configVip` p/ achar o próximo tier.

Rollout: arquivos diferem por marca/design → patch via `d:\tmp\patch-vip2.py` (modos email/checksmm/verificar/sincronizar/meuspedidos), validado no enjai HEAD. checksmm/verificar/sincronizar idênticos entre sites; email e meus-pedidos diferem só em marca/classes (anchors neutros).

Admin gerencia tiers em `/admin/vip`.

**Relatório de retenção VIP no Telegram — IMPLEMENTADO 2026-06-17 (nos 3 sites):**
- Cron `app/api/cron/relatorio-vip/route.ts` (GET, auth `CRON_SECRET`). Arquivo IDÊNTICO nos 3 (sem marca) — copiado. Usa `enviarAlerta({ categoria: "resumo-diario" })` (📊) de `lib/telegram-notifier.ts`, vai pro `TELEGRAM_ADMIN_CHAT_IDS` de cada site.
- Métricas (últimas 24h): recompra VIP (clientes com tier que compraram), nº pedidos+receita, subiram de nível no período, receita VIP vs total (%), TOP clientes que voltaram (e-mail+tier+valor), base VIP atual por tier. Tudo dos pedidos, sem schema novo.
- **Frequência DIÁRIA** (escolha do dono), com e-mails dos top clientes. Crontab: enjai 08:00 / portuga 08:05 (srv1166087), skipark 08:10 (opengravity) — linhas com `relatorio-vip` no `crontab -l`.
- Teste real ao disparar manualmente: enjai 18 recompras/R$168/7 subiram; portuga e skipark 1 cada.

**Emoji do tier nos alertas Telegram — IMPLEMENTADO 2026-06-17 (nos 3 sites):** `enviarAlerta` (lib/telegram-notifier.ts) ganhou param opcional `emailCliente`; se o cliente tem tier, prefixa o emoji (🥉🥈🏆) à ESQUERDA da mensagem (antes do emoji da categoria). Cliente sem tier → sem símbolo. Função `emojiTierVip(email)` em lib/vip.ts (reusa obterDescontoVip, best-effort, nunca lança). Aplicado nos alertas com cliente: pedido-pago (processar-pagamento), novo ticket + resposta ticket (suporte/route+responder), novo afiliado pendente (afiliado/cadastro), pendência aberta (abrir-pendencia), pedido preso (check-smm-status), item cancelado (sincronizar-smm), retry-erros, pendencia.ts. Objetivo: equipe identifica cliente recorrente de cara e prioriza atendimento. Testado ao vivo no enjai (ticket de cliente Gold → 🏆). Patches: `d:\tmp\patch-notifier.py` (notifier; skipark precisou edit manual por causa do prefixo `[SkiPark]`) e `d:\tmp\patch-vip-alertas.py` (9 call-sites, idempotente).

**Possíveis próximos passos a combinar (sugeridos, aguardando dono):** (1) emoji do tier no PAINEL ADMIN (lista de pedidos + lista de tickets) — interno, alta utilidade; (2) lado do cliente: recomendei NÃO adicionar mais (já coberto + discreto p/ não expor ao concorrente); opcional um emojizinho do tier ao lado do nº do pedido na tela de acompanhamento. Outros: cupom de boas-vindas, comparativo semana-a-semana no relatório.
