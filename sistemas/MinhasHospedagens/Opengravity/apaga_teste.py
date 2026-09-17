# -*- coding: utf-8 -*-
"""Apaga os artigos de teste de entrega e limpa o rastro que eles deixam.

⚠️ **Apagar o JSON nao basta**, e sao tres coisas alem dele:

 1. o **rebuild nao remove pasta**: o `public/<slug>/index.html` continua no ar
    servindo HTML velho, e a auditoria de sitemap nem sempre acusa
 2. o artigo entrou no bloco de relacionados e na malha das outras paginas: sem
    **reconstruir o portal**, ficam dezenas de links para uma pagina que virou 404
 3. o **registro de donos de slug** guarda o nome: sem liberar, aquele slug fica
    reservado para sempre e nenhum portal da rede pode usa-lo

🔴 O motor **serve da memoria** pelo proxy de reserva: sem reiniciar, a pagina
apagada continua respondendo 200 pelo `@motor`.
"""
import glob
import io
import json
import os
import shutil
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
MARCA = 'teste-de-entrega-da-plataforma-24-08'
PORTAIS = ('saudeacessivel', 'saudicas', 'saudeemalta', 'revistatopsaude', 'matogrossosaude')

apagados = []
for slug in PORTAIS:
    D = '/srv/portais/%s/data' % slug
    PUB = '/srv/portais/%s/public' % slug
    for f in glob.glob(os.path.join(D, '*%s*.json' % MARCA)):
        nome = os.path.basename(f)[:-5]
        apagados.append((slug, nome))
        print('  %-18s %s' % (slug, nome))
        if not APLICA:
            continue
        os.remove(f)
        # o rebuild nao apaga pasta: ela sai a mao
        for cam in glob.glob(os.path.join(PUB, '**', nome), recursive=True):
            if os.path.isdir(cam):
                shutil.rmtree(cam)
                print('     pasta removida: %s' % cam.replace(PUB, ''))

# o registro de donos de slug guarda o nome mesmo depois de o artigo sumir
REG = '/srv/portais/_dedup/owners.json'
if os.path.isfile(REG):
    d = json.load(io.open(REG, encoding='utf-8'))
    fora = [k for k in d if MARCA in k]
    print('  no registro de donos de slug: %d' % len(fora))
    if APLICA and fora:
        for k in fora:
            del d[k]
        io.open(REG, 'w', encoding='utf-8', newline='\n').write(
            json.dumps(d, ensure_ascii=False))
        print('     %d slug(s) liberado(s)' % len(fora))

if APLICA:
    subprocess.run(['chown', '-R', 'portais:portais', '/srv/portais'])
    subprocess.run(['systemctl', 'restart', 'portal-engine'])
    import time
    time.sleep(2)
    for slug in sorted({s for s, _ in apagados}):
        subprocess.run(['runuser', '-u', 'portais', '--', 'node', '/tmp/reb.js', slug],
                       capture_output=True)
        print('  %s reconstruido' % slug)
else:
    print('  ensaio. rode com --aplica.')
