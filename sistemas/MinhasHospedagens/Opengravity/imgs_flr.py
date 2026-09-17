# -*- coding: utf-8 -*-
"""Gera a imagem dos 10 preservados do folhar que vieram sem nenhuma.

⚠️ "no text" no prompt nao impede texto na imagem: o que resolve e tirar da cena
o objeto que pede texto (placar, cartaz, cartao, tela com interface, embalagem
com rotulo). Onde o assunto e justamente uma tela ou um cartao, a cena mostra o
gesto e nao a superficie escrita.

⚠️ Largura e altura multiplas de 64. 832x576 e a medida de conteudo desta rede.

⚠️ O campo `image` do motor e **objeto**: gravar string deixa o artigo sem imagem
e sem erro nenhum.
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
DATA = '/srv/portais/folhar/data'
IMG = '/srv/portais/folhar/public/img'
COMUM = ', professional photography, high quality, natural light, no text anywhere'

CENAS = {
    'como-desejar-sem-exagero': (
        'two friends toasting with coffee mugs at a small kitchen table, a single lit candle '
        'on a plain cake between them, warm morning light, no card, no banner, no writing',
        'Duas amigas brindam com xicaras diante de um bolo simples com uma vela acesa'),
    'como-fortalecer-vinculos-no-dia-certo': (
        'group of friends laughing together on a sofa in a living room, paper cups in hand, '
        'soft balloons blurred behind, no banner, no printed message, no lettering',
        'Grupo de amigos rindo na sala, com baloes desfocados ao fundo'),
    'como-transformar-habilidade-manual-em-profissao': (
        'lash technician in gloves working with fine tweezers close to a client closed eye, '
        'clean white towel, soft ring light, no product boxes, no labels',
        'Profissional aplica extensao de cilios com pinca em estudio bem iluminado'),
    'como-transformar-uma-habilidade-em-trabalho-real': (
        'organized beauty workstation seen from above, tweezers, brushes and a small mirror on '
        'a clean tray, morning daylight, no packaging, no labels',
        'Bancada organizada de trabalho com pincas, pinceis e espelho'),
    'falha-no-palco-de-katy-perry-se-junta-a-serie-de-sustos-em-shows': (
        'empty concert stage seen from the side after the show, rigging and spotlights above, '
        'haze in the beams, no screens, no banners, no logos',
        'Palco vazio de show visto de lado, com refletores acesos e fumaca no ar'),
    'filme-da-sessao-da-tarde-na-globo-confira-a-programacao-de-hoje': (
        'living room in the late afternoon with an old sofa, a bowl of popcorn on the coffee '
        'table, warm light through the window, television turned off and dark, no screen '
        'content, no logos',
        'Sala de estar no fim da tarde, com pipoca na mesa e a televisao desligada'),
    'liam-neeson-e-natasha-richardson-uma-historia-de-amor': (
        'elderly couple holding hands walking away on a quiet tree lined path in autumn, seen '
        'from behind, soft late light, no signage, no lettering',
        'Casal de maos dadas caminhando por alameda arborizada no outono'),
    'onde-vale-investir-para-trabalhar-forte': (
        'busy small shop counter with a plain card reader in the foreground and the owner '
        'serving a customer behind, daylight, blank device screen, no branding, no receipt',
        'Balcao movimentado de loja com a maquininha de cartao em primeiro plano'),
    'prefeitura-de-parauapebas-renova-convenio-com-a-uepa-para-cursos': (
        'university classroom with empty wooden desks and large windows, chalkboard clean and '
        'blank, morning light, no writing on the board, no posters',
        'Sala de aula universitaria vazia, com carteiras de madeira e luz da manha'),
    'sao-paulo-e-oscar-tem-impasse-sobre-valores-de-rescisao': (
        'empty football locker room bench with a folded kit and boots on the floor, low light, '
        'no crests, no numbers, no lettering on the fabric',
        'Banco de vestiario de futebol com uniforme dobrado e chuteiras no chao'),
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
