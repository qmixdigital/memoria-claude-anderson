# -*- coding: utf-8 -*-
"""Conserta os arcos da AS, que sairam curvando para o lado errado.

⚠️ Num arco de SVG, `sweep-flag` decide de que lado a curva passa, e os dois
lados sao geometricamente validos: nenhum erro aparece no console, no HTML ou no
`node`. So a captura de tela mostra que o simbolo virou um gancho.

O desenho certo e o mesmo ja provado no favicon: origem no ponto do sinal,
quartos de circunferencia do leste ao norte, `sweep-flag` **0**.
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = r'D:\SISTEMAS\MinhasHospedagens\Opengravity\archs\AS.js'
s = io.open(P, encoding='utf-8').read()


def arcos(ox, oy, raios):
    """Quarto de circunferencia do leste ao norte em torno de (ox, oy)."""
    return ''.join('<path d="M%s %s A%s %s 0 0 0 %s %s"/>' % (ox + r, oy, r, r, ox, oy - r)
                   for r in raios)


# o simbolo do cabecalho, em 28x28: e o fallback de quando nao ha logotipo
i = s.index('const AS_SIMB')
j = s.index(chr(10), i)
SIMB = ('const AS_SIMB = `<svg viewBox="0 0 28 28" role="img" aria-hidden="true" '
        'focusable="false" fill="none" stroke="var(--marca-1,currentColor)" '
        'stroke-width="2.6" stroke-linecap="round">'
        + arcos(7, 22, (6, 11, 16))
        + '<circle cx="7" cy="22" r="2"/>'
        + '</svg>`;')
s = s[:i] + SIMB + s[j:]

# o marcador de editoria, em 40x40, com os tres arcos inteiros
i = s.index('const AS_ARCO')
j = s.index(chr(10), i)
ARCO = ('const AS_ARCO = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" '
        'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">'
        + arcos(10, 31, (7, 13, 19))
        + '<circle cx="10" cy="31" r="2.4"/>'
        + '</svg>`;')
s = s[:i] + ARCO + s[j:]

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  AS_SIMB e AS_ARCO redesenhados com sweep-flag 0')
