# -*- coding: utf-8 -*-
"""Fase 7: limpeza do conteudo importado dos cinco portais de saude.

Uso, no servidor:  python3 /tmp/limpa_saude.py <slug> [--aplica]

Cada item aqui ja custou tempo em conversao anterior:

 1. **entidade HTML** em titulo, dek, excerpt e no CORPO. `voc&ecirc;` vira
    `voc&amp;ecirc;` na tela, porque o motor escapa o texto ao renderizar. No
    corpo a decodificacao e de lista fechada: `&amp;`, `&lt;`, `&gt;` e `&quot;`
    precisam continuar escapados dentro de HTML
 2. 🔴 **`<script>` no corpo**, que a raspagem traz com JSON-LD truncado e SEM
    fechamento. O navegador engole todo o HTML seguinte e o rodape some da tela,
    enquanto o `</footer>` continua no arquivo: nenhum auditor de HTML acusa
 3. ⚠️ **`<img>` sem `src`**: a raspagem deixa `<img alt="" />` vazias. Nao
    mostram nada e ainda inflam a contagem de "imagem sem alt"
 4. **travessao**, que denuncia texto de IA. Vira virgula, dois-pontos ou some
 5. **linha fina que repete a abertura**: o `excerpt` do WordPress e o primeiro
    paragrafo cortado, e o leitor le a mesma frase duas vezes
 6. **prompt da IA vazado** no lugar do resumo
 7. **rastreador de afiliado** herdado, pixel 1x1 que nao mostra nada
 8. **hierarquia de titulo**: `h3` antes do primeiro `h2`, e `h1` dentro do corpo
    alem do titulo da pagina
 9. **imagem de corpo sem `width`/`height`**, que empurra o texto e conta como
    CLS. O arquivo esta no disco, entao a medida se le dele
10. **`excerpt` curto virando meta description**: o resumo do WordPress costuma
    ter 90 caracteres, e o motor o usa no `<head>` como esta
11. 🔴 **pagina renderizada gravada dentro do `content`**: chapeu, titulo em h2,
    assinatura, `<time>`, foto de abertura e relacionados dentro do corpo
12. **titulo repetido entre dois artigos**: eles competem na busca e o mesmo
    texto ancora passa a servir a dois destinos. Muda o TITULO, nunca o slug
"""
import collections
import glob
import html as _html
import io
import json
import os
import re
import struct
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/%s/data' % SLUG
IMG = '/srv/portais/%s/public/img' % SLUG

conta = collections.Counter()

# ------------------------------------------------------------------ entidades
ENT_TEXTO = re.compile(r'&(?:[A-Za-z][A-Za-z0-9]{1,31}|#\d{2,6}|#[Xx][0-9A-Fa-f]{2,5});')
# no corpo so entra entidade de LETRA ACENTUADA e simbolo tipografico: `&amp;`,
# `&lt;`, `&gt;` e `&quot;` precisam continuar escapados dentro de HTML
SEGURAS = re.compile(r'&(?:[aeiouAEIOU](?:acute|grave|circ|uml|tilde)|ccedil|Ccedil|ntilde|'
                     r'Ntilde|nbsp|hellip|rsquo|lsquo|rdquo|ldquo|mdash|ndash|middot|'
                     r'deg|ordm|ordf|laquo|raquo|#8217|#8216|#8220|#8221|#8230|#8211|'
                     r'#8212|#160|#186|#170|#176|#231|#199|#2\d\d);')


def desescapa(t):
    """Decodifica em laco ate estabilizar: ha entidade codificada duas vezes."""
    if not t:
        return t
    for _ in range(4):
        n = _html.unescape(t)
        if n == t:
            break
        t = n
    return t


def desescapa_corpo(c):
    if not c:
        return c
    for _ in range(3):
        novo = SEGURAS.sub(lambda m: _html.unescape(m.group(0)), c)
        if novo == c:
            break
        c = novo
    return c


