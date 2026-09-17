---
name: feedback-meta-description-com-keyword
description: Ao escrever guest post, a meta description precisa conter a keyword do proprio artigo hospedeiro, erro que ja se repetiu em tres campanhas
metadata:
  type: feedback
---

Escrevendo guest post eu tendo a redigir a meta description como um resumo
elegante do conteudo, sem repetir o termo de busca. Isso falhou na auditoria de
SEO em **tres campanhas seguidas** (drhenriquebufaical 4/5, drbrunoair 6/8,
cirurgiadojoelhogoiania 8/10), sempre exigindo republicar tudo depois.

**Why:** a meta description nao e fator de ranqueamento direto, mas o Google
destaca em negrito o termo buscado no snippet, o que eleva o CTR. Meta sem a
keyword perde esse negrito e o clique.

**How to apply:** ao montar o payload, antes de publicar, conferir que a
`meta` contem a keyword principal **do artigo hospedeiro** (nao a do cliente) e
que tem 135-155 caracteres. A keyword do cliente fica na ancora; a do host, no
title, H1, URL, primeiro paragrafo e meta.

Checagem rapida, com a keyword do host normalizada sem acento:

```python
tem = all(w in norm(meta) for w in norm(keyword_do_host))
```

O mesmo vale para o title: em site que acrescenta " | Marca" automaticamente
(medicinageriatrica, revistamsaude), o titulo final passa de 60 caracteres. Nao
encurtar sacrificando a keyword: o que o Google trunca e o sufixo da marca, que
ja aparece no dominio da SERP. Relacionado:
[[reference_publicar_revistamsaude_medicinageriatrica]].
