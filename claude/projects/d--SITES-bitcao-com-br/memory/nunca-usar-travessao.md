---
name: nunca-usar-travessao
description: "Anderson nao aceita travessao em nenhum texto voltado ao usuario, e reescrever exige refazer a frase, nao trocar o sinal"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 63176e52-9a9d-4e57-aac7-20bb14f54992
  modified: 2026-08-11T20:21:12.688Z
---

**Nunca usar travessão (—) nem meia-risca (–) em texto voltado ao usuário.** Vale para artigo, meta description, title, copy institucional, legenda, alt de imagem, mensagem de interface. Vale para todo site da rede, não só o BitCão.

**Why:** o Anderson não gosta do sinal e o identifica de imediato como marca de texto escrito por IA de baixa qualidade. O checklist da skill `finalizacao-projeto` já traz a regra ("Sem em dashes em nenhum texto gerado"), e mesmo assim eu escrevi 41 artigos cheios deles em 11/08/2026, depois de ter corrigido travessão nas páginas institucionais na mesma sessão. Ele encontrou lendo o site.

**How to apply:**

- Ao **escrever**, não gerar o sinal. Substituir por vírgula, dois-pontos, ponto ou parênteses conforme a função que ele teria na frase.
- Ao **corrigir texto existente**, não fazer replace cego. Travessão costuma carregar função sintática, e trocar por vírgula produz frase quebrada ou vírgula antes de verbo. Cada ocorrência precisa de leitura e reescrita:
  - aposto explicativo → vírgula ou parênteses
  - ênfase no fim da frase → ponto e frase nova
  - par de travessões isolando oração → duas vírgulas
  - travessão substituindo verbo de ligação → escrever o verbo
- Verificar em **três lugares**, porque o conteúdo vive em mais de um: banco de dados (`noticias.conteudo`, `resumo`, `seo_title`, `seo_description`, `imagem_alt`), código (JSX das páginas, `site.config.ts`) e arquivos de configuração servidos ao usuário.
- Comentário de código é a única exceção tolerada, mas eu prefiro evitar lá também para não haver dúvida em busca automatizada.

**Como conferir:** `grep -rn '—\|–' src/` no código, e no banco
`SELECT slug FROM noticias WHERE conteudo LIKE '%—%' OR resumo LIKE '%—%'`.

Relacionado: [[marcadores-de-texto-de-ia]]
