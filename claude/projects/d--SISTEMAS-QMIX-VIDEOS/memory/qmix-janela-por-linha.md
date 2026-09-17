---
name: qmix-janela-por-linha
description: A janela de estimativa de cada linha de voz precisa ser escalonada pelo tamanho da frase
metadata:
  type: project
---

No construtor de `beats.json`, a duração estimada de cada linha não pode sair de uma única
taxa de palavras por segundo. O ritmo da voz varia muito com o tamanho da frase:

- menos de 8 palavras faladas (frase de fecho, pausada): ~1,35 palavra/s
- 8 a 13: ~1,70
- 14 ou mais: ~1,90

**Why:** estimar tudo em 2,4 estourou duas linhas do qmix-19, uma delas em atempo 1,30,
bem acima do teto de 1,15 do `LOCALIZACAO-PTBR.md`. "Publicação abre a porta. Manutenção
escancara." levou 4,2s para 6 palavras, que dá 1,4 palavra/s.

**How to apply:** janela generosa não custa nada, porque `aparar_voz` + `retimar` refazem a
linha do tempo com os tempos reais depois. A projeção de duração do vídeo continua sendo
calculada à parte, por `palavras faladas / 2,33`, que é a taxa medida nos vídeos prontos.
Ver [[qmix-animacao-continua]].
