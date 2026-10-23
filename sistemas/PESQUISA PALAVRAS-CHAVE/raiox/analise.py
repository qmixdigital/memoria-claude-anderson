"""Transforma a coleta bruta no dados.json do relatório (mesmo esquema do Raio-X original, generalizado)."""
from __future__ import annotations

from collections import Counter

from .util import eh_pergunta, marca_aparece, trecho


def resumo_palavras(kws: list[dict], vol_ia: dict[str, int | None], n_ia: int) -> dict:
    """Totais, intenção, top, perguntas, oportunidades, CPC e índice de IA de um tema."""
    for k in kws:
        k["vol_ia"] = vol_ia.get(k["kw"])
    com_vol = [k for k in kws if (k.get("vol") or 0) > 0]
    vol_total = sum(k["vol"] for k in com_vol)
    cpc_pond = sum((k.get("cpc") or 0) * k["vol"] for k in com_vol) / vol_total if vol_total else 0
    intencao = Counter(k.get("intencao") or "sem dado" for k in com_vol)
    perguntas = [k for k in com_vol if eh_pergunta(k["kw"])]
    oportunidades = [k for k in com_vol if k["vol"] >= 1000 and (k.get("kd") is not None) and k["kd"] <= 20]
    cpc_alto = sorted([k for k in com_vol if (k.get("cpc") or 0) > 0 and k["vol"] >= 100], key=lambda k: -k["cpc"])
    top_ia = sorted([k for k in com_vol if k.get("vol_ia")], key=lambda k: -k["vol_ia"])
    base_ia = com_vol[:n_ia]
    return {
        "n": len(com_vol),
        "volume_total": vol_total,
        "cpc_medio": round(cpc_pond, 2),
        "intencao": dict(intencao.most_common()),
        "top": com_vol[:20],
        "oportunidades": oportunidades[:15],
        "n_oportunidades": len(oportunidades),
        "perguntas": perguntas[:15],
        "n_perguntas": len(perguntas),
        "cpc_mais_alto": cpc_alto[:10],
        "cabeca": com_vol[0] if com_vol else None,
        "top_ia": top_ia[:12],
        "vol_ia_total": sum(k["vol_ia"] for k in base_ia if k.get("vol_ia")),
        "vol_google_com_ia": sum(k["vol"] for k in base_ia if k.get("vol_ia")),
    }


def escolher_buscas(kws: list[dict], tema: str, n: int, perguntas: list[dict], idioma: str = "pt") -> list[str]:
    """As buscas principais do tema para o Google real: a principal, mais barato, melhor, quanto custa, online e a pergunta mais buscada."""
    padroes = {
        "pt": ["mais barato", "melhor", "quanto custa", "online", "cotação|cotacao|simulação|simulacao|preço|preco|valor", "individual|empresarial|mei|familiar"],
        "es": ["más barato|barato", "mejor", "cuánto cuesta|precio", "online", "cotización|cotizar", "individual|familiar"],
        "en": ["cheap", "best", "how much|cost", "online", "quote", "individual|family|small business"],
    }.get(idioma, ["mais barato", "melhor", "quanto custa", "online"])
    import re
    escolhidas: list[str] = []
    cabeca = kws[0]["kw"] if kws else tema
    escolhidas.append(cabeca)
    for pad in padroes:
        rx = re.compile(pad, re.I)
        cand = [k for k in kws if rx.search(k["kw"]) and k["kw"] not in escolhidas and (k.get("vol") or 0) > 0]
        if cand:
            escolhidas.append(cand[0]["kw"])
        if len(escolhidas) >= n - 1:
            break
    for p in perguntas:
        if p["kw"] not in escolhidas:
            escolhidas.append(p["kw"])
            break
    while len(escolhidas) < n:
        extra = next((k["kw"] for k in kws if k["kw"] not in escolhidas), None)
        if not extra:
            break
        escolhidas.append(extra)
    return escolhidas[:n]


def perguntas_padrao(tema: str, pais: dict, perguntas_kw: list[dict], n: int) -> list[str]:
    """Perguntas como um cliente real faria, inspiradas nos padrões da base do ChatGPT (preço por mês, qual evitar, mais barato na cidade, cobre X)."""
    t = tema.lower()
    moeda, cidade = pais.get("moeda", "R$"), pais.get("cidade", "São Paulo")
    modelos = [
        f"qual o melhor {t} do {pais.get('nome', 'Brasil')}",
        f"quanto custa {t} por mês",
        f"qual {t} mais barato",
        f"vale a pena contratar {t}",
        f"o que {t} cobre e o que não cobre",
        f"qual {t} devo evitar",
        f"qual {t} tem mais reclamações",
        f"{moeda} 300 por mês é caro para {t}?",
        f"qual {t} mais barato em {cidade}?",
        f"é mais barato contratar {t} com corretor ou online?",
        f"como escolher {t} sem errar",
    ]
    # as duas perguntas mais buscadas no Google entram primeiro
    base = [p["kw"] for p in perguntas_kw[:2]]
    saida = list(dict.fromkeys(base + modelos))
    return saida[:n]


