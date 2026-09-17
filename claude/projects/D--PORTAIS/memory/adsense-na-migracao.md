---
name: adsense-na-migracao
description: Migrar portal sem conferir o AdSense da origem faz o site parar de faturar sem nenhum erro visível
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-20T09:08:59.398Z
---

Toda migração de WordPress para o Portal Engine tem que conferir o AdSense na
origem **antes** de desligar o WordPress. É receita, e nenhuma auditoria de SEO
olha para ela: o site novo sobe bonito, passa em tudo e simplesmente para de
faturar.

No euvo, em 20/08/2026, o WordPress tinha `ads.txt` e o mu-plugin
`qmix-adsense.php` com o publisher `pub-3880875536722698`, e o motor da
opengravity não suportava AdSense. Só apareceu porque o Anderson notou.

Onde olhar na origem: `public_html/ads.txt`, `grep pub-` em `wp-content`,
`data-ad-slot` no tema, e `wp option list --search='*adsense*'`.

**Why:** o defeito é silencioso dos dois lados. Faltando o AdSense, nada acusa;
e com o publisher na forma errada (`client=pub-` em vez de `client=ca-pub-`) o
script baixa, responde 200 e não serve anúncio nenhum.

**How to apply:** o motor da opengravity passou a ter os campos `adsense` e
`adsSlots` no `sites.json`, e normaliza as duas formas do publisher sozinho.
Unidade de artigo só entra em parágrafo de primeiro nível, e `div` de embrulho
do tema não conta como contentor. Ver [[conversao-total]] e
[[patches-motor-clinicas-vps]], que também tem AdSense e serviu de referência.
