---
name: exclusividade-conta-reservado
description: A exclusividade de pauta precisa contar o estado reservado, senao dois portais publicam o mesmo fato
metadata:
  type: project
---

A checagem de exclusividade em `schedule.escolher_fato` tem de olhar a agenda em
**`reservado` E `gerado`**:

    "SELECT 1 FROM agenda WHERE fato_guid=%s AND estado IN ('reservado','gerado')"

`reservado` e o estado logo apos a escolha, ANTES da geracao. Olhando so
`gerado`, dois portais que escolhem na mesma rodada nao se enxergam, cada um
reserva o seu slot e os dois geram e publicam o mesmo fato.

Aconteceu em 29/08/2026: agoranoticias e jornalexpresso publicaram a mesma Copa
Supervolei, mesmo `fato_guid`, com a exclusividade ligada. O comentario no
codigo ja dizia "conta o PUBLICADO e tambem o RESERVADO", mas o SQL olhava so
`gerado` — comentario e codigo divergiam.

**Why:** com 60 portais dividindo assunto, isso se repetiria toda semana, e duas
paginas da rede com a mesma noticia no mesmo dia e exatamente o padrao de
content farm que a rede evita.

**How to apply:** ao mexer em selecao de pauta, conferir que o estado
intermediario entra na conta. E, ao achar comentario que descreve algo que o
codigo nao faz, confiar no codigo e corrigir um dos dois. Ver tambem
[[fome-invisivel-no-motor]] e [[receptor-cacheia-render]].
