"""Roda na opengravity. Move os apps de revistadeducao e desassossegada do Pages
para subdominio no pages.json e sites.json do portal-engine. Idempotente."""
import json, shutil, datetime
st = datetime.datetime.now().strftime('%Y%m%d-%H%M')
MOV = {
  'revistadeducao': {'/contadores/': 'https://contadores.revistadeducao.com.br/'},
  'desassossegada': {p: 'https://diretorio.desassossegada.com.br' + p for p in
    ['/saloes/', '/salao/', '/barbearias/', '/barbearia/', '/esmalterias/', '/esmalteria/',
     '/clinicas-de-estetica/', '/clinica-de-estetica/', '/cadastro-salao/', '/remocao-diretorio/',
     '/painel-diretorio/', '/admin-diretorio/', '/og-diretorio/', '/sitemaps-diretorio/']},
}
MOV['desassossegada']['/sitemap-diretorio.xml'] = 'https://diretorio.desassossegada.com.br/sitemap-diretorio.xml'

p = '/opt/portal-engine/pages.json'; pg = json.load(open(p, encoding='utf-8'))
mudou = False
for slug in MOV:
    if slug in (pg.get('apps') or {}): pg['apps'].pop(slug); mudou = True
    pg.setdefault('appsMovidos', {})
    if pg['appsMovidos'].get(slug) != MOV[slug]: pg['appsMovidos'][slug] = MOV[slug]; mudou = True
if mudou:
    shutil.copy(p, p + '.bak-' + st); json.dump(pg, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('pages.json ok')

p = '/opt/portal-engine/sites.json'; cfg = json.load(open(p, encoding='utf-8'))
mudou = False
for s in cfg['sites']:
    if s['slug'] == 'revistadeducao':
        if s.get('diretorio', {}).get('url') != 'https://contadores.revistadeducao.com.br/':
            s['diretorio']['url'] = 'https://contadores.revistadeducao.com.br/'; mudou = True
        if s.get('sitemapsExtra') != ['https://contadores.revistadeducao.com.br/sitemap.xml']:
            s['sitemapsExtra'] = ['https://contadores.revistadeducao.com.br/sitemap.xml']; mudou = True
    if s['slug'] == 'desassossegada':
        if s.get('sitemapsExtra') != ['https://diretorio.desassossegada.com.br/sitemap-diretorio.xml']:
            s['sitemapsExtra'] = ['https://diretorio.desassossegada.com.br/sitemap-diretorio.xml']; mudou = True
        for m in s.get('menuExtra') or []:
            if m.get('slug') == '/saloes/': m['slug'] = 'https://diretorio.desassossegada.com.br/saloes/'; mudou = True
if mudou:
    shutil.copy(p, p + '.bak-' + st); json.dump(cfg, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('sites.json ok')
print('config pronta')
