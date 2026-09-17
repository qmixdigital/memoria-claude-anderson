---
name: imagem-hospedada-por-terceiro-no-corpo
description: acervo raspado traz <img> apontando para o S3 de outro veículo; some quando quiser e nenhuma tem alt
metadata:
  node_type: memory
  type: project
---

Artigo que a origem montou por raspagem carrega a imagem **do site raspado**, e
não uma cópia. No revistadeducao eram **283 `<img>` em 154 artigos**, apontando
para `s3.cointelegraph.com`, `images.cointelegraph.com` e
`lh7-us.googleusercontent.com`.

Três problemas de uma vez: consome banda de terceiro, some no dia em que o dono
apagar, e **nenhuma delas tinha `alt`** (eram 258 dos 304 `<img>` sem alt do
portal inteiro). Hospedar cópia local não resolve: é republicar gráfico dos
outros.

**Why:** a varredura de imagem morta olha `/img/...` local e não vê nada disso.
O defeito é invisível até o dia em que o terceiro apaga o arquivo.

**How to apply:** na Fase 7, contar `<img src="http...">` por domínio antes de
qualquer outra coisa; remover, junto com o `<figure>`/`<p>` que ficar vazio. Vale
varrer os vizinhos com acervo de cripto e de tecnologia, que vieram da mesma
raspagem. Ver [[lixo-de-tema-no-corpo-importado]].
