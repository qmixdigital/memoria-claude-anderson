---
name: gsc-service-account
description: "Service account com acesso à API do Google Search Console (14 propriedades, incl. ferramentas.qmix.com.br)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: c6b23644-4824-4a6f-a4d6-3fe001badf50
  modified: 2026-08-30T13:26:11.714Z
---

Credencial para a **API do Google Search Console**. Os JSONs foram MOVIDOS do Desktop para **`C:\Users\User\Documents\APIs\`** (2026-08-30) — cópia também em `D:\SISTEMAS\MinhasHospedagens\Google-Service-Accounts\`. Dois SAs:
- `enjai-493011-5bc78ff8f355.json` (e-mail `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com`) — acesso a `https://ferramentas.qmix.com.br/` (siteFullUser) + sc-domain:qmix.com.br (full user) e muitos outros.
- `backlinkguard-google-sa.json` — **owner** de `sc-domain:qmix.com.br` e `sc-domain:qmixdigital.com.br` (use este para o domínio principal; a nota antiga de que "qmix.com.br não está na lista" está desatualizada).

Uso (google-auth já instalado no Python):
```python
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
creds = service_account.Credentials.from_service_account_file(CAMINHO, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
s = AuthorizedSession(creds)
s.post('https://searchconsole.googleapis.com/webmasters/v3/sites/URL_ENCODADA/searchAnalytics/query', json={...})
```

Propriedades acessíveis (2026-08-14): `https://ferramentas.qmix.com.br/` (siteFullUser), sc-domain de bitcao.com.br, drtiagobernardes.com.br, casasderecuperacao.com.br, clinicasrecuperacaosaopaulo.com, coegoiania.com.br, marianacabraldermato.com.br, masterjuris.com.br, skipark.com.br, truenet.com.br (owner), enjai.com.br, adonline.com.br, wtw19.com.br (full user), portugaldigital.com.br (restrito).

Para o domínio principal e o subdomínio de ferramentas, usar o `backlinkguard-google-sa.json` (owner de sc-domain:qmix.com.br) ou o enjai SA (full user).

A API key em [[pagespeed-api-key]] é só do PageSpeed e NÃO funciona no GSC (401, API keys not supported).
