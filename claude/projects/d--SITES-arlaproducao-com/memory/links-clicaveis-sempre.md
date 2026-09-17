---
name: links-clicaveis-sempre
description: "Ao mencionar qualquer URL para o Anderson, escrever sempre o endereco completo e clicavel, nunca so o caminho"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a5dc0c79-3b83-4a07-ab58-da357067af97
  modified: 2026-09-04T11:49:14.091Z
---

Sempre que eu oferecer uma URL ao Anderson, ela precisa vir **completa e
clicável**: `https://arlaproducao.com/arla-adulterado/`, e nunca `/arla-adulterado/`
nem "a página do Arla adulterado". Vale para páginas publicadas, painéis,
repositórios, artigos e qualquer endereço que ele possa querer abrir.

**Why:** ele pediu isso depois de eu passar uma sessão inteira citando páginas
novas como `/arla-adulterado/` e `/equipamento-para-produzir-arla-32/`. Caminho
relativo não vira link no terminal nem no navegador, então cada vez que ele
queria conferir o resultado precisava montar a URL na mão. Ele já tinha pedido
isso na memória da nuvem e o pedido não chegou até este projeto.

**How to apply:** ao listar páginas criadas ou alteradas, escrever o endereço
inteiro com esquema e domínio. Numa lista de várias páginas, cada linha leva a
URL completa, mesmo que fique repetitivo com o domínio. Se o destino for um
arquivo do repositório e não uma página no ar, usar o link markdown relativo que
o VS Code torna clicável, como [index.html](index.html). Repositório, painel da
Cloudflare, Search Console e Resend seguem a mesma regra: endereço completo.