# ------------------------------------------------------------------ travessao
def sem_travessao(t):
    if not t or '—' not in t:
        return t
    t = re.sub(r'\s*—\s*$', '', t)
    t = re.sub(r'(\w)\s*—\s*(\w)', r'\1, \2', t)
    return t.replace('—', ',').replace(' ,', ',').replace(',,', ',')


# ------------------------------------------------------------------ script solto
RX_SCRIPT_PAR = re.compile(r'(?is)<script\b.*?</script>')
RX_SCRIPT_ABERTO = re.compile(r'(?is)<script\b')
RX_IMG_SEM_SRC = re.compile(r'(?is)<figure[^>]*>\s*<img\b(?![^>]*\bsrc=)[^>]*>.*?</figure>'
                            r'|<img\b(?![^>]*\bsrc=)[^>]*>')
RX_PIXEL = re.compile(r'(?is)<img[^>]+(?:amazon-adsystem\.com/e/ir|/e/ir\?)[^>]*>')
RX_TERCEIRO = re.compile(r'(?is)<figure[^>]*>\s*<img[^>]+(?:googleusercontent|blogger\.googleusercontent|lh\d\-)[^>]*>.*?</figure>'
                         r'|<img[^>]+(?:googleusercontent|lh\d\-)[^>]*>')
RX_H1 = re.compile(r'(?is)<(/?)h1(\b[^>]*)>')
RX_IMGTAG = re.compile(r'(?is)<img\b[^>]*>')
RX_SRCIMG = re.compile(r'(?i)src="/img/([^"]+)"')

# ⚠️ o `(?i)` so vale no COMECO da expressao: dois deles, um em cada metade,
# fazem o Python recusar o padrao inteiro
PROMPT = re.compile(r'(?i)\((?:crie|escreva|gere|fa[çc]a)[^)]{10,240}\)'
                    r'|^(?:crie|escreva|gere) (?:uma|um) (?:linha fina|resumo|meta)')


def medida_webp(caminho):
    """Le largura e altura do cabecalho, sem PIL: a clinicas-vps nao tem a
    biblioteca, e o mesmo script roda nas tres maquinas."""
    try:
        b = open(caminho, 'rb').read(64)
    except Exception:
        return None
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        if b[12:16] == b'VP8X':
            w = 1 + int.from_bytes(b[24:27], 'little')
            h = 1 + int.from_bytes(b[27:30], 'little')
            return w, h
        if b[12:16] == b'VP8L':
            n = int.from_bytes(b[21:25], 'little')
            return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
        if b[12:16] == b'VP8 ':
            return (int.from_bytes(b[26:28], 'little') & 0x3FFF,
                    int.from_bytes(b[28:30], 'little') & 0x3FFF)
        return None
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
    if b[:6] in (b'GIF87a', b'GIF89a'):
        return struct.unpack('<HH', b[6:10])
    return None


arqs = sorted(glob.glob(os.path.join(DATA, '*.json')))
vivos = {os.path.basename(a)[:-5] for a in arqs}
titulos = collections.Counter()
regs = []

