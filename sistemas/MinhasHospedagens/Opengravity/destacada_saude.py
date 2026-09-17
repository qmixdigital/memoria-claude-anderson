# -*- coding: utf-8 -*-
"""Preservado sem imagem destacada: promove a do corpo, ou lista para gerar.

Uso, no servidor:  python3 /tmp/destacada_saude.py <slug> [--aplica]

🔴 **O campo `image` vazio NAO significa artigo sem foto**: significa artigo sem
*destacada*. Muitos tem a foto que o cliente mandou dentro do texto, e gerar por
cima faz a pagina abrir com uma cena generica de banco de imagens enquanto a foto
de verdade fica no meio do texto. No desassossegada foram 18 artigos, e a
varredura depois achou mais 96 na rede.

A regra: havendo `<img src="/img/...">` no corpo com arquivo no disco, **promover
a primeira para destacada e remove-la do corpo**. Sem remover, a mesma foto
aparece duas vezes na pagina, uma colada na outra.

⚠️ **O `alt` do corpo quase nunca serve**: costuma ser o titulo do artigo ou o
nome do arquivo. Alt descreve a FOTO, para quem nao a ve. Quando o alt e copia do
titulo ou do slug, ele sai vazio e a legenda nao aparece.

⚠️ **O campo `image` do motor e OBJETO**, e nao string: gravar string deixa o
artigo sem imagem, sem erro nenhum.

Quem nao tem foto em lugar nenhum sai numa lista, para o gerador de cenas.
"""
import glob
import io
import json
import os
import re
import struct
import sys
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/%s/data' % SLUG
IMG = '/srv/portais/%s/public/img' % SLUG

RX_FIG = re.compile(r'(?is)<figure[^>]*>\s*<img\b[^>]*src="/img/([^"]+)"[^>]*>.*?</figure>'
                    r'|<img\b[^>]*src="/img/([^"]+)"[^>]*>')
RX_ALT = re.compile(r'(?i)alt="([^"]*)"')
# medida do Runware: 832x576, 1216x640 e 448x448. Foto de origem quase nunca cai
# nessas, entao a medida e o discriminador do que ja foi gerado
GERADAS = {(832, 576), (1216, 640), (448, 448)}


def chato(x):
    return unicodedata.normalize('NFD', str(x or '')).encode('ascii', 'ignore').decode() \
        .lower().replace('-', ' ')


def medida(caminho):
    try:
        b = open(caminho, 'rb').read(64)
    except Exception:
        return None
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        if b[12:16] == b'VP8X':
            return (1 + int.from_bytes(b[24:27], 'little'),
                    1 + int.from_bytes(b[27:30], 'little'))
        if b[12:16] == b'VP8L':
            n = int.from_bytes(b[21:25], 'little')
            return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
        if b[12:16] == b'VP8 ':
            return (int.from_bytes(b[26:28], 'little') & 0x3FFF,
                    int.from_bytes(b[28:30], 'little') & 0x3FFF)
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return struct.unpack('>II', b[16:24])
    if b[:2] == b'\xff\xd8':
        try:
            f = open(caminho, 'rb')
            f.read(2)
            while True:
                m = f.read(2)
                if len(m) < 2 or m[0] != 0xFF:
                    return None
                if m[1] in (0xC0, 0xC1, 0xC2, 0xC3):
                    f.read(3)
                    h, w = struct.unpack('>HH', f.read(4))
                    return w, h
                n = struct.unpack('>H', f.read(2))[0]
                f.seek(n - 2, 1)
        except Exception:
            return None
    return None


promovidos = 0
sem_nada = []
for p in sorted(glob.glob(os.path.join(DATA, '*.json'))):
    d = json.load(io.open(p, encoding='utf-8'))
    if (d.get('image') or {}).get('file'):
        continue
    c = d.get('content') or ''
    achou = None
    for m in RX_FIG.finditer(c):
        arq = m.group(1) or m.group(2)
        if arq and os.path.isfile(os.path.join(IMG, arq)):
            achou = (m, arq)
            break
    if not achou:
        sem_nada.append((os.path.basename(p)[:-5], d.get('title') or '',
                         (d.get('category') or {}).get('slug') or ''))
        continue
    m, arq = achou
    alt = (RX_ALT.search(m.group(0)) or ['', ''])[1].strip()
    # o alt que e copia do titulo ou do nome do arquivo nao descreve a foto
    ca, ct = chato(alt), chato(d.get('title'))
    cs = chato(d.get('slug'))
    cn = chato(os.path.splitext(arq)[0])
    if ca in (ct, cs, cn) or not ca or len(ca) < 12:
        alt = ''
    md = medida(os.path.join(IMG, arq))
    d['image'] = {'file': arq, 'alt': alt or (d.get('title') or ''),
                  'title': d.get('title') or ''}
    if md:
        d['image']['w'], d['image']['h'] = md
    # sem remover do corpo, a mesma foto aparece duas vezes, uma colada na outra
    d['content'] = c[:m.start()] + c[m.end():]
    promovidos += 1
    if APLICA:
        io.open(p, 'w', encoding='utf-8', newline='\n').write(
            json.dumps(d, ensure_ascii=False, indent=2))

print('  %s: %d promovido(s) do corpo | %d sem foto em lugar nenhum'
      % (SLUG, promovidos, len(sem_nada)))
io.open('/tmp/%s-sem-foto.tsv' % SLUG, 'w', encoding='utf-8', newline='\n').write(
    ''.join('%s\t%s\t%s\n' % x for x in sem_nada))
for x in sem_nada[:8]:
    print('     %-14s %s' % (x[2], x[1][:78]))
if not APLICA:
    print('  ensaio. rode com --aplica.')
