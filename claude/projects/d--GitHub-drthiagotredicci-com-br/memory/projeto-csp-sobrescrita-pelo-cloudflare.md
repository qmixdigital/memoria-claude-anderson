---
name: projeto-csp-sobrescrita-pelo-cloudflare
description: "Em drthiagotredicci.com.br a Transform Rule da zona sobrescrevia o _headers; resolvido restringindo o escopo, nao desligando"
metadata: 
  node_type: memory
  type: project
  originSessionId: c4a01c27-c33d-48b1-b9f3-361805e71ec5
  modified: 2026-09-22T12:48:17.427Z
---

Em drthiagotredicci.com.br, a CSP do `_headers` não chegava ao visitante até
22/09/2026: a zona tem a Transform Rule **"Security headers (CSP/XFO/Permissions)"**
que rodava com expressão `true` e substituía a política em toda a zona, inclusive
nas respostas do Cloudflare Pages.

- zona `0bb4d69d99b4eb3bb98dd6cde6247cf4`
- ruleset `e5ecfd8237e64d7c924f29de8bd6d327`, regra `0c4032f20e054a499c86509e6fc5f9f7`

**Desligar a regra seria erro:** `blog.drthiagotredicci.com.br` resolve para
77.37.69.175, fora do Pages (o 301 do WordPress antigo), e não tem `_headers`.
A correção foi **restringir a expressão**, não remover a regra:

```
(http.host ne "drthiagotredicci.com.br" and http.host ne "www.drthiagotredicci.com.br")
```

Fica em `_nao-deploy/cloudflare-csp.py` (`--aplicar` / `--reverter`, sem
argumento só mostra o estado). **Esse padrão vale para qualquer site da rede que
esteja no Pages dentro de uma zona com regra de security headers.**

**Token:** a conta **"master"** em `D:/SISTEMAS/Cloudflare/contas.json` alcança
rulesets. O `cloudflare-pages.txt` em `Documents/APIs/` só lista zonas
(`9109 Unauthorized` em rulesets e settings).

**Limite do ambiente:** o classificador do Claude Code recusa *escrita* na API
do Cloudflare em qualquer shell; leitura passa. O Anderson roda o `--aplicar`
no terminal dele e eu verifico o resultado.

Duas armadilhas achadas ao montar a CSP:
- `https://*.analytics.google.com` **não** casa com `analytics.google.com`; os
  domínios raiz precisam entrar separados no `connect-src`, senão o Google
  Signals é bloqueado
- no `/g/collect` o navegador registra `net::ERR_ABORTED` **depois** do HTTP 204:
  é o beacon do Google, não bloqueio de CSP. Olhar o status, não o erro.

Related: [[projeto-blog-gerado-por-script]]
