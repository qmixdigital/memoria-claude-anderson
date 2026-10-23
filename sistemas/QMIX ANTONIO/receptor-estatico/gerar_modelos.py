#!/usr/bin/env python3
"""Extrai de um artigo real de cada site estatico um modelo com placeholders,
confere que o modelo reconstrói o original byte a byte, e grava
site/_antonio/modelo.html + site/_antonio/config.json."""
import json, re, os, sys, unicodedata

def slugify(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s

SITES = {
  'saudevitalidade.com.br': dict(
    modelo='prolactina-alta-sintomas-causas-e-o-que-investigar',
    titulo='Prolactina alta: sintomas, causas e o que investigar',
    descricao='Prolactina alta: veja os sintomas, as causas mais comuns, como o médico investiga e em quais casos o tratamento controla o problema hormonal.',
    data_iso='2026-10-22T12:40:00.000Z', data_ymd='2026-10-22', data_br='22 de out. de 2026',
    autor='Marco Jean', categoria='Saúde', cat_anchor='cat-saude', minutos='6',
    media='/media/antonio/', flavor='iort', blog='/blog',
    categorias={2:'Saúde',3:'Alimentação',4:'Dicas',5:'Fitness',6:'Beleza',7:'Notícias',8:'Dietas',9:'Saúde Bucal',10:'Tecnologia'},
    nome_site='Saúde Vitalidade',
  ),
  'institutoortopedico.com.br': dict(
    modelo='3-livros-para-educar-criancas-em-um-mundo-equilibrado',
    titulo='3 livros para educar crianças em um mundo equilibrado',
    descricao='Três obras para a nova geração somam 176 páginas e combinam entretenimento, pedagogia e reflexão sobre temas da infância.',
    data_iso='2026-08-22T09:58:24.938Z', data_ymd='2026-08-22', data_br='22 de ago. de 2026',
    autor='Redação', categoria='Saúde', cat_anchor='cat-saude', minutos='2',
    media='/media/antonio/', flavor='iort', blog='/blog',
    categorias={3:'Ortopedia',4:'Cirurgias',5:'Tratamentos',6:'Dicas',7:'Notícias',8:'Tecnologias',11:'Fraturas',12:'Doenças',41:'Mais Acessados',42:'Joelho',151:'Insights'},
    nome_site='Instituto Ortopédico',
  ),
  'planomedicosaude.com.br': dict(
    modelo='3-livros-para-educar-criancas-em-um-mundo-equilibrado',
    titulo='3 livros para educar crianças em um mundo equilibrado',
    descricao=None,  # lida da meta description
    data_iso='2026-08-24T10:12:09.779Z', data_ymd='2026-08-24', data_br='24 de agosto de 2026',
    autor='Redação', categoria='Notícias', cat_anchor='cat-noticias', minutos=None,
    media='/uploads/antonio/', flavor='pms', blog='/blog/',
    categorias={3:'Negócios',9:'Alimentação',14:'Saúde',17:'Tecnologia',20:'Estilo de Vida',121:'Plano de Saúde',148:'Dicas'},
    nome_site='Plano Médico Saúde',
  ),
}

def tokenizar(site, cfg):
    base = f'd:/SITES/{site}/site'
    html = open(f'{base}/{cfg["modelo"]}/index.html', encoding='utf-8').read()
    orig = html
    if cfg['descricao'] is None:
        cfg['descricao'] = re.search(r'<meta name="description" content="([^"]*)"', html).group(1)
    slug = cfg['modelo']
    valores = dict(TITULO=cfg['titulo'], DESCRICAO=cfg['descricao'], SLUG=slug,
                   DATA_ISO=cfg['data_iso'], DATA_YMD=cfg['data_ymd'], DATA_BR=cfg['data_br'],
                   AUTOR=cfg['autor'], CATEGORIA=cfg['categoria'], CAT_ANCHOR=cfg['cat_anchor'])
    if cfg['minutos']: valores['MINUTOS'] = cfg['minutos']

    # 1) corpo do artigo -> {{CORPO}} (primeiro, para o texto do corpo nao sofrer as trocas globais)
    if cfg['flavor'] == 'iort':
        m = re.search(r'(<div class="iort-art-body">)(.*?)(</div><aside class="iort-art-cross">)', html, re.S)
    else:
        m = re.search(r'(<div class="pms-artigo-corpo">)(.*?)(</div></div><aside class="pms-artigo-lado">)', html, re.S)
    assert m, 'corpo nao encontrado'
    corpo = m.group(2)
    html = html[:m.start(2)] + '{{CORPO}}' + html[m.end(2):]
    valores['CORPO'] = corpo

    # 2) trocas pontuais (categoria e inicial do autor): nunca global, senao pega "Saude Vitalidade"
    pont = []
    if cfg['flavor'] == 'iort':
        pont += [
          (f'<p class="iort-eyebrow iort-eyebrow--amber">{cfg["categoria"]}</p>', '<p class="iort-eyebrow iort-eyebrow--amber">{{CATEGORIA}}</p>'),
          (f'<a href="/blog#{cfg["cat_anchor"]}">{cfg["categoria"]}</a>', '<a href="/blog#{{CAT_ANCHOR}}">{{CATEGORIA}}</a>'),
          (f'<i aria-hidden="true">{cfg["autor"][0]}</i>', '<i aria-hidden="true">{{AUTOR_INICIAL}}</i>'),
          (f'Leitura de <!-- -->{cfg["minutos"]}<!-- --> min', 'Leitura de <!-- -->{{MINUTOS}}<!-- --> min'),
        ]
        valores['AUTOR_INICIAL'] = cfg['autor'][0]
    else:
        pont += [
          (f'<a class="pms-artigo-cat" href="/blog/#{cfg["cat_anchor"]}">{cfg["categoria"]}</a>', '<a class="pms-artigo-cat" href="/blog/#{{CAT_ANCHOR}}">{{CATEGORIA}}</a>'),
          (f'<li><a href="/blog/#{cfg["cat_anchor"]}">{cfg["categoria"]}</a></li>', '<li><a href="/blog/#{{CAT_ANCHOR}}">{{CATEGORIA}}</a></li>'),
          (f'<meta property="article:section" content="{cfg["categoria"]}"/>', '<meta property="article:section" content="{{CATEGORIA}}"/>'),
        ]
    for a, b in pont:
        n = html.count(a)
        assert n == 1, (site, 'pontual esperada 1x', a[:60], n)
        html = html.replace(a, b)

    # 3) dentro dos blocos JSON-LD: valores viram {{X_JSON}}; categoria e anchor so no LD de artigo e breadcrumb
    def ld_sub(mm):
        bloco = mm.group(0)
        for k in ('TITULO','DESCRICAO','DATA_ISO','AUTOR','SLUG'):
            bloco = bloco.replace(valores[k], '{{'+k+'_JSON}}')
        bloco = bloco.replace(f'"articleSection":"{cfg["categoria"]}"', '"articleSection":"{{CATEGORIA_JSON}}"')
        bloco = re.sub(r'("position":3,"name":")'+re.escape(cfg['categoria'])+'(")', r'\1{{CATEGORIA_JSON}}\2', bloco)
        bloco = bloco.replace('#'+cfg['cat_anchor']+'"', '#{{CAT_ANCHOR}}"')
        return bloco
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', ld_sub, html, flags=re.S)

    # 4) trocas globais no resto (contexto HTML)
    for k in ('TITULO','DESCRICAO','DATA_ISO','DATA_BR','AUTOR','SLUG','DATA_YMD'):
        html = html.replace(valores[k], '{{'+k+'}}')

    # 5) ida e volta: o modelo preenchido com os valores originais tem que dar o original
    def render(t, v):
        out = t
        for k, val in v.items():
            out = out.replace('{{'+k+'_JSON}}', json.dumps(val, ensure_ascii=False)[1:-1])
        for k, val in v.items():
            out = out.replace('{{'+k+'}}', val)
        return out
    recon = render(html, valores)
    ok = recon == orig
    if not ok:
        # mostra a primeira diferenca
        i = next(i for i in range(min(len(recon), len(orig))) if recon[i] != orig[i])
        print('  DIFERENCA em', i, repr(orig[i-80:i+80]), '\n  vs', repr(recon[i-80:i+80]))
    # residuos: valores literais que sobraram fora de placeholder
    res = {k: html.count(valores[k]) for k in ('TITULO','DESCRICAO','SLUG','DATA_ISO','DATA_BR','DATA_YMD','AUTOR') if html.count(valores[k])}
    marcadores = sorted(set(re.findall(r'{{[A-Z_]+}}', html)))
    print(f'{site}: round-trip={"OK" if ok else "FALHOU"} | residuos={res} | marcadores={marcadores}')
    # contexto dos residuos (para julgar se sao mesmo do artigo)
    for k, n in res.items():
        for mm in list(re.finditer(re.escape(valores[k]), html))[:3]:
            print('   residuo', k, '->', html[max(0, mm.start()-60):mm.end()+40].replace('\n', ' '))

    os.makedirs(f'{base}/_antonio', exist_ok=True)
    open(f'{base}/_antonio/modelo.html', 'w', encoding='utf-8', newline='').write(html)
    conf = dict(
        host=site, nomeSite=cfg['nome_site'], media=cfg['media'], flavor=cfg['flavor'], blog=cfg['blog'],
        dataLonga=(cfg['flavor'] == 'pms'),
        categorias={str(k): {'nome': v, 'anchor': 'cat-' + slugify(v)} for k, v in cfg['categorias'].items()},
        categoriaPadrao=cfg['categoria'],
    )
    json.dump(conf, open(f'{base}/_antonio/config.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return ok

todos = all(tokenizar(s, c) for s, c in SITES.items())
# card do blog da pms, para o worker
b = open('d:/SITES/planomedicosaude.com.br/site/blog/index.html', encoding='utf-8').read()
m = re.search(r'<div class="pms-blog-grid[^"]*">', b)
print('\nPMS grid:', m.group(0) if m else 'nao achou', '\n', b[m.end():m.end()+1500] if m else '')
for s in ('saudevitalidade.com.br','institutoortopedico.com.br'):
    bb = open(f'd:/SITES/{s}/site/blog/index.html', encoding='utf-8').read()
    mm = re.search(r'<div class="iort-blog-grid[^"]*">', bb)
    print(s, 'grid:', mm.group(0) if mm else 'NAO ACHOU')
sys.exit(0 if todos else 1)
