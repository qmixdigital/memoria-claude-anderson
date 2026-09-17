---
name: pool-por-fala-confere-no-beats
description: "O mapeamento de imagem por fala se confere no beats.json, nunca no roteiro em markdown, porque o roteiro.py quebra parágrafos e desloca tudo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T14:23:41.730Z
---

**Depois de declarar as pools por fala, imprimir pool e TEXTO lado a lado, do
`beats.json`, e ler.** Nunca conferir contra o `ROTEIRO.md`.

**Why:** o `roteiro.py` corta parágrafo de mais de 30 palavras no ponto final
mais próximo do meio. Um parágrafo do markdown pode virar duas falas, e a
partir daí todo o mapeamento do bloco anda uma casa. Nada avisa quando a
contagem bate por coincidência.

No vídeo 06 isso produziu, antes de eu conferir:

- a fala do **Estreito de Ormuz**, que é o clímax geopolítico do vídeo, sobre
  uma foto do ônibus
- "e se a energia vier de placa solar" sobre o Volare
- "dez mil reais por mês" sobre uma lavoura de milho
- e o bloco `funciona` inteiro deslocado a partir da fala 10, porque "Caiu a um
  certo nível?" virou fala própria

**How to apply:** o `montar_planos.py` avisa quando a CONTAGEM não bate, e esse
aviso é o mais barato. Mas contagem certa não garante alinhamento certo, então
a conferência de verdade é esta, e leva dois minutos:

```python
for j, v in enumerate(linhas):
    print(f" {j+1:2d} {pools[j]:<20} {v['text'][:64]}")
```

Fazer ANTES do render. Um render de 16 minutos custa 25 minutos, e a folha de
contato só existe depois dele.

Relacionado: [[imagem-casa-com-a-fala]], [[revisao-e-quadro-por-fala]],
[[grupo-precisa-de-saida-escrita]].
