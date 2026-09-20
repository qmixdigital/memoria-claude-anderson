#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador de matéria (HTML) para link building.

Camada A: bloqueios (XX) - impedem a entrega.
Camada B: score de humanização 0 a 100, alvo mínimo 70.

Uso:
  python validador_materia.py artigo.html --links 1
  python validador_materia.py artigo.html --links 2 --titulo "Título aqui"

O título é lido de <h1> ou <title>; use --titulo se o HTML não tiver nenhum
(caso comum, porque no WordPress o título vai em campo separado).
"""
import argparse
import unicodedata
import re
import statistics
import sys
from html.parser import HTMLParser

# O console do Windows abre em cp1252 e quebra os acentos do relatório.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# ---------------------------------------------------------------- termos

TERMOS_PROIBIDOS = [
    "abordagem", "alavanc", "ecossistema", "soluç", "robusto", "insights",
    "stakeholders", "cada vez mais", "é fundamental", "e fundamental",
    "vale ressaltar", "nesse contexto", "no cenário atual", "no cenario atual",
    "no mundo atual", "descubra", "saiba mais", "clique aqui",
    "de forma eficaz", "de forma eficiente", "transformação digital",
    "transformacao digital", "proporcion", "potencializ",
    "desafios e oportunidades",
]

ABERTURAS_RUINS = ["você sabia", "voce sabia", "primeiramente", "em segundo lugar", "por fim"]


# ---------------------------------------------------------------- parser

class Artigo(HTMLParser):
    """Extrai parágrafos, headings, links e bullets preservando a ordem."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.paragrafos = []      # texto de cada <p>
        self.h1 = []
        self.h2 = []
        self.links = []           # (indice_paragrafo, href, ancora)
        self.bullets = 0
        self.rankings = 0  # <ol>: lista ordenada de ranking (featured snippet), no maximo uma
        self.title = []
        self._pilha = []
        self._buf = []
        self._link_buf = None
        self._link_href = None

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag in ("p", "h1", "h2", "h3", "title", "li"):
            self._pilha.append(tag)
            self._buf = []
        elif tag == "a":
            self._link_href = d.get("href", "")
            self._link_buf = []
        elif tag == "ul":
            self.bullets += 1
        elif tag == "ol":
            self.rankings += 1
        elif tag == "br":
            self._buf.append(" ")

    def handle_endtag(self, tag):
        if tag == "a":
            if self._link_href is not None:
                idx = len(self.paragrafos)  # paragrafo em construcao
                self.links.append((idx, self._link_href, "".join(self._link_buf or []).strip()))
            self._link_href = None
            self._link_buf = None
            return
        if not self._pilha or self._pilha[-1] != tag:
            return
        self._pilha.pop()
        texto = re.sub(r"\s+", " ", "".join(self._buf)).strip()
        self._buf = []
        if tag == "p":
            self.paragrafos.append(texto)
        elif tag == "h1":
            self.h1.append(texto)
        elif tag == "h2":
            self.h2.append(texto)
        elif tag == "title":
            self.title.append(texto)

    def handle_data(self, data):
        if self._link_buf is not None:
            self._link_buf.append(data)
        if self._pilha:
            self._buf.append(data)


# ---------------------------------------------------------------- utils

def palavras(texto):
    return re.findall(r"\b[\wÀ-ÿ%]+\b", texto, flags=re.UNICODE)


def frases(texto):
    partes = re.split(r"(?<=[.!?])\s+", texto)
    return [p.strip() for p in partes if len(palavras(p)) >= 3]


def primeira_palavra(s):
    p = palavras(s)
    return p[0].lower() if p else ""


# ---------------------------------------------------------------- camada A

