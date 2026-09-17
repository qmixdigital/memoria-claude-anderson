---
name: cache-do-tratamentodor-e-no-cloudflare
description: "no tratamentodor o cache de página inteira é do Cloudflare, não do WordPress; e `curl -I` mente dizendo DYNAMIC"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3de5b85d-fd38-4889-9a60-0c132c894750
  modified: 2026-08-26T23:55:40.362Z
---

No tratamentodor.com.br o cache que segura conteúdo antigo é o **edge do
Cloudflare**, com uma regra de cache de HTML ativa. Purgar pelo WordPress não
resolve nada:

- o plugin LiteSpeed Cache **não está ativo** (só o `wp-seopress`), então
  `do_action('litespeed_purge_all')` é no-op;
- `wp cache flush`, `rm -rf wp-content/litespeed/*` e o cabeçalho
  `X-LiteSpeed-Purge: *` limpam camadas que não são a que está servindo;
- a origem (92.113.35.186) responde sempre atualizada; quem devolve versão
  velha é o Cloudflare.

**Why:** o diagnóstico engana duas vezes. `curl -I` (HEAD) devolve
`cf-cache-status: DYNAMIC`, sugerindo que o Cloudflare não cacheia; só o GET
completo mostra `cf-cache-status: HIT` com `Age`. E `?nc=` sempre traz conteúdo
novo, o que faz parecer que a publicação funcionou quando a URL limpa ainda
serve o anterior.

**How to apply:** para saber se é edge, comparar
`curl -s URL -D -` (mostra HIT/Age) com
`curl -sk --resolve tratamentodor.com.br:443:92.113.35.186 URL`. Se a origem
está certa e a URL pública não, o purge é no painel do Cloudflare, em Caching →
Configuration → Purge Everything. Não existe token do Cloudflare guardado: o
`.api_token` do servidor tem 20 caracteres e é da Hostinger. Relacionado a
[[rolar-devagar-para-medir-revelacao]], mesma família de medição que mente.
