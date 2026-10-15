# -*- coding: utf-8 -*-
import json, io

plano = {p["n"]: p for p in json.load(io.open("plano.json", encoding="utf-8"))}

IMAGENS = {
 "01": ("n01-terra-devoluta.webp", "Vitor Diniz", "Pexels"),
 "02": ("n02-usucapiao-rural.webp", "Sergej", "Pexels"),
 "03": ("n03-posse-x-propriedade.webp", "Thirdman", "Pexels"),
 "04": ("n04-ccir-para-que-serve.webp", "Артем Дворецкий", "Pexels"),
 "05": ("n05-conflito-posse-terra.webp", "Sora Shimazaki", "Pexels"),
 "06": ("n06-modulo-fiscal.webp", "Артем Дворецкий", "Pexels"),
 "07": ("n07-cadeia-dominial.webp", "Donatello Trisolino", "Pexels"),
 "08": ("n08-car-x-ccir.webp", "Magda Ehlers", "Pexels"),
 "09": ("n09-comprovar-propriedade.webp", "Marcos Caio C. Gomes", "Pexels"),
 "10": ("n10-averbacao-imovel-rural.webp", "Yoav Franco", "Pexels"),
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
