---
name: reference_mariana_cache_apo_lsws
description: marianacabraldermato.com.br tem 2 caches teimosos (LSWS origem + Cloudflare APO); ordem e método de purge
metadata: 
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-08-06T21:22:24.878Z
---

`marianacabraldermato.com.br` (site cliente, SSH `hostinger-mariana`, `/home/u761201864/domains/.../public_html`, Cloudflare **conta16** zona `535b38d536d9efcd87327f63226fb84a`) tem DUAS camadas de cache que resistem a purge simples:

1. **LiteSpeed LSWS (origem):** cache de página em nível de servidor (shared Hostinger). ⚠️ **`wp eval 'do_action("litespeed_purge_all")'` é NO-OP em wp-cli** — a purga do LiteSpeed depende de um header numa RESPOSTA HTTP, que não existe em contexto CLI. **`wp litespeed-purge url` reporta "Success" mas MUITAS vezes NÃO evicta** (LSWS shared ignora). **`wp litespeed-purge all` dá `Error: Got 403`** — NÃO é QUIC.cloud: o CLI faz self-request a `admin-ajax.php` pelo domínio público → passa pelo **Cloudflare, e a regra WAF que endurecemos (bloquear User-Agent vazio) devolve 403**. Loopback direto (`127.0.0.1`) dá 200. **O que FUNCIONA de fato (método nativo do LiteSpeed):** mu-plugin temporário que emite `header('X-LiteSpeed-Purge: *')` numa request front-end normal (hook `send_headers`/`init`), e aí `curl -A Mozilla "https://.../?mc_purge=SEGREDO"` — o UA de browser passa na WAF, o PHP roda, o LSWS lê o header na resposta e purga TUDO. Remover o mu-plugin depois. `--skip-plugins` DESATIVA o LiteSpeed (não use). Deletar `wp-content/litespeed/*` NÃO limpa. Nota: auto-purge de edição no wp-admin funciona (header in-request); só o wp-cli é que bate no 403.

2. **Cloudflare cacheando HTML.** Em 06/08/2026 o **APO está OFF**; quem cacheia agora é uma **Cache Rule** na zona, `"Cache HTML anonimo - otimizacao Mariana"` (fase `http_request_cache_settings`, `cache: true`, `edge_ttl.default: 7200` = **2 horas**, `mode: override_origin`). O efeito é o mesmo do APO: cacheia o HTML da **URL limpa** e serve do edge, inclusive replicando o header `x-litespeed-cache: hit` colado na cópia. Com **query-string** a regra não pega, então `?cb=...` sempre mostra o conteúdo real da origem. **`cf-cache-status` aparece como `DYNAMIC` mesmo servindo cópia velha** — não confie nesse header para concluir que o CF está fora do caminho. Purge por URL não basta; usar `{"purge_everything":true}`.

**Teste que resolve a dúvida em 10 segundos:** dois `curl` seguidos na URL limpa. Se vierem **byte a byte idênticos** (`md5sum` igual) é cópia estática de cache; se diferirem, é render fresco. E para saber se a cópia velha é da origem ou da borda: `ssh host` e `curl -sk -H "Host: dominio" -A Mozilla https://127.0.0.1/` — se o local vier novo e o público vier velho, o problema está na Cloudflare.

**Ordem correta (senão recacheia velho):** (a) purgar a ORIGEM LSWS pelo método nativo `X-LiteSpeed-Purge:*`; (b) confirmar origem fresh via loopback `curl -H "Host: dominio" -A Mozilla https://127.0.0.1/ -k` (deve dar `x-litespeed-cache: miss` + conteúdo novo); (c) SÓ DEPOIS `purge_everything` no CF; (d) re-primar com 1-2 curl na URL limpa (1º = MISS/fresh, 2º = HIT/fresh). Se purgar o CF com a origem velha, ele rebusca e recacheia o antigo.

Ver [[reference_webp_cloudflare_vary]] (outra pegadinha de cache CF na rede).
