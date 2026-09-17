#!/usr/bin/env python3
"""
Search Console pela API, com a conta de servico da QMIX.

Serve para o que antes era "passo GSC manual" em toda entrega de diretorio:
enviar sitemap, conferir se ele foi lido, ver o que ja indexou, inspecionar URL
e puxar as consultas reais. Tudo sem abrir o navegador.

O QUE ESTA CONTA FAZ E O QUE NAO FAZ (testado, nao suposto):

  sitemaps.list      OK
  sitemaps.submit    OK (devolve 204)
  urlInspection      OK (a API de inspecao esta habilitada no projeto)
  searchAnalytics    OK
  siteVerification   NAO: a API esta desabilitada no projeto seoqmix.

A ultima linha e a que importa no comeco de um projeto: **criar e verificar uma
propriedade nova continua sendo manual**. O caminho e o dono abrir o Search
Console, adicionar a propriedade e adicionar
`seoqmix@seoqmix.iam.gserviceaccount.com` como usuario (Proprietario ou Total).
Depois disso tudo aqui funciona sozinho.

Se algum dia o dono habilitar a Site Verification API no projeto, da para
verificar por DNS TXT sem sair do terminal, porque os dominios estao na
Cloudflare e temos os tokens. Ate la, nao prometa isso a ninguem.

Uso:
    python gsc.py sites
    python gsc.py sitemaps sc-domain:exemplo.com.br
    python gsc.py enviar   sc-domain:exemplo.com.br https://exemplo.com.br/sitemap.xml
    python gsc.py inspecionar sc-domain:exemplo.com.br https://exemplo.com.br/pagina/
    python gsc.py consultas sc-domain:exemplo.com.br 2026-08-01 2026-09-01 [pagina|query]

A credencial sai de GSC_CREDENCIAL ou do caminho padrao da rede.
"""
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import jwt  # PyJWT

CRED = os.environ.get("GSC_CREDENCIAL", r"G:/QMIX/Google/seoqmix-service-account.json")
ESCOPO = "https://www.googleapis.com/auth/webmasters"
V3 = "https://www.googleapis.com/webmasters/v3"


def token() -> str:
    d = json.load(io.open(CRED, encoding="utf-8"))
    agora = int(time.time())
    afirmacao = jwt.encode(
        {
            "iss": d["client_email"],
            "scope": ESCOPO,
            "aud": d["token_uri"],
            "exp": agora + 3600,
            "iat": agora,
        },
        d["private_key"],
        algorithm="RS256",
    )
    corpo = urllib.parse.urlencode(
        {"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": afirmacao}
    ).encode()
    r = urllib.request.urlopen(urllib.request.Request(d["token_uri"], data=corpo), timeout=30)
    return json.load(r)["access_token"]


def chama(url: str, t: str, metodo: str = "GET", corpo=None):
    req = urllib.request.Request(
        url,
        method=metodo,
        headers={"Authorization": f"Bearer {t}", "Content-Type": "application/json"},
        data=json.dumps(corpo).encode() if corpo else None,
    )
    try:
        r = urllib.request.urlopen(req, timeout=60)
        texto = r.read().decode()
        return r.status, (json.loads(texto) if texto.strip() else {})
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode()
        # O erro da API vem com o motivo real dentro; imprimir so o codigo
        # transforma "falta permissao nesta propriedade" em "deu errado".
        raise SystemExit(f"HTTP {e.code} em {url}\n{detalhe[:600]}")


def cifra(s: str) -> str:
    return urllib.parse.quote(s, safe="")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    if not os.path.exists(CRED):
        raise SystemExit(f"credencial não encontrada em {CRED} (defina GSC_CREDENCIAL)")

    cmd = sys.argv[1]
    t = token()

    if cmd == "sites":
        _, r = chama(f"{V3}/sites", t)
        for s in r.get("siteEntry", []):
            print(f"{s.get('permissionLevel','?'):>22}  {s.get('siteUrl')}")
        return 0

    if cmd == "sitemaps":
        alvo = sys.argv[2]
        _, r = chama(f"{V3}/sites/{cifra(alvo)}/sitemaps", t)
        for s in r.get("sitemap", []):
            enviados = s.get("contents", [{}])[0].get("submitted", "?")
            indexados = s.get("contents", [{}])[0].get("indexed", "?")
            print(
                f"{s['path']}\n"
                f"  último download: {s.get('lastDownloaded','nunca')}"
                f" | enviadas: {enviados} | indexadas: {indexados}"
                f" | erros: {s.get('errors',0)} | avisos: {s.get('warnings',0)}"
            )
        if not r.get("sitemap"):
            print("nenhum sitemap cadastrado")
        return 0

    if cmd == "enviar":
        alvo, sitemap = sys.argv[2], sys.argv[3]
        codigo, _ = chama(f"{V3}/sites/{cifra(alvo)}/sitemaps/{cifra(sitemap)}", t, "PUT")
        print(f"enviado ({codigo}): {sitemap}")
        return 0

    if cmd == "inspecionar":
        alvo, url = sys.argv[2], sys.argv[3]
        _, r = chama(
            "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
            t,
            "POST",
            {"inspectionUrl": url, "siteUrl": alvo},
        )
        idx = r.get("inspectionResult", {}).get("indexStatusResult", {})
        print(f"cobertura:  {idx.get('coverageState')}")
        print(f"veredito:   {idx.get('verdict')}")
        print(f"canônica declarada: {idx.get('userCanonical')}")
        print(f"canônica do Google: {idx.get('googleCanonical')}")
        print(f"último rastreio:    {idx.get('lastCrawlTime')}")
        print(f"robots:     {idx.get('robotsTxtState')}")
        return 0

    if cmd == "consultas":
        alvo, inicio, fim = sys.argv[2], sys.argv[3], sys.argv[4]
        dim = sys.argv[5] if len(sys.argv) > 5 else "query"
        _, r = chama(
            f"{V3}/sites/{cifra(alvo)}/searchAnalytics/query",
            t,
            "POST",
            {"startDate": inicio, "endDate": fim, "dimensions": [dim], "rowLimit": 100},
        )
        linhas = r.get("rows", [])
        print(f"{'cliques':>8} {'impr':>8} {'ctr':>7} {'pos':>6}  {dim}")
        for linha in linhas:
            print(
                f"{linha['clicks']:>8.0f} {linha['impressions']:>8.0f}"
                f" {linha['ctr']*100:>6.1f}% {linha['position']:>6.1f}  {linha['keys'][0]}"
            )
        if not linhas:
            print("(sem dados no período: propriedade nova costuma levar dias)")
        return 0

    print(__doc__)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
