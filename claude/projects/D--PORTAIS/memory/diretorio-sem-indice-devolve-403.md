---
name: diretorio-sem-indice-devolve-403
description: "`/categoria/` e `/autor/` devolviam 403 em vez de 404; e tirar o `$uri/` do try_files cria URL duplicada"
metadata:
  node_type: memory
  type: project
---

O `try_files $uri $uri/ $uri/index.html @motor` da rede testa `$uri/`. Quando o
caminho é diretório **sem** `index.html`, o nginx tenta listar, a listagem está
desligada, e sai **403**. Acontece em `/categoria/`, `/autor/`, `/img/` e, em
portal com `categoryBase`, em **`/<editoria>/`**, que é onde moram os artigos.

403 é pior que 404: o Google trata como acesso negado e continua tentando, em vez
de tirar do índice.

⚠️ **Tirar o `$uri/` do `try_files` não serve.** Foi o que tentei primeiro: sem
ele o endereço **sem barra final** passa a responder 200 em vez de 301, e cada
página do portal ganha uma URL duplicada. Medido no ebookcult antes de desfazer.

O conserto sem efeito colateral é uma linha, mantendo o `$uri/`:

```nginx
error_page 403 =404 /404.html;
error_page 404 /404.html;
```

**Aplicado em 22/08/2026 nos 19 vhosts da opengravity.** Falta conferir a
clinicas-vps, onde **34 portais têm `categoryBase`**, e a hostinger, onde nenhum
tem.

⚠️ **Sem comentário na mesma linha** ao editar esses vhosts: o bloco
`location / { ... }` é uma linha só, e um `#` ali engole a chave de fechamento. O
nginx recusa com *"named location can be on the server level only"*, que parece
outro problema.

Em portal com `categoryBase`, `/<editoria>/` merece **301 para
`/categoria/<editoria>/`**, e não 404: na origem ela respondia 200 e o canonical
dela já apontava para lá. Ver [[conversao-exige-redirects]].
