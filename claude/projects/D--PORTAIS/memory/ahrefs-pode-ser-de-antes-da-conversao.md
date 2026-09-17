---
name: ahrefs-pode-ser-de-antes-da-conversao
description: Relatório do Ahrefs com milhares de órfãs e OG incompleto costuma ser o rastreamento do WordPress antigo, não do portal no motor
metadata:
  type: feedback
---

Painel do Ahrefs do advivo em 24/08/2026: 6.167 URLs rastreadas, 646 órfãs,
1.183 Open Graph incompleto, 271 title longo, 2.671 links para redirecionamento.
A auditoria do portal no mesmo dia deu **0 órfãs, 0 OG incompleto, 0 title longo
e 916 de 916 destinos internos em 200**, em 915 páginas.

A explicação é a data: o advivo virou para o motor em **21/08/2026**, e o
rastreamento é do WordPress anterior, que tinha `/tag/`, `/author/`, `/page/N/` e
três vezes mais URLs.

**Why:** sair consertando pelo relatório desperdiça o trabalho e ainda pode
desfazer coisa certa.

**How to apply:** antes de agir sobre número do Ahrefs, conferir a **data do
rastreamento** contra a data da conversão (`ls -ld /srv/portais/<slug>`), e medir
o site como ele está hoje. Ver [[cat301-do-arquivo-de-categoria]], que foi o
único achado real dessa rodada.
