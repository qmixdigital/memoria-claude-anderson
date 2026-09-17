# -*- coding: utf-8 -*-
"""Troca os sitemaps do WordPress pelo do motor, no Search Console.

⚠️ **Fazer os antigos responderem 410 nao basta**: enquanto estiverem
registrados, o Google segue buscando a lista. Eles saem pela API.

⚠️ **Listar antes de apagar.** Alem dos `wp-sitemap` previsiveis, aparece
sitemap cadastrado em caminho qualquer, do tipo `/equipe/sitemap.xml` ou
`/<slug-de-artigo>/sitemap.xml`, e um no host `www`. No euvo eram 16 no total, e
so cinco tinham nome de wp-sitemap.

🔴 O escopo precisa ser `webmasters`, **sem** o `.readonly`: com o de leitura o
`submit` e o `delete` falham por permissao.

⚠️ **Sitemap de noticias vazio da erro na virada.** Enviar so o `sitemap.xml`.
"""
import io
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CHAVES = {
    'enjai': r'C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json',
    'backlinkguard': r'C:\Users\User\Desktop\backlinkguard-google-sa.json',
}
ESCOPO = ['https://www.googleapis.com/auth/webmasters']
PORTAIS = [
    ('saudeacessivel.com.br', 'https://saudeacessivel.com.br/sitemap.xml'),
    ('saudicas.com.br', 'https://saudicas.com.br/sitemap.xml'),
    ('saudeemalta.net.br', 'https://saudeemalta.net.br/sitemap.xml'),
    ('revistatopsaude.com.br', 'https://revistatopsaude.com.br/sitemap.xml'),
    ('matogrossosaude.com.br', 'https://www.matogrossosaude.com.br/sitemap.xml'),
]

contas = {}
for nome, caminho in CHAVES.items():
    cred = service_account.Credentials.from_service_account_file(caminho, scopes=ESCOPO)
    sc = build('searchconsole', 'v1', credentials=cred, cache_discovery=False)
    props = {s['siteUrl'] for s in (sc.sites().list().execute().get('siteEntry') or [])}
    contas[nome] = (sc, props)

for dom, novo in PORTAIS:
    achou = None
    for nome, (sc, props) in contas.items():
        for forma in ('sc-domain:' + dom, 'https://%s/' % dom, 'https://www.%s/' % dom):
            if forma in props:
                achou = (nome, sc, forma)
                break
        if achou:
            break
    if not achou:
        print('  🔴 %-24s sem propriedade no Search Console' % dom)
        continue
    conta, sc, prop = achou
    try:
        lista = (sc.sitemaps().list(siteUrl=prop).execute().get('sitemap') or [])
    except Exception as e:
        print('  🔴 %-24s nao consegui listar: %s' % (dom, str(e)[:70]))
        continue
    velhos = [s['path'] for s in lista if s['path'] != novo]
    print('  %-24s %s | %d sitemap(s) cadastrado(s)' % (dom, prop, len(lista)))
    for p in velhos:
        print('     antigo: %s' % p)
    if not APLICA:
        continue
    for p in velhos:
        try:
            sc.sitemaps().delete(siteUrl=prop, feedpath=p).execute()
            print('     removido: %s' % p)
        except Exception as e:
            print('     🔴 nao removeu %s: %s' % (p, str(e)[:60]))
    try:
        sc.sitemaps().submit(siteUrl=prop, feedpath=novo).execute()
        print('     enviado: %s' % novo)
    except Exception as e:
        print('     🔴 nao enviou: %s' % str(e)[:80])

if not APLICA:
    print('  ensaio. rode com --aplica.')
