---
name: home-title-com-marca-duplicada
description: "22 dos 28 portais da hostinger-vps-srv1166087 têm o title da home duplicado ou acima de 60; o conserto é metaTitle"
metadata:
  node_type: memory
  type: project
---

O `homeMeta` monta o título da home assim:

```js
const title = site.metaTitle || (site.description ? `${site.description} | ${site.name}` : site.name);
```

Quando a `description` do `sites.json` é o próprio nome do portal, sai
**`Jornal Diário | Jornal Diário`**. Quando ela é uma frase de posicionamento,
o resultado passa de 60 caracteres e o Google corta.

Levantado em 22/08/2026: **22 dos 28 portais da `hostinger-vps-srv1166087`**
estão num dos dois casos, um deles com 154 caracteres. A opengravity e a
clinicas-vps: **zero**.

O conserto não é mexer no motor, é dar `metaTitle` próprio a cada portal, que é o
campo criado exatamente para separar o título do h1, ver
[[title-separado-do-h1]]. Para achar quem está assim:

```bash
python3 -c "
import json
c=json.load(open('/opt/portal-engine/sites.json'))
for s in c['sites']:
    if s.get('metaTitle'): continue
    d=(s.get('description') or '').strip(); n=(s.get('name') or '').strip()
    t=(d+' | '+n) if d else n
    if d.lower()==n.lower() or len(t)>60: print(len(t), s['domain'], t)"
```

Anderson foi avisado em 22/08/2026 e ainda não decidiu se quer os 21 reescritos
(o `teste.local` não conta). Ver [[title-de-listagem-sem-marca]], que é o defeito
irmão e esse sim era do motor.
