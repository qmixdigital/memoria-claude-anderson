---
name: reference-skill-materias-jornalisticas
description: Skill materias-jornalisticas-linkbuilding, onde ela mora, como virou global e no que difere da guest-post-rede
metadata:
  type: reference
---

Padrão editorial das matérias jornalísticas de link building.

**Ela é chamada, não é padrão.** Decisão do operador em 04/09/2026: instalar
global para ficar disponível em qualquer pasta, mas usar **só quando ele pedir**,
porque ele escolhe a skill conforme o caso. Não assumir que todo artigo passa a
seguir este padrão.

**Onde está:** o original é
`D:\SISTEMAS\Publicações em sites de parceiros WordPress\.claude\skills\materias-jornalisticas-linkbuilding\`.
Como era escopada àquele projeto, criei em 04/09 uma **junction** para
`C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding`, então ela
aparece em qualquer pasta de trabalho e continua com um único arquivo fonte:
editar em qualquer um dos caminhos edita o mesmo conteúdo. Se a junction sumir,
recriar com `New-Item -ItemType Junction`.

**No que difere da [[reference_runbook_backlinks_clientes]] (guest-post-rede),
que continua valendo para os portais próprios:**

| | matérias jornalísticas | guest-post-rede |
|---|---|---|
| Destino | 38 sites de parceiro (rede do Jean) | 111 portais próprios |
| Publicação | conector MCP `mcp.qmix.com.br` | portal-engine |
| Título | máximo 70 | máximo 60 com o sufixo do portal |
| Tamanho | 1.200 a 2.500, ideal 1.500 a 2.000 | 1.100 a 1.400 |
| Seções | 5 a 7 H2 | 9 H2 e 6 H3 |
| Links | inline, **nunca** em bloco "Leia também", fora do 1º e do último parágrafo, 3 parágrafos entre links | link do cliente primeiro + 2 internos no aside `pe-leia-meio` |
| Validação | `validador_materia.py`, zero bloqueio e humanização 70+ | `auditar.py`, 24 checagens |

**Comum às duas:** zero travessão, imagem no modelo barato da Runware, olhar a
imagem antes de publicar.

Só desta: lista de vocabulário proibido (abordagem, alavanc, ecossistema, soluç
que também pega **resolução**, robusto, insights, "cada vez mais", "é
fundamental", descubra...), verificação factual item a item com status
`pass`/`corrected`/`needs_review`, e **aprovação explícita do operador antes de
publicar**. Ver [[reference_publicacao_sites_parceiros]].
