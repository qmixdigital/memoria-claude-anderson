#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dispara IndexNow para qualquer domínio da rede.

Lê a chave de MinhasHospedagens/indexnow-keys.txt, coleta as URLs dos
sitemaps do domínio (seguindo índices de sitemap) e envia aos endpoints.

IndexNow atende Bing, Yandex, Seznam e Naver. O Google NÃO participa do
protocolo — para ele, use envio de sitemap no Search Console.

Uso:
    python indexnow.py drtiagobernardes.com.br
    python indexnow.py drtiagobernardes.com.br --sitemap https://.../outro.xml
    python indexnow.py drtiagobernardes.com.br --url https://.../pagina-nova
    python indexnow.py drtiagobernardes.com.br --dry-run

Se o domínio ainda não tiver chave, o script gera, registra no arquivo da
rede e avisa para publicar <chave>.txt na raiz do site.
"""
import argparse, json, os, re, sys, urllib.error, urllib.request, uuid

ARQ_CHAVES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "indexnow-keys.txt")
ENDPOINTS = [("api.indexnow.org", "https://api.indexnow.org/IndexNow"),
             ("Bing",             "https://www.bing.com/indexnow"),
             ("Yandex",           "https://yandex.com/indexnow")]
UA = {"User-Agent": "Mozilla/5.0 (compatible; indexnow-qmix)"}
LIMITE = 10000  # máximo de URLs por requisição no protocolo


def baixar(url, timeout=30):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers=UA), timeout=timeout).read().decode("utf-8", "ignore")


def chave_do_dominio(dominio):
    caminho = os.path.normpath(ARQ_CHAVES)
    bruto = ""
    if os.path.exists(caminho):
        with open(caminho, "rb") as f:
            bruto = f.read().decode("utf-8", "ignore")

    for l in bruto.replace("\r\n", "\n").split("\n"):
        l = l.strip()
        if not l:
            continue
        partes = l.split("\t") if "\t" in l else l.split()
        if len(partes) >= 2 and partes[0].strip().lower() == dominio.lower():
            return partes[1].strip(), False

    # O arquivo é CRLF e já apareceu sem quebra de linha no fim. Anexar sem
    # verificar isso cola a entrada nova na última linha e corrompe as duas.
    nova = uuid.uuid4().hex
    prefixo = "" if (not bruto or bruto.endswith(("\n", "\r"))) else "\r\n"
    with open(caminho, "ab") as f:
        f.write(("%s%s\t%s\r\n" % (prefixo, dominio, nova)).encode("utf-8"))
    return nova, True


def sitemaps_do_robots(base):
    """Descobre os sitemaps pelo robots.txt, que é onde eles se declaram.

    Um site pode ter mais de um — aqui o do site estático e o do blog em
    /blog/ são separados, e chutar caminhos conhecidos perderia o segundo.
    """
    achados = []
    try:
        for l in baixar(base + "/robots.txt", timeout=20).splitlines():
            if l.lower().startswith("sitemap:"):
                u = l.split(":", 1)[1].strip()
                if u.startswith(base):
                    achados.append(u)
    except Exception as e:
        print("  ! robots.txt: %s" % str(e)[:60])
    if not achados:
        achados = ["%s/sitemap.xml" % base, "%s/sitemap_index.xml" % base,
                   "%s/wp-sitemap.xml" % base]
    return achados


def coletar(sitemap, vistos=None, nivel=0):
    """Segue índices de sitemap recursivamente."""
    vistos = vistos if vistos is not None else set()
    if sitemap in vistos or nivel > 3:
        return []
    vistos.add(sitemap)
    try:
        xml = baixar(sitemap)
    except Exception as e:
        print("  ! %s: %s" % (sitemap, str(e)[:60]))
        return []
    locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", xml)
    if "<sitemapindex" in xml:
        out = []
        for s in locs:
            out += coletar(s, vistos, nivel + 1)
        return out
    return locs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dominio")
    ap.add_argument("--sitemap", action="append", default=[],
                    help="sitemap extra (pode repetir)")
    ap.add_argument("--url", action="append", default=[],
                    help="envia só estas URLs, ignorando os sitemaps")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    base = "https://" + a.dominio
    chave, nova = chave_do_dominio(a.dominio)
    arquivo_chave = "%s/%s.txt" % (base, chave)

    if nova:
        print("Chave nova gerada e registrada: %s" % chave)
        print("Publique este arquivo na raiz do site antes de continuar:")
        print("  %s  (conteúdo: a própria chave)\n" % arquivo_chave)

    # a chave precisa estar publicada, senão os buscadores recusam
    try:
        conteudo = baixar(arquivo_chave, timeout=20).strip()
        if conteudo != chave:
            print("ERRO: %s existe mas o conteúdo não bate com a chave." % arquivo_chave)
            return 1
        print("Chave validada em %s" % arquivo_chave)
    except Exception as e:
        print("ERRO: não consegui ler %s (%s)" % (arquivo_chave, str(e)[:60]))
        print("Publique o arquivo com a chave dentro e rode de novo.")
        return 1

    if a.url:
        urls = list(a.url)
    else:
        sitemaps = a.sitemap or sitemaps_do_robots(base)
        urls = []
        for sm in sitemaps:
            achadas = coletar(sm)
            if achadas:
                print("  %-58s %d URLs" % (sm.replace(base, ""), len(achadas)))
            urls += achadas

    urls = [u for u in dict.fromkeys(x.strip() for x in urls) if u.startswith(base)]
    if not urls:
        print("Nenhuma URL encontrada.")
        return 1
    print("\nTotal: %d URLs" % len(urls))

    if a.dry_run:
        for u in urls[:10]:
            print("   ", u)
        print("   ... (dry-run, nada enviado)")
        return 0

    for i in range(0, len(urls), LIMITE):
        lote = urls[i:i + LIMITE]
        corpo = json.dumps({"host": a.dominio, "key": chave,
                            "keyLocation": arquivo_chave, "urlList": lote}).encode()
        print("\nLote %d — %d URLs" % (i // LIMITE + 1, len(lote)))
        for nome, ep in ENDPOINTS:
            req = urllib.request.Request(
                ep, data=corpo, method="POST",
                headers={"Content-Type": "application/json; charset=utf-8"})
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    print("  %-18s HTTP %s %s" % (nome, r.status, r.reason))
            except urllib.error.HTTPError as e:
                print("  %-18s HTTP %s %s" % (nome, e.code, e.read().decode()[:120] or e.reason))
            except Exception as e:
                print("  %-18s falhou: %s" % (nome, str(e)[:100]))

    print("\nLembrete: o Google não usa IndexNow. Envie o sitemap pelo Search Console.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
