---
name: pasta-drive-artigos-henrique
description: Pasta MAOS no Google Drive onde chegam os artigos do Dr. Henrique; acesso pela service account seoqmix e como marcar o que já foi publicado
metadata:
  node_type: memory
  type: reference
  originSessionId: aa4615de-6c8e-4034-956a-c69050ec59e4
  modified: 2026-09-30T23:47:57.661Z
---

Pasta **MAOS** no Drive do Anderson (dono `qmixdigital@gmail.com`):
`https://drive.google.com/drive/u/0/folders/<<REMOVIDO>>`
(ID `<<REMOVIDO>>`). Ordem dele em 30/09/2026: **todos os artigos do
site do Dr. Henrique chegam sempre por aqui**, e sou eu quem acessa, publica e marca o
que já saiu.

Acesso: service account **`seoqmix@seoqmix.iam.gserviceaccount.com`**, chave
`C:/Users/User/<<REMOVIDO>>` (a mesma do Search Console; é a
única das quatro chaves com a Drive API habilitada no projeto). Escopo
`https://www.googleapis.com/auth/drive`. Tem permissão de **editor**: lê, renomeia e
edita descrição. Os artigos são Google Docs, então o texto sai por
`files/{id}/export?mimeType=text/plain` e precisa de `content.decode('utf-8-sig')`
(o `response.text` vem com mojibake).

Formato dos docs: linha 1 = título, linha 2 = linha fina, depois o corpo com subtítulos
e listas com `*`. Cerca de 2.000 a 2.400 palavras.

**Como marcar o que foi publicado:** prefixo `[PUBLICADO AAAA-MM-DD]` no nome do arquivo
e a URL no campo `description` do Drive. Fica visível para ele na lista da pasta e não
tira o arquivo do lugar. Antes de escrever qualquer coisa nova, listar a pasta e pular
o que já tem o prefixo.

Publicação no site: ver [[projeto-henriquecembranelli]] e o passo a passo do blog no
README do repo (cards em `/blog`, schema, sitemap, linkagem cruzada).
