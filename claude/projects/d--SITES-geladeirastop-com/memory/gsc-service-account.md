---
name: gsc-service-account
description: Credencial de service account para a API do Google Search Console, com acesso a 83 propriedades
metadata:
  type: reference
---

API do Google Search Console: service account em
`C:\Users\User\Desktop\backlinkguard-google-sa.json`
(`backlinkguard@backlinkguard.iam.gserviceaccount.com`, projeto `backlinkguard`).

Dá acesso a **83 propriedades**, entre elas `sc-domain:geladeirastop.com` com
permissão `siteFullUser`. Escopo `webmasters.readonly`. As libs
`google.oauth2.service_account` e `googleapiclient.discovery` já estão instaladas
no Python do sistema.

Serve para `searchanalytics.query` (dimensões page/query/date, `type` web ou
image) e `urlInspection.index.inspect` (status real de indexação).

Atenção: a propriedade é do tipo **domain** (`sc-domain:`), não URL-prefix, então
o `siteUrl` na chamada precisa vir exatamente como `sc-domain:geladeirastop.com`.

Não confundir com `D:\SISTEMAS\GOOGLE SEARCH CONSOLE\`, que é outra ferramenta:
`gsc_anchors.py` lê CSV **exportado** do Console para gerar texto âncora de
backlink, e não fala com a API.
