---
name: reference_lote_instagram_drthiagocaixeta
description: Campanha de 20 guest posts (15/09/2026) para instagram.com/drthiagocaixeta na rede portal-engine; planilha própria do cliente e três armadilhas do portão que valem para qualquer lote
metadata: 
  node_type: memory
  type: reference
  originSessionId: 24525872-d57d-488b-bbad-8771305d3ba3
  modified: 2026-09-15T09:31:44.130Z
---

**Cliente:** perfil https://www.instagram.com/drthiagocaixeta/ (Dr. Thiago Caixeta, ombro, ver
[[reference_coe_dr_thiago_caixeta]]). Já tinha 14 portais linkando; em 15/09/2026 entraram mais 20.
**Fonte da verdade:** `D:/PORTAIS/BACKLINKS/instagram-drthiagocaixeta.xlsx` (34 linhas). Trabalho em
`D:/PORTAIS/BACKLINKS/drthiagocaixeta-instagram/` e plano/relatório em
`instagram-drthiagocaixeta-PLANO-20-20260915.md`. Âncora "ortopedista especialista em ombro" já
saturada (4x): nas próximas rodadas usar outras variações.

**Armadilhas do portão descobertas nesse lote (valem para qualquer guest post da rede):**

1. **Keyword com 7+ palavras não fecha os dois portões ao mesmo tempo.** `validador_materia`
   exige 3 ocorrências exatas no corpo; `auditar.py` soma H1 + dek + corpo e limita densidade a 3%.
   Com 8 palavras ("o que é bom para dor no ombro"), 3 no corpo + H1 + dek = 40 palavras-chave em
   1.200 → 3,3%. Saída: **dek sem a keyword exata** (usa sinônimo), fica 2,65%.
2. **"imagem sem alt descritivo" no modo `ar` é falso positivo** nos portais da clinicas-vps
   (ortopediacoluna, seuguiadesaude): o `<img>` do avatar do autor (alt="") vem antes da foto de
   destaque dentro do `<article>`. A foto está com alt certo.
3. **seuguiadesaude declara `schemaArticleType: "Article"` de propósito** (acervo perene, comentário
   no render.js). O auditar acusa "sem NewsArticle"; não trocar para NewsArticle por causa do lote.
4. `ssh -n` mata o stdin: script que lê o plano por `< arquivo` tem que receber o JSON por scp antes.
5. Contar links de entrada no disco: `json.load` e procurar `href="..."` no `content`; grep cru no
   arquivo não acha porque as aspas estão escapadas no JSON.

IndexNow: ortopediacoluna não tem `indexnowKey`. O i19 (dor no ombro ao dirigir) foi movido do diariodegoiania (bloqueado, removido) para https://noticiasgoias.com/dor-no-ombro-ao-dirigir/ em 15/09/2026.
