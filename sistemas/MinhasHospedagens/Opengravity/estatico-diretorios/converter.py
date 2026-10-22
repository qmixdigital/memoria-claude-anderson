#!/usr/bin/env python3
"""Converte um app Next da clinicas-vps em site estatico no Cloudflare Pages e remove do servidor.

Uso:  python converter.py <site> <etapa> [<etapa> ...]
Etapas: lista mirror baixar deploy dns limpar
Sites : veja o dicionario SITES abaixo.

Regras (combinadas com o operador em 19/10/2026):
  - sem Asaas, painel, login, cadastro, formulario ou newsletter no estatico;
  - mirror SEMPRE com --podavel "^/" (link para pagina fora da lista vira texto);
  - fonte local em D:/SITES/<dominio>/site, nada fica no servidor;
  - limpar so depois do dns e da conferencia em producao.
"""
import json, os, re, subprocess, sys, time, urllib.request, urllib.error, random, hashlib

HOST = "clinicas-vps"
LISTAS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "listas")
MIRROR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mirror_next.py")
BACKUPS = "D:/SISTEMAS/MinhasHospedagens/backups"
CONTAS = json.load(open("D:/SISTEMAS/cloudflare/contas.json", encoding="utf-8"))
TOK = [c for c in CONTAS if c["nome"] == "master"][0]["token"]
DATA = time.strftime("%Y%m%d")

SITES = {
    "plano": dict(dom="planomedicosaude.com.br", gsc="planomedicosaude.com.br", pm2=["plano-web", "plano-web-b"], porta=3060,
                  dir="/home/user/web/planomedicosaude.dominioprovisorio.net.br", hestia=["planomedicosaude.dominioprovisorio.net.br", "planomedicosaude.com.br"],
                  db="planomedicosaude", nginx=["00-planomedicosaude-upstream.conf"], minimo=1),
    "garopaba": dict(dom="garopaba.ia.br", gsc="garopaba.ia.br", pm2=["garopaba", "garopaba-b"], porta=3410,
                     dir="/var/www/garopaba", extra=["/var/www/garopaba-shared"], nginx=["garopaba.conf"], db="garopaba", minimo=1),
    "instituto": dict(dom="institutoortopedico.com.br", gsc="institutoortopedico.com.br", pm2=["ortoguia-web", "ortoguia-web-b"], porta=3050,
                      dir="/home/user/web/institutoortopedico.dominioprovisorio.net.br",
                      hestia=["institutoortopedico.dominioprovisorio.net.br", "institutoortopedico.com.br"], db="institutoortopedico",
                      nginx=["00-institutoortopedico-upstream.conf"], minimo=1),
    "marmorarias": dict(dom="marmorariasperto.com.br", gsc="marmorariasperto.com.br", pm2=["marmorarias-web", "marmorarias-web-b"], porta=3040,
                        dir="/home/user/web/marmorarias.dominioprovisorio.net.br",
                        hestia=["marmorarias.dominioprovisorio.net.br", "marmorariasperto.com.br"], db="marmorarias",
                        nginx=["00-marmorarias-upstream.conf"], minimo=1),
}

