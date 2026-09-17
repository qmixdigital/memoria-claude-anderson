# -*- coding: utf-8 -*-
"""Importa os preservados de um portal de saude direto para o `data/` do motor.

Uso, no servidor:  python3 /tmp/importa_saude.py <slug> [--aplica]

Grava o JSON do artigo em vez de publicar pela API, por dois motivos:

  - o motor **barra slug repetido e mesmo assim devolve HTTP 201**, entao a
    contagem de arquivos e a unica prova de que tudo entrou
  - a data original precisa atravessar, e o `publishArticle` carimba a data da
    importacao

O que atravessa intacto: slug, editoria, imagem destacada e as do corpo, tags e
data original.

🔴 **A editoria sai da URL de origem, e nao de `cats[0]`.** Post com mais de uma
categoria traz a lista numa ordem que nao e a da URL, e importar pela primeira
muda a URL de pagina preservada por backlink.

🔴 **As assinaturas foram trocadas de proposito.** Os quatro portais da hostverge
assinavam todo o acervo com os mesmos dois nomes, o que e impressao digital de
rede. O mapeamento artigo/autor da origem e mantido; so os nomes mudam, e cada
portal tem os seus.

⚠️ **Nome de arquivo que colide entre meses diferentes** vira uma imagem so no
motor, e a segunda copia rouba a foto da primeira sem erro nenhum. As colisoes
conhecidas estao em COLISAO e recebem sufixo.
"""
import collections
import io
import json
import os
import re
import sys
import urllib.parse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
SP = '/tmp/saude'
DATA = '/srv/portais/%s/data' % SLUG
PUB = '/srv/portais/%s/public' % SLUG

# de-para de assinatura, por portal. A chave e o nome que veio da origem
AUTOR = {
    'saudeacessivel': {
        'Fátima Watanabe': 'Rosângela Peixoto', 'Marco Jean': 'Ivo Salgueiro',
        'Editorial': 'Rosângela Peixoto', 'suporte': 'Rosângela Peixoto',
        '_padrao': 'Rosângela Peixoto'},
    'saudicas': {
        'Fátima Watanabe': 'Clarice Bonfim', 'Marco Jean': 'Otávio Rezende',
        'suporte': 'Clarice Bonfim', '_padrao': 'Clarice Bonfim'},
    'saudeemalta': {
        'Fátima Watanabe': 'Neide Marcondes', 'Marco Jean': 'Hélio Quintanilha',
        'Juliana Borges': 'Sílvia Trindade', 'suporte': 'Neide Marcondes',
        '_padrao': 'Neide Marcondes'},
    'revistatopsaude': {
        'Fátima Watanabe': 'Vera Amâncio', 'Marco Jean': 'Rubens Falquete',
        'suporte': 'Vera Amâncio', '_padrao': 'Vera Amâncio'},
    'matogrossosaude': {'_padrao': 'Dalva Siqueira'},
}
# no matogrossosaude a assinatura segue a editoria, porque a origem assinava
# tudo com uma conta so
FRENTE = {'matogrossosaude': {'noticias': 'Nelson Braga', 'servicos': 'Nelson Braga'}}

# nome de arquivo que existe em mais de uma pasta de mes, com conteudo diferente
COLISAO = {
    'saudicas': {'2025/12/image.jpeg': 'image-b.jpeg'},
    'saudeemalta': {'2026/04/image.png': 'image-b.png',
                    '2024/05/image.jpeg': 'image-b.jpeg',
                    '2023/11/O-que-significa-carencia-em-plano-de-saude.jpg':
                        'O-que-significa-carencia-em-plano-de-saude-b.jpg',
                    '2024/05/image-1.jpeg': 'image-1-b.jpeg'},
}

PLANO = {'saudeemalta', 'matogrossosaude'}
DOMINIO = {'saudeacessivel': 'saudeacessivel.com.br', 'saudicas': 'saudicas.com.br',
           'saudeemalta': 'saudeemalta.net.br', 'revistatopsaude': 'revistatopsaude.com.br',
           'matogrossosaude': 'matogrossosaude.com.br'}


def iso(d):
    """`post_date_gmt` vem do MySQL como "2026-08-20 23:02:47": espaco no lugar
    do T e sem fuso. Nao e data valida, e o Search Console recusa cada URL do
    sitemap. Como o campo ja e GMT, basta trocar o espaco e marcar o Z."""
    s = str(d or '').strip()
    m = re.match(r'^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$', s)
    return '%sT%sZ' % (m.group(1), m.group(2)) if m else s


RX_SRC = re.compile(r'(?i)((?:src|srcset)=")([^"]*?)(")')
RX_A_INT = re.compile(r'(?i)(<a\s[^>]*href=")https?://(?:www\.)?%s([^"]*)(")'
                      % re.escape(DOMINIO[SLUG]))
RX_UP = re.compile(r'(?i)/wp-content/uploads/([^"\'\s)>]+\.(?:webp|jpg|jpeg|png|gif|avif))')
RX_VAR = re.compile(r'-\d{2,4}x\d{2,4}(\.[a-z]+)$', re.I)
_B = chr(92) + 'b'
_S = chr(92) + 's'
RX_IMG = re.compile('(?is)<figure[^>]*>' + _S + '*<img' + _B + '[^>]*>.*?</figure>'
                    '|<img' + _B + '[^>]*>')
