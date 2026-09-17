# -*- coding: utf-8 -*-
"""
KWs - Keyword Opportunity Finder
=================================
Analisa exports de SEO (Semrush, Google Search Console, Ahrefs ou qualquer
arquivo que contenha URL + palavra-chave) e encontra oportunidades de artigos.

Saida: output/oportunidades.csv
  Coluna A = Palavra-chave (alvo do artigo)
  Coluna B = Titulo SEO (60-65 caracteres, pronto para escrever)
  Coluna C = Acao -> "Fazer artigo novo" ou "Melhorar o conteudo"

Uso:
  1. Jogue um ou mais arquivos (.csv / .tsv / .xlsx) na pasta input/
  2. Rode:  python find_opportunities.py
  3. Abra:  output/oportunidades.csv
"""

import csv
import os
import re
import sys
import glob
import unicodedata

# =====================================================================
# CONFIGURACAO  (edite aqui)
# =====================================================================
INPUT_DIR   = "input"
# Sugestoes de keywords SEM URL (Ubersuggest, Keyword Magic, etc.). Viram
# candidatos a "artigo novo" -- so entram se nao canibalizarem o que ja existe.
SUGGEST_DIR = os.path.join("input", "sugestoes")
# Inclusao FORCADA: keywords a entrar como "artigo novo" sem passar pelos
# filtros de tema/volume (inclusao manual/curada, ex.: lote de keywords faceis).
FORCE_DIR = os.path.join("input", "forcar")
# Concorrentes pesquisados na web (keyword -> lista de URLs). Opcional: se o
# arquivo existir, a coluna "Concorrentes" e preenchida.
COMPETITORS_JSON = "competidores.json"
# A saida e salva no Desktop como "{dominio} oportunidades de artigos.xlsx".
# O dominio e extraido automaticamente das URLs do arquivo.
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Desktop")

MIN_VOLUME   = 200    # volume de busca minimo
MAX_KD       = 35     # dificuldade maxima (Keyword Difficulty). Ignora se faltar.
POS_MIN      = 4      # posicao minima da faixa "striking distance"
POS_MAX      = 70     # posicao maxima da faixa (portais da rede ranqueiam fundo)
POSITIONED_MAX = 10   # pos <= isto = keyword JA POSICIONADA (pagina 1).
                      # Regra anti-canibalizacao: nunca sugerir artigo novo para
                      # um tema que ja tem pagina posicionada -> vira "melhorar".
SLUG_MATCH   = 0.50   # >= deste % de match keyword<->slug = artigo dedicado existe
TITLE_MAX    = 65     # tamanho maximo do titulo SEO
TITLE_MIN    = 50     # tamanho alvo minimo do titulo SEO
INCLUDE_CONTEXT = False  # True -> adiciona colunas D+ com volume/posicao/url/kd
# --- Sugestoes (input/sugestoes/, ex. broad-match) ---
MIN_BIGRAM_FREQ = 2   # bigrama (par de palavras) precisa aparecer >= isto no
                      # site para a sugestao ser considerada do tema (anti-ruido)
MAX_SUGGESTIONS = 150  # teto de sugestoes na planilha (top por score). 0 = sem teto
# Ruido de broad-match: termos que compartilham vocabulario com o site mas tem
# intencao TOTALMENTE diferente (ex.: "sonho" de bombom/praia/peca de teatro,
# nao interpretacao de sonhos). Sugestao cujo texto contem um destes e descartada.
SUGGEST_BLOCKLIST = [
    "sonho de valsa", "praia do sonho", "praia dos sonhos",
    "sonho de uma noite", "loteria dos sonhos", "liso dos sonhos",
    "filtro dos sonhos", "cidade dos sonhos", "sonhos roubados",
]
# Termos a NUNCA virar artigo (brand safety / conteudo adulto / explicito).
# Aplica a TODAS as oportunidades (nao so sugestoes).
OPPORTUNITY_BLOCKLIST = [
    "fazendo sexo", "camarote da sapuca", "video de casal", "nudes", "porno",
]

# =====================================================================
# Aliases de cabecalho (Semrush / GSC / Ahrefs / generico)
# =====================================================================
COLMAP = {
    "keyword":  ["keyword", "keywords", "query", "consulta", "palavra-chave",
                 "palavra chave", "termo", "search term"],
    "url":      ["url", "page", "pagina", "landing page", "address",
                 "current url", "top page", "current url inside", "endereco"],
    "position": ["position", "posicao", "current position", "avg position",
                 "average position", "posicao media", "pos", "rank"],
    "volume":   ["search volume", "volume", "search vol", "vol",
                 "volume de buscas", "volume de busca", "search volume (br)",
                 "impressions", "impressoes", "impressões"],
    "kd":       ["keyword difficulty", "kd", "difficulty", "dificuldade",
                 "seo difficulty", "dificuldade seo"],
    "intent":   ["keyword intents", "intents", "intent", "intencao",
                 "intencao de busca", "search intent"],
}

STOP = set("de do da dos das e o a os as em no na nos nas para com por que é "
           "um uma ao à aos às qual quais o que".split())

# Pequenas palavras que ficam minusculas no title case (exceto primeira)
SMALL = set("de do da dos das e o a os as em no na nos nas para com por que é "
            "um uma ao à aos às a o".split())


