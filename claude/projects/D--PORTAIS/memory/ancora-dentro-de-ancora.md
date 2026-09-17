---
name: ancora-dentro-de-ancora
description: "`<a>` dentro de `<a>` faz o navegador servir dois links, e nenhum regex não-guloso enxerga o de dentro"
metadata:
  node_type: memory
  type: feedback
---

Conteúdo importado do WordPress traz âncora aninhada:

```html
<a href="/casa/mesa-de-centro/">O que colocar na mesa? <a href="/saude/x/">Veja dicas</a>!</a>
```

É HTML inválido. O navegador **fecha a primeira sozinho** e serve dois links, então
a página funciona e nada acusa. O problema aparece de lado: no azulmagazine o link
de dentro apontava para artigo podado e respondia **410**.

⚠️ **Nenhuma conferência por expressão regular acha.** Um regex não-guloso do tipo
`<a\s[^>]*href="(...)"[^>]*>(.*?)</a>` casa a âncora **de fora** e engole a de
dentro como se fosse texto do link. Foi por isso que a varredura de destino morto
apontava o 410 e o script de conserto dizia "0 links corrigidos".

**How to apply:** desaninhar **antes** de qualquer conserto de link, fechando a
primeira âncora onde a segunda abre, que é o que o navegador já faz. Depois disso
a varredura enxerga os links de dentro. Conferir a profundidade percorrendo
`<a ...>` e `</a>` com um contador, e provar que o número de `<a` não mudou.

Em 22/08/2026 eram **5 artigos no azulmagazine e 12 no curiosododia**. Ver
[[link-interno-quebrado-gravado-no-conteudo]].
