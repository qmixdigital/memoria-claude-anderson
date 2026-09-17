---
name: pagespeed-api-key
description: Onde está a API key do Google PageSpeed Insights para medir Core Web Vitals do qmix
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
---

A API key do PageSpeed Insights (projeto GCP `qmix-seo`, conta qmixdigital@gmail.com) está salva em `D:\SISTEMAS\Google\pagespeed.json`.

Uso: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&strategy=mobile&key=API_KEY` (também `desktop`). Sem chave, a API dá HTTP 429. Padrão das credenciais do usuário fica em `D:\SISTEMAS\` (ver também o Cloudflare em `D:\SISTEMAS\Cloudflare\contas.json`, conta `conta23`). Relacionado: [[qmix-inp-comprar-backlinks]].
