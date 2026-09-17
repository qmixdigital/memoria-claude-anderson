#!/usr/bin/env python3
"""
Coleta Search Console e Google Analytics 4 para o relatorio unico.

Cada cliente do config.json pode ter um bloco "google":

  "google": {
    "search_console": { "site": "sc-domain:exemplo.com.br",
                        "credencial": "backlinkguard-google-sa.json" },
    "ga4":            { "propriedade": "378259356",
                        "credencial": "enjai-493011-5bc78ff8f355.json" }
  }

As credenciais sao contas de servico Google. O caminho da pasta vem de
"pasta_credenciais" no config (padrao: Documentos/APIs).

Uso direto, para conferir o que uma conta de servico enxerga:
  python google_dados.py --listar
"""

import argparse
import json
import os
from collections import Counter
from datetime import date, timedelta

PASTA_PADRAO = os.path.join(os.path.expanduser("~"), "Documents", "APIs")

ESCOPO_GSC = ["https://www.googleapis.com/auth/webmasters.readonly"]
ESCOPO_GA4 = ["https://www.googleapis.com/auth/analytics.readonly"]

# O Search Console fecha os dados com ~3 dias de atraso; o GA4, com ~1 dia.
ATRASO_GSC = 3
ATRASO_GA4 = 1

# Origens de trafego que representam uma IA mandando visita para o site.
FONTES_IA = ("chatgpt", "openai", "perplexity", "gemini", "copilot",
             "claude", "bard", "you.com", "phind")

# Eventos que representam um paciente entrando em contato. Cobre os nomes que
# a rede ja usa (cta_..._wa, generate_lead) e os padroes mais comuns.
EVENTOS_CONTATO = ("whats", "_wa", "wa_", "generate_lead", "lead", "contato",
                   "telefone", "phone", "click_to_call", "form", "agendar")

# Buscadores alternativos que o GA4 joga em "Referral". Nao sao backlinks:
# ninguem publicou um link ali, a pessoa pesquisou. Misturar os dois faria o
# relatorio prometer link building onde nao houve nenhum.
BUSCADORES = ("search.", "busca.", "yandex", "bing", "duckduckgo", "ecosia",
              "brave", "qwant", "startpage", "ubersear", "ginksearch",
              "nortonsafesearch", "lukol", "mojeek", "presearch")

# Origens de "Referral" que nao sao link publicado por ninguem: a pessoa
# passou por um checkout, um gateway de pagamento, um webmail, um painel de
# anuncios ou uma ferramenta nossa e voltou. Em loja virtual isso domina a
# lista e faria o relatorio chamar o Pix de backlink. Ficam fora do bloco de
# links e do bloco de redes sociais.
FERRAMENTAS = ("appmax", "pagseguro", "pagar.me", "mercadopago", "paypal",
               "getnet", "cielo", "stone.com", "ethoca", "pix-on-site",
               "checkout", "shopify", "nuvemshop", "vtex", "edrone", "rdstation",
               "mailchimp", "klaviyo", "webmail", "mail.", "outlook.",
               "doubleclick", "googlesyndication", "googleads", "adsmanager.",
               "eventsmanager.", "business.facebook", "l.wl.co", "api.whatsapp",
               "wa.me", "qmix.com.br", "serprobot", "semrush", "ahrefs",
               "localhost", "myshopify", "shopifypreview")


def _credencial(cfg, nome_arquivo, escopos):
    from google.oauth2 import service_account
    pasta = cfg.get("pasta_credenciais") or PASTA_PADRAO
    caminho = nome_arquivo if os.path.isabs(nome_arquivo) else os.path.join(pasta, nome_arquivo)
    if not os.path.exists(caminho):
        raise FileNotFoundError(f"credencial nao encontrada: {caminho}")
    return service_account.Credentials.from_service_account_file(caminho, scopes=escopos)


def _janelas(dias, atraso):
    """(inicio_atual, fim_atual, inicio_anterior, fim_anterior) em ISO."""
    fim = date.today() - timedelta(days=atraso)
    inicio = fim - timedelta(days=dias - 1)
    fim_ant = inicio - timedelta(days=1)
    inicio_ant = fim_ant - timedelta(days=dias - 1)
    return (inicio.isoformat(), fim.isoformat(),
            inicio_ant.isoformat(), fim_ant.isoformat())


