---
name: diagnostico-site-nao-publica
description: "Se o Anderson disser que um site da rede parou de publicar, verificar nesta ordem - as causas conhecidas em 17/08/2026"
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T19:06:05.217Z
---

Quando o Anderson reclamar que um site não está publicando, checar nesta ordem
antes de investigar qualquer outra coisa. As três primeiras são estado que eu
mesmo criei em 17/08/2026 a pedido dele, e explicam a maioria dos casos:

1. **Todas as campanhas estão desativadas.** As 228 de `news_sources` estão
   `inactive` desde 17/08/2026. Se ele não pediu para reativar, é esta a causa e
   nada está quebrado. Ver [[campanhas-desativadas-agosto-2026]].

2. **peritodicas.com foi desligado de propósito** (virou diretório): campanha
   #251 e o registro em `wp_sites` estão `inactive`.

3. **Sites de cliente foram removidos da lista de publicação**, não é falha.
   Ver [[sites-cliente-fora-da-publicacao]].

4. **Assinatura errada em portal do engine, não falha de publicação.** Em
   17/08/2026 o `lc-article-transfer.php` passou a enviar `author_name` junto do
   `author` numérico, e o `render.js` do engine passou a preferir esse campo.
   O patch do `render.js` foi aplicado **só no srv1166087**. Nos outros dois
   servidores do engine (clinicas-vps, 34 portais; opengravity, 7 portais) a
   versão é a antiga: o artigo publica normalmente, só sai assinado com o nome do
   site. Não é o mesmo problema que "não está publicando".

Se nada acima explicar, seguir o checklist do fim de
`d:\SISTEMAS\QMIX ANTONIO\ARMADILHAS.md` (health do receptor, endpoint
devolvendo 400, permissão em `/srv/portais`, dedup, redirecionamento 301/308).

**Why:** o Anderson pediu que eu memorizasse isso para não precisar reexplicar
nem eu sair investigando do zero.

**How to apply:** responder primeiro com a causa provável desta lista, com o
dado que a comprova, antes de propor qualquer alteração.
