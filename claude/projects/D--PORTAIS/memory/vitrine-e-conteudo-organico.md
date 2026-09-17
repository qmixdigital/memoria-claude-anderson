---
name: vitrine-e-conteudo-organico
description: "homeSections para trocar box da home, e as regras de meta que o motor não resolve sozinho"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T17:04:08.347Z
---

**Vitrine da home.** `homeSections` no `sites.json` define quais editorias viram
box na home e em que ordem, independente do menu:

```json
"homeSections": ["documentos", "geral", "entretenimento", "saude"]
```

⚠️ **Nunca usar `hideCategories` para trocar a vitrine.** Ele esconde a categoria
do menu, do rodapé e da home de uma vez. Anderson pediu "substituir apenas o box"
e eu escondi tudo. `homeSections` faz o certo.

Nas seções fixas só a manchete principal fica de fora. Sem isso a editoria mais
recente sai com box vazio, porque os artigos novos já foram consumidos pelo hero,
pelo "No fio" e pelas Manchetes.

**Regras de meta que o motor não resolve sozinho** (descobertas auditando os 10
artigos do piloto, todos saíram errados na primeira publicação):

| Item | Regra | Armadilha |
|---|---|---|
| `title` | ≤ 60 chars | o motor soma `" - " + site.name`, que sozinho comia 31 chars. Patchei `artMeta` para usar `shortName` |
| `meta_description` | 150 a 160 | sem o campo `meta_description` ele usa o excerpt, que fica em 80 |
| Imagem | 1216x640 WebP Runware | **sem `image_base64` o artigo sai sem OG nenhuma** |
| Alt | descritivo pt-BR | campo `image_alt` |

**Publicar pelo endpoint público leva 403 da Cloudflare.** Usar a origem,
`http://127.0.0.1:8791` com header `Host` do domínio.

**Why:** os 10 primeiros artigos foram publicados sem imagem, com title de 95
caracteres e meta de 86. Nenhum desses erros aparece no navegador, só na
auditoria, e o Anderson percebeu a falta de imagem antes de mim.

**How to apply:** publicar e **auditar em seguida**: OG, travessões, tamanho de
title e meta, quantos crosslinks cada artigo RECEBE, FAQ schema e assinatura.

Relacionado: [[palavras-chave-e-entrega]], [[arch-u-identidade]]
