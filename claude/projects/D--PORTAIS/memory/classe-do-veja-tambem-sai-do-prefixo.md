---
name: classe-do-veja-tambem-sai-do-prefixo
description: O malha_portal montava a classe com as 3 primeiras letras do slug, e a arquitetura estiliza o fp.prefix
metadata:
  type: project
---

O `malha_portal.py` gravava o bloco "Veja também" com a classe
`PORTAL[:3] + '-veja'`. No pontonaturalbrasil isso dá **`pon-veja`**, enquanto a
arquitetura estiliza **`.pnb-veja`**, que é o `fp.prefix` do `sites.json`.

O bloco sobe sem estilo nenhum: sem filete, sem o rótulo em caixa alta, os links
soltos no meio do texto. Não aparece em auditoria de HTML nem de link.

**Why:** as três primeiras letras do slug coincidem com o prefixo na maioria dos
portais, então o defeito ficou latente até um slug em que não coincidem.

**How to apply:** a classe sai de `site['fp']['prefix']` lido do `sites.json`, e
o script já foi corrigido. O nome continua tendo que ser único entre portais, ver
[[classes-css-nao-podem-repetir]].
