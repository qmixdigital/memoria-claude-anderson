# -*- coding: utf-8 -*-
"""Gera a imagem dos 34 preservados que nao tem foto em lugar nenhum.

Uso, no servidor:  python3 /tmp/cenas_saude.py <slug> [--aplica]

⚠️ **Uma imagem por artigo, e nao uma por tema.** Reaproveitar o arquivo poria a
mesma foto em varios artigos do mesmo portal e, pior, entre portais vizinhos, que
e impressao digital de conjunto. O prompt e o mesmo do tema, mas cada chamada
devolve uma imagem diferente.

⚠️ **Nenhum prompt descreve pessoa real.** Onde a materia fala de alguem
identificavel, a cena mostra o contexto, e nao a pessoa.

🔴 **`no text` no prompt NAO impede texto na imagem.** Quando a cena pede um
objeto que no mundo real carrega texto (rotulo de frasco, tela ligada, caderno
aberto, jornal, caixa de remedio), o FLUX escreve garatuja mesmo com `no text, no
words, no letters`. Ja foram ao ar frascos escritos "POWELE" e "PONETET". A
correcao nao e repetir a proibicao, e **tirar o objeto que pede texto**: frasco
liso sem rotulo, cartela de comprimido sem impressao, tela desligada, livro
fechado.

⚠️ **O campo `image` do motor e OBJETO**, e nao string.
"""
import io
import json
import os
import re
import subprocess
import sys
import unicodedata
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
DATA = '/srv/portais/%s/data' % SLUG
IMG = '/srv/portais/%s/public/img' % SLUG
CHAVE = '<<REMOVIDO>>'
COMUM = (', professional photography, high quality, soft natural light, shallow depth '
         'of field, no text anywhere, no labels, no packaging print')

TEMAS = [
    # dose e horario de medicamento: cartela LISA, copo simples, sem rotulo
    (r'tomar \d|de \d+ em \d+|dose|comprimido|capsula|dipirona|amoxicilina|clonazepam|'
     r'glifage|losartana|omeprazol|paracetamol|ibuprofeno|remedio|antibiotico',
     ('blank unmarked blister pack of white pills resting on a light wooden table beside '
      'a plain clear glass of water, morning light from a window, no printing on the '
      'foil, no bottle, no box',
      'Cartela lisa de comprimidos sobre a mesa, ao lado de um copo de água')),
    (r'horario|manha|noite|jejum|antes de dormir|fluoxetina|sertralina|antidepressivo',
     ('bedside table at dawn with a plain glass of water and a small empty ceramic dish, '
      'soft light through a curtain, alarm clock face turned away, no screen, no printing',
      'Mesa de cabeceira ao amanhecer, com um copo de água e um pequeno prato de cerâmica')),
    (r'anvisa|proibe|recolhe|suspende|apreender|irregularidade|registro',
     ('empty pharmacy counter seen from behind, plain unlabelled glass jars on a shelf out '
      'of focus, neutral daylight, no signage, no printed packaging',
      'Balcão de farmácia vazio, com frascos lisos desfocados na prateleira ao fundo')),
    (r'suplemento|vitamina|whey|colageno|creatina',
     ('plain unlabelled amber glass jar and a wooden spoon with loose white powder on a '
      'stone countertop, side light, no label, no printed pot, no box',
      'Pote de vidro âmbar sem rótulo e uma colher de madeira sobre a bancada')),
    (r'pele|cosmetic|beleza|creme|rotina de cuidados|hidrata',
     ('unlabelled ceramic cream jar with the lid off beside a folded cotton towel on a '
      'marble surface, morning light, no printed tube, no packaging',
      'Pote de cerâmica sem rótulo aberto ao lado de uma toalha de algodão dobrada')),
    (r'discurso|presidente|governo|politic|ministro|deslize|declarac',
     ('two empty microphones on a plain lectern in an out of focus room, warm indoor '
      'light, no banner, no crest, no people, no signage',
      'Dois microfones sobre um púlpito vazio, com a sala desfocada ao fundo')),
    (r'hospital|clinica|atendimento|odontolog|consulta|posto de saude|servico',
     ('empty hospital corridor with natural light from a tall window and a row of plain '
      'waiting chairs, no signage, no room numbers, no people',
      'Corredor de hospital vazio, com luz natural e cadeiras de espera')),
    (r'plataforma|aplicativo|site|online|digital|telemedicina',
     ('closed laptop and a plain notebook with a pen on a wooden desk beside a cup of '
      'coffee, window light, screen closed and dark, no writing on the paper',
      'Notebook fechado e um caderno com caneta sobre a mesa de madeira')),
    (r'exame|diagnostic|laboratorio|sangue|resultado',
     ('laboratory bench with empty glass test tubes in a metal rack and a stainless tray, '
      'cool daylight, no labels, no printed forms',
      'Bancada de laboratório com tubos de ensaio vazios em uma estante metálica')),
    (r'alimenta|dieta|comida|fruta|receita|cha|erva|tempero',
     ('rustic wooden board with fresh green leaves, a small ceramic bowl and a linen cloth '
      'on a kitchen table, daylight from the side, no packaging, no jars with labels',
      'Tábua de madeira com folhas frescas, uma tigela de cerâmica e um pano de linho')),
]
PADRAO = ('quiet clinic waiting room with an empty chair by a window and a potted plant, '
          'soft daylight, no signage, no magazines, no screens',
          'Sala de espera de clínica com uma cadeira vazia junto à janela')


def sem_acento(t):
    return unicodedata.normalize('NFD', (t or '').lower()).encode('ascii', 'ignore').decode()


def cena(titulo):
    t = sem_acento(titulo)
    for rx, par in TEMAS:
        if re.search(rx, t):
            return par
    return PADRAO


def gera(prompt, alvo):
    corpo = json.dumps([{'taskType': 'imageInference', 'taskUUID': str(uuid.uuid4()),
                         'model': 'runware:100@1', 'positivePrompt': prompt + COMUM,
                         'width': 832, 'height': 576, 'numberResults': 1, 'steps': 4,
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
        print('     resposta sem data: %s' % r.stdout.decode()[:150])
        return None
    subprocess.run(['curl', '-s', '-o', alvo, d['data'][0]['imageURL']], check=True)
    subprocess.run(['chown', 'portais:portais', alvo])
    return os.path.getsize(alvo)


alvos = []
for l in io.open('/tmp/%s-sem-foto.tsv' % SLUG, encoding='utf-8'):
    if not l.strip():
        continue
    slug, titulo, cat = (l.rstrip('\n').split('\t') + ['', ''])[:3]
    alvos.append((slug, titulo, cat))

print('  %s: %d artigo(s) sem foto' % (SLUG, len(alvos)))
if not APLICA:
    for s, t, c in alvos:
        print('     %-52s -> %s' % (t[:52], cena(t)[1][:52]))
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

os.makedirs(IMG, exist_ok=True)
feitos = falhou = 0
for s, t, c in alvos:
    prompt, alt = cena(t)
    arq = s[:70] + '.webp'
    n = gera(prompt, os.path.join(IMG, arq))
    if not n:
        falhou += 1
        print('  ⚠️ %s' % s[:60])
        continue
    p = os.path.join(DATA, s + '.json')
    d = json.load(io.open(p, encoding='utf-8'))
    d['image'] = {'file': arq, 'alt': alt, 'title': d.get('title') or '',
                  'w': 832, 'h': 576}
    io.open(p, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(d, ensure_ascii=False, indent=2))
    feitos += 1
    print('  %-56s %4d KB' % (s[:56], n // 1024))

print('  geradas: %d | falharam: %d' % (feitos, falhou))
