---
name: recolorir-desenho-de-contorno
description: Clarear o escuro de um mascote feito de contorno o transforma num fantasma; recolorir só a palavra
metadata:
  type: project
---

Marca com **personagem desenhado** não aceita a recoloração que funciona em
wordmark. O mascote do saberdefato é feito de **contorno marinho**: clareando
todo pixel escuro, os traços do rosto, dos óculos e da roupa somem junto, e ele
vira um borrão claro.

O que funciona é recolorir **só a palavra**, que é chapada. O mascote fica
intacto e se lê sobre o fundo escuro pelo que já tem de claro — no caso, o
círculo laranja e o branco da camisa.

**Why:** a regra de recolorir por luminância vale para tipografia, não para
ilustração.

**How to apply:** separar o desenho da palavra pela **coluna vazia** entre os
dois e aplicar a troca só na metade do texto. Conferir as duas versões numa
captura sobre os dois fundos antes de subir.

⚠️ O `site_icon` da origem também merece olhada: o do saberdefato era um recorte
quadrado que **ainda pegava um pedaço da letra** do wordmark, e em 48px virava
uma barra solta ao lado do desenho.

Ver [[recolorir-logo-por-luminancia]], [[logo-preta-com-simbolo-branco]] e
[[png-paletizado-com-pontilhado]].
