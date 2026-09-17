# -*- coding: utf-8 -*-
"""Monta a marca do saberdefato a partir do arquivo da origem.

A marca e a mais completa da leva: um **mascote de oculos e gravata-borboleta
apontando**, dentro de um circulo laranja, ao lado de SABER DE FATO em grotesco
pesado marinho, com o "DE" em laranja.

Para fundo claro o arquivo da origem serve como esta.

🔴 **Para fundo escuro nao existe versao, e recolorir o desenho inteiro nao
funciona**: o mascote e feito de contorno marinho, e clareando o marinho ele vira
um fantasma sem tracos. A tentativa esta guardada como prova em `v-branca.png`.

O que funciona e recolorir **so a palavra**, que e chapada: o mascote continua
igual e se le sobre o marinho pelo circulo laranja e pelo branco da camisa.

⚠️ O corte entre mascote e palavra sai da **coluna vazia** entre os dois, nunca
cravado.
"""
import io
import sys

from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
D = 'logos/sab/'
CLARO = (238, 242, 248)

src = Image.open(D + 'LOGO-MENOR.png').convert('RGBA')
w, h = src.size
px = src.load()


def acha_corte():
    """A coluna vazia entre o mascote e a palavra."""
    col = [any(px[x, y][3] > 40 for y in range(h)) for x in range(w)]
    vendo = False
    for x in range(w):
        if col[x]:
            vendo = True
        elif vendo and not any(col[x:x + 12]):
            return x + 4
    return int(w * 0.45)


CORTE = acha_corte()
print('  corte entre mascote e palavra: x=%d de %d' % (CORTE, w))

src.save(D + 'saberdefato-_marca.webp', 'WEBP', quality=95, method=6)

out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
o = out.load()
trocados = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a < 8:
            continue
        lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        # ⚠️ so a PALAVRA muda, e so o marinho dentro dela: o "DE" laranja fica
        if x >= CORTE and lum < 90 and b >= r:
            o[x, y] = (CLARO[0], CLARO[1], CLARO[2], a)
            trocados += 1
        else:
            o[x, y] = (r, g, b, a)
out.save(D + 'saberdefato-_marca-branca.webp', 'WEBP', quality=95, method=6)
print('  pixels da palavra clareados: %d' % trocados)

bg = Image.new('RGBA', (w, h), (0, 15, 44, 255))
bg.alpha_composite(out)
bg.convert('RGB').resize((760, int(h * 760 / w))).save(D + 'v-escura.png')
bg2 = Image.new('RGBA', (w, h), (255, 255, 255, 255))
bg2.alpha_composite(src)
bg2.convert('RGB').resize((760, int(h * 760 / w))).save(D + 'v-clara2.png')
a = Image.open(D + 'v-clara2.png')
b = Image.open(D + 'v-escura.png')
c = Image.new('RGB', (760, a.size[1] + b.size[1]), (255, 255, 255))
c.paste(a, (0, 0))
c.paste(b, (0, a.size[1]))
c.save(D + 'v-par2.png')
print('  prova em v-par2.png')

# ---- o favicon: SO o mascote, e nao o `cropped-LOGO-MENOR.png` da origem
#
# ⚠️ O arquivo que o WordPress usava como `site_icon` e um recorte quadrado que
# ainda **pega um pedaco do "S"** do wordmark: em 48px vira uma barra laranja
# solta ao lado do desenho. O recorte certo sai do proprio logotipo, ate a coluna
# vazia que separa o mascote da palavra.
import math

mascote = src.crop((0, 0, CORTE, h))
mp = mascote.load()
mx0, my0, mx1, my1 = mascote.size[0], h, 0, 0
for y in range(h):
    for x in range(mascote.size[0]):
        if mp[x, y][3] > 120:
            mx0 = min(mx0, x); my0 = min(my0, y)
            mx1 = max(mx1, x); my1 = max(my1, y)
corte = mascote.crop((mx0, my0, mx1 + 1, my1 + 1))
LADO = 512
esc = (0.78 * LADO) / math.hypot(*corte.size)
novo = corte.resize((int(corte.size[0] * esc), int(corte.size[1] * esc)), Image.LANCZOS)
fundo = Image.new('RGBA', (LADO, LADO), (0, 15, 44, 255))
fundo.alpha_composite(novo, ((LADO - novo.size[0]) // 2, (LADO - novo.size[1]) // 2))
fundo.convert('RGB').save(D + 'saberdefato-favicon.png', 'PNG')
fundo.convert('RGB').resize((240, 240)).save(D + 'v-fav.png')
print('  favicon: so o mascote, %dx%d dentro de 512' % (novo.size[0], novo.size[1]))
