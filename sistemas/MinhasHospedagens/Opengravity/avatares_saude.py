# -*- coding: utf-8 -*-
"""Avatar de cada assinatura dos cinco portais de saude.

Uso, no servidor:  python3 /tmp/avatares_saude.py [--aplica]

⚠️ **Ilustracao, e nunca fotografia.** Retrato fotografico de persona passa por
foto de pessoa real; o desenho chapado deixa claro que e representacao. E o mesmo
padrao dos portais ja convertidos.

⚠️ **Nenhum jaleco, estetoscopio ou consultorio.** As personas sao editoras, e
nao medicas: vesti-las de profissional de saude e credencial falsa numa pagina
que existe justamente para declarar quem escreve.

⚠️ Cada avatar tem fundo, idade, cabelo e roupa proprios: onze retratos iguais em
cinco portais vizinhos sao impressao digital de conjunto.

⚠️ `no text` nao impede texto na imagem, entao nada de cracha, placa ou tela.
"""
import io
import json
import os
import subprocess
import sys
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CHAVE = '<<REMOVIDO>>'
ESTILO = (', flat vector portrait illustration, clean thick outlines, limited palette, '
          'centred head and shoulders, plain solid background, no badge, no lanyard, '
          'no screen, no text anywhere, no lettering')

PESSOAS = [
 ('saudeacessivel', 'rosangela-peixoto',
  'illustrated portrait of a woman in her late fifties with short wavy grey hair, warm '
  'brown skin, round tortoiseshell glasses, plain moss green blouse, calm friendly '
  'expression, deep green background'),
 ('saudeacessivel', 'ivo-salgueiro',
  'illustrated portrait of a man in his mid forties with close cropped dark hair and a '
  'short beard, olive skin, plain navy shirt with open collar, steady serious '
  'expression, deep green background'),
 ('saudicas', 'clarice-bonfim',
  'illustrated portrait of a woman in her mid thirties with long straight black hair '
  'tied back, light brown skin, small silver stud earrings, plain teal top, bright open '
  'expression, deep teal background'),
 ('saudicas', 'otavio-rezende',
  'illustrated portrait of a man in his early thirties with curly dark hair and light '
  'stubble, brown skin, plain olive green t-shirt, relaxed half smile, deep teal '
  'background'),
 ('saudeemalta', 'neide-marcondes',
  'illustrated portrait of a woman in her sixties with silver hair in a low bun, fair '
  'skin with visible lines, oval wire glasses, plain deep red cardigan, attentive '
  'expression, dark brick background'),
 ('saudeemalta', 'helio-quintanilha',
  'illustrated portrait of a man in his fifties with receding grey hair and a trimmed '
  'moustache, tan skin, plain dark green polo shirt, thoughtful expression, dark brick '
  'background'),
 ('saudeemalta', 'silvia-trindade',
  'illustrated portrait of a woman in her late twenties with shoulder length auburn '
  'curls, freckled fair skin, plain cream blouse, cheerful confident expression, dark '
  'brick background'),
 ('revistatopsaude', 'vera-amancio',
  'illustrated portrait of a woman in her late forties with dark hair in a sharp bob, '
  'deep brown skin, thin gold hoop earrings, plain navy blazer over a white top, '
  'composed professional expression, deep navy background'),
 ('revistatopsaude', 'rubens-falquete',
  'illustrated portrait of a man in his late thirties with wavy light brown hair and '
  'square black glasses, fair skin, plain burgundy sweater, curious expression, deep '
  'navy background'),
 ('matogrossosaude', 'dalva-siqueira',
  'illustrated portrait of a woman in her early fifties with straight dark hair to the '
  'shoulders, brown skin, plain light blue shirt, warm reassuring expression, near '
  'black background'),
 ('matogrossosaude', 'nelson-braga',
  'illustrated portrait of a man in his sixties with white hair and a full white beard, '
  'fair skin, plain charcoal jacket over a plain shirt, firm direct expression, near '
  'black background'),
]


def gera(prompt, alvo):
    corpo = json.dumps([{'taskType': 'imageInference', 'taskUUID': str(uuid.uuid4()),
                         'model': 'runware:100@1', 'positivePrompt': prompt + ESTILO,
                         'width': 448, 'height': 448, 'numberResults': 1, 'steps': 4,
                         'outputFormat': 'WEBP'}])
    r = subprocess.run(['curl', '-s', '-X', 'POST', 'https://api.runware.ai/v1',
                        '-H', 'Content-Type: application/json',
                        '-H', 'Authorization: Bearer ' + CHAVE, '-d', corpo],
                       capture_output=True)
    try:
        d = json.loads(r.stdout.decode())
    except Exception:
        return None
    if 'data' not in d:
        print('     %s' % r.stdout.decode()[:150])
        return None
    subprocess.run(['curl', '-s', '-o', alvo, d['data'][0]['imageURL']], check=True)
    subprocess.run(['chown', 'portais:portais', alvo])
    return os.path.getsize(alvo)


feitos = falhou = 0
for portal, slug, prompt in PESSOAS:
    dest = '/srv/portais/%s/public/img/autores' % portal
    alvo = os.path.join(dest, slug + '.webp')
    if os.path.isfile(alvo):
        print('  %-18s %-22s ja existe' % (portal, slug))
        continue
    if not APLICA:
        print('  %-18s %-22s %s' % (portal, slug, prompt[:56]))
        continue
    os.makedirs(dest, exist_ok=True)
    subprocess.run(['chown', 'portais:portais', dest])
    n = gera(prompt, alvo)
    if n:
        feitos += 1
        print('  %-18s %-22s %4d KB' % (portal, slug, n // 1024))
    else:
        falhou += 1
        print('  ⚠️ %-18s %s' % (portal, slug))

if APLICA:
    print('  gerados: %d | falharam: %d' % (feitos, falhou))
else:
    print('  ensaio. rode com --aplica.')
