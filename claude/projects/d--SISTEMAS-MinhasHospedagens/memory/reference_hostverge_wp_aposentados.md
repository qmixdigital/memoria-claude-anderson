---
name: reference-hostverge-wp-aposentados
description: Os 17 WordPress do hostverge migrados para o portal-engine guardam ~9 mil artigos que o site vivo NAO serve; nao apagar sem backup
metadata:
  type: reference
---

Em 01/09/2026 a conta hostverge tinha 22 WordPress, 19 GB, sendo **14,7 GB de
instalacoes cujo dominio ja e servido pelo portal-engine**. Parecia resíduo
pronto para apagar - e nao era.

**A verificacao que impediu o erro:** peguei slugs reais de posts do WordPress e
chamei no dominio vivo. Voltaram **410** (retirado de proposito, pela regra de
pruning) e **404**. Ou seja, os artigos existem SO no banco do WordPress. Somando
os 17 sites, cerca de 9 mil artigos sem outra copia.

Sinais que confirmaram: o site vivo serve menos URLs do que o WP guarda
(`planomedicosaude` 523 posts para 6 URLs; `viajenodetalhe` 1.583 para 261) e os
uploads receberam centenas de arquivos novos ate 19-21/08, quando a publicacao
migrou para o motor.

**Teste que NAO serve:** `wp-login.php` devolve 403 em quase todos, e 403 e
*bloqueado* (WAF), nao *inexistente*. Quem separa e `/wp-json/` respondendo 200 e
o teste de URL real de artigo.

**Feito:** os 17 bancos (181 MB comprimidos) estao em
`srv1166087:/var/backups/hostverge-wp-aposentados/`. Script em
`D:\SISTEMAS\MinhasHospedagens\scripts\puxar-bancos-hostverge.sh` - ele
transmite por streaming e nao grava nada no hostverge, que esta superlotado.
Restauracao provada: `viajenodetalhe` voltou com 129 tabelas, 1.731 posts
publicados e o texto integro.

**Armadilhas:** o prefixo das tabelas e `d1_`, nao `wp_`; e o hostverge **nao usa
`~/.ssh/authorized_keys`** (as chaves vem do painel StackCP), entao nao adianta
acrescentar chave por la para automatizar - a transferencia passa pela maquina
local.

**Arquivos removidos em 01/09/2026:** os 17 diretorios sairam, a conta foi de
**19 GB para 1,9 GB** e de 22 WordPress para 3. Foi seguro porque os sites
migrados servem imagem de `/img/` no PROPRIO dominio - o portal-engine tem
acervo proprio e nao depende de nada no hostverge. Conferido antes de apagar.
Depois: os 17 dominios em 200 e os 4 WordPress vivos intactos.

**`comprarsites` tambem saiu (1,0 GB), e o caso dele ensina algo.** Eu o tinha
classificado como "WordPress vivo" porque `/wp-json/` respondia 200 - mas a
resposta nao era JSON. O dominio esta no **Cloudflare Pages** (CNAME para
`comprarsites-com.pages.dev`, conta CF `master`), e o Pages devolve o
`index.html` para QUALQUER caminho inexistente. Aquele 200 era a home. O
WordPress daqui tinha o ultimo post em 25/08/2024. Banco salvo antes
(restauracao provada: 123 tabelas, 51 posts).

**Como descobrir onde um dominio da rede esta hospedado de verdade:** consultar
o DNS pela API do Cloudflare (`D:/SISTEMAS/cloudflare/contas.json`, 35 contas) e
ler o CNAME/A por tras do proxy. Codigo HTTP nao serve de prova: 403 pode ser
WAF e 200 pode ser catch-all.

**Ficaram de proposito:** `ortopediacoluna`, `ortopedistadeombro` e
`arlaproducao.com` (WordPress vivos de verdade, confirmados pelo teste do
arquivo marcado; o operador vai converte-los depois), e
a **raiz `public_html`** com `wp-admin`/`wp-content`/`wp-includes` - e o
diretorio que contem todos os outros, entao apagar a raiz levaria os vivos
junto; limpar so os arquivos do WP residual dela exige trabalho arquivo a
arquivo. `jornalcanalaberto.com.br` sobrou vazio (20K) e o dominio nem resolve
mais no DNS.

**Os bancos NAO foram apagados** e seguem no hostverge alem da copia em
srv1166087 - sao pequenos e sao o acervo dos artigos.

Isso alivia a conta que dava 503 por oversubscription (ver
[[reference_hostverge_qmix_oversubscription]]).
