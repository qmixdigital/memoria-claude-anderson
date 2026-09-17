---
name: gsc-service-account
description: Chave da service account Google (Search Console/GA4) para autenticar via API em qualquer projeto
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1c15d1b5-4f6a-4b2e-86d9-fb1e56d41f21
  modified: 2026-08-14T11:58:10.877Z
---

**Service account Google** para Search Console e GA4, usar sempre que o Anderson pedir análise de GSC/GA4 de qualquer projeto:

- E-mail: `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com`
- Chave JSON: `C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json`
- Scope GSC: `https://www.googleapis.com/auth/webmasters.readonly`
- Python com `google-auth` já instalado na máquina (Python 3.13)

Snippet de autenticação que funcionou (14/08/2026):

```python
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
creds = service_account.Credentials.from_service_account_file(
    r"C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json",
    scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
s = AuthorizedSession(creds)
# listar propriedades: GET https://searchconsole.googleapis.com/webmasters/v3/sites
# performance: POST .../sites/<url-encoded>/searchAnalytics/query
# inspeção de URL: POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
```

Propriedades acessíveis (14/08/2026): wtw19.com.br (URL-prefix), adonline, bitcao, casasderecuperacao, clinicasrecuperacaosaopaulo, coegoiania, drtiagobernardes, enjai, marianacabraldermato, masterjuris, portugaldigital (restrito), skipark, truenet (domain properties). Se um domínio não aparecer na lista, pedir ao Anderson para adicionar a service account como usuário na propriedade.
