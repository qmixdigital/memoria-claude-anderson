---
name: registro-de-donos-e-por-servidor
description: "O owners.json do dedup é por servidor, não da rede; slug livre num pode ser de um portal do outro"
metadata:
  node_type: memory
  type: project
---

`/srv/portais/_dedup/owners.json` existe **em cada servidor** e cobre só os portais
daquela máquina. Em 29/08/2026 a opengravity tinha 6.165 slugs e a clinicas-vps
5.546, com conteúdos diferentes.

Consequência prática: um slug que aparece livre na clinicas-vps pode já ser de um
portal da opengravity, e publicar assim põe dois portais da rede disputando a mesma
consulta no Google. O motor não barra, porque ele só consulta o registro local.

**Conferir nos dois antes de escolher pauta.** Isso pegou três termos de alto volume
numa rodada só: `como-limpar-prata` (22.200/mês) e `como-limpar-espelho` (9.900/mês)
são do girodasnoticias, e `como-lavar-tenis-branco` (4.400/mês) é do olharmoderno.

```bash
for h in opengravity clinicas-vps; do
  ssh $h 'python3 -c "
import json
o=json.load(open(\"/srv/portais/_dedup/owners.json\"))
print(json.dumps([s for s in CANDIDATOS if o.get(s)]))"'
done
```

Ver [[registro-de-donos-de-slug]] e [[tres-instancias-do-motor]].