# ---------------------------------------------------------------------
# Utilitarios de texto
# ---------------------------------------------------------------------
def strip_accents(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


def norm_tokens(s):
    """Tokens minusculos, sem acento, so alfanumerico."""
    return re.findall(r"[a-z0-9]+", strip_accents(s).lower())


def stem(tok):
    """Stemming bem leve para portugues: remove plural simples."""
    if len(tok) > 3 and tok.endswith("s"):
        return tok[:-1]
    return tok


# Tokens que nao definem a INTENCAO (formas de pergunta/variantes do verbo).
# Sem isso, "sonho com sapos" nao agrupa com "sonhar com sapo" e
# "o que significa sonhar com X" vira artigo separado -> canibalizacao.
FILLER = {"significa", "significado", "oque", "isso", "qual", "quais"}


def content_tokens(s):
    """Tokens de conteudo (sem stopwords/filler), com stemming e normalizacao
    de variantes que nao mudam a intencao de busca (evita canibalizacao).
    Qualquer conjugacao do verbo sonhar (sonho/sonha/sonhamos/sonhei...) e o
    substantivo sonho viram um unico token 'sonhar'."""
    out = set()
    for t in norm_tokens(s):
        if t in STOP:
            continue
        # mantem numeros e codigos alfanumericos (omega 3, 4k, l5, s1, c5 da coluna)
        if len(t) <= 2 and not any(c.isdigit() for c in t):
            continue
        t = stem(t)
        if t in FILLER:
            continue
        if t.startswith("sonh"):
            t = "sonhar"
        if t == "paise":                      # plural irregular paises -> pais
            t = "pais"
        out.add(t)
    return out


def slug_of(url):
    if not url:
        return ""
    seg = url.rstrip("/").split("/")[-1]
    return seg


def slug_tokens(url):
    seg = slug_of(url)
    out = set()
    for t in norm_tokens(seg):
        if t in STOP:
            continue
        if len(t) <= 2 and not any(c.isdigit() for c in t):
            continue
        t = stem(t)
        out.add("pais" if t == "paise" else t)
    return out


def domain_of(records):
    """Dominio mais comum entre as URLs (sem www)."""
    import collections
    hosts = collections.Counter()
    for r in records:
        m = re.search(r"https?://([^/]+)", r.get("url", "") or "")
        if m:
            host = m.group(1).lower()
            if host.startswith("www."):
                host = host[4:]
            hosts[host] += 1
    if not hosts:
        return "site"
    return hosts.most_common(1)[0][0]


def to_int(x):
    """Converte numeros em formato pt-BR para int.
    Aceita "9900", "110.000" (=110000), "6.600" (=6600), "6,1milhoes",
    "1,2 mil", "R$ 4,81". Ponto = milhar, virgula = decimal.
    """
    if x is None:
        return None
    s = str(x).strip().lower()
    if not s or s == "null":
        return None
    mult = 1
    if "milh" in s:                       # milhao / milhoes / milhões
        mult = 1_000_000
    elif re.search(r"\bmil\b", s) or s.endswith("mil"):
        mult = 1000
    m = re.search(r"\d[\d.,]*", s)
    if not m:
        return None
    num = m.group().replace(".", "").replace(",", ".")  # pt-BR -> float
    try:
        return int(round(float(num) * mult))
    except ValueError:
        return None


# ---------------------------------------------------------------------
# Leitura robusta de arquivos
# ---------------------------------------------------------------------
def detect_encoding(path):
    raw = open(path, "rb").read()
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            raw.decode(enc)
            return enc
        except UnicodeDecodeError:
            continue
    return "latin-1"  # nunca falha


def detect_delimiter(sample):
    counts = {d: sample.count(d) for d in (",", ";", "\t", "|")}
    return max(counts, key=counts.get)


def read_table(path):
    """Retorna (headers, list_of_dicts). Suporta csv/tsv e xlsx (se openpyxl)."""
    ext = os.path.splitext(path)[1].lower()
    if ext in (".xlsx", ".xlsm"):
        return read_xlsx(path)
    enc = detect_encoding(path)
    with open(path, encoding=enc, newline="") as fh:
        first = fh.readline()
        delim = detect_delimiter(first)
        fh.seek(0)
        reader = csv.reader(fh, delimiter=delim)
        rows = list(reader)
    if not rows:
        return [], []
    headers = rows[0]
    out = [dict(zip(headers, r)) for r in rows[1:] if any(c.strip() for c in r)]
    return headers, out


def read_xlsx(path):
    try:
        import openpyxl
    except ImportError:
        print("  [aviso] openpyxl nao instalado; pulando %s (pip install openpyxl)"
              % os.path.basename(path))
        return [], []
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    data = [[("" if c is None else str(c)) for c in row]
            for row in ws.iter_rows(values_only=True)]
    if not data:
        return [], []
    headers = data[0]
    out = [dict(zip(headers, r)) for r in data[1:] if any(str(c).strip() for c in r)]
    return headers, out


def build_colmap(headers):
    """Mapeia cabecalhos reais -> campos internos."""
    norm = {h: strip_accents(h).strip().lower() for h in headers}
    found = {}
    for field, aliases in COLMAP.items():
        for h, hn in norm.items():
            if hn in aliases:
                found[field] = h
                break
    return found


# ---------------------------------------------------------------------
# Geracao de titulo SEO
# ---------------------------------------------------------------------
SPECIAL = {
    "iptv": "IPTV", "rg": "RG", "cpf": "CPF", "cnpj": "CNPJ", "cnh": "CNH",
    "tiktok": "TikTok", "whatsapp": "WhatsApp", "youtube": "YouTube",
    "instagram": "Instagram", "facebook": "Facebook", "url": "URL",
    "cm": "cm", "mm": "mm", "kg": "kg", "km": "km", "tv": "TV",
}


def title_case_pt(s):
    words = s.split()
    out = []
    for i, w in enumerate(words):
        wl = strip_accents(w).lower()
        if wl in SPECIAL:
            out.append(SPECIAL[wl])
        elif w.isupper() and len(w) <= 4:    # siglas (RG, CPF)
            out.append(w)
        elif i != 0 and wl in SMALL:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    return " ".join(out)


def strip_lead_questions(kw):
    """Remove prefixos de pergunta para extrair o topico."""
    s = kw.strip()
    leads = ["o que sao", "o que e", "oque e", "oque", "o que", "qual a", "qual o",
             "qual e", "quais sao", "quantas", "quantos", "quanto", "como",
             "onde", "quando", "significado de", "significado do", "significa"]
    sl = strip_accents(s).lower()
    for lead in leads:
        if sl.startswith(lead + " "):
            return s[len(lead) + 1:].strip()
    return s


def detect_intent(kw):
    s = strip_accents(kw).lower()
    if re.search(r"\b(frases?|mensagens?|mensagem)\b", s):
        return "frases"
    if s.startswith("como "):
        return "como"
    if re.search(r"\b(o que e|oque|significado|significa|o que sao)\b", s):
        return "oquee"
    if re.search(r"\b(quant\w*|tabela)\b", s):
        return "quant"
    if re.search(r"\b(tamanho|medidas?|dimens\w+)\b", s):
        return "medida"
    return "geral"


def fit_title(base, suffixes):
    """Escolhe o maior titulo <= TITLE_MAX combinando base + sufixo."""
    base = base.strip()
    candidates = []
    for suf in suffixes:
        t = base + suf
        if len(t) <= TITLE_MAX:
            candidates.append(t)
    if candidates:
        # prefere o mais proximo do limite (mais rico), respeitando o maximo
        return max(candidates, key=len)
    # nenhum sufixo coube -> usa base sozinha, truncada em fronteira de palavra
    if len(base) <= TITLE_MAX:
        return base
    cut = base[:TITLE_MAX]
    if " " in cut:
        cut = cut[:cut.rfind(" ")]
    return cut


# Os 25 bichos do jogo do bicho (para titulo no padrao vencedor do nicho)
ANIMAIS = set("avestruz aguia burro borboleta cachorro cabra carneiro camelo "
              "cobra coelho cavalo elefante galo gato jacare leao macaco porco "
              "pavao peru touro tigre urso veado vaca".split())


def make_title(kw):
    intent = detect_intent(kw)
    base_full = title_case_pt(kw)
    topic = title_case_pt(strip_lead_questions(kw))

    # Caso especial jogo do bicho + animal -> "{Animal} no Jogo do Bicho: ..."
    toks = norm_tokens(kw)
    if "jogo" in toks and "bicho" in toks:
        animal = next((t for t in toks if t in ANIMAIS), None)
        if animal:
            return fit_title(title_case_pt(animal) + " no Jogo do Bicho", [
                ": Tabela, Grupo e Dezenas da Sorte",
                ": Tabela, Grupo e Dezenas",
                ": Tabela e Grupo Completo",
                "",
            ])

    if intent == "frases":
        return fit_title(base_full, [
            " para Inspirar, Refletir e Compartilhar",
            " para Motivar e Inspirar",
            " para Compartilhar",
            ": Mensagens para Refletir",
            "",
        ])
    if intent == "como":
        return fit_title(base_full, [
            ": Guia Completo e Passo a Passo Atualizado",
            ": Guia Completo e Passo a Passo",
            ": Passo a Passo Atualizado",
            ": Guia Prático",
            "",
        ])
    if intent == "oquee":
        return fit_title(topic, [
            ": O Que É, Significado e Como Funciona",
            ": O Que É, Significado e Principais Dicas",
            ": O Que É e Como Identificar",
            ": Significado e Características",
            "",
        ])
    if intent == "quant":
        return fit_title(base_full, [
            ": Tabela Completa, Medidas e Quantidades",
            ": Tabela Completa e Quantidades",
            ": Veja a Tabela Completa",
            ": Tabela e Medidas",
            "",
        ])
    if intent == "medida":
        return fit_title(base_full, [
            ": Tamanho e Medidas Oficiais Atualizadas",
            ": Medidas e Tamanho Oficial",
            ": Tamanho e Dimensões",
            "",
        ])
    return fit_title(base_full, [
        ": Guia Completo, Dicas e Informações Úteis",
        ": Guia Completo, Dicas e Informações",
        ": Tudo o Que Você Precisa Saber",
        ": Guia Completo Atualizado",
        "",
    ])


# ---------------------------------------------------------------------
# Motor de oportunidades
# ---------------------------------------------------------------------
def parse_rows(records, cmap):
    """Normaliza registros brutos -> dicts internos filtrados pela faixa."""
    out = []
    for r in records:
        kw = (r.get(cmap.get("keyword", ""), "") or "").strip()
        if not kw:
            continue
        url = (r.get(cmap.get("url", ""), "") or "").strip()
        pos = to_int(r.get(cmap.get("position", "")))
        vol = to_int(r.get(cmap.get("volume", "")))
        kd  = to_int(r.get(cmap.get("kd", "")))
        out.append({"kw": kw, "url": url, "pos": pos,
                    "vol": vol or 0, "kd": kd})
    return out


def is_in_range(rec):
    if rec["vol"] < MIN_VOLUME:
        return False
    if rec["pos"] is None or not (POS_MIN <= rec["pos"] <= POS_MAX):
        return False
    if rec["kd"] is not None and rec["kd"] > MAX_KD:
        return False
    return True


def slug_overlap(kw, url):
    kt = content_tokens(kw)
    if not kt:
        return 1.0  # sem tokens de conteudo -> nao trata como oportunidade
    st = slug_tokens(url)
    return len(kt & st) / len(kt)


def classify(rec):
    """Retorna 'novo', 'melhorar' ou None (descartar).

    Regra anti-canibalizacao: nunca sugerir artigo novo para um tema que ja
    tem pagina posicionada (pagina 1). Criar outro artigo dividiria o sinal e
    conflitaria com o que ja ranqueia. Nesse caso o certo e MELHORAR.
    """
    ov = slug_overlap(rec["kw"], rec["url"])
    pos = rec["pos"]
    if ov >= SLUG_MATCH:
        # ja existe artigo dedicado a keyword
        if pos is not None and pos <= 3:
            return None            # ja ranqueia bem -> nada a fazer
        return "melhorar"
    # keyword ranqueia numa pagina de OUTRO tema (sem artigo dedicado)
    if pos is not None and pos <= POSITIONED_MAX:
        # essa pagina ja esta posicionada (pagina 1) -> artigo novo canibalizaria
        return "melhorar"
    return "novo"                  # ninguem posicionado -> criar artigo novo e seguro


def cluster_key(rec):
    """Assinatura para agrupar variacoes da mesma keyword no mesmo destino."""
    return (rec["url"], frozenset(content_tokens(rec["kw"])))


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


CLUSTER_THRESH = 0.6


def cluster(records):
    """Agrupa variacoes da MESMA keyword (leader clustering).

    Cada keyword entra no grupo cujo REPRESENTANTE (a de maior volume) tem
    sobreposicao alta de tokens; senao abre grupo novo. Comparar so com o
    representante (e nao transitivamente) evita o encadeamento catastrofico
    que keywords-ponte (ex. "sonhar com gato e rato") causariam, fundindo
    temas distintos num cluster gigante.
    """
    groups = []  # {"url", "rep": tokenset, "members": [recs]}
    for rec in sorted(records, key=lambda x: x.get("vol", 0), reverse=True):
        tok = content_tokens(rec["kw"])
        for g in groups:
            if g["url"] == rec["url"] and jaccard(tok, g["rep"]) >= CLUSTER_THRESH:
                g["members"].append(rec)
                break
        else:
            groups.append({"url": rec["url"], "rep": tok, "members": [rec]})
    return [g["members"] for g in groups]


def score(rec):
    pos_factor = (POS_MAX + 1 - rec["pos"]) / POS_MAX if rec["pos"] else 0
    kd_factor = (100 - rec["kd"]) / 100 if rec["kd"] is not None else 0.7
    return rec["vol"] * pos_factor * kd_factor


# ---------------------------------------------------------------------
# Sugestoes de keywords (sem URL) -> candidatos a artigo novo
# ---------------------------------------------------------------------
def is_covered(tokens, token_sets, thr=0.6):
    """True se 'tokens' tem alta sobreposicao com algum conjunto da lista."""
    return any(jaccard(tokens, ts) >= thr for ts in token_sets)


def bigrams_of(s):
    """Pares de palavras consecutivas (mantem 'com', 'do' -- importam p/ tema)."""
    t = norm_tokens(s)
    return set(zip(t, t[1:]))


def read_suggestions(all_recs, opportunities):
    """Le input/sugestoes/* (keyword + volume + dificuldade, sem URL) e
    devolve novos candidatos a artigo, filtrados contra canibalizacao.

    Filtros:
      1. volume >= MIN_VOLUME e (kd <= MAX_KD quando houver)
      2. tema relacionado ao que o site ja cobre (compartilha vocabulario)
      3. nao existe pagina POSICIONADA do site para a intencao (anti-canibal.)
      4. nao duplica oportunidade ja selecionada nem outra sugestao
    """
    files = []
    for ext in ("*.csv", "*.tsv", "*.txt", "*.xlsx", "*.xlsm"):
        files.extend(glob.glob(os.path.join(SUGGEST_DIR, ext)))
    if not files:
        return []

    # bigramas recorrentes do site (padroes de tema, ex. "sonhar com")
    import collections
    bcount = collections.Counter()
    for r in all_recs:
        bcount.update(bigrams_of(r["kw"]))
        bcount.update(bigrams_of(slug_of(r["url"]).replace("-", " ")))
    site_bigrams = {b for b, c in bcount.items() if c >= MIN_BIGRAM_FREQ}
    # intencoes ja POSICIONADAS (pagina 1) -> nao criar artigo novo concorrente
    positioned_sets = [content_tokens(r["kw"]) for r in all_recs
                       if r["pos"] is not None and r["pos"] <= POSITIONED_MAX]
    # oportunidades ja na planilha -> nao duplicar
    opp_sets = [content_tokens(o["kw"]) for o in opportunities]

    raw = []
    for path in files:
        headers, records = read_table(path)
        if not headers:
            continue
        cmap = build_colmap(headers)
        if "keyword" not in cmap:
            print("  [aviso] sugestao %s ignorada: sem coluna de keyword."
                  % os.path.basename(path))
            continue
        for rec in records:
            kw = (rec.get(cmap["keyword"], "") or "").strip()
            if not kw:
                continue
            vol = to_int(rec.get(cmap.get("volume", ""))) or 0
            kd = to_int(rec.get(cmap.get("kd", "")))
            raw.append({"kw": kw, "vol": vol, "kd": kd})
        print("  + (sugestoes) %-43s %5d keywords"
              % (os.path.basename(path)[:43], len(raw)))

    # 1) filtra sugestoes que sao temas novos e seguros (sem canibalizar)
    survivors = []
    for s in sorted(raw, key=lambda x: x["vol"], reverse=True):
        kwn = strip_accents(s["kw"]).lower()
        if any(b in kwn for b in (strip_accents(x).lower() for x in SUGGEST_BLOCKLIST)):
            continue                   # ruido de broad-match (intencao diferente)
        tok = content_tokens(s["kw"])
        if len(tok) < 2:               # fragmentos genericos ("sonhar com")
            continue
        if s["vol"] < MIN_VOLUME:
            continue
        if s["kd"] is not None and s["kd"] > MAX_KD:
            continue
        if not (bigrams_of(s["kw"]) & site_bigrams):  # fora do tema do site
            continue
        if is_covered(tok, positioned_sets):       # ja posicionado -> canibaliza
            continue
        if is_covered(tok, opp_sets):              # duplica oportunidade existente
            continue
        survivors.append({"kw": s["kw"], "url": "", "pos": None,
                          "vol": s["vol"], "kd": s["kd"]})

    # 2) agrupa variacoes entre si (mesma intencao -> um artigo, demais viram secao)
    kept = []
    for grp in cluster(survivors):
        target = max(grp, key=lambda x: x["vol"])
        target["action"] = "novo"
        target["score"] = target["vol"] * ((100 - target["kd"]) / 100
                                           if target["kd"] is not None else 0.7)
        target["keywords"] = [g["kw"] for g in
                              sorted(grp, key=lambda x: x["vol"], reverse=True)]
        kept.append(target)

    kept.sort(key=lambda x: x["score"], reverse=True)
    if MAX_SUGGESTIONS and len(kept) > MAX_SUGGESTIONS:
        print("  [info] %d sugestoes on-theme; entregando as %d melhores por "
              "score (%d ficaram de fora -- aumente MAX_SUGGESTIONS p/ ver mais)."
              % (len(kept), MAX_SUGGESTIONS, len(kept) - MAX_SUGGESTIONS))
        kept = kept[:MAX_SUGGESTIONS]
    return kept


def read_forced():
    """Le input/forcar/* (keyword[,volume,kd]) e devolve artigos novos
    FORCADOS -- entram direto, sem filtro de tema/volume. Inclusao manual."""
    files = []
    for ext in ("*.csv", "*.tsv", "*.txt"):
        files.extend(glob.glob(os.path.join(FORCE_DIR, ext)))
    kept = []
    for path in files:
        headers, records = read_table(path)
        if not headers:
            continue
        cmap = build_colmap(headers)
        if "keyword" not in cmap:
            continue
        for rec in records:
            kw = (rec.get(cmap["keyword"], "") or "").strip()
            if not kw:
                continue
            vol = to_int(rec.get(cmap.get("volume", ""))) or 0
            kd = to_int(rec.get(cmap.get("kd", "")))
            kept.append({"kw": kw, "url": "", "pos": None, "vol": vol, "kd": kd,
                         "action": "novo", "keywords": [kw],
                         "score": vol * ((100 - kd) / 100 if kd is not None else 0.7)})
        print("  + (forcar) %-45s %5d keywords" % (os.path.basename(path)[:45], len(kept)))
    return kept


# ---------------------------------------------------------------------
# Briefing de escrita (coluna G) -- alinhado ao manual da rede QMIX
# ---------------------------------------------------------------------
INTENT_LABEL = {
    "frases":  "lista de frases/mensagens",
    "como":    "passo a passo (tutorial)",
    "oquee":   "significado/definição",
    "quant":   "dado/quantidade",
    "medida":  "medidas/dimensões",
    "geral":   "informacional",
}
INTENT_FORMAT = {
    "frases": "Listas (<ul>) de frases originais agrupadas por subtema; entregue dezenas de itens.",
    "como":   "Tutorial em lista numerada (<ol>) com pré-requisitos, passos e dicas.",
    "oquee":  "Definição objetiva no 1º parágrafo (40-60 palavras) e depois o detalhamento.",
    "quant":  "Responda o número logo no início e entregue uma TABELA com as quantidades/variações.",
    "medida": "Entregue uma TABELA com as medidas/dimensões oficiais e comparativos.",
    "geral":  "Guia abrangente cobrindo o tema de ponta a ponta, com subtítulos claros.",
}


def make_brief(o, title):
    intent = detect_intent(o["kw"])
    kws = o.get("keywords", [o["kw"]])
    secondary = [k for k in kws if k != o["kw"]]
    needs_table = intent in ("quant", "medida")
    L = []
    L.append("OBJETIVO: %s." %
             ("ESCREVER ARTIGO NOVO" if o["action"] == "novo"
              else "MELHORAR ARTIGO EXISTENTE (incremental, preservar o que já ranqueia)"))
    L.append("PALAVRA-CHAVE PRINCIPAL (semente): %s." % o["kw"])
    L.append("TÍTULO: %s" % title)
    if secondary:
        L.append("COBRIR TAMBÉM, como H2/H3 e FAQ na MESMA página (nunca criar páginas separadas): %s."
                 % "; ".join(secondary))
    else:
        L.append("COBRIR TAMBÉM: variações e dúvidas relacionadas (PAA) como H2/H3 e FAQ.")
    L.append("INTENÇÃO: %s. FORMATO: %s" % (INTENT_LABEL[intent], INTENT_FORMAT[intent]))
    if o["action"] == "melhorar" and o.get("url"):
        L.append("URL ATUAL (preservar a URL e o foco, só evoluir o miolo): %s" % o["url"])
    else:
        L.append("LINK: criar a página e colar a nova URL na coluna Link após publicar.")
    L.append("CONCORRENTES: analise os 5 primeiros do Google (coluna Concorrentes), "
             "cubra tudo que eles cobrem, preencha as lacunas e iguale ou supere a extensão média.")
    L.append("ESTRUTURA: corpo começa em H2 (o H1 é o título do post); arquitetura de H2 "
             "diferente de outros artigos; Perguntas Frequentes com 3-6 perguntas do PAA.%s"
             % (" Inclua uma TABELA de verdade." if needs_table else ""))
    L.append("LINKAGEM INTERNA: 2 a 4 links para outras páginas do mesmo site (use as URLs da "
             "coluna Link das demais linhas), âncora descritiva com a keyword do destino, fora do "
             "1º e do último parágrafo, nunca entre páginas que disputam a mesma busca.")
    L.append("SEO ON-PAGE: keyword no 1º parágrafo (primeiros 100 caracteres) e em ≥1 H2; "
             "meta description ≤155 com a keyword; slug curto com a keyword, sem ano.")
    L.append("ANTI-DETECÇÃO (rígido): pt-BR humano, voz ativa, frases de tamanho variado; ZERO "
             "travessão (—); proibido 'abordagem, robusto, vale ressaltar, é fundamental, no "
             "cenário atual, descubra, saiba mais, clique aqui'; título ≤70, sem '!', sem repetir 'Google'.")
    L.append("ENTREGA: HTML limpo (h2,h3,p,ul,ol,li,strong,em,a,table) pronto para colar no Gutenberg.")
    return "\n".join(L)


# ---------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------
def main():
    files = []
    for ext in ("*.csv", "*.tsv", "*.txt", "*.xlsx", "*.xlsm"):
        files.extend(glob.glob(os.path.join(INPUT_DIR, ext)))
    if not files:
        print("Nenhum arquivo em '%s/'. Coloque os exports de SEO la." % INPUT_DIR)
        sys.exit(1)

    all_recs = []
    for path in files:
        headers, records = read_table(path)
        if not headers:
            continue
        cmap = build_colmap(headers)
        if "keyword" not in cmap or "url" not in cmap:
            print("  [aviso] %s ignorado: nao achei colunas de keyword/url."
                  % os.path.basename(path))
            continue
        recs = parse_rows(records, cmap)
        all_recs.extend(recs)
        print("  + %-55s %5d linhas | colunas: %s"
              % (os.path.basename(path)[:55], len(recs),
                 ", ".join("%s=%s" % (k, v) for k, v in cmap.items())))

    # dedup: exports da Semrush trazem a mesma keyword+URL repetida (desktop/
    # mobile, timestamps). Mantem o registro de MELHOR posicao.
    dedup = {}
    before = len(all_recs)
    for r in all_recs:
        key = (strip_accents(r["kw"]).lower().strip(), r["url"])
        cur = dedup.get(key)
        if cur is None or (r["pos"] or 999) < (cur["pos"] or 999):
            dedup[key] = r
    all_recs = list(dedup.values())
    if before != len(all_recs):
        print("  (dedup: %d -> %d linhas)" % (before, len(all_recs)))

    # filtra faixa e classifica
    candidates = []
    for r in all_recs:
        if not is_in_range(r):
            continue
        action = classify(r)
        if action is None:
            continue
        r["action"] = action
        candidates.append(r)

    # agrupa variacoes -> 1 artigo por cluster (keyword alvo = maior volume)
    clusters = cluster(candidates)
    opportunities = []
    for grp in clusters:
        target = max(grp, key=lambda x: x["vol"])
        # anti-canibalizacao: se QUALQUER variacao do tema ja esta posicionada
        # (classificada como melhorar), o cluster inteiro vira "melhorar".
        action = "melhorar" if any(g["action"] == "melhorar" for g in grp) else "novo"
        target["action"] = action
        target["score"] = max(score(g) for g in grp)
        # todas as variacoes do cluster -> cobrir como secoes/H2/FAQ no artigo
        target["keywords"] = [g["kw"] for g in
                              sorted(grp, key=lambda x: x["vol"], reverse=True)]
        opportunities.append(target)

    # sugestoes de keywords (sem URL) -> artigos novos, sem canibalizar
    suggestions = read_suggestions(all_recs, opportunities)
    opportunities.extend(suggestions)

    # inclusao FORCADA (input/forcar/) -> entram direto como artigo novo
    opportunities.extend(read_forced())

    # dedup final por keyword: a mesma busca pode ter caido em 2 oportunidades
    # (ranqueando por URLs diferentes = canibalizacao on-site). Colapsa numa
    # linha; se ha pagina dedicada, vira "melhorar" apontando pra melhor posicao.
    byk = {}
    for o in opportunities:
        byk.setdefault(strip_accents(o["kw"]).lower().strip(), []).append(o)
    merged = []
    for grp in byk.values():
        if len(grp) == 1:
            merged.append(grp[0])
            continue
        best = min(grp, key=lambda x: x["pos"] if x["pos"] is not None else 999)
        urls = [g["url"] for g in grp if g.get("url")]
        if urls:  # tem pagina(s) dedicada(s) -> melhorar (nao criar 3a pagina)
            best["action"] = "melhorar"
            best["url"] = min((g for g in grp if g.get("url")),
                              key=lambda x: x["pos"] if x["pos"] is not None else 999)["url"]
        kws = []
        for g in grp:
            kws += g.get("keywords", [g["kw"]])
        best["keywords"] = list(dict.fromkeys(kws))
        best["score"] = max(g["score"] for g in grp)
        merged.append(best)
    opportunities = merged

    # reclassifica "novo" -> "melhorar" quando o site JA TEM pagina dedicada,
    # mesmo que o slug use sinonimo/concatenacao/plural (ex.: "little space" ->
    # /littlespace/). Sem isso, criar-se-ia um 2o artigo = canibalizacao.
    site_pages = {}
    for r in all_recs:
        u = r["url"]
        if not u:
            continue
        ds = re.sub(r"[^a-z0-9]", "", strip_accents(slug_of(u)).lower())
        cur = site_pages.get(u)
        if cur is None or (r["pos"] or 999) < cur[2]:
            site_pages[u] = (slug_tokens(u), ds, r["pos"] or 999)

    import difflib

    def find_existing_page(kw):
        kt = content_tokens(kw)
        kd = re.sub(r"[^a-z0-9]", "", strip_accents(kw).lower())
        best = None
        for u, (st, ds, pos) in site_pages.items():
            # cobertura de tokens, com match fuzzy (pega typos: snaptijk~snaptik)
            covered = 0
            for t in kt:
                if (t in st
                        or (len(t) >= 4 and t in ds)   # token dentro do slug (you tube~youtube)
                        or any(len(t) >= 5 and
                               difflib.SequenceMatcher(None, t, s).ratio() >= 0.88
                               for s in st)):
                    covered += 1
            cov = covered / len(kt) if kt else 0
            contained = len(ds) >= 6 and (ds in kd or kd in ds)
            if cov >= SLUG_MATCH or contained:
                if best is None or pos < best[1]:
                    best = (u, pos)
        return best[0] if best else None

    for o in opportunities:
        if o["action"] == "novo":
            u = find_existing_page(o["kw"])
            if u:
                o["action"] = "melhorar"
                o["url"] = u

    # fold novo->melhorar: se um "novo" cobre a MESMA intencao de uma
    # oportunidade "melhorar" que ja tem pagina (sinonimo/ordem invertida que
    # find_existing_page nao pegou, ex.: "roupa formatura homem" ~ "...masculino"),
    # dobra na pagina existente. (antes da dedup por URL, p/ colapsar a duplicata.)
    GENERIC = {"jogo", "bicho", "como", "para", "que", "dia", "tem", "ser", "site"}

    def distinct_tokens(kw):
        return {t for t in content_tokens(kw) if len(t) >= 4 and t not in GENERIC}

    mel_ref = [(distinct_tokens(o["kw"]), o["url"]) for o in opportunities
               if o["action"] == "melhorar" and o.get("url")]
    for o in opportunities:
        if o["action"] != "novo":
            continue
        dt = distinct_tokens(o["kw"])
        if not dt:
            continue
        for sm, url in mel_ref:
            if len(dt & sm) >= 2 and jaccard(dt, sm) >= 0.5:
                o["action"] = "melhorar"
                o["url"] = url
                break

    # dedup "melhorar" por URL: 1 linha por artigo existente; as demais
    # keywords da mesma pagina viram secoes/FAQ (coluna E).
    byurl = {}
    finals = []
    for o in opportunities:
        if o["action"] == "melhorar" and o.get("url"):
            byurl.setdefault(o["url"], []).append(o)
        else:
            finals.append(o)
    for grp in byurl.values():
        best = max(grp, key=lambda x: x["vol"])
        kws = []
        for g in grp:
            kws += g.get("keywords", [g["kw"]])
        best["keywords"] = list(dict.fromkeys(kws))
        best["score"] = max(g["score"] for g in grp)
        finals.append(best)
    opportunities = finals

    # consolida quase-duplicatas/typos (ex.: 9 grafias de "snaptik" = 1 artigo).
    # Similaridade de string alta -> mesmo alvo; variantes vao pra coluna E.
    import difflib
    ops = sorted(opportunities, key=lambda x: x["vol"], reverse=True)
    used = [False] * len(ops)
    keys = [strip_accents(o["kw"]).lower().replace(" ", "") for o in ops]
    deduped = []
    for a in range(len(ops)):
        if used[a]:
            continue
        grp = [ops[a]]
        used[a] = True
        for b in range(a + 1, len(ops)):
            if used[b]:
                continue
            if difflib.SequenceMatcher(None, keys[a], keys[b]).ratio() >= 0.85:
                grp.append(ops[b])
                used[b] = True
        rep = grp[0]
        mel = [g for g in grp if g["action"] == "melhorar" and g.get("url")]
        if mel:  # se alguma variante ja tem pagina, vira melhorar
            rep["action"] = "melhorar"
            rep["url"] = min(mel, key=lambda x: x["pos"] if x["pos"] is not None else 999)["url"]
        kws = []
        for g in grp:
            kws += g.get("keywords", [g["kw"]])
        rep["keywords"] = list(dict.fromkeys(kws))
        rep["score"] = max(g["score"] for g in grp)
        deduped.append(rep)
    opportunities = deduped

    # blocklist de brand safety (remove conteudo adulto/explicito)
    _bl = [strip_accents(b).lower() for b in OPPORTUNITY_BLOCKLIST]
    before = len(opportunities)
    opportunities = [o for o in opportunities
                     if not any(b in strip_accents(o["kw"]).lower() for b in _bl)]
    if before != len(opportunities):
        print("  (brand-safety: %d termo(s) bloqueado(s))" % (before - len(opportunities)))

    opportunities.sort(key=lambda x: x["score"], reverse=True)

    domain = domain_of(all_recs)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, "%s oportunidades de artigos.xlsx" % domain)

    # concorrentes pesquisados na web (keyword -> [urls]); opcional
    competitors = {}
    if os.path.exists(COMPETITORS_JSON):
        import json
        try:
            competitors = json.load(open(COMPETITORS_JSON, encoding="utf-8"))
        except Exception as e:
            print("  [aviso] %s ilegivel: %s" % (COMPETITORS_JSON, e))

    label = {"novo": "Fazer artigo novo", "melhorar": "Melhorar o conteúdo"}
    header = ["Palavra-chave", "Título SEO", "Ação", "Link",
              "Palavras-chave do artigo", "Concorrentes", "Orientação de escrita"]
    rows = []
    for o in opportunities:
        title = make_title(o["kw"])
        link = o["url"] if o["action"] == "melhorar" else ""
        kws = o.get("keywords", [o["kw"]])
        comp = competitors.get(o["kw"], [])
        comp_str = "\n".join(comp) if comp else ""
        rows.append([o["kw"], title, label[o["action"]], link,
                     "; ".join(kws), comp_str, make_brief(o, title)])

    write_xlsx(out_path, header, rows)

    # exporta os artigos NOVOS para a etapa de pesquisa de concorrentes
    import json
    novos = [{"kw": o["kw"], "title": make_title(o["kw"])}
             for o in opportunities if o["action"] == "novo"]
    json.dump(novos, open("artigos_novos.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    novo = sum(1 for o in opportunities if o["action"] == "novo")
    mel = sum(1 for o in opportunities if o["action"] == "melhorar")
    comp_n = sum(1 for o in opportunities if competitors.get(o["kw"]))
    print("\n%d oportunidades -> %s" % (len(opportunities), out_path))
    print("   Fazer artigo novo : %d" % novo)
    print("   Melhorar conteudo : %d" % mel)
    print("   Com concorrentes  : %d" % comp_n)


def write_xlsx(path, header, rows):
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Oportunidades"

    head_fill = PatternFill("solid", fgColor="1F4E78")   # azul escuro
    head_font = Font(bold=True, color="FFFFFF")
    band_fill = PatternFill("solid", fgColor="DDEBF7")   # azul bem claro (zebra)
    white_fill = PatternFill("solid", fgColor="FFFFFF")
    novo_font = Font(bold=True, color="107C41")          # verde -> artigo novo
    mel_font  = Font(bold=True, color="BF8F00")          # ambar -> melhorar
    link_font = Font(color="0563C1", underline="single") # link clicavel
    wrap = Alignment(vertical="top", wrap_text=True)

    ws.append(header)
    for c in ws[1]:
        c.fill = head_fill
        c.font = head_font
        c.alignment = Alignment(vertical="center", horizontal="left")
    ws.freeze_panes = "A2"

    for idx, row in enumerate(rows):
        ws.append(row)
        rownum = ws.max_row
        fill = band_fill if idx % 2 else white_fill   # alterna 2 cores
        for col in range(1, len(header) + 1):
            cell = ws.cell(row=rownum, column=col)
            cell.fill = fill
            cell.alignment = wrap
        action_cell = ws.cell(row=rownum, column=3)
        action_cell.font = novo_font if action_cell.value == "Fazer artigo novo" else mel_font
        link_cell = ws.cell(row=rownum, column=4)
        if link_cell.value and "\n" not in str(link_cell.value):
            link_cell.hyperlink = link_cell.value
            link_cell.font = link_font
        # altura da linha conforme o conteudo mais alto (briefing/concorrentes)
        maxlines = max((str(c).count("\n") + 1) for c in row if c)
        ws.row_dimensions[rownum].height = min(max(maxlines * 14, 15), 320)

    widths = [30, 46, 18, 40, 34, 46, 90]
    for i, wdt in enumerate(widths[:len(header)], 1):
        ws.column_dimensions[chr(64 + i)].width = wdt
    ws.auto_filter.ref = "A1:%s1" % chr(64 + len(header))
    wb.save(path)


if __name__ == "__main__":
    main()