SITES.update({
    "contadores": dict(host="hostinger-vps-srv1166087", sub=True, proj="contadoresrevistadeducao", dom="contadores.revistadeducao.com.br", gsc="revistadeducao.com.br", gschost="contadores.revistadeducao.com.br", pm2=["contadores"], porta=3210, dir="/var/www/contadores", extra=["/var/www/contadores-shared"], db="contadores", nginx=[], minimo=3),
    "desassossegada": dict(host="hostinger-vps-srv1166087", sub=True, proj="desassossegadadiretorio", dom="diretorio.desassossegada.com.br", gsc="desassossegada.com.br", gschost="diretorio.desassossegada.com.br", pm2=["desassossegada-dir"], porta=3180, dir="/var/www/desassossegada-dir", extra=["/var/www/desassossegada-dir-shared"], db="desassossegada_dir", nginx=[], minimo=1),
    "comparativos": dict(dom="comparativos.ia.br", gsc="comparativos.ia.br", pm2=["comparativos", "comparativos-b"], porta=3420, dir="/var/www/comparativos", extra=["/var/www/comparativos-shared"], nginx=["comparativos.conf"], db="comparativos", minimo=1),
    "radarvolt": dict(dom="radarvolt.com.br", gsc="radarvolt.com.br", pm2=["radarvolt-web", "radarvolt-web-b"], porta=3080, dir="/home/user/web/radarvolt.com.br", hestia=["radarvolt.com.br", "radarvolt.dominioprovisorio.net.br"], nginx=["00-radarvolt-upstream.conf"], db="radarvolt", minimo=1),
    "notadecorte": dict(dom="notadecorte.ia.br", gsc="notadecorte.ia.br", pm2=[], porta=0, dir="", db="", minimo=1),
    "academus": dict(dom="academus.pro.br", gsc="academus.pro.br", pm2=["academus-web", "academus-web-b"], porta=3100,
                     dir="/home/user/web/academus.dominioprovisorio.net.br", hestia=["academus.dominioprovisorio.net.br"], db="academus",
                     nginx=["00-academus-upstream.conf"], minimo=1),
    "saudevit": dict(dom="saudevitalidade.com.br", gsc="saudevitalidade.com.br", pm2=["saudevit-web", "saudevit-web-b"], porta=3090,
                     dir="/home/user/web/saudevitalidade.dominioprovisorio.net.br", hestia=["saudevitalidade.dominioprovisorio.net.br"], db="saudevitalidade",
                     nginx=["00-saudevitalidade-upstream.conf"], minimo=2),
    "desentupidora": dict(dom="desentupidora.pro", gsc="desentupidora.pro", pm2=["desentupidora-pro", "desentupidora-pro-b"], porta=3008,
                          dir="/home/user/web/desentupidora.pro", hestia=["desentupidora.pro"], db="desentupidora_pro",
                          nginx=["00-desentupidora-upstream.conf"], minimo=1),
    "vidracarias": dict(dom="vidracariaperto.ia.br", gsc="vidracariaperto.com.br", pm2=["vidracarias-web", "vidracarias-web-b"], porta=3030,
                        dir="/home/user/web/vidracarias.dominioprovisorio.net.br", hestia=["vidracarias.dominioprovisorio.net.br", "vidracariaperto.com.br"],
                        db="vidracarias", nginx=["00-vidracarias-upstream.conf"], minimo=3),
})


def cf(m, u, b=None):
    r = urllib.request.Request("https://api.cloudflare.com/client/v4" + u, method=m, data=json.dumps(b).encode() if b else None,
                               headers={"Authorization": "Bearer " + TOK, "Content-Type": "application/json"})
    try:
        return json.load(urllib.request.urlopen(r, timeout=120))
    except urllib.error.HTTPError as e:
        return json.load(e)


