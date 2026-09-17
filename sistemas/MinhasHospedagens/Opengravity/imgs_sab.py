# -*- coding: utf-8 -*-
"""Gera a imagem dos 12 preservados do saberdefato que vieram sem nenhuma.

⚠️ "no text" no prompt nao impede texto na imagem: o que resolve e tirar da cena
o objeto que pede texto. Metade destes assuntos e cartao, comprovante, tela de
aposta ou placar: nesses a cena mostra o gesto, e nao a superficie escrita.
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
DATA = '/srv/portais/saberdefato/data'
IMG = '/srv/portais/saberdefato/public/img'
COMUM = ', professional photography, high quality, natural light, no text anywhere'

CENAS = {
    'como-equilibrar-maturidade-e-afeto': (
        'two adults hugging warmly in a bright living room, small cake on the table behind '
        'them, soft afternoon light, no card, no banner, no writing',
        'Abraco entre dois adultos na sala, com um bolo simples ao fundo'),
    'o-que-considerar-ao-escolher-uma-nova-profissao': (
        'person sitting at a desk by a window with a closed notebook and a cup of coffee, '
        'thoughtful expression, laptop closed, no screen visible, no writing',
        'Pessoa pensativa a mesa, com caderno fechado e cafe ao lado da janela'),
    'o-impacto-das-tecnicas-atuais-no-mercado-estetico-brasileiro': (
        'lash technician in gloves working with fine tweezers near a client closed eye, '
        'bright clean studio, ring light reflection, no product boxes, no labels',
        'Profissional aplica extensao de cilios em estudio claro'),
    'o-que-caracteriza-uma-casa-de-apostas-preparada-para-2026': (
        'hands holding a smartphone face down on a wooden table beside a cup of coffee, warm '
        'evening light, screen not visible, no interface, no lettering',
        'Celular virado para baixo sobre a mesa, ao lado de uma xicara'),
    'como-demandas-urbanas-influenciam-a-escolha': (
        'busy city street food stall at dusk, vendor handing a plain card reader to a '
        'customer, blurred traffic lights behind, blank device screen, no signage',
        'Barraca de rua no fim da tarde, com a maquininha passando de mao em mao'),
    'como-transmitir-carinho-atemporal': (
        'grandmother and grandchild sitting together on a sofa laughing, small vase of flowers '
        'on the side table, warm light, no card, no gift wrap with print',
        'Avo e neto rindo juntos no sofa, com flores na mesa de canto'),
    'como-acelerar-a-rotina-diaria-2': (
        'woman applying face cream in front of a bathroom mirror in morning light, plain '
        'unlabelled jar in hand, calm expression, no packaging text',
        'Mulher aplica creme no rosto diante do espelho, pela manha'),
    'como-comprovante-fisico-ajuda-no-atendimento': (
        'close-up of hands at a shop counter operating a small card terminal, blank paper roll '
        'visible, warm store light, no printed receipt, no branding',
        'Maos operando a maquininha no balcao, com a bobina de papel a vista'),
    'carta-anonima-acaba-casamento-de-joao-raul-e-naiane': (
        'plain sealed envelope on a bedside table next to a single wedding ring, dim lamp '
        'light, envelope completely blank, no handwriting, no stamp',
        'Envelope fechado na mesa de cabeceira, ao lado de uma alianca'),
    'como-acelerar-a-rotina-diaria': (
        'skincare products with plain unlabelled packaging arranged on a bathroom shelf, soft '
        'daylight from a window, no labels, no lettering',
        'Produtos de cuidado com a pele em prateleira, sem rotulo a vista'),
    'brandon-moreno-predestined-ufc-journey-with-loneer-kavanagh': (
        'empty mixed martial arts cage in a dark arena, chain-link fence in the foreground, '
        'single overhead light on the canvas, no logos, no banners',
        'Octogono vazio iluminado por um unico refletor'),
    'live-eredivisie-ajax-vs-zwolle-weghorst-na-formacao-inicial': (
        'football pitch at night seen from the corner flag, floodlights on, wet grass, empty '
        'goal in the distance, no scoreboard, no advertising boards',
        'Campo de futebol a noite, visto da bandeirinha de escanteio'),
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
        print('  ⚠️ %s' % str(d)[:170])
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
