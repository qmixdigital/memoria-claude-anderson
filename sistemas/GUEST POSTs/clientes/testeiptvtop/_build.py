import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
D='D:/SISTEMAS/GUEST POSTs/clientes/testeiptvtop/materias/'
plano={x['n']:x for x in json.load(open(D+'plano-top.json',encoding='utf-8'))}
cfg={
'T09':dict(f='_t09.html',mt='Teste IPTV no Chromecast no hotel',
 md='Veja como fazer um teste IPTV no Chromecast na TV do hotel: rede com login, entrada HDMI, celular como ponte e os limites que um teste curto não resolve.',
 dek='Antes de embarcar, veja o que checar para um teste IPTV no Chromecast funcionar na TV do hotel.',
 alt='Quarto de hotel com cama de lençóis brancos, cenário para um teste IPTV no Chromecast na TV do hotel',
 fonte='Pexels, Andrea Davis, pexels:13966978, Pexels License',url='https://www.pexels.com/photo/bedroom-in-hotel-13966978/'),
'T10':dict(f='_t10.html',mt='Teste IPTV filmes e séries: avalie o catálogo',
 md='Aprenda a fazer um teste IPTV filmes e séries com método: seis títulos, busca, dublagem, continuidade e a diferença entre o catálogo do teste e o do plano.',
 dek='Seis títulos, anotações e perguntas ao suporte mostram o que um teste IPTV filmes e séries realmente entrega.',
 alt='Close de pipoca amanteigada para ilustrar o teste IPTV filmes e séries em uma noite de cinema em casa',
 fonte='Pexels, Kam Photos, pexels:806880, Pexels License',url='https://www.pexels.com/photo/close-up-photo-of-popcorn-806880/')}
for n,c in cfg.items():
    p=plano[n]; html=open(D+c['f'],encoding='utf-8').read().strip()
    # internos do plano
    for i in p['internos']:
        assert i['href'] in html and i['titulo'] in html,(n,i)
    open(D+p['slug']+'.html','w',encoding='utf-8').write(html)
    j=dict(titulo=p['titulo'],meta_title=c['mt'],linha_fina=c['dek'],meta_description=c['md'],html=html,slug=p['slug'],site=p['site'],domain=p['domain'],ancora=p['ancora'],kw=p['kw'],imagem_alt=c['alt'],imagem_fonte=c['fonte'],imagem_fonte_url=c['url'])
    json.dump(j,open(D+p['slug']+'.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
    json.dump([dict(arquivo=p['slug']+'.html',cliente='teste-iptv.top',termos=[p['kw']],titulo=c['mt'],sufixo=p['sufixo'],meta=c['md'],h1=p['titulo'],dek=c['dek'])],open(D+'lote_'+p['slug']+'.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(n,p['slug'],len(c['mt']),p['meta_title_max'],len(c['md']),len(c['dek'].split()),p['ancora'])
    json.dump(dict(slug=p['slug'],fonte=c['fonte'],pagina_url=c['url']),open(D+p['slug']+'.ficha.json','w',encoding='utf-8'),ensure_ascii=False)
