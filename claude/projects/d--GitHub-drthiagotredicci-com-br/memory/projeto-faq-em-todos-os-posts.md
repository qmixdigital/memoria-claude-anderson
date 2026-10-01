---
name: projeto-faq-em-todos-os-posts
description: Todo post do blog do Tredicci tem FAQ e o gerador a converte em acordeao + FAQPage; post novo precisa nascer com ela
metadata:
  node_type: memory
  type: project
  originSessionId: c4a01c27-c33d-48b1-b9f3-361805e71ec5
  modified: 2026-09-28T13:01:20.143Z
---

Desde 28/09/2026, os **182 posts** de drthiagotredicci.com.br têm seção de
perguntas frequentes. Post novo precisa nascer com ela, senão quebra o padrão.

Como o gerador reconhece: um `<h2>` que case com "Perguntas frequentes",
"Dúvidas frequentes", "FAQ" ou "Perguntas comuns", seguido de pares
`<h3>pergunta</h3>` + `<p>resposta</p>`. O bloco vai **antes da conclusão**,
porque o gerador o fecha no `<h2>` seguinte. Ele então monta o acordeão visual
e o `FAQPage` no JSON-LD sozinho.

Padrão adotado nas 987 perguntas: de 3 a 8 por post, resposta abrindo objetiva
e nenhuma passando de 90 palavras.

**Regra de conteúdo médico:** as respostas resumem o que o artigo já afirma, com
o texto do próprio Dr. Thiago. Nada de afirmação clínica nova. Onde o artigo não
diz, não se escreve — pergunta-se a ele.

Related: [[projeto-blog-gerado-por-script]]
