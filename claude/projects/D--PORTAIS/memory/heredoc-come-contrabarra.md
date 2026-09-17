---
name: heredoc-come-contrabarra
description: "Patch com expressão regular enviado por heredoc através de SSH perde as contrabarras e diz 'não achei o trecho'"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:47:41.172Z
---

Patch em JavaScript que casa uma expressão regular não sobrevive ao heredoc
através de SSH: escrito `\\/`, chega como `\/`, o texto não casa e o script diz
"não achei o trecho", que parece um problema completamente diferente do que é.

**Why:** perdi três rodadas em 21/08/2026 achando que o `render.js` das três
máquinas divergia, quando o que divergia era o meu próprio arquivo depois do
transporte.

**How to apply:** duas defesas, e vale usar as duas.

1. **Transportar por base64**, nunca por heredoc, quando o conteúdo tem
   contrabarra: `base64 -w0 patch.py > p.b64` local, `ssh HOST "cat > /tmp/p.b64"`,
   `base64 -d` no destino.
2. **Ancorar numa linha sem contrabarra.** No caso, a linha de abertura
   `if (/^<h[1-6]/.test(t)) inH++;` não tem nenhuma; a de fechamento tem. Ancorar
   na de abertura e inserir depois da linha seguinte resolveu.

E montar a contrabarra em tempo de execução, com `B = chr(92)`, em vez de
escrevê-la literal no texto que vai ser transportado.

Ver [[arch-local-e-fonte-unica]] e [[plataforma-antonio-acesso]].