def camada_a(art, corpo, titulo, n_links_esperado):
    bloqueios, avisos = [], []

    # título
    if not titulo:
        bloqueios.append("titulo ausente (use <h1>, <title> ou --titulo)")
    else:
        if len(titulo) > 70:
            bloqueios.append(f"titulo com {len(titulo)} caracteres (maximo 70): {titulo!r}")
        if "!" in titulo:
            bloqueios.append("titulo contem ponto de exclamacao")
        if re.search(r"\bgoogle\b", titulo, re.I):
            avisos.append("a palavra 'Google' aparece no titulo")
        for ruim in ("descubra", "saiba mais", "clique aqui"):
            if ruim in titulo.lower():
                bloqueios.append(f"titulo contem expressao proibida: {ruim!r}")

    # travessões
    for ch, nome in (("—", "travessao (em dash)"), ("–", "travessao (en dash)")):
        if ch in corpo or (titulo and ch in titulo):
            bloqueios.append(f"{nome} encontrado no texto")

    # termos proibidos
    baixo = corpo.lower()
    for termo in TERMOS_PROIBIDOS:
        for m in re.finditer(re.escape(termo), baixo):
            trecho = corpo[max(0, m.start() - 40):m.start() + len(termo) + 40].replace("\n", " ")
            if termo == "soluç" and "resoluç" in baixo[max(0, m.start() - 2):m.start() + 6]:
                avisos.append(f"'soluç' vindo de 'resolução' (trocar por 'qualidade de imagem' etc): ...{trecho}...")
            else:
                bloqueios.append(f"termo proibido {termo!r}: ...{trecho}...")

    for ab in ABERTURAS_RUINS:
        if baixo.startswith(ab) or f" {ab}" in baixo[:400]:
            avisos.append(f"abertura/estrutura desaconselhada: {ab!r}")

    # palavras
    n_pal = len(palavras(corpo))
    if n_pal < 1200:
        bloqueios.append(f"artigo com {n_pal} palavras (minimo 1200)")
    elif n_pal > 2500:
        avisos.append(f"artigo com {n_pal} palavras (acima de 2500 perde leitura)")

    # links
    n_links = len(art.links)
    if n_links_esperado is not None and n_links != n_links_esperado:
        bloqueios.append(f"{n_links} link(s) no texto, briefing pediu {n_links_esperado}")

    total_p = len(art.paragrafos)
    # Linha de fonte no fim ("Fonte: <a>Marca</a>"), pedida pelo Anderson em 14/09/2026:
    # e um credito, nao um link no corpo; nao conta como "link no ultimo paragrafo".
    ultimo_e_fonte = bool(total_p) and re.match(r"^\s*fonte\s*:", art.paragrafos[-1] or "", re.I) is not None
    for idx, href, ancora in art.links:
        if not ancora:
            bloqueios.append(f"link sem texto ancora: {href}")
        # Regra do Anderson (14/09/2026): o link do cliente vai na primeira mencao da marca,
        # inclusive no primeiro paragrafo. Deixa de ser bloqueio; fica so o registro.
        if idx == 0:
            avisos.append(f"link no primeiro paragrafo (permitido quando e a primeira mencao da marca): {ancora!r}")
        if total_p and idx >= total_p - 1 and not ultimo_e_fonte:
            bloqueios.append(f"link no ULTIMO paragrafo (proibido): {ancora!r}")
        if ultimo_e_fonte and total_p >= 2 and idx == total_p - 2:
            bloqueios.append(f"link no ultimo paragrafo de texto, antes da linha Fonte (proibido): {ancora!r}")
        # âncora não pode ser a frase inteira
        if idx < total_p:
            par = art.paragrafos[idx]
            if par and ancora and len(palavras(ancora)) >= max(8, int(0.6 * len(palavras(par)))):
                bloqueios.append(f"ancora longa demais, parece a frase inteira: {ancora!r}")

    posicoes = sorted({idx for idx, _, _ in art.links})
    for a, b in zip(posicoes, posicoes[1:]):
        if b - a < 3:
            bloqueios.append(f"links a {b - a} paragrafo(s) de distancia (minimo 3)")

    # bullets e headings
    if art.bullets:
        bloqueios.append(f"{art.bullets} lista(s) com bullets no corpo (proibido)")
    # <ol> e permitido uma vez, como resumo de ranking logo abaixo do H2 da lista
    # (CLAUDE.md global: lista ordenada para "melhores X", alvo de featured snippet)
    if art.rankings > 1:
        bloqueios.append(f"{art.rankings} listas ordenadas no corpo (maximo 1, o resumo do ranking)")
    if len(art.h2) < 4:
        avisos.append(f"apenas {len(art.h2)} H2 (recomendado 5 a 7)")

    return bloqueios, avisos, n_pal, n_links


