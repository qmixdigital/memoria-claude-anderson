"""As seis etapas de coleta na DataForSEO. Cada função devolve dados já normalizados."""
from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor

from .client import Cliente, ErroApi, TetoExcedido, resultado
from .config import IDIOMAS_FIXOS, MODELOS_PREFERIDOS, PRECOS
from .util import dominio


# ---------------------------------------------------------------- etapa 1
def custo_e1(n_kw: int) -> float:
    return PRECOS["labs_tarefa"] + PRECOS["labs_item"] * n_kw


def e1_palavras(cli: Cliente, tema: str, pais: dict, n_kw: int) -> list[dict]:
    """DataForSEO Labs keyword_suggestions: palavras que contêm o tema, por volume."""
    tarefa = {
        "keyword": tema,
        "location_code": pais["location_code"],
        "language_code": pais["language_code"],
        "include_seed_keyword": True,
        "limit": n_kw,
        "order_by": ["keyword_info.search_volume,desc"],
    }
    t = cli.post("/v3/dataforseo_labs/google/keyword_suggestions/live", tarefa, custo_e1(n_kw), f"E1 palavras '{tema}'")
    res = resultado(t)
    itens = list(res.get("items") or [])
    semente = res.get("seed_keyword_data")
    if semente and semente.get("keyword_info"):
        if not any((i.get("keyword") == semente.get("keyword")) for i in itens):
            itens.insert(0, semente)
    saida = []
    vistos = set()
    for it in itens:
        kw = (it.get("keyword") or "").strip()
        if not kw or kw in vistos:
            continue
        vistos.add(kw)
        ki = it.get("keyword_info") or {}
        kp = it.get("keyword_properties") or {}
        si = it.get("search_intent_info") or {}
        meses = [m.get("search_volume") for m in (ki.get("monthly_searches") or [])]
        meses = list(reversed(meses))[-12:]  # mais antigo -> mais recente
        saida.append({
            "kw": kw,
            "vol": ki.get("search_volume"),
            "cpc": ki.get("cpc"),
            "conc": ki.get("competition_level"),
            "kd": kp.get("keyword_difficulty"),
            "intencao": si.get("main_intent") or "sem dado",
            "tend_ano": (ki.get("search_volume_trend") or {}).get("yearly"),
            "meses": meses,
        })
    saida.sort(key=lambda x: -(x["vol"] or 0))
    return saida


# ---------------------------------------------------------------- etapa 2
def custo_e2(n: int) -> float:
    return PRECOS["ai_kw_tarefa"] + PRECOS["ai_kw_item"] * n


def e2_volume_ia(cli: Cliente, palavras: list[str], pais: dict, tema: str) -> dict[str, int | None]:
    """AI Keyword Data: índice de volume em IA. Até 1000 palavras por pedido."""
    mapa: dict[str, int | None] = {}
    for i in range(0, len(palavras), 1000):
        lote = palavras[i:i + 1000]
        tarefa = {"keywords": lote, "location_code": pais["location_code"], "language_code": pais["language_code"]}
        t = cli.post("/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live", tarefa, custo_e2(len(lote)), f"E2 volume IA '{tema}' ({len(lote)} palavras)")
        for it in resultado(t).get("items") or []:
            mapa[it.get("keyword")] = it.get("ai_search_volume")
    return mapa


# ---------------------------------------------------------------- etapas 3 e 5 (LLM Mentions)
def custo_mentions(n_linhas: int, n_dominios: int) -> float:
    return 2 * PRECOS["llm_mentions_tarefa"] + PRECOS["llm_mentions_item"] * (n_linhas + n_dominios)


def _grupo_valor(item: dict, campo: str):
    """Valor no nível do item ou, se ausente, no primeiro group_element de platform/location."""
    if item.get(campo) is not None:
        return item[campo]
    for g in ("platform", "location", "language"):
        lst = item.get(g) or []
        if lst and isinstance(lst, list) and lst[0].get(campo) is not None:
            return lst[0][campo]
    return None


