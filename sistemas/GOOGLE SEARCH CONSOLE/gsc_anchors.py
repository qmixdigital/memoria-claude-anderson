# -*- coding: utf-8 -*-
"""Extrai URLs de um relatorio do Google Search Console e gera uma planilha
(CSV pronto para o Google Sheets) com duas colunas: texto ancora e URL.

A regra de geracao do texto ancora e definida POR PROJETO em projetos.json
(casada pelo dominio das URLs). Acentos de cidades sao restaurados pela base
oficial do IBGE em municipios.json.

Uso:
    python gsc_anchors.py "C:\\caminho\\relatorio.zip"
    python gsc_anchors.py "C:\\caminho\\relatorio.zip" -o saida.csv
    python gsc_anchors.py "C:\\caminho\\Paginas.csv" --projeto geladeirastop.com

Sem --projeto, o dominio e detectado automaticamente a partir das URLs.
"""
import argparse
import concurrent.futures
import csv
import html as html_mod
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import zipfile
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GSCAnchors/1.0"

# estados brasileiros (slug -> [nome acentuado, preposicao locativa correta])
ESTADOS = {
    "sao-paulo": ["São Paulo", "em"], "rio-de-janeiro": ["Rio de Janeiro", "no"],
    "minas-gerais": ["Minas Gerais", "em"], "bahia": ["Bahia", "na"],
    "parana": ["Paraná", "no"], "rio-grande-do-sul": ["Rio Grande do Sul", "no"],
    "pernambuco": ["Pernambuco", "em"], "ceara": ["Ceará", "no"],
    "para": ["Pará", "no"], "santa-catarina": ["Santa Catarina", "em"],
    "maranhao": ["Maranhão", "no"], "goias": ["Goiás", "em"],
    "amazonas": ["Amazonas", "no"], "espirito-santo": ["Espírito Santo", "no"],
    "paraiba": ["Paraíba", "na"], "mato-grosso": ["Mato Grosso", "no"],
    "rio-grande-do-norte": ["Rio Grande do Norte", "no"], "alagoas": ["Alagoas", "em"],
    "piaui": ["Piauí", "no"], "distrito-federal": ["Distrito Federal", "no"],
    "mato-grosso-do-sul": ["Mato Grosso do Sul", "no"], "sergipe": ["Sergipe", "em"],
    "rondonia": ["Rondônia", "em"], "tocantins": ["Tocantins", "no"],
    "acre": ["Acre", "no"], "amapa": ["Amapá", "no"], "roraima": ["Roraima", "em"],
}


def slugify(texto: str) -> str:
    """Mesma normalizacao usada para casar nomes de cidade com slugs de URL."""
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join(c for c in nfkd if not unicodedata.combining(c))
    sem_acento = sem_acento.lower().replace("'", "").replace("`", "")
    out = [ch if ch.isalnum() else "-" for ch in sem_acento]
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def carregar_json(nome):
    caminho = os.path.join(BASE_DIR, nome)
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


def ler_urls(entrada: str):
    """Le todas as URLs (primeira coluna que comeca com http) de um zip, csv ou pasta."""
    urls = []

    def processar_csv(texto):
        leitor = csv.reader(io.StringIO(texto))
        for linha in leitor:
            if linha and linha[0].strip().lower().startswith("http"):
                urls.append(linha[0].strip())

    if entrada.lower().endswith(".zip"):
        with zipfile.ZipFile(entrada) as z:
            for nome in z.namelist():
                if nome.lower().endswith(".csv"):
                    processar_csv(z.read(nome).decode("utf-8", errors="replace"))
    elif os.path.isdir(entrada):
        for nome in os.listdir(entrada):
            if nome.lower().endswith(".csv"):
                with open(os.path.join(entrada, nome), "r", encoding="utf-8", errors="replace") as f:
                    processar_csv(f.read())
    else:  # csv unico
        with open(entrada, "r", encoding="utf-8", errors="replace") as f:
            processar_csv(f.read())

    return urls


def ler_cliques(entrada: str):
    """Le o relatorio de Paginas e devolve {url_limpa: cliques} (max por URL)."""
    cliques = {}

    def processar_csv(texto):
        for linha in csv.reader(io.StringIO(texto)):
            if not linha or not linha[0].strip().lower().startswith("http"):
                continue
            partes = urlparse(linha[0].strip())
            url = f"{partes.scheme}://{partes.netloc}{partes.path}"
            try:
                c = int(re.sub(r"[^\d]", "", linha[1]) or 0) if len(linha) > 1 else 0
            except ValueError:
                c = 0
            cliques[url] = max(cliques.get(url, 0), c)

    if entrada.lower().endswith(".zip"):
        with zipfile.ZipFile(entrada) as z:
            for nome in z.namelist():
                if nome.lower().endswith(".csv"):
                    processar_csv(z.read(nome).decode("utf-8", errors="replace"))
    elif os.path.isdir(entrada):
        for nome in os.listdir(entrada):
            if nome.lower().endswith(".csv"):
                with open(os.path.join(entrada, nome), "r", encoding="utf-8", errors="replace") as f:
                    processar_csv(f.read())
    else:
        with open(entrada, "r", encoding="utf-8", errors="replace") as f:
            processar_csv(f.read())
    return cliques


