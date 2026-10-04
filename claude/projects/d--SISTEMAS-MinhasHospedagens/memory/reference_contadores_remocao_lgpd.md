---
name: reference-contadores-remocao-lgpd
description: Diretorio de contadores (contadores.revistadeducao.com.br) - onde roda e como atender pedido de remocao de dados do titular
metadata:
  type: reference
---

**Onde roda:** app Next em `/var/www/contadores` na **srv1166087** (PM2 `contadores`, porta 3210; `contadores-b` na 3211 fica parada fora de deploy). Banco Postgres local `contadores`. O dominio entra pelo **opengravity**, em `/etc/nginx/conf.d/app-contadores.revistadeducao.com.br.conf`, que faz proxy pelo upstream `revista_dir_backend` (31.97.173.40:3210/3211). Build com `bun` em `/root/.bun/bin` (nao esta no PATH do SSH nao interativo).

**A politica original era so noindex.** Pedido de remocao marcava `removalRequested` e a ficha continuava respondendo 200, com telefone e endereco na tela, "para nao quebrar link externo". Para quem pede remocao por exposicao de dado pessoal, isso nao resolve nada.

**Mudanca de 26/09/2026:** campos `isRemoved` e `removedAt` em `acc_offices` (migration `20260926200128_remocao_efetiva`). Atender um pedido de remocao no painel passa a apagar telefone, endereco, CEP, bairro, whatsapp, site, descricao, hash de e-mail e socios, marcar `isRemoved` e derrubar reivindicacao pendente. A ficha responde 404 e o importador da Receita **pula o CNPJ** (por isso a linha nao e deletada: e ela que bloqueia a reinsercao).

**Armadilha do cache:** limpar o banco nao tira o dado do ar. A ficha e ISR com `stale-while-revalidate` de um ano, e o processo guarda copia **em memoria**; apagar `.next/server/app/escritorio/<slug>.{html,rsc,meta,segments}` nao basta enquanto o processo nao reinicia. Contencao imediata, sem deploy: `location = /escritorio/<slug>/ { return 410; }` no vhost do opengravity (410, nao 404: diz ao Google que saiu de proposito). Tirar essa regra depois que o app for reconstruido.

**Atender por SQL (28/09/2026, Beltrame e Carla & Co):** SSH e `hostinger-vps-srv1166087` (nao ha alias `srv1166087`). Mesmo efeito do botao do painel: UPDATE em `acc_offices` (isRemoved, removedAt, isIndexable=false, phones='{}', street/number/complement/zip/whatsapp/website/description/emailHash NULL; eu zerei tambem `neighborhoodRaw`, que o codigo do painel NAO zera), `DELETE FROM acc_partners` (o painel tambem nao apaga socios, apesar do texto acima), claims PENDENTE -> RECUSADO e `acc_removal_requests` -> ATENDIDO. Depois 410 no vhost do opengravity (backup em /root/app-contadores.conf.bak-20260928). CF nao cacheia a ficha (DYNAMIC), sem purge. Pedido tipo "correcao" dizendo "nao e escritorio de contabilidade" = remocao: entram por CNAE secundario 6920601.

## Estado em 03/10/2026

O build com a remoção efetiva (`isRemoved`) está no ar desde 01/10/2026 14:15 (feito em outra sessão; backup `/root/backups-contadores/src-20261001.tgz`). O app responde 404 direto na porta 3210 para ficha removida e já há 6 escritórios com `isRemoved = true`. Não há fonte mais novo que o build, então não existe deploy pendente.

O vhost na opengravity passou a ter um par de `location = ... { return 410; }` para cada um dos 6 removidos (última edição 02/10). Como as regras foram acrescentadas DEPOIS do deploy, o 410 no nginx virou o padrão em uso para ficha removida e não é mais resíduo provisório: não apagar sem ordem. 410 também desindexa mais rápido que 404.
