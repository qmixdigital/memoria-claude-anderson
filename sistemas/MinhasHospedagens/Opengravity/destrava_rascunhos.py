# -*- coding: utf-8 -*-
"""Destrava os 72 conteudos da plataforma que ficaram presos como rascunho.

🔴 **O motor guarda como rascunho todo conteudo que chega SEM IMAGEM**
(`site.exigeImagem !== false`, no `render.js`). O JSON e gravado, a resposta e
HTTP 201, e o artigo **nunca vai ao ar**. Nada acusa: nem log de erro, nem
auditoria, nem o painel da plataforma.

Sao 72 artigos parados desde 16 e 17/08/2026, em 31 portais da clinicas-vps. Os
outros dois servidores nao tem nenhum.

Cada um recebe uma imagem gerada e passa para `publish`.

⚠️ **Uma imagem por artigo, e nao uma por tema.** Os 72 cobrem 13 assuntos, e
varios portais receberam o mesmo assunto. Reaproveitar o arquivo poria a mesma
foto em ate 21 portais da rede, que e impressao digital de conjunto. O prompt e o
mesmo do tema, mas cada chamada devolve uma imagem diferente.

⚠️ **Nenhum prompt descreve pessoa real.** Onde a materia fala de alguem
identificavel, a cena mostra o contexto, e nao a pessoa.

⚠️ "no text" nao impede texto na imagem: os prompts tiram da cena o objeto que
pede texto (placar, faixa, cartaz, tela).
"""
import glob
import io
import json
import os
import re
import subprocess
import sys
import unicodedata
import uuid

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CHAVE = '<<REMOVIDO>>'
COMUM = ', professional photography, high quality, natural light, no text anywhere'

TEMAS = [
    (r'collant|ginastica|mundial de ginastica',
     ('empty artistic gymnastics arena before the competition, balance beam and mat under '
      'the lights, chalk bowl on a stand, no banners, no scoreboard, no logos',
      'Ginásio de ginástica artística vazio antes da competição')),
    (r'el nino|super el nino',
     ('dry cracked earth in the foreground and heavy storm clouds gathering on the horizon, '
      'late afternoon light, wide landscape, no signage, no lettering',
      'Solo rachado pela seca com nuvens de tempestade se formando ao fundo')),
    (r'lens x psg|psg x lens|trophee|troph',
     ('empty football stadium at night seen from the stands, floodlights on, green pitch and '
      'centre circle visible, no scoreboard, no advertising boards, no logos',
      'Estádio de futebol vazio à noite, com os refletores acesos')),
    (r'granizo|temporal',
     ('hailstones scattered on a wet street after a storm, water running by the kerb, grey sky '
      'and a damaged awning behind, no signage, no lettering',
      'Pedras de granizo na rua molhada depois do temporal')),
    (r'doenca rara|empresario',
     ('quiet cemetery path lined with trees in the late afternoon, flowers left on a stone '
      'bench, soft light, no headstone text, no lettering',
      'Alameda arborizada de cemitério ao fim da tarde, com flores sobre um banco')),
    (r'cingapura|singapura',
     ('city street at dusk with a police line tape stretched across the pavement, blurred '
      'traffic lights behind, no signage, no lettering, no faces',
      'Rua da cidade ao anoitecer com faixa de isolamento policial')),
    (r'vasco|colidio|cuesta',
     ('football training ground in the morning, cones and balls arranged on the grass, empty '
      'goal behind, no kit crests, no lettering',
      'Campo de treino de futebol pela manhã, com cones e bolas na grama')),
    (r'taylor swift|corte de cabelo|novo visual',
     ('hairdresser scissors and comb resting on a marble counter beside a folded towel, soft '
      'salon light, mirror out of focus behind, no labels, no lettering',
      'Tesoura e pente sobre a bancada do salão, com o espelho desfocado ao fundo')),
    (r'coruna|elche|laliga',
     ('football pitch corner flag in close-up with the empty stands blurred behind, afternoon '
      'light, no advertising boards, no lettering',
      'Bandeirinha de escanteio com as arquibancadas vazias ao fundo')),
    (r'al-hilal|benzema',
     ('empty football locker room with a folded kit on the bench and boots on the floor, low '
      'warm light, no crests, no numbers, no lettering',
      'Vestiário de futebol vazio, com uniforme dobrado no banco')),
    (r'ps5|campanha ps5|jogo',
     ('game controller resting on a dark sofa beside a bowl of snacks, television turned off '
      'and dark in the background, no screen content, no logos',
      'Controle de videogame no sofá, com a televisão desligada ao fundo')),
    (r'mega-sena|aposta',
     ('hands holding a plain paper slip over a shop counter, pen beside it, warm indoor light, '
      'slip completely blank, no printing, no numbers',
      'Mãos com um bilhete em branco sobre o balcão')),
    (r'deslizamento',
     ('hillside after a landslide, exposed red earth and uprooted vegetation, overcast sky, '
      'no rescue vehicles, no signage',
      'Encosta com o barranco exposto depois de um deslizamento')),
    (r'cardiff|wrexham',
     ('old football ground seen from behind the goal, worn terraces and grey sky, empty pitch, '
      'no advertising, no lettering',
      'Estádio antigo visto atrás do gol, com as arquibancadas vazias')),
]
PADRAO = ('newsroom desk with a closed notebook and a cup of coffee by the window, morning '
          'light, no screen, no writing',
          'Mesa de redação com caderno fechado e café junto à janela')


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
        return None
    subprocess.run(['curl', '-s', '-o', alvo, d['data'][0]['imageURL']], check=True)
    subprocess.run(['chown', 'portais:portais', alvo])
    return os.path.getsize(alvo)


alvos = []
for f in sorted(glob.glob('/srv/portais/*/data/*.json')):
    try:
        d = json.load(io.open(f, encoding='utf-8'))
    except Exception:
        continue
    if d.get('status') == 'draft':
        alvos.append((f, d))

print('  rascunhos presos: %d' % len(alvos))
if not APLICA:
    for f, d in alvos[:6]:
        print('    %-18s %-46s -> %s'
              % (f.split('/srv/portais/')[1].split('/')[0], d['slug'][:46], cena(d['title'])[1][:44]))
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

feitos = falhou = 0
portais = set()
for f, d in alvos:
    portal = f.split('/srv/portais/')[1].split('/')[0]
    IMG = '/srv/portais/%s/public/img' % portal
    os.makedirs(IMG, exist_ok=True)
    prompt, alt = cena(d.get('title') or '')
    arq = d['slug'][:70] + '.webp'
    n = gera(prompt, os.path.join(IMG, arq))
    if not n:
        falhou += 1
        print('  ⚠️ %-18s %s' % (portal, d['slug'][:50]))
        continue
    d['image'] = {'file': arq, 'alt': alt, 'title': d.get('title') or ''}
    d['status'] = 'publish'
    io.open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))
    feitos += 1
    portais.add(portal)
    print('  %-18s %-46s %4d KB' % (portal, d['slug'][:46], n // 1024))

print('  publicados: %d | falharam: %d | portais afetados: %d' % (feitos, falhou, len(portais)))
for p in sorted(portais):
    subprocess.run(['runuser', '-u', 'portais', '--', 'node', '/tmp/reb.js', p],
                   capture_output=True)
print('  portais reconstruidos')
