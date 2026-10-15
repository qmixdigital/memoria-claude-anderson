# -*- coding: utf-8 -*-
import json, subprocess

NLINKS = {"01": 2, "02": 2, "03": 3, "04": 3, "05": 3, "06": 1, "07": 3, "08": 3, "09": 2, "10": 2}
VALIDADOR = r"C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py"

for n in ["01","02","03","04","05","06","07","08","09","10"]:
    meta = json.load(open(f"n{n}.meta.json", encoding="utf-8"))
    cmd = ["python", VALIDADOR, f"n{n}.final.html", "--links", str(NLINKS[n]),
           "--titulo", meta["titulo"], "--kw", meta["kw"], "--resumo", meta["resumo"]]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    out = r.stdout + r.stderr
    aprovado = "RESULTADO: APROVADO" in out
    print(f"=== n{n}: {'APROVADO' if aprovado else 'REPROVADO'} ===")
    if not aprovado:
        for line in out.splitlines():
            if "XX" in line or "RESULTADO" in line:
                print("  ", line.strip())
