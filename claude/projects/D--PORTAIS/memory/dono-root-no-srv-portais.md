---
name: dono-root-no-srv-portais
description: "Arquivo root em public/ não trava o motor por causa do writeAtomic; diretório root trava, e é esse que precisa ser caçado"
metadata:
  node_type: memory
  type: project
---

O motor roda como `portais` e grava com `writeAtomic`: escreve um `.tmp` na mesma
pasta e faz `rename` por cima. O `rename` depende da permissão **do diretório**,
não do arquivo. Então:

- **Arquivo root em `public/`**: inofensivo. O motor sobrescreve na boa e a posse
  volta para `portais` sozinha.
- **Diretório root em `public/`**: trava. O `.tmp` não pode ser criado e o rebuild
  daquele artigo estoura EACCES.

Em 28/08/2026 havia 574 arquivos root na opengravity (saudeacessivel e
viajenodetalhe) e 1.044 na clinicas-vps, mas **um único diretório root**, em
`saudeacessivel/public/dicas/cirurgia-de-dbs-com-sensing-technology`. Só ele era
risco. A conta de arquivos assusta e não quer dizer nada; a busca que importa é:

```bash
find /srv/portais/*/public /srv/portais/*/data -type d -not -user portais
```

A sujeira `*.json.bak-vejatb` com dono root em 39 portais é backup de um patch do
bloco "Veja também" rodado como root em 27/08. Não atrapalha: o motor lê
`data/*.json` e a extensão não casa.

Ver [[motor-serve-da-memoria]] e [[apagar-pasta-pelo-caminho-do-motor]].