for p in arqs:
    d = json.load(io.open(p, encoding='utf-8'))
    antes = json.dumps(d, ensure_ascii=False, sort_keys=True)

    # 1. entidades, HTML e travessao nos campos de texto
    #    🔴 `<strong>` dentro do titulo sai LITERAL no `<title>` e ainda come 14
    #    caracteres da regua de 60
    for k in ('title', 'metaTitle', 'dek', 'excerpt', 'metaDescription'):
        if d.get(k):
            v = sem_travessao(re.sub(r'<[^>]+>', '', desescapa(d[k]))).strip()
            v = re.sub(r'\s+', ' ', v)
            if v != d[k]:
                conta['texto limpo'] += 1
                d[k] = v

    c = d.get('content') or ''
    orig = c

    # 2. script no corpo: tira o par e, se sobrar um sem fechamento, corta dali
    if '<script' in c.lower():
        c = RX_SCRIPT_PAR.sub('', c)
        m = RX_SCRIPT_ABERTO.search(c)
        if m:
            c = c[:m.start()]
            conta['script sem fechamento cortado'] += 1
        conta['script removido do corpo'] += 1

    # 3. img sem src e pixel de afiliado
    n = len(RX_IMG_SEM_SRC.findall(c))
    if n:
        c = RX_IMG_SEM_SRC.sub('', c)
        conta['img sem src'] += n
    n = len(RX_PIXEL.findall(c))
    if n:
        c = RX_PIXEL.sub('', c)
        conta['pixel de afiliado'] += n

    # 3b. 🔴 imagem hospedada por TERCEIRO no corpo. A raspagem trouxe fotos
    #     coladas do Google Docs, servidas por `googleusercontent.com`: elas
    #     somem no dia em que o dono apagar o documento, nao tem medida e ainda
    #     entregam uma requisicao ao Google em toda visita
    n = len(RX_TERCEIRO.findall(c))
    if n:
        c = RX_TERCEIRO.sub('', c)
        conta['imagem hospedada por terceiro'] += n

    # 4. entidade de acento no corpo, e travessao
    c2 = desescapa_corpo(c)
    if c2 != c:
        conta['entidade de acento no corpo'] += 1
        c = c2
    if '—' in c:
        c = sem_travessao(c)
        conta['travessao no corpo'] += 1

    # 5. h1 dentro do corpo vira h2, e h3 antes do primeiro h2 vira h2
    if RX_H1.search(c):
        c = RX_H1.sub(lambda m: '<%sh2%s>' % (m.group(1), m.group(2)), c)
        conta['h1 no corpo rebaixado'] += 1
    i2, i3 = c.find('<h2'), c.find('<h3')
    if i3 >= 0 and (i2 < 0 or i3 < i2):
        # sobe SO os h3 que vem antes do primeiro h2
        corte = i2 if i2 >= 0 else len(c)
        cabeca = c[:corte].replace('<h3', '<h2').replace('</h3>', '</h2>')
        c = cabeca + c[corte:]
        conta['h3 antes do primeiro h2'] += 1

    # 6. imagem de corpo sem medida: o arquivo esta no disco
    def poe_medida(m):
        tag = m.group(0)
        if 'width=' in tag and 'height=' in tag:
            return tag
        s = RX_SRCIMG.search(tag)
        if not s:
            return tag
        md = medida_webp(os.path.join(IMG, s.group(1)))
        if not md:
            return tag
        conta['img ganhou width/height'] += 1
        extra = ' width="%d" height="%d"' % md
        if 'loading=' not in tag:
            extra += ' loading="lazy" decoding="async"'
        return tag[:-1].rstrip('/').rstrip() + extra + '>'
    c = RX_IMGTAG.sub(poe_medida, c)

    if c != orig:
        d['content'] = c

    # 7. prompt da IA vazado
    for k in ('dek', 'excerpt', 'metaDescription'):
        if d.get(k) and PROMPT.search(d[k]):
            d[k] = PROMPT.sub('', d[k]).strip()
            conta['prompt da IA vazado'] += 1

    # 8. linha fina que repete a abertura
    corpo_txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', d.get('content') or '')).strip()
    dek = re.sub(r'\s+', ' ', d.get('dek') or '').strip()
    if dek and corpo_txt:
        chave = re.sub(r'[^a-z0-9 ]', '', dek.lower())[:60]
        if chave and chave in re.sub(r'[^a-z0-9 ]', '', corpo_txt.lower())[:400]:
            frases = re.split(r'(?<=[.!?]) +', corpo_txt)
            nova = ''
            for f in frases[1:]:
                f = f.strip()
                if len(f) < 60 or f.endswith('...') or f[0].islower():
                    continue
                if re.match(r'(?i)^(mas|porem|entao|assim|alem disso|por isso|ou seja)\b', f):
                    continue
                nova = f[:200]
                break
            if nova:
                d['dek'] = nova
                conta['linha fina que repetia a abertura'] += 1
            else:
                d.pop('dek', None)
                conta['linha fina removida por falta de frase'] += 1

    # 8b. linha fina AUSENTE: 96% do acervo veio do WordPress com o `excerpt`
    #     vazio, e sem ela o cartao da home e da listagem fica so com o titulo.
    #     A frase sai do corpo, mas NUNCA a primeira: a primeira e a abertura que
    #     o leitor ja vai ler logo abaixo
    if not (d.get('dek') or '').strip() and len(corpo_txt) > 200:
        frases = re.split(r'(?<=[.!?]) +', corpo_txt)
        for f in frases[1:6]:
            f = f.strip()
            if not (70 <= len(f) <= 190):
                continue
            if f.endswith('...') or f[0].islower():
                continue
            if re.match(r'(?i)^(mas|porem|entao|assim|alem disso|por isso|ou seja|'
                        r'ja que|apesar|no entanto)', f):
                continue
            d['dek'] = sem_travessao(f)
            conta['linha fina criada a partir do corpo'] += 1
            break

    # 9. meta description propria, de 110 a 165, tirada do corpo
    md = (d.get('metaDescription') or '').strip()
    if len(md) < 110 or len(md) > 175:
        base = corpo_txt
        if len(base) > 60:
            frases = re.split(r'(?<=[.!?]) +', base)
            t = ''
            for f in frases:
                if len(t) + len(f) + 1 > 165:
                    break
                t = (t + ' ' + f).strip()
            if len(t) < 110:
                t = base[:162].rsplit(' ', 1)[0]
            t = sem_travessao(t).strip()
            if 100 <= len(t) <= 175:
                d['metaDescription'] = t
                conta['meta description reescrita'] += 1

    titulos[re.sub(r'\s+', ' ', (d.get('title') or '')).strip().lower()] += 1
    regs.append((p, d, antes))

