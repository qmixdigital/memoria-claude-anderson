import json, csv, re, collections, sys
d=json.load(open('resultado-200.json',encoding='utf-8'))
M,L=d['metricas'],d['linking']
RE_BR=re.compile(r'(\.(gov|leg|jus|mil|edu|mp|def|tc)\.br$|^(u[fe][a-z]{1,6}|if[a-z]{1,6}|unb|usp|unesp|unicamp|unifesp|embrapa|fapesp|fiocruz|ibge|capes|cnpq|ebc|bndes|senado|camara)\.br$)',re.I)
RE_GOVX=re.compile(r'(\.(gov|edu|mil)$|\.gob\.[a-z]{2}$|\.gouv\.fr$|\.gov\.[a-z]{2}$|\.edu\.[a-z]{2}$|\.ac\.[a-z]{2}$)',re.I)
RE_LIXO=re.compile(r'(director|directoy|ranks|posting|article|seo|backlink|toplist|topsite|sites?\.|listo|classified|bookmark|submit|webrank|siteprice|sitesimilar|similartech|websitedetection|woorank|securitytrails|cnpj\.center|accessdomain|all-aged|domains)',re.I)
PLAT={'goo.gl','bit.ly','ow.ly','tinyurl.com','is.gd','linktr.ee','migre.me','cutt.us','v.ht','chilp.it','rentry.co','pages.dev','sakura.ne.jp','home.pl','secureserver.net','cloudwaysapps.com','hol.es','esy.es','strato-hosting.eu','xrea.com','xrea.jp','blog.fc2.com','blog45.fc2.com','geocities.ws','oocities.org','fortunecity.ws','webnode.com.br','atspace.com','cba.pl','a2hosted.com','flywheelsites.com','kinsta.com','linode.com','ovh.net','s3.amazonaws.com','umbler.net','hospedagemdesites.ws','no.comunidades.net','draft.blogger.com','feedproxy.google.com','plus.google.com','groups.google.com','bing.com','search.yahoo.com','ask.com','wikidata.org','dbpedia.org','everybodywiki.com','thefullwiki.org','peoplepill.com','libraries.io','4mark.net','viesearch.com','pr-cy.ru','telia.com','knows.nl','tntcode.com','apsoz.com','kiuly.com','idyler.com','yercum.com','rakily.com','zoacum.com','faucre.com','absmho.com','xyloyl.com','fduty.com','farleu.com','vayuc.com','tok2.com','x0.com','main.jp','cocolog-nifty.com','livedoor.jp','sblo.jp','doorblog.jp','ameba.jp','goo.ne.jp','dothome.co.kr','webd.pl','xaa.pl','conohawing.com','hp2.jp','odns.fr','cloudimg.io','ipfs.io','vdocuments.site','pdfslide.net','cupdf.com','wikiwand.com','opendns.com','viglink.com','rubiconproject.com','chtbl.com','snapwidget.com','buygoldbullions.net','advertisegold.net','starcourts.com','chordmp3.net','digitalcombination.com','findglocal.com','starsites.online','wayranks.com','kingranks.com','webscountry.com','articlement.com','trustburn.com','openbugbounty.org','lusha.com','apollo.io','emis.com','freshservice.com','fogbugz.com'}
OK={'uol.com.br','reclameaqui.com.br','pt.wikipedia.org','globo.com','hotmart.com','en.wikipedia.org','cifraclub.com.br','ello.co','appbrain.com','broadcast.com.br','outerspace.com.br','clicrbs.com.br','mec.gov.br','guiadasemana.com.br','jus.com.br','infojobs.com.br','emnuvens.com.br','overmundo.com.br','glassdoor.com.br','uem.br'}
freq=collections.Counter(x['dominio'] for lk in L.values() if isinstance(lk,list) for x in lk)
def lixo(s): return s not in OK and (s in PLAT or RE_LIXO.search(s) or freq[s]>=3)
rows=[]
for dom,m in M.items():
    if m.get('sem_metricas'): continue
    da=int(m.get('domain_authority') or 0); pa=int(m.get('page_authority') or 0); ss=max(int(m.get('spam_score') or 0),0)
    rd=int(m.get('root_domains_to_root_domain') or 0); http=str(m.get('http_code','')); extp=int(m.get('external_pages_to_root_domain') or 0)
    lk=L.get(dom,[]); lk=lk if isinstance(lk,list) else []
    govbr=[x for x in lk if RE_BR.search(x['dominio'])]
    govx=[x for x in lk if not RE_BR.search(x['dominio']) and RE_GOVX.search(x['dominio'])]
    resto=[x for x in lk if x not in govbr and x not in govx and not lixo(x['dominio'])]
    ed60=[x for x in resto if (x.get('da') or 0)>=60]; ed45=[x for x in resto if 45<=(x.get('da') or 0)<60]
    nlixo=sum(1 for x in lk if lixo(x['dominio']))
    score=len(govbr)*40+len(govx)*10+len(ed60)*8+len(ed45)*3+da*1.5-(ss*1.2 if ss>30 else 0)-(nlixo*1.5)
    f=lambda xs: ', '.join(f"{x['dominio']} ({x.get('da')})" for x in xs)
    obs=[]
    if ss>=60: obs.append('SPAM ALTO, descartar')
    elif ss>30: obs.append('spam >30, cuidado')
    if nlixo>=12: obs.append('perfil cheio de diretorios/PBN')
    if http=='200': obs.append('ainda responde 200')
    rows.append(dict(rank=0,dominio=dom,DA=da,PA=pa,spam=ss,dominios_linkando=rd,paginas_externas=extp,gov_edu_br=len(govbr),gov_exterior=len(govx),editoriais_DA60=len(ed60),editoriais_DA45_59=len(ed45),fontes_lixo_top20=nlixo,score=round(score,1),links_gov_edu_br=f(govbr),links_gov_exterior=f(govx),fontes_editoriais=f(ed60+ed45),http=http,obs='; '.join(obs)))
rows.sort(key=lambda r:(-r['score'],-r['DA']))
for i,r in enumerate(rows,1): r['rank']=i
with open('ranking-200-dominios-2026-10-09.csv','w',newline='',encoding='utf-8-sig') as fh:
    w=csv.DictWriter(fh,fieldnames=list(rows[0].keys()),delimiter=';'); w.writeheader(); w.writerows(rows)
N=int(sys.argv[1]) if len(sys.argv)>1 else 40
print(f"{'#':>3} {'dominio':30} {'DA':>3} {'SS':>3} {'RD':>4} {'gBR':>3} {'gEx':>3} {'E60':>3} {'E45':>3} {'lixo':>4} {'score':>6}")
for r in rows[:N]:
    print(f"{r['rank']:>3} {r['dominio']:30} {r['DA']:>3} {r['spam']:>3} {r['dominios_linkando']:>4} {r['gov_edu_br']:>3} {r['gov_exterior']:>3} {r['editoriais_DA60']:>3} {r['editoriais_DA45_59']:>3} {r['fontes_lixo_top20']:>4} {r['score']:>6}")
    if r['links_gov_edu_br']: print(f"      GOV/EDU BR: {r['links_gov_edu_br']}")
    if r['links_gov_exterior']: print(f"      gov ext: {r['links_gov_exterior']}")
    if r['fontes_editoriais']: print(f"      editoriais: {r['fontes_editoriais'][:170]}")
    if r['obs']: print(f"      obs: {r['obs']}")
