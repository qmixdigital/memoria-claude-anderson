---
name: wordmark-svg-pode-faltar-letra
description: "Marca desenhada em SVG foi ao ar com 'Viaje no Det': faltavam glifos e nada acusa, nem leitor de tela"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:47:50.676Z
---

A arquitetura Y subiu com o wordmark mostrando **"Viaje no Det"**. Não era corte
de CSS nem `viewBox` apertado: eu desenhei **dez** contornos e a palavra tem
**catorze**. As letras "a", "l", "h" e "e" simplesmente não existiam.

**Why:** não acusa em lugar nenhum. O SVG é válido, o `viewBox` fecha nos
contornos que existem, o `aria-label` diz "Viaje no Detalhe", então até leitor de
tela concorda com a marca errada. Só aparece olhando o print, e só se quem olha
souber o nome do portal.

**How to apply:** ao montar wordmark em curvas, **contar os `<path>` contra as
letras da palavra** antes de instalar. Para acrescentar letra depois, reusar o
contorno da mesma letra que já está na palavra, dentro de
`<g transform="translate(dx,0)">`: reusar garante que a nova seja idêntica à
antiga, o que a mão não garante. O avanço entre letras se mede nas que já
existem, medindo a caixa de cada contorno, e não se chuta.

Ver [[marca-tem-duas-cores]] e [[conferir-por-captura-usar-cache-busting]].
