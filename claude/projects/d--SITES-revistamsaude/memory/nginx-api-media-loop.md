---
name: nginx-api-media-loop
description: Campo Foto do painel Payload preso no esqueleto cinza e upload de imagem falhando = bloco nginx location /api/media/ pegando a API inteira (loop 301/308); o bloco de cache tem de ser /api/media/file/
metadata:
  type: project
---

Em 05/10/2026 o Tiago Brito relatou que não conseguia trocar a foto de profissional no painel (`/admin/collections/profissionais/34`): o campo Foto ficava no esqueleto cinza de carregamento.

Causa: o hardening de 11/09/2026 criou no vhost `/etc/nginx/conf.d/domains/revistamsaude.com.br.ssl.conf` um `location /api/media/ { proxy_pass ...; expires 30d; }` para dar cache longo às imagens. Bloco de prefixo terminado em barra com `proxy_pass` faz o nginx devolver 301 de `/api/media` para `/api/media/`, e o Next devolve 308 de volta: loop. A listagem `/api/media?where[id][in]...` (que o campo de upload do painel chama) e o `POST /api/media` (envio de foto nova) nunca chegavam ao Payload. O bloco também não tinha `client_max_body_size` (limite de 1 MB) e punha cache de 30 dias no JSON da API.

Correção: o bloco passou a ser `location /api/media/file/` (só os arquivos). Backup em `.bak-media-20261005`; mesma troca feita na cópia do Hestia em `/home/qmix/conf/web/revistamsaude.com.br/nginx.ssl.conf` (não carregada, mas pode ser usada num rebuild).

**Why:** ficou quase um mês quebrado sem ninguém notar porque as fotos trocadas nesse período entraram por SQL/script, não pelo painel.

**How to apply:** em qualquer site Next + Payload atrás de nginx, cache de mídia vai em `/api/media/file/`, nunca em `/api/media/`. Depois de `systemctl reload nginx`, o Cloudflare ainda usa por alguns segundos conexões presas aos workers antigos: testar de novo antes de concluir que não funcionou. Teste rápido: `curl -s -o /dev/null -w "%{http_code}" "https://DOMINIO/api/media?limit=1"` tem de dar 200, e o POST sem login 403 (nunca 301). Ver [[deploy-workflow]].