# ---------------------------------------------------------------- marcas e fontes
def montar_lexico(marcas_api: list[str], extras: list[str]) -> list[str]:
    """Nomes de marca vindos das APIs (brand_entities) mais os informados pelo usuário, sem repetição.

    Descarta descrições (mais de 4 palavras ou tudo em minúsculas) e funde variantes:
    se "Suhai" e "Suhai Seguradora" aparecem, fica só "Suhai".
    """
    vistos: dict[str, str] = {}
    for m in list(extras) + list(marcas_api):
        m = (m or "").strip().strip("*_`\"'")
        if len(m) < 3 or len(m.split()) > 4:
            continue
        if m == m.lower() and m not in extras:
            continue  # "operadora de planos de saúde" não é nome
        ch = m.lower()
        if ch not in vistos:
            vistos[ch] = m
    nomes = list(vistos.values())
    finais = []
    for n in sorted(nomes, key=len):
        base = n.lower()
        if any(base.startswith(f.lower() + " ") for f in finais):
            continue
        finais.append(n)
    return finais


def canonico(nome: str, lexico: list[str]) -> str:
    """'Suhai Seguradora' vira 'Suhai' se 'Suhai' está no léxico (o léxico já guarda a forma mais curta)."""
    n = nome.strip().strip("*_`\"'")
    nl = n.lower()
    for f in sorted(lexico, key=len):
        fl = f.lower()
        if nl == fl or nl.startswith(fl + " "):
            return f
    return n


def marcas_na_resposta(resp: dict, lexico: list[str]) -> list[str]:
    texto = resp.get("texto") or ""
    achadas = {m for m in lexico if marca_aparece(m, texto)}
    for m in resp.get("marcas_api") or []:
        if m and len(m.split()) <= 4:
            achadas.add(canonico(m, lexico))
    return sorted(achadas, key=str.lower)


def consolidar_respostas(respostas: dict[str, dict[str, dict]], lexico: list[str], rotulos: dict[str, str],
                         pergunta_tema: dict[str, str], temas: list[str]) -> dict:
    """Tabela marca x IA, fontes por tema e a lista de respostas por pergunta no formato do relatório."""
    saida_resp: dict[str, dict[str, dict]] = {}
    marcas_tema: dict[str, Counter] = {t: Counter() for t in temas}
    marcas_pl: dict[str, dict[str, Counter]] = {t: {} for t in temas}
    fontes_tema: dict[str, Counter] = {t: Counter() for t in temas}
    # rótulo por plataforma: "(app)" só quando todas as respostas dela vieram pelo aplicativo
    vias: dict[str, set] = {}
    for por_pl in respostas.values():
        for pl, r in por_pl.items():
            if r and "erro" not in r:
                vias.setdefault(pl, set()).add(r.get("via"))
    rotulo_pl = {pl: rotulos.get(pl, pl) + (" (app)" if v == {"app"} else "") for pl, v in vias.items()}
    for pergunta, por_pl in respostas.items():
        tema = pergunta_tema.get(pergunta, temas[0])
        saida_resp[pergunta] = {}
        for pl, r in por_pl.items():
            if not r or "erro" in r:
                continue
            rotulo = rotulo_pl.get(pl, rotulos.get(pl, pl))
            marcas = marcas_na_resposta(r, lexico)
            fontes = list(dict.fromkeys(r.get("fontes") or []))
            saida_resp[pergunta][rotulo] = {
                "marcas": marcas, "fontes": fontes, "n_fontes": len(r.get("fontes") or []),
                "trecho": trecho(r.get("texto") or ""), "modelo": r.get("modelo"), "via": r.get("via"),
            }
            for m in marcas:
                marcas_tema[tema][m] += 1
                marcas_pl[tema].setdefault(rotulo, Counter())[m] += 1
            for f in fontes:
                fontes_tema[tema][f] += 1
    return {
        "respostas": saida_resp,
        "marcas": {t: [list(x) for x in c.most_common(15)] for t, c in marcas_tema.items()},
        "marcas_por_plataforma": {t: {pl: [list(x) for x in c.most_common(8)] for pl, c in d.items()} for t, d in marcas_pl.items()},
        "fontes_ia": {t: [list(x) for x in c.most_common(15)] for t, c in fontes_tema.items()},
    }


