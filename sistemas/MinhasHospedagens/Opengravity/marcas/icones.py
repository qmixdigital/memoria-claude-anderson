# -*- coding: utf-8 -*-
"""Os dois icones de marca, em vetor, tirados do que a origem ja tinha.

⚠️ **Nao inventar identidade quando o portal ja tem uma.** O favicon do
folhadonoroeste era uma rosa dos ventos marinho sobre lima, e o logotipo do
diariopernambucano tem um jornal enrolado ao lado do nome. Os dois sao melhores
do que qualquer badge de letra inicial que o motor gera sozinho.

O motor ja aceita `iconSvg` no `sites.json` e gera dali as sete medidas de PNG
mais o `.ico`. Por isso os dois sao **vetor**, e nao a imagem raster da origem:
assim o icone fica limpo em 16px e em 512px.

⚠️ **Google recorta o favicon em circulo na busca.** O desenho tem que caber numa
zona segura circular; nada essencial encostando na borda do quadrado.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

MARINHO = '#012552'
LIMA = '#E1FC00'
CARMIM = '#DA3444'
GRAFITE = '#1E1F23'

# --- Folha do Noroeste: a rosa dos ventos apontando para o noroeste ---
#
# O anel tem quatro entalhes nas diagonais. Eles saem de `stroke-dasharray`, e
# nao de quatro retangulos por cima: assim o entalhe acompanha a espessura do
# anel em qualquer tamanho. Perimetro = 2*pi*200 = 1256,6; quatro tracos de 268
# com quatro vaos de 46 fecham a conta, e o `dashoffset` de -23 leva os vaos
# para as quatro diagonais, que e onde a origem os tinha. Deixar em zero poe os
# entalhes no norte, sul, leste e oeste, e o desenho perde a rosa dos ventos.
FNR = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="Folha do Noroeste">'
    '<rect width="512" height="512" fill="%s"/>'
    '<circle cx="256" cy="256" r="200" fill="none" stroke="%s" stroke-width="34" '
    'stroke-dasharray="268 46" stroke-dashoffset="-23"/>'
    '<path d="M176 176 L392 268 L296 296 L268 392 Z" fill="%s" stroke="%s" '
    'stroke-width="18" stroke-linejoin="round"/>'
    '</svg>' % (LIMA, MARINHO, MARINHO, MARINHO)
)

# --- Diario Pernambucano: o jornal enrolado do proprio logotipo ---
#
# ⚠️ o favicon que estava na origem era outro: um circulo azul-marinho com o
# nome em tres linhas e a mesma lima do folhadonoroeste. Duas coisas contra ele:
# em 48px, que e a medida que o Google le, tres linhas de texto viram borrao; e
# a lima repetida deixaria os dois portais com a mesma cara, que e exatamente o
# que a rede evita. O simbolo do logotipo carrega a marca sem nenhum dos dois
# problemas.
DPE = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" '
    'role="img" aria-label="Diário Pernambucano">'
    '<rect width="512" height="512" fill="%s"/>'
    '<circle cx="256" cy="256" r="228" fill="%s"/>'
    # corpo do jornal: retangulo de cantos arredondados
    '<path d="M132 168 a26 26 0 0 1 26-26 h150 a26 26 0 0 1 26 26 v176 '
    'a26 26 0 0 1-26 26 h-150 a26 26 0 0 1-26-26 Z" fill="#fff"/>'
    # o rolo da direita, que e o que faz o jornal parecer enrolado
    # o fio de fundo entre o corpo e o rolo: sem ele os dois viram uma peca so
    '<path d="M300 206 h54 a30 30 0 0 1 30 30 v108 a30 30 0 0 1-30 30 '
    'a30 30 0 0 1-30-30 Z" fill="%s"/>'
    '<path d="M312 218 h42 a18 18 0 0 1 18 18 v108 a18 18 0 0 1-18 18 '
    'a18 18 0 0 1-18-18 Z" fill="#fff"/>'
    '<rect x="170" y="204" width="106" height="32" rx="10" fill="%s"/>'
    '<rect x="170" y="264" width="106" height="32" rx="10" fill="%s"/>'
    '</svg>' % (GRAFITE, CARMIM, CARMIM, CARMIM, CARMIM)
)

io.open('icone-fnr.svg', 'w', encoding='utf-8', newline='\n').write(FNR)
io.open('icone-dpe.svg', 'w', encoding='utf-8', newline='\n').write(DPE)
print('  icone-fnr.svg %d bytes | icone-dpe.svg %d bytes' % (len(FNR), len(DPE)))
