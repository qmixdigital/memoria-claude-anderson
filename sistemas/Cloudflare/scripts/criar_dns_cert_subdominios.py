"""Passo 1 da mudanca dos diretorios para subdominio (18/09/2026).

Cria, na Cloudflare, o registro A proxied e o Origin Certificate (15 anos) de:
  contadores.revistadeducao.com.br  e  diretorio.desassossegada.com.br
apontando para a opengravity (77.37.69.175), e grava o cert em
/etc/ssl/portais/<host>/origin.{pem,key} na opengravity.

Rodar de d:\\SISTEMAS\\Cloudflare:  python scripts/criar_dns_cert_subdominios.py
Depois:  bash scripts/ativar_subdominios_diretorios.sh
Idempotente: o que ja existe e pulado.
"""
import os, subprocess, requests

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TOK = [l.split("=", 1)[1].strip() for l in open(".env", encoding="utf-8") if l.startswith("CF_USER_TOKEN=")][0]
H = {"Authorization": "Bearer " + TOK, "Content-Type": "application/json"}
API = "https://api.cloudflare.com/client/v4"
IP = "77.37.69.175"
ALVOS = (("revistadeducao.com.br", "contadores"), ("desassossegada.com.br", "diretorio"))


def ssh(cmd, entrada=None):
    r = subprocess.run(["ssh", "opengravity", cmd], input=entrada, capture_output=True, text=True)
    return "\n".join(l for l in r.stdout.splitlines() if "post-quantum" not in l), r.returncode


for zona, sub in ALVOS:
    host = f"{sub}.{zona}"
    zid = requests.get(f"{API}/zones?name={zona}", headers=H, timeout=30).json()["result"][0]["id"]

    # DNS
    ex = requests.get(f"{API}/zones/{zid}/dns_records?name={host}", headers=H, timeout=30).json()["result"]
    if ex:
        print(f"{host}: DNS ja existe ({ex[0]['type']} {ex[0]['content']}, proxied={ex[0]['proxied']})")
    else:
        r = requests.post(f"{API}/zones/{zid}/dns_records", headers=H, timeout=30, json={
            "type": "A", "name": sub, "content": IP, "proxied": True, "ttl": 1,
            "comment": "diretorio Next na VPS, fora do Pages (18/09/2026)"}).json()
        print(f"{host}: DNS {'criado' if r.get('success') else r.get('errors')}")

    # Origin Certificate
    d = f"/etc/ssl/portais/{host}"
    out, _ = ssh(f"test -s {d}/origin.pem && echo existe")
    if "existe" in out:
        print(f"{host}: cert ja existe em {d}")
        continue
    csr, _ = ssh(f"mkdir -p {d} && cd {d} && ([ -f origin.key ] || openssl req -new -newkey rsa:2048 -nodes "
                 f"-keyout origin.key -out origin.csr -subj '/CN={host}' 2>/dev/null) && chmod 600 origin.key && cat origin.csr")
    r = requests.post(f"{API}/certificates", headers=H, timeout=60, json={
        "hostnames": [host], "requested_validity": 5475, "request_type": "origin-rsa", "csr": csr}).json()
    if not r.get("success"):
        print(f"{host}: ERRO no cert: {r.get('errors')}")
        continue
    ssh(f"cat > {d}/origin.pem", entrada=r["result"]["certificate"])
    print(f"{host}: cert emitido e gravado em {d}/origin.pem")

print("\nAgora: bash scripts/ativar_subdominios_diretorios.sh")
