---
name: cliquex-museudalampada-farol
description: museudalampada.com.br = 10º diretório Teste IPTV ("Farol TV", design claro areia/teal/laranja, tom "erros e armadilhas"); LIVE em 2026-10-10 na conta Aluguel Sites 2; fonte em D:/SITES/museudalampada-farol
metadata:
  type: project
---

**Host canônico: www.museudalampada.com.br** (o site antigo usava www; apex faz 301 para www, canonicals/sitemap/schema em www, pedido do usuário em 2026-10-10). museudalampada.com.br é o 10º diretório Teste IPTV da rede, marca "Farol TV", publicado em 2026-10-10.
Conta Cloudflare "Aluguel Sites 2" (d2aeda609bafa52c3e1152e2e349e0c1, token master), projeto Pages `museudalampada`,
zona 99c2ee1f945a5c7fe3c6d24880c014f3. Mesma estrutura do procrie ([[cliquex-procrie-metrica]]): home com ranking
estático dos 25 clientes reais ([[cliquex-provedores-clientes]]), 111 páginas de silo → home, termos/privacidade/404,
sitemap 114 URLs, IndexNow enviado, playbook de segurança aplicado ([[cliquex-seguranca-playbook]]).

**Anti-footprint deste site:** tema claro e quente (areia #f6f2ea, teal #0f4c5c, laranja #e4572e), fontes Red Hat Display
+ Hanken Grotesk self-hosted, hero com foto família no sofá + card "antes de testar", faixa de 4 stats, ranking em linhas
(.row) com ponto de cor por nota, seção "armadilhas" (6 cards), tabela "pico da noite/catálogo/imagem/nota".
Conteúdo do silo com tom "erros e armadilhas" (conjunto de erros distinto por página), rating schema 4.7 / 9412.

**Fonte:** D:/SITES/museudalampada-farol (farol_build.py → farol_finalize.py → farol_cf.py deploy; README explica).
Scripts foram derivados dos do procrie por `farol_derive.py` (substituição de strings): próximo diretório pode repetir
o mesmo truque a partir desta pasta.

**Gotchas:** UA Python-urllib leva 403 no domínio (WAF/bot fight): usar UA de navegador em curl/IndexNow.
Não existe DNS automático para Pages: CNAME apex+www manual → museudalampada.pages.dev (farol_zone.py faz tudo).
