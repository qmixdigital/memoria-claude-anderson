---
name: default-category-fora-do-mapa
description: defaultCategory copiado do portal anterior aponta para editoria que não existe, e o conteúdo da plataforma cai em página órfã
metadata:
  type: project
---

O `defaultCategory` do `sites.json` decide onde cai o conteúdo que a plataforma
publica **sem categoria**, ou com categoria que o `categoryMap` não conhece.
Quando ele aponta para uma editoria que o portal não tem, esse conteúdo vai para
uma URL **sem listagem, fora do menu e fora de toda auditoria**.

**Why:** o campo vem por cópia do portal anterior e ninguém o confere. No divirto
veio `Notícias` do df8, e o divirto nunca teve essa editoria: o teste de entrega
foi parar em `/noticias/<slug>/`, que não existia no mapa. É o jeito silencioso
de fabricar [[editoria-orfa-responde-404]].

**How to apply:** rodar `confere_defcat.py` depois de provisionar. Ele compara o
`defaultCategory` — normalizado, porque o campo é o **nome** e o mapa guarda o
**slug** — contra o `categoryMap` do próprio portal.

⚠️ **O teste real de entrega é o que pega.** O HTTP 201 vem igual, e o arquivo
aparece em `data/`: o que denuncia é a URL de resposta apontar para uma editoria
que não está no menu. Ver [[portal-engine-provisionamento]] e
[[criar-categoria-quando-faltar]].

Depois de corrigir, **apagar a pasta da editoria errada** em `public/`: o rebuild
não a remove, e ela continua servindo a listagem velha. Ver
[[editoria-vazia-deixa-listagem-velha]].

Varrido em 23/08/2026: os outros 88 portais das três máquinas estão certos.