def llm_mentions(cli: Cliente, keyword: str, plataforma: str, location_code: int, language_code: str,
                 n_linhas: int, n_dominios: int, etiqueta: str) -> dict:
    """Base pronta de respostas de IA: domínios mais citados e perguntas reais com o tema."""
    alvo = [{"keyword": keyword, "search_scope": ["question"]}]
    custo_td = PRECOS["llm_mentions_tarefa"] + PRECOS["llm_mentions_item"] * max(n_dominios, 100)
    custo_sm = PRECOS["llm_mentions_tarefa"] + PRECOS["llm_mentions_item"] * n_linhas

    dominios: list[dict] = []
    perguntas: list[dict] = []
    marcas: list[str] = []
    erros: list[str] = []

    try:
        base = {"target": alvo, "platform": plataforma, "location_code": location_code, "language_code": language_code, "links_scope": "sources"}
        try:
            t = cli.post("/v3/ai_optimization/llm_mentions/top_mentioned_domains/live", {**base, "limit": n_dominios, "internal_list_limit": 3}, custo_td, f"{etiqueta} domínios")
        except ErroApi as e:
            if "Invalid Field" not in str(e):
                raise
            t = cli.post("/v3/ai_optimization/llm_mentions/top_mentioned_domains/live", {**base, "items_list_limit": min(10, n_dominios), "internal_list_limit": 1}, custo_td, f"{etiqueta} domínios")
        for it in (resultado(t).get("items") or [])[:n_dominios]:
            d = dominio(it.get("domain") or it.get("key")) or it.get("domain") or it.get("key")
            if not d:
                continue
            tot = it.get("total") or {}
            dominios.append({
                "dominio": d,
                "mencoes": tot.get("mentions") or _grupo_valor(it, "mentions") or 0,
                "volume_ia": tot.get("ai_search_volume") or _grupo_valor(it, "ai_search_volume") or 0,
            })
            # nomes reais de marca citados junto com esse domínio
            for b in it.get("brand_entities_title") or []:
                if b.get("key"):
                    marcas.append(str(b["key"]))
    except (ErroApi, TetoExcedido) as e:
        erros.append(f"top_mentioned_domains: {e}")
        if isinstance(e, TetoExcedido):
            raise

    try:
        t = cli.post("/v3/ai_optimization/llm_mentions/search_mentions/live", {
            "target": alvo, "platform": plataforma, "location_code": location_code, "language_code": language_code,
            "limit": n_linhas, "order_by": ["ai_search_volume,desc"],
        }, custo_sm, f"{etiqueta} perguntas")
        for it in resultado(t).get("items") or []:
            fontes = []
            for s in it.get("sources") or []:
                d = dominio(s.get("url")) or dominio(s.get("domain"))
                if d:
                    fontes.append(d)
            # brand_entities do search_mentions trazem só a descrição ("health insurance company"), não o nome: ignorados
            perguntas.append({
                "pergunta": it.get("question"),
                "volume_ia": it.get("ai_search_volume") or 0,
                "fontes": fontes,
                "fan_out": list(it.get("fan_out_queries") or [])[:3],
            })
    except (ErroApi, TetoExcedido) as e:
        erros.append(f"search_mentions: {e}")
        if isinstance(e, TetoExcedido):
            raise

    return {"dominios": dominios, "perguntas": perguntas, "marcas": marcas, "erros": erros}


# ---------------------------------------------------------------- etapa 4
def custo_e4(n_serp: int, n_modo: int) -> float:
    return n_serp * (PRECOS["serp_live"] + PRECOS["serp_aio_extra"]) + n_modo * PRECOS["ai_mode_live"]


def _refs_ai_overview(bloco: dict) -> list[str]:
    """Domínios de todas as referências e links de um ai_overview, em qualquer nível."""
    fontes: list[str] = []

    def add(lst):
        for r in lst or []:
            d = dominio(r.get("url")) or dominio(r.get("domain"))
            if d:
                fontes.append(d)

    add(bloco.get("references"))
    for el in bloco.get("items") or []:
        add(el.get("references"))
        add(el.get("links"))
        for comp in el.get("components") or []:
            add(comp.get("references"))
            add(comp.get("links"))
        # elementos expandidos aninhados
        for sub in el.get("items") or []:
            add(sub.get("references"))
            add(sub.get("links"))
    return fontes


def _texto_ai_overview(bloco: dict) -> str:
    if bloco.get("markdown"):
        return bloco["markdown"]
    partes = []
    for el in bloco.get("items") or []:
        for campo in ("markdown", "text"):
            if el.get(campo):
                partes.append(el[campo])
                break
        for comp in el.get("components") or []:
            if comp.get("text"):
                partes.append(comp["text"])
    return "\n".join(partes)


