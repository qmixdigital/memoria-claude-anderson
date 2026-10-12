---
name: cliquex-procrie-metrica
description: procrie.com.br ("Métrica TV"), 9º diretório de teste IPTV da rede; dark com gráficos, 115 páginas, fonte em D:/SITES/procrie-metrica
metadata:
  type: project
---

**procrie.com.br = "Métrica TV"**, 9º site com o silo do rblc (2026-10-09). Conta Cloudflare **`c86b1054eae18a1b841c8f51128eb1a9`** (alcançada pelo token **master**), projeto Pages **`procrie`**, no ar em `procrie.pages.dev`. Zona **ativa** (NS `clark`/`kate`); domínio no ar em 2026-10-09. O Anderson mandou **desconsiderar o nome do domínio** e fazer o site pelo tipo de diretório.

**Design (9º da rede, pedido: dark, moderno, com gráficos):** fundo navy quase preto `#080b14`, painéis `#0f1522`/`#161d2e`, acentos **âmbar `#ffb224` + violeta `#8b5cf6` + menta `#34d399`**, fontes **Gabarito** (display) + **Instrument Sans** (corpo) + **Chivo Mono** (números). Gráficos como eixo visual, todos em CSS/SVG inline, sem biblioteca: sparkline animada no painel do hero (stroke-dasharray), medidores com barra de preenchimento, **ranking com barra segmentada de 10 blocos** (em vez do medidor circular do figa), **gráfico de colunas** comparando média das 25 x primeiro colocado em 6 critérios, e mini-gráficos de barra em cada etapa do protocolo. Alinhamento conforme [[alinhamento-cards-texto-longo]]: títulos de seção centralizados, texto dos cards à esquerda.

**Conteúdo:** tom **laboratório de medição** (novo na rede): cada página traz um protocolo próprio do que medir, quando e por quanto tempo (tempo até o primeiro quadro, zapes cronometrados, interrupções em 10 minutos, pico x madrugada, cabo x Wi-Fi, telas simultâneas, resolução real). 111 páginas do silo, 450 a 650 palavras nas de aparelho e cidade, 380 a 520 nos combos, zero frase repetida. Ranking com os 25 provedores reais em HTML estático (ver [[cliquex-provedores-clientes]]), 10 com link de cliente, 15 sem botão.

**Auditoria:** 115 HTML, 0 title/meta duplicados, descriptions 145 a 165, 1 H1 por página, canonical, OG/Twitter, schema WebSite+Organization+CollectionPage/ItemList+BreadcrumbList+FAQPage+Product+Review+ImageObject, sitemap com 115 URLs, fontes self-hosted (3 famílias), 0 travessões, 0 textos iniciando em minúscula, Googlebot 200.

**Manifest reconstruído sem o scratchpad antigo:** o `rblc_pages.json` tinha sumido; refiz as 111 páginas (30 aparelhos + 31 cidades + 50 combos) cruzando `D:/SITES/figa2023-next/data/pages.json` (que guarda slug, breadcrumb e home_anchor de cada página) com o `sitemap.xml` do `figa2023.pages.dev` (111 URLs do silo público, que separa do silo secreto de 42). Resultado em `silo_pages.json`. Os 25 provedores saíram da tabela da memória [[cliquex-provedores-clientes]], sem precisar recrawlear o rblc.

**Gotchas desta rodada:** (1) os subagents gravam temporários na MESMA pasta de saída, então o builder deve ler só os 7 lotes nominais (`dev1,dev2,city1,city2,combo1,combo2,combo3`), nunca `glob("*.json")`; (2) depois que o finalize self-hosta as fontes, o index perde o `<link>` do Google e o builder quebra ao reextrair: o builder passou a aceitar o bloco inline e o finalize a procurar o link em qualquer página; (3) a função `cabeca()` emitia preconnect do Google mesmo com fonte local, agora não emite; (4) 522 isolado numa página logo após o deploy é propagação da borda, repetir antes de investigar.

**NO AR em procrie.com.br (2026-10-09):** propagou no mesmo dia; CNAME apex + www criados na mão (o Cloudflare não cria sozinho), domínios custom anexados, certificado em poucos minutos. Conferido: 200 em home, aparelho, cidade, combo, legais, sitemap, robots e OG; www 301 para o apex preservando o caminho; Googlebot 200; woff2 `font/woff2`; HSTS ativo. IndexNow 200 com as 115 URLs. Segurança já aplicada na zona (skip de bot verificado, WAF anti-scanner, rate limit 200/10s, headers + CSP, SSL strict, HSTS, www→apex). Fonte em **`D:/SITES/procrie-metrica`** com README. Ver [[cliquex-silo-rblc-replicas]].
