---
name: nginx-serve-html-direto
description: "Na VPS HestiaCP, o nginx servia os .html direto do disco e o .htaccess nunca rodava para eles; corrigido tirando htm/html do PROXY_EXT do domínio"
metadata: 
  node_type: memory
  type: project
  originSessionId: b0fd5017-2e3c-42ee-a0c3-faab1c80e7a2
  modified: 2026-09-06T15:43:59.714Z
---

Em 06/09/2026 descobri que **todas** as páginas do drbrunoair.com.br respondiam
200 nas duas URLs (`/dr-bruno` e `/dr-bruno.html`), gerando conteúdo duplicado
em todo o site.

A causa não estava no `.htaccess`. O template do HestiaCP gera, dentro do
`location /`, um `location ~* ^.+\.(css|htm|html|js|...)$` que serve os arquivos
existentes **direto do disco**, com `expires max`, sem proxy para o Apache. Com
isso as regras de clean URL do `.htaccess` nunca eram executadas para arquivos
que existem. Só arquivo inexistente caía no `@fallback` e chegava no Apache,
que era por que `/naoexiste.html` redirecionava e `/dr-bruno.html` não.

**O que NÃO resolve:** criar `location` no include `nginx.ssl.conf_*` do
domínio. Testei com regex e com lookahead; o `location` aninhado do template
continuou ganhando. Só o `location = /arquivo` (match exato) funcionou.

**O que resolve:** remover `htm,html` do `PROXY_EXT` do domínio, que é um
campo por domínio no HestiaCP e é o que gera aquele regex:

```bash
/usr/local/hestia/bin/v-change-web-domain-proxy-tpl boot drbrunoair.com.br default "css,js,mjs,json,xml,apng,avif,...(lista sem htm e html)" yes
```

Depois disso todo `.html` passa pelo Apache e o `.htaccess` volta a mandar,
virando fonte única da regra. Backup do `web.conf` em
`/root/web.conf.bak-20260906`.

**Pegadinha na verificação:** o `web.conf` do usuário `boot` tem 10 domínios.
`grep -o "PROXY_EXT='...'"` sem filtrar o domínio mostra o do primeiro domínio
do arquivo e faz parecer que o comando falhou. Filtrar por `grep drbrunoair`
antes.

Dados do servidor (VPS srv1166087, 31.97.173.40, user boot) estao no CLAUDE.md
do projeto. A memoria antiga hospedagem.md foi apagada: descrevia a VPS
OpenGravity, de antes da migracao de jun/2026.
