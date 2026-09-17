---
name: defeito-silencioso-conferir-artefato
description: "A classe de erro que mais custou nesta fábrica é a que reporta sucesso sem ter feito nada; conferir o artefato, nunca a mensagem da ferramenta"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T11:22:38.460Z
---

**Toda ferramenta desta fábrica já mentiu dizendo "pronto".** Nenhum desses
casos deu erro, nenhum saiu com código diferente de zero:

| o que disse | o que fez |
|---|---|
| `render-all` imprimiu done, exit 0 | cortou 69 quadros do fim, por `durationInSeconds` cravado na mão |
| `gen_voice` gravou as 67 falas | gravou com a voz do `.env`, que é de outro canal |
| `montar_planos` disse "189 planos" | pulou a cópia porque o destino existia, e duas curadorias seguidas não chegaram à tela |
| o TSX compilou limpo | um carimbo aninhado no grupo errado dava produto zero e nunca apareceu |
| a pool estava declarada | lista concatenada nunca alcançava a segunda, e o cursor reiniciava a cada fala |

**Why:** o passo intermediário é sempre plausível. O que não mente é o
artefato: contagem de quadros do ffprobe, `ebur128` medido bloco a bloco,
data de modificação dos arquivos, e um relatório de "cada entrada chegou na
saída?". Foi sempre o ffprobe, nunca o log, que pegou o defeito.

**How to apply:** depois de cada etapa que produz arquivo, medir o arquivo.

- render → `ffprobe -count_frames`, e comparar com o esperado calculado
- mixagem → `ebur128`, integrado **e** por bloco (o integrado esconde degrau)
- cópia de mídia → a marca em disco guarda **origem e tratamento**, senão
  mudar o tratamento é pulado em silêncio
- qualquer pool/lote → relatório nominal do que foi copiado e **não** entrou
  em plano nenhum

E quando um defeito desses aparecer, a correção vira **guarda no código**, não
anotação. Anotação não roda no próximo vídeo.

Relacionado: [[revisao-e-quadro-por-fala]], [[voz-do-projeto-nao-e-a-do-env]],
[[qmix-render-um-video]].
