---
name: cliquex-cloudflare-account2
description: Segunda conta Cloudflare da rede (além da conta principal) — usada em novos projetos/domínios
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-25T22:02:52.306Z
---

Além da conta Cloudflare principal (`011fa32b46296a88d9ec00fc1b136f64`, ver [[cliquex-cloudflare-optimization]]), há contas ADICIONAIS que o usuário vai usar em novos projetos. Sempre confirmar em qual conta está o domínio antes de mexer (consultar a zona por nome com o token de cada conta):
- **Conta 2**: account id `b7618ea1ee2e1df5a648e36c3a364474`.
- **Conta 3**: account id `c86b1054eae18a1b841c8f51128eb1a9`.
- **Conta 4**: account id `596a5e4f849bed8e02994fe62edebd2a`.
- **Conta 5**: account id `2307797988cf721a700cb98c92db11a7`. Domínios: `cabecadagua.com.br` (zona `5b41a57331475ca542d4b1956dfbf9e4`, template aquático #19, NS `bruce`/`magnolia`); `ciadetalentosproducoes.com.br` (zona `ef9033abb8b075a5eb94629ac424c1a2`, template showbiz #20); `leilopora.com.br` (zona `6e6a873e136e8259cd9927c7568b2faf`, template leilão #21). Todos NS `bruce`/`magnolia`. Ambos canônica apex, `pending` 2026-07-25, staged no VPS, A+opts+SSL flexible já aplicados → finalizar após NS propagar (`finalize_pending.sh cfg_<slug>.json <TOKEN_CONTA_5>`).

(O usuário às vezes pede pra "memorizar o token" — por segurança NÃO gravo o valor do token em plaintext aqui; ele fornece na hora e rotaciona. Guardo só o account id.)

O **token é fornecido pelo usuário na hora** (ele rotaciona depois) — NÃO guardar o token em memória.

Mesmo playbook da conta principal para NOSSOS domínios: A apex+www proxied → VPS `45.142.141.184`, otimizações (brotli/http3/early_hints/tls1.3/min1.2/always_https/auto_https_rewrites/opportunistic/browser_check/email_obfuscation, **rocket_loader off**), Bot Fight Mode (`fight_mode`+`enable_js`). SSL: `flexible` enquanto a origem só tem HTTP (zona `pending`/sem cert); trocar para `strict` depois do certbot. Ver [[cliquex-landing-pages]] e [[cliquex-deploy]].

Primeiros domínios (ambos **NO AR** desde 2026-07-25: cert LE, HTTPS+catch-all, SSL strict, WAF baseline com Googlebot liberado, IndexNow 202):
- Conta 2 → `agroshopacamargo.com.br` (zona `feaabb0f7bb22706c4344b9d7f14d34d`); `compdistribuidora.com.br` (zona `effd3e573575f1613ba5dc76795c63e9`, canônica **www**, template distribuidora #16, `pending` 2026-07-25 → finalizar).
- Conta 3 → `consultoriaflorapura.com.br` (zona `f9de6430ee6401e2631ab4589ab9297d`); `conviteriadaline.com.br` (zona `1acba5274fe25a1c17651be3532721b5`, canônica apex, template conviteria #17, `pending` 2026-07-25). **Tinha subdomínio `blog.` com 527 backlinks (Blogger antigo)** → criado A record `blog.` proxied + **Redirect Rule 301 `blog.*`→home** (phase `http_request_dynamic_redirect`, roda no edge, captura os backlinks sem precisar de cert na origem).
- Conta 4 → `replicasderelogiostop.com.br` (zona `2c29a6f6a8ac1180b07d1243776472c7`; template luxo #15); `jcrgs.com.br` (zona `f3b7ae8feb287f6a77dacb60e8fa7c5d`, canônica apex, template suíço #18). Ambos NS `major.ns.cloudflare.com` / `mckinley.ns.cloudflare.com`, `pending` em 2026-07-25, staged no VPS → finalizar (certbot + HTTPS + SSL strict + WAF baseline SEM Chrome/150 + IndexNow).
