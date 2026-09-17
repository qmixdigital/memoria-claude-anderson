---
name: credencial-search-console
description: A service account que le o Search Console da rede esta no Desktop (enjai-493011-5bc78ff8f355.json); em 16/08/2026 ja enxergava infobrasil.inf.br
metadata: 
  node_type: memory
  type: reference
  originSessionId: 8f6de13c-0ddd-4ee5-b99d-75b102eb9220
  modified: 2026-08-16T08:27:48.811Z
---

A credencial de leitura do Google Search Console de toda a rede e a service
account `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com`. Ha duas copias
da MESMA chave (`private_key_id` 5bc78ff8):

- **`C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json`** — use esta
- `/root/enjai-ga4-credentials.json` na VPS srv1166087 — copia de reserva

**Why:** O nome dos arquivos fala em "ga4", nao em Search Console, entao busca
por "gsc" ou "search console" nao encontra. Perdi tempo procurando no servidor
antes de descobrir a copia no Desktop. Usar a local evita SSH, e o servidor
**nao tem pip nem google-auth** (a maquina local tem Python 3.13 com a lib).

**How to apply:** Escopo `https://www.googleapis.com/auth/webmasters.readonly`.
As propriedades sao do tipo `sc-domain:`, entao (a) o siteUrl precisa de
`urllib.parse.quote(siteUrl, safe="")` na URL da API e (b) o property **inclui
os subdominios**, sendo preciso separar por dimensao `page` para comparar site e
blog. Em 16/08/2026 enxergava 18 propriedades, incluindo
`sc-domain:infobrasil.inf.br` como `siteFullUser`.

Existe uma memoria mais antiga no projeto `d--GitHub-tiagobernardes` listando 9
propriedades: aquela lista esta defasada, a conta ganhou acesso a mais sites.

Ver tambem [[redis-compartilhado-srv1166087]].
