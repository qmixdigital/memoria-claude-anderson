---
name: receptor-cacheia-render
description: Editar render.js nao muda o que o receptor publica ate reiniciar o portal-engine.service
metadata:
  type: project
---

O receptor do Portal Engine (`src/receiver.js`) carrega o `render.js` por
`require` na partida. **Node cacheia o modulo**, entao qualquer edicao no
`render.js` so vale para artigos novos DEPOIS de reiniciar o servico:

    systemctl restart portal-engine.service

Em 29/08/2026 os receptores estavam no ar ha 1 dia e 16 horas enquanto o
`render.js` fora alterado na vespera. As 89 materias publicadas naquele dia
sairam com o codigo antigo, sem o bloco "Leia tambem" do meio. O rebuild
conserta o acervo, mas cada NOVA publicacao continuava saindo errada ate o
restart.

Reiniciar o receptor **nao tira site do ar**: ele serve so a API de publicacao,
o HTML e servido pelo nginx. O incidente que motivou o "nao mexa nunca mais" foi
uma edicao no `render.js` que quebrou a renderizacao, nao o restart.

**How to apply:** depois de qualquer patch em `render.js`, fazer as duas coisas:
reiniciar o `portal-engine.service` nas tres instancias e rodar o rebuild. So o
rebuild conserta o passado; so o restart conserta o futuro.