def _variacao(atual, anterior):
    """Variacao percentual, ou None quando nao ha base de comparacao."""
    if not anterior:
        return None
    return round(100 * (atual - anterior) / anterior, 1)


# ------------------------------------------------------------ Search Console

def coletar_gsc(cfg, conf, dias):
    from googleapiclient.discovery import build

    cred = _credencial(cfg, conf["credencial"], ESCOPO_GSC)
    api = build("searchconsole", "v1", credentials=cred, cache_discovery=False)
    site = conf["site"]
    ini, fim, ini_ant, fim_ant = _janelas(dias, ATRASO_GSC)

    def consultar(inicio, final, dimensoes=None, limite=25):
        corpo = {"startDate": inicio, "endDate": final, "rowLimit": limite}
        if dimensoes:
            corpo["dimensions"] = dimensoes
        return api.searchanalytics().query(siteUrl=site, body=corpo).execute().get("rows", [])

    def totais(linhas):
        if not linhas:
            return {"cliques": 0, "impressoes": 0, "ctr": 0.0, "posicao": None}
        linha = linhas[0]
        return {"cliques": int(linha.get("clicks", 0)),
                "impressoes": int(linha.get("impressions", 0)),
                "ctr": round(100 * linha.get("ctr", 0), 2),
                "posicao": round(linha.get("position", 0), 1)}

    atual = totais(consultar(ini, fim, limite=1))
    anterior = totais(consultar(ini_ant, fim_ant, limite=1))

    consultas = [{"termo": r["keys"][0], "cliques": int(r["clicks"]),
                  "impressoes": int(r["impressions"]),
                  "posicao": round(r["position"], 1)}
                 for r in consultar(ini, fim, ["query"], 12)]

    paginas = [{"url": r["keys"][0], "cliques": int(r["clicks"]),
                "impressoes": int(r["impressions"]),
                "posicao": round(r["position"], 1)}
               for r in consultar(ini, fim, ["page"], 8)]

    serie = [{"data": r["keys"][0], "cliques": int(r["clicks"]),
              "impressoes": int(r["impressions"])}
             for r in sorted(consultar(ini, fim, ["date"], 400),
                             key=lambda x: x["keys"][0])]

    # "Quase la": termos que ja aparecem na 1a ou 2a pagina, mas abaixo do
    # topo. Sao os que rendem mais clique com menos esforco, porque a posicao
    # ja existe. Subir da 8a para a 3a costuma multiplicar o clique por 5.
    oportunidades = []
    for r in consultar(ini, fim, ["query"], 500):
        pos, impr = r["position"], int(r["impressions"])
        if 3.5 <= pos <= 15 and impr >= 300:
            oportunidades.append({
                "termo": r["keys"][0], "posicao": round(pos, 1),
                "impressoes": impr, "cliques": int(r["clicks"]),
                "ctr": round(100 * r["ctr"], 2),
            })
    oportunidades.sort(key=lambda x: -x["impressoes"])

    # Cidades e estados: para este cliente o alcance nacional e argumento de
    # venda, porque Goiania recebe paciente de fora para cirurgia.
    regioes = [{"nome": r["keys"][0], "cliques": int(r["clicks"])}
               for r in consultar(ini, fim, ["country"], 10)]

    return {
        "site": site, "periodo": f"{ini} a {fim}",
        "atual": atual, "anterior": anterior,
        "variacao": {k: _variacao(atual[k], anterior[k])
                     for k in ("cliques", "impressoes")},
        "delta_posicao": (round(atual["posicao"] - anterior["posicao"], 1)
                          if atual["posicao"] and anterior["posicao"] else None),
        "consultas": consultas, "paginas": paginas, "serie": serie,
        "oportunidades": oportunidades, "regioes": regioes,
    }


# ------------------------------------------------------------------ GA4