# 10. titulo repetido: muda o TITULO da copia, nunca o slug
repetidos = {t for t, n in titulos.items() if n > 1 and t}
vistos = collections.Counter()
for p, d, _ in regs:
    t = re.sub(r'\s+', ' ', (d.get('title') or '')).strip().lower()
    if t in repetidos:
        vistos[t] += 1
        if vistos[t] > 1:
            cat = (d.get('category') or {}).get('name') or ''
            ano = (d.get('date') or '')[:4]
            sufixo = (': o que muda em %s' % ano) if ano else (': guia de %s' % cat)
            d['title'] = (d.get('title') or '') + sufixo
            conta['titulo repetido reescrito'] += 1

# 11. link interno apontando para artigo que nao existe mais
RX_A = re.compile(r'(?i)<a\s([^>]*?)href="(/[^"#?]*)"([^>]*)>(.*?)</a>', re.S)
fixas = {'contato', 'quem-somos', 'politica-de-privacidade', 'termos-de-uso', 'busca',
         'equipe', 'politica-editorial', 'autor', 'img', 'categoria', 'category'}


def link_morto(u):
    partes = [x for x in u.strip('/').split('/') if x]
    if not partes or partes[0] in fixas:
        return False
    alvo = partes[-1]
    return alvo not in vivos


for p, d, _ in regs:
    c = d.get('content') or ''
    if '<a ' not in c:
        continue
    def t(m):
        if link_morto(m.group(2)):
            conta['link interno para artigo apagado'] += 1
            return m.group(4)
        return m.group(0)
    novo = RX_A.sub(t, c)
    if novo != c:
        d['content'] = novo

gravados = 0
for p, d, antes in regs:
    if json.dumps(d, ensure_ascii=False, sort_keys=True) != antes:
        gravados += 1
        if APLICA:
            io.open(p, 'w', encoding='utf-8', newline='\n').write(
                json.dumps(d, ensure_ascii=False, indent=2))

print('  %s: %d artigos, %d alterados' % (SLUG, len(regs), gravados))
for k, v in conta.most_common():
    print('     %-42s %d' % (k, v))
if not APLICA:
    print('  ensaio. rode com --aplica.')
