---
name: receptor-antonio-site-estatico
description: Sites estaticos no Cloudflare Pages (saudevitalidade, institutoortopedico, planomedicosaude) recebem do Antonio por um _worker.js com KV; como funciona e como estender
metadata:
  type: project
---

Em 22/10/2026 o Anderson mandou fazer "todos os convertidos" voltarem a receber
do Antonio. Solucao: `_worker.js` dentro de `site/` de cada projeto Pages
(modo avancado), que atende `POST /api/antonio/artigos` com o contrato da cron,
guarda artigo e imagem em KV e monta a pagina a partir de um modelo extraido de
um artigo real (`site/_antonio/modelo.html`, ida e volta conferida). Novos
artigos entram nos cards do `/blog`, `novos-artigos.json`, `search-index.json`
e `sitemap-antonio.xml`. O Antonio nao mudou (mesmo endpoint e chave).

**Why:** os tres viraram HTML puro em 19/10 sem servidor, e o `/api/antonio/`
respondia 405; a cron repetia a cada minuto. Ele nao quis desativar os
destinos, quis que todos os sites da rede recebam dos editores.

**How to apply:** passo a passo, rotas de apoio (`/api/antonio/saude`, DELETE
por slug) e armadilhas em `OPERACOES.md`, secao "Receptor do Antonio em site
estatico". Fontes em `D:/SISTEMAS/QMIX ANTONIO/receptor-estatico/`. Para outro
site convertido, gerar o modelo com `gerar_modelos.py`, copiar o worker, criar
KV e bindings pela API e deployar. Ver [[diagnostico-site-nao-publica]].
