---
name: ga4-linhagens-de-medicao-rede
description: "Qual engajamento.js usar num site novo para o relatório mensal ler tudo (linhagem do Dr. Henrique, não a do Dr. João Lopo) e como a propriedade GA4 é configurada por API"
metadata:
  node_type: memory
  type: project
  originSessionId: 8972f176-a5d0-461d-a8f9-60a0544ff3b0
  modified: 2026-10-22T21:44:18.298Z
---

Na rede há duas linhagens de medição GA4 em sites estáticos, e só uma fala a língua do
relatório mensal (`D:/SISTEMAS/Relatórios de Clientes/monitor-ia/google_dados.py`):

- **Dr. Henrique Cembranelli** (`D:/SITES/henriquecembranelli.com/js/engajamento.js`, 298 linhas,
  "ampliado"): envia `secao_vista`, `cta_visto`, `permanencia/segundos`, `copiar_texto/trecho`,
  `pagina_404/referencia`, e o `main.js` dele manda `tipo_pagina` e `tema` em todo evento. São
  exatamente os nomes que o relatório lê. **É a base para site novo.**
- **Dr. João Lopo** (`metricas.js`): `rolagem`, `web_vital`, `copia/tipo_copia`, `previa_doenca`,
  `erro_404/origem`. O relatório ignora `copia` e `erro_404`. Só vale aproveitar `web_vital` e
  `previa_doenca`.
- O `engajamento.js` de `Relatórios de Clientes/rastreio-cliques/` é a versão base (204 linhas),
  sem os extras.

Propriedade nova por API (conta `enjai-493011-5bc78ff8f355.json`, Admin API v1beta): copiar as
dimensões da propriedade de referência (`customDimensions().list` + `create`), criar a métrica
`valor`, `updateDataRetentionSettings` para FOURTEEN_MONTHS e `keyEvents().create` com
`generate_lead`. `displayName` só aceita letras, números, espaço e underscore (sem parênteses
nem acento). Dimensão que deixa de existir se arquiva com `customDimensions().archive`.

Feito em 22/10/2026 no drbernardoqueiroz.com.br (propriedade 560406109). O relatório ganhou no
mesmo dia dois cortes novos de `generate_lead`: `sessionSourceMedium` ("Origem exata") e
`customEvent:tema` ("Qual assunto"), que só aparecem quando há dado.

**Why:** copiei primeiro o `metricas.js` do João e só depois descobri que metade dos eventos não
entrava no relatório.
**How to apply:** em site novo, partir do `engajamento.js` do Henrique, adaptar seletores, e
conferir o site contra a lista de `corte_evento(...)` do `google_dados.py` antes de publicar.
