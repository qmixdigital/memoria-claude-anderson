# Gera ecosystem.config.cjs a partir do que o PM2 ja esta rodando.
#
# Por que a partir do processo vivo e nao escrito a mao: o objetivo e que a
# instancia B efemera suba EXATAMENTE como sobe hoje. Qualquer diferenca de
# script, interpretador ou env so apareceria no meio de um deploy, que e o pior
# momento para descobrir.
import json, subprocess, sys, os

app = sys.argv[1]
pm2 = subprocess.check_output(["bash","-lc","command -v pm2 || ls /root/.nvm/versions/node/*/bin/pm2 | head -1"],text=True).strip()
apps = json.loads(subprocess.check_output([pm2,"jlist"],text=True))
por_nome = {a["name"]: a for a in apps}

if app not in por_nome or app+"-b" not in por_nome:
    print("faltando A ou B para", app); sys.exit(1)

IGNORAR = {"PWD","OLDPWD","_","SHLVL","unique_id","PM2_HOME","PM2_JSON_PROCESSING",
           "pm_id","name","status","NODE_APP_INSTANCE","INIT_CWD"}

def entrada(nome):
    e = por_nome[nome]["pm2_env"]
    env = {k: v for k, v in e.items()
           if k.isupper() and k not in IGNORAR and isinstance(v,(str,int)) and len(str(v)) < 400}
    args = e.get("args") or []
    if isinstance(args, list):
        args = " ".join(str(x) for x in args)
    d = {
        "name": nome,
        "cwd": e.get("pm_cwd"),
        "script": e.get("pm_exec_path"),
        "args": args,
        "instances": 1,
        "exec_mode": "fork",
        "kill_timeout": 10000,
        "autorestart": True,
        "max_memory_restart": "700M",
        "env": env,
    }
    if e.get("exec_interpreter") and e["exec_interpreter"] != "node":
        d["interpreter"] = e["exec_interpreter"]
    return d

cfg = [entrada(app), entrada(app+"-b")]
dir_app = cfg[0]["cwd"]
destino = os.path.join(dir_app, "ecosystem.config.cjs")

cabecalho = """// PM2 - gerado a partir da configuracao que ja estava rodando, para que a
// instancia B efemera suba exatamente como sobe hoje.
//
// A instancia -b NAO deve ficar ligada fora do deploy: quem a sobe e a derruba
// e o ./deploy.sh deste mesmo diretorio. Ela existia 24h para cobrir poucos
// minutos de deploy e cobrava RAM o ano inteiro.

"""
with open(destino, "w", encoding="utf-8") as f:
    f.write(cabecalho + "module.exports = " + json.dumps({"apps": cfg}, indent=2, ensure_ascii=False) + "\n")
print("gerado:", destino)
for c in cfg:
    print("   ", c["name"], "->", c["script"], c["args"], "PORT=" + str(c["env"].get("PORT","")))
