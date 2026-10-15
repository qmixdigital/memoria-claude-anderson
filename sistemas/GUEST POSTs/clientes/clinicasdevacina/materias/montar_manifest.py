# -*- coding: utf-8 -*-
import json, io

plano = {p["n"]: p for p in json.load(io.open("plano.json", encoding="utf-8"))}

IMAGENS = {
 "01": ("n01-reacao-alergica-vacina.webp", "CDC", "Pexels"),
 "02": ("n02-vacina-matricula-escolar.webp", "Yan Krukau", "Pexels"),
 "03": ("n03-vacina-gripe-quando-tomar.webp", "Nataliya Vaitkevich", "Pexels"),
 "04": ("n04-calendario-vacinal-idoso.webp", "Kampus Production", "Pexels"),
 "05": ("n05-vacina-gravidez.webp", "MART PRODUCTION", "Pexels"),
 "06": ("n06-vacina-cartao-perdido.webp", "Ketut Subiyanto", "Pexels"),
 "07": ("n07-carteira-vacinacao-digital.webp", "Leeloo The First", "Pexels"),
 "08": ("n08-vacina-febre-amarela-viagem.webp", "Nataliya Vaitkevich", "Pexels"),
 "09": ("n09-reforco-vacinal-adultos.webp", "Gustavo Fring", "Pexels"),
 "10": ("n10-vacina-fora-do-prazo.webp", "Fauzan Fitria", "Pexels"),
}

manifest = []
for n in ["01","02","03","04","05","06","07","08","09","10"]:
    meta = json.load(io.open(f"n{n}.meta.json", encoding="utf-8"))
    img, autor, fonte = IMAGENS[n]
    html = io.open(f"n{n}.final.html", encoding="utf-8").read()
    p = plano[n]
    manifest.append({
        "n": n,
        "site": p["portal"],
        "titulo": meta["titulo"],
        "resumo": meta["resumo"],
        "slug": meta["slug"],
        "kw": meta["kw"],
        "html": html,
        "img": img,
        "alt": meta["titulo"],
        "autor": autor,
        "fonte": fonte,
        "ancora": p["ancora"],
        "destino": p["destino_url"],
    })

io.open("manifest.json", "w", encoding="utf-8").write(json.dumps(manifest, ensure_ascii=False, indent=1))
print("manifest.json pronto,", len(manifest), "itens")
