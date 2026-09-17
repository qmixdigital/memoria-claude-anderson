---
name: slug-podado-que-o-motor-regenera
description: "Página do WordPress podada cujo slug o motor recria (contato, privacidade, termos) vira 410 e mata a página nova"
metadata:
  node_type: memory
  type: project
---

As páginas do WordPress entram na mesma tabela de decisão dos artigos, e
`contato`, `politica-de-privacidade` e `termos-de-uso` quase sempre saem: não têm
backlink nem tráfego. Só que **o motor gera essas três sozinho, no mesmo slug**.
Com o slug na lista de 410, a página nova responde 410 e ninguém descobre: nada
aponta para ela fora do rodapé.

No advivo eram quatro colisões. A quarta é pior de achar: `qual-e-a-melhor` era
slug de um artigo podado **e** slug de editoria com 3 artigos preservados. O 410
matava a lista inteira.

E como o bloco de 410 aceita editoria opcional na frente
(`^/(?:[a-z0-9-]+/)?(slug1|slug2|...)/?$`), qualquer slug podado que coincida com
slug de **artigo preservado** mata o preservado também.

**Antes de gravar o `gone.conf`, tirar da lista tudo que existe do outro lado:**

```python
vivos  = {d for d in os.listdir(PUB) if os.path.isdir(...)}      # editorias e institucionais
vivos |= {basename(f)[:-5] for f in glob(DATA + '/*.json')}      # artigos preservados
vivos |= {basename(d) for d in glob(PUB + '/autor/*')}           # paginas de autor
limpos = [s for s in podados if s not in vivos]
```

Ver [[conversao-exige-redirects]] e [[gone-txt-em-vez-de-410-no-nginx]].

## O filtro que tira esses slugs não pode usar `startswith`

Ao montar a lista de 410 do ortopedistadeombro, filtrei também tudo que
começasse com `autor`, pensando nas páginas `/autor/<slug>/`. O filtro comeu
**`autoridades-de-saude-alertam-sobre-doenca-nos-eua`**, que é artigo de
verdade: ele sairia do 410 e responderia 404, que demora muito mais a sair do
índice.

Página de autor mora em `/autor/<slug>/`, um caminho de dois níveis, e slug de
post nunca carrega esse prefixo. Então o filtro é **comparação exata contra um
conjunto fechado**, nunca prefixo:

```python
REGENERA = {"contato", "politica-de-privacidade", "termos-de-uso", "quem-somos",
            "busca", "sitemap", "equipe", "politica-editorial", "home", "index"}
depois = [s for s in antes if s not in REGENERA]
```

Na conversão de 01/09/2026 saíram 4 slugs de cada portal por esta regra, e mais
nenhum. Ver [[conversao-parcial-com-backlinks]] e [[410-por-slug-mata-editoria]].
