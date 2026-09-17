---
name: fome-invisivel-no-motor
description: Portal com pauta aprovada que nunca gera; os pontos do motor onde ele some sem deixar linha de log
metadata:
  type: project
---

Quando um portal tem pauta aprovada no proprio poco e mesmo assim **nunca gera
materia**, o motivo quase sempre esta num `continue` sem log dentro de
`generate.montar_pedidos`. O portal desaparece da rodada sem aparecer em
NENHUMA linha, o que faz parecer que ele nem foi avaliado.

Os pontos, em ordem de probabilidade:

1. **`len(fontes) < min_dom`** — o fato tem menos dominios que o minimo do
   portal. Acontece em veio magro compartilhado: os fatos de dois dominios sao
   levados pelos portais irmaos e sobram so os de um. Solucao: `min_dominios: 1`
   naquele portal. Foi o caso do maragoginoticias em 29/08/2026, com 23 pautas
   aprovadas e zero geracao.
2. **`schedule.reservar` devolve falso** — outra rodada ja pegou o slot.
3. **`if not site: continue`** — slug na agenda que nao existe mais no
   `sites.json`.

Em 29/08/2026 os dois primeiros ganharam `log.info`. Se a versao em uso nao
tiver esses logs, conferir na mao:

    fontes = dedupe.fontes_do_fato(fato['id'], minimo=min_dom)
    len(fontes)   # menor que min_dom explica o sumico

**Why:** perdi uma investigacao longa nesse caso, testando orcamento, cadastro,
exclusividade e ate suspeitando das proprias chamadas de depuracao. Nada disso
era. O que enganava era justamente a AUSENCIA de log, que parecia indicar que o
portal nem entrava na fila, quando na verdade ele entrava e caia adiante.

**How to apply:** diante de "portal nao gera", nao comecar pelo cadastro.
Rodar `schedule.slots_para_gerar()` para confirmar que ele esta na fila e, se
estiver, ir direto ao numero de dominios do fato escolhido. Ver tambem
[[exclusividade-conta-reservado]].
