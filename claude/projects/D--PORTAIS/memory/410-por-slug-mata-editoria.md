---
name: 410-por-slug-mata-editoria
description: A regra de 410 com prefixo opcional casa o slug de editoria quando um artigo podado tinha esse mesmo nome
metadata:
  type: reference
---

A regra de 410 usada nas conversões casa o slug com prefixo opcional:

```nginx
location ~ "^/(?:[a-z0-9-]+/)?(slug1|slug2|...)/?$" { return 410; }
```

No oiempreendedores um dos 2.471 podados tinha o slug **`beleza`**, que nesse
portal é **nome de editoria**. A regra casaria `/beleza/` e a **listagem inteira
da editoria morreria em 410**, com o `nginx -t` passando e nada acusando.

**Why:** em portal com `flatUrl: false`, o slug de artigo e o slug de editoria
vivem no mesmo espaço de nomes assim que o prefixo vira opcional. E a editoria
podada some sem aparecer em auditoria de link interno, porque o menu continua
apontando para `/categoria/<slug>/`.

**How to apply:** em portal não plano, montar o 410 pelo **caminho exato** de
cada podado (`/<editoria>/<slug>/`), e não pelo slug solto. Em portal plano o
prefixo opcional continua servindo, mas ainda é preciso tirar da lista o que
colide com página que o motor regenera. Ver [[slug-podado-que-o-motor-regenera]]
e [[flat-url-com-category-base]].