COL = COLISAO.get(SLUG, {})


def arquivo_de(u):
    """Caminho de upload -> nome do arquivo no motor, ja sem variante de tamanho
    e com o sufixo das colisoes conhecidas."""
    m = RX_UP.search(u or '')
    if not m:
        return None
    rel = RX_VAR.sub(lambda x: x.group(1), m.group(1))
    if rel in COL:
        return COL[rel]
    return os.path.basename(rel)


def limpa_src(c):
    def t(m):
        v = m.group(2)
        if 'wp-content/uploads' in v:
            # srcset traz varios; cada um vira o mesmo arquivo, entao fica um so
            a = arquivo_de(v.split(',')[0].strip().split(' ')[0])
            return m.group(1) + ('/img/' + a if a else v) + m.group(3)
        return m.group(0)
    return RX_SRC.sub(t, c)


def tira_imagem_morta(c, mortas):
    """Imagem cujo arquivo nao existe no disco do motor sai inteira, junto com o
    `figure` que a embrulha. Reapontar so mudaria o endereco do 404."""
    def t(m):
        bloco = m.group(0)
        alvo = re.search(r'(?i)src="/img/([^"]+)"', bloco)
        if not alvo:
            return bloco
        if os.path.isfile(os.path.join(PUB, 'img', alvo.group(1))):
            return bloco
        mortas[0] += 1
        return ''
    return RX_IMG.sub(t, c)


ver = json.load(io.open(os.path.join(SP, SLUG, 'veredito.json'), encoding='utf-8'))
mapa = AUTOR[SLUG]
frente = FRENTE.get(SLUG, {})
por_autor = collections.Counter()
por_cat = collections.Counter()
sem_img = 0
gravados = 0
mortas = [0]
paginas = []

for l in io.open(os.path.join(SP, '%s-acervo.jsonl' % SLUG), encoding='utf-8'):
    a = json.loads(l)
    if ver.get(str(a['id']), [''])[0] != 'mantem':
        continue
    if a['type'] == 'page':
        paginas.append(a)
        continue

    cats = a.get('cats') or []
    if SLUG in PLANO:
        cat = cats[0] if cats else {'slug': 'noticias', 'name': 'Notícias'}
    else:
        # 🔴 a editoria da URL manda, e nao a primeira da lista
        p = urllib.parse.urlsplit(a.get('url') or '').path.strip('/').split('/')
        alvo = p[0] if len(p) > 1 else None
        cat = next((c for c in cats if c['slug'] == alvo), None)
        if cat is None:
            cat = cats[0] if cats else {'slug': 'noticias', 'name': 'Notícias'}
    # a editoria "uncategorized" nao vai ao ar com esse nome
    if cat['slug'] in ('uncategorized', 'sem-categoria'):
        cat = {'slug': 'saude', 'name': 'Saúde'}

    autor = frente.get(cat['slug']) or mapa.get((a.get('author') or '').strip()) \
        or mapa['_padrao']
    por_autor[autor] += 1
    por_cat[cat['slug']] += 1

    c = limpa_src(a.get('content') or '')
    # link interno absoluto vira relativo: com o dominio escrito, nada disso
    # sobrevive a uma troca de host
    c = RX_A_INT.sub(lambda m: m.group(1) + m.group(2) + m.group(3), c)
    c = tira_imagem_morta(c, mortas)

    img = None
    if a.get('thumb'):
        arq = arquivo_de(a['thumb'])
        if arq and os.path.isfile(os.path.join(PUB, 'img', arq)):
            img = {'file': arq, 'alt': a.get('thumb_alt') or a.get('title') or '',
                   'title': a.get('title') or ''}
    if not img:
        sem_img += 1

    novo = {
        'slug': a['slug'],
        'title': a.get('title') or '',
        'content': c,
        'excerpt': a.get('excerpt') or '',
        'dek': a.get('excerpt') or '',
        'date': iso(a.get('date')),
        'author': autor,
        'category': {'slug': cat['slug'], 'name': cat['name']},
        'tags': a.get('tags') or [],
    }
    if img:
        novo['image'] = img
    if APLICA:
        io.open(os.path.join(DATA, a['slug'] + '.json'), 'w', encoding='utf-8',
                newline='\n').write(json.dumps(novo, ensure_ascii=False, indent=2))
    gravados += 1

print('  %s' % SLUG)
print('  artigos: %d | sem imagem destacada: %d | imagens de corpo removidas: %d'
      % (gravados, sem_img, mortas[0]))
print('  paginas preservadas (viram extraPages): %d %s'
      % (len(paginas), [p['slug'] for p in paginas]))
print('  assinaturas: %s' % ', '.join('%s(%d)' % (n, k) for n, k in por_autor.most_common()))
print('  editorias: %s' % ', '.join('%s(%d)' % (c, k) for c, k in por_cat.most_common()))
if APLICA:
    n = len([x for x in os.listdir(DATA) if x.endswith('.json')])
    print('  arquivos em data/: %d %s' % (n, '(bate)' if n == gravados else '🔴 NAO BATE'))
else:
    print('  ensaio. rode com --aplica.')
