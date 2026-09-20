# -*- coding: utf-8 -*-
"""Insere um paragrafo com link em artigos ja publicados do portal-engine e registra no ledger.

    python inserir_link.py plano.json [--site cliente.com.br] [--simular] [--ledger D:/PORTAIS/BACKLINKS/ledger.csv]

plano.json e uma lista de itens:
  {
    "host":   "opengravity",                      alias ssh
    "portal": "nomedoportal",                     pasta em /srv/portais
    "arq":    "slug-do-artigo-hospedeiro",        slug (nome do JSON sem .json)
    "apos":   "trecho unico do paragrafo",        trecho do paragrafo DEPOIS do qual entra o novo
    "dest":   "https://cliente.com.br/pagina-de-destino",
    "frase":  "<p>... <a href=\"https://cliente.com.br/pagina-de-destino\">âncora escolhida</a> ...</p>",
    "tipo_ancora": "parcial",                     marca | url | generica | parcial | exata
    "motivo": "metrica"                           metrica | ranking
  }

Ciclo por item: baixa o JSON do host, acha o paragrafo, recusa se o ponto cai
dentro ou depois do <aside>, insere, aplica a guarda de links (lista de antes +
o novo = lista de depois, senao aborta o item), atualiza `modified`, envia,
chown, rebuild_site.js do portal, reinicia o portal-engine.service (uma vez por
host), confere a URL no ar com ?nc= e grava no ledger. Com --simular para antes
do envio e mostra o paragrafo no lugar.

Nada de codigo solto no nivel do modulo: quem importar `inserir` nao dispara nada.
"""
import argparse, csv, datetime, io, json, os, re, subprocess, sys
from urllib.parse import urlparse

LINK = re.compile(r'<a\s[^>]*href="([^"]+)"')
PARA = re.compile(r"<p[^>]*>.*?</p>", re.S)
LEDGER_PADRAO = "D:/PORTAIS/BACKLINKS/ledger.csv"
CABECALHO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ledger_header.txt")

def sh(args, entrada=None):
    return subprocess.run(args, input=entrada, capture_output=True, text=True, encoding="utf-8", errors="replace")

def baixar(host, portal, arq):
    r = sh(["C:/Windows/System32/OpenSSH/ssh.exe", "-n", host, "cat /srv/portais/%s/data/%s.json" % (portal, arq)])
    if r.returncode or not r.stdout.strip():
        raise RuntimeError("nao consegui ler %s/%s em %s" % (portal, arq, host))
    return json.loads(r.stdout)

def dominio(host, portal):
    j = json.loads(sh(["C:/Windows/System32/OpenSSH/ssh.exe", "-n", host, "cat /opt/portal-engine/sites.json"]).stdout)
    for s in j["sites"]:
        if s["slug"] == portal:
            return (s.get("baseUrl") or "https://" + s["domain"]).rstrip("/")
    raise RuntimeError("portal %s nao esta no sites.json de %s" % (portal, host))

def inserir(conteudo, apos, frase):
    """Devolve o conteudo novo ou levanta ValueError. Guarda de links embutida."""
    if "—" in frase:
        raise ValueError("travessao na frase")
    alvo = next((m for m in PARA.finditer(conteudo) if apos in re.sub("<[^>]+>", "", m.group(0))), None)
    if not alvo:
        raise ValueError("paragrafo nao encontrado: %s" % apos)
    aside = conteudo.find("<aside")
    if aside != -1 and alvo.end() > aside:
        raise ValueError("ponto de insercao dentro ou depois do <aside>")
    paras = PARA.findall(conteudo)
    if alvo.group(0) == paras[0] or alvo.group(0) == paras[-1]:
        raise ValueError("nao inserir depois do primeiro nem do ultimo paragrafo")
    novo = conteudo[:alvo.end()] + "\n" + frase + conteudo[alvo.end():]
    antes, depois = LINK.findall(conteudo), LINK.findall(novo)
    n = len(LINK.findall(conteudo[:alvo.end()]))
    esperado = antes[:n] + LINK.findall(frase) + antes[n:]
    if depois != esperado or len(LINK.findall(frase)) != 1:
        raise ValueError("guarda de links falhou")
    return novo

