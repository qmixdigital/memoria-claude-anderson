# -*- coding: utf-8 -*-
import json, io

plano = {p["n"]: p for p in json.load(io.open("plano.json", encoding="utf-8"))}

IMAGENS = {
 "01": ("n01-fisioterapia-em-casa.webp", "Gustavo Fring", "Pexels"),
 "02": ("n02-recuperacao-pos-cirurgica.webp", "Yan Krukau", "Pexels"),
 "03": ("n03-dor-lombar-cronica.webp", "guvo59", "Pixabay"),
 "04": ("n04-fisioterapia-respiratoria.webp", "Anastasia Shuraeva", "Pexels"),
 "05": ("n05-fisioterapia-idosos.webp", "Yan Krukau", "Pexels"),
 "06": ("n06-fisioterapia-nao-funciona.webp", "Yan Krukau", "Pexels"),
 "07": ("n07-fisioterapia-vs-pilates.webp", "Ahmet Kurt", "Pexels"),
 "08": ("n08-fisioterapia-esportiva.webp", "Ollie Craig", "Pexels"),
 "09": ("n09-fisioterapia-neurologica.webp", "KoolShooters", "Pexels"),
 "10": ("n10-quando-procurar-fisioterapeuta.webp", "Thirdman", "Pexels"),
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
