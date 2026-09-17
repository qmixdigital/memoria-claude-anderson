---
name: sem-link-externo-no-corpo
description: Conteudo gerado para a rede nunca pode ter link externo no corpo do texto; so no fim, como referencia, e sempre nofollow
metadata:
  type: feedback
---

Em conteudo gerado para os portais da rede, **link externo no corpo do texto e
proibido**. Link externo so pode aparecer **no fim do texto, numa secao de
referencias/fontes**, e sempre com `rel="nofollow"`.

Link **interno** (para outra pagina do mesmo portal) no corpo continua liberado:
a regra vale para link que sai do dominio.

**Why:** o Anderson **vende backlinks** nesses portais. Link externo dofollow
solto no corpo entrega de graca exatamente o que ele cobra, e ainda mistura link
automatico com link vendido dentro do mesmo paragrafo. Consequencia pratica que
ele relatou em 22/08/2026: **ele nao consegue mais remover esses conteudos**,
porque o corpo do texto tem link, e mexer no artigo mexe no que foi vendido.

**How to apply:** ao gerar ou revisar conteudo, nenhum `<a href>` para dominio
externo dentro de paragrafo, lista ou citacao do corpo. As fontes vao para uma
secao final, cada uma com `rel="nofollow"` (na pratica
`rel="noopener nofollow"`). Nao confiar so na instrucao do prompt: sanitizar o
HTML depois da geracao, movendo para o rodape qualquer link externo que o modelo
tenha posto no corpo. Ver [[motor-pautas-geracao]].

Origem do defeito: o bloco "ATRIBUICAO E LINKS" do `prompts.py` do motor de
pautas mandava o modelo "criar um link para a materia original em pelo menos
duas mencoes, com texto ancora descritivo". Era instrucao explicita para fazer o
errado.
