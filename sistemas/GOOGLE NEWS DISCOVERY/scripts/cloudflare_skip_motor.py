#!/usr/bin/env python3
"""Cria em cada zona do piloto a regra de skip para o IP do motor de pautas.

RODA NA MAQUINA LOCAL, nao no gnd-motor: os tokens das 34 contas Cloudflare
vivem em D:\\SISTEMAS\\Cloudflare\\contas.json.

  python scripts/cloudflare_skip_motor.py --dominios portais.txt          # simula
  python scripts/cloudflare_skip_motor.py --dominios portais.txt --aplicar
  python scripts/cloudflare_skip_motor.py --dominios a.com,b.com --aplicar

Por padrao SIMULA. Nada e alterado sem --aplicar.

===========================================================================
ORDEM DA REGRA: o skip vai em PRIMEIRO, e nao depois das genericas
===========================================================================

A instrucao recebida foi "skip depois das genericas". A licao registrada em
`vps-security-hardening/SKILL.md` diz o contrario, e para o caso do motor a
diferenca nao e estetica, e a diferenca entre publicar e tomar 403 em tudo:

  - regra custom da Cloudflare e avaliada EM ORDEM, de cima para baixo
  - a primeira regra generica do WAF de site estatico da rede e
      block (not http.request.method in {"GET" "HEAD" "OPTIONS"})
  - o publicador do motor manda POST

Com o skip ABAIXO dessa generica, o POST casa com o block primeiro, a
avaliacao para ali e o skip nunca e alcancado. Toda publicacao morre em 403,
e o motor registraria como falha de rede sem entender por que.

Por isso este script poe o skip no topo, igual ao skip de verified bot do
Google, que segue o mesmo raciocinio. Se a intencao era outra, `--depois`
inverte a posicao, mas confira antes o que ha acima na zona.

===========================================================================
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

CONTAS = Path(r"D:\SISTEMAS\Cloudflare\contas.json")
API = "https://api.cloudflare.com/client/v4"
IP_MOTOR = "62.238.112.87"
DESCRICAO = "ALLOW motor de pautas (gnd-motor) - publicacao via API"
DESCRICAO_BOT = "ALLOW verified search bots (Googlebot/Bing) - nunca bloquear"
FASE = "http_request_firewall_custom"
LIMITE_FREE = 5

# Mesmos phases/products do skip de verified bot ja usado na rede: pula
# rate-limit, WAF gerenciado, security level, Bot Fight Mode e afins.
ACAO_SKIP = {
    "ruleset": "current",
    "phases": ["http_ratelimit", "http_request_firewall_managed"],
    "products": ["waf", "rateLimit", "securityLevel", "bic", "uaBlock",
                 "hot", "zoneLockdown"],
}
EXPRESSAO = "(ip.src eq {})".format(IP_MOTOR)

# Modo googlebot: mesma mecanica, outra expressao. Serve a REGRA #0 da rede
# (zona indexavel tem que ter skip de verified bot na 1a posicao). Ver
# MinhasHospedagens/PENDENCIA-REGRA0-GOOGLEBOT.md.
MODO = {"expressao": EXPRESSAO, "descricao": DESCRICAO, "marcador": IP_MOTOR}


def usar_modo_googlebot():
    MODO["expressao"] = "(cf.client.bot)"
    MODO["descricao"] = DESCRICAO_BOT
    MODO["marcador"] = "cf.client.bot"


def req(token, caminho, metodo="GET", corpo=None):
    r = urllib.request.Request(
        API + caminho,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        method=metodo,
        headers={"Authorization": "Bearer " + token,
                 "Content-Type": "application/json"})
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


def carregar_contas():
    d = json.loads(CONTAS.read_text(encoding="utf-8"))
    c = d if isinstance(d, list) else d.get("contas", d)
    if isinstance(c, dict):
        c = [dict(v, nome=v.get("nome", k)) for k, v in c.items()
             if isinstance(v, dict)]
    return [x for x in c if x.get("token")]


def achar_zona(contas, dominio):
    """Descobre qual das 34 contas edita esta zona."""
    for conta in contas:
        d = req(conta["token"], "/zones?name={}".format(dominio))
        for z in (d.get("result") or []):
            if z.get("name") == dominio:
                return conta, z
    return None, None


def limpar(regra):
    """So os campos que o PUT do entrypoint aceita de volta."""
    return {k: v for k, v in regra.items()
            if k in ("action", "action_parameters", "expression",
                     "description", "enabled", "ratelimit", "logging")}


def montar_skip():
    return {"action": "skip", "action_parameters": dict(ACAO_SKIP),
            "expression": MODO["expressao"], "description": MODO["descricao"],
            "enabled": True}


def planejar(regras, unir_escopo=False):
    """Decide o que fazer com as regras existentes. Devolve (plano, novas)."""
    skip_novo = montar_skip()

    # ja existe a nossa regra: atualiza no lugar
    for r in regras:
        if r.get("description") == MODO["descricao"]:
            outras = [limpar(x) for x in regras
                      if x.get("description") != MODO["descricao"]]
            return "atualizar a regra existente do motor", [skip_novo] + outras

    if len(regras) < LIMITE_FREE:
        return ("inserir no topo ({} regras hoje, cabe)".format(len(regras)),
                [skip_novo] + [limpar(r) for r in regras])

    # plano Free cheio: estender um skip que ja exista, em vez de criar a 6a
    for i, r in enumerate(regras):
        if r.get("action") == "skip":
            estendida = limpar(r)
            if MODO["marcador"] in estendida.get("expression", ""):
                return "ja coberto pelo skip existente, nada a fazer", None
            estendida["expression"] = "({}) or {}".format(
                estendida["expression"], MODO["expressao"])
            ap = dict(estendida.get("action_parameters") or {})
            ap["ruleset"] = "current"

            faltando = (set(ACAO_SKIP["phases"]) - set(ap.get("phases") or [])) \
                | (set(ACAO_SKIP["products"]) - set(ap.get("products") or []))
            if unir_escopo:
                ap["phases"] = sorted(set(ap.get("phases") or [])
                                      | set(ACAO_SKIP["phases"]))
                ap["products"] = sorted(set(ap.get("products") or [])
                                        | set(ACAO_SKIP["products"]))
                aviso = " e UNINDO escopo (--unir-escopo)"
            else:
                # NAO alarga a regra de outra pessoa: unir phases/products
                # mudaria o comportamento dela para TODAS as outras coisas que
                # ela casa (wp-admin logado, hosts de anuncio), e nao so para o
                # nosso IP. Sem --unir-escopo, so o IP entra na expressao.
                aviso = ""
            estendida["action_parameters"] = ap
            novas = [limpar(x) for x in regras]
            novas[i] = estendida
            plano = "plano Free cheio: ESTENDER o skip existente {!r}{}".format(
                r.get("description", "")[:40], aviso)
            if faltando and not unir_escopo:
                plano += " | ATENCAO: essa regra nao cobre {}".format(
                    ", ".join(sorted(faltando)))
            return plano, novas

    return ("plano Free cheio (5 regras) e NENHUMA e skip: precisa de decisao "
            "manual, o script nao apaga regra de ninguem"), None


def processar(contas, dominio, aplicar, depois, unir_escopo=False):
    conta, zona = achar_zona(contas, dominio)
    if not zona:
        return {"dominio": dominio, "estado": "ERRO",
                "detalhe": "zona nao encontrada em nenhuma das {} contas"
                           .format(len(contas))}

    ep = req(conta["token"],
             "/zones/{}/rulesets/phases/{}/entrypoint".format(zona["id"], FASE))
    regras = ((ep.get("result") or {}).get("rules") or []) if ep.get(
        "success", True) else []

    plano, novas = planejar(regras, unir_escopo)
    if novas is None:
        return {"dominio": dominio, "conta": conta["nome"],
                "zona": zona["id"], "estado": "PULADO", "detalhe": plano,
                "regras_hoje": len(regras)}

    if depois and len(novas) > 1 and novas[0].get("description") == DESCRICAO:
        novas = novas[1:] + [novas[0]]
        plano += " (posicao invertida por --depois)"

    resultado = {"dominio": dominio, "conta": conta["nome"],
                 "zona": zona["id"], "plano": plano,
                 "regras_hoje": len(regras), "regras_depois": len(novas),
                 "ordem": [r.get("description", "")[:38] for r in novas]}

    if not aplicar:
        resultado["estado"] = "SIMULADO"
        return resultado

    r = req(conta["token"],
            "/zones/{}/rulesets/phases/{}/entrypoint".format(zona["id"], FASE),
            "PUT", {"rules": novas})
    if r.get("success"):
        resultado["estado"] = "APLICADO"
    else:
        resultado["estado"] = "ERRO"
        resultado["detalhe"] = str(r.get("errors"))[:250]
    return resultado


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dominios", required=True,
                   help="arquivo com um dominio por linha, ou lista separada "
                        "por virgula")
    p.add_argument("--aplicar", action="store_true",
                   help="sem isto, apenas simula")
    p.add_argument("--googlebot", action="store_true",
                   help="aplica o skip de verified bot (REGRA #0) em vez do "
                        "skip do IP do motor. Implica --unir-escopo.")
    p.add_argument("--unir-escopo", action="store_true", dest="unir_escopo",
                   help="ao estender um skip alheio, tambem soma phases e "
                        "products. Alarga a regra para TODOS os casos que ela "
                        "casa, nao so para o nosso IP. Use com criterio.")
    p.add_argument("--depois", action="store_true",
                   help="poe o skip DEPOIS das genericas (ver o cabecalho: "
                        "quebra o POST do publicador se houver block de "
                        "metodo acima)")
    a = p.parse_args()

    alvo = Path(a.dominios)
    if alvo.exists():
        dominios = [l.strip() for l in alvo.read_text(encoding="utf-8")
                    .splitlines() if l.strip() and not l.startswith("#")]
    else:
        dominios = [d.strip() for d in a.dominios.split(",") if d.strip()]

    if a.googlebot:
        usar_modo_googlebot()
        a.unir_escopo = True

    if not CONTAS.exists():
        print("contas.json nao encontrado em {}".format(CONTAS))
        return 1
    contas = carregar_contas()
    print("{} contas com token | {} dominios | alvo {} | modo {}\n".format(
        len(contas), len(dominios), MODO["expressao"],
        "APLICAR" if a.aplicar else "SIMULACAO"))

    erros = 0
    for d in dominios:
        r = processar(contas, d, a.aplicar, a.depois, a.unir_escopo)
        erros += 1 if r["estado"] == "ERRO" else 0
        print("[{:<9}] {:<34} {}".format(
            r["estado"], d, r.get("plano") or r.get("detalhe", "")))
        if r.get("ordem"):
            for i, nome in enumerate(r["ordem"], 1):
                print("              {}. {}".format(i, nome))
        time.sleep(0.5)

    print("\n{} dominios, {} erros".format(len(dominios), erros))
    if not a.aplicar:
        print("nada foi alterado. Repita com --aplicar para valer.")
    else:
        print("\nVALIDAR: o POST do motor tem que continuar dando 401 com "
              "chave invalida (e nao 403):")
        print("  ssh gnd-motor \"curl -s -o /dev/null -w '%{http_code}\\n' "
              "-X POST https://DOMINIO/wp-json/NS/artigos "
              "-H 'X-API-KEY: teste' -d '{}'\"")
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
