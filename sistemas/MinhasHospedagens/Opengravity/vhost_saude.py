# -*- coding: utf-8 -*-
"""Gera o vhost de HTTP dos cinco portais de saude, para a emissao do certificado.

Uso, no servidor:  python3 /tmp/vhost_saude.py [--aplica]

Sai a ETAPA 1, so HTTP, que e o que permite o desafio do certbot alcancar a
origem antes de existir certificado. A etapa 2, de HTTPS, e escrita depois da
emissao, a partir do mesmo corpo.

🔴 **Cada portal tem a sua base de categoria, e elas NAO sao iguais.** Tres
servem a listagem em `/category/`, em ingles, porque o `category_base` da origem
estava vazio; dois servem em `/categoria/`. O redirecionamento de compatibilidade
vai sempre da forma ERRADA para a forma que o portal usa, e copiar o bloco de um
vizinho poe a editoria inteira em 404.

🔴 **O matogrossosaude e canonico no `www`**, ao contrario de todos os outros
portais da rede: quem redireciona ali e o apex.

⚠️ **O `^~ /wp-json/` engoliria a rota da plataforma do Antonio**, que e regex.
O prefixo vai simples, sem `^~`.

⚠️ **`/wp-content/uploads/` precisa vir ANTES do 410 de `/wp-content/`**, com
prefixo mais longo, senao toda imagem indexada no Google Imagens morre em 410.

⚠️ O slug do mapa do site sai de um hash do nome do portal: cada um tem o seu, e
o redirecionamento le o valor real do disco.
"""
import glob
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
IP = '77.37.69.175'
PORTA = 8791
cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
ALVO = ['saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude', 'matogrossosaude']

SMAP = ['mapa-do-site', 'indice', 'todos-os-artigos', 'arquivo-de-noticias', 'conteudo',
        'mapa-de-conteudo', 'indice-de-artigos', 'todo-o-conteudo', 'central-de-conteudo',
        'navegacao', 'indice-geral', 'arquivo-completo', 'lista-de-materias',
        'indice-de-materias', 'mapa-de-navegacao', 'todas-as-noticias', 'indice-do-site',
        'sumario']