def ler_consultas(entrada: str):
    """Le o relatorio de Consultas (queries) do GSC: [(consulta, impressoes)]."""
    consultas = []

    def processar_csv(texto):
        leitor = list(csv.reader(io.StringIO(texto)))
        if not leitor:
            return
        cab = [c.strip().lower() for c in leitor[0]]
        # so processa o CSV de consultas (1a coluna fala de consulta/query)
        if not cab or not any(p in cab[0] for p in ("consulta", "quer")):
            return
        for linha in leitor[1:]:
            if not linha or not linha[0].strip():
                continue
            imp = 0
            if len(linha) > 2:
                try:
                    imp = int(re.sub(r"[^\d]", "", linha[2]) or 0)
                except ValueError:
                    imp = 0
            consultas.append((linha[0].strip(), imp))

    if entrada.lower().endswith(".zip"):
        with zipfile.ZipFile(entrada) as z:
            for nome in z.namelist():
                if nome.lower().endswith(".csv"):
                    processar_csv(z.read(nome).decode("utf-8", errors="replace"))
    elif os.path.isdir(entrada):
        for nome in os.listdir(entrada):
            if nome.lower().endswith(".csv"):
                with open(os.path.join(entrada, nome), "r", encoding="utf-8", errors="replace") as f:
                    processar_csv(f.read())
    else:
        with open(entrada, "r", encoding="utf-8", errors="replace") as f:
            processar_csv(f.read())

    return consultas


