---
name: termo-da-pasta-nao-diz-a-intencao
description: "banho de lua" 1.600/mês é clareamento de pelos, não banho espiritual; volume da pasta de palavras-chave não diz a intenção, a SERP diz, e o Console da rede inteira é a melhor fonte de irmãos
metadata:
  type: feedback
---

Em 12/09/2026, montando o lote de irmãos do EuVo, escrevi 1.200 palavras sobre
o banho de lua **espiritual** para o termo "o que é banho de lua" (1.600/mês,
KD 8, da pasta `D:\PORTAIS\palavras-chave`). Uma consulta de SERP pela SerpAPI
mostrou **7 de 7 resultados de estética**: banho de lua é o clareamento de
pelos do corpo. O rascunho foi para o lixo antes de publicar.

**Why:** a pasta traz Keyword, Volume e KD, e nada sobre intenção. Termo
ambíguo com volume alto é armadilha justamente porque o volume vem do outro
sentido. E o Trends/SERP custa uma chamada; o artigo errado custa uma hora e
uma página que nunca ranqueia.

**How to apply:** antes de escrever para termo da pasta, **uma consulta de SERP**
(`engine=google`, `gl=br`) para ver o que ocupa o topo e as PAA. Se o topo é de
outro sentido, descartar. As PAA viram H2 e FAQ do artigo (foi assim com "banho
de sal grosso": "maneira correta", "o que não fazer depois", "melhor dia").

Dois outros achados do mesmo dia:

- **O Search Console da rede inteira é a melhor fonte de irmãos.** As duas
  contas de serviço (`backlinkguard`, 90 propriedades, e `enjai`, 96) lidas com
  `includingRegex` na dimensão query dão, em ~4 minutos, toda consulta da rede
  numa veia. Foi assim que apareceram "correios entrega sabado" (posição 62 sem
  artigo) e "sonhar com agua suja" (74 impressões caindo em página errada).
  Ver [[gsc-duas-contas]].
- **Conferir a rede antes de escrever o irmão.** "O que é orixá" (8.100/mês)
  já era cluster de 7 artigos do barranews na clinicas-vps. `ls
  /srv/portais/*/data/*orixa*` nas três máquinas mostra em segundos. Ver
  [[tres-instancias-do-motor]].
- **Google Trends pela SerpAPI serve para ranquear candidatos** quando não há
  volume: comparar 4 termos com um vencedor conhecido ("entraram ou entrarão"
  rende 10 mil impressões) diz qual irmão escrever primeiro. "ficaram ou
  ficarão" deu 2,6 vezes o vencedor; "vieram ou virão", zero.
