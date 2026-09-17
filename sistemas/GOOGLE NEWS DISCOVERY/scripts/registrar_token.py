#!/usr/bin/env python3
"""Confere um token novo da Cloudflare e registra no contas.json.

Testa as tres coisas que o token precisa saber fazer, uma a uma, e so grava se
o escopo estiver certo. Serve para nao descobrir semanas depois que o token foi
criado com "Specific zone" de novo.

  python scripts/registrar_token.py --conta conta13 --token <TOKEN>
  python scripts/registrar_token.py --conta conta13 --token <TOKEN> --gravar

Sem --gravar, apenas confere e mostra o que mudaria.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

CONTAS = Path(r"D:\SISTEMAS\Cloudflare\contas.json")
API = "https://api.cloudflare.com/client/v4"
OK, RUIM = "  ok  ", " FALHA"


def req(caminho, token):
    r = urllib.request.Request(API + caminho,
                               headers={"Authorization": "Bearer " + token})
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"success": False, "errors": [{"message": str(e)}]}
    except Exception as e:
        return {"success": False, "errors": [{"message": str(e)}]}


def erro_de(d):
    return str((d.get("errors") or [{}])[0].get("message", ""))[:70]


def conferir(token):
    """Devolve (tudo_ok, relatorio, zonas)."""
    rel, zonas, tudo = [], [], True

    d = req("/user/tokens/verify", token)
    if not d.get("success"):
        rel.append((RUIM, "token", "invalido: " + erro_de(d)))
        return False, rel, zonas
    rel.append((OK, "token", (d.get("result") or {}).get("status", "active")))

    d = req("/accounts?per_page=50", token)
    contas = [(a["id"], a["name"]) for a in (d.get("result") or [])] \
        if d.get("success") else []
    if contas:
        rel.append((OK, "conta", ", ".join(n for _, n in contas)))
    else:
        rel.append((RUIM, "conta", "nao consegue listar: " + erro_de(d)))

    # 1. Zone:Read — e aqui que o escopo errado aparece
    pagina, total = 1, None
    while True:
        d = req("/zones?per_page=50&page={}".format(pagina), token)
        if not d.get("success"):
            rel.append((RUIM, "Zone:Read", erro_de(d)))
            tudo = False
            break
        zonas += [(z["id"], z["name"]) for z in (d.get("result") or [])]
        info = d.get("result_info") or {}
        total = info.get("total_count", len(zonas))
        if pagina >= (info.get("total_pages") or 1):
            rel.append((OK, "Zone:Read", "{} zonas".format(total)))
            break
        pagina += 1

    if not zonas:
        return False, rel, zonas

    if total == 1:
        rel.append((RUIM, "ESCOPO",
                    "so 1 zona visivel. Provavel 'Specific zone' em vez de "
                    "'All zones from an account'"))
        tudo = False

    zid, znome = zonas[0]

    # 2. Zone WAF:Edit — ler o ruleset custom (o PUT depende disso)
    d = req("/zones/{}/rulesets/phases/http_request_firewall_custom/entrypoint"
            .format(zid), token)
    if d.get("success"):
        n = len(((d.get("result") or {}).get("rules") or []))
        rel.append((OK, "Zone WAF", "ruleset legivel em {} ({} regras)"
                    .format(znome, n)))
    else:
        rel.append((RUIM, "Zone WAF", erro_de(d)))
        tudo = False

    # 3. Zone Settings:Read/Edit
    d = req("/zones/{}/settings/security_level".format(zid), token)
    if d.get("success"):
        rel.append((OK, "Zone Settings",
                    "security_level = {}".format(
                        (d.get("result") or {}).get("value"))))
    else:
        rel.append((RUIM, "Zone Settings", erro_de(d)))
        tudo = False

    # 4. Bot Management (opcional, mas e o que faltava na conta7)
    d = req("/zones/{}/bot_management".format(zid), token)
    if d.get("success"):
        rel.append((OK, "Bot Management",
                    "fight_mode = {}".format(
                        (d.get("result") or {}).get("fight_mode"))))
    else:
        rel.append(("  aviso", "Bot Management",
                    "sem leitura ({}). Nao bloqueia a skip rule, mas impede "
                    "conferir o Bot Fight Mode.".format(erro_de(d))))

    return tudo, rel, zonas


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--conta", required=True, help="nome no contas.json")
    p.add_argument("--token", required=True)
    p.add_argument("--gravar", action="store_true")
    p.add_argument("--forcar", action="store_true",
                   help="grava mesmo com conferencia reprovada")
    p.add_argument("--criar", action="store_true",
                   help="cria a entrada no contas.json se ela nao existir")
    p.add_argument("--nota", default="",
                   help="anotacao a gravar junto da entrada")
    a = p.parse_args()

    print("conferindo o token de {}...\n".format(a.conta))
    tudo, rel, zonas = conferir(a.token)
    for estado, item, detalhe in rel:
        print("[{}] {:<15} {}".format(estado, item, detalhe))

    if zonas:
        print("\nprimeiras zonas visiveis:")
        for _, n in sorted(zonas, key=lambda x: x[1])[:12]:
            print("   " + n)
        if len(zonas) > 12:
            print("   ... e mais {}".format(len(zonas) - 12))

    print("\n" + ("CONFERENCIA OK" if tudo else "CONFERENCIA REPROVADA"))
    if not tudo and not a.forcar:
        print("nao gravei. Corrija o token e rode de novo "
              "(ou use --forcar se souber o que esta fazendo).")
        return 1

    if not a.gravar:
        print("nada gravado. Repita com --gravar para atualizar o contas.json.")
        return 0

    d = json.loads(CONTAS.read_text(encoding="utf-8"))
    bak = CONTAS.with_name("contas.json.bak-{}-{}".format(
        date.today().strftime("%Y%m%d"), a.conta))
    shutil.copy2(CONTAS, bak)

    alvo = d if isinstance(d, list) else d.get("contas", d)
    achou = False
    it = alvo if isinstance(alvo, list) else list(alvo.values())
    for x in it:
        if isinstance(x, dict) and x.get("nome") == a.conta:
            x["token"] = a.token
            if a.nota:
                x["nota"] = a.nota
            achou = True
    if not achou and isinstance(alvo, dict) and a.conta in alvo:
        alvo[a.conta]["token"] = a.token
        if a.nota:
            alvo[a.conta]["nota"] = a.nota
        achou = True

    if not achou and a.criar:
        # descobre o account_id quando a entrada e nova. Token de USUARIO ve
        # varias contas, entao nesse caso o account_id nao se aplica e fica
        # nulo de proposito.
        r = req("/accounts?per_page=50", a.token)
        contas_vis = r.get("result") or []
        nova = {"nome": a.conta, "token": a.token,
                "account_id": (contas_vis[0]["id"] if len(contas_vis) == 1
                               else None)}
        if a.nota:
            nova["nota"] = a.nota
        if len(contas_vis) != 1:
            nova["escopo"] = "token de usuario: enxerga varias contas"
        if isinstance(alvo, list):
            alvo.insert(0, nova)
        else:
            alvo[a.conta] = nova
        achou = True
        print("entrada {!r} CRIADA no contas.json".format(a.conta))

    if not achou:
        print("conta {!r} nao encontrada no contas.json "
              "(use --criar para adicionar)".format(a.conta))
        return 1

    CONTAS.write_text(json.dumps(d, ensure_ascii=False, indent=2),
                      encoding="utf-8")
    print("gravado. Backup em {}".format(bak.name))
    print("\nproximo passo: python scripts/auditar_zonas_cf.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