# ---------------------------------------------------------------- camada C

def _sem_acento(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def camada_c(art, corpo, titulo, kw, resumo=None):
    """SEO on-page. Roda so quando --kw e passado. Devolve (bloqueios, linhas)."""
    bloqueios, linhas = [], []
    k = re.sub(r"\s+", " ", _sem_acento(kw)).strip()
    n_tokens = len(k.split())
    texto = re.sub(r"\s+", " ", _sem_acento(corpo))
    n_pal = len(palavras(corpo))

    def reg(nome, valor, ok, alvo):
        linhas.append((nome, valor, "ok" if ok else "ruim", alvo))
        return ok

    # 1. titulo
    if not reg("keyword no titulo", "sim" if k in _sem_acento(titulo) else "NAO",
               k in _sem_acento(titulo), "obrigatorio"):
        bloqueios.append(f"keyword {kw!r} ausente do titulo")

    # 2. primeiras 100 palavras
    inicio = " ".join(texto.split()[:100])
    if not reg("keyword nas 100 primeiras palavras", "sim" if k in inicio else "NAO",
               k in inicio, "obrigatorio"):
        bloqueios.append(f"keyword {kw!r} ausente das 100 primeiras palavras")

    # 3. em algum H2
    h2s = _sem_acento(" | ".join(art.h2))
    if not reg("keyword em algum H2", "sim" if k in h2s else "NAO", k in h2s, "obrigatorio"):
        bloqueios.append(f"keyword {kw!r} ausente de todos os H2")

    # 4. ocorrencias no corpo
    n = texto.count(k)
    dens = 100.0 * n * n_tokens / max(n_pal, 1)
    ok_n = 3 <= n <= 8
    reg("ocorrencias exatas no corpo", f"{n} ({dens:.2f}%)", ok_n, "3 a 8")
    if n < 3:
        bloqueios.append(f"keyword {kw!r} aparece {n}x no corpo (minimo 3)")
    elif n > 8:
        bloqueios.append(f"keyword {kw!r} aparece {n}x no corpo (maximo 8, evitar stuffing)")

    # 5. resumo / linha fina
    if resumo is not None:
        r = _sem_acento(resumo)
        if not reg("keyword no resumo/linha fina", "sim" if k in r else "NAO", k in r, "obrigatorio"):
            bloqueios.append(f"keyword {kw!r} ausente do resumo (vira a meta description)")

    # 6. nucleo semantico: cada palavra forte da kw precisa aparecer varias vezes
    fracas = {"para", "como", "pela", "pelo", "sem", "com", "que", "ele", "ela",
              "dos", "das", "uma", "num", "nos", "por", "sao", "seu", "sua"}
    fortes = [t for t in k.split() if len(t) > 3 and t not in fracas]
    faltando = [t for t in fortes if texto.count(t) < 3]
    reg("termos fortes da keyword (min 3x cada)",
        "ok" if not faltando else "faltam: " + ", ".join(faltando),
        not faltando, "todos")
    if faltando:
        bloqueios.append("termos da keyword pouco usados no texto: " + ", ".join(faltando))

    return bloqueios, linhas


# ---------------------------------------------------------------- camada B

def camada_b(art, corpo, kw=None):
    """10 métricas. Ruim tira 10, alerta tira 5. Alvo mínimo 70."""
    score = 100
    linhas = []

    def reg(nome, valor, estado, alvo):
        nonlocal score
        if estado == "ruim":
            score -= 10
        elif estado == "alerta":
            score -= 5
        linhas.append((nome, valor, estado, alvo))

    fr = frases(corpo)
    tam = [len(palavras(f)) for f in fr] or [0]
    pars = [p for p in art.paragrafos if palavras(p)]

    # 1. variedade de frases (CV >= 0.45) - estrutural
    cv = (statistics.pstdev(tam) / statistics.fmean(tam)) if len(tam) > 1 and statistics.fmean(tam) else 0
    reg("Variedade de frases (CV)", f"{cv:.2f}",
        "ok" if cv >= 0.45 else ("alerta" if cv >= 0.38 else "ruim"), ">= 0,45")

    # 2. abertura de parágrafos repetida (< 30%) - estrutural
    ini = [primeira_palavra(p) for p in pars]
    pct = (max([ini.count(x) for x in set(ini)], default=0) / len(ini) * 100) if ini else 0
    reg("Abertura de paragrafos repetida", f"{pct:.0f}%",
        "ok" if pct < 30 else ("alerta" if pct < 40 else "ruim"), "< 30%")

    # 3. diversidade lexical TTR em janelas de 100 (>= 0.60) - estrutural
    w = [p.lower() for p in palavras(corpo)]
    ttrs = [len(set(w[i:i + 100])) / len(w[i:i + 100])
            for i in range(0, max(1, len(w) - 99), 100) if len(w[i:i + 100]) >= 50]
    # Texto curto demais para janelas: mede no texto inteiro em vez de pontuar 0
    # (o tamanho minimo ja e bloqueio da Camada A).
    ttr = statistics.fmean(ttrs) if ttrs else (len(set(w)) / len(w) if w else 1.0)
    reg("Diversidade lexical (TTR)", f"{ttr:.2f}",
        "ok" if ttr >= 0.60 else ("alerta" if ttr >= 0.55 else "ruim"), ">= 0,60")

    # 4. estrutura consecutiva (máx 2 frases seguidas com mesma abertura) - estrutural
    pior, atual = 1, 1
    for a, b in zip(fr, fr[1:]):
        atual = atual + 1 if primeira_palavra(a) == primeira_palavra(b) else 1
        pior = max(pior, atual)
    reg("Frases consecutivas com mesma abertura", str(pior),
        "ok" if pior <= 2 else ("alerta" if pior == 3 else "ruim"), "max 2")

    # 5. variedade no tamanho dos parágrafos
    tp = [len(palavras(p)) for p in pars] or [0]
    cvp = (statistics.pstdev(tp) / statistics.fmean(tp)) if len(tp) > 1 and statistics.fmean(tp) else 0
    reg("Variedade de paragrafos (CV)", f"{cvp:.2f}",
        "ok" if cvp >= 0.35 else ("alerta" if cvp >= 0.28 else "ruim"), ">= 0,35")

    # 6. frases muito longas (>45 palavras)
    longas = sum(1 for t in tam if t > 45)
    reg("Frases acima de 45 palavras", str(longas),
        "ok" if longas == 0 else ("alerta" if longas <= 2 else "ruim"), "0")

    # 7. parágrafos longos demais (>6 linhas ~ 110 palavras)
    pl = sum(1 for t in tp if t > 110)
    reg("Paragrafos acima de 110 palavras", str(pl),
        "ok" if pl == 0 else ("alerta" if pl <= 2 else "ruim"), "0")

    # 8. conectores de IA repetidos
    con = ["além disso", "alem disso", "por outro lado", "dessa forma", "assim sendo",
           "portanto", "no entanto", "entretanto"]
    baixo = corpo.lower()
    tot_con = sum(baixo.count(c) for c in con)
    dens = tot_con / max(1, len(pars))
    reg("Conectores formais por paragrafo", f"{dens:.2f}",
        "ok" if dens <= 0.5 else ("alerta" if dens <= 0.8 else "ruim"), "<= 0,50")

    # 9. repetição de trigramas
    tri = [" ".join(w[i:i + 3]) for i in range(len(w) - 2)]
    # trigramas que fazem parte da keyword nao contam: repetir a palavra-chave
    # e exigencia de SEO (camada C) e nao vicio de escrita.
    if kw:
        kwn = _sem_acento(kw)
        tri = [t for t in tri if _sem_acento(t) not in kwn]
    rep = sum(1 for t in set(tri) if tri.count(t) >= 3) if len(tri) < 6000 else 0
    reg("Trigramas repetidos 3x ou mais", str(rep),
        "ok" if rep <= 2 else ("alerta" if rep <= 5 else "ruim"), "<= 2")

    # 10. perguntas retóricas
    perg = corpo.count("?")
    reg("Perguntas no corpo", str(perg),
        "ok" if perg <= 2 else ("alerta" if perg <= 4 else "ruim"), "<= 2")

    return max(0, score), linhas


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("arquivo")
    ap.add_argument("--links", type=int, default=None)
    ap.add_argument("--titulo", default=None)
    ap.add_argument("--kw", default=None, help="palavra-chave principal; liga a Camada C de SEO")
    ap.add_argument("--resumo", default=None, help="linha fina/excerpt, para conferir a keyword na meta")
    a = ap.parse_args()

    html = open(a.arquivo, encoding="utf-8").read()
    art = Artigo()
    art.feed(html)

    titulo = a.titulo or (art.h1[0] if art.h1 else (art.title[0] if art.title else ""))
    corpo = "\n\n".join(art.paragrafos + art.h2)

    bloqueios, avisos, n_pal, n_links = camada_a(art, corpo, titulo, a.links)
    score, metricas = camada_b(art, corpo, a.kw)
    bloq_seo, seo = ([], [])
    if a.kw:
        bloq_seo, seo = camada_c(art, corpo, titulo, a.kw, a.resumo)
        bloqueios = bloqueios + bloq_seo

    print("=" * 66)
    print(f"ARQUIVO : {a.arquivo}")
    print(f"TITULO  : {titulo}  ({len(titulo)} caracteres)")
    print(f"PALAVRAS: {n_pal}   H2: {len(art.h2)}   LINKS: {n_links}")
    print("=" * 66)

    print("\n-- CAMADA A: bloqueios --")
    if bloqueios:
        for b in bloqueios:
            print(f"  XX {b}")
    else:
        print("  ok  nenhum bloqueio")

    if avisos:
        print("\n-- avisos (nao bloqueiam) --")
        for v in avisos:
            print(f"  !  {v}")

    if art.links:
        print("\n-- ancoras --")
        for idx, href, anc in art.links:
            print(f"  paragrafo {idx + 1}: {anc!r} -> {href}")

    print(f"\n-- CAMADA B: humanizacao {score}/100 (alvo minimo 70) --")
    for nome, valor, estado, alvo in metricas:
        marca = {"ok": "ok ", "alerta": " ! ", "ruim": "XX "}[estado]
        print(f"  {marca} {nome}: {valor}   (alvo {alvo})")

    if a.kw:
        print(f"\n-- CAMADA C: SEO on-page (keyword: {a.kw!r}) --")
        for nome, valor, estado, alvo_ in seo:
            marca = {"ok": "ok ", "alerta": " ! ", "ruim": "XX "}[estado]
            print(f"  {marca} {nome}: {valor}   (alvo {alvo_})")
    else:
        print("\n-- CAMADA C: SEO NAO verificada (rode com --kw palavra-chave) --")

    print("\n" + "=" * 66)
    if bloqueios:
        print("RESULTADO: REPROVADO - corrija os bloqueios e revalide.")
        sys.exit(1)
    if score < 70:
        print(f"RESULTADO: REPROVADO - humanizacao {score}/100. Reescreva de verdade os pontos XX.")
        sys.exit(2)
    print(f"RESULTADO: APROVADO - 0 bloqueios, humanizacao {score}/100.")


if __name__ == "__main__":
    main()
