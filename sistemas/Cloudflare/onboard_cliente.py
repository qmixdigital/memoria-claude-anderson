"""
Coloca o dominio de um cliente numa conta Cloudflare separada e deixa pronto.

Uso:
  python onboard_cliente.py <dominio> [<dominio2> ...] [--conta medicosbh]

Para cada dominio:
  1. cria a zona na conta (padrao: medicosbh, a conta "Medicos BH"), ou reusa se ja existe
  2. imprime o par de nameservers para colocar no Registro.br
  3. se a zona ja estiver ATIVA (NS trocados), aplica:
       harden_site.py (SSL Full Strict, HSTS, DNSSEC, WAF, rate limit)
       suavizar_conta.py na conta (tira Security Level alto e qualquer desafio ao visitante,
         regra do Anderson: site de cliente nunca mostra challenge)
       cf_www_apex.py (www -> apex em um salto)
     Se ainda estiver "pending", so cria e mostra os NS; rode de novo depois da troca.

A conta de clientes NAO entra no /opt/cf-bot da VPS (pulso de redirects e bloqueio
em massa): dominio de cliente nunca pode receber redirect ou 403 por engano.
"""
import json, os, subprocess, sys, requests

SD = os.path.dirname(os.path.abspath(__file__))
CONTAS = {c["nome"]: c for c in json.load(open(os.path.join(SD, "contas.json"), encoding="utf-8"))}
API = "https://api.cloudflare.com/client/v4"


def zona(h, aid, dom):
    r = requests.get(f"{API}/zones?name={dom}", headers=h, timeout=30).json()
    for z in r.get("result", []):
        return z
    r = requests.post(f"{API}/zones", headers=h, json={"name": dom, "account": {"id": aid}, "type": "full"}, timeout=30).json()
    if not r.get("success"):
        print(f"{dom}: ERRO ao criar zona: {r.get('errors')}")
        return None
    return r["result"]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    conta = "medicosbh"
    if "--conta" in sys.argv:
        conta = sys.argv[sys.argv.index("--conta") + 1]
        args = [a for a in args if a != conta]
    if not args:
        print(__doc__); sys.exit(1)
    c = CONTAS[conta]
    h = {"Authorization": "Bearer " + c["token"], "Content-Type": "application/json"}
    py = sys.executable
    for dom in args:
        dom = dom.lower().strip().removeprefix("www.")
        z = zona(h, c["account_id"], dom)
        if not z:
            continue
        if z["account"]["id"] != c["account_id"]:
            print(f"{dom}: ja existe na conta '{z['account']['name']}', nao na {conta}. Migre antes (apagar la e recriar aqui).")
            continue
        print(f"\n{dom}: zona {z['id']} | status {z['status']}")
        print("  nameservers para o Registro.br:")
        for ns in z.get("name_servers", []):
            print("    " + ns)
        if z["status"] != "active":
            print("  -> troque os NS no Registro.br e rode este script de novo para aplicar a seguranca.")
            continue
        for cmd in ([py, "harden_site.py", dom], [py, "suavizar_conta.py", conta], [py, "cf_www_apex.py", dom]):
            print("  $", " ".join(cmd[1:]))
            subprocess.run(cmd, cwd=SD)


if __name__ == "__main__":
    main()
