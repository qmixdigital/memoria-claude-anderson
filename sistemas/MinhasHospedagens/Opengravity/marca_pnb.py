# -*- coding: utf-8 -*-
"""Monta a marca do pontonaturalbrasil a partir dos arquivos da origem.

A origem tem tres arquivos, e nenhum deles serve como esta:

- `Logo-PN-Brasil-Fundo-Branco.png`: simbolo e palavra os dois em **preto**
- `Logo-PN-Brasil-Verde.png`: os dois em menta claro `#A7EFCF`, so serve sobre
  fundo escuro
- `favicon-PN-BRASIL.png`: so o simbolo, em verde vivo `#00FF30`

O favicon e quem diz qual e a cor da marca. Entao a versao de fundo claro sai da
preta com o **simbolo recolorido** para o verde vivo, e a palavra fica quase
preta. Recolorir a palavra junto perderia o contraste que a propria origem usa.

⚠️ Recolorir por faixa de RGB salpica a letra. A separacao e por **luminancia**,
e o alpha vem do arquivo, nao de limiar.

⚠️ O simbolo e a palavra dividem o mesmo PNG: o corte e por coluna. O simbolo
termina antes de x=150 em 600px de largura.
"""
import io
import sys

from PIL import Image, ImageFilter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
D = 'logos/pnb/'
VIVO = (0, 255, 48)
TINTA = (18, 26, 21)
# ⚠️ o corte NAO se crava: em 600px de largura o "P" comeca antes de x=150 e
# metade da letra sairia verde. A coluna vazia entre simbolo e palavra e quem diz
def acha_corte(px, w, h):
    col = [any(px[x, y][3] > 40 and px[x, y][0] < 200 for y in range(h)) for x in range(w)]
    vendo = False
    for x in range(w):
        if col[x]:
            vendo = True
        elif vendo and not any(col[x:x + 14]):
            return x + 6
    return 120

src = Image.open(D + 'Logo-PN-Brasil-Fundo-Branco.png').convert('RGBA')
w, h = src.size
px = src.load()
CORTE = acha_corte(px, w, h)
print('  corte entre simbolo e palavra: x=%d de %d' % (CORTE, w))


def pinta(alvo, cor_escura, cor_simb):
    mask = Image.new('L', (w, h), 0)
    m = mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            # luminancia do pixel: quanto mais escuro, mais opaco fica o traco
            lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
            # ⚠️ o PNG da origem e paletizado COM pontilhado: usar 1-lum direto
            # deixa a letra chapiscada. A rampa satura o quase-preto em cheio e
            # descarta o ponto claro do dither
            t = (1.0 - lum - 0.16) / 0.68
            t = 0.0 if t < 0 else (1.0 if t > 1 else t)
            m[x, y] = int(a * t)
    # ⚠️ fechamento: dilata e volta. Tapa o furo que o pontilhado deixou dentro
    # da letra sem engordar o traco, que um blur sozinho nao faria
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.SMOOTH)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    o = out.load()
    mm = mask.load()
    for y in range(h):
        for x in range(w):
            aa = mm[x, y]
            if aa < 6:
                continue
            c = cor_simb if x < CORTE else cor_escura
            o[x, y] = (c[0], c[1], c[2], aa)
    out.save(alvo, 'WEBP', quality=95, method=6)
    return alvo


print(' ', pinta(D + 'pontonaturalbrasil-_marca.webp', TINTA, VIVO))
print(' ', pinta(D + 'pontonaturalbrasil-_marca-branca.webp', (255, 255, 255), VIVO))

# o simbolo sozinho, ampliado, para conferir o desenho do SVG contra o original
src.crop((0, 0, CORTE, h)).resize((300, 300)).save(D + 'v-simb.png')
print('  simbolo isolado em v-simb.png')
