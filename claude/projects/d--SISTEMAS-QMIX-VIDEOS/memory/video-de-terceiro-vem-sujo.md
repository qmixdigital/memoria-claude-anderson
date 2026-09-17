---
name: video-de-terceiro-vem-sujo
description: "Quando o Anderson entrega clipes de vídeo (review recortado em partes de 30s), o material chega espelhado e com marca do canal de origem; conferir antes de usar"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-28T21:58:13.347Z
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
---

Do vídeo 08 (Geely Galaxy TT, 28/08/2026) em diante, o Anderson passou a
entregar **vídeo** e não só foto: um review do YouTube baixado e recortado em
pedaços de 30 segundos, largados soltos em `fotos/`. Foram 38 arquivos, 19
minutos, 1080p50.

Isso é material bom e resolve a falta de foto de lançamento recente. Mas ele
chega com três defeitos que **não se veem sem procurar**:

1. **Espelhado na horizontal, DE PROPÓSITO.** Todo texto lê ao contrário e o
   volante aparece do lado errado. **Não desespelhar.** Ele fez assim de
   propósito e não autorizou mexer: ver [[material-dele-nao-se-conserta]]. Eu
   "consertei" os 38 clipes do vídeo 08 sem perguntar e ele mandou parar.
2. **Marca do canal de origem** queimada na imagem: faixas de like e inscrição
   (inclusive em árabe), cartelas de seção, watermark. Elas duram 4 ou 5
   segundos, ou seja, **cabem inteiras fora do meio da tomada**, que é onde a
   amostra de curadoria cai.
3. **Tarja preta em parte dos arquivos e não em todos**, o que pisca quando um
   plano tem e o seguinte não.

**Why:** eu olhei as 138 tomadas uma a uma numa folha de contato e mesmo assim
quatro entraram com marca alheia; uma legenda em árabe pedindo like apareceu
seis vezes no vídeo renderizado antes de a folha de contato revelar.

**How to apply:** `preparar_clipes.py` conserta 1 e 3 numa passada (hflip +
cropdetect por clipe + corte 16:9 + 30 fps), e `mapear_clipes.py` acha as
tomadas de verdade por diferença entre quadros, porque o recorte de 30s é no
relógio e cada arquivo tem várias tomadas. Para o 2, a varredura da **faixa
inferior de cada corte que entra em plano**, quatro quadros por corte: é o que
está escrito no Portão 5 da skill `make-radar`. Ver
[[revisao-e-quadro-por-fala]] e [[defeito-silencioso-conferir-artefato]].

Teto de plano cai para ~3,6s quando a fonte é vídeo: `OffthreadVideo` sem loop
congela no último quadro se o plano for mais longo que o clipe, sem erro nenhum.
