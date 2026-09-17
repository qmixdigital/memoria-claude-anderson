# -*- coding: utf-8 -*-
"""Traz para o disco as 10 imagens que o corpo do publisherbrasil buscava em
servidor de terceiro.

Cinco artigos apontavam para `googleusercontent`, `storage.googleapis.com` e
`media-amazon`. Tres problemas:

  - **somem quando o dono quiser**, e a pagina fica com o icone de quebrado
  - **nao tem `width`/`height`**, entao derrubam o CLS
  - **entregam o referer** do leitor a um terceiro em toda visita

Baixadas para `/img/` com nome novo, medidas lidas do arquivo e `loading="lazy"`.
O que nao baixar sai do corpo: `<img>` apontando para arquivo inexistente e pior
do que nenhuma imagem.

⚠️ O nome novo sai do slug do artigo mais um contador, e nao do nome remoto: a
URL do Google nao tem nome de arquivo, so um identificador de 200 caracteres.
"""
import glob
import io
import json
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/publisherbrasil/data'
IMG = '/srv/portais/publisherbrasil/public/img'
RX = re.compile(r'(?i)<img[^>]+src="(https?://[^"]+)"[^>]*>')

try:
    from PIL import Image
    TEM_PIL = True
except ImportError:
    TEM_PIL = False

baixadas = removidas = 0
for f in sorted(glob.glob(os.path.join(DATA, '*.json'))):
    d = json.load(io.open(f, encoding='utf-8'))
    c = d.get('content') or ''
    if 'publisherbrasil.com.br' not in c and '<img' not in c:
        continue
    alvos = [u for u in RX.findall(c) if 'publisherbrasil.com.br' not in u]
    if not alvos:
        continue
    mudou = False
    for i, url in enumerate(alvos, 1):
        arq = '%s-ext%d.webp' % (d['slug'][:60], i)
        destino = os.path.join(IMG, arq)
        ok = False
        if APLICA:
            r = subprocess.run(['curl', '-sL', '--max-time', '30', '-o', destino, url],
                               capture_output=True)
            ok = r.returncode == 0 and os.path.isfile(destino) and os.path.getsize(destino) > 2000
        if ok and TEM_PIL:
            try:
                im = Image.open(destino)
                w, h = im.size
                im.convert('RGB').save(destino, 'WEBP', quality=88, method=6)
            except Exception:
                ok = False
        if ok:
            subprocess.run(['chown', 'portais:portais', destino])
            velho = next(m.group(0) for m in RX.finditer(c) if m.group(1) == url)
            novo = ('<img src="/img/%s" alt="%s" width="%d" height="%d" loading="lazy" '
                    'decoding="async">' % (arq, (d.get('title') or '').replace('"', ''), w, h))
            c = c.replace(velho, novo, 1)
            baixadas += 1
            mudou = True
            print('  baixada  %-54s %d KB  %dx%d'
                  % (arq[:54], os.path.getsize(destino) // 1024, w, h))
        elif APLICA:
            # ⚠️ nao baixou: a tag sai. Apontar para arquivo inexistente e pior
            velho = next((m.group(0) for m in RX.finditer(c) if m.group(1) == url), None)
            if velho:
                c = c.replace(velho, '', 1)
                removidas += 1
                mudou = True
                print('  REMOVIDA %s (nao baixou: %s)' % (d['slug'][:40], url.split('/')[2]))
        else:
            print('  %-40s <- %s' % (d['slug'][:40], url.split('/')[2]))
    if mudou and APLICA:
        d['content'] = c
        io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

print('  baixadas: %d | removidas: %d' % (baixadas, removidas))
print('  gravado' if APLICA else '  ensaio. rode com --aplica.')
