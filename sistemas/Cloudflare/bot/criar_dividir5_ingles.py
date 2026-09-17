"""
Divide os dominios do funnel entre 5 URLs de artigo (ingles) e cria os redirects
(301, sem preservar path) agora. Operacao pontual de 1 hora.

Anti-loop: dominio do funnel que tambem seja destino fica na lista sem virar origem.
Split round-robin (i % N).
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
    "https://oiempreendedores.com.br/cursos/erros-comuns-de-quem-tenta-aprender-ingles-sem-orientacao/",
    "https://folhar.com.br/o-que-fazer-quando-voce-sente-que-nao-evolui-mais-no-ingles/",
    "https://blogse.com.br/como-ensinar-ingles-para-uma-pessoa-dislexica/",
    "https://saberdefato.com.br/com-qual-idade-as-criancas-devem-comecar-a-aprender-ingles/",
    "https://adonline.com.br/so-1-dos-brasileiros-fala-ingles-fluente-o-que-trava-o-avanco/",
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
    sources = [d for d in cf.LISTA_FUNNEL if d not in dest_domains]
    excluidos = sorted(d for d in cf.LISTA_FUNNEL if d in dest_domains)

    for chat in CHATS:
        send(chat, f"⏰ *Divisão (1h) disparada*\n\nDividindo {len(sources)} domínios entre {len(URLS)} URLs de artigo…")

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

        print(f"TOTAL: {total_ok} ok, {total_fail} fail | anti-loop: {excluidos}")
        for chat in CHATS:
            send(chat, "✅ *Divisão (1h) concluída*\n\n" + "\n".join(linhas) + f"\n\n*Total:* {total_ok} criados" + (f", {total_fail} falhas" if total_fail else "") + "\n⏱ Desfaz em ~1h")
    except Exception as e:
        print(f"ERRO: {e}")
        for chat in CHATS:
            send(chat, f"❌ *Erro na divisão*\n\n{e}")


if __name__ == "__main__":
    main()
