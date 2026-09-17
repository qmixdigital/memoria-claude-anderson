---
name: gsc-service-account
description: Service account que dá acesso de leitura ao Search Console de 84 propriedades da rede
metadata: 
  node_type: memory
  type: reference
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T11:15:41.564Z
---

O acesso programático ao Google Search Console da rede é por service account:

- arquivo: `C:\Users\User\Documents\APIs\backlinkguard-google-sa.json`
  (**mudou de lugar**: até 19/08/2026 estava no Desktop e em 02/09/2026 já não
  estava mais lá. Script apontando para o Desktop quebra com `FileNotFoundError`.
  Se sumir de novo: `find C:/Users/User -maxdepth 3 -name backlinkguard-google-sa.json`)
- projeto: `backlinkguard`
- conta: `backlinkguard@backlinkguard.iam.gserviceaccount.com`
- escopo que funciona: `https://www.googleapis.com/auth/webmasters.readonly`

Enxerga **84 propriedades**, todas no formato `sc-domain:` (Domain property, não URL-prefix), a maioria como `siteOwner`. Inclui cirurgiacoracao, cirurgiadacatarata, cirurgiadecancer, medicinageriatrica, personalverificado, palpitemestre, encontreleiloes, qmix, euvo, e os portais de notícia.

Uso típico, com `google-api-python-client` (já instalado nesta máquina):

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build
cred = service_account.Credentials.from_service_account_file(SA, scopes=ESCOPO)
sc = build("searchconsole", "v1", credentials=cred, cache_discovery=False)
sc.searchanalytics().query(siteUrl="sc-domain:dominio.com.br", body={
    "startDate": ..., "endDate": ..., "dimensions": ["page"],
    "rowLimit": 25000, "startRow": 0, "dataState": "all"}).execute()
```

Pagine com `startRow` de 25.000 em 25.000. **A API não expõe o relatório de links (backlinks)** — só desempenho, cobertura e inspeção de URL. Para backlink, é Ahrefs ou DataForSEO.

Ver [[cirurgiacoracao-criterio-poda]].
