---
name: motor-da-hostinger-sem-curl
description: o render.js da hostinger-vps-srv1166087 não tem H.curl nem categoryBase
metadata:
  type: project
---

O `render.js` da **hostinger-vps-srv1166087** não tem `H.curl()` e cita
`categoryBase` uma vez só, sem uso real. A opengravity e a clinicas-vps têm as
duas coisas.

**Why:** portal cuja listagem mora em `/category/<slug>/` ou `/categoria/<slug>/`
não pode ser hospedado ali: o link de editoria sairia como `/<slug>/` e a
editoria inteira cairia em 404, com o menu bonito no print e quebrado no clique.
Foi por isso que os cinco portais de saúde de 24/08/2026 foram para a
opengravity, e não para a hostinger, que era o plano por ter mais disco.

**How to apply:** antes de escolher a máquina de destino de uma conversão,
conferir `grep -c curl /opt/portal-engine/src/render.js` nas três. Enquanto esse
trecho não for portado, a hostinger só serve portal de URL plana sem base de
categoria. É mais um caso de [[patches-motor-clinicas-vps]]: correção que ficou
numa máquina só.
