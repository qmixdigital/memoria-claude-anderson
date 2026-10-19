#!/usr/bin/env python3
"""Faz o gateway og-ingresso servir o diretorio do ebookcult por arquivo estatico.

CONTEXTO (descoberto em 18/10/2026): o ebookcult.com.br e servido pelo Cloudflare
Pages; o middleware do Pages manda as pastas do diretorio para
https://og-ingresso.qmix.com.br com o cabecalho X-Portal-Host. Quem decide o
destino e o `map $http_x_portal_host $app_upstream` de
/etc/nginx/conf.d/ingresso-og.conf. O vhost portal-ebookcult.conf NAO recebe esse
trafego. O mesmo gateway atende desassossegada e revistadeducao, que continuam
dinamicos: tudo aqui e restrito a X-Portal-Host == ebookcult.com.br.

Roda NA opengravity (root). Sem --apply so mostra o diff.
Se o nginx -t falhar, restaura o backup e nao recarrega.
"""
import difflib, shutil, subprocess, sys, time

CONF = "/etc/nginx/conf.d/ingresso-og.conf"
ROOT = "/srv/static/ebookcult-dir"

MAPA = """map $http_x_portal_host $static_root {
    ebookcult.com.br            %s;
    default "";
}
""" % ROOT

DESVIO = """        # ebookcult: diretorio congelado em 18/10/2026 (arquivos em %s)
        if ($static_root != "") { rewrite ^ /__static$uri last; }
""" % ROOT

LOCS = r"""
    # ---- arquivos estaticos do ebookcult (so alcancados pelo rewrite acima) ----
    location ~ ^/__static/(api/diretorio|painel-diretorio|admin-diretorio|cadastro-livraria|remocao-diretorio|sitemaps-diretorio)(/|$) {
        internal;
        return 410;
    }
    location ^~ /__static/_next/ {
        internal;
        root $static_root;
        rewrite ^/__static/(.*)$ /$1 break;
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location /__static/ {
        internal;
        root $static_root;
        rewrite ^/__static/(.*)$ /$1 break;
        try_files $uri $uri/index.html =404;
        add_header Cache-Control "public, max-age=300";
        add_header X-Content-Type-Options nosniff;
    }
"""

def novo(txt):
    if "$static_root" in txt:
        sys.exit("ja aplicado")
    # 1) map antes do primeiro server {}
    i = txt.index("server {")
    txt = txt[:i] + MAPA + txt[i:]
    # 2) desvio logo no inicio do location / do proxy
    marca = '        if ($app_upstream = "") { return 404; }\n'
    if txt.count(marca) != 1:
        sys.exit("trecho 'if ($app_upstream = \"\")' nao encontrado exatamente uma vez")
    txt = txt.replace(marca, marca + DESVIO)
    # 3) locations internas, antes do `location / {` do proxy
    k = txt.index("    location / {\n        if ($app_upstream")
    return txt[:k] + LOCS.lstrip("\n") + "\n" + txt[k:]

def main():
    antigo = open(CONF, encoding="utf-8").read()
    saida = novo(antigo)
    print("".join(difflib.unified_diff(antigo.splitlines(1), saida.splitlines(1), "antes", "depois", n=1)))
    if "--apply" not in sys.argv:
        return
    bak = f"{CONF}.bak-{time.strftime('%Y%m%d-%H%M%S')}"
    shutil.copy2(CONF, bak)
    open(CONF, "w", encoding="utf-8").write(saida)
    t = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
    print((t.stderr.strip().splitlines() or [""])[-1])
    if t.returncode != 0:
        print(t.stderr)
        shutil.copy2(bak, CONF)
        sys.exit("nginx -t FALHOU: backup restaurado, nada recarregado")
    subprocess.run(["systemctl", "reload", "nginx"], check=True)
    print("nginx recarregado. backup em", bak)

if __name__ == "__main__":
    main()
