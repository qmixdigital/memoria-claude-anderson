---
name: cloudflare-toolkit-local
description: Onde ficam token e scripts da API Cloudflare no PC do usuário (não estão nas pastas dos sites)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 75534bf0-7c0e-4e2d-9ec9-1b391ecce73e
  modified: 2026-08-06T11:40:25.899Z
---

Todo o acesso à API da Cloudflare mora em `d:\SISTEMAS\Cloudflare\` — **não** nas pastas dos sites. Levou muitas buscas para achar; procure aqui primeiro.

- `.token_master` — token de usuário (`cfut_…`), `active`, enxerga **77 contas**. É o que usar por padrão.
- `.env` — `CF_API_TOKEN`/`CF_ACCOUNT_ID` (conta "Anderson Alves"), par de teste, e o user token.
- `contas.json` — 27+ contas mapeadas, cada uma com token e account_id próprios.
- Scripts prontos: `cf_redirects.py`, `harden_site.py`, `waf_master.py`, `cache_master.py`.

Segredos estão no `.gitignore` e a pasta não é repo git. O `.env` tem chave secreta do R2 em texto livre no meio do arquivo.

Coordenadas usadas com frequência:
- Zona `qmix.com.br` → `f5f7d6c9deebedfb89f5f3b6b0884a23`
- Conta **QMIX** → `2ff4c5d06407622c756c5b57c46924a5` (plano Pro, já tem 10 projetos no Pages)

Deploy no Pages funciona por `npx wrangler` (4.119, Node 22 instalados). Subdomínio novo leva ~30s para responder 200 — antes disso devolve 522, o que é normal e não é erro.

Voz e imagem ficam em outro lugar: veja [[qmix-voz-elevenlabs]].
