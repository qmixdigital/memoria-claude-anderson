---
name: reference-portal-engine-dedup-por-host
description: A dedup de slug do portal-engine e por host e nao existe no srv1166087, entao duplicata entre portais de hosts diferentes passa sem aviso
metadata:
  type: reference
---

O portal-engine guarda um registro de exclusividade de slug em
`/srv/portais/_dedup/owners.json`. Quando o slug ja pertence a outro portal, o
`publishArticle` devolve `{"status":"skipped","duplicate":true,"owner":"..."}`
em vez de publicar.

**Tres limitacoes descobertas em 29/08/2026, auditando o lote 4 do rblc:**

1. **O indice e por host.** opengravity e clinicas-vps tem cada um o seu
   `owners.json`, e um nao enxerga o outro. Publicar em portal do host A um slug
   que ja existe no host B passa sem aviso nenhum.
2. **O srv1166087 nao tem dedup nenhuma.** O `render.js` daquele host e uma
   versao mais antiga, sem qualquer referencia a `_dedup`/`owners.json`.
3. **O `remover_artigo.js` so existia no opengravity.** Copiado para os outros
   dois em 29/08.

Resultado pratico: 5 dos 20 guest posts do lote 4 sairam duplicando artigo ja
publicado na rede em 17-18/08. Tiveram de ser removidos e reescritos.

**Antes de escolher pauta, checar o slug nos TRES hosts:**

```bash
for h in opengravity hostinger-vps-srv1166087 clinicas-vps; do
  ssh $h 'ls /srv/portais/*/data/SLUG.json 2>/dev/null | sed "s#/srv/portais/##; s#/data/.*##"'
done
```

**Ao remover:** `node /opt/portal-engine/remover_artigo.js <site> <slug> --aplicar`
(root, com `export PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin`). Ele apaga
o JSON, a pasta publicada, libera o slug no owners.json e reconstroi os indices.
Mesmo assim, conferir se a pasta em `public/<cat>/<slug>` sumiu e reiniciar o
`portal-engine.service`, senao o fallback @motor continua servindo, ver
[[reference_portal_engine_motor_cache_404]]. Depois purgar o CF: a borda ainda
devolve 200 por alguns instantes mesmo com a origem em 404.

Relacionado: [[reference_portal_engine_pub_sem_rebuild]].

**A checagem por slug exato nao basta.** Em 29/08 o lote 5 do rblc passou pelo
teste de slug e ainda assim duas pautas duplicavam artigo da rede com slug
diferente e mesmo assunto (`quem-compra-tv-com-defeito` x
`onde-vender-televisao-com-defeito`; `quem-inventou-a-televisao` x
`quem-inventou-a-televisao-a-historia-do-aparelho`). Checar por TERMO:

```bash
for h in opengravity hostinger-vps-srv1166087 clinicas-vps; do
  ssh $h 'ls /srv/portais/*/data/*TERMO*.json 2>/dev/null | sed "s#/srv/portais/##; s#/data/#  #"'
done
```
