# -*- coding: utf-8 -*-
"""A legenda da imagem tambem some quando o `alt` reproduz o SLUG do artigo.

As funcoes `*Legenda` do `archs.js` escondem a legenda quando o `alt` e copia do
**titulo**. Isso deixa passar um caso que a propria rede cria: quando o titulo e
**reescrito** (par repetido, fragmento de frase, titulo em outro idioma), o `alt`
continua com o titulo VELHO. Ele deixa de bater com o novo, a legenda reaparece,
e o leitor ve duas manchetes em sequencia.

O titulo velho e o que gerou o **slug**, entao comparar com o slug pega esse caso
e os antigos.

⚠️ A comparacao normaliza acento e pontuacao dos dois lados, senao "culinaria" do
slug nunca casa com "culinária" do alt.

⚠️ E aceita **um ser prefixo do outro**, com 25 caracteres de sobreposicao: o
slug do segundo de um par repetido termina em `-2`, e sem essa tolerancia a
legenda volta justo onde o titulo foi trocado.

Roda nas tres maquinas: reconhece tanto a forma original quanto a intermediaria.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/archs.js'
s = io.open(P, encoding='utf-8').read()

FIM = "  if (!alt || igual) return '';"
ORIGINAL = ("  const igual = alt.replace(/\\s+/g, ' ').toLowerCase() === "
            "t.replace(/\\s+/g, ' ').toLowerCase();\n" + FIM)
MEIO = ("  const _chato = x => String(x || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')\n"
        "    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();\n"
        "  // ⚠️ tambem some quando o alt reproduz o SLUG: titulo reescrito deixa o alt\n"
        "  // com o titulo velho, que e o que gerou o slug, e a legenda volta a aparecer\n"
        "  const igual = _chato(alt) === _chato(t) || _chato(alt) === _chato(art.slug);\n" + FIM)

NOVO = (
    "  const _chato = x => String(x || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')\n"
    "    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();\n"
    "  // ⚠️ a legenda tambem some quando o alt reproduz o SLUG: titulo reescrito\n"
    "  // deixa o alt com o titulo velho, que e o que gerou o slug\n"
    "  const _slug = _chato(art.slug), _alt = _chato(alt);\n"
    "  // ⚠️ e o slug do segundo de um par repetido termina em \"-2\": a comparacao\n"
    "  // tolera a sobra, senao a legenda volta justo onde o titulo foi trocado\n"
    "  const _pref = _alt.length >= 25 && (_slug.indexOf(_alt) === 0 || _alt.indexOf(_slug) === 0);\n"
    "  const igual = _chato(alt) === _chato(t) || _alt === _slug || _pref;\n" + FIM)

antes = len(re.findall(r'function \w+Legenda\(', s))
n_o, n_m = s.count(ORIGINAL), s.count(MEIO)
print('  funcoes *Legenda: %d | na forma original: %d | na intermediaria: %d'
      % (antes, n_o, n_m))
if n_o + n_m == 0:
    print('  nada a fazer: ja estao todas na forma nova')
    raise SystemExit()

s2 = s.replace(ORIGINAL, NOVO).replace(MEIO, NOVO)
depois = len(re.findall(r'function \w+Legenda\(', s2))
if antes != depois:
    print('  contagem de funcoes mudou de %d para %d. NAO gravei.' % (antes, depois))
    raise SystemExit(1)

if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

shutil.copyfile(P, P + '.bak-legenda-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s2)
print('  gravado em %d funcoes. reiniciar o motor e reconstruir.' % (n_o + n_m))
