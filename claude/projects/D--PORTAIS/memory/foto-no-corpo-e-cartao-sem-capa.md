---
name: foto-no-corpo-e-cartao-sem-capa
description: Artigo abre com foto e o cartão da listagem sai pelado, porque o campo image nunca foi preenchido na importação
metadata:
  node_type: memory
  type: project
---

O cartão da home e da listagem lê o campo `image`. O corpo do artigo carrega as
próprias imagens dentro do HTML. Quando a importação não preencheu o campo, o
artigo abre com foto e **o cartão sai sem miniatura**, e nenhuma auditoria
acusa: as duas coisas estão certas isoladamente. Junto vão embora o `og:image`
e a imagem do schema.

Medido em 29/08/2026 nas duas máquinas: **5 artigos, todos no wtw19**, todos com
imagem local com prefixo `inl-`. O resto da rede estava limpo, então isto é
resíduo de uma importação específica, não um defeito do motor.

O conserto é `promove_capa.py`: promove a primeira foto do corpo a capa e **a
remove do corpo**, senão a mesma imagem aparece duas vezes na página.

Quatro cuidados que a primeira versão do script não teve, e que valem para
qualquer promoção de imagem nesta rede:

1. **Remover o bloco inteiro, não a tag `img`.** A foto costuma estar dentro de
   uma `figure`; tirar só a `img` deixa uma `figure` vazia desenhando espaço. E
   nesta rede ela ainda costuma vir dentro de um `div` com classe de lixo do
   tema raspado, que também fica vazio. Ver [[lixo-de-tema-no-corpo-importado]].
2. **Ler a dimensão do arquivo, não da tag.** A tag raspada mente: num dos cinco
   ela declarava `width="512"` num arquivo de 1024px. Usar o valor declarado dá
   hero borrado e proporção errada.
3. **Aproveitar o `figcaption` como legenda, mas descartar a que só repete o
   alt ou o título** — ela não informa nada e ainda ocupa uma linha sob a foto.
   Ver [[legenda-repete-o-h1]].
4. O campo é **objeto**, e `file` é só o nome do arquivo, sem `/img/` na frente.
   Ver [[campo-image-do-motor-e-objeto]].

Como varrer a rede de novo, sem depender de alguém reparar na tela:

```python
img = a.get("image")
tem = bool(img and isinstance(img, dict) and img.get("file"))
if not tem and re.search(r'<img[^>]+src=', a.get("content") or ""):
    ...   # foto no corpo, cartao sem capa
```

Vale conferir junto o caso inverso, capa declarada cujo arquivo sumiu do disco:
o cartão sai com a caixa cinza e parece o mesmo defeito. Ver
[[rm-rf-public-leva-a-pasta-de-imagens]] e [[artigo-sem-imagem-apagar]].
