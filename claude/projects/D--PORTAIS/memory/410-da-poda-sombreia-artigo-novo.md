---
name: 410-da-poda-sombreia-artigo-novo
description: "A lista de 410 da conversão é uma fotografia: qualquer artigo publicado depois com slug igual a um podado nasce respondendo Gone"
metadata:
  node_type: memory
  type: project
---

O `location ~ "...(slug1|slug2)/?$" { return 410; }` do `gone/<portal>.conf` ganha
do arquivo em disco: o nginx casa a regra antes de tentar servir o `index.html`.
E a lista é escrita **uma vez**, na conversão. A plataforma continua publicando
depois. Quando o slug novo coincide com um podado, a página é gravada certinho no
`data/`, o HTML é gerado, o motor loga `publicado`, o receptor devolve 201 com URL
e o Telegram anuncia. A URL responde 410 desde o primeiro segundo.

Aconteceu no advivo em 28/08/2026 com
`o-que-e-generative-engine-optimization-tudo-sobre-a-nova-sigla-do-marketing`,
podado em 22/08. Nada no log acusa: **procurar o defeito no receiver.js é perder
tempo**, ele fez tudo certo.

**O conserto não é tirar o slug da lista, é tornar o 410 condicional.** O próprio
vhost já usava esse raciocínio na editoria vazia e não o aplicou aos 3.198 slugs:

```nginx
location ~ "^/(?:[a-z0-9-]+/)?(slug1|slug2)/?$" {
    try_files $uri $uri/ $uri/index.html =410;
}
```

Aplicado em 28/08/2026 nos 33 `gone/*.conf` da opengravity, 8.951 regras. Podado
segue 410, página viva passa a 200, e a colisão deixa de existir para sempre. A
clinicas-vps e a gnd-motor não têm lista de 410, então não têm o problema.

**Ao conferir, use o formato de URL que a lista exige.** Metade delas tem a
editoria opcional (`^/(?:[a-z0-9-]+/)?`) e a outra metade a exige
(`^/[a-z0-9-]+/(`). Testar `/slug/` na raiz de uma lista do segundo tipo devolve
404 e parece regressão, não é.

Ver [[slug-podado-que-o-motor-regenera]], que é a mesma colisão na conversão, e
[[conversao-exige-redirects]].
