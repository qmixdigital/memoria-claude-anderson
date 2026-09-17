---
name: camilafarias-gsc-acesso
description: Como acessar o Google Search Console de camilafarias.com.br por API (qual service account funciona)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1128f36a-6811-4c97-80fb-2b9faaccef16
  modified: 2026-08-25T12:48:51.703Z
---

O Search Console de **camilafarias.com.br** é acessível por API sem login manual.

- Propriedade: **`sc-domain:camilafarias.com.br`** (tipo domínio). Por ser sc-domain, **cobre site institucional E `blog.camilafarias.com.br` no mesmo dataset** — separar por host na análise, senão o diagnóstico mistura conteúdo local com informacional.
- **Só a conta `backlinkguard` enxerga essa propriedade** (permissão `siteFullUser`). A conta `enjai-ga4-reader` **não** tem acesso: não adianta iterar as duas aqui.
  - `D:\SISTEMAS\MinhasHospedagens\Google-Service-Accounts\backlinkguard-google-sa.json`
  - Escopo: `https://www.googleapis.com/auth/webmasters.readonly`
- Havia cópias das credenciais soltas em `C:\Users\User\Desktop` (`backlinkguard-google-sa.json`, `enjai-493011-*.json`). Usar sempre as de `MinhasHospedagens\Google-Service-Accounts`, que é o lugar oficial.
- Vantagem sobre a exportação em zip: a API entrega o cruzamento **`dimensions: ["query","page"]`**, que a exportação não tem. Isso resolve canibalização por dado direto, sem precisar do Jaccard de slug descrito no skill `google-console-analise`.
- Detalhes de uso (paginação de 25 mil linhas, `dataState: "final"`, janela terminando em hoje menos 3 dias) estão no README da pasta das contas de serviço.

Ver [[camilafarias-gsc-diagnostico-2026-08]] e [[camilafarias-deploy]].
