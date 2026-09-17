# Contas de serviço do Google — Search Console

Duas contas de serviço com acesso ao Search Console da rede. Guardadas aqui em
21/08/2026 para uso permanente; a origem era a área de trabalho, que não é lugar
de credencial.

## As duas contas

| Arquivo | Projeto | E-mail da conta de serviço | Propriedades |
|---|---|---|---|
| `backlinkguard-google-sa.json` | `backlinkguard` | `backlinkguard@backlinkguard.iam.gserviceaccount.com` | **83** |
| `enjai-493011-5bc78ff8f355.json` | `enjai-493011` | `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` | **88** |

**As duas se complementam, não se substituem.** Há propriedades em uma que não
estão na outra: no levantamento dos 17 portais do piloto, 12 vieram da
`backlinkguard` e 5 só existiam na `enjai`. Ao consultar a rede, itere as duas.

## Como usar

Escopo somente leitura: `https://www.googleapis.com/auth/webmasters.readonly`.
As propriedades são do tipo **domínio** (`sc-domain:exemplo.com.br`), não URL.

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA = r"D:\SISTEMAS\MinhasHospedagens\Google-Service-Accounts\backlinkguard-google-sa.json"
cred = service_account.Credentials.from_service_account_file(
    SA, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
svc = build("searchconsole", "v1", credentials=cred, cache_discovery=False)

# quais propriedades esta conta enxerga
for e in svc.sites().list().execute().get("siteEntry", []):
    print(e["permissionLevel"], e["siteUrl"])

# desempenho por query, 90 dias
r = svc.searchanalytics().query(siteUrl="sc-domain:barranews.com.br", body={
    "startDate": "2026-05-19", "endDate": "2026-08-17",
    "dimensions": ["query"], "rowLimit": 200, "dataState": "final",
}).execute()
```

Bibliotecas: `google-auth` e `google-api-python-client`, já instaladas na
máquina local.

## Armadilhas conhecidas

**Propriedade que a conta não enxerga.** Se um domínio da rede não aparecer em
`sites().list()`, a conta de serviço não foi adicionada como usuário naquela
propriedade. O conserto é no Search Console da propriedade: Configurações →
Usuários e permissões → adicionar o e-mail da conta de serviço.

**`dataState`.** Use `"final"` para número estável. O padrão inclui dados
frescos que ainda mudam, e comparação entre janelas fica ruidosa.

**Janela de 3 dias.** O Search Console não tem dado dos últimos ~2 a 3 dias.
Terminar a janela em `hoje - 3` evita medir período incompleto.

**Portal sem tráfego não tem nicho.** No levantamento de 20/08, cinco portais
tinham menos de 400 impressões em 90 dias. Abaixo desse volume o Search Console
não responde "qual é o nicho": não há dado suficiente, e forçar uma leitura ali
é inventar.

## Usos até agora

- **20/08/2026** — levantamento de nicho real dos 17 portais do piloto do motor
  de pautas. Resultado em `GOOGLE NEWS DISCOVERY/PROPOSTA-PILOTO.md` e dados
  brutos em `gsc_piloto.json`.
- **21/08/2026** — leitura de nicho dos 6 portais que publicaram, para
  restringir os assuntos de cada um ao que o Google já reconhece.
