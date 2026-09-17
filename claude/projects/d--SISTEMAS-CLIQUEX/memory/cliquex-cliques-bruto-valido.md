---
name: cliquex-cliques-bruto-valido
description: Cliques de campanha têm bruto (todos) vs válido (humano); painel mostra válido; redirect-fed = maioria bot
metadata: 
  node_type: memory
  type: project
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-08-09T13:55:58.390Z
---

**CLIQUES: BRUTO vs VÁLIDO (cliquex.click, verificado 2026-08-09).** O Worker do edge classifica cada clique e sincroniza os dois via `/api/rotator-sync` (campos `b`=bruto, `v`=válido). Banco: `campanhas.cliquesTotal` (bruto, TODOS os hits) + `campanhas.cliquesValidos` (válido ≈ humano, passou no filtro de bot do Worker); buckets `cliques_hora_campanha.cliques`/`.validos` (mesma dupla). Fluxo: Worker conta em DO → sync 30s (alarm) → soma incremental no banco. `/whatsapp-*` é servido/contado **no Worker (edge)**, NÃO chega no Nginx da origem (log de origem fica 0 pra esses paths). Ver [[cliquex-worker-rotador]], [[cliquex-deploy]].

**Regra de leitura**: pra saber % humano de uma campanha, comparar `sum(validos)/sum(cliques)` em `cliques_hora_campanha` (janela recente, limpa de resets). Campanhas de **botão real** no site (pessoa clica) = ~100% válido. Campanha **alimentada por redirect de domínios** (ex: `whatsapp-vip`, vários domínios auto-redirecionam pra ela) = **~20% válido / ~80% bot** — todo crawler (Googlebot, preview do WhatsApp/FB, scanner) que visita os domínios segue o redirect e vira clique bruto. Por isso o painel de campanhas (`/clk/campanhas`) foi mudado (2026-08-09) pra mostrar **só válidos** (colunas/cards "Válidos") — o bruto enganava.

**Reset ("zerar" no painel)**: as actions `resetCampanha`/`resetTodasCampanhas` (em `app/clk/campanhas/actions.ts`) zeram `cliquesTotal` **E** `cliquesValidos` + apagam os buckets. **BUG corrigido 2026-08-09**: antes zerava só `cliquesTotal`, deixando `cliquesValidos` acumulado (dava válido > bruto, número gigante que parecia não ter zerado). Botões no painel: "zerar" por linha + "Zerar todos" no topo, com confirmação. É seguro zerar no banco (contagem é incremento, o DO só manda deltas novos — não re-infla).
