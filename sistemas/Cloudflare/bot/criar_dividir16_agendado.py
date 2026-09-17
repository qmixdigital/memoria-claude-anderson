"""
Divide os dominios do funnel entre 16 dominios de destino e cria os redirects
(301, sem preservar path) agora. Usado com `at` one-shot.

Igual ao criar_dividir17, porem SEM criexp.com.br (ja bem posicionado).

Anti-loop: dominio do funnel que tambem seja destino fica na lista mas nao vira origem.
Split round-robin (i % N) sobre a lista ordenada do funnel.
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
    "https://spressosp.com.br/",
    "https://uniaseconcursos.com.br/",
    "https://segredosdeconcurso.com.br/",
    "https://revan.com.br/",
    "https://meupratosaudavel.com.br/",
    "https://meupratinhosaudavel.com.br/",
    "https://pinaunaeditora.com.br/",
    "https://jornaldejales.com.br/",
    "https://hotec.com.br/",
    "https://guia55.com.br/",
    "https://docesletras.com.br/",
    "https://abrafi.com.br/",
    "https://cordeiropolisemfoco.com.br/",
    "https://leiaagora.com.br/",
    "https://fcblu.com.br/",
    "https://cabofolia.com.br/",
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
                body = {"name": "default", "kind": "zone", "phase": "http_request_dynamic_redirect", "rules": [rule]}
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
    excluidos = sorted(d for d in fset if d in dest_domains)
    sources = [d for d in cf.LISTA_FUNNEL if d not in dest_domains]

    for chat in CHATS:
        send(chat, f"⏰ *Divisão disparada*\n\nDividindo {len(sources)} domínios entre {len(URLS)} destinos…\n🔒 {len(excluidos)} anti-loop")

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
            linhas.append(f"• {ok} → `{norm(url)}`" + (f" ({fail}✗)" if fail else ""))
            print(f"{ok} ok, {fail} fail -> {url}")

        print(f"TOTAL: {total_ok} ok, {total_fail} fail | excluidos(anti-loop): {excluidos}")
        for chat in CHATS:
            send(chat, "✅ *Divisão concluída*\n\n" + "\n".join(linhas) + f"\n\n*Total:* {total_ok} criados" + (f", {total_fail} falhas" if total_fail else ""))
    except Exception as e:
        print(f"ERRO: {e}")
        for chat in CHATS:
            send(chat, f"❌ *Erro na divisão*\n\n{e}")


if __name__ == "__main__":
    main()
