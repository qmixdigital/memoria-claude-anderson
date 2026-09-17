---
name: gsc-service-account
description: Conta de serviço que dá acesso de leitura ao Search Console de 9 propriedades da rede QMIX
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1bfb62e1-547b-4306-a778-7d73d763dcaf
  modified: 2026-08-12T09:42:04.470Z
---

A chave em `C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json`
(`enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com`) tem acesso ao
**Search Console** de 9 propriedades, não só ao GA4 do enjai como o nome sugere:

`bitcao.com.br`, `casasderecuperacao.com.br`, `truenet.com.br`,
`portugaldigital.com.br` (restricted), `clinicasrecuperacaosaopaulo.com`,
`enjai.com.br` (full), `masterjuris.com.br`, `skipark.com.br`,
`drtiagobernardes.com.br` — as demais como `siteOwner`.

Uso: `google.oauth2.service_account` + `googleapiclient`, escopo
`https://www.googleapis.com/auth/webmasters.readonly`, `build("searchconsole","v1")`.
As propriedades são do tipo `sc-domain:`, então **incluem os subdomínios** — em
drtiagobernardes o property cobre site principal e blog juntos, e é preciso
separar por `page` para comparar os dois.
