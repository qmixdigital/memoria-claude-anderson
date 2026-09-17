---
name: lighthouse-na-vps-nao-serve
description: Rodar Lighthouse dentro da VPS hostinger-vps-srv1166087 dá número inútil; usar a API do PageSpeed
metadata: 
  node_type: memory
  type: project
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T16:09:17.329Z
---

Não medir performance rodando Lighthouse **dentro** da `hostinger-vps-srv1166087`. A máquina divide CPU com cerca de 30 processos PM2, e três execuções seguidas da mesma URL em 19/08/2026 deram score 40, 80 e 86, com TBT entre 193 ms e 3.108 ms. A variação entre rodadas é maior que qualquer efeito real de otimização.

**Por quê:** o Lighthouse simula CPU 4x mais lenta em cima da CPU que sobra. Se a máquina já está disputada, a simulação vira ruído. Chromium está instalado em `/usr/bin/chromium-browser`, então a tentação de rodar local é grande.

**Como aplicar:** usar a API do PageSpeed Insights, que roda de fora e devolve laboratório e campo (CrUX) na mesma resposta. A chave `<<REMOVIDO>>` funciona para `pagespeedonline/v5` (a API do CrUX direto, `chromeuxreport`, dá 403 com ela). Dá 500 esporádico, então repetir duas ou três vezes.

```
https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&strategy=MOBILE&key=CHAVE&category=PERFORMANCE
```

O campo vem em `loadingExperience` e `originLoadingExperience`; é janela móvel de 28 dias, então mudança de hoje só aparece em cerca de quatro semanas. Vale para todos os sites da VPS, não só o [[cirurgiacoracao-onde-fica]].
