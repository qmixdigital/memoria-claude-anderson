---
name: reference-poda-isr-pasta-errada
description: A poda de cache ISR do geladeirastop vigiava a pasta errada e nunca disparou; onde o cache realmente mora e como remove-lo
metadata:
  type: reference
---

O cache ISR do Next **nao fica em `.next/cache`**. Fica em
`.next/server/app/<rota>/`. Confundir os dois deixou o geladeirastop com 16 GB
de cache e o disco do opengravity em 88%, com a poda automatica rodando todo
domingo sem fazer nada: ela media `.next/cache` (56 MB) contra um teto de 6 GB.

**Como distinguir cache de build dentro de `.next/server/app`:** o build sao os
`.js` e `.json` (4 MB no caso); o cache sao `.html`, `.rsc`, `.meta` e as pastas
`base.segments/`. Prova objetiva: comparar com o `BUILD_ID`. Nenhum `.js` era
mais novo que ele, e 48.342 `.html` eram.

**Cada ficha tem QUATRO coisas, nao tres:** `base.html`, `base.meta`,
`base.rsc` e o **diretorio** `base.segments/` com ~9 arquivos `.segment.rsc`. E
dai que vinham 435 mil `.rsc` para 48 mil `.html`. Apagar so o trio com `rm -f`
deixa o grosso do espaco para tras: tem que ser `rm -rf` incluindo o
`.segments`.

**Remover em lote, nunca em laco.** Um `rm` por arquivo levou quase uma hora e
foi interrompido; o mesmo trabalho com `awk` gerando lista separada por NUL e
`xargs -0 rm -rf` levou **64 segundos** (32.991 fichas, 15 GB para 4,3 GB).

**Medir o peso da ficha em vez de chutar:** dividir o tamanho do diretorio pela
soma dos `.html` deu 2,91x; o chute era 2,4. O script calcula isso em tempo de
execucao, entao continua certo se o formato do Next mudar.

**Podar por TAMANHO, nunca por idade** (mesma conclusao de
[[reference_clinicas_vps_disco_isr]]): com `revalidate` curto e Googlebot
reciclando, nenhum arquivo envelhece.

**Cadencia:** o diretorio crescia ~1,7 GB/dia, entao semanal nao serve; passou
para diaria as 04:20. Script em
`D:\SISTEMAS\MinhasHospedagens\scripts\geladeirastop-prune-isr.sh`.

**Armadilha de operacao:** `pkill -f "nome-do-script"` por SSH mata a propria
sessao, porque o comando remoto contem esse texto na linha de comando. Usar
`pgrep -f "nome-do-scrip[t]"` para nao casar consigo mesmo.

Regra que ficou: uma poda automatica que **nunca removeu nada** nao esta
funcionando, esta apontando para o lugar errado. Conferir o log, nao a
existencia do cron. Na clinicas-vps as duas regras do radarvolt apontavam para
`radarvolt.dominioprovisorio.net.br` enquanto o app vivo roda de
`radarvolt.com.br` - mesmo tipo de erro, corrigido junto.
