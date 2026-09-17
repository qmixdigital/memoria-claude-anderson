---
name: html-dentro-do-titulo
description: "Título vindo do WordPress com `<strong>` dentro sai literal no `<title>` e ainda come 14 caracteres da régua de 60"
metadata:
  node_type: memory
  type: feedback
---

Alguns títulos vêm do WordPress com marcação dentro:

```
<strong>Como arrumar mesa de jantar?</strong>
```

O motor **escapa o texto ao renderizar**, então a tag aparece literalmente na
tela, no `<title>`, no `<h1>` e em toda âncora que use o título:

```html
<title>&lt;strong&gt;Como arrumar mesa - Câmera Cotidiana</title>
```

E há um segundo estrago, menos óbvio: `&lt;strong&gt;` conta **14 caracteres**
para a régua de 60, então a regra que corta o título come o começo do assunto de
verdade para caber a tag. Ver [[regua-de-meta-description-escapada]], que é o
mesmo erro de medir texto escapado.

**How to apply**, na Fase 7 de toda conversão. Tirar tag de `title`, `metaTitle`,
`dek`, `excerpt` e `metaDescription`. O `content` **não** entra, porque lá a
marcação é legítima:

```python
RX_TAG = re.compile(r'</?[a-z][a-z0-9]*\b[^>]*>', re.I)
novo = re.sub(r'\s+', ' ', RX_TAG.sub('', v)).strip()
```

Achado em 22/08/2026 numa varredura das três máquinas: **4 artigos, em 4 portais
diferentes** (ebookcult, cameracotidiana, azulmagazine e wtw19). É pouco, e por
isso passa despercebido: um artigo em mil não aparece em amostragem.

O que revelou foi a conferência de âncora: o texto do link mostrava
`&lt;strong&gt;...` e não batia com o título do destino.
