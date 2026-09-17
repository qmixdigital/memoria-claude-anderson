---
name: faq-do-motor-exige-titulo-e-fim
description: O FAQPage só é montado se o h2 disser "perguntas frequentes", e ele lê dali até o FIM do artigo
metadata:
  type: project
---

`faqSchema` no render.js procura um `<h2>` que contenha **"perguntas
frequentes"**, "dúvidas frequentes" ou "faq", e a partir dali monta pares de
`<h3>` pergunta e `<p>` resposta.

Duas consequências que já custaram retrabalho:

- **o título tem que ser exatamente essa expressão.** Escrevi "Perguntas que
  aparecem muito" e o bloco não gerou schema nenhum, embora estivesse perfeito
  para o leitor;
- **ele lê do título ATÉ O FIM do artigo.** Com o bloco no meio, os subtítulos
  das seções seguintes viram "pergunta" no schema. O bloco de perguntas precisa
  ser o último.

⚠️ Desde 2023 o Google só mostra **resultado rico** de FAQ para sites de saúde e
governo reconhecidamente oficiais. Num portal comum o schema continua ajudando a
máquina a entender a página e o texto continua servindo para trecho em destaque,
mas não espere a estrela na SERP.
