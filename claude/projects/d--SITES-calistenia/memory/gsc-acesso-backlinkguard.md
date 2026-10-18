---
name: gsc-acesso-backlinkguard
description: calistenia.ia.br no Search Console pela API: a service account backlinkguard foi verificada por arquivo em 16/10/2026 (única com Site Verification API ligada); revisita salva em D:/PORTAIS/BACKLINKS, remedir em meados de novembro.
metadata:
  type: project
---

Nenhuma SA da QMIX tinha acesso ao GSC do calistenia. A `backlinkguard` é a única com a
Site Verification API habilitada; verifiquei o site por arquivo
(`public/google9b0343736e726e3f.html`) e ela virou dona de `https://calistenia.ia.br/`
e lê `sc-domain:calistenia.ia.br`. Exportar `BACKLINKGUARD_GOOGLE_SA` com o caminho
do json antes de rodar `gsc_api.py` / `revisita.py`.

**Why:** a skill google-console-analise espera as chaves por variável de ambiente
(cofre), e o Anderson quer análise por query + página, que só a API dá.

**How to apply:** o mesmo truque serve para qualquer site da rede sem acesso: token
FILE pela backlinkguard, arquivo em `public/`, `siteVerification.webResource.insert`
e depois `sites.add`. Primeira revisita do calistenia em 16/10/2026 (titles e
expansões aplicados no mesmo dia); remedir por volta de 15/11/2026. Ver
[[pro-primeiro-assinante]].
