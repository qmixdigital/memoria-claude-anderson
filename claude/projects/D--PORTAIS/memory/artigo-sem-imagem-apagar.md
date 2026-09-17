---
name: artigo-sem-imagem-apagar
description: "Na conversão total, artigo que chega sem imagem é apagado, mesmo com backlink externo, em vez de ganhar imagem gerada"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T11:32:10.338Z
---

Em **conversão total**, artigo importado que chega **sem imagem** deve ser
**apagado**, e não ganhar ilustração gerada. Vale **mesmo quando o artigo tem
link externo**, o que normalmente seria motivo de preservação.

**Por quê:** o Anderson prefere gastar o esforço escrevendo conteúdo novo, já
com imagem própria, a recuperar artigo herdado que nasceu incompleto. Encher o
acervo de ilustração genérica sobre notícia velha não traz tráfego e ainda
gasta chamada de API.

**Como aplicar:** o motor já segura esses artigos em `draft` quando
`exigeImagem` está ligado. Em vez de gerar imagem e publicar, é só apagar os
`draft` e seguir para a fase de conteúdo novo. Documentar quantos saíram.

**Limite da regra:** vale **só para conversão total**. Em portal já convertido
e no ar, artigo sem imagem continua sendo caso de gerar imagem ou apagar
conforme o valor da página, como em [[banner-lgpd-e-og-image]].

Estabelecida em 16/08/2026, depois de eu gerar 169 ilustrações temáticas na
onda 1 (gpnoticias, dataroomus, jornalconceito). Vale a partir da onda 2.

Ver [[conversao-total]] e [[poda-por-backlink-conferir-antes]].
