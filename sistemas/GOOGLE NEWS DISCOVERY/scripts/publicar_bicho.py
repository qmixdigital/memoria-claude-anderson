#!/usr/bin/env python3
"""Publica o resultado da Federal no viajenodetalhe, em duas formas.

  pagina fixa   /insights/deu-no-poste/            reescrita a cada sorteio
  materia       /insights/deu-no-poste-<concurso>/ uma por concurso, para o arquivo

Roda no opengravity porque a Caixa bloqueia datacenter e os espelhos so
respondem para IP brasileiro. Nao usa modelo de IA: resultado de loteria e dado,
e pagar token para reescrever uma tabela so cria chance de errar um numero.

  python3 publicar.py            simula, imprime o que iria
  python3 publicar.py --aplica   publica
"""
import json, sys, datetime
sys.path.insert(0, '/opt/bicho')
import httpx, bicho

CFG = '/opt/portal-engine/sites.json'
SLUG_SITE = 'viajenodetalhe'
CATEGORIA = 'Insights'
AUTOR = 'Beatriz Oliveira'
RECEPTOR = 'http://127.0.0.1:8791'

aplica = '--aplica' in sys.argv


def credencial():
    cfg = json.load(open(CFG, encoding='utf-8'))
    s = [x for x in cfg['sites'] if x['slug'] == SLUG_SITE][0]
    return s['domain'], s['apikey'], s['ns']


def enviar(dominio, chave, ns, payload):
    r = httpx.post('%s/%s/artigos' % (RECEPTOR, ns), json=payload, timeout=60,
                   headers={'Content-Type': 'application/json',
                            'X-API-KEY': chave, 'Host': dominio})
    return r.status_code, r.json() if r.headers.get('content-type', '').startswith('application/json') else r.text


def pagina_fixa(res):
    """Uma URL so, que acumula autoridade em vez de diluir a cada sorteio."""
    p = res['premios'][0]
    return {
        'title': 'Deu no Poste Hoje: Resultado do Jogo do Bicho',
        'slug': 'deu-no-poste',
        'metaTitle': 'Deu no Poste Hoje: Resultado do Jogo do Bicho',
        'metaDescription': bicho.meta_resultado(res)[:158],
        'dek': ('Resultado do concurso %s da Loteria Federal, sorteado em %s, '
                'com os cinco premios e os grupos correspondentes.'
                % (res['concurso'], res['data'])),
        'content': bicho.texto_resultado(res),
        'categories': CATEGORIA, 'author': AUTOR, 'status': 'publish',
    }


def materia_do_concurso(res):
    """Uma por sorteio: alimenta o arquivo e pega as buscas com data."""
    return {
        'title': bicho.titulo_resultado(res)[:70],
        'slug': 'deu-no-poste-%s' % res['concurso'],
        'metaTitle': bicho.titulo_resultado(res)[:60],
        'metaDescription': bicho.meta_resultado(res)[:158],
        'dek': ('Os cinco premios do concurso %s da Loteria Federal e o bicho '
                'de cada um.' % res['concurso']),
        'content': bicho.texto_resultado(res),
        'categories': CATEGORIA, 'author': AUTOR, 'status': 'publish',
    }


def main():
    res = bicho.ultimo()
    dominio, chave, ns = credencial()
    print('  concurso %s de %s | %s' % (res['concurso'], res['data'], dominio))
    for nome, payload in (('pagina fixa', pagina_fixa(res)),
                          ('materia do concurso', materia_do_concurso(res))):
        print('  %-20s slug=%-24s %d chars' % (nome, payload['slug'], len(payload['content'])))
        if not aplica:
            continue
        cod, corpo = enviar(dominio, chave, ns, payload)
        print('      -> HTTP %s  %s' % (cod, (corpo.get('url') if isinstance(corpo, dict) else str(corpo))[:80]))
    if not aplica:
        print('  (simulacao, nada enviado)')


if __name__ == '__main__':
    main()
