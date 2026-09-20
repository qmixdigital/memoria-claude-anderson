# -*- coding: utf-8 -*-
"""Passo 7 da skill: plano de conteudo a partir do que o Google ja associou a cada pagina.

Cruza as consultas do Search Console (query + page) com o TEXTO da pagina e separa:
  - EXPANDIR: consulta com impressao cujo termo nao esta na pagina -> H2, paragrafo ou FAQ
  - REFORCAR: todas as palavras estao na pagina, mas nao a frase exata -> ajustar uma frase
  - CRIAR: consulta com intencao propria (modificador forte) -> candidata a pagina nova, conferir SERP
  - CTR: posicao 1 a 10 com CTR abaixo do esperado -> reescrever title e frase-resposta

Uso:
    python revisita.py <dominio> [--url URL] [--dias 90] [--min-imp 3] [--top 30] [--md saida.md]

Sem --url, roda em todas as paginas do dominio com impressao (limitado por --top paginas).
Com --url, so naquela pagina. Aceita varias --url.

A regra "mesma SERP = expandir, SERP diferente = criar" nao da para automatizar sem
consultar o Google; o script marca CRIAR por heuristica (modificador de intencao) e o
analista confirma na SERP antes de abrir pagina.
"""
import sys, re, io, argparse, unicodedata, urllib.request, ssl, html as htmlmod
from collections import defaultdict

sys.path.insert(0, __file__.rsplit("\\", 1)[0] if "\\" in __file__ else ".")
from gsc_api import sessao_para, consultar

CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"}

# CTR esperado por posicao (media de mercado, generosa para baixo; serve so para ordenar)
CTR_ESPERADO = {1: 0.25, 2: 0.14, 3: 0.09, 4: 0.06, 5: 0.045, 6: 0.035, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018}

# palavras que, presentes na consulta e ausentes da pagina, sugerem intencao propria
# so os que costumam mudar a SERP; "gratis", "melhor", "online" ficam na mesma intencao
MODIFICADORES = {"preco", "valor", "quanto custa", "como fazer", "onde", "perto de mim", "curso", "pdf",
                 "modelo", "exemplo", "vs", "diferenca", "significado", "o que e", "para que serve",
                 "vale a pena", "reclamacao", "telefone", "endereco", "horario", "e confiavel", "e seguro"}
FRACAS = {"de", "da", "do", "das", "dos", "a", "o", "as", "os", "e", "em", "no", "na", "nos", "nas",
          "um", "uma", "para", "pra", "por", "com", "sem", "que", "se", "ao", "à", "é", "eh"}


def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", t)).strip()


def texto_da_pagina(url):
    try:
        h = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45, context=CTX).read().decode("utf-8", "replace")
    except Exception as e:
        return None, None, str(e)
    title = re.search(r"<title>(.*?)</title>", h, re.S)
    title = htmlmod.unescape(title.group(1)).strip() if title else ""
    corpo = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", " ", h)
    corpo = re.sub(r"<[^>]+>", " ", corpo)
    return norm(htmlmod.unescape(corpo)), title, None


def classificar(q, texto):
    qn = norm(q)
    if qn in texto:
        return "COBRE"
    # grafia diferente da pagina (qrcode x qr code, wifi x wi-fi): vale escrever uma vez como o usuario digita
    if qn.replace(" ", "") in texto.replace(" ", ""):
        return "GRAFIA"
    palavras = [p for p in qn.split() if p not in FRACAS]
    faltam = [p for p in palavras if p not in texto]
    if not faltam:
        return "REFORCAR"
    if any(m in qn for m in MODIFICADORES) and len(palavras) >= 3:
        return "CRIAR?"
    return "EXPANDIR"


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("dominio")
    ap.add_argument("--url", action="append", default=[])
    ap.add_argument("--dias", type=int, default=90)
    ap.add_argument("--min-imp", type=int, default=3)
    ap.add_argument("--top", type=int, default=30)
    ap.add_argument("--md", default=None)
    a = ap.parse_args()

    s, prop = sessao_para(a.dominio)
    if not s:
        print("nenhuma chave tem acesso a", a.dominio); sys.exit(1)
    linhas = consultar(s, prop, ["query", "page"], a.dias)
    por_pagina = defaultdict(list)
    for r in linhas:
        q, p = r["keys"]
        if q.startswith("site:") or q.startswith("http"):
            continue
        por_pagina[p].append((q, r["impressions"], r["clicks"], r["position"]))
    paginas = a.url or [p for p, _ in sorted(por_pagina.items(), key=lambda kv: -sum(x[1] for x in kv[1]))[:a.top]]

    out = ["# Revisita GSC: %s (%d dias, propriedade %s)\n" % (a.dominio, a.dias, prop)]
    for p in paginas:
        qs = [x for x in por_pagina.get(p, []) if x[1] >= a.min_imp]
        if not qs and p not in por_pagina:
            out.append("## %s\n\nsem consulta no periodo\n" % p); continue
        texto, title, erro = texto_da_pagina(p)
        out.append("## %s\n" % p)
        if erro:
            out.append("nao foi possivel ler a pagina: %s\n" % erro); continue
        out.append("title: %s  \nconsultas com impressao: %d (%d imp, %d cliques)\n" % (
            title, len(por_pagina[p]), sum(x[1] for x in por_pagina[p]), sum(x[2] for x in por_pagina[p])))
        grupos = defaultdict(list)
        for q, imp, clk, pos in qs:
            grupos[classificar(q, texto)].append((q, imp, clk, pos))
        for nome, titulo in (("EXPANDIR", "Expandir a pagina (termo ausente do texto)"),
                             ("REFORCAR", "Reforcar (palavras presentes, frase exata ausente)"),
                             ("GRAFIA", "Grafia do usuario ausente (qrcode, wifi): escrever uma vez assim"),
                             ("CRIAR?", "Candidatas a pagina nova (conferir SERP antes)")):
            if grupos.get(nome):
                out.append("\n### %s\n\n| Consulta | Imp | Cliques | Pos |\n|---|---|---|---|" % titulo)
                for q, imp, clk, pos in sorted(grupos[nome], key=lambda x: -x[1]):
                    out.append("| %s | %d | %d | %.1f |" % (q, imp, clk, pos))
        ctr = [(q, imp, clk, pos) for q, imp, clk, pos in por_pagina[p]
               if pos <= 10.4 and imp >= max(a.min_imp, 10) and (clk / imp) < CTR_ESPERADO[max(1, round(pos))] * 0.5]
        if ctr:
            out.append("\n### CTR abaixo do esperado para a posicao (reescrever title e frase-resposta)\n\n| Consulta | Imp | CTR | Pos | esperado |\n|---|---|---|---|---|")
            for q, imp, clk, pos in sorted(ctr, key=lambda x: -x[1]):
                out.append("| %s | %d | %.1f%% | %.1f | %.0f%% |" % (q, imp, 100 * clk / imp, pos, 100 * CTR_ESPERADO[max(1, round(pos))]))
        cobre = len(grupos.get("COBRE", []))
        out.append("\nja cobertas na forma exata: %d\n" % cobre)
    txt = "\n".join(out)
    if a.md:
        io.open(a.md, "w", encoding="utf-8").write(txt); print("gravado em", a.md)
    else:
        print(txt)


if __name__ == "__main__":
    main()
