---
name: project_resend_dominios
description: "Resend = 1 conta só p/ os 4 sites (Pro 50k/mês); portuga+skipark tinham e-mail QUEBRADO (domínio não verificado), corrigido 2026-08-04"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-08-10T18:27:32.769Z
---

**Resend (2026-08-04):** os 4 sites SMM compartilham **UMA conta Resend** (mesma `RESEND_API_KEY=re_JJTwPtNk...`, região sa-east-1). Plano **Pro: 50.000 transacionais/mês ($20)** + Marketing grátis só 1.000 contatos (por isso campanhas grandes usam a API transacional, não Broadcasts). API não expõe plano/cota (`/account`=405); ver painel `resend.com/settings/billing`. **Cloudflare/WAF na frente do Resend bloqueia User-Agent `python-urllib` (erro 1010)** → sempre setar UA `curl/8.4.0` nas chamadas por urllib.

**BUG corrigido:** só `enjai.com.br` estava verificado; **portugaldigital.com.br, skipark.com.br e truenet.com.br enviavam de `noreply@SEU-DOMINIO` mas NÃO estavam verificados → todos os e-mails transacionais (pedido/pagamento/entrega) desses 3 sites falhavam em silêncio** (403 "domain is not verified"), provável desde a migração. Em 2026-08-04 verifiquei **portuga + skipark**; em 2026-08-09 verifiquei **truenet** também (zona CF ativa `aebe9eab3457466a0f7aed1aaaeaa459`, token dedicado `<<REMOVIDO>>` — não está no contas.json, está na infra do truenet). **Agora os 4 domínios verificados.** Registros no Cloudflare via API: `resend._domainkey` (DKIM TXT), `send` MX→feedback-smtp.sa-east-1.amazonses.com, `send` TXT SPF. Verificou em ~100s. Teste de envio dos 2 = OK.

**Cloudflare:** zonas de portuga+skipark estão na **conta3** (`D:/SISTEMAS/Cloudflare/contas.json`, token `cfat_y44ZH1r...`); portuga zone `13fe70e2cc7a817df8a01817edf89dc7`, skipark zone `bc2ff4d7a5277eeea9ff1120c0bc4eb9`. enjai=conta27, truenet=conta26 (moved). Contexto: [[project_login_gate_ferramentas]] campanha de reativação (cupom 30%) que motivou o conserto.
