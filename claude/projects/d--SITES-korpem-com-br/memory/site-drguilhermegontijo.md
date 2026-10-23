---
name: site-drguilhermegontijo
description: "Site do Dr. Guilherme Gontijo criado em 22/10/2026 (pasta, repo, projeto Pages, pendências CRM/GA4/domínio) e como ele se liga à Körpem"
metadata:
  node_type: memory
  type: project
  originSessionId: 15fb87de-3a06-48aa-b9f4-b559f307af56
  modified: 2026-10-22T10:01:51.546Z
---

Site estático do Dr. Guilherme Gontijo (cirurgião de coluna da Körpem) em
`D:\SITES\drguilhermegontijo`, gerado por `scripts/build.py` + `scripts/content.py`
(textos originais, não copiados da página dele no korpem.com.br). Repo privado
`qmixdigital/drguilhermegontijo.com.br`; Pages `drguilhermegontijo-preview` na conta
Médicos BH (criado pela API); deploy por `bash scripts/deploy.sh` (token de
`D:/SISTEMAS/Cloudflare/contas.json`). Preview: https://drguilhermegontijo-preview.pages.dev

Paleta da Körpem invertida ("Nogueira e Latão"): cabeçalho, hero e rodapé escuros.
Montserrat + Inter locais em `fonts/` com fallback de métricas (CLS 0); CSS inteiro inline.

**Pendências (22/10/2026):** CRM-MG/RQE (`CRM` em build.py), GA4 (`GA_ID` em js/main.js),
domínio assumido `drguilhermegontijo.com.br` (DOMAIN em build.py, robots.txt); WhatsApp e
endereço são os da Körpem. Körpem já linka para o preview (faixa de especialistas em 31
páginas, página /dr-guilherme-gontijo e sameAs); na virada de DNS trocar para o domínio.
Originais (JPEG/PDF de certificados) em `_originais/`, fora do git.

**How to apply:** ao mexer nesse site, editar content.py/build.py e rodar o build (ele
falha em title > 60, description fora de 150-160, travessão, link repetido, órfã, âncora > 2x).
