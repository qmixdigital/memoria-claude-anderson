---
name: prompt-da-ia-vazado-no-campo
description: "A instrução dada à IA aparece na linha fina e na meta description em vez do resumo, e sai no Google"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-19T21:28:26.481Z
---

Alguns artigos vindos da plataforma trazem no `dek`, no `excerpt` ou no
`metaDescription` a **instrução**, não o resultado: "(Crie uma linha fina com até
155 caracteres. Deve ser um resumo cativante que complementa o título...)". Isso
aparece na página, no compartilhamento e pode aparecer no resultado da busca.

**Why:** é falha na origem do conteúdo, então reaparece a cada lote importado, do
mesmo jeito que a [[entidade-html-no-titulo]]. Na varredura de 19/08/2026 eram
**27 artigos em 15 dos 68 portais**, nas três máquinas, e nenhum tinha sido
notado antes.

**How to apply:** varrer com regex por `crie uma linha fina|escreva um resumo|
resumo cativante|com até N caracteres` nos três campos. Onde bater, refazer a
partir do próprio texto: `dek` vira frase posterior à abertura, `excerpt` e
`metaDescription` saem do começo do corpo, cortados em palavra inteira. Depois
reconstruir os portais afetados e purgar. Rodar junto com a correção de
entidades, sempre que entrar lote novo.
