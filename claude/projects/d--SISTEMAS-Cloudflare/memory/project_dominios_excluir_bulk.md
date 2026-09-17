---
name: project-dominios-excluir-bulk
description: Domínios que NÃO devem entrar em operações de bulk redirect (estão hospedando sites reais via Auto Cloudflare na conta TRAFEGOPAGO/conta3)
metadata: 
  node_type: memory
  type: project
  originSessionId: a0f6cd48-4ea9-4540-bfc9-1e96ba07e916
---

Os seguintes domínios estão hospedando sites reais (Auto Cloudflare na conta TRAFEGOPAGO/conta3) e **NÃO devem ser incluídos em operações de bulk redirect**:

- `unidosdoviradouro.com.br`
- `unespciencia.com.br`

**Why:** o usuário moveu esses domínios para hospedar sites próprios via Auto Cloudflare. Antes faziam parte do pool de ~125-128 domínios que eram trocados em massa para diferentes destinos a cada operação de funneling SEO.

**How to apply:** ao varrer todas as contas para identificar domínios apontando para um destino X (e trocar para Y), filtrar excluindo essa lista. Se o usuário fornecer uma lista de domínios para trocar em massa, conferir se algum desses está na lista — se sim, alertar antes de prosseguir.