def coletar_ga4(cfg, conf, dias):
    from googleapiclient.discovery import build

    cred = _credencial(cfg, conf["credencial"], ESCOPO_GA4)
    api = build("analyticsdata", "v1beta", credentials=cred, cache_discovery=False)
    prop = f"properties/{str(conf['propriedade']).replace('properties/', '')}"
    ini, fim, ini_ant, fim_ant = _janelas(dias, ATRASO_GA4)

    def rodar(metricas, dimensoes=None, inicio=ini, final=fim, limite=25,
              ordenar=None, filtro=None):
        corpo = {
            "dateRanges": [{"startDate": inicio, "endDate": final}],
            "metrics": [{"name": m} for m in metricas],
            "limit": limite,
        }
        if dimensoes:
            corpo["dimensions"] = [{"name": d} for d in dimensoes]
        if ordenar:
            corpo["orderBys"] = [{"metric": {"metricName": ordenar}, "desc": True}]
        if filtro:
            corpo["dimensionFilter"] = filtro
        return api.properties().runReport(property=prop, body=corpo).execute()

    METRICAS = ["activeUsers", "sessions", "screenPageViews", "averageSessionDuration"]

    def totais(resposta):
        linhas = resposta.get("rows", [])
        if not linhas:
            return {"usuarios": 0, "sessoes": 0, "paginas": 0, "duracao": 0}
        v = [m["value"] for m in linhas[0]["metricValues"]]
        return {"usuarios": int(float(v[0])), "sessoes": int(float(v[1])),
                "paginas": int(float(v[2])), "duracao": round(float(v[3]))}

    atual = totais(rodar(METRICAS))
    anterior = totais(rodar(METRICAS, inicio=ini_ant, final=fim_ant))

    # Um unico relatorio cruzando canal x origem alimenta todos os recortes
    # abaixo. Evita tres chamadas e garante que os numeros batem entre si.
    detalhe = [{"canal": r["dimensionValues"][0]["value"],
                "origem": r["dimensionValues"][1]["value"],
                "sessoes": int(float(r["metricValues"][0]["value"]))}
               for r in rodar(["sessions"],
                              ["sessionDefaultChannelGroup", "sessionSource"],
                              limite=500, ordenar="sessions").get("rows", [])]

    def eh_ia(item):
        return any(m in item["origem"].lower() for m in FONTES_IA)

    def agrupar(itens):
        soma = Counter()
        for i in itens:
            soma[i["origem"]] += i["sessoes"]
        return [{"origem": o, "sessoes": s} for o, s in soma.most_common()]

    # Os totais por canal vem de consulta propria: somar a tabela cruzada
    # subestima, porque ela e truncada pelo limite de linhas.
    canais = [{"nome": r["dimensionValues"][0]["value"],
               "sessoes": int(float(r["metricValues"][0]["value"]))}
              for r in rodar(["sessions"], ["sessionDefaultChannelGroup"],
                             limite=20, ordenar="sessions").get("rows", [])]

    # A IA e separada primeiro, senao ela apareceria duplicada dentro de
    # "indicacao de sites", que e onde o GA4 costuma classifica-la.
    def eh_ferramenta(item):
        return any(m in item["origem"].lower() for m in FERRAMENTAS)

    ia = agrupar([d for d in detalhe if eh_ia(d)])
    social = agrupar([d for d in detalhe
                      if "social" in d["canal"].lower() and not eh_ia(d)
                      and not eh_ferramenta(d)])
    def eh_buscador(item):
        return any(m in item["origem"].lower() for m in BUSCADORES)

    indicacoes = [d for d in detalhe if d["canal"] == "Referral" and not eh_ia(d)
                  and not eh_ferramenta(d)]
    backlinks = agrupar([d for d in indicacoes if not eh_buscador(d)])
    buscadores = agrupar([d for d in indicacoes if eh_buscador(d)])

    # Eventos de contato. keyEvents so conta se o evento estiver marcado como
    # evento-chave no admin do GA4; eventCount conta sempre.
    eventos = [{"nome": r["dimensionValues"][0]["value"],
                "contagem": int(float(r["metricValues"][0]["value"])),
                "conversoes": int(float(r["metricValues"][1]["value"]))}
               for r in rodar(["eventCount", "keyEvents"], ["eventName"],
                              limite=60, ordenar="eventCount").get("rows", [])]
    contato = [e for e in eventos
               if any(m in e["nome"].lower() for m in EVENTOS_CONTATO)]

    # Segunda fonte, independente do evento customizado: a medicao aprimorada
    # do GA4 registra clique em link externo no evento "click", com o dominio
    # em linkDomain. Se o site esquecer de instrumentar um botao, este pega.
    saida_contato = []
    try:
        linhas_saida = rodar(["eventCount"], ["linkDomain"], limite=60,
                             ordenar="eventCount").get("rows", [])
        for linha in linhas_saida:
            dominio_saida = linha["dimensionValues"][0]["value"].lower()
            if any(m in dominio_saida for m in ("wa.me", "whatsapp", "api.whatsapp")):
                saida_contato.append({
                    "nome": f"cliques para o WhatsApp ({dominio_saida})",
                    "contagem": int(float(linha["metricValues"][0]["value"])),
                    "conversoes": 0, "automatico": True})
    except Exception:
        pass

    # Uma propriedade costuma cobrir site e blog no mesmo fluxo de dados, e
    # cada um instrumenta o contato do seu jeito. Sem separar por hostname, o
    # maior valor de um host esconde o outro: no Dr. Tredicci sao 65 cliques
    # no site e 36 no blog, e a leitura agregada mostrava 65 em vez de 101.
    # Dentro do host vale o maior, porque um clique dispara varios eventos;
    # entre hosts vale a soma, porque sao cliques diferentes.
    por_host = {}
    try:
        for linha in rodar(["eventCount"], ["hostName", "eventName"],
                           limite=400, ordenar="eventCount").get("rows", []):
            host, evento = [v["value"] for v in linha["dimensionValues"]]
            if not any(m in evento.lower() for m in EVENTOS_CONTATO):
                continue
            qtd = int(float(linha["metricValues"][0]["value"]))
            por_host.setdefault(host, {})[evento] = qtd
    except Exception:
        pass

    contatos_total = sum(max(eventos_host.values())
                         for eventos_host in por_host.values() if eventos_host)
    # A medicao automatica cobre o mesmo clique por outro caminho, entao ela
    # so entra se for maior que tudo o que os eventos proprios captaram.
    automatico = max([e["contagem"] for e in saida_contato] or [0])
    contatos_total = max(contatos_total, automatico)

    # Anatomia do contato: nao basta dizer "18 pessoas chamaram". O cliente quer
    # saber por onde chamaram, de qual pagina, clicando em qual botao e vindo de
    # qual canal. Depende das dimensoes personalizadas metodo, local e
    # texto_botao existirem na propriedade, e o GA4 nao aplica dimensao
    # retroativamente: so ha dado a partir do dia em que a dimensao foi criada.
    # Cada corte falha sozinho, sem derrubar o resto do relatorio.
    def corte(dimensao, limite=15):
        try:
            linhas = rodar(["eventCount"], [dimensao], limite=limite,
                           ordenar="eventCount", filtro={
                               "filter": {
                                   "fieldName": "eventName",
                                   "stringFilter": {"value": "generate_lead"},
                               }}).get("rows", [])
        except Exception:
            return []
        saida = []
        for r in linhas:
            rotulo = r["dimensionValues"][0]["value"]
            if rotulo in ("(not set)", "(other)", ""):
                continue
            saida.append({"nome": rotulo,
                          "contagem": int(float(r["metricValues"][0]["value"]))})
        return saida

    contato_detalhe = {
        "metodo": corte("customEvent:metodo", 10),
        "local": corte("customEvent:local", 15),
        "botao": corte("customEvent:texto_botao", 15),
        "paginas": corte("pagePath", 15),
        "canais": corte("sessionDefaultChannelGroup", 12),
    }
    contato_detalhe["total"] = sum(x["contagem"]
                                   for x in contato_detalhe["metodo"]) or 0


    # Engajamento: onde o visitante clica, quais chamadas funcionam, quais
    # perguntas abre e ate onde le. Vem dos eventos do engajamento.js da rede
    # (social_click, cta_click, faq_open, leitura) e da medicao aprimorada do
    # GA4 (view_search_results, click). Cada corte falha sozinho.
    def corte_evento(evento, dimensao, limite=12):
        try:
            linhas = rodar(["eventCount"], [dimensao], limite=limite,
                           ordenar="eventCount", filtro={
                               "filter": {"fieldName": "eventName",
                                          "stringFilter": {"value": evento}}}).get("rows", [])
        except Exception:
            return []
        saida = []
        for r in linhas:
            rotulo = r["dimensionValues"][0]["value"]
            if rotulo in ("(not set)", "(other)", ""):
                continue
            saida.append({"nome": rotulo,
                          "contagem": int(float(r["metricValues"][0]["value"]))})
        return saida

    saidas = []
    try:
        for r in rodar(["eventCount"], ["linkDomain"], limite=40, ordenar="eventCount",
                       filtro={"filter": {"fieldName": "eventName",
                                          "stringFilter": {"value": "click"}}}).get("rows", []):
            dom = r["dimensionValues"][0]["value"].lower()
            if not dom or dom in ("(not set)", "(other)"):
                continue
            if any(m in dom for m in ("wa.me", "whatsapp", "google-analytics", "googletagmanager")):
                continue
            if any(m in dom for m in FERRAMENTAS):
                continue
            saidas.append({"nome": dom, "contagem": int(float(r["metricValues"][0]["value"]))})
    except Exception:
        pass

    leitura = {x["nome"]: x["contagem"] for x in corte_evento("leitura", "customEvent:profundidade", 6)}
    engajamento = {
        "social": corte_evento("social_click", "customEvent:rede", 10),
        "social_local": corte_evento("social_click", "customEvent:local", 10),
        "cta": corte_evento("cta_click", "customEvent:texto_botao", 12),
        "cta_local": corte_evento("cta_click", "customEvent:local", 10),
        "faq": corte_evento("faq_open", "customEvent:pergunta", 12),
        "leitura": [{"nome": p, "contagem": leitura.get(p, 0)} for p in ("25", "50", "75", "100")]
                   if leitura else [],
        "buscas": corte_evento("view_search_results", "searchTerm", 12),
        "saidas": saidas[:12],
        # share: botao de compartilhar do artigo (method = whatsapp | copiar_link)
        "compartilhar": corte_evento("share", "customEvent:method", 6),
        "compartilhar_paginas": corte_evento("share", "pagePath", 8),
    }
    engajamento["total_social"] = sum(x["contagem"] for x in engajamento["social"])
    engajamento["total_faq"] = sum(x["contagem"] for x in engajamento["faq"])
    engajamento["total_buscas"] = sum(x["contagem"] for x in engajamento["buscas"])
    engajamento["total_cta"] = sum(x["contagem"] for x in engajamento["cta"])
    engajamento["total_compartilhar"] = sum(x["contagem"] for x in engajamento["compartilhar"])

    estados = [{"nome": r["dimensionValues"][0]["value"],
                "sessoes": int(float(r["metricValues"][0]["value"]))}
               for r in rodar(["sessions"], ["region"], limite=15,
                              ordenar="sessions").get("rows", [])]
    cidades = [{"nome": r["dimensionValues"][0]["value"],
                "sessoes": int(float(r["metricValues"][0]["value"]))}
               for r in rodar(["sessions"], ["city"], limite=15,
                              ordenar="sessions").get("rows", [])]

    # Video: a medicao aprimorada do GA4 envia video_start, video_progress e
    # video_complete para YouTube incorporado. Sao tres eventos do MESMO play,
    # entao nunca somar: cada um responde uma pergunta diferente.
    video = {"inicios": 0, "progresso": 0, "completos": 0, "titulos": []}
    try:
        FILTRO_VIDEO = {"filter": {"fieldName": "eventName", "inListFilter": {
            "values": ["video_start", "video_progress", "video_complete"]}}}
        corpo = {
            "dateRanges": [{"startDate": ini, "endDate": fim}],
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "dimensionFilter": FILTRO_VIDEO, "limit": 10,
        }
        for linha in api.properties().runReport(
                property=prop, body=corpo).execute().get("rows", []):
            nome = linha["dimensionValues"][0]["value"]
            qtd = int(float(linha["metricValues"][0]["value"]))
            video[{"video_start": "inicios", "video_progress": "progresso",
                   "video_complete": "completos"}[nome]] = qtd

        corpo_t = dict(corpo, dimensions=[{"name": "videoTitle"}], limit=6,
                       orderBys=[{"metric": {"metricName": "eventCount"},
                                  "desc": True}])
        video["titulos"] = [
            {"titulo": x["dimensionValues"][0]["value"],
             "eventos": int(float(x["metricValues"][0]["value"]))}
            for x in api.properties().runReport(
                property=prop, body=corpo_t).execute().get("rows", [])]
    except Exception:
        pass

    paginas = [{"caminho": r["dimensionValues"][0]["value"],
                "visualizacoes": int(float(r["metricValues"][0]["value"]))}
               for r in rodar(["screenPageViews"], ["pagePath"],
                              limite=8, ordenar="screenPageViews").get("rows", [])]

    return {
        "propriedade": prop, "periodo": f"{ini} a {fim}",
        "atual": atual, "anterior": anterior,
        "variacao": {k: _variacao(atual[k], anterior[k])
                     for k in ("usuarios", "sessoes", "paginas")},
        "canais": canais, "paginas": paginas,
        "ia": ia, "sessoes_ia": sum(o["sessoes"] for o in ia),
        "social": social, "sessoes_social": sum(o["sessoes"] for o in social),
        "backlinks": backlinks,
        "sessoes_backlinks": sum(o["sessoes"] for o in backlinks),
        "buscadores": buscadores,
        "sessoes_buscadores": sum(o["sessoes"] for o in buscadores),
        "estados": estados, "cidades": cidades,
        "video": video,
        "eventos": eventos, "contato": contato + saida_contato,
        "contato_detalhe": contato_detalhe,
        "contatos_por_host": por_host,
        "contatos_total": contatos_total,
        "engajamento": engajamento,
    }


