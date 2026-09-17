# -*- coding: utf-8 -*-
"""Prepara os arquivos de logotipo dos dois portais, a partir do que a origem tinha.

Cada portal precisa de duas versoes: a do cabecalho, sobre papel claro, e a do
rodape, sobre fundo escuro. O folhadonoroeste ja tinha as duas na origem. O
diariopernambucano so tinha a escura, entao a clara e feita aqui trocando **so o
grafite por branco** e deixando o carmim intacto: e o que se faz com marca de
duas cores, e nao pintar tudo de branco, que apagaria metade do nome.

⚠️ Sai em WebP com o dobro da altura de exibicao, para nao borrar em tela retina,
e com `width`/`height` declarados no HTML, senao o cabecalho pula ao carregar.
"""
import io
import sys

from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
GRAFITE = (30, 31, 35)


def perto(px, alvo, tol=70):
    return all(abs(px[i] - alvo[i]) <= tol for i in range(3))


def aclara(orig, destino):
    """Troca o grafite por branco e nao encosta no carmim."""
    im = Image.open(orig).convert('RGBA')
    d = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = d[x, y]
            if a < 8:
                continue
            # cinza escuro em qualquer tom, inclusive a borda suavizada
            if max(r, g, b) < 110 and (max(r, g, b) - min(r, g, b)) < 40:
                d[x, y] = (255, 255, 255, a)
            elif perto((r, g, b), GRAFITE):
                d[x, y] = (255, 255, 255, a)
    im.save(destino, 'WEBP', lossless=True)
    return im.size


TAREFAS = [
    ('logos/Folha-do-Noroeste-logomarca.png', 'logo-fnr.webp', None),
    ('logos/Folha-do-Noroeste-logomarca_branca.png', 'logo-fnr-branca.webp', None),
    ('logos/dpe/logo-diario_pernambucano_blog.png', 'logo-dpe.webp', None),
    ('logos/dpe/logo-diario_pernambucano_blog.png', 'logo-dpe-branca.webp', 'aclara'),
]
for orig, dest, modo in TAREFAS:
    if modo == 'aclara':
        tam = aclara(orig, dest)
    else:
        im = Image.open(orig).convert('RGBA')
        im.save(dest, 'WEBP', lossless=True)
        tam = im.size
    print('  %-22s %sx%s' % (dest, tam[0], tam[1]))
