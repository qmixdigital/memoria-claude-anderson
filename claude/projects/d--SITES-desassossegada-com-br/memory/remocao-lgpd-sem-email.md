---
name: remocao-lgpd-sem-email
description: "Pedido de remoção/LGPD do diretório colado pelo Anderson = remover direto, sem e-mail, resposta \"Deletado.\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: d8a8bbbd-3859-49d0-a35e-ea8e07ff9b81
  modified: 2026-09-29T18:34:30.719Z
---

Quando o Anderson colar um e-mail "[Desassossegada diretório] Pedido de remocao #N", ou "Erro informado" com Tipo: fechou (Correcao #N: marcar status='resolvida', resolvidaEm=now(), motivo da Blocklist 'correção: fechou'), ou pedir remoção de ficha, remover direto e responder só "Deletado." Não enviar e-mail ao titular, não sugerir resposta, não explicar LGPD.

**Why:** ele não responde esses pedidos por e-mail e não quer gastar tokens com explicação (29/09/2026).

**How to apply:** no srv1166087 (`ssh hostinger-vps-srv1166087`), psql com o DATABASE_URL de `/var/www/desassossegada-dir-shared/.env`, numa transação: `Estabelecimento` removido=true, removidoEm=now(), ativo=false, destaque=false (id da ficha + slug da referência); upsert do cnpj em `Blocklist` com motivo `LGPD/remoção #N`; `RemovalRequest` id=N processado=true. NÃO usar o botão "Processar" do admin, que manda e-mail. Conferir 410 na ficha (middleware atualiza em até 5 min).
