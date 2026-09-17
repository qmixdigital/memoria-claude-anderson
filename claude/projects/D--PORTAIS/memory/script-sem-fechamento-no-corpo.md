---
name: script-sem-fechamento-no-corpo
description: 77 artigos da rede tinham <script> aberto e nunca fechado; o navegador engole o resto do HTML e o rodapé some da tela
metadata:
  type: project
---

A raspagem trouxe, dentro do `content`, um `<script type="application/ld+json">`
com o JSON **truncado** e sem `</script>`. Origem: plugin de FAQ que corta o
texto no meio.

**Why:** na página publicada o navegador trata tudo o que vem depois como código.
Somem da tela o bloco de compartilhar, os relacionados e o **rodapé** — e o
`</footer>` continua no arquivo, então nenhum auditor de HTML acusa. Foi assim que
o defeito atravessou dezenas de conversões.

Medido em 23/08/2026: **77 artigos**, 17 na opengravity, 34 na clinicas-vps e 26
na hostinger.

**How to apply:** `script_solto.py` tira todo par `<script>...</script>` do corpo
e, se sobrar um `<script` sem fechamento, corta dali até o fim do texto. O corpo
nunca deve ter `<script>`.

O sinal que **prova** na página montada é simples, e é o que `confere_script.py`
mede:

```
numero de "<script"  !=  numero de "</script>"
```

⚠️ Não adianta procurar `</footer>` no arquivo: ele está lá. O que falta é o
navegador chegar até ele. Ver [[autolink-dentro-de-script]], que é o mesmo campo
visto por outro ângulo.
