# -*- coding: utf-8 -*-
import json, io

plano = {p["n"]: p for p in json.load(io.open("plano.json", encoding="utf-8"))}

IMAGENS = {
 "01": ("n01-sinais-recaida.webp", "Tima Miroshnichenko", "Pexels"),
 "02": ("n02-desintoxicacao-hospitalar.webp", "Andre", "Pexels"),
 "03": ("n03-uso-recreativo-dependencia.webp", "RDNE Stock project", "Pexels"),
 "04": ("n04-apoiar-familiar.webp", "RDNE Stock project", "Pexels"),
 "05": ("n05-pupila-dilatada.webp", "cocoparisienne", "Pixabay"),
 "06": ("n06-drogas-sinteticas-jovens.webp", "Towfiqu barbhuiya", "Pexels"),
 "07": ("n07-fe-recuperacao.webp", "Jeswin Thomas", "Pexels"),
 "08": ("n08-tratamento-real-alcoolismo.webp", "Simeon Stoilov", "Pexels"),
 "09": ("n09-confrontar-familiar.webp", "Julia M Cameron", "Pexels"),
 "10": ("n10-identificar-drogas-cheiro.webp", "Atlantic Ambience", "Pexels"),
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
