# -*- coding: utf-8 -*-
import json, io

plano = {p["n"]: p for p in json.load(io.open("plano.json", encoding="utf-8"))}

IMAGENS = {
 "01": ("n01-documentos-certificado-digital.webp", "Cytonn Photography", "Pexels"),
 "02": ("n02-validade-certificado-digital.webp", "Aleksander Dumała", "Pexels"),
 "03": ("n03-a1-ou-a3.webp", "Bennian", "Pixabay"),
 "04": ("n04-certificado-abrir-empresa.webp", "Ketut Subiyanto", "Pexels"),
 "05": ("n05-assinatura-eletronica-peticoes.webp", "Pavel Danilyuk", "Pexels"),
 "06": ("n06-procuracao-eletronica-advogados.webp", "Sora Shimazaki", "Pexels"),
 "07": ("n07-certificado-esocial.webp", "Mikhail Nilov", "Pexels"),
 "08": ("n08-erro-navegador-chrome.webp", "Kampus Production", "Pexels"),
 "09": ("n09-documentos-cnpj-digital.webp", "Kampus Production", "Pexels"),
 "10": ("n10-certificado-vencido.webp", "RDNE Stock project", "Pexels"),
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