def url_no_ar(base, arq):
    sm = sh(["curl", "-sL", base + "/sitemap.xml?nc=1"]).stdout
    urls = re.findall(r"<loc>([^<]+)</loc>", sm)
    if urls and all(u.endswith(".xml") for u in urls):
        urls = sum((re.findall(r"<loc>([^<]+)</loc>", sh(["curl", "-sL", u + "?nc=1"]).stdout) for u in urls), [])
    hit = [u for u in urls if u.rstrip("/").endswith("/" + arq)]
    return hit[0] if hit else base + "/" + arq + "/"

def gravar_ledger(caminho, linha):
    novo = not os.path.exists(caminho)
    with io.open(caminho, "a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        if novo:
            w.writerow(io.open(CABECALHO, encoding="utf-8").read().strip().split(","))
        w.writerow(linha)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("plano")
    ap.add_argument("--site", "--diretorio", dest="site", help="dominio do site atendido (cliente ou diretorio proprio); se omitido, sai do host da URL em dest")
    ap.add_argument("--simular", action="store_true")
    ap.add_argument("--ledger", default=LEDGER_PADRAO)
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    plano = json.load(io.open(a.plano, encoding="utf-8"))
    hosts_tocados, feitos = {}, []
    for it in plano:
        rot = "%s/%s" % (it["portal"], it["arq"])
        try:
            dom_dest = urlparse(it["dest"]).netloc or a.site
            if not dom_dest:
                raise ValueError("dest precisa ser URL completa, ou passe --site")
            d = baixar(it["host"], it["portal"], it["arq"])
            if dom_dest in (d.get("content") or ""):
                raise ValueError("artigo ja linka esse dominio (regra de ouro: um link por dominio referente)")
            d["content"] = inserir(d["content"], it["apos"], it["frase"])
        except Exception as e:
            print("!! %-50s %s" % (rot, e)); continue
        if a.simular:
            i = d["content"].find(it["frase"])
            print("ok  %-50s -> %s\n    ...%s..." % (rot, it["dest"], re.sub("<[^>]+>", "", d["content"][max(0, i-160):i+len(it["frase"])+40]).strip()))
            continue
        d["modified"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        destino = "/srv/portais/%s/data/%s.json" % (it["portal"], it["arq"])
        r = sh(["ssh", it["host"], "cat > %s.novo && mv %s.novo %s && chown portais:portais %s" % (destino, destino, destino, destino)],
               entrada=json.dumps(d, ensure_ascii=False, indent=1))
        if r.returncode:
            print("!! %-50s envio falhou: %s" % (rot, r.stderr[-200:])); continue
        hosts_tocados.setdefault(it["host"], set()).add(it["portal"])
        feitos.append(it)
        print("ok  %-50s -> %s" % (rot, it["dest"]))
    if a.simular or not feitos:
        return
    for h, portais in hosts_tocados.items():
        cmd = "for p in %s; do sudo -u portais node /opt/portal-engine/rebuild_site.js $p 2>&1 | tail -1; done; systemctl restart portal-engine.service && echo RESTART_OK" % " ".join(sorted(portais))
        r = sh(["C:/Windows/System32/OpenSSH/ssh.exe", "-n", h, cmd])
        print("[%s] %s" % (h, " | ".join(l for l in r.stdout.splitlines() if l.strip())))
    hoje = datetime.date.today().isoformat()
    for it in feitos:
        base = dominio(it["host"], it["portal"])
        url = url_no_ar(base, it["arq"])
        html = sh(["curl", "-sL", url + "?nc=%d" % os.getpid()]).stdout
        ok = it["dest"] in html
        print("%s %s" % ("NO AR " if ok else "FALTA ", url))
        ancora = re.search(r">([^<]+)</a>", it["frase"]).group(1)
        site = a.site or urlparse(it["dest"]).netloc
        gravar_ledger(a.ledger, [hoje, site, it["dest"], ancora, it.get("tipo_ancora", ""), "insercao", it["host"], it["portal"],
                                 re.sub(r"^https?://(www\.)?", "", base), url, it.get("motivo", "metrica"), "", "", "", "" if ok else "conferir: link nao apareceu no ar", it.get("rel", "dofollow")])
    print("ledger: %s" % a.ledger)

if __name__ == "__main__":
    main()
