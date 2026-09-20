---
name: qmix-ferramentas-gsc-2026-09
description: "Análise GSC das ferramentas (18/09/2026), otimização feita nas 6 páginas maiores e plano das páginas novas (letras, dado online, contador de palavras)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 377b6f92-e010-4e92-b00d-68d18bd060f2
  modified: 2026-09-18T19:59:02.167Z
---

**Dados (90 dias até 16/09/2026, sc-domain:qmix.com.br, SA backlinkguard):** `letras-diferentes` 400k impressões/7.5k cliques (rankeia "letras personalizadas" 124k p5, "letras bonitas" 58k p7, "fontes de letras" 33k p8 sem ter as frases no H2); `simbolos-aesthetic` 273k/3.1k ("símbolos" 63k p7.5, "símbolos para copiar" 51k). CTR abaixo de 1,5% no top 10 em quase tudo. Script: `D:\tmp\gsc-tools.py` (dump em `D:\tmp\gsc-all.json`), SERP overlap via Serper em `D:\tmp\serp-overlap.mjs`.

**Feito em 18/09 (item 1 do plano):** títulos/metas com a frase exata do GSC, H2 novos com as consultas, FAQ preenchida + FAQPage (as FAQs de letras, símbolos e números aleatórios estavam VAZIAS no código), travessões removidos, em: letras-diferentes, simbolos-aesthetic, maiuscula-e-minuscula, numero-por-extenso, contador-de-caracteres (tabela caracteres→palavras/linhas/páginas) e numero-aleatorio-1-a-6 (virou "Dado online de 1 a 6"; `NumeroAleatorioPage` ganhou props `h1`, `extras`, `faq`).

**Regra aprendida (podcast query augmentation + medição):** antes de abrir página nova, medir sobreposição de SERP com Serper. 0 a 5 de 10 iguais = intenção diferente, página nova; 7+ = só H2 na página existente. Medido: "dado online 1 a 6" 0/10 vs número aleatório; "contador de palavras" 4/10; "fontes de letras" 5/10; "letras personalizadas" 6/10; "contador de letras" 9/10 (H2).

**Pendente (itens 2 e 3):** páginas novas `/fontes-de-letras`, `/letras-personalizadas`, `/dado-online`, `/contador-de-palavras` (curtas, ferramenta acima da dobra); links internos do blog para as tools com as âncoras do GSC. Re-medir GSC ~15/10/2026 para ver efeito.

**Why:** a página que já rankeia por confiança ("balde ampliado") sobe mais rápido trabalhando as consultas de volta no texto do que abrindo página nova; e FAQ vazia era desperdício de rich result.
