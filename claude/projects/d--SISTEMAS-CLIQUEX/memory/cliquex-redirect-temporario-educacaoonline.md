---
name: cliquex-redirect-temporario-educacaoonline
description: Desde 2026-10-21, procrie, museudalampada, empilhando e geracaoconsciente fazem 301 para educacaoonline.pro.br (pedido do usuário, temporário, ele vai pedir para desfazer); backup das regras antigas em D:/SITES
metadata:
  type: project
---

Em 2026-10-21 o usuário pediu para redirecionar os 4 diretórios anteriores para https://educacaoonline.pro.br ([[cliquex-educacaoonline-lousa]]).
Disse que é **temporário** e que vai pedir para desfazer quando achar interessante. Pediu 301 mesmo assim.

**Como foi feito:** a fase `http_request_dynamic_redirect` de cada zona (procrie.com.br, museudalampada.com.br, empilhando.com.br, geracaoconsciente.com.br) foi substituída por 3 regras:
1. `/teste-iptv-xciptv` → home do educacaoonline (só existia no geracaoconsciente).
2. `/`, `/teste-iptv-*`, `/termos-uso`, `/politica-privacidade` e `/sitemap.xml` → **mesmo caminho** no educacaoonline (mesmos slugs de silo).
3. Qualquer outro caminho → home do educacaoonline (evita 301 para 404).
Vale para apex e www. Os sites antigos continuam publicados no Pages, intactos.

**Para desfazer:** reaplicar com PUT na mesma fase as regras salvas em `D:/SITES/backup-redirects-antes-educacaoonline-2026-10-21.json`, que guarda a regra antiga de cada zona (www↔apex), e depois purgar o cache.
O empilhando também tem o arquivo de redirect do Pages com os 301 das URLs antigas para a home, que voltam a valer ao desfazer.