def e4_serp(cli: Cliente, busca: str, pais: dict) -> dict:
    """Google real: top 10 orgânico e fontes do resumo de IA da mesma página."""
    tarefa = {
        "keyword": busca, "location_code": pais["location_code"], "language_code": pais["language_code"],
        "device": "desktop", "depth": 10, "load_async_ai_overview": True,
    }
    t = cli.post("/v3/serp/google/organic/live/advanced", tarefa, PRECOS["serp_live"] + PRECOS["serp_aio_extra"], f"E4 Google '{busca}'")
    res = resultado(t)
    organicos: list[str] = []
    aio_fontes: list[str] = []
    tem_aio = False
    aio_texto = ""
    for it in res.get("items") or []:
        tipo = it.get("type")
        if tipo == "organic":
            d = dominio(it.get("url")) or dominio(it.get("domain"))
            if d and d not in organicos:
                organicos.append(d)
        elif tipo == "ai_overview":
            if it.get("items") or it.get("references"):
                tem_aio = True
            aio_fontes += _refs_ai_overview(it)
            aio_texto += _texto_ai_overview(it)
    return {"organicos": organicos[:10], "aio_fontes": aio_fontes, "tem_aio": tem_aio, "aio_texto": aio_texto}


_IDIOMAS_CACHE: dict[str, str] = {}


def idioma_endpoint(cli: Cliente, path_languages: str, pais: dict) -> str:
    """Alguns endpoints (AI Mode, LLM Scraper) usam códigos regionais, ex.: pt-BR em vez de pt.
    Consulta a lista gratuita de idiomas do endpoint e escolhe o melhor código."""
    base, iso = pais["language_code"], pais.get("iso", "")
    fixo = IDIOMAS_FIXOS.get((iso, path_languages))
    if fixo:
        return fixo
    chave = f"{path_languages}|{base}|{iso}"
    if chave in _IDIOMAS_CACHE:
        return _IDIOMAS_CACHE[chave]
    escolha = base
    try:
        r = cli.get(path_languages)
        codigos = [str(x.get("language_code")) for x in ((r.get("tasks") or [{}])[0].get("result") or [])]
        regional = f"{base}-{iso}"
        if regional in codigos:
            escolha = regional
        elif base in codigos:
            escolha = base
        else:
            cand = [c for c in codigos if c.lower().startswith(base.lower() + "-")]
            if cand:
                escolha = cand[0]
    except ErroApi:
        pass
    _IDIOMAS_CACHE[chave] = escolha
    return escolha


def e4_modo_ia(cli: Cliente, busca: str, pais: dict) -> dict:
    lang = idioma_endpoint(cli, "/v3/serp/google/ai_mode/languages", pais)
    tarefa = {"keyword": busca, "location_code": pais["location_code"], "language_code": lang}
    t = cli.post("/v3/serp/google/ai_mode/live/advanced", tarefa, PRECOS["ai_mode_live"], f"E4 Modo IA '{busca}'")
    res = resultado(t)
    fontes: list[str] = []
    texto = ""
    for it in res.get("items") or []:
        if it.get("type") == "ai_overview":
            fontes += _refs_ai_overview(it)
            texto += _texto_ai_overview(it)
    return {"fontes": fontes, "texto": texto}


# ---------------------------------------------------------------- etapa 6
def escolher_modelo(cli: Cliente, plataforma: str, log=print) -> str | None:
    try:
        lista = cli.modelos(plataforma)
    except ErroApi as e:
        log(f"   ! não foi possível listar modelos de {plataforma}: {e}")
        lista = []
    nomes = [m.get("model_name") for m in lista if m.get("model_name")]
    com_web = {m.get("model_name") for m in lista if m.get("web_search_supported") in (True, None)}
    for padrao in MODELOS_PREFERIDOS.get(plataforma, []):
        for n in nomes:
            if re.match(padrao, n) and n in com_web:
                return n
    for n in nomes:
        if n in com_web:
            return n
    # sem lista: usa o primeiro padrão literal
    padrao = MODELOS_PREFERIDOS.get(plataforma, [""])[0]
    return padrao.strip("^$").replace("\\", "") or None


def custo_e6(n_perguntas: int, plataformas: list[str], usar_scraper: bool) -> float:
    total = 0.0
    for p in plataformas:
        if usar_scraper and p in ("chat_gpt", "gemini"):
            total += PRECOS["llm_scraper_live"]
        else:
            total += PRECOS["llm_responses_tarefa"] + PRECOS.get(f"llm_{p}", 0.015)
    return total * n_perguntas


def _nome_marca(b: dict) -> str | None:
    """No LLM Scraper, o nome da marca vem em `markdown` ("Porto Seguro"); `title` é a descrição."""
    nome = (b.get("markdown") or "").strip().strip("*_`")
    if not nome:
        return None
    return nome


