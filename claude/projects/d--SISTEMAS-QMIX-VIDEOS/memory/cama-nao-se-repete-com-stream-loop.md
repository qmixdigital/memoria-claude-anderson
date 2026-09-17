---
name: cama-nao-se-repete-com-stream-loop
description: "Os clipes de música da biblioteca são peças fechadas, não camas de repetição; montar cama com -stream_loop faz a música sumir a cada 63 segundos"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T11:46:22.779Z
---

**Nunca montar cama de música repetindo o arquivo inteiro.** Usar
`tools/cama.py`, que recorta o platô do clipe e emenda por cruzamento de
potência constante.

Descoberto em 24/08/2026, depois de o Anderson assistir o vídeo 05 publicado:
"há alguns erros detectáveis no som, uns pequenos cortes, uns ruídos entre
transição de uma sessão para outra".

**O que estava acontecendo:** a cama era `-stream_loop 4` num MP3 de 63s para
preencher 199s. **Nenhum dos seis clipes da biblioteca é cama de repetição** —
todos são peças fechadas, com final próprio de 6 a 8 segundos. Então a cada 63
segundos a música decaía por 1,6s, ficava em silêncio absoluto, e voltava a
todo volume em 40ms. Degrau de 67 dB, dez vezes no vídeo. Valeu dos vídeos 01
ao 05.

**Why:** eu media a mixagem por LUFS integrado e por pico, e as duas estavam
certas: -12,5 LUFS, pico -2,0 dBFS. **Loudness é média e pico é máximo.**
Nenhum dos dois enxerga um buraco de dois segundos. A medida existia, o defeito
existia, e eles não se cruzavam. Foi ele quem ouviu.

**How to apply:**

- montar cama só pelo `tools/cama.py`; ele confere cada costura na saída que
  acabou de escrever
- cruzamento de música é `c1=qsin:c2=qsin`, potência constante. `tri` é linear
  em amplitude e afunda 3 dB no meio, porque os dois lados são descorrelacionados
- o corpo do clipe é o **platô**, não "o que está acima de X% da mediana": a
  peça começa a se despedir antes de o envelope cair
- antes de entregar, rodar `python tools/cacar_estalo.py <projeto>`. Ele mede
  o envelope, não a amostra, e devolve **zero** num vídeo limpo
- quando aparecer defeito de som que nenhuma medida pega, medir a coisa certa:
  buraco e salto são **envelope**, não loudness nem pico

Relacionado: [[defeito-silencioso-conferir-artefato]], [[revisao-e-quadro-por-fala]].
