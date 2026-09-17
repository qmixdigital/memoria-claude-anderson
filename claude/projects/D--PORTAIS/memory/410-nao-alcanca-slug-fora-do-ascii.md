---
name: 410-nao-alcanca-slug-fora-do-ascii
description: a regra casa [a-z0-9-], e o nginx compara o URI já decodificado; slug com acento cai em 404
metadata:
  node_type: memory
  type: project
---

O bloco de 410 dos slugs podados é gerado como
`location ~ "^/(?:[a-z0-9-]+/)?(slug1|slug2|...)/?$"`. Slug com caractere fora do
ASCII não casa e **cai em 404** em vez de 410. Os dois deindexam, mas o 410 sai
muito mais rápido do índice.

A correção tem uma armadilha dentro: **o nginx casa o URI já decodificado**.
Escrever `location = /insights/moana-...auli%CA%BBi-.../` nunca casa. O caminho
vai com o caractere **literal**, em UTF-8, direto no arquivo de configuração:

```nginx
location = /insights/moana-saber-quem-sou-auliʻi-cravalho-e-a-jornada-de-descoberta/ { return 410; }
```

⚠️ **Filtrar antes o que tem caminho vazio.** Ao gerar essas regras
automaticamente, quatro registros do revistadeducao tinham caminho `/` e viraram
`location = / { return 410; }`, que derrubaria a home inteira. O `nginx -t`
barrou antes do reload, mas só por sorte de ordem: rodar `nginx -t` **antes** de
qualquer `reload`, sempre.

São poucos por portal, dois em 2.716 no revistadeducao, e por isso passam
despercebidos numa amostra. Ver [[cifrao-escapado-no-regex-do-nginx]] e
[[slug-podado-que-o-motor-regenera]].
