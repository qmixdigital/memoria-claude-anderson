# -*- coding: utf-8 -*-
"""Gera capturas desktop, escuro, tablet (iframe 820) e celular (iframe 390) de um relatorio.
Uso: python shots.py RELATORIO.html PREFIXO"""
import sys, os, subprocess
from PIL import Image
SC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tmp"); os.makedirs(SC, exist_ok=True)
C = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
rel, pre = sys.argv[1], sys.argv[2]
h = open(rel, encoding="utf-8").read().replace("</style>", "#poda tbody tr:nth-child(n+4){display:none}</style>", 1)
open(os.path.join(SC, "tmp_p.html"), "w", encoding="utf-8").write(h)
open(os.path.join(SC, "tmp_pd.html"), "w", encoding="utf-8").write(h.replace('<html lang="pt-BR">', '<html lang="pt-BR" data-theme="dark">', 1))
for w, n in ((820, "tab"), (390, "mob")):
    open(os.path.join(SC, f"tmp_{n}.html"), "w", encoding="utf-8").write(
        f'<!doctype html><html><body style="margin:0;background:#888"><iframe src="tmp_p.html" style="width:{w}px;height:4200px;border:0;display:block"></iframe></body></html>')

def shot(src, out, w, hh):
    subprocess.run([C, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={w},{hh}",
                    f"--screenshot={os.path.join(SC, out)}", "file:///" + os.path.join(SC, src).replace("\\", "/")],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)

shot("tmp_p.html", f"{pre}_desk.png", 1366, 2800)
shot("tmp_pd.html", f"{pre}_dark.png", 1366, 1500)
shot("tmp_tab.html", f"{pre}_tab.png", 900, 4200)
shot("tmp_mob.html", f"{pre}_mob.png", 600, 4200)
im = Image.open(os.path.join(SC, f"{pre}_desk.png")); im.crop((0, 0, 1366, 1400)).save(os.path.join(SC, f"{pre}_d1.png")); im.crop((0, 1400, 1366, 2800)).save(os.path.join(SC, f"{pre}_d2.png"))
im = Image.open(os.path.join(SC, f"{pre}_tab.png")); im.crop((0, 0, 840, 1500)).save(os.path.join(SC, f"{pre}_t1.png")); im.crop((0, 1500, 840, 3000)).save(os.path.join(SC, f"{pre}_t2.png"))
im = Image.open(os.path.join(SC, f"{pre}_mob.png")); im.crop((0, 0, 410, 1400)).save(os.path.join(SC, f"{pre}_m1.png")); im.crop((0, 1400, 410, 2800)).save(os.path.join(SC, f"{pre}_m2.png"))
print("shots ok")