# ---------------------------------------------------------------- lições tiradas dos dados
def licoes(d: dict) -> list[str]:
    """5 a 7 observações construídas só a partir dos números coletados. Sem achismo: cada frase cita o dado."""
    out: list[str] = []
    temas = d.get("temas") or {}
    pal = d.get("palavras") or {}

    # intenção comercial
    for slug, P in pal.items():
        tot = sum(P["intencao"].values()) or 1
        com = P["intencao"].get("commercial", 0)
        if com / tot >= 0.5:
            n_fmt = f"{P['n']:,}".replace(",", ".")
            out.append(f"<b>Quem busca {temas[slug].lower()} está comparando.</b> {round(100 * com / tot)}% das {n_fmt} buscas têm intenção comercial. Páginas de comparação, tabela de preço e ranking atendem essa fatia.")
            break

    # oportunidades
    opp = [(temas[s], P["n_oportunidades"], P["oportunidades"][:3]) for s, P in pal.items() if P["n_oportunidades"]]
    if opp:
        nome, n, ex = max(opp, key=lambda x: x[1])
        exs = ", ".join(f'"{k["kw"]}"' for k in ex)
        out.append(f"<b>Há buscas grandes com pouca concorrência.</b> Em {nome.lower()}, {n} palavras têm 1.000 ou mais buscas por mês e dificuldade até 20, como {exs}.")

    # AI Overview: fonte número 1
    aio = d.get("aio_dominios") or {}
    tops = [(k, v[0]["dominio"]) for k, v in aio.items() if v]
    if tops:
        c = Counter(t[1] for t in tops)
        dom, n = c.most_common(1)[0]
        if n == len(tops):
            out.append(f"<b>{dom} é a fonte número 1 do resumo de IA do Google</b> em todos os temas pesquisados. Conteúdo nesse domínio entra nas respostas.")
        else:
            out.append("<b>Quem o resumo de IA do Google mais cita:</b> " + "; ".join(f'"{k}" cita {dm}' for k, dm in tops) + ".")

    # SERP x AIO
    serp = d.get("serp") or {}
    if serp:
        t_ao, t_in = 0, 0
        for s in serp.values():
            ao = list(dict.fromkeys(s.get("aio_fontes") or []))
            org = set((s.get("organicos") or [])[:10])
            t_ao += len(ao)
            t_in += sum(1 for x in ao if x in org)
        if t_ao:
            out.append(f"<b>Não basta estar no top 10.</b> Só {t_in} de {t_ao} fontes do resumo de IA ({round(100 * t_in / t_ao)}%) também estão na primeira página do Google nas {len(serp)} buscas conferidas. A IA busca fontes fora do top 10.")

    # fontes das IAs
    fontes = d.get("fontes_ia") or {}
    for slug, lst in fontes.items():
        if lst:
            top3 = ", ".join(f[0] for f in lst[:3])
            out.append(f"<b>Sites que as IAs mais usam como fonte em {temas[slug].lower()}:</b> {top3}. Não são os maiores do setor: são páginas que respondem a pergunta com número e data.")
            break

    # marcas
    marcas = d.get("marcas") or {}
    for slug, lst in marcas.items():
        if lst:
            out.append(f"<b>Marca mais citada pelas IAs em {temas[slug].lower()}:</b> {lst[0][0]}, em {lst[0][1]} respostas. Quem não aparece nessa lista não existe para quem pergunta à IA.")
            break

    # volume IA x Google
    for slug, P in pal.items():
        if P.get("vol_ia_total") and P.get("vol_google_com_ia"):
            pct = 100 * P["vol_ia_total"] / P["vol_google_com_ia"]
            out.append(f"<b>A busca em IA ainda é pequena perto do Google.</b> Em {temas[slug].lower()}, o índice de IA equivale a {pct:.1f}% do volume do Google para as mesmas palavras. Vale preparar o conteúdo agora, enquanto a concorrência é menor.")
            break

    # padrões da base em inglês
    en = d.get("chatgpt_en_perguntas") or {}
    for k, lst in en.items():
        if lst:
            out.append(f'<b>Escreva para a pergunta, não para a palavra.</b> Na base do ChatGPT em inglês, as perguntas reais sobre "{k}" têm formato de conversa: "{lst[0]["pergunta"]}". Páginas que respondem isso na primeira frase viram fonte.')
            break

    return out[:7]


def notas(d: dict) -> dict[str, str]:
    """Textos curtos de 'o que chama atenção', gerados dos dados."""
    n: dict[str, str] = {}
    aio = d.get("aio_dominios") or {}
    if aio:
        partes = []
        for k, lst in aio.items():
            if lst:
                partes.append(f'em "{k}", {lst[0]["dominio"]} ({lst[0]["mencoes"]} menções)' + (f", depois {lst[1]['dominio']} e {lst[2]['dominio']}" if len(lst) > 2 else ""))
        n["aio"] = "Domínio mais citado pelo resumo de IA do Google: " + "; ".join(partes) + "."
    fontes = d.get("fontes_ia") or {}
    partes = []
    for slug, lst in fontes.items():
        if lst:
            partes.append(f"{d['temas'][slug].lower()}: " + ", ".join(f"{f[0]} ({f[1]})" for f in lst[:4]))
    if partes:
        n["fontes"] = "Sites mais usados como fonte pelas IAs, somando as plataformas. " + "; ".join(partes) + "."
    return n
