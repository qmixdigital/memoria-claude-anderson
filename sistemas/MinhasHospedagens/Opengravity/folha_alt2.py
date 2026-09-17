# -*- coding: utf-8 -*-
"""Folha de contato com o numero DENTRO da imagem.

⚠️ Com a legenda embaixo do quadro, a leitura em coluna confunde qual numero e de
qual foto, e alt trocado e informacao falsa, que e pior do que alt vazio. O
numero desenhado por cima do proprio quadro nao deixa duvida.
"""
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from PIL import Image, ImageDraw

LADO, COLS = 340, 3
alvos = [l.rstrip('\n').split('\t') for l in io.open('/tmp/alt-lista.tsv', encoding='utf-8')
         if l.strip()]
for lote in range(3):
    parte = alvos[lote * 14:(lote + 1) * 14]
    if not parte:
        break
    linhas = (len(parte) + COLS - 1) // COLS
    folha = Image.new('RGB', (COLS * LADO, linhas * LADO), '#DDDDDD')
    dr = ImageDraw.Draw(folha)
    for i, (portal, slug, arq, titulo) in enumerate(parte):
        n = lote * 14 + i + 1
        x, y = (i % COLS) * LADO, (i // COLS) * LADO
        try:
            im = Image.open('/srv/portais/%s/public/img/%s' % (portal, arq)).convert('RGB')
            im.thumbnail((LADO - 6, LADO - 6))
            folha.paste(im, (x + 3, y + 3))
        except Exception:
            pass
        # o numero vai POR CIMA, num tarjao, no canto de cima a esquerda
        dr.rectangle([x + 3, y + 3, x + 62, y + 30], fill='#000000')
        dr.text((x + 12, y + 10), '%02d' % n, fill='#FFFFFF')
    folha.save('/tmp/folha2-%d.jpg' % (lote + 1), quality=84)
    print('  /tmp/folha2-%d.jpg  %d imagens (%02d a %02d)'
          % (lote + 1, len(parte), lote * 14 + 1, lote * 14 + len(parte)))