def ler_sitemap(url: str):
    """Baixa um sitemap.xml e devolve o conjunto de paths (sem dominio/barras).
    Uso: em sites cujo sitemap lista apenas PAGINAS, serve para excluir paginas
    e manter so os artigos."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=25) as r:
            xml = r.read().decode("utf-8", errors="replace")
    except Exception:
        return set()
    paths = set()
    for loc in re.findall(r"<loc>\s*(.*?)\s*</loc>", xml, re.I | re.S):
        paths.add(urlparse(loc.strip()).path.strip("/"))
    return paths


def ler_wp_posts_slugs(url_base: str):
    """Busca na REST API do WordPress os slugs dos POSTS publicados (artigos
    vivos). Exclui paginas e artigos deletados de uma vez. Pagina de 100 em 100."""
    slugs = set()
    pagina = 1
    while True:
        sep = "&" if "?" in url_base else "?"
        url = f"{url_base}{sep}per_page=100&page={pagina}&_fields=slug"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                dados = json.loads(r.read().decode("utf-8", errors="replace"))
        except Exception:
            break  # 400 ao passar do total, ou erro de rede
        if not isinstance(dados, list) or not dados:
            break
        for item in dados:
            if item.get("slug"):
                slugs.add(item["slug"])
        if len(dados) < 100:
            break
        pagina += 1
    return slugs


def _tokens(texto: str):
    """Tokens normalizados (minusculos, sem acento) de um texto."""
    base = "".join(c for c in unicodedata.normalize("NFKD", texto.lower())
                   if not unicodedata.combining(c))
    return [t for t in re.split(r"[^a-z0-9]+", base) if t]


STOPWORDS = {
    "de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "em", "no", "na",
    "nos", "nas", "para", "por", "com", "que", "um", "uma", "ao", "aos", "se",
}

# palavras nao-distintivas (funcao/pergunta/auxiliares): nao caracterizam o tema,
# entao nao contam como "termo forte" ao comparar a divergencia entre pagina e consulta
GENERICOS = STOPWORDS | {
    "como", "qual", "quais", "quando", "onde", "porque", "quem", "quanto", "quantos",
    "quanta", "quantas", "pode", "posso", "podem", "fez", "faz", "fazer", "tem", "ter",
    "ser", "estar", "apos", "antes", "depois", "sobre", "muito", "mais", "meu", "minha",
    "vai", "sao", "sua", "seu", "e", "ou", "isso", "esse", "essa", "ainda", "tudo",
}


def _conteudo(tokens):
    """Remove stopwords para o casamento por relevancia."""
    return {t for t in tokens if t not in STOPWORDS}


# palavras ignoradas ao comparar se dois ancoras sao "o mesmo" (evita quase-dup
# tipo "vender MEU carro" x "vender UM carro")
_DEDUP_STOP = GENERICOS | {"meu", "minha", "seu", "sua", "teu", "tua", "este",
                           "esta", "esse", "essa", "isso", "todo", "toda"}


def _chave_conteudo(texto: str):
    """Conjunto de palavras-chave (sem stopwords/genericas) para dedupe robusto."""
    return frozenset(t for t in _tokens(texto) if t not in _DEDUP_STOP)


def restaurar_por_titulo(consulta: str, titulo_bruto: str) -> str:
    """Reescreve a consulta (minuscula/sem acento) com a grafia acentuada correta
    do titulo da pagina, palavra a palavra. Palavras ausentes no titulo ficam
    como digitadas."""
    if not titulo_bruto:
        return consulta
    titulo = re.sub(r"<[^>]+>", "", html_mod.unescape(titulo_bruto))
    mapa = {}
    for w in re.findall(r"[0-9A-Za-zÀ-ÿ][0-9A-Za-zÀ-ÿ\-]*", titulo):
        chave = "".join(c for c in unicodedata.normalize("NFKD", w.lower())
                        if not unicodedata.combining(c))
        mapa.setdefault(chave, w)
    saida = []
    for w in consulta.split():
        chave = "".join(c for c in unicodedata.normalize("NFKD", w.lower())
                        if not unicodedata.combining(c) and (c.isalnum() or c == "-"))
        # so restaura acento de palavras de conteudo (>=3): evita "e"->"é", "a"->"á"
        saida.append(mapa.get(chave, w) if len(chave) >= 3 else w)
    return " ".join(saida)


def casar_paginas_consultas(casadas, consultas, cache, cfg):
    """Casa cada pagina com a consulta real mais parecida (Jaccard de tokens de
    conteudo), com atribuicao global unica (cada consulta usada 1x). Devolve
    {url_limpa: consulta_bruta} apenas para as que passaram do score minimo."""
    thr = cfg.get("query_min_score", 0.34)
    qsets = [(q, imp, _conteudo(_tokens(q))) for q, imp in consultas]
    pares = []
    for pi, (url_limpa, _campos) in enumerate(casadas):
        slug = url_para_slug(url_limpa).split("/")[-1]
        slug_toks = [t for t in _tokens(slug) if t not in STOPWORDS]
        pset = set(slug_toks)  # o slug reflete a keyword-alvo da pagina
        if not pset:
            continue
        # termo principal do artigo (1o token de conteudo do slug): a consulta
        # PRECISA conte-lo, senao o ancora troca o tema (ex.: acupuntura -> fisioterapia)
        head = slug_toks[0]
        pforte = pset - GENERICOS  # termos distintivos da pagina
        for qi, (q, imp, qset) in enumerate(qsets):
            if head not in qset:
                continue
            inter = len(pset & qset)
            if not inter:
                continue
            jac = inter / len(pset | qset)
            if jac < thr:
                continue
            # rejeita divergencia de tema: os dois lados tem termo forte que o
            # outro nao tem (ex.: "...pode comer bolo" x "...pode se abaixar")
            if (qset - GENERICOS) - pset and pforte - qset:
                continue
            pares.append((jac, len(qset), imp, pi, qi))
    pares.sort(reverse=True)  # jaccard, depois consulta mais longa, depois impressoes
    usadas_p, usadas_q, atrib = set(), set(), {}
    for jac, _ql, _imp, pi, qi in pares:
        if pi in usadas_p or qi in usadas_q:
            continue
        usadas_p.add(pi)
        usadas_q.add(qi)
        atrib[casadas[pi][0]] = qsets[qi][0]
    return atrib


def casar_multiplas_consultas(casadas, consultas, cache, cfg, excluir=None, limite=None):
    """Atribui CADA consulta à sua melhor pagina (consulta usada 1x; pagina pode
    receber muitas) e devolve TODAS as consultas de cada pagina como ancoras.
    Banco rico de textos ancora por URL — ideal para backlinks. Acentos vem do
    titulo, com naturalizacao e dedupe (variantes com/sem acento colapsam).
    `excluir` = ancoras (normalizadas) a pular; `limite` = maximo de linhas."""
    thr = cfg.get("query_min_score", 0.34)
    natural = cfg.get("naturalizar_ancora", True)
    pinfo = []
    for url, _campos in casadas:
        stoks = [t for t in _tokens(url_para_slug(url).split("/")[-1]) if t not in STOPWORDS]
        pset = set(stoks)
        pinfo.append((url, pset, stoks[0] if stoks else None, pset - GENERICOS))
    from collections import defaultdict
    por_pagina = defaultdict(list)
    for q, _imp in consultas:
        qset = _conteudo(_tokens(q))
        if not qset:
            continue
        melhor, melhor_jac = None, 0.0
        for url, pset, head, pforte in pinfo:
            if not head or head not in qset:
                continue
            inter = len(pset & qset)
            if not inter:
                continue
            jac = inter / len(pset | qset)
            if jac < thr:
                continue
            if (qset - GENERICOS) - pset and pforte - qset:  # divergencia de tema
                continue
            if jac > melhor_jac:
                melhor_jac, melhor = jac, url
        if melhor is not None:
            por_pagina[melhor].append(q)

    vistos = {_deacc(a) for a in (excluir or set())}  # exatas ja usadas
    vistos_cont = {_chave_conteudo(a) for a in (excluir or set())}  # por conjunto de keywords
    min_pal = cfg.get("min_palavras_ancora", 1)
    # acentos_corpus: acentua pela propria lista de consultas (nao usa titulos de artigo)
    mapa_corpus = construir_mapa_acentos(consultas) if cfg.get("acentos_corpus") else None
    nomes = cfg.get("proper_nouns", [])
    proper = {_deacc(p) for p in nomes if len(p.split()) == 1}
    frases = [_deacc(p).split() for p in nomes if len(p.split()) > 1]

    def montar(texto, url, pronto=False):
        if pronto:  # texto ja e uma frase natural (template) — nao transforma
            anc = texto.strip()
        else:
            texto = re.sub(r"[^0-9A-Za-zÀ-ÿ\s-]", " ", texto)  # limpa typos/pontuacao
            texto = re.sub(r"\s+", " ", texto).strip()
            if mapa_corpus is not None:  # acentua pelo corpus de consultas
                anc = normalizar_consulta(texto, mapa_corpus, proper, frases)
            else:
                anc = sentence_case(restaurar_por_titulo(texto, cache.get(url, "")))
            if natural:
                anc = naturalizar_ancora(anc)
        anc = anc.strip().rstrip(" .,;:-")
        chave, kc = _deacc(anc), _chave_conteudo(anc)
        if (anc and len(anc) >= 3 and len(anc.split()) >= min_pal
                and chave not in vistos and kc and kc not in vistos_cont):
            vistos.add(chave)
            vistos_cont.add(kc)
            return anc
        return None

    regras = [(re.compile(p), t) for p, t in cfg.get("phrase_rules", [])]
    rot = {}  # rotaciona a ORDEM dos templates por pagina (evita footprint de padrao)

    def ancoras_de_regra(path):
        """Se a URL casar uma phrase_rule, devolve ancoras naturais dos templates.
        A ordem dos templates roda por pagina para variar o padrao entre URLs."""
        for i, (rx, templates) in enumerate(regras):
            m = rx.search(path)
            if not m:
                continue
            gd = dict(m.groupdict())
            if gd.get("estado"):
                nome, prep = ESTADOS.get(gd["estado"], [gd["estado"].replace("-", " ").title(), "em"])
                gd["estado"] = nome
                gd["loc"] = f"{prep} {nome}"  # ex.: "em São Paulo", "na Bahia", "no Pará"
            k = rot.get(i, 0)
            rot[i] = k + 1
            ordem = templates[k % len(templates):] + templates[:k % len(templates)]
            return [a for a in (montar(t.format(**gd), None, pronto=True) for t in ordem) if a]
        return None

    # monta a lista de ancoras por pagina (ja deduplicadas globalmente)
    por_url = []
    for url, _campos in casadas:  # ordem por trafego (relatorio ja vem ordenado)
        ancs = ancoras_de_regra(url_para_slug(url))  # paginas de servico/estado
        if ancs is None:  # demais paginas (artigos) -> consultas naturalizadas
            ancs = [a for a in (montar(q, url) for q in por_pagina.get(url, [])) if a]
            if not ancs:  # sem consulta -> 1 ancora do proprio slug
                a = montar(url_para_slug(url).split("/")[-1].replace("-", " "), url)
                if a:
                    ancs = [a]
        if ancs:
            por_url.append((url, ancs))

    # round-robin: espalha as ancoras entre as paginas (variedade de URLs)
    linhas, i = [], 0
    while any(i < len(ancs) for _u, ancs in por_url):
        for url, ancs in por_url:
            if i < len(ancs):
                linhas.append((ancs[i], url))
                if limite and len(linhas) >= limite:
                    return linhas
        i += 1
    return linhas


def _deacc(s: str) -> str:
    """Minusculo, sem acento, espacos colapsados (para comparacao/chaves)."""
    base = "".join(c for c in unicodedata.normalize("NFKD", s.lower())
                   if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", base).strip()


def construir_mapa_acentos(consultas):
    """A partir do corpus de consultas, escolhe a grafia acentuada canonica de
    cada palavra: prefere a variante COM acento e mais frequente. Ex.: 'cambio'
    -> 'câmbio', 'goiania' -> 'goiânia', 'oleo' -> 'óleo'."""
    from collections import Counter, defaultdict
    cont = Counter()
    for q, _imp in consultas:
        for w in re.findall(r"[0-9A-Za-zÀ-ÿ]+", q.lower()):
            cont[w] += 1
    grupos = defaultdict(list)
    for w, c in cont.items():
        grupos[_deacc(w)].append((w, c))
    mapa = {}
    for chave, lst in grupos.items():
        acentuadas = [(w, c) for w, c in lst if any(ord(ch) > 127 for ch in w)]
        pool = acentuadas or lst
        mapa[chave] = max(pool, key=lambda x: x[1])[0]
    return mapa


def _cap(base: str) -> str:
    return base[:1].upper() + base[1:] if base else base


def normalizar_consulta(q, mapa, proper, frases=()):
    """Reescreve a consulta com acentos canonicos e capitalizacao correta
    (minusculo, exceto nomes proprios e siglas/codigos). `frases` = nomes
    proprios compostos (ex.: 'Total Câmbio') que capitalizam varias palavras."""
    palavras = q.split()
    saida, i = [], 0
    while i < len(palavras):
        casou = False
        for ph in frases:  # tenta casar nome proprio composto
            n = len(ph)
            if [_deacc(w) for w in palavras[i:i + n]] == ph:
                for j, chave in enumerate(ph):
                    saida.append(_cap(mapa.get(chave, palavras[i + j].lower())))
                i += n
                casou = True
                break
        if casou:
            continue
        w = palavras[i]
        chave = _deacc(w)
        base = mapa.get(chave, w.lower())
        if chave in proper:
            base = _cap(base)
        elif _manter_maiusculo(w):
            base = w.upper() if any(c.isdigit() for c in w) else w
        saida.append(base)
        i += 1
    return " ".join(saida).strip()


def gerar_query_list(consultas, cfg, target):
    """Modo `query_list`: transforma as consultas reais num banco de textos
    ancora (unicos, acentuados) todos apontando para uma unica URL (ex.: a home).
    Ideal para backlinks de site de pagina unica / dominio."""
    nomes = cfg.get("proper_nouns", [])
    proper = {_deacc(p) for p in nomes if len(p.split()) == 1}
    frases = [_deacc(p).split() for p in nomes if len(p.split()) > 1]
    deny = {_deacc(x) for x in cfg.get("excluir_consultas", [])}
    min_imp = cfg.get("min_impressoes", 2)
    max_anc = cfg.get("max_anchors", 50)
    min_cont = cfg.get("min_tokens_conteudo", 2)
    mapa = construir_mapa_acentos(consultas)
    linhas, vistos = [], set()
    for q, imp in consultas:  # ja vem ordenado por cliques (relevancia)
        if imp < min_imp or _deacc(q) in deny:
            continue
        if len([t for t in _tokens(q) if t not in STOPWORDS]) < min_cont:
            continue
        anc = normalizar_consulta(q, mapa, proper, frases)
        chave = _deacc(anc)
        if not anc or chave in vistos or chave in deny:
            continue
        vistos.add(chave)
        linhas.append((anc, target))
        if len(linhas) >= max_anc:
            break
    return linhas


def url_para_slug(url: str) -> str:
    """Retorna o caminho da URL como slug unico (sem dominio, sem query, sem barras)."""
    caminho = urlparse(url).path.strip("/")
    return caminho


def restaurar_cidade(cidade_slug: str, uf: str, municipios: dict) -> str:
    """Devolve o nome acentuado do municipio; se nao achar, formata o slug."""
    chave = f"{uf.lower()}|{slugify(cidade_slug)}"
    if chave in municipios:
        return municipios[chave]
    # fallback: titlecase mantendo conectores em minusculo
    conectores = {"de", "do", "da", "dos", "das", "e"}
    palavras = cidade_slug.split("-")
    formatado = []
    for i, p in enumerate(palavras):
        formatado.append(p if (p in conectores and i > 0) else p.capitalize())
    return " ".join(formatado)


def casar_url(slug: str, cfg: dict, municipios: dict):
    """Casa o slug com o regex do projeto; devolve os campos (cidade/uf ja
    tratados) ou None se nao casar."""
    m = re.match(cfg["url_regex"], slug)
    if not m:
        return None
    campos = m.groupdict()
    if cfg.get("restaurar_acentos_cidade") and "cidade" in campos and "uf" in campos:
        campos["cidade"] = restaurar_cidade(campos["cidade"], campos["uf"], municipios)
    if "uf" in campos:
        campos["uf"] = campos["uf"].upper()
    return campos


def ancora_por_template(campos: dict, cfg: dict, ordem: int) -> str:
    """Gera o texto ancora a partir de template(s); rotaciona variacoes."""
    templates = cfg.get("anchor_templates") or [cfg["anchor_template"]]
    return templates[ordem % len(templates)].format(**campos)


# Nomes proprios/eponimos que devem manter a inicial maiuscula mesmo apos o
# down-case do Title Case. Chaves sem acento e minusculas (comparacao normalizada).
EPONIMOS = {
    "ferguson", "schmorl", "modic", "cobb", "lasegue", "charcot", "scheuermann",
    "parkinson", "alzheimer", "baastrup", "meyerding", "pfirrmann", "risser",
    "harrington", "wallis", "goiania", "brasil",
}


def minuscula_inicial(texto: str) -> str:
    """Baixa apenas a inicial (preserva siglas na 1a palavra)."""
    if not texto:
        return texto
    primeira = texto.split(" ", 1)[0]
    if any(c.islower() for c in primeira):
        return texto[0].lower() + texto[1:]
    return texto


def _manter_maiusculo(token: str) -> bool:
    """True para codigos tecnicos: contem digito (L5-S1, C4, 90) ou e sigla
    toda em maiusculas (RM, TC, HDA)."""
    nucleo = token.strip(".,;:?!()[]\"'")
    if any(c.isdigit() for c in nucleo):
        return True
    letras = [c for c in nucleo if c.isalpha()]
    # sigla so com 2+ letras maiusculas (evita tratar "O", "E", "A", "É" como sigla)
    return len(letras) >= 2 and all(c.isupper() for c in letras)


def sentence_case(texto: str) -> str:
    """Converte Title Case em sentence case: tudo minusculo, exceto codigos
    tecnicos e eponimos/nomes proprios conhecidos."""
    saida = []
    for token in texto.split(" "):
        if not token:
            saida.append(token)
            continue
        base = "".join(c for c in unicodedata.normalize("NFKD", token.lower())
                        if not unicodedata.combining(c) and c.isalnum())
        if _manter_maiusculo(token):
            # codigo tecnico: se mistura letra e digito (L5-S1, C4), normaliza p/ MAIUSCULO
            tem_digito = any(c.isdigit() for c in token)
            tem_letra = any(c.isalpha() for c in token)
            saida.append(token.upper() if (tem_digito and tem_letra) else token)
        elif base in EPONIMOS:
            saida.append(token[0].upper() + token[1:].lower())
        else:
            saida.append(token.lower())
    return " ".join(saida)


# Regras para transformar consultas em forma de pergunta em frases-chave
# declarativas, mais naturais como texto ancora de backlink. Ordem importa.
_REGRAS_NATURAL = [
    (r"^quanto tempo de ", ""),
    (r"^quanto tempo dura (?:uma |um )?", "duração de uma "),
    (r"^quanto tempo leva para ", "tempo para "),
    (r"^quanto tempo leva (?:uma |um )?", "duração de uma "),
    (r"^quantos anos dura (?:uma |um )?", "duração de uma "),
    (r"^quanto tempo (?:leva |dura |demora )?", ""),
    (r"^quanto pesa (?:uma |um )?", "peso de uma "),
    (r"^quanto custa (?:uma |um )?", "valor de uma "),
    (r"^qual (?:é |e )?(?:o |a )?(?:valor|preço|custo) (?:de |da |do )?", "valor de "),
    (r"^qual (?:é |e )?(?:o |a )?melhor ", "melhor "),
    (r"^qual exame ", "exame que "),
    (r"^quais (?:são |sao )?(?:os |as )?", ""),
    (r"^qual (?:é |e )?(?:o |a |os |as )?", ""),
    (r"^como funciona (?:o |a )?", ""),
    (r"^como é feita (?:a |o )?", ""),
    (r"^como é (?:a |o )?", ""),
    (r"^como saber se (?:a |o )?", ""),
    (r"^como ", ""),
    (r"^o que a pessoa com (.+?) não pode.*$", r"restrições com \1"),
    (r"^o que não pode (?:fazer )?(?:depois|após)(?: de| da| do)? ", "restrições após "),
    (r"^o que (.+?) pode causar$", r"consequências de \1"),
    (r"^o que causa (?:o |a )?", "causas de "),
    (r"^o que piora (?:a |o )?", ""),
    (r"^o que faz (?:um |uma )?", ""),
    (r"^o que pode ser ", ""),
    (r"^o que pode (?:causar )?", ""),
    (r"^o que acontece (?:se |quando |ao |após |depois )?", ""),
    (r"^o que significa ", ""),
    (r"^o que (?:é|e) (?:o |a )?", ""),
    (r"^quem pode (?:fazer |tomar |usar |realizar )?", ""),
    (r"^por que (?:o |a )?", ""),
    (r"^quando ", ""),
    (r"^onde fica (?:o |a |os |as )?", ""),
    (r"^onde ", ""),
]


def naturalizar_ancora(anc: str) -> str:
    """Converte consulta em forma de pergunta numa frase-chave declarativa,
    mais natural como texto ancora de backlink. Frases que ja sao declarativas
    passam intactas."""
    s = anc.strip().rstrip("?").strip()
    # "quem tem/coloca X pode Y" -> "Y com X"
    # remove cauda interrogativa ("... o que é", "... o que e")
    s = re.sub(r"\s+o que(?: é| e)?$", "", s, flags=re.I).strip()
    s = re.sub(r"^(?:é|e) ", "", s, flags=re.I).strip()  # "é"/"e" solto no inicio
    m = re.match(r"^quem (?:tem|coloca|faz|fez|possui) (.+?) pode (.+)$", s, re.I)
    if m:
        return f"{m.group(2)} com {m.group(1)}".strip()
    for pat, rep in _REGRAS_NATURAL:
        novo, n = re.subn(pat, rep, s, count=1, flags=re.I)
        if n:
            s = re.sub(r"^(\S+) (?:são|estão) ", r"\1 ", novo, count=1, flags=re.I)
            s = re.sub(r"^(?:uma |um |a |o |os |as |de |da |do |que )", "", s, count=1, flags=re.I)
            break
    s = s.strip()
    return s if len(s) >= 3 else anc.strip().rstrip("?").strip()


def limpar_titulo(titulo: str, cfg: dict) -> str:
    """Transforma o <title> da pagina em texto ancora: remove marca e filler,
    e ajusta a capitalizacao conforme cfg['casing']."""
    t = html_mod.unescape(titulo)
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    # corta a marca / subtitulo apos separadores comuns
    for sep in ("|", "–", "—", "•"):
        if sep in t:
            t = t.split(sep)[0].strip()
    t = t.split("…")[0].split("...")[0].strip()
    # mantem a pergunta, descarta o filler apos ela ("... grave? Entenda causas")
    if "?" in t:
        t = t[: t.index("?") + 1].strip()
    t = re.split(r"\s-\s", t)[0].strip()  # " - " (hifen com espacos)
    if cfg.get("titulo_cortar_dois_pontos", True) and ":" in t:
        t = t.split(":")[0].strip()
    casing = cfg.get("casing", "sentence")
    if casing == "sentence":
        t = sentence_case(t)
    elif casing == "lower_first":
        t = minuscula_inicial(t)
    return t


def buscar_titulo(url: str, tentativas: int = 2):
    """Baixa a pagina e devolve o texto bruto do <title>, ou None."""
    for _ in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                html = r.read().decode("utf-8", errors="replace")
            m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
            if m:
                return m.group(1)
            return None
        except Exception:
            continue
    return None


def ler_ancoras_existentes(path: str):
    """Le um CSV e devolve o conjunto de textos ancora ja usados (normalizados),
    a partir das colunas cujo cabecalho contem 'ancora'. Usado para NAO repetir."""
    raw = open(path, encoding="utf-8-sig", errors="replace").read()
    delim = ";" if raw.count(";") > raw.count(",") else ","
    linhas = list(csv.reader(raw.splitlines(), delimiter=delim))
    if not linhas:
        return set()
    cols = [i for i, h in enumerate(linhas[0]) if "ancora" in _deacc(h)]
    if not cols:  # sem cabecalho reconhecivel: assume 1a coluna
        cols = [0]
    usadas = set()
    for r in linhas[1:]:
        for i in cols:
            if i < len(r) and r[i].strip():
                usadas.add(r[i].strip())
    return usadas


def detectar_dominio(urls):
    for u in urls:
        host = urlparse(u).netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        if host:
            return host
    return None


def main():
    ap = argparse.ArgumentParser(description="Gera planilha texto-ancora + URL do GSC.")
    ap.add_argument("entrada", help="ZIP do GSC, pasta com CSVs ou um CSV (Paginas).")
    ap.add_argument("-o", "--saida", help="CSV de saida (padrao: ancoras_<dominio>.csv).")
    ap.add_argument("--projeto", help="Forca o projeto/dominio em projetos.json.")
    ap.add_argument("--min-cliques", type=int, default=0,
                    help="Mantem so URLs com pelo menos N cliques no relatorio.")
    ap.add_argument("--excluir-ancoras", help="CSV com ancoras ja usadas (nao repetir).")
    ap.add_argument("--max", type=int, default=0, help="Maximo de ancoras a gerar.")
    args = ap.parse_args()

    projetos = carregar_json("projetos.json")
    municipios = carregar_json("municipios.json")

    urls = ler_urls(args.entrada)
    if not urls:
        sys.exit("Nenhuma URL encontrada na entrada.")

    dominio = args.projeto or detectar_dominio(urls)
    if dominio not in projetos:
        sys.exit(
            f"Projeto '{dominio}' nao configurado em projetos.json.\n"
            f"Projetos disponiveis: {', '.join(projetos) or '(nenhum)'}"
        )
    cfg = projetos[dominio]

    # mantem apenas URLs do host do projeto (relatorios de propriedade "dominio"
    # trazem subdominios juntos; ex.: artigos em blog.* e paginas no host raiz)
    def _host(u):
        h = urlparse(u).netloc.lower()
        return h[4:] if h.startswith("www.") else h

    urls = [u for u in urls if _host(u) == dominio]
    if not urls:
        sys.exit(f"Nenhuma URL do host '{dominio}' na entrada.")

    # modo lista de consultas -> ancoras da homepage/dominio (site de 1 pagina)
    if cfg.get("anchor_source") == "query_list":
        consultas = ler_consultas(args.entrada)
        if not consultas:
            sys.exit("Nenhuma consulta encontrada no relatorio.")
        target = cfg.get("target_url") or f"https://{dominio}/"
        linhas = gerar_query_list(consultas, cfg, target)
        saida = args.saida or os.path.join(BASE_DIR, f"ancoras_{dominio}.csv")
        with open(saida, "w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Texto âncora", "URL"])
            w.writerows(linhas)
        print(f"Projeto: {dominio}")
        print(f"{len(linhas)} ancoras geradas (consultas reais) -> {target}")
        print(f"Planilha: {saida}")
        return

    # dedupe por URL limpa (sem query string), preservando ordem; casa o regex
    vistas = set()
    casadas = []  # (url_limpa, campos)
    ignoradas = 0
    for url in urls:
        partes = urlparse(url)
        url_limpa = f"{partes.scheme}://{partes.netloc}{partes.path}"
        if url_limpa in vistas:
            continue
        campos = casar_url(url_para_slug(url), cfg, municipios)
        if campos is None:
            ignoradas += 1
            continue
        vistas.add(url_limpa)
        casadas.append((url_limpa, campos))

    # filtro opcional por cliques (ex.: --min-cliques 11 = mais de 10 cliques)
    if args.min_cliques > 0:
        cliques = ler_cliques(args.entrada)
        antes = len(casadas)
        casadas = [(u, c) for u, c in casadas if cliques.get(u, 0) >= args.min_cliques]
        print(f"Filtro cliques >= {args.min_cliques}: mantidos {len(casadas)} de {antes}")

    # manter apenas posts vivos do WordPress (exclui paginas e artigos deletados)
    if cfg.get("manter_wp_posts"):
        vivos = ler_wp_posts_slugs(cfg["manter_wp_posts"])
        if vivos:
            antes = len(casadas)
            casadas = [(u, c) for u, c in casadas
                       if url_para_slug(u).split("/")[-1] in vivos]
            print(f"WP REST: {len(vivos)} posts vivos | mantidos {len(casadas)} de {antes} "
                  f"(removidos paginas/artigos deletados)")
        else:
            print("AVISO: nao consegui ler a REST API do WP; seguindo sem esse filtro.")

    # exclusoes opcionais: paginas listadas num sitemap e/ou slugs no denylist
    excluidas = 0
    paginas_sitemap = ler_sitemap(cfg["excluir_sitemap"]) if cfg.get("excluir_sitemap") else set()
    deny = set(cfg.get("excluir_slugs", []))
    if paginas_sitemap or deny:
        filtradas = []
        for url_limpa, campos in casadas:
            path = url_para_slug(url_limpa)
            if path in paginas_sitemap or path in deny:
                excluidas += 1
                continue
            filtradas.append((url_limpa, campos))
        casadas = filtradas
        print(f"{excluidas} paginas excluidas (sitemap/denylist) | {len(casadas)} artigos restantes")

    linhas = []
    falhas_titulo = 0
    fonte = cfg.get("anchor_source", "template")
    if fonte in ("page_title", "search_query"):
        # cache de titulos em disco: re-rodar (ou ajustar a limpeza) fica instantaneo
        cache_path = os.path.join(BASE_DIR, f".cache_titulos_{dominio}.json")
        cache = {}
        if os.path.exists(cache_path):
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
        faltam = [u for u, _ in casadas if u not in cache]
        if faltam and cfg.get("acentos_corpus"):
            faltam = []  # acentos vem do corpus de consultas; nao busca titulos
        if faltam:
            print(f"Buscando titulos de {len(faltam)} paginas (pode levar ~1 min)...")

            def fetch(u):
                return (u, buscar_titulo(u))

            with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
                for u, titulo in ex.map(fetch, faltam):
                    if titulo is not None:
                        cache[u] = titulo
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False)

        if fonte == "search_query" and cfg.get("multiplas_ancoras"):
            consultas = ler_consultas(args.entrada)
            excluir = ler_ancoras_existentes(args.excluir_ancoras) if args.excluir_ancoras else set()
            limite = args.max or cfg.get("max_ancoras") or None
            linhas = casar_multiplas_consultas(casadas, consultas, cache, cfg, excluir, limite)
            if excluir:
                print(f"{len(excluir)} ancoras existentes excluidas")
            n_pag = len(set(u for _, u in linhas))
            saida = args.saida or os.path.join(BASE_DIR, f"ancoras_{dominio}.csv")
            with open(saida, "w", encoding="utf-8-sig", newline="") as f:
                w = csv.writer(f)
                w.writerow(["Texto âncora", "URL"])
                w.writerows(linhas)
            print(f"Projeto: {dominio}")
            print(f"{len(linhas)} ancoras (varias por pagina) em {n_pag} de "
                  f"{len(casadas)} paginas vivas")
            print(f"Planilha: {saida}")
            return

        atrib = {}
        if fonte == "search_query":
            consultas = ler_consultas(args.entrada)
            atrib = casar_paginas_consultas(casadas, consultas, cache, cfg)
            print(f"{len(atrib)} paginas casadas com consulta real | "
                  f"{len(casadas) - len(atrib)} usarao o titulo")

        for url_limpa, _ in casadas:
            bruto = cache.get(url_limpa)
            anc = ""
            if url_limpa in atrib:  # ancora = consulta real, com acentos do titulo
                anc = sentence_case(restaurar_por_titulo(atrib[url_limpa], bruto or ""))
            if not anc:
                # fallback: slug deslugificado (unico e descritivo) com acentos do
                # titulo. Evita duplicatas e truncamentos do <title> generico.
                slug_txt = url_para_slug(url_limpa).split("/")[-1].replace("-", " ")
                anc = sentence_case(restaurar_por_titulo(slug_txt, bruto or ""))
                if not bruto:
                    falhas_titulo += 1  # sem titulo: acentos podem faltar
            if cfg.get("naturalizar_ancora", True):
                anc = naturalizar_ancora(anc)
            anc = anc.strip().rstrip(" .,;:-")  # remove pontuacao final (mantem "?")
            linhas.append((anc, url_limpa))

        # garantia final de unicidade: nenhum texto ancora repetido apontando para
        # URLs diferentes (ruim p/ backlink).
        def slugtext(url):
            base = url_para_slug(url).split("/")[-1].replace("-", " ")
            txt = sentence_case(restaurar_por_titulo(base, cache.get(url, "")))
            if cfg.get("naturalizar_ancora", True):
                txt = naturalizar_ancora(txt)
            return txt.strip().rstrip(" .,;:-")

        # 1) para cada texto repetido, o "dono exato" (cujo slug == ancora) mantem;
        #    os demais passam a usar o proprio slug (mais fiel ao tema da pagina)
        from collections import defaultdict
        grupos = defaultdict(list)
        for i, (anc, _u) in enumerate(linhas):
            grupos[anc.lower()].append(i)
        for chave, idxs in grupos.items():
            if len(idxs) < 2:
                continue
            dono = next((i for i in idxs if slugtext(linhas[i][1]).lower() == chave), idxs[0])
            for i in idxs:
                if i != dono:
                    linhas[i] = (slugtext(linhas[i][1]), linhas[i][1])
        # 2) passada final: se ainda restar colisao, usa o slug do repetido
        usados, unicas = set(), []
        for anc, url_limpa in linhas:
            if anc.lower() in usados:
                alt = slugtext(url_limpa)
                if alt and alt.lower() not in usados:
                    anc = alt
            usados.add(anc.lower())
            unicas.append((anc, url_limpa))
        linhas = unicas
    else:
        for ordem, (url_limpa, campos) in enumerate(casadas):
            linhas.append((ancora_por_template(campos, cfg, ordem), url_limpa))

    saida = args.saida or os.path.join(BASE_DIR, f"ancoras_{dominio}.csv")
    # utf-8-sig para o Google Sheets/Excel lerem os acentos corretamente
    with open(saida, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Texto âncora", "URL"])
        w.writerows(linhas)

    print(f"Projeto: {dominio}")
    print(f"{len(linhas)} linhas geradas | {ignoradas} URLs fora do padrao ignoradas")
    if cfg.get("anchor_source") == "page_title" and falhas_titulo:
        print(f"AVISO: {falhas_titulo} paginas sem titulo (usado fallback do slug, sem acento)")
    print(f"Planilha: {saida}")


if __name__ == "__main__":
    main()