def _resp_scraper(cli: Cliente, plataforma: str, pergunta: str, pais: dict) -> dict:
    lang = idioma_endpoint(cli, f"/v3/ai_optimization/{plataforma}/llm_scraper/languages", pais)
    tarefa = {"keyword": pergunta, "location_code": pais["location_code"], "language_code": lang}
    if plataforma == "chat_gpt":
        tarefa["force_web_search"] = True
    try:
        t = cli.post(f"/v3/ai_optimization/{plataforma}/llm_scraper/live/advanced", tarefa, PRECOS["llm_scraper_live"], f"E6 {plataforma} (app) '{pergunta[:40]}'")
    except ErroApi as e:
        if "Timeout" not in str(e) and "50401" not in str(e):
            raise
        # o aplicativo às vezes estoura os 120 s; uma segunda tentativa costuma resolver
        t = cli.post(f"/v3/ai_optimization/{plataforma}/llm_scraper/live/advanced", tarefa, PRECOS["llm_scraper_live"], f"E6 {plataforma} (app, 2ª) '{pergunta[:40]}'")
    res = resultado(t)
    fontes, marcas = [], []
    for s in res.get("sources") or []:
        d = dominio(s.get("url")) or dominio(s.get("domain"))
        if d:
            fontes.append(d)
    for it in res.get("items") or []:
        for s in it.get("sources") or []:
            d = dominio(s.get("url")) or dominio(s.get("domain"))
            if d and d not in fontes:
                fontes.append(d)
        for b in it.get("brand_entities") or []:
            n = _nome_marca(b)
            if n:
                marcas.append(n)
    for b in res.get("brand_entities") or []:
        n = _nome_marca(b)
        if n:
            marcas.append(n)
    return {"texto": res.get("markdown") or "", "fontes": fontes, "marcas_api": marcas, "modelo": res.get("model"), "via": "app", "custo": float((t or {}).get("cost") or 0)}


def _resp_llm(cli: Cliente, plataforma: str, pergunta: str, pais: dict, modelo: str, iso: str) -> dict:
    tarefa = {"user_prompt": pergunta[:500], "model_name": modelo, "max_output_tokens": 1024}
    if plataforma != "perplexity":
        tarefa["web_search"] = True
    if plataforma in ("chat_gpt", "claude", "perplexity"):
        tarefa["web_search_country_iso_code"] = iso
    custo = PRECOS["llm_responses_tarefa"] + PRECOS.get(f"llm_{plataforma}", 0.015)
    t = cli.post(f"/v3/ai_optimization/{plataforma}/llm_responses/live", tarefa, custo, f"E6 {plataforma} '{pergunta[:40]}'")
    res = resultado(t)
    textos, fontes = [], []
    for it in res.get("items") or []:
        if it.get("type") != "message":
            continue
        for sec in it.get("sections") or []:
            if sec.get("text"):
                textos.append(sec["text"])
            for a in sec.get("annotations") or []:
                d = dominio(a.get("direct_url") or a.get("url"))
                if d and d not in fontes:
                    fontes.append(d)
    return {"texto": "\n".join(textos), "fontes": fontes, "marcas_api": [], "modelo": res.get("model_name") or modelo, "via": "api", "custo": float((t or {}).get("cost") or 0)}


def e6_respostas(cli: Cliente, perguntas: list[str], pais: dict, iso: str, plataformas: list[str],
                 usar_scraper: bool, modelos: dict[str, str | None], log=print, paralelo: int = 4) -> dict[str, dict[str, dict]]:
    """Faz cada pergunta a cada IA. Devolve {pergunta: {plataforma: resposta}}."""
    saida: dict[str, dict[str, dict]] = {p: {} for p in perguntas}
    tarefas = [(p, pl) for p in perguntas for pl in plataformas]

    def uma(par):
        pergunta, pl = par
        try:
            if usar_scraper and pl in ("chat_gpt", "gemini"):
                try:
                    return pergunta, pl, _resp_scraper(cli, pl, pergunta, pais)
                except ErroApi as e:
                    log(f"   ! {pl} (app) falhou, tentando pela API: {e}")
            if not modelos.get(pl):
                return pergunta, pl, {"erro": "sem modelo disponível"}
            return pergunta, pl, _resp_llm(cli, pl, pergunta, pais, modelos[pl], iso)
        except TetoExcedido as e:
            return pergunta, pl, {"erro": f"teto: {e}"}
        except ErroApi as e:
            return pergunta, pl, {"erro": str(e)}

    if cli.dry_run:
        for par in tarefas:
            p, pl, r = uma(par)
            if r is not None:
                saida[p][pl] = r
        return saida

    with ThreadPoolExecutor(max_workers=max(1, paralelo)) as ex:
        for p, pl, r in ex.map(uma, tarefas):
            if "erro" in r:
                log(f"   ! {pl} '{p[:40]}': {r['erro']}")
            saida[p][pl] = r
    return saida
