---
name: cliquex-indexnow
description: IndexNow da rede de sites — chave e como submeter para acelerar indexação
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-07-18T21:38:57.628Z
---

IndexNow acelera indexação no Bing/Yandex/Seznam/Naver (Google NÃO participa — para o Google usar sitemap + Search Console, que exige OAuth/login manual).

Chave IndexNow da rede: `<<REMOVIDO>>`. Hospedada em `https://<dominio>/<<REMOVIDO>>.txt` (arquivo cujo conteúdo é a própria chave) em cada site. REUSAR essa mesma chave em novos sites.

Pré-requisito no vhost: os sites têm 301 catch-all, então o `.txt` precisa ser servido — adicionar `txt` à regex de assets do vhost (`|css|js|txt)`), senão o `<chave>.txt` cai no catch-all e dá 301 (verificação do IndexNow falha).

Submeter: `POST https://api.indexnow.org/indexnow` (Content-Type application/json) com body `{"host":"<canonica>","key":"<chave>","keyLocation":"https://<canonica>/<chave>.txt","urlList":["https://<canonica>/"]}`. Um POST por host (host = canônica, com ou sem www). Resposta 200/202 = aceito. Feito para os 16 sites em 2026-07-18 (todos 202).

Cuidado de execução: loop com ssh por domínio (16x) estoura timeout de 2min — subir a chave uma vez em /tmp e fazer o cp+sed de todos num ÚNICO ssh com loop remoto.
