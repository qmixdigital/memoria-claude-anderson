# -*- coding: utf-8 -*-
import json, io, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8")
BI = r"C:\Users\User\.claude\skills\guest-post-rede\scripts\banco_img.py"
OUT = "D:/SISTEMAS/GUEST POSTs/clientes/calistenia/materias"
plano = {m["n"]: m for m in json.load(open("plano-cal.json", encoding="utf-8"))}
S = {
 "C14": ("pexels:13993540", "calisthenics handstand outdoor bar", "Homem fazendo parada de mão em uma barra ao ar livre, ilustrando o street workout para iniciantes", "Pexels"),
 "C02": ("pexels:21327105", "empty football pitch grass lines", "Canto de um campo de futebol com gramado verde e linhas brancas, ilustrando treino de força para quem joga futebol", "Pexels"),
}
for n, (iid, termo, alt, fonte) in S.items():
    s = plano[n]["slug"]
    r = subprocess.run(["python", BI, "pegar", "--termo", termo, "--slug", s, "--saida", OUT, "--id", iid], capture_output=True, text=True, encoding="utf-8", errors="replace")
    raw = r.stdout
    try:
        d = json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
    except Exception as e:
        print(n, "ERRO", r.stdout[-300:], r.stderr[-300:]); continue
    d["arquivo_local"] = "./" + s + ".webp"
    io.open(s + ".ficha.json", "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=1))
    j = json.load(open(s + ".json", encoding="utf-8"))
    j["imagem_alt"] = alt; j["imagem_fonte"] = fonte; j["imagem_fonte_url"] = d.get("pagina_url")
    io.open(s + ".json", "w", encoding="utf-8").write(json.dumps(j, ensure_ascii=False, indent=1))
    print(n, d.get("id"), d.get("autor"))
