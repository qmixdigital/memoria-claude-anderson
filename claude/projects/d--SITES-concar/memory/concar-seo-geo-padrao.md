---
name: concar-seo-geo-padrao
description: Como tratar SEO/GEO no projeto Concar e o escopo do usuário
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 24ee2264-5b12-4716-bf06-61ee77213ed9
---

No projeto **Concar**, `docs/09-seo-geo-recomendado.md` é o padrão SEO/GEO **autoritativo do parceiro do usuário** (especialista em GEO/SEO, "Anderson" na doc). Siga essa doc à risca; não invente abordagens de GEO próprias.

O usuário está **começando agora** no projeto e vai tocar **SEO, funcionalidades internas, marketing**. A parte de GEO/Organization JSON-LD é domínio do parceiro.

**Why:** o parceiro é o dono da estratégia; divergir do padrão dele gera retrabalho e risco de SEO.

**How to apply:**
- Mudanças GEO seguras/aditivas (Organization JSON-LD rico §4.4, llms.txt §9.4, endpoint `/<slug>.md` §9.4) podem ser feitas seguindo a doc.
- **NÃO** remova `FAQPage`/`HowTo` schema nem faça rewrites de conteúdo sem OK explícito — são decisões estratégicas com risco de SEO (estão listadas como "próximos" na seção 18 da doc 09).

Ver [[concar-infra-parceiro]].