def ssh(cmd, timeout=1800):
    r = subprocess.run(["ssh", HOST, cmd], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    return "\n".join(l for l in (r.stdout + r.stderr).splitlines() if not re.search(r"post-quantum|store now|upgraded|pq\.html|warning: \*\*", l, re.I))


def pasta(s):
    return f"D:/SITES/{s['dom']}"


def curl_app(s, path):
    return ssh(f'curl -s -m 90 -H "Host: {s["dom"]}" http://127.0.0.1:{s["porta"]}{path}')


def etapa_lista(n, s):
    paths = {"/"}
    f = os.path.join(LISTAS, f"gsc_{s['gsc']}.txt")
    for l in open(f, encoding="utf-8"):
        if l.startswith("#") or not l.strip():
            continue
        u, i, _ = l.rstrip("\n").split("\t")
        if int(i) < s.get("minimo", 1):
            continue
        if s.get("gschost") and not u.startswith("https://" + s["gschost"] + "/"):
            continue
        p = re.sub(r"^https?://[^/]+", "", u).split("?")[0].split("#")[0]
        paths.add(p if p.endswith("/") else p + "/")
    idx = curl_app(s, "/sitemap.xml")
    locs = re.findall(r"<loc>([^<]*)</loc>", idx)
    maps = [l for l in locs if "/sitemap" in l or l.endswith(".xml")]
    pool = locs if not maps else []
    for m in maps:
        t = curl_app(s, re.sub(r"^https?://[^/]+", "", m))
        ls = re.findall(r"<loc>([^<]*)</loc>", t)
        if len(ls) <= 400:
            pool += ls
    for u in pool:
        p = re.sub(r"^https?://[^/]+", "", u).split("?")[0]
        if p and not p.endswith(".xml"):
            paths.add(p if p.endswith("/") else p + "/")
    paths = sorted(p for p in paths if not re.match(r"^/(admin|api|painel|login|cadastrar|cadastro|precos|busca|entrar|checkout|pagamento|planos)/", p))
    open(os.path.join(LISTAS, f"congelar_{n}.txt"), "w", encoding="utf-8", newline="\n").write("\n".join(paths) + "\n")
    print(f"lista {n}: {len(paths)} paginas")
    if len(paths) > 19000:
        sys.exit("ERRO: passa de 19 mil, suba o minimo de impressoes")


def etapa_mirror(n, s):
    ssh("mkdir -p /root/estatico")
    subprocess.run(["scp", "-q", MIRROR, os.path.join(LISTAS, f"congelar_{n}.txt"), f"{HOST}:/root/estatico/"], env=dict(os.environ, MSYS_NO_PATHCONV="1"))
    ssh(f'cd /root/estatico && rm -rf /srv/static/{s["dom"]} && (nohup python3 mirror_next.py --dominio {s["dom"]} --porta {s["porta"]} '
        f'--lista congelar_{n}.txt --saida /srv/static/{s["dom"]} --podavel "^/" --workers 3 > {n}.log 2>&1 &) ; sleep 2')
    time.sleep(10)
    while ssh(f'pgrep -f "[m]irror_next.py --dominio {s["dom"]}" | wc -l').strip() != "0":
        time.sleep(20)
    print(ssh(f'tail -n 2 /root/estatico/{n}.log; cd /srv/static/{s["dom"]}; echo "arquivos $(find . -type f | wc -l) tamanho $(du -sh . | cut -f1)"; '
              f'echo "next/image $(grep -rl "_next/image" --include=index.html . | wc -l) forms $(grep -rl "<form" --include=index.html . | wc -l)"; '
              f'echo "asset404 $(grep -c "asset 404" /root/estatico/{n}.log)"'))


def etapa_baixar(n, s):
    d = pasta(s) + "/site"
    if not os.environ.get("SO_CHECAR"):
      subprocess.run(["bash", "-c", f'rm -rf "{d}" && mkdir -p "{d}" && ssh {HOST} "tar czf - -C /srv/static/{s["dom"]} ." 2>/dev/null | tar xzf - --force-local -C "{d}"'],
                     env=dict(os.environ, MSYS_NO_PATHCONV="1"))
    red = ["/sitemap/* /sitemap.xml 301", "/sitemap-index.xml /sitemap.xml 301"]
    open(d + "/_redirects", "w", encoding="utf-8", newline="\n").write("\n".join(red) + "\n")
    ex = set()
    for r, _, fs in os.walk(d):
        if "index.html" in fs:
            rel = os.path.relpath(r, d).replace("\\", "/")
            ex.add("/" if rel == "." else "/" + rel + "/")
    # paginas da lista que o app nao serviu (404/410) continuam linkadas: vira texto, como as podadas
    RE_A = re.compile(r'<a\s[^>]*href="(/[^"#?]*)(?:[?#][^"]*)?"[^>]*>(.*?)</a>', re.S)
    def desvincula(m):
        h = m.group(1)
        if re.search(r"\.\w{2,4}$", h):
            return m.group(0)
        return m.group(0) if (h if h.endswith("/") else h + "/") in ex else m.group(2)
    nd = 0
    for r, _, fs in os.walk(d):
        if "index.html" not in fs:
            continue
        fp = os.path.join(r, "index.html")
        t = open(fp, encoding="utf-8", errors="surrogateescape").read()
        t2 = RE_A.sub(desvincula, t)
        if t2 != t:
            open(fp, "w", encoding="utf-8", errors="surrogateescape", newline="").write(t2); nd += 1
    print(f"desvinculados em {nd} paginas")
    tot = bad = 0
    for p in random.Random(1).sample(sorted(ex), min(1500, len(ex))):
        t = open(d + p + "index.html", encoding="utf-8", errors="ignore").read()
        for h in set(re.findall(r'<a [^>]*href="(/[^"#?]*)"', t)):
            if re.search(r"\.\w{2,4}$", h):
                continue
            tot += 1
            bad += (h if h.endswith("/") else h + "/") not in ex
    arq = sum(len(fs) for _, _, fs in os.walk(d))
    print(f"baixar {n}: {arq} arquivos, links internos {tot}, quebrados {bad}")
    if arq > 19900:
        sys.exit("ERRO: acima do limite de 20 mil arquivos do Pages")


def zona(dom):
    pai = ".".join(dom.split(".")[-3:]) if dom.endswith(".com.br") and dom.count(".") >= 3 else dom
    z = cf("GET", f"/zones?name={pai}")["result"][0]
    return z["id"], z["account"]["id"]


def etapa_deploy(n, s):
    zid, acc = zona(s["dom"])
    proj = s.get("proj") or re.sub(r"[^a-z0-9]", "", s["dom"].split(".")[0])[:40]
    r = cf("POST", f"/accounts/{acc}/pages/projects", {"name": proj, "production_branch": "main"})
    print("projeto", proj, r.get("success"), [e["message"] for e in r.get("errors", [])][:1])
    env = dict(os.environ, CLOUDFLARE_API_TOKEN=TOK, CLOUDFLARE_ACCOUNT_ID=acc)
    out = subprocess.run(f'npx -y wrangler@4 pages deploy site --project-name {proj} --branch main --commit-dirty=true', shell=True, cwd=pasta(s), env=env,
                         capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
    print("\n".join(out.splitlines()[-3:]))
    s["proj"] = proj
    for p in ("/", "/sitemap.xml"):
        try:
            print(p, urllib.request.urlopen(urllib.request.Request(f"https://{proj}.pages.dev{p}", headers={"User-Agent": "Mozilla/5.0"}), timeout=60).status)
        except Exception as e:
            print(p, "erro", e)


def etapa_dns(n, s):
    dom = s["dom"]
    zid, acc = zona(dom)
    proj = s.get("proj") or re.sub(r"[^a-z0-9]", "", dom.split(".")[0])[:40]
    alvo = cf("GET", f"/accounts/{acc}/pages/projects/{proj}")["result"]["subdomain"]
    recs = cf("GET", f"/zones/{zid}/dns_records?per_page=100")["result"]
    json.dump(recs, open(f"D:/SISTEMAS/cloudflare/dns_backup_{dom}_{DATA}.json", "w"), indent=1)
    dominios = (dom,) if s.get("sub") else (dom, "www." + dom)
    for d in dominios:
        print("dominio", d, cf("POST", f"/accounts/{acc}/pages/projects/{proj}/domains", {"name": d}).get("success"))
    for r in recs:
        if r["type"] in ("A", "AAAA", "CNAME") and r["name"] in dominios:
            if r["type"] != "CNAME":
                cf("DELETE", f"/zones/{zid}/dns_records/{r['id']}")
                u = cf("POST", f"/zones/{zid}/dns_records", {"type": "CNAME", "name": r["name"], "content": alvo, "proxied": True})
            else:
                u = cf("PATCH", f"/zones/{zid}/dns_records/{r['id']}", {"type": "CNAME", "name": r["name"], "content": alvo, "proxied": True})
            print(r["name"], r["type"], r["content"], "->", u.get("success"), [e["message"] for e in u.get("errors", [])][:1])
    ph = "http_request_dynamic_redirect"
    g = cf("GET", f"/zones/{zid}/rulesets/phases/{ph}/entrypoint")
    rules = (g.get("result") or {}).get("rules", []) if g.get("success") else []
    if not s.get("sub") and not any(r.get("description", "").startswith("www para apex") for r in rules):
        rules.append({"description": "www para apex (estatico)", "expression": f'(http.host eq "www.{dom}")', "action": "redirect",
                      "action_parameters": {"from_value": {"status_code": 301, "target_url": {"expression": f'concat("https://{dom}", http.request.uri.path)'}, "preserve_query_string": True}}})
        print("redirect www", cf("PUT", f"/zones/{zid}/rulesets/phases/{ph}/entrypoint", {"rules": rules}).get("success"))
    print("purge", cf("POST", f"/zones/{zid}/purge_cache", {"hosts": [dom]} if s.get("sub") else {"purge_everything": True}).get("success"))
    for i in range(30):
        try:
            h = urllib.request.urlopen(urllib.request.Request(f"https://{dom}/?n={random.random()}", headers={"User-Agent": "Mozilla/5.0"}), timeout=30)
            if not any(k.lower().startswith("x-nextjs") for k in h.headers.keys()):
                print("dominio servido pelo Pages:", h.status)
                break
        except Exception:
            pass
        time.sleep(10)
    else:
        print("ATENCAO: o dominio ainda responde pela origem antiga")
    if not s.get("sub"):
        subprocess.run([sys.executable, "D:/SISTEMAS/cloudflare/harden_site.py", dom], env=dict(os.environ, PYTHONIOENCODING="utf-8"))


def etapa_limpar(n, s):
    dom = s["dom"]
    bk = f"/root/bk-{n}"
    ssh(f'mkdir -p {bk}; cd {s["dir"]}; sudo -u postgres pg_dump -Fc {s["db"]} > {bk}/{n}-final-{DATA}.dump; '
        f'tar czf {bk}/{n}-codigo-{DATA}.tgz --exclude=node_modules --exclude=.next --exclude=.next-* --exclude=.next.* --exclude=cache . ; '
        f'cp /etc/nginx/conf.d/*{n}*.conf {bk}/ 2>/dev/null; cd {bk} && tar czf {n}-env-e-nginx-{DATA}.tgz *.conf $(ls {s["dir"]}/.env* {s["dir"]}/../.env* 2>/dev/null | head -n 3) 2>/dev/null; md5sum *.dump *.tgz')
    for f in (f"{n}-final-{DATA}.dump", f"{n}-codigo-{DATA}.tgz", f"{n}-env-e-nginx-{DATA}.tgz"):
        subprocess.run(["scp", "-q", f"{HOST}:{bk}/{f}", f"{BACKUPS}/"], env=dict(os.environ, MSYS_NO_PATHCONV="1"))
    for f in (f"{n}-final-{DATA}.dump", f"{n}-codigo-{DATA}.tgz"):
        loc = hashlib.md5(open(f"{BACKUPS}/{f}", "rb").read()).hexdigest()
        rem = ssh(f"md5sum {bk}/{f}").split()[0]
        print(f, "ok" if loc == rem else "DIFERENTE!")
        if loc != rem:
            sys.exit("backup nao confere, abortado")
    pm2 = " ".join(s["pm2"])
    hes = "".join(f'/usr/local/hestia/bin/v-delete-web-domain user {h} >/dev/null 2>&1; ' for h in s.get("hestia", []))
    ng = "".join(f"rm -f /etc/nginx/conf.d/{c}; " for c in s.get("nginx", []))
    ext = " ".join([s["dir"]] + s.get("extra", []))
    print(ssh(f'''export PM2_HOME=/root/.pm2 PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH HOME=/root
pm2 delete {pm2} >/dev/null 2>&1; pm2 save >/dev/null 2>&1
crontab -l > /root/crontab.bak-{n}; crontab -l | grep -v "{s['dir']}" | crontab -
{hes}{ng}
for f in /etc/nginx/conf.d/*{n}*; do mv "$f" {bk}/ 2>/dev/null; done
find /etc/nginx/conf.d -xtype l -delete
if nginx -t 2>&1 | tail -n 1 | grep -q successful; then systemctl reload nginx && echo NGINX_OK; else nginx -t; echo NGINX_COM_ERRO; fi
rm -rf {ext} /srv/static/{dom} /root/estatico/{n}.log /root/estatico/congelar_{n}.txt /tmp/*{n}*release*
sudo -u postgres psql -c "DROP DATABASE {s['db']}" 2>&1 | tail -n 1
sudo -u postgres psql -c "DROP ROLE IF EXISTS {s['db']}" 2>&1 | tail -n 1
rm -rf {bk} /root/crontab.bak-{n}
df -h / | tail -n 1; ls -d {ext} 2>&1 | grep -vc "No such"'''))


if __name__ == "__main__":
    global_host = None
    n = sys.argv[1]
    s = SITES[n]
    HOST = s.get("host", "clinicas-vps")
    for e in sys.argv[2:]:
        print(f"== {n}: {e}")
        globals()["etapa_" + e](n, s)
