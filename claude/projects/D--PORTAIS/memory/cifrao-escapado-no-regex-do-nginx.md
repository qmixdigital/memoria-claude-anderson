---
name: cifrao-escapado-no-regex-do-nginx
description: "Cifrao escapado no location do nginx e caractere literal, nao ancora de fim; o 410 passa no teste e nunca casa"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T11:44:41.150Z
---

Um `location ~ "^/(slug-a|slug-b)/?<cifrao-escapado>"` **nunca casa**. Em PCRE o
cifrao escapado e um caractere literal, e nao a ancora de fim de linha: a regra
passa a exigir um cifrao no fim da URL.

**Why:** o `nginx -t` passa, o reload funciona, o bloco esta la no arquivo, e a
URL continua respondendo 404 em vez de 410. Nada acusa. Em 21/08/2026 perdi tempo
procurando ordem de `location` e bloco `server` errado antes de desconfiar do
proprio regex.

De onde vem: escrever o bloco por **heredoc de shell**, onde o cifrao precisa de
escape para nao ser expandido pelo bash. O escape sobrevive ate dentro do arquivo
de configuracao.

**How to apply:** gerar bloco de nginx por **arquivo Python enviado com scp**, e
nunca por heredoc de shell. Depois conferir a regra pelo **comportamento**, e nao
pela existencia da linha:

```bash
curl -s -o /dev/null -w "%{http_code}" -H "Host: dominio" http://IP_DO_VHOST/slug/
```

O IP importa: vhost com `listen 1.2.3.4:80` **nao responde em 127.0.0.1**, e o
curl volta 000, que parece outra coisa.

Ver [[gone-txt-em-vez-de-410-no-nginx]] e [[rebuild-exit-code-antes-de-comparar]].

**Segundo jeito de o mesmo `curl` mentir, achado em 21/08/2026:** vhost novo com
`listen 80` na opengravity, cuja porta 80 tem `listen 77.37.69.175:80
default_server`. São **grupos de sockets diferentes**, e o pedido cai no
`default_server`: a home responde **200** (é o outro vhost atendendo) e todo o
resto responde 404, incluindo os 410 e os 301 que estão escritos e corretos. O
`nginx -t` passa. A correção é copiar a forma do vizinho, `listen 77.37.69.175:80`,
e nunca `listen 80` sozinho numa máquina que usa IP explícito.
