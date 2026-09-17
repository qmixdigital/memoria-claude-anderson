---
name: regex-nao-guloso-corta-o-corpo
description: O auditor de links extraía o corpo com regex não-guloso e parava no primeiro </div> interno, reportando 74 links onde havia 3.477
metadata:
  type: feedback
---

O `audita_links_<portal>.py` extraía o corpo do artigo com
`<div class="HASH">(.*?)</div>`. Não-guloso, ele para no **primeiro** `</div>` de
dentro: em portal cujo corpo tem bloco do WordPress (`wp-block-*`), o corpo é
cortado no primeiro parágrafo.

No jornaldobairroalto ele reportou **74 links de corpo** quando havia **3.477**.

**Why:** número baixo não acusa erro. Passa por "portal com pouca linkagem
interna", que é diagnóstico plausível, e a auditoria de âncora roda sobre quase
nada — inclusive o teto de 8 usos, que passa sem ter sido medido.

**How to apply:** extrair contando profundidade de `<div>`, nunca com regex:

```python
prof = 1
for t in re.finditer(r'(?i)<div\b[^>]*>|</div>', html[ini:]):
    prof += 1 if t.group(0).lower().startswith('<div') else -1
    if prof == 0: return html[ini:ini + t.start()]
```

Mesma armadilha de [[ancora-dentro-de-ancora]] e de
[[pagina-renderizada-dentro-do-content]]: HTML aninhado não se lê com regex
não-guloso.
