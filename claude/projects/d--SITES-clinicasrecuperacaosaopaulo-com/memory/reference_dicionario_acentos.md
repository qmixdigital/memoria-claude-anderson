---
name: reference-dicionario-acentos
description: Dicionario de reacentuacao/siglas compartilhado pelos dois diretorios, precisa ser sincronizado a mao entre os dois repos
metadata:
  type: reference
---

CNES e Receita entregam nome, logradouro e bairro em CAIXA ALTA e SEM ACENTO.
O dicionario que conserta isso vive em dois lugares e **nao ha sincronizacao
automatica entre eles**:

- `d:/GitHub/casasderecuperacao/scripts/ingest/acentos.mjs` (fonte)
- `d:/SITES/clinicasrecuperacaosaopaulo.com/scripts/acentos.mjs` (copia)

Ao editar um, copiar para o outro e transferir para a VPS em
`/var/www/casasderecuperacao/scripts/ingest/` e
`/var/www/clinicasrecuperacaosaopaulo/scripts/`.

**Why:** os dois sites consomem as mesmas bases publicas e sofrem do mesmo
defeito; corrigir so um deixa o outro com portugues quebrado em H1, title e
meta.

**How to apply:** a reacentuacao no casas ja e reaplicada sozinha pelo
`30-merge.mjs` depois do TRUNCATE. No clinicas nao ha esse gancho: se algum dia
entrar ingestao em massa la, replicar o passe. Regra que ja custou erro: "ç"
nunca segue consoante, entao `Falcao` e Falcão e nao "Falção". Ver
[[project_casasderecuperacao_nacional]] e [[project_diretorio_clinicas]].
