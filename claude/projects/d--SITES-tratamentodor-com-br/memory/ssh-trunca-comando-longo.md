---
name: ssh-trunca-comando-longo
description: "enviar conteúdo por `echo base64 | base64 -d` sobre SSH trunca em silêncio com exit code 0; usar scp"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-26T23:12:47.759Z
---

Mandar arquivo para o servidor com `ssh host "echo <base64> | base64 -d > arquivo"`
falha em silêncio quando o conteúdo passa de alguns KB: o SSH entrega a linha de
comando cortada, o **código de saída é 0** e nenhum arquivo aparece do outro lado.
Um corpo de 12 KB vira uma linha de 16 KB e some.

**Why:** o erro só aparece bem depois, no consumidor do arquivo. No
tratamentodor foi o `wp post create` dizendo "Unable to read content from", o que
aponta para permissão ou caminho, não para transferência. Custou duas rodadas de
diagnóstico no lugar errado.

**How to apply:** usar `scp` para qualquer conteúdo que não caiba confortavelmente
numa linha de comando. Só usar `echo | base64 -d` para valor curto, e ainda assim
conferir a existência do arquivo depois, nunca confiar no exit code.

Vale também: `/tmp` não serve para arquivo que o wp-cli vá ler na Hostinger, o
`open_basedir` do PHP barra. O destino tem de ficar dentro de
`wp-content/uploads/`. Relacionado a [[validar-js-antes-de-publicar]].
