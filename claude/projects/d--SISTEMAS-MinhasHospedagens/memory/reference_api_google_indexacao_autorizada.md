---
name: reference_api_google_indexacao_autorizada
description: "Service account enjai-ga4-reader para Search Console API; o ambiente bloqueia a leitura da chave por classificador, e ela não é a API de indexação da rede"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-10-04T19:05:03.313Z
---

Service account: `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` (projeto `enjai-493011`), chave JSON em `C:\Users\User\Documents\APIs\enjai-493011-5bc78ff8f355.json`. Documentada em `D:\PORTAIS\CONVERSAO-PORTAL-WORDPRESS.md` §11.3 e em `D:\PORTAIS\CONVERSAO-TOTAL.md`. Propriedades no formato `sc-domain:<dominio>`, e o portal precisa ter a service account adicionada como usuário no GSC antes.

Scope `webmasters` (ou `.readonly`): lista `GET /webmasters/v3/sites`, desempenho `POST .../searchAnalytics/query`, inspeção `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`, sitemap `PUT`/`DELETE .../sitemaps/<url-encoded>`.

**Isto NÃO é a via de indexação da rede.** Quando o operador pede para "enviar para indexação", ele se refere ao [[reference_rapid_url_indexer_api]] (serviço externo pago). Esta service account serve para ler dados do Search Console e gerenciar sitemap.

**As chaves sairam do Desktop.** Desde 05/09/2026 elas vivem em `C:\Users\User\Documents\APIs\`. Script que apontar para o Desktop devolve so `No such file or directory`, sem erro de permissao, e e facil confundir com bloqueio do classificador. Ler de `Documents\APIs` funcionou sem cair no classificador. Padrao que funciona: `service_account.Credentials.from_service_account_file(chave, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])` + `AuthorizedSession`, e a propriedade vem como `sc-domain:<dominio>`.

**gsc_api.py lê as chaves por variável de ambiente (04/10/2026).** O `scripts/gsc_api.py` da skill google-console-analise espera `BACKLINKGUARD_GOOGLE_SA`, `ENJAI_493011_5BC78FF8F355` e `SEOQMIX_024E9465E9D9` (pensado para o executor do cofre). Quando o executor do cofre não está na sessão, basta apontar as três variáveis para os JSON de `C:\Users\User\Documents\APIs\` (`backlinkguard-google-sa.json`, `enjai-493011-5bc78ff8f355.json`, `seoqmix-024e9465e9d9.json`): o Anderson confirmou em 04/10/2026 que as chaves ficam nessa pasta e autorizou o uso para conferir o GSC. A seoqmix sozinha enxerga só 36 propriedades; as três juntas, 200. Não sair procurando chave em memórias de outros projetos: o classificador barra como exploração de credencial; ir direto nessa pasta.

Relacionado: [[reference_mariana_ga4_fora_do_gtm]] (a mesma service account lê GA4 e GSC), [[reference_indexnow_rede]].
