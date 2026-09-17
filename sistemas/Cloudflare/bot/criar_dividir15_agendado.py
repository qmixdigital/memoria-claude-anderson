"""
Divide os dominios do funnel entre N URLs de destino e cria os redirects (301,
sem preservar path) agora.

Anti-loop: qualquer dominio do funnel que TAMBEM seja um destino e' mantido na
lista (arquivo nao e' alterado) mas NAO recebe redirect (nao vira origem),
para nao criar looping.

Split deterministico round-robin (i % N) sobre a lista ordenada do funnel.
Rodar direto (agora) ou via `at`.
"""
import json
import os
import sys
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import cf_operations as cf

DIR = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(DIR, "config.json"), encoding="utf-8"))
TOKEN = cfg["bot_token"]
CHATS = cfg["authorized_chats"]

URLS = [
    "https://formulanegocioonlinedoalex.com.br/",
    "https://vinhosbianchetti.com.br/",
    "https://correntecoats.com.br/",
    "https://www.supervolt.com.br/",
    "https://cozot.com.br/",
    "https://etecpj.com.br/",
    "https://psicomednet.com.br/",
    "https://www.etecsantacruz.com.br/",
    "https://www.imotion.com.br/",
    "https://posot.com.br/",
    "https://americaeconomiabrasil.com.br/",
    "https://www.luminapdv.com.br/",
    "https://www.imesp.com.br/",
    "https://etecparquedajuventude.com.br/",
    "https://www.plataformateatro.com/",
]


def norm(u):
    return u.split("//", 1)[-1].split("/", 1)[0].removeprefix("www.").lower()


def send(chat_id, text):
    try:
        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=30,
        )
    except Exception as e:
        print(f"send erro: {e}", file=sys.stderr)


def criar_grupo(zone_to, zonas, dest_url):
    """Cria redirect cross-domain (301, sem preservar path) para dest_url nas zonas dadas."""
    sucessos, falhas = [], []

    def trocar(zone):
        try:
            conta_nome, zid = zone_to[zone]
            rs_id, existentes = cf._get_cross_domain_rules(zone, conta_nome, zid)
            for r in existentes:
                cf._http("delete", f"/zones/{zid}/rulesets/{rs_id}/rules/{r['id']}", conta_nome)
            if zone in cf.SUBDOMINIOS_ZONA:
                expr = f'(ends_with(http.host, "{zone}"))'
            else:
                expr = f'(http.host eq "{zone}" or http.host eq "www.{zone}")'
            rule = {
                "action": "redirect",
                "expression": expr,
                "description": f"Bot: redirecionar para {dest_url}",
                "enabled": True,
                "action_parameters": {
                    "from_value": {
                        "preserve_query_string": False,
                        "status_code": 301,
                        "target_url": {"value": dest_url},
                    }
                },
            }
            if rs_id:
                r = cf._http("post", f"/zones/{zid}/rulesets/{rs_id}/rules", conta_nome, rule)
            else:
                body = {
                    "name": "default",
                    "kind": "zone",
                    "phase": "http_request_dynamic_redirect",
                    "rules": [rule],
                }
                r = cf._http("post", f"/zones/{zid}/rulesets", conta_nome, body)
            if r.json().get("success"):
                sucessos.append(zone)
            else:
                falhas.append(zone)
        except Exception:
            falhas.append(zone)

    alvos = [z for z in zonas if z in zone_to]
    with ThreadPoolExecutor(max_workers=cf.WORKERS) as ex:
        for fut in as_completed([ex.submit(trocar, z) for z in alvos]):
            fut.result()
    return len(sucessos), len(falhas)


def main():
    dest_domains = {norm(u) for u in URLS}
    fset = set(cf.LISTA_FUNNEL)
    excluidos = sorted(d for d in fset if d in dest_domains)  # destinos que estao no funnel
    sources = [d for d in cf.LISTA_FUNNEL if d not in dest_domains]

    for chat in CHATS:
        send(
            chat,
            f"⏰ *Divisão disparada*\n\n"
            f"Dividindo {len(sources)} domínios entre {len(URLS)} URLs…\n"
            f"🔒 {len(excluidos)} mantidos na lista sem redirecionar (anti-loop)",
        )

    try:
        zone_to = cf._localizar_zonas()
        grupos = [[] for _ in URLS]
        for i, d in enumerate(sources):
            grupos[i % len(URLS)].append(d)

        linhas = []
        total_ok = total_fail = 0
        for g, url in zip(grupos, URLS):
            ok, fail = criar_grupo(zone_to, g, url)
            total_ok += ok
            total_fail += fail
            dom = norm(url)
            linhas.append(f"• {ok} → `{dom}`" + (f" ({fail}✗)" if fail else ""))
            print(f"{ok} ok, {fail} fail -> {url}")

        print(f"TOTAL: {total_ok} ok, {total_fail} fail | excluidos(anti-loop): {excluidos}")
        for chat in CHATS:
            send(
                chat,
                "✅ *Divisão concluída*\n\n"
                + "\n".join(linhas)
                + f"\n\n*Total:* {total_ok} criados"
                + (f", {total_fail} falhas" if total_fail else "")
                + f"\n🔒 Sem redirect (anti-loop): {', '.join(excluidos)}",
            )
    except Exception as e:
        print(f"ERRO: {e}")
        for chat in CHATS:
            send(chat, f"❌ *Erro na divisão*\n\n{e}")


if __name__ == "__main__":
    main()
