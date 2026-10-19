#!/usr/bin/env python3
"""Troca, no vhost do ebookcult, o proxy para o app Next por arquivos estaticos.

Roda NA opengravity (root), SO depois de /srv/static/ebookcult-dir estar pronto.
Uso:  python3 ebc_nginx_estatico.py            -> mostra o diff, nao grava
      python3 ebc_nginx_estatico.py --apply    -> grava, roda nginx -t e recarrega
                                                 (se o teste falhar, restaura o backup)
"""
import difflib, re, shutil, subprocess, sys, time

CONF = "/etc/nginx/conf.d/portal-ebookcult.conf"
ROOT = "/srv/static/ebookcult-dir"
INC = "include /etc/nginx/conf.d/ebookcult-dir-proxy.inc;"

ESTATICO = "{ root %s; try_files $uri $uri/index.html =404; }" % ROOT
SECOES = ("livrarias", "livraria", "sebos", "sebo", "bibliotecas", "biblioteca", "editoras", "editora")
MORTAS = ("api/diretorio", "painel-diretorio", "admin-diretorio", "cadastro-livraria", "remocao-diretorio",
          "sitemaps-diretorio", "og-diretorio")

def novo(txt):
    for s in SECOES:
        txt = re.sub(r"location \^~ /%s/(\s*)\{ %s \}" % (s, re.escape(INC)),
                     lambda m: "location ^~ /%s/%s%s" % (s, m.group(1), ESTATICO), txt)
    txt = re.sub(r"location \^~ /_next/(\s*)\{ %s \}" % re.escape(INC),
                 lambda m: 'location ^~ /_next/%s{ root %s; try_files $uri =404; expires 1y; add_header Cache-Control "public, immutable"; }' % (m.group(1), ROOT), txt)
    for s in MORTAS:
        txt = re.sub(r"location \^~ /%s/(\s*)\{ %s \}" % (re.escape(s), re.escape(INC)),
                     lambda m: "location ^~ /%s/%s{ return 410; }" % (s, m.group(1)), txt)
    txt = re.sub(r"location = /sitemap-diretorio\.xml(\s*)\{ %s \}" % re.escape(INC),
                 lambda m: "location ~ ^/sitemap-diretorio(-[0-9]+)?\\.xml$%s{ root %s; }" % (m.group(1), ROOT), txt)
    return txt

def main():
    antigo = open(CONF, encoding="utf-8").read()
    if INC not in antigo:
        sys.exit("nada a trocar: o vhost nao usa mais o proxy do diretorio")
    saida = novo(antigo)
    restam = len(re.findall(re.escape(INC), saida))
    diff = "".join(difflib.unified_diff(antigo.splitlines(1), saida.splitlines(1), "antes", "depois", n=0))
    print(diff)
    print(f"# ocorrencias do proxy que restaram: {restam}")
    if restam:
        sys.exit("ainda sobrou 'include ...proxy.inc': revisar a mao antes de aplicar")
    if "--apply" not in sys.argv:
        return
    bak = f"{CONF}.bak-{time.strftime('%Y%m%d-%H%M%S')}"
    shutil.copy2(CONF, bak)
    open(CONF, "w", encoding="utf-8").write(saida)
    t = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
    print(t.stderr.strip().splitlines()[-1] if t.stderr else "")
    if t.returncode != 0:
        shutil.copy2(bak, CONF)
        sys.exit("nginx -t FALHOU: backup restaurado, nada foi recarregado")
    subprocess.run(["systemctl", "reload", "nginx"], check=True)
    print("nginx recarregado. backup em", bak)

if __name__ == "__main__":
    main()
