#!/usr/bin/env python3
"""
Upload de imagens para o Wikimedia Commons via OAuth 2.0 owner-only.

Uso:
    python upload_commons.py --check           # testa a autenticacao
    python upload_commons.py fotos.json        # sobe tudo que estiver no manifesto
    python upload_commons.py fotos.json --dry  # so mostra o wikitext, nao envia
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("COMMONS_ACCESS_TOKEN")
UA = os.getenv("COMMONS_USER_AGENT")
API = "https://commons.wikimedia.org/w/api.php"

if not TOKEN or not UA:
    sys.exit("Faltando COMMONS_ACCESS_TOKEN ou COMMONS_USER_AGENT no .env")

# Session mantem o cookie jar. Sem isso o API gateway aplica rate limit agressivo
# mesmo com token valido.
S = requests.Session()
S.headers.update({"Authorization": f"Bearer {TOKEN}", "User-Agent": UA})


def api(method="GET", **params):
    params["format"] = "json"
    params["formatversion"] = "2"
    files = params.pop("_files", None)
    if method == "GET":
        r = S.get(API, params=params, timeout=60)
    else:
        r = S.post(API, data=params, files=files, timeout=300)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(f"{data['error'].get('code')}: {data['error'].get('info')}")
    return data


def whoami():
    info = api(action="query", meta="userinfo", uiprop="rights|groups")["query"]["userinfo"]
    return info


def csrf_token():
    return api(action="query", meta="tokens", type="csrf")["query"]["tokens"]["csrftoken"]


def build_wikitext(item, defaults):
    """Monta a pagina de descricao do arquivo."""
    g = lambda k: item.get(k, defaults.get(k, ""))

    desc_pt = item.get("descricao_pt", "")
    desc_en = item.get("descricao_en", "")
    description = ""
    if desc_pt:
        description += "{{pt|1=%s}}" % desc_pt
    if desc_en:
        description += "\n{{en|1=%s}}" % desc_en

    permission = g("permission")
    categories = item.get("categorias", defaults.get("categorias", []))
    cats = "\n".join(f"[[Category:{c}]]" for c in categories)

    return f"""=={{{{int:filedesc}}}}==
{{{{Information
|description={description}
|date={g("data")}
|source={g("source")}
|author={g("author")}
|permission={permission}
|other fields=
}}}}
{f"{{{{Location|{item['coords']}}}}}" if item.get("coords") else ""}

=={{{{int:license-header}}}}==
{{{{{g("licenca")}}}}}

{cats}
""".replace("\n\n\n", "\n\n")


def upload(item, defaults, token, dry=False):
    path = Path(item["arquivo"])
    if not path.is_file():
        raise FileNotFoundError(path)

    filename = item["nome_commons"]
    text = build_wikitext(item, defaults)

    if dry:
        print(f"\n--- {filename} ---\n{text}")
        return None

    with path.open("rb") as fh:
        data = api(
            "POST",
            action="upload",
            filename=filename,
            text=text,
            comment=defaults.get("comment", "Upload via script"),
            token=token,
            _files={"file": (path.name, fh)},
        )

    up = data["upload"]
    if up.get("result") != "Success":
        return {"filename": filename, "result": up.get("result"), "warnings": up.get("warnings")}

    info = up["imageinfo"]
    return {
        "filename": filename,
        "result": "Success",
        "page_url": info["descriptionurl"],
        "file_url": info["url"],
        "width": info["width"],
        "height": info["height"],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("manifesto", nargs="?", help="JSON com defaults + lista de imagens")
    ap.add_argument("--check", action="store_true", help="so testa a autenticacao")
    ap.add_argument("--dry", action="store_true", help="mostra o wikitext sem enviar")
    ap.add_argument("--out", default="resultado.json")
    args = ap.parse_args()

    if args.check:
        u = whoami()
        print(f"Autenticado como: {u['name']} (id {u['id']})")
        print("Grupos:", ", ".join(u.get("groups", [])))
        can = [r for r in u.get("rights", []) if "upload" in r or r == "edit"]
        print("Direitos relevantes:", ", ".join(can) or "NENHUM - revise os grants do consumer")
        return

    if not args.manifesto:
        ap.error("informe o manifesto JSON ou use --check")

    cfg = json.loads(Path(args.manifesto).read_text(encoding="utf-8"))
    defaults = cfg.get("defaults", {})
    itens = cfg["imagens"]

    token = None if args.dry else csrf_token()
    resultados = []

    for i, item in enumerate(itens, 1):
        try:
            r = upload(item, defaults, token, dry=args.dry)
            if r:
                status = r["result"]
                print(f"[{i}/{len(itens)}] {status}: {r['filename']}")
                if status == "Success":
                    print(f"    {r['page_url']}")
                    print(f"    {r['file_url']}")
                else:
                    print(f"    {r.get('warnings')}")
                resultados.append(r)
        except Exception as e:
            print(f"[{i}/{len(itens)}] ERRO em {item.get('nome_commons')}: {e}")
            resultados.append({"filename": item.get("nome_commons"), "result": "error", "erro": str(e)})
        time.sleep(1)  # cortesia com a API

    if resultados:
        Path(args.out).write_text(
            json.dumps(resultados, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\nResultado salvo em {args.out}")


if __name__ == "__main__":
    main()
