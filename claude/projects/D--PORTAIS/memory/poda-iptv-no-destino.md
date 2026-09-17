---
name: poda-iptv-no-destino
description: "A varredura de IPTV precisa rodar nos dados do portal depois da importação, não só no WordPress de origem"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T18:49:22.574Z
---

Depois de importar do WordPress para o portal-engine, **rodar os três vetores de
IPTV outra vez sobre os JSON em `/srv/portais/<slug>/data/`**. No boxnoticias.net
a poda feita só na origem deixou passar 277 de 513 artigos com a palavra no corpo,
um deles com IPTV no próprio título.

Existe um quarto vetor: o template de afiliado **sem** a palavra-chave. Denuncia-se
por `setup`, `travamentos`, `qualidade do sinal`, `estabilidade da conexão`,
`velocidade da internet`, `lista de canais`, `teste rápido`, `provedor`, `roteador`.
Duas ocorrências na mesma seção `<h2>` já indica bloco enxertado.

**Why:** a poda na origem remove por domínio de destino, mas a de palavra-chave
não alcança tudo, e um portal com resíduo de afiliado não ganha confiança.

**How to apply:** cortar a seção `<h2>` inteira que contém a menção em vez de
apagar o artigo. Com as travas (menos de 2.200 chars restantes, perda acima de 38%,
tema é IPTV, sobrou menos), o saldo foi 245 artigos salvos contra 32 apagados.
Depois desfazer âncoras que apontem para apagados e gerar 410. Ver
[[iptv-tres-vetores]] e [[conversao-total]].
