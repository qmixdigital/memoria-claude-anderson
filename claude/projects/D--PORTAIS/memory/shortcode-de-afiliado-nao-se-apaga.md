---
name: shortcode-de-afiliado-nao-se-apaga
description: "`[su_button url=...]` carrega link de afiliado real; apagar o shortcode joga o link fora, o certo é virar âncora"
metadata:
  node_type: memory
  type: feedback
---

Shortcode de plugin que não existe mais **aparece literalmente na página** e vai
junto para a meta description. A reação natural é apagar todos, e ela erra num
caso: alguns carregam **link de verdade**.

No ebookcult havia três tipos, e cada um pede uma coisa:

| shortcode | o que fazer | por quê |
|---|---|---|
| `[su_button url="https://amzn.to/..."]texto[/su_button]` | **vira `<a href>`** com `rel="nofollow sponsored"` | é link de afiliado real; apagar joga fora |
| `[amazon box="ASIN"]` | remove | é widget sem URL, e montar um endereço da Amazon mandaria tráfego sem crédito para ninguém |
| `[resultado]`, `[dor]` | remove | resto de template de redação, sem função |

**Antes de apagar shortcode em massa, listar os distintos e olhar:**

```python
RX = re.compile(r'\[/?[a-z_][a-z0-9_-]{2,24}(?:\s[^\]]{0,120})?\]')
```

⚠️ Junto apareceu `<script type="application/ld+json">` **dentro do corpo** de 2
artigos. Sai: conflita com o bloco que o motor emite e corre o risco de o
`autoLink` injetar link dentro da string do JSON, que faz o bloco sumir do
Google. Ver [[autolink-dentro-de-script]] e [[lixo-de-tema-no-corpo-importado]].
