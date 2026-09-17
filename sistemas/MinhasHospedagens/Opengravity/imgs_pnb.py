# -*- coding: utf-8 -*-
"""Gera a imagem dos 12 preservados do pontonaturalbrasil que vieram sem nenhuma.

Artigo sem imagem sobe com buraco no topo e sem `og:image`, e o compartilhamento
sai cego. Nesta conversao ele nao e apagado por isso: ganha imagem gerada.

⚠️ **"no text" no prompt nao impede texto na imagem.** O que resolve e tirar da
cena o objeto que pede texto: placar eletronico, cartaz, cartao de aniversario,
tela de celular com interface, embalagem com rotulo. Onde o assunto e justamente
uma tela ou um cartao, a cena mostra o gesto e nao a superficie escrita.

⚠️ A largura e a altura precisam ser multiplos de 64. 832x576 e a medida de
conteudo desta rede.
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
DATA = '/srv/portais/pontonaturalbrasil/data'
IMG = '/srv/portais/pontonaturalbrasil/public/img'
COMUM = ', professional photography, high quality, natural light, no text anywhere'

CENAS = {
    'ao-vivo-semifinal-campeonato-paraense-paysandu-x-castanhal': (
        'football stadium at dusk seen from the stands, crowd of supporters out of focus, '
        'empty green pitch lit by floodlights, no scoreboard, no banners, no signage',
        'Torcida no estadio antes do inicio da semifinal, com o gramado iluminado ao fundo'),
    'brandon-moreno-e-a-conexao-com-loneer-kavanagh-antes-do-ufc-mexico-city': (
        'empty mixed martial arts cage in a dark arena, chain-link fence in the foreground, '
        'canvas floor lit by a single overhead light, no logos, no banners',
        'Octogono vazio de artes marciais mistas iluminado antes do evento'),
    'brasil-x-franca-na-vnl-2026-onde-assistir-e-horario': (
        'indoor volleyball court from the baseline, net stretched across the polished wooden '
        'floor, ball resting near the line, empty gymnasium, no scoreboard, no advertising',
        'Quadra de volei de ginasio com a rede montada e a bola junto a linha de fundo'),
    'como-cada-categoria-atende-diferentes-perfis': (
        'hands of a small shop owner holding a plain card reader over a wooden counter, '
        'blurred store shelves behind, blank device screen, no branding, no printed receipt',
        'Comerciante segura a maquininha de cartao sobre o balcao da propria loja'),
    'como-dar-os-primeiros-passos-no-atendimento-feminino': (
        'beauty studio close-up, technician in gloves working with fine tweezers near a '
        "client's closed eye, soft ring light, clean white towel, no packaging, no labels",
        'Profissional aplica extensao de cilios com pinca em estudio de beleza'),
    'como-escrever-algo-doce-e-simples': (
        "child's birthday table at home, small frosted cake with lit candles, colorful paper "
        'cups, blurred balloons behind, no banner, no card, no lettering on the cake',
        'Mesa de aniversario infantil com bolo de velas acesas e baloes ao fundo'),
    'como-funciona-a-evolucao-profissional-na-estetica': (
        'organized lash technician workstation seen from above, tweezers, brushes and a small '
        'mirror on a clean tray, soft daylight, no product boxes, no labels',
        'Bancada organizada de lash designer com pincas, pinceis e espelho'),
    'como-quem-esta-comecando-deve-escolher': (
        'street vendor at an outdoor market stall handing a small blank card machine to a '
        'customer, morning light, fruit crates around, no signage, no price tags',
        'Vendedor de feira entrega a maquininha ao cliente na barraca'),
    'como-traduzir-amor-e-cuidado': (
        'adult daughter hugging her mother in a bright kitchen, cup of coffee and a small '
        'bunch of flowers on the table, warm morning light, no card, no gift wrap with print',
        'Filha abraca a mae na cozinha, com flores e cafe sobre a mesa'),
    'como-uniformizar-regioes-especificas-2': (
        'close-up portrait of a woman applying skincare cream along her jawline in front of a '
        'bathroom mirror, soft daylight, plain unlabelled jar, no packaging text',
        'Mulher aplica creme na linha da mandibula diante do espelho'),
    'como-uniformizar-regioes-especificas': (
        'side profile of a woman with clear skin in soft studio light, hand resting near the '
        'jaw, neutral background, no products in frame, no labels',
        'Perfil de mulher com a pele do rosto iluminada por luz suave de estudio'),
    'do-hype-ao-habito-como-um-passatempo-vira-rotina-digital': (
        'person sitting by a window in the morning with a notebook and a cup of tea, phone '
        'face down on the table, calm routine, blank notebook page, no writing, no screen',
        'Rotina da manha junto a janela, com caderno fechado e o celular virado para baixo'),
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
        print('  ⚠️ %s' % str(d)[:200])
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
    # ⚠️ o campo `image` do motor e OBJETO. Gravar string deixa o artigo sem
    # imagem, sem erro nenhum
    d['image'] = {'file': arq, 'alt': alt, 'title': d.get('title') or ''}
    io.open(caminho, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
    feitas += 1
    print('  %-58s %4d KB' % (slug[:58], n // 1024))

print('  imagens geradas: %d' % feitas if APLICA else '  ensaio. rode com --aplica.')