def coletar(cfg, cliente, dias):
    """Devolve {'gsc': ..., 'ga4': ...}. Falha de um nao derruba o outro."""
    conf = cliente.get("google") or {}
    saida = {"gsc": None, "ga4": None, "erros": []}

    if conf.get("search_console"):
        try:
            saida["gsc"] = coletar_gsc(cfg, conf["search_console"], dias)
        except Exception as e:
            saida["erros"].append(f"Search Console: {str(e)[:200]}")
    if conf.get("ga4"):
        try:
            saida["ga4"] = coletar_ga4(cfg, conf["ga4"], dias)
        except Exception as e:
            saida["erros"].append(f"GA4: {str(e)[:200]}")
    return saida


def listar():
    """Mostra o que cada conta de servico da pasta enxerga hoje."""
    import glob
    from googleapiclient.discovery import build

    cfg = {}
    caminho_cfg = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
    if os.path.exists(caminho_cfg):
        with open(caminho_cfg, encoding="utf-8") as f:
            cfg = json.load(f)
    pasta = cfg.get("pasta_credenciais") or PASTA_PADRAO

    for arq in sorted(glob.glob(os.path.join(pasta, "*.json"))):
        print("=" * 72)
        print(os.path.basename(arq))
        try:
            api = build("searchconsole", "v1", cache_discovery=False,
                        credentials=_credencial(cfg, arq, ESCOPO_GSC))
            sites = api.sites().list().execute().get("siteEntry", [])
            print(f"  Search Console: {len(sites)} propriedades")
            for s in sites:
                print("     -", s["siteUrl"], "|", s.get("permissionLevel"))
        except Exception as e:
            print("  Search Console: ERRO", str(e)[:160])
        try:
            api = build("analyticsadmin", "v1beta", cache_discovery=False,
                        credentials=_credencial(cfg, arq, ESCOPO_GA4))
            for c in api.accountSummaries().list().execute().get("accountSummaries", []):
                print("  GA4 conta:", c.get("displayName"))
                for p in c.get("propertySummaries", []):
                    print("     -", p.get("property"), "|", p.get("displayName"))
        except Exception as e:
            print("  GA4: ERRO", str(e)[:160])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--listar", action="store_true",
                    help="lista propriedades visiveis por cada conta de servico")
    if ap.parse_args().listar:
        listar()
    else:
        ap.print_help()
