---
name: lixo-de-tema-no-corpo-importado
description: "[ad_1], comentário de tema e span sem parágrafo: o que o WordPress deixa no corpo e ninguém vê na conferência comum"
metadata:
  node_type: memory
  type: feedback
---

Três achados do curiosododia que a Fase 7 não cobria, todos visíveis só quando se
olha o corpo cru de um artigo:

**`[ad_1]` aparece na tela.** Shortcode de plugin de anúncio que não existe mais
não é interpretado por nada, então sai **literalmente** no texto, e vai junto
para a meta description e para o resultado de busca. Eram **288 dos 898**.

**Comentário de tema viaja em todo HTML servido.** `<!-- Article New Updates
Highlighter List -->` em **624 artigos**. Não aparece na tela, e pesa em toda
requisição.

**Corpo sem nenhum `<p>`.** 42 artigos vieram como sequência de
`<span style="font-weight: 400">` separados por linha em branco. O texto aparece,
e por isso ninguém nota, mas: a descrição automática não acha parágrafo, e **o
bloco de anúncio do motor entra "depois de um parágrafo inteiro", então esses 42
ficam sem anúncio nenhum**.

**Resumo em itálico entre parênteses colado na abertura.** No revistadeducao,
**78 artigos** abriam com `<i>(Entenda como ... .)</i>` antes do primeiro
parágrafo: era o resumo que a origem grudava no corpo. Na tela vira uma linha
torta logo abaixo do `<h1>`, repetindo o título palavra por palavra. Nenhuma
expressão regular de `<p>` pega, porque não está dentro de parágrafo. Como resumo
ele costuma ser **melhor** que a linha fina tirada do meio do texto, então vale
promover a `dek` quando cabe na régua e não repetir a abertura, em vez de jogar
fora.

**How to apply**, na Fase 7 de toda conversão:

```python
RX_AD = re.compile(r'\[ad_\d+\]')
RX_COMENT = re.compile(r'<!--(?!\s*/?(?:more|nextpage))[\s\S]{0,300}?-->')
RX_SCRIPT = re.compile(r'(?is)<script\b[^>]*>[\s\S]*?</script>')
```

Manter `<iframe>`, que costuma ser vídeo de verdade, e os comentários `more` e
`nextpage`, que o WordPress usa como marca. Ver
[[prompt-da-ia-vazado-no-campo]], [[entidade-html-no-titulo]] e
[[imagem-hospedada-por-terceiro-no-corpo]].