for slug in ALVO:
    s = [x for x in cfg['sites'] if x['slug'] == slug][0]
    dom = s['domain']
    base = (s.get('categoryBase') or '').strip('/')
    plano = bool(s.get('flatUrl'))
    pub = '/srv/portais/%s/public' % slug
    eds = sorted({v['slug'] for v in (s.get('categoryMap') or {}).values()})
    # o slug real do mapa do site, lido do disco
    mapa = next((m for m in SMAP if os.path.isdir(os.path.join(pub, m))), 'mapa-do-site')
    outros_mapa = [m for m in SMAP if m != mapa][:8]
    # a forma ERRADA de base, que e a que redireciona
    outra = 'categoria' if base == 'category' else 'category'
    # o matogrossosaude e canonico no www
    canon_www = s['baseUrl'].startswith('https://www.')
    if canon_www:
        redir = ('    # 🔴 este portal e canonico no WWW: cada backlink aponta para essa\n'
                 '    # forma, e quem redireciona aqui e o apex\n'
                 '    if ($host = %s) { return 301 https://www.%s$request_uri; }\n' % (dom, dom))
    else:
        redir = ('    # o mesmo conteudo em dois hosts e conteudo duplicado, e backlink\n'
                 '    # que chegue no www so passa autoridade depois do salto\n'
                 '    if ($host = www.%s) { return 301 https://%s$request_uri; }\n' % (dom, dom))

    t = '''# %s
# Convertido em 24/08/2026. Arquitetura %s, portal-engine.
# ETAPA 1: so HTTP. E ela que deixa o desafio do certbot alcancar a origem antes
# de existir certificado. A etapa 2, de HTTPS, sai depois da emissao.

server {
    listen %s:80;
    server_name %s www.%s;
    root %s;
    index index.html;
    charset utf-8;

    # o desafio ACME precisa responder antes de o certificado existir
    location ^~ /.well-known/acme-challenge/ { root /var/www/acme; default_type text/plain; }

%s
    # recebimento de conteudo da plataforma do Antonio e o formulario de contato
    location ~ /[a-z0-9_-]+/v1/artigos$ { proxy_pass http://127.0.0.1:%d; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_read_timeout 60s; }
    location = /api/contato { proxy_pass http://127.0.0.1:%d; proxy_set_header Host $host; }

    # ---- 301 do que so mudou de endereco
    # 🔴 a listagem deste portal mora em /%s/<slug>/. Quem redireciona e a outra
    # forma, e ela NAO e a mesma nos cinco portais desta leva
    location ~* "^/%s/([a-z0-9-]+)/?$" { return 301 /%s/$1/; }
    location ~* "^/(%s)/?$" { return 301 /%s/; }
    location ~* "^/(home|inicio|index\\.php)/?$" { return 301 /; }
%s    location ~* "^/page/[0-9]+/?$" { return 301 /; }
    location ~* "^/%s/[a-z0-9-]+/page/[0-9]+/?$" { return 301 /; }
    location ~* ^/author/(.+)$ { return 301 /equipe/; }
    # prefixo mais longo, para ganhar do "^~ /wp-content/" logo abaixo: sem isto
    # toda imagem indexada no Google Imagens morreria em 410
    location ^~ /wp-content/uploads/ {
        rewrite "^/wp-content/uploads/[0-9]{4}/[0-9]{2}/(.+)$" /img/$1 permanent;
        rewrite "^/wp-content/uploads/(.+)$" /img/$1 permanent;
        return 410;
    }

    # o motor serve estes dois: precisam vir antes da regra generica de sitemap
    location = /news-sitemap.xml { try_files $uri @motor; }
    location = /sitemap.xml      { try_files $uri @motor; }

    # ---- 410 do que deixou de existir
    location ~* ^/tag/(.*)$ { return 410; }
    location ~* ^/topicos/(.*)$ { return 410; }
    location ~* "^/(wp-sitemap[a-z0-9-]*\\.xml|sitemap[_-]index\\.xml|[a-z0-9-]+-sitemap\\.xml|feed/?|comments/feed/?|xmlrpc\\.php|wp-login\\.php)$" { return 410; }
    location ^~ /wp-content/ { return 410; }
    location ^~ /wp-includes/ { return 410; }
    location ^~ /wp-admin/    { return 410; }
    # prefixo SIMPLES, sem ^~: com ^~ ele engoliria a rota do Antonio, que e regex
    location /wp-json/        { return 410; }
    include /etc/nginx/gone/%s.conf;

    location ~* \\.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2)$ { expires 30d; add_header Cache-Control "public"; }
    # HTML sem cache de borda, senao a pagina fica presa no navegador sem revalidar
    location / { add_header Cache-Control "no-cache" always; add_header X-Content-Type-Options nosniff always; try_files $uri $uri/ $uri/index.html @motor; }
    location @motor { proxy_pass http://127.0.0.1:%d; proxy_set_header Host $host; proxy_intercept_errors on; }

    # diretorio sem indice devolveria 403: vira a 404 do portal
    error_page 403 =404 /404.html;
    error_page 404 /404.html;
    access_log off;
}
''' % (dom, s['fp']['arch'], IP, dom, dom, pub, redir, PORTA, PORTA,
       base, outra, base, '|'.join(outros_mapa), mapa,
       # rede de seguranca: /<editoria>/ so redireciona quando NAO e portal plano,
       # porque no plano essa forma e endereco de artigo
       ('    # rede de seguranca: /<editoria>/ nunca foi endereco valido aqui, mas\n'
        '    # link antigo de terceiro as vezes usa essa forma\n'
        '    location ~* "^/(%s)/?$" { return 301 /%s/$1/; }\n' % ('|'.join(eds), base))
       if not plano else
       ('    # ⚠️ portal PLANO: /<editoria>/ e endereco de ARTIGO, entao nao existe\n'
        '    # rede de seguranca aqui. Redirecionar poria artigo em 301 para a\n'
        '    # listagem, e o backlink morreria no salto\n'),
       base, slug, PORTA)

    alvo = '/etc/nginx/conf.d/portal-%s.conf' % slug
    print('  %-18s %-28s base /%s/  %s  mapa /%s/'
          % (slug, dom, base, 'www canonico' if canon_www else 'apex canonico', mapa))
    if APLICA:
        io.open(alvo, 'w', encoding='utf-8', newline='\n').write(t)
        print('     gravado em %s' % alvo)

if not APLICA:
    print('  ensaio. rode com --aplica.')
