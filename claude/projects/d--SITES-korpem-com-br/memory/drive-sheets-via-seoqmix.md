---
name: drive-sheets-via-seoqmix
description: "Como ler e escrever planilhas e Docs do Drive do Anderson sem conector, pela service account seoqmix; onde fica a planilha de pauta da Körpem e o gerador do blog"
metadata:
  node_type: memory
  type: reference
  originSessionId: 15fb87de-3a06-48aa-b9f4-b559f307af56
  modified: 2026-10-08T21:16:52.951Z
---

Não há conector do Google Drive nas sessões do Claude Code. O que funciona: a service
account `seoqmix@seoqmix.iam.gserviceaccount.com` (chave em
`C:/Users/User/<<REMOVIDO>>`) tem Drive API ligada e
acesso às pastas de pauta que o Anderson compartilha. As outras três SAs
(backlinkguard, enjai, qmix-diversos) devolvem 403 "Drive API not enabled".

Uso: `AuthorizedSession` com escopo `drive` e `spreadsheets`; listar a pasta com
`files?q='<ID>' in parents`, exportar Docs com `files/<id>/export?mimeType=text/html`,
escrever na planilha pelo Sheets API (`values.update`, `batchUpdate`).

Körpem (08/10/2026): pasta `<<REMOVIDO>>`, planilha
"PALAVRAS-CHAVE" `<<REMOVIDO>>` (abas Pautas e
Orientações, formato copiado da planilha do Dr. João Lopo em
`<<REMOVIDO>>`). Os 20 artigos foram publicados em
`korpem.com.br/blog/` pelo `docs/gerar-blog.py` do repo; o Search Console do
coegoiania.com.br (SA enjai) foi a fonte das keywords.

**How to apply:** quando o Anderson mandar link de pasta do Drive, testar a SA
seoqmix antes de dizer que não há acesso. Fichas de GSC: `gsc_api.py` precisa das
variáveis BACKLINKGUARD_GOOGLE_SA / ENJAI_493011_5BC78FF8F355 / SEOQMIX_024E9465E9D9
apontando para os JSON acima (sem o cofre, `CHAVES` fica vazia e o script sai mudo).
