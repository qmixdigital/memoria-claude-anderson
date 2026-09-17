#!/usr/bin/env python3
"""Cruza os dominios da rede com as zonas visiveis nas contas Cloudflare.

Para cada dominio que NAO aparece em nenhuma das contas do contas.json,
consulta os nameservers por DNS-over-HTTPS e diz se apontam para a Cloudflare
e qual e o par de NS.

O par de NS serve para AGRUPAR: validado empiricamente em 346 zonas de 30
contas desta rede, nenhum par apareceu em duas contas diferentes. Entao
dominios que compartilham o par estao na mesma conta, e descobrir a conta de um
deles resolve o grupo inteiro. O contrario nao vale: 18 das 30 contas tem mais
de um par, entao o numero de pares e um TETO do numero de contas, nao o
numero.

  python scripts/auditar_zonas_cf.py
  python scripts/auditar_zonas_cf.py --saida faltantes.csv

Enumera as zonas de cada token UMA vez (com paginacao), em vez de perguntar
dominio por dominio: 111 dominios x 34 tokens seriam ~3.800 requisicoes.
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

CONTAS = Path(r"D:\SISTEMAS\Cloudflare\contas.json")
HOSPEDAGENS = Path(r"D:\SISTEMAS\MinhasHospedagens")
API = "https://api.cloudflare.com/client/v4"
DOH = "https://dns.google/resolve"


def req(url, headers=None, timeout=30):
    r = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"success": False, "errors": [{"message": str(e)}]}
    except Exception as e:
        return {"success": False, "errors": [{"message": str(e)}]}


def carregar_contas():
    d = json.loads(CONTAS.read_text(encoding="utf-8"))
    c = d if isinstance(d, list) else d.get("contas", d)
    if isinstance(c, dict):
        c = [dict(v, nome=v.get("nome", k)) for k, v in c.items()
             if isinstance(v, dict)]
    return [x for x in c if x.get("token")]


def zonas_da_conta(conta):
    """Todas as zonas que este token enxerga, com paginacao."""
    saida, pagina = {}, 1
    while True:
        d = req("{}/zones?per_page=50&page={}".format(API, pagina),
                {"Authorization": "Bearer " + conta["token"]})
        if not d.get("success"):
            msg = str((d.get("errors") or [{}])[0].get("message", ""))[:80]
            return saida, msg
        res = d.get("result") or []
        for z in res:
            saida[z["name"].lower()] = {
                "zone_id": z["id"], "conta": conta["nome"],
                "status": z.get("status"),
                "ns": [n.lower() for n in (z.get("name_servers") or [])],
                "plano": (z.get("plan") or {}).get("name"),
            }
        info = (d.get("result_info") or {})
        if pagina >= (info.get("total_pages") or 1):
            return saida, None
        pagina += 1


# Dominio temporario de hospedagem, nao e portal da rede.
IGNORAR = ("hostingersite.com", "pages.dev", "workers.dev", "vercel.app")


def normalizar(d):
    """Tira www. e o que nao e dominio de portal. Devolve None para descartar."""
    d = (d or "").strip().lower().rstrip(".")
    if d.startswith("www."):
        d = d[4:]
    if not d or "." not in d or " " in d:
        return None
    if any(d.endswith(s) for s in IGNORAR):
        return None
    return d


def dominios_da_rede():
    """Une as fontes de verdade sobre quais dominios sao da rede.

    Normaliza para o apex: as fichas e a allowlist misturam `www.` com apex, e
    sem normalizar o mesmo portal aparece duas vezes, uma delas "fora da
    Cloudflare" so porque o www nao tem registro NS proprio.
    """
    doms = {}

    csvp = HOSPEDAGENS / "qmix_endpoints_atual.csv"
    if csvp.exists():
        with open(csvp, encoding="utf-8") as fh:
            for linha in csv.DictReader(fh):
                d = normalizar(linha.get("domain"))
                if d:
                    doms.setdefault(d, set()).add("endpoints.csv")

    allow = HOSPEDAGENS / "rede-publicacao-allowlist.txt"
    if allow.exists():
        for l in allow.read_text(encoding="utf-8").splitlines():
            if l.strip().startswith("#"):
                continue
            d = normalizar(l)
            if d:
                doms.setdefault(d, set()).add("allowlist")

    # fichas por dominio das instancias do portal-engine
    for pasta in ("clinicas-vps", "Opengravity", "<<REMOVIDO>>"):
        p = HOSPEDAGENS / pasta
        if not p.is_dir():
            continue
        for f in p.glob("*.md"):
            if f.stem.startswith("_"):
                continue
            d = normalizar(f.stem)
            if d:
                doms.setdefault(d, set()).add("ficha/" + pasta)
    return doms


def ns_de(dominio):
    d = req("{}?name={}&type=NS".format(DOH, dominio),
            {"accept": "application/dns-json"}, timeout=20)
    ns = sorted({(a.get("data") or "").rstrip(".").lower()
                 for a in (d.get("Answer") or []) if a.get("type") == 2})
    return ns


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--saida", default="zonas_faltantes.csv")
    a = p.parse_args()

    contas = carregar_contas()
    print("enumerando zonas de {} contas...".format(len(contas)))
    todas, problemas = {}, []
    for c in contas:
        z, erro = zonas_da_conta(c)
        if erro:
            problemas.append((c["nome"], erro))
        for nome, info in z.items():
            todas.setdefault(nome, info)
        print("  {:<14} {:>4} zonas{}".format(
            c["nome"][:14], len(z), "  ERRO: " + erro if erro else ""))

    print("\ntotal de zonas visiveis: {}".format(len(todas)))
    if problemas:
        print("tokens com problema:")
        for n, e in problemas:
            print("  {:<14} {}".format(n, e))

    rede = dominios_da_rede()
    print("dominios da rede catalogados: {}".format(len(rede)))

    achados = {d: todas[d] for d in rede if d in todas}
    faltantes = sorted(d for d in rede if d not in todas)

    print("\n{} encontrados | {} FALTANTES\n".format(
        len(achados), len(faltantes)))

    linhas = []
    por_par = defaultdict(list)
    print("{:<34} {:<12} {}".format("DOMINIO", "NA CF?", "NAMESERVERS"))
    print("-" * 96)
    for d in faltantes:
        ns = ns_de(d)
        na_cf = any("ns.cloudflare.com" in n for n in ns)
        par = ",".join(n.split(".")[0] for n in ns if "cloudflare" in n)
        if na_cf:
            por_par[par].append(d)
        print("{:<34} {:<12} {}".format(
            d[:34], "SIM" if na_cf else ("sem NS" if not ns else "nao"),
            ", ".join(ns)[:44] or "(nao resolveu)"))
        linhas.append({"dominio": d, "na_cloudflare": "sim" if na_cf else "nao",
                       "par_ns": par, "nameservers": " ".join(ns),
                       "fontes": ",".join(sorted(rede[d]))})

    Path(a.saida).write_text(
        "\n".join([",".join(["dominio", "na_cloudflare", "par_ns",
                             "nameservers", "fontes"])]
                  + [",".join('"{}"'.format(l[k]) for k in
                              ("dominio", "na_cloudflare", "par_ns",
                               "nameservers", "fontes")) for l in linhas]),
        encoding="utf-8")

    if por_par:
        print("\n=== AGRUPADO POR PAR DE NS (par nao repete entre contas) ===")
        for par, ds in sorted(por_par.items(), key=lambda x: -len(x[1])):
            print("\n  par {:<24} {} dominios".format(par, len(ds)))
            for d in sorted(ds):
                print("     " + d)
        print("\nCada par de NS pertence a UMA conta Cloudflare. Localize a "
              "conta de um dominio do grupo (painel da CF) e todos os outros "
              "do mesmo par estao na mesma conta.")

    print("\ngravado em {}".format(a.saida))
    return 0


if __name__ == "__main__":
    sys.exit(main())
