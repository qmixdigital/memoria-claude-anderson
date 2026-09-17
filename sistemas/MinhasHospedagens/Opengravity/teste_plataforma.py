# -*- coding: utf-8 -*-
"""Teste real de entrega da plataforma do Antonio, depois da virada.

Publica um conteudo pela rota de cada portal, confere que ele aparece no ar no
formato de URL certo, e **apaga em seguida**.

🔴 **Nao confiar no HTTP 201.** O motor devolve 201 tambem quando barra slug
repetido, e devolve 201 gravando como RASCUNHO quando o conteudo chega sem
imagem (`site.exigeImagem !== false`). A prova e a URL responder 200.

⚠️ **Artigo de teste deixa rastro nas vizinhas.** Ele entra no bloco de
relacionados e na malha das outras paginas: sem reconstruir o portal depois de
apagar, ficam dezenas de links para uma pagina que virou 404.
"""
import io
import json
import subprocess
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
FASE = sys.argv[1] if len(sys.argv) > 1 else 'publica'

PORTAIS = [
  ('saudeacessivel', 'saudeacessivel.com.br', 'a596-api',
   '<<REMOVIDO>>', 'Dicas', False),
  ('saudicas', 'saudicas.com.br', 'b283-api',
   '<<REMOVIDO>>', 'Saúde', False),
  ('saudeemalta', 'saudeemalta.net.br', 'sdea-api',
   '<<REMOVIDO>>', 'Saúde', True),
  ('revistatopsaude', 'revistatopsaude.com.br', 'b6a3-api',
   '<<REMOVIDO>>', 'Saúde', False),
  ('matogrossosaude', 'www.matogrossosaude.com.br', 'bd08-api',
   '<<REMOVIDO>>', 'Notícias', True),
]
SLUG = 'teste-de-entrega-da-plataforma-24-08'   # + o prefixo do portal


def curl(args):
    r = subprocess.run(['curl', '-s', '-m', '40'] + args, capture_output=True)
    return r.stdout.decode('utf-8', 'replace')


for slug, dom, ns, key, cat, plano in PORTAIS:
    url_art = 'https://%s/%s/' % (dom, SLUG) if plano else \
              'https://%s/%s/%s/' % (dom, cat.lower().replace('ú', 'u').replace('í', 'i'), SLUG)
    if FASE == 'publica':
        corpo = {
            'title': 'Teste de entrega da plataforma',
            'slug': '%s-%s' % (slug, SLUG),
            'content': '<p>Publicação automática de verificação, feita durante a conversão '
                       'do portal para o motor em 24 de agosto de 2026. Ela existe apenas '
                       'para provar que a rota de recebimento continua entregando e será '
                       'removida em seguida.</p>',
            'excerpt': 'Publicação de verificação da rota de recebimento, removida logo após o teste.',
            'categories': [cat],
            'author': 'Redação',
            'status': 'publish',
            'date': '2026-08-24T12:00:00Z',
        }
        # 🔴 o acento nao pode ir no `-d`: no Windows o subprocess entrega os
        # bytes na pagina de codigo do console e a categoria chega quebrada
        io.open('corpo.json', 'w', encoding='utf-8', newline=chr(10)).write(
            json.dumps(corpo, ensure_ascii=False))
        out = curl(['-X', 'POST', 'https://%s/%s/v1/artigos' % (dom, ns),
                    '-H', 'x-api-key: ' + key,
                    '-H', 'Content-Type: application/json; charset=utf-8',
                    '--data-binary', '@corpo.json'])
        try:
            d = json.loads(out)
        except Exception:
            print('  🔴 %-18s resposta nao e JSON: %s' % (slug, out[:90]))
            continue
        print('  %-18s 201=%s status=%s url=%s'
              % (slug, d.get('success'), d.get('status'), d.get('url')))
    elif FASE == 'confere':
        # a prova nao e o 201: e a URL responder 200
        c = curl(['-o', '/dev/null', '-w', '%{http_code}', '%s?v=%d' % (url_art, int(time.time()))])
        print('  %-18s %-64s %s' % (slug, url_art, c))
