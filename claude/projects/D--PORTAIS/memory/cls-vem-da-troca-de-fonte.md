---
name: cls-vem-da-troca-de-fonte
description: O relatório nomeia o elemento que se moveu, não a causa; com display=swap o título grande reflui e empurra tudo. optional zera.
metadata:
  type: project
---

No seuguiadesaude o PageSpeed apontava CLS de **0,128** e culpava a `<figure>` do
artigo e a grade da home. Nenhuma das duas era a causa: **a auditoria nomeia o
elemento que se DESLOCOU, não quem o empurrou.** As duas ficam logo abaixo de um
título grande na fonte de display.

Com `display=swap` o navegador desenha a página inteira no substituto (Georgia),
e quando a fonte de display chega ele redesenha: um h1 que ocupava duas linhas
passa a ocupar três, e tudo abaixo desce.

Trocar para **`display=optional`** no `googleUrl` do `sites.json` levou o CLS a
**0** nas duas páginas, e a performance de 87 para 95. Com `optional` o navegador
espera um instante pela fonte: se chegar, usa desde o primeiro desenho; se não,
fica no substituto até a próxima visita, quando já está em cache. Nos dois casos
não há redesenho.

**Why:** perseguir o elemento nomeado no relatório não leva a lugar nenhum, e
`width`/`height` na imagem não resolve nada quando o empurrão vem de cima.

**How to apply:** quando o CLS acusar vários elementos diferentes, e sempre os
que ficam **abaixo de um título grande**, suspeitar da fonte antes de tudo. Ver
[[campo-image-do-motor-e-objeto]] e [[fonte-de-um-peso-so]].

⚠️ Um segundo defeito de CLS, real e separado: `img{width:100%}` **sem
`height:auto`** desliga a reserva de altura que o par `width`/`height` da tag
faria. Os dois têm que estar juntos.
