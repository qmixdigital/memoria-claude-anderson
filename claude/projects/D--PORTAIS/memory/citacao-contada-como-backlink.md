---
name: citacao-contada-como-backlink
description: duas listas incompletas no classificador preservaram 284 artigos que só tinham citação, não backlink pago
metadata:
  node_type: memory
  type: project
---

O `classifica_*.py` da conversão parcial decide o que sobrevive. Ele descarta
link que é citação e conta o resto como backlink de cliente. **Duas listas dele
estavam incompletas**, e o efeito foi preservar artigo que ninguém pagou para
existir: **86 no revistadeducao e 198 nos cinco portais anteriores**, 284 no
total, todos com zero clique em 90 dias.

**A lista de portais da rede tinha 73 domínios, e o real são 139.** Vinha de um
`dominios-portal.json` antigo. A certa sai de três fontes autoritativas somadas:
`antonio_COMPLETO.csv`, o `sites.json` das três máquinas do motor, e a lista
corrida "Domínios nesta conta" dos README das hospedagens.

**Faltava a fonte de dado do próprio nicho.** Acervo de cripto raspado do
cointelegraph tem como "link externo" sempre a fonte de onde o texto saiu:
cointelegraph, TradingView, CoinMarketCap, Glassnode, Etherscan, `t.co`. Faltavam
também `em.com.br`, `wsj.com`, `bloomberg.com`, `prnewswire.com`, `bis.org` e
`federalreserve.gov`.

⚠️ **Não montar a lista de rede com regex sobre a prosa dos README.** A primeira
tentativa trouxe 48 domínios a mais, entre eles `drbrunoair.com.br` e
`drtiagobernardes.com.br`, que são **cliente**: tratá-los como rede apagaria
justamente o backlink pago. Trouxe também `exemplo.com.br` e `novo-site1.com`.

**How to apply:** antes de classificar, listar os domínios que sustentam artigo
**sozinhos e sem tráfego**, ordenados por quantos artigos cada um segura. Os do
topo se leem em trinta segundos, e é ali que a citação disfarçada aparece. Ver
[[poda-por-backlink-conferir-antes]] e [[iptv-legitimo-no-wtw19]].
