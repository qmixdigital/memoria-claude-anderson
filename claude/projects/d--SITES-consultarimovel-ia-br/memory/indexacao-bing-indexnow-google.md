---
name: indexacao-bing-indexnow-google
description: "Como pedir indexacao do consultarimovel.ia.br: chave IndexNow e BingSiteAuth servidos pelo nginx, token do Bing vale para toda a conta, Indexing API do Google desligada no projeto seoqmix"
metadata:
  node_type: memory
  type: reference
  originSessionId: 4c2c3c43-1e33-4694-8b4b-8d6b832a0030
  modified: 2026-10-18T13:10:07.777Z
---

Feito em 18/10/2026 a pedido do Anderson ("envie para indexacao"):

- **IndexNow**: chave em `C:\Users\User\Documents\APIs\indexnow-consultarimovel.txt`,
  servida em `https://consultarimovel.ia.br/<chave>.txt` por `location =` no
  nginx (`/etc/nginx/conf.d/consultarimovel.conf`), arquivo em
  `/var/www/consultarimovel-shared/raiz/`. Arquivo novo em `public/` do Next
  da 404 ate o proximo boot do app, por isso o nginx serve direto. Envio:
  POST `https://api.indexnow.org/indexnow` com ate 10.000 URLs por lote; a
  lista usada (7.942 URLs: fixas, consultas, estados, municipios) sai dos
  sitemaps `/sitemap/<nome>/`. Logo apos hospedar a chave o IndexNow devolve
  403 "SiteVerificationNotCompleted"; passa em um minuto.
- **Bing Webmaster**: chave da API em `APIs\bing-webmaster-tools.txt` (73
  sites na conta). O token `msvalidate.01` e da CONTA, nao do site: esta em
  `APIs\bing-msvalidate-token.txt` (achado na home de 9 sites da rede) e
  serve para verificar qualquer dominio novo via `BingSiteAuth.xml`.
  Sequencia que funcionou: `AddSite`, `VerifySite` (devolve true),
  `SubmitFeed` (sitemap), `SubmitUrlBatch`. `GetUrlSubmissionQuota` da 404.
- **Google**: a service account `seoqmix` e siteOwner da propriedade e
  consegue reenviar o sitemap (`PUT .../sitemaps/<url>` com escopo
  `webmasters`, nao o readonly do gsc_api.py), mas a **Indexing API esta
  desligada no projeto 602974439419** e a conta nao tem permissao para
  ligar. Pedido de indexacao de URL avulsa so pela interface do Search
  Console (uns 10 por dia) ou se o Anderson ligar a API no console do GCP.

- **"Indexacao Apex"**, no vocabulario do Anderson, e o Apex Mode do
  **Rapid URL Indexer**, em `D:\SISTEMAS\INDEXADORES` (README com a chave,
  `scripts/submit_index.py <arquivo> "nome" --apex`, lista de URLs em
  `urls/<site>-<lote>-<data>.txt`). 3 creditos por URL no Apex, 1 no normal;
  saldo em 18/10/2026: 1.226 depois de enviar 17 URLs do consultarimovel
  (projeto 1261632). `scripts/check_index.py` confere indexacao via SerpApi.
  Nao e do Google: quando ele pede "enviar para indexacao", e isto.

**How to apply:** para pedir indexacao de paginas novas deste site: Rapid URL
Indexer com `--apex` para as que importam, IndexNow com a chave acima e
`SubmitUrlBatch` no Bing. Ver [[consultarimovel-estado-e-pendencias]].
