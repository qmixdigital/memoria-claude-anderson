---
name: category-base-vazio-e-category
description: category_base vazio no WordPress significa "category" em inglês, e cravar "categoria" por analogia põe a editoria toda em 404
metadata:
  node_type: memory
  type: project
---

Ao converter portal com permalink `/%category%/%postname%/`, o `categoryBase` do
motor tem que ser **exatamente** o que o WordPress usa no arquivo de editoria. E
`wp option get category_base` **devolve vazio** quando ninguém preencheu, o que
não significa "não tem": significa o **padrão do WordPress, `category`**, em
inglês.

- revistadeducao: `category_base = categoria` → `categoryBase: "categoria"`
- sabedoriaglobal: `category_base` **vazio** → `categoryBase: "category"`

Cravar `categoria` no segundo por analogia com o primeiro poria **a editoria
inteira em 404**, e não aparece em print nenhum: o menu fica bonito e só quebra no
clique.

**How to apply:** ler o campo na origem sempre, e quando vier vazio usar
`category`. No vhost, deixar também um 301 da outra forma, para o caso de algum
link antigo usar o português. Ver [[diretorio-sem-indice-devolve-403]], porque o
par `flatUrl:false` + `categoryBase` faz `/<editoria>/` virar diretório sem
índice e responder 403.
