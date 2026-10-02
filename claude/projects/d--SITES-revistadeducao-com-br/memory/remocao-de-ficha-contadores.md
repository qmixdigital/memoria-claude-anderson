---
name: remocao-de-ficha-contadores
description: "Como atender pedido de remoção de escritório no diretório contadores.revistadeducao.com.br (banco + 410 no nginx), e por que o botão do painel sozinho não basta"
metadata:
  node_type: memory
  type: project
  originSessionId: b2a20eb4-c78a-40f5-832b-8a612d94d23a
  modified: 2026-10-01T12:49:12.853Z
---

**Atualização de 01/10/2026:** build novo no ar (inclui `isRemoved` e o bloco "Sobre o escritório" da ficha, que mostra `description`, `openingHours`, `website` e botão de WhatsApp). O botão "Atender" do painel agora derruba a ficha sozinho (404); as regras 410 do nginx viraram reforço opcional. O que segue abaixo sobre "build anterior" e "lacuna conhecida" é histórico. Deploy: `DIST_DIR=.next-novo bun run build` em `/var/www/contadores`, depois `/root/troca-contadores.sh` (troca por `mv`, sobe o `-b`, recarrega o principal, para o `-b`). Não usar `pkill -f "next start -p 3219"` dentro de um `ssh '...'`: o padrão casa com o próprio shell e mata a sessão. Cópia local em `app/` sincronizada com a VPS nesta data.

Pedido de remoção no diretório de contadores se atende em DOIS lugares, porque o build no ar (srv1166087 `/var/www/contadores/.next`, de 18/09/2026) é anterior ao código de "remoção efetiva" (`isRemoved`, escrito em 26/09/2026 e ainda não buildado). O app em execução continua servindo a ficha do cache ISR mesmo com `isRemoved=true`.

1. Banco (psql com a `DATABASE_URL` do `.env` na VPS `hostinger-vps-srv1166087`): em `acc_offices` marcar `isRemoved`, `removedAt`, `removalRequested`, `isIndexable=false` e zerar telefone, endereço, bairro, site, WhatsApp, descrição, `emailHash`; apagar `acc_partners` e `acc_office_specialties` do escritório; marcar os `acc_removal_requests` como `ATENDIDO`. A linha fica como lápide (razão social + CNPJ) para a carga da Receita pular o CNPJ.
2. Nginx na opengravity, `/etc/nginx/conf.d/app-contadores.revistadeducao.com.br.conf`: duas linhas `location = /escritorio/SLUG/ { return 410; }` (com e sem barra), `nginx -t` e reload.

**Why:** só `removalRequested` (o que o formulário público faz) deixa a ficha em 200 com sócios e telefone visíveis. Atendido assim em 26/09, 28/09 e 01/10/2026 (Handell, CNPJ 13791192000143).

**How to apply:** repetir os dois passos a cada pedido até o app ser reconstruído; depois do build novo as regras 410 podem sair. A cópia local em `d:\SITES\revistadeducao.com.br\app` está defasada em relação à VPS (sincronizada só em 18/09): ler o código na VPS. Em 01/10/2026 o `scripts/ingest/classifica.ts` da VPS passou a pular `isRemoved` ao recriar sócios; antes disso a carga devolvia os sócios de ficha removida.

**Correção de endereço (mesma fila, tipo `correcao`):** atualizar `acc_offices` e gravar uma linha por campo em `acc_office_edits` com status `APLICADO`; desde 01/10/2026 o `scripts/ingest/importa.ts` da VPS preserva o grupo de endereço de quem tem edição de `street`/`number`/`complement`/`zip`, senão a carga da Receita devolve o endereço antigo. A ficha fica em cache ISR de 24h em memória: apagar os arquivos em `.next/server/app/escritorio/SLUG.*` não basta, é preciso rolar o processo (subir `contadores-b`, `pm2 reload contadores`, parar o `-b`).

**Lacuna conhecida:** a ficha pública não renderiza `website`, `whatsapp`, `openingHours` nem `description` (o painel do escritório grava, a página não mostra). Em 01/10/2026 só a Consultare (id 23790) tinha esses campos preenchidos.
