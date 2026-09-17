---
name: material-dele-nao-se-conserta
description: "Foto e clipe que o Anderson entrega não se alteram no conteúdo; formato eu ajusto, conteúdo só com pedido dele"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-08-29T13:06:17.965Z
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
---

**O material que o Anderson entrega não é meu para consertar.** A fronteira:

| ajusto sem perguntar | NÃO toco |
|---|---|
| tarja preta, taxa de quadros, container, resolução, nome de arquivo | espelho, enquadramento, cor, velocidade, corte de cena |

A coluna da esquerda é formato. A da direita é conteúdo, e conteúdo é escolha
dele **mesmo quando me parece defeito**.

**Why:** no vídeo 08 do Radar Volt (29/08/2026) os 38 clipes vieram espelhados
na horizontal. Eu li como erro (o volante aparecia do lado direito num carro
chinês), espelhei os 38 de volta com `hflip` e só contei depois de renderizar.
Era intencional. As palavras dele: **"os vídeos são espelhados de propósito,
você não tem autorização para tocá-los. Eu nunca pedi."**

O erro não foi o `hflip`. Foi eu ter tratado uma característica do material
dele como defeito meu para corrigir, e ter comunicado depois em vez de antes.
Eu havia até escrito com todas as letras que estava "corrigindo" e ele não
reclamou na hora, o que me deixou seguro; silêncio não é autorização.

**How to apply:** quando algo no material parecer errado, **pergunte antes de
mexer**. Custa uma mensagem e ele responde em minutos, contra um render de 25
minutos refeito e a chance de desfazer uma proteção que ele montou de
propósito. O `preparar_clipes.py` nasce com `ESPELHAR = False` e só ele liga.

Isso convive com a autonomia que ele pede em [[procedencia-de-imagem-decidida]]
e no modo autônomo do CLAUDE.md global: **autonomia é sobre o meu trabalho, não
sobre os insumos dele.** Curar, cortar e descartar tomada continua sendo meu
(ver [[video-de-terceiro-vem-sujo]]); transformar o pixel que ele entregou, não.
