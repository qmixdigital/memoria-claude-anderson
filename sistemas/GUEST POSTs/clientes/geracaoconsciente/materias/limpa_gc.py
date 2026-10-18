import json,re
d0=json.load(open('/tmp/allow_gc.json')); allow=d0['allow']; site=d0['site']
for sl,al in allow.items():
    f=f"/srv/portais/{site[sl]}/data/{sl}.json"
    d=json.load(open(f)); c=d["content"]; antes=c
    # paragrafos extras apos o aside (so links)
    c=re.sub(r'\s*<p>(?:Veja também|Também sobre o tema|Leia também)[^<]*:(?:[^<]|<a [^>]*>[^<]*</a>)*</p>\s*$','',c)
    def un(m):
        h=m.group(1)
        if "geracaoconsciente.com.br" in h or h in al: return m.group(0)
        return m.group(2)
    c=re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>',un,c,flags=re.S)
    if c!=antes:
        d["content"]=c; json.dump(d,open(f,"w"),ensure_ascii=False)
        print(site[sl],sl[:38],"limpo;",len(re.findall(r'<a ',c)),"links agora; aside",c.count("pe-leia-meio"))
    else: print(site[sl],sl[:38],"sem alteracao")
