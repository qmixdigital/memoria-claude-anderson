# -*- coding: utf-8 -*-
"""Gera a imagem dos 3 preservados do publisherbrasil que vieram sem nenhuma.

⚠️ "no text" no prompt nao impede texto na imagem: o que resolve e tirar da cena
o objeto que pede texto. Aqui os tres assuntos sao tela de celular, camisa com
estampa e carta escrita: os tres pedem texto, entao a cena mostra o gesto e nao a
superficie escrita.
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
DATA = '/srv/portais/publisherbrasil/data'
IMG = '/srv/portais/publisherbrasil/public/img'
COMUM = ', professional photography, high quality, natural light, no text anywhere'

CENAS = {
    'psicologia-do-clique-por-que-e-tao-dificil-parar-na-hora-certa': (
        'hand resting on a computer mouse at a desk late at night, only the glow of a screen '
        'lighting the room from behind, monitor turned away from camera, no interface visible, '
        'no lettering',
        'Mao sobre o mouse a noite, com o brilho da tela iluminando a mesa'),
    'rafael-jodar-colapsa-redes-con-su-camiseta-en-roland-garros': (
        'clay tennis court from the baseline in late afternoon light, racket and two balls '
        'resting on the red clay, empty stands blurred behind, no banners, no sponsor boards',
        'Quadra de saibro ao fim da tarde, com raquete e bolas sobre a terra batida'),
    'carta-anonima-destroi-casamento-de-joao-raul-e-naiane': (
        'plain sealed envelope lying on a wooden dining table beside two wedding rings, warm '
        'window light, envelope completely blank, no handwriting, no stamp',
        'Envelope fechado sobre a mesa, ao lado de duas aliancas'),
}


def gera(prompt, alvo):
    corpo = json.dumps([{'taskType': 'imageInference', 'taskUUID': str(uuid.uuid4()),
                         'model': 'runware:100@1', 'positivePrompt': prompt + COMUM,
                         'width': 832, 'height': 576, 'numberResults': 1, 'steps': 4,
                         'outputFormat': 'WEBP'}])
    r = subprocess.run(['curl', '-s', '-X', 'POST', 'https://api.runware.ai/v1',
                        '-H', 'Content-Type: application/json',
                        '-H', 'Authorization: Bearer ' + CHAVE, '-d', corpo],
                       capture_output=True)
    d = json.loads(r.stdout.decode())
    if 'data' not in d:
        print('  ⚠️ %s' % str(d)[:190])
        return None
    subprocess.run(['curl', '-s', '-o', alvo, d['data'][0]['imageURL']], check=True)
    subprocess.run(['chown', 'portais:portais', alvo])
    return os.path.getsize(alvo)


feitas = 0
for slug, (prompt, alt) in sorted(CENAS.items()):
    caminho = os.path.join(DATA, slug + '.json')
    if not os.path.isfile(caminho):
        print('  ⚠️ nao existe: %s' % slug)
        continue
    d = json.load(io.open(caminho, encoding='utf-8'))
    if d.get('image'):
        print('  ja tem imagem: %s' % slug)
        continue
    arq = slug[:70] + '.webp'
    if not APLICA:
        print('  %-58s -> %s' % (slug[:58], arq))
        continue
    n = gera(prompt, os.path.join(IMG, arq))
    if not n:
        continue
    d['image'] = {'file': arq, 'alt': alt, 'title': d.get('title') or ''}
    io.open(caminho, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
    feitas += 1
    print('  %-58s %4d KB' % (slug[:58], n // 1024))

print(('  imagens geradas: %d' % feitas) if APLICA else '  ensaio. rode com --aplica.')
