# -*- coding: utf-8 -*-
"""Monta a marca do folhar a partir dos arquivos da origem.

A origem ja tinha tudo pronto, e nada precisa ser desenhado:

- `logo-portal-folha-r-branca.webp`: a palavra FOLHA com o R da seta, em **preto**
- `logo-portal-folha-r.webp`: a mesma coisa em **branco**
- o `site_icon` 1349: so o R com a seta, branco sobre preto, 512x512

🔴 **Os dois nomes estao TROCADOS na origem.** O arquivo que se chama "branca" e
o preto, e o sem sufixo e o branco. Copiar pelo nome poria a marca branca sobre
papel branco no cabecalho, e o cabecalho ficaria vazio sem nenhum erro. Aqui a
escolha e por **luminancia media dos pixels opacos**, nao pelo nome.

⚠️ O favicon da origem serve, mas as pontas da seta encostam nos cantos: o Google
**recorta o favicon em circulo** na busca e cortaria a flecha. Ele e recomposto
com folga, sobre o chumbo da paleta.
"""
import io
import sys

from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
D = 'logos/flr/'
CHUMBO = (20, 26, 33)


def luz_media(caminho):
    im = Image.open(caminho).convert('RGBA')
    soma = n = 0
    for r, g, b, a in list(im.getdata()):
        if a < 120:
            continue
        soma += 0.2126 * r + 0.7152 * g + 0.0722 * b
        n += 1
    return soma / max(1, n)


A = D + 'logo-portal-folha-r.webp'
B = D + 'logo-portal-folha-r-branca.webp'
la, lb = luz_media(A), luz_media(B)
escura, clara = (A, B) if la < lb else (B, A)
print('  luminancia: %s=%.0f  %s=%.0f' % (A.split('/')[-1], la, B.split('/')[-1], lb))
print('  a de fundo claro (traco escuro) e: %s' % escura.split('/')[-1])

# 🔴 **A versao "preta" da origem nao e toda preta**: a palavra FOLHA e preta,
# mas o **R da seta continua branco**, com sombra cinza. Sobre papel branco o
# simbolo simplesmente some, e a marca vira "FOLHA" sem o R.
#
# Recolorir o R inverteria a extrusao e estragaria o desenho. A saida e outra, e
# vira decisao de arquitetura: **o cabecalho e o rodape da AT sao chumbo**, e a
# marca usada nos dois e a **branca**, que e como a origem sempre a mostrou (o
# favicon dela tambem e branco sobre preto).
#
# A versao escura fica salva do lado, para o dia em que alguem quiser um
# cabecalho claro: ai o R precisa ser redesenhado, nao recolorido.
Image.open(clara).convert('RGBA').save(D + 'folhar-_marca.webp', 'WEBP', quality=95, method=6)
Image.open(clara).convert('RGBA').save(D + 'folhar-_marca-branca.webp', 'WEBP', quality=95, method=6)
Image.open(escura).convert('RGBA').save(D + 'folhar-_marca-escura.webp', 'WEBP', quality=95, method=6)
print('  folhar-_marca.webp e -branca.webp: a versao CLARA, para cabecalho chumbo')
print('  folhar-_marca-escura.webp: guardada, mas o R dela e branco e some no papel')

# ---- o favicon, com folga para o recorte circular do Google
src = Image.open(D + 'favicon-orig.png').convert('RGBA')
w, h = src.size
px = src.load()
# o desenho e claro sobre fundo escuro: a caixa sai dos pixels claros
x0, y0, x1, y1 = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y][:3]
        if (0.2126 * r + 0.7152 * g + 0.0722 * b) > 110:
            x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
corte = src.crop((x0, y0, x1 + 1, y1 + 1))
print('  desenho do favicon: %dx%d dentro de %dx%d' % (corte.size[0], corte.size[1], w, h))

# cabe num circulo de raio 0,70 do lado: a diagonal do desenho e quem manda
LADO = 512
alvo_diag = 0.70 * LADO
import math
diag = math.hypot(*corte.size)
esc = alvo_diag / diag
novo = corte.resize((max(1, int(corte.size[0] * esc)), max(1, int(corte.size[1] * esc))),
                    Image.LANCZOS)
fundo = Image.new('RGBA', (LADO, LADO), CHUMBO + (255,))
fundo.alpha_composite(novo, ((LADO - novo.size[0]) // 2, (LADO - novo.size[1]) // 2))
fundo.convert('RGB').save(D + 'folhar-favicon.png', 'PNG')
print('  folhar-favicon.png %dx%d, desenho em %dx%d' % (LADO, LADO, novo.size[0], novo.size[1]))
