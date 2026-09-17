# -*- coding: utf-8 -*-
"""Fecha as ultimas descricoes fora da regua: artigo, editoria e um portal.

Sobraram tres tipos depois das passadas anteriores:

  - **artigo** com `metaDescription` curta ou longa demais, escrita na conversao
  - **editoria** com `catDesc` faltando ou curto no `sites.json`
  - um portal cujo `metaDescription` ficou curto porque ele tem poucas editorias
    e o complemento automatico nao alcancou os 100 caracteres

Artigo: a descricao sai do proprio corpo, primeiro paragrafo util, cortada em
fronteira de frase. Editoria: molde proprio do portal, com o nome dele.

⚠️ Medida no texto **decodificado**: contar `&quot;` como seis corta descricao
que estava correta.
"""
import glob
import html as H
import io
import json
import os
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
ARTIGOS = '--artigos' in sys.argv
CFG = '/opt/portal-engine/sites.json'
cfg = json.load(io.open(CFG, encoding='utf-8'))
CONECTOR = re.compile(r'(?i)^(e|mas|porem|porém|entao|então|assim|alem|além|ou|por isso|'
                      r'ja que|já que|isso|isto|ele|ela|eles|elas)\b')


def limpo(t):
    return re.sub(r'\s+', ' ', H.unescape(re.sub('<[^>]+>', ' ', t or ''))).strip()


def do_corpo(c):
    for p in re.findall(r'(?is)<p[^>]*>(.*?)</p>', c):
        t = limpo(p)
        if len(t) < 90 or CONECTOR.match(t) or t[:1].islower():
            continue
        if len(t) <= 172:
            return t
        corte = t[:170]
        i = max(corte.rfind('. '), corte.rfind('; '))
        return corte[:i + 1] if i > 100 else corte.rsplit(' ', 1)[0] + '.'
    return ''


n_art = n_cat = n_site = 0
for site in cfg['sites']:
    slug = site['slug']
    D = '/srv/portais/%s/data' % slug
    if not os.path.isdir(D):
        continue

    # --- artigo
    #
    # ⚠️ **So os que saem errados no HTML.** No JSON, 715 artigos tem
    # `metaDescription` fora da regua e o HTML sai certo mesmo assim: o motor
    # deriva a descricao do corpo quando a do artigo nao serve. Reescrever os 715
    # seria mexer em conteudo que ja esta correto na tela.
    for f in sorted(glob.glob(os.path.join(D, '*.json'))) if ARTIGOS else []:
        d = json.load(io.open(f, encoding='utf-8'))
        md = limpo(d.get('metaDescription') or d.get('excerpt') or d.get('dek') or '')
        if md and 100 <= len(md) <= 175:
            continue
        novo = do_corpo(d.get('content') or '')
        if not novo or not (100 <= len(novo) <= 175):
            continue
        print('  artigo   %-18s %-40s %3d -> %3d' % (slug, d['slug'][:40], len(md), len(novo)))
        n_art += 1
        if APLICA:
            d['metaDescription'] = novo
            io.open(f, 'w', encoding='utf-8').write(
                json.dumps(d, ensure_ascii=False, indent=2))

    # --- editoria
    cd = dict(site.get('catDesc') or {})
    cats = {}
    for f in glob.glob(os.path.join(D, '*.json')):
        d = json.load(io.open(f, encoding='utf-8'))
        c = d.get('category') or {}
        if c.get('slug'):
            cats[c['slug']] = c.get('name') or c['slug']
    for cs, nome in sorted(cats.items()):
        atual = limpo(cd.get(cs) or '')
        if 100 <= len(atual) <= 175:
            continue
        novo = ('Tudo o que o %s publicou em %s, do texto mais recente ao mais antigo. '
                'Em %s, o que muda de caso vem dito antes da recomendação.'
                % (site.get('name') or slug, nome, nome.lower()))
        if len(novo) > 175:
            novo = ('O acervo de %s do %s, do texto mais recente ao mais antigo, com a fonte '
                    'de cada informação à vista.' % (nome, site.get('name') or slug))
        if not (100 <= len(novo) <= 175):
            continue
        print('  editoria %-18s %-24s %3d -> %3d' % (slug, cs, len(atual), len(novo)))
        cd[cs] = novo
        n_cat += 1
    if APLICA and cd != (site.get('catDesc') or {}):
        site['catDesc'] = cd

    # --- o portal
    md = limpo(site.get('metaDescription') or site.get('description') or '')
    if md and len(md) < 100:
        tops = sorted(cats.values(), key=lambda x: -len(x))[:3]
        novo = md.rstrip(' .')
        if tops:
            novo += '. Acompanhe ' + ', '.join(t.lower() for t in tops)
        novo += '. Texto novo todo dia, com a fonte à vista.'
        if 100 <= len(novo) <= 175:
            print('  portal   %-18s %3d -> %3d  %s' % (slug, len(md), len(novo), novo[:70]))
            n_site += 1
            if APLICA:
                site['metaDescription'] = novo

print('  artigos: %d | editorias: %d | portais: %d' % (n_art, n_cat, n_site))
if APLICA and (n_cat or n_site):
    shutil.copyfile(CFG, CFG + '.bak-descresto-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(CFG, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(cfg, ensure_ascii=False, indent=2))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
