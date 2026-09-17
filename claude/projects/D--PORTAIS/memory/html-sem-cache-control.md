---
name: html-sem-cache-control
description: "O HTML dos portais saía sem Cache-Control, ETag ou Last-Modified, e o navegador guardava a página sem nunca revalidar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T22:48:55.706Z
---

Até 16/08/2026 a resposta HTML dos 53 portais não trazia **nenhum** cabeçalho de
validade: sem `Cache-Control`, sem `ETag`, sem `Last-Modified`. Sem essas pistas
o navegador aplica cache heurístico, guarda a página pelo tempo que decidir e
**não pergunta ao servidor se mudou**.

Efeito prático: correção publicada continuava invisível para quem já tinha
visitado o site, mesmo com o cache da Cloudflare limpo, e mesmo apertando
atualizar. Só aparecia em janela anônima ou em perfil limpo.

Corrigido com `add_header Cache-Control "no-cache" always;` dentro de cada
`location / {` dos vhosts, nas três máquinas. `no-cache` não é "não guarde": é
"guarde, mas confirme antes de usar", então o leitor recorrente recebe 304 e não
há custo de banda. Imagem, fonte, CSS e JS seguem com 30 dias, porque mudam de
nome quando mudam de conteúdo.

**Por quê:** eu atribuí o problema ao navegador do Anderson duas vezes antes de
achar a causa real, e ele estava certo em insistir. Ver
[[cloudflare-purge-token-de-conta]], que resolve a outra metade do problema, a da
borda.

**Como aplicar:** ao criar vhost de portal novo, o `location /` precisa nascer
com esse cabeçalho. E ao investigar "publiquei e não mudou", checar os três na
ordem: origem no disco, `cf-cache-status` na borda, e `Cache-Control` na resposta.
Existe ainda uma regra de microcache de 30 minutos herdada do WordPress em 18
zonas da Cloudflare, hoje inofensiva porque o purge automático virou padrão.
