---
name: cliquex-silo-rblc-replicas
description: Playbook e lista de sites onde o silo de 110 páginas do rblc foi replicado
metadata:
  type: project
---

**PLAYBOOK — replicar o silo de 110 páginas do rblc.com.br em outro site.** O rblc (nº1 em "teste iptv") tinha 110 páginas `/teste-iptv-*` (30 aparelhos/apps + 31 cidades + 49 combos app+cidade) + termos + privacidade. O manifest fica em `scratchpad/rblc_pages.json` (slug, kw, type, home_anchor único do pool de 239) e os lotes p/ subagents em `scratchpad/rblc_batches/*.json`.

**Sites com o silo (cada um com CONTEÚDO PRÓPRIO e design próprio, nunca duplicar texto entre eles):**
| site | conta CF | design | tom do conteúdo |
|---|---|---|---|
| testeiptv.wales | 39a13af3 | marrom-chocolate + cobre/latão (Marcellus) | original/SEO agressivo |
| unisuamnews.com.br | 39a13af3 | claro "broadcast" vermelho (Bricolage) | editorial/jornalístico |
| cineterreiro.com.br | 39a13af3 | cinema escuro dourado (Fraunces) | prático/guia do consumidor |
| figa2023.com.br | 39a13af3 | midnight neon azul/ciano (Sora) | conciso/benefícios |
| brooklin.net.br | Bruna ff7a119 | cream + violeta/coral (Bricolage) | amigável/explicativo |
| cieh.com.br | Endrick 011fa32b46296a88d9ec00fc1b136f64 | dark + lime (#cdf94d, Bricolage/Manrope/JetBrains) | técnico/especificações |
| trabalhonojapao.com.br | Endrick 011fa32b | papel washi claro + indígo/vermelhão (DM Serif/Outfit) | comparativo/analítico |
| fanese.com.br | Endrick 011fa32b | dark ameixa + magenta/lilás (Archivo/Epilogue) | passo a passo/tutorial |

**PROCEDIMENTO (para site JÁ EXISTENTE, tipo brooklin/cieh):**
1. Achar zona + projeto Pages. **GOTCHA: `/pages/projects` é PAGINADO** — se o projeto não aparecer na lista, usar `GET /accounts/{acc}/pages/projects/{nome}` direto.
2. Mirror do site atual (é direct_upload, o redeploy substitui TUDO): baixar home de `<proj>.pages.dev` + todos os assets referenciados (favicons, imagens, manifest, robots, og).
3. Gerar conteúdo com 7 subagents (dev1/dev2/city1/city2/combo1/combo2/combo3) num dir próprio, **tom distinto dos outros sites**. GOTCHA: os agentes gravam temporários com nomes genéricos no mesmo dir e se sobrescrevem — limpar tudo que não sejam os 7 lotes antes do build.
4. Builder derivado do `uni_builder.py` (trocar D/SITE/glob/theme-color/og/site_name/FAV + EXTRA_CSS com os tokens de cor DO SITE) + finalize (silo-nav estilizado no tema + sitemap 113 + robots).
5. Legais (termos/privacidade) no tema do site; chave IndexNow `<<REMOVIDO>>.txt`.
6. Schema rich-results na home: **Product + AggregateRating + AggregateOffer + Review + ImageObject** (valores diferentes por site) + FAQPage em JSON-LD se só houver microdados.
7. **REDIRECT (crítico):** se a zona tiver catch-all, ele 301a `/teste-iptv-*` e MATA o silo → reconfigurar: rule1 www→apex (preserva caminho), rule2 catch-all EXCLUINDO `/teste-iptv-` + legais + assets. Se a zona não tiver regra (cieh), só adicionar www→apex.
8. Deploy (master token `cfut_reEz` alcança 39a13af3, Bruna e Endrick por NOME), purge, IndexNow (113 URLs), auditoria SEO.

**cieh.com.br (2026-08-29):** silo adicionado. Zona `5bb0678288ac6a1f733578412b5ab793`, projeto `cieh` (direct_upload). Só tinha `favicon.svg` → **gerei o set completo** (ico + PNG 16..512 + apple-touch) replicando o mark (TV lime com play sobre #0a0b0d) e atualizei manifest+links. Home já tinha CollectionPage/HowTo/FAQPage/VideoObject (vídeo = embed do cadernos), adicionei Product/Review/ImageObject. Auditoria: 110/110, 113 págs, 0 dup títulos/metas, títulos 20-60, metas 117-160 (trimei 1 de 186). Deploy 125 files, www→apex criado, purge, IndexNow 200. Ver [[cliquex-testeiptvwales]], [[cliquex-conta-bruna]].

**PERFORMANCE / CORE WEB VITALS (cieh, 2026-08-29) — receita que funcionou e vale p/ a rede toda:** auditoria PageSpeed mobile do cieh saiu **82 de performance, LCP 3,7s, FCP 3,0s, CLS 0,064**. O gargalo NÃO era o hero (já preloadado) e sim o **CSS do `fonts.googleapis.com` (render-blocking de terceiro)**. Sequência aplicada e o efeito medido:
1. **Enxugar pesos de fonte** (pedir só os weights realmente usados no CSS): CLS 0,064→0,034 e SI 3,5→3,0.
2. **Self-hostar as fontes (WOFF2 local)** — é o padrão do CLAUDE.md e foi o maior ganho: baixar o CSS do Google com UA de Chrome, manter só os blocos `latin`/`latin-ext`, baixar os woff2 pra `/fonts/`, reescrever os `url()` e **inlinar o `@font-face` no head** (removendo o `<link>` e os preconnect), mais `<link rel="preload" as="font" type="font/woff2" crossorigin>` das 2 fontes latinas críticas (display + body). Resultado: **Performance 83→90, FCP 3,0→1,8s, SI→2,0s, CLS→0**.
3. **Hero responsivo**: gerar variantes 640/900px e usar `srcset`+`sizes` no `<img>` e `imagesrcset`+`imagesizes` no preload. Hero no mobile 103KB→**19KB**, LCP 3,5→3,2s.
4. Vídeo externo abaixo da dobra com `preload="none"`.
**Placar final cieh: Performance 90, SEO 100, Acessibilidade 95, Boas práticas 100, CLS 0, TBT 0, FCP 1,8s, LCP 3,2s.** (LCP no lab do PageSpeed é pessimista: 4G lento + CPU 4x.) **Os outros 5 sites da rede ainda usam Google Fonts via `<link>` — aplicar o passo 2 neles deve render o mesmo ~+7 de performance.**

**Hardening que faltava no cieh (achado na auditoria):** a zona estava com **SSL `full` (não strict)**, **security_level `high`** e **Browser Check ON** (risco de desafiar crawler). Corrigido: SSL strict, HSTS 1 ano + preload, TLS 1.2, security medium, BIC off, DNSSEC, WAF com skip de bots verificados + anti-scanner, e canônica www→apex (a zona não tinha nenhuma redirect rule).

**FONTES SELF-HOSTED APLICADAS NA REDE (2026-08-29):** rodei a receita nos 5 sites restantes (testeiptv.wales, unisuamnews, cineterreiro, figa2023, brooklin) — script genérico: lê o `<link>` do Google Fonts do próprio index, baixa o CSS com UA de Chrome, mantém só `latin`/`latin-ext`, baixa os woff2 pra `/fonts/`, reescreve os `url()`, inlina o `@font-face`, remove link+preconnects e faz preload das latinas das 2 PRIMEIRAS famílias do request (display+body). 113 páginas por site. Resultado medido: **testeiptv.wales Perf 95 / LCP 2,4s / FCP 1,5s / CLS 0** e **figa2023 Perf 97 / LCP 2,0s / FCP 1,5s / CLS 0** (ambos com LCP DENTRO da meta de 2,5s), SEO 100 nos dois.

**GOTCHA CRÍTICO — o catch-all também mata `/fonts/`:** depois do deploy, 4 zonas (unisuam, cineterreiro, figa2023, brooklin) devolviam **301 nos `/fonts/*.woff2`** porque o catch-all redireciona qualquer caminho não-excluído pra home. Os sites ficaram renderizando com fonte de fallback até eu adicionar `and not starts_with(http.request.uri.path, "/fonts/")` na expressão do catch-all das 4 zonas. **Regra: ao adicionar QUALQUER diretório novo de assets (fonts/, videos/, css/...) num site com catch-all, excluir o prefixo na regra ANTES/junto do deploy, e sempre validar o content-type do asset (`200 font/woff2`), não só o HTML.** O testeiptv.wales não sofreu porque o catch-all dele já tinha virado só www→apex.

**Sites 7 e 8 (2026-09-02):** trabalhonojapao.com.br e fanese.com.br saíram do zero com os scripts genéricos `nb_*.py` (builder/finalize/assets/fonts/deploy/harden parametrizados por site, em vez de um builder por site). Fontes self-hosted, vídeo no hero e schema de rich results já no primeiro deploy. Ver [[cliquex-japao-fanese]].
