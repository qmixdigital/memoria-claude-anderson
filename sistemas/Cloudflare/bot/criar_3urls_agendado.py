"""
Agendamento one-shot (usado com `at`): divide os dominios do funnel em 3 grupos
iguais e redireciona cada grupo (301) para uma das 3 URLs de artigo.

preservar_path=False -> todo o trafego de cada dominio cai EXATAMENTE no artigo
(objetivo: reforcar indexacao das 3 URLs de destino).

Split deterministico por interleave (i % 3) sobre a lista ordenada do funnel.
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
    "https://saudeemalta.net.br/como-escolher-o-jaleco-ideal-para-cada-area-da-saude/",
    "https://saudeacessivel.com.br/dicas/tendencias-em-jalecos-para-clinicas-modernas-e-consultorios-particulares/",
    "https://revistatopsaude.com.br/dicas/por-que-o-jaleco-influencia-a-confianca-do-paciente-no-dentista/",
]


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
    for chat in CHATS:
        send(chat, "⏰ *Agendamento disparado*\n\nDividindo o funnel em 3 grupos → 3 URLs de jaleco…")

    try:
        zone_to = cf._localizar_zonas()
        lista = cf.LISTA_FUNNEL  # ja vem ordenada e deduplicada
        grupos = [[], [], []]
        for i, d in enumerate(lista):
            grupos[i % 3].append(d)

        linhas = []
        total_ok = total_fail = 0
        for g, url in zip(grupos, URLS):
            ok, fail = criar_grupo(zone_to, g, url)
            total_ok += ok
            total_fail += fail
            dom = url.split("//", 1)[1].split("/", 1)[0]
            linhas.append(f"• {ok} domínios → `{dom}`" + (f" ({fail} falhas)" if fail else ""))

        for chat in CHATS:
            send(
                chat,
                "✅ *Agendamento concluído*\n\n"
                + "\n".join(linhas)
                + f"\n\n*Total:* {total_ok} criados"
                + (f", {total_fail} falhas" if total_fail else ""),
            )
    except Exception as e:
        for chat in CHATS:
            send(chat, f"❌ *Erro no agendamento*\n\n{e}")


if __name__ == "__main__":
    main()
