#!/usr/bin/env python3
"""
Posicao das palavras-chave acompanhadas, lida do proprio Search Console.

Por que existe: o rastreador de posicao (SERPRobot e afins) pergunta ao Google
de um robo, de um lugar fixo, sem historico de navegacao. O Search Console
registra a posicao em que o site apareceu para gente de verdade, no celular e
no computador dela, onde ela estava. Sao duas medidas diferentes e a segunda e
a que corresponde ao que o paciente viu.

A janela de 24 horas e o ponto. O relatorio de desempenho fecha os dados com
cerca de tres dias de atraso, mas existe uma visao horaria que entrega quase em
tempo real: na API, "dataState": "HOURLY_ALL" com a dimensao HOUR. Essa visao
so aceita HOUR como dimensao, entao para ter a posicao por termo e preciso
pedir HOUR + query e somar as horas depois, ponderando a posicao pelas
impressoes (media simples de hora daria peso igual a uma hora com 300
aparicoes e a outra com 2).

Limite que precisa estar claro no relatorio: termo sem linha aqui nao quer
dizer "posicao ruim", quer dizer que o site nao apareceu para aquela busca
exata no periodo, seja porque esta fora do alcance, seja porque ninguem
pesquisou daquele jeito. E a posicao e media entre todas as pessoas e lugares,
entao em termo local ela nao bate com a do rastreador fixado em uma cidade.

Uso:
  python gsc_termos.py --cliente dra-mariana-cabral
"""

import argparse
import json
import os
import unicodedata
from collections import defaultdict
from datetime import date, timedelta

import google_dados

BASE = os.path.dirname(os.path.abspath(__file__))

# Janela horaria do Search Console: ~26 horas, e so com a dimensao HOUR.
ESTADO_HORARIO = "HOURLY_ALL"


def normalizar(texto):
    """Minusculas, sem acento e com espaco unico, para casar termo e consulta."""
    n = unicodedata.normalize("NFKD", str(texto).lower().strip())
    sem_acento = "".join(c for c in n if not unicodedata.combining(c))
    # Pontuacao vira espaco: "Dr. Pedro" precisa casar com a busca "dr pedro".
    limpo = "".join(c if c.isalnum() else " " for c in sem_acento)
    return " ".join(limpo.split())


# Palavras que nao distinguem uma busca da outra. "Tratamento" entra aqui
# porque a palavra acompanhada costuma ser titulo de pagina ("Tratamentos para
# Rizartrose em Goiania") e o paciente digita so "rizartrose goiania".
VAZIAS = {"de", "da", "do", "das", "dos", "para", "em", "a", "o", "as", "os",
          "e", "com", "por", "no", "na", "nos", "nas", "um", "uma",
          "tratamento", "tratamentos"}


# Palavras de lugar. Quando ninguem buscou o termo com a cidade, a leitura cai
# para o tema sem ela, e o relatorio avisa que deixou de ser busca local.
LUGARES = {"goiania", "goias", "go", "bh", "belo", "horizonte", "brasilia",
           "df", "sp", "paulo", "aparecida", "anapolis"}


def nucleo(texto):
    """Palavras que definem a busca, sem artigo nem plural.

    "Tratamentos para Rizartrose em Goiania" vira {rizartrose, goiania}. Serve
    para achar as buscas equivalentes quando ninguem digitou a frase exata.
    """
    palavras = set()
    for w in normalizar(texto).split():
        if w in VAZIAS:
            continue
        palavras.add(w[:-1] if len(w) > 3 and w.endswith("s") else w)
    return palavras


def _somar(itens):
    """Junta varias consultas numa leitura so, posicao ponderada por aparicao."""
    impressoes = sum(i["impressoes"] for i in itens)
    if not impressoes:
        return None
    return {"cliques": sum(i["cliques"] for i in itens), "impressoes": impressoes,
            "posicao": round(sum(i["posicao"] * i["impressoes"] for i in itens)
                             / impressoes, 1)}


def _servico(cfg, conf):
    from googleapiclient.discovery import build
    cred = google_dados._credencial(cfg, conf["credencial"], google_dados.ESCOPO_GSC)
    return build("searchconsole", "v1", credentials=cred, cache_discovery=False)


def _consultar(sc, site, corpo):
    return sc.searchanalytics().query(siteUrl=site, body=corpo).execute().get("rows", [])


def _agrupar(linhas, indice_consulta):
    """{consulta: (cliques, impressoes, posicao ponderada por impressao)}."""
    soma = defaultdict(lambda: [0, 0, 0.0])
    for x in linhas:
        a = soma[x["keys"][indice_consulta]]
        a[0] += x["clicks"]
        a[1] += x["impressions"]
        a[2] += x["position"] * x["impressions"]
    return {q: {"cliques": c, "impressoes": i, "posicao": round(p / i, 1)}
            for q, (c, i, p) in soma.items() if i}


def ultimas_24h(sc, site):
    """Consultas das ultimas ~24 horas, com dado ainda parcial."""
    hoje = date.today()
    linhas = _consultar(sc, site, {
        "startDate": str(hoje - timedelta(days=1)), "endDate": str(hoje),
        "dimensions": ["HOUR", "query"], "dataState": ESTADO_HORARIO,
        "rowLimit": 25000})
    return _agrupar(linhas, 1)


def periodo(sc, site, inicio, fim):
    linhas = _consultar(sc, site, {
        "startDate": inicio, "endDate": fim,
        "dimensions": ["query"], "rowLimit": 25000})
    return _agrupar(linhas, 0)


def paginas_por_consulta(sc, site, inicio, fim):
    """Para cada consulta, a pagina que mais apareceu nela."""
    linhas = _consultar(sc, site, {
        "startDate": inicio, "endDate": fim,
        "dimensions": ["query", "page"], "rowLimit": 25000})
    melhor = {}
    for x in linhas:
        consulta, pagina = x["keys"]
        if x["impressions"] >= melhor.get(consulta, (0, ""))[0]:
            melhor[consulta] = (x["impressions"], pagina)
    return {q: p for q, (_, p) in melhor.items()}


def coletar(cfg, conf, termos, dias=30):
    """Posicao de cada termo acompanhado, nas 24h e no periodo do relatorio."""
    if not conf or not termos:
        return None
    sc = _servico(cfg, conf)
    site = conf["site"]
    ini, fim, ini_ant, fim_ant = google_dados._janelas(dias, google_dados.ATRASO_GSC)

    # Tres janelas, cada uma respondendo a uma pergunta diferente:
    # 24h diz onde o site esta agora, mas so para o termo que alguem buscou
    # hoje; 7 dias e a posicao atual com amostra grande o bastante para nao
    # oscilar; o mes e a base de comparacao com o mes anterior.
    d24 = ultimas_24h(sc, site)
    fim_7 = date.fromisoformat(fim)
    semana = periodo(sc, site, str(fim_7 - timedelta(days=6)), fim)
    mes = periodo(sc, site, ini, fim)
    anterior = periodo(sc, site, ini_ant, fim_ant)
    paginas = paginas_por_consulta(sc, site, ini, fim)

    def indexar(d):
        saida = {}
        for consulta, valores in d.items():
            saida.setdefault(normalizar(consulta), dict(valores, consulta=consulta))
        return saida

    i24, i7, imes, iant = (indexar(d24), indexar(semana), indexar(mes),
                           indexar(anterior))
    ipag = {normalizar(q): p for q, p in paginas.items()}
    # Nucleo de cada consulta, calculado uma vez: a comparacao abaixo roda
    # para cada termo contra milhares de consultas.
    nucleos = {q: nucleo(q) for d in (i24, i7, imes, iant) for q in d}

    def ler(indice, chave, alvo):
        """Frase exata primeiro; sem ela, a soma das buscas que contem todas
        as palavras do alvo. Devolve None quando nao ha nenhuma."""
        if chave and chave in indice:
            return indice[chave]
        if not alvo:
            return None
        return _somar([v for q, v in indice.items() if alvo <= nucleos[q]])

    saida = []
    for termo in termos:
        chave, alvo = normalizar(termo), nucleo(termo)
        # Tres degraus, do mais fiel ao mais largo, e o relatorio diz qual
        # valeu: "exato" e a frase digitada; "parecido" sao buscas com as
        # mesmas palavras; "tema" e o assunto sem a cidade, que ja nao e busca
        # local e nao pode ser lido como tal.
        escopo = "exato" if chave in imes or chave in i7 else "parecido"
        if escopo == "parecido" and not (ler(imes, None, alvo) or ler(i7, None, alvo)):
            sem_lugar = alvo - LUGARES
            if sem_lugar and sem_lugar != alvo:
                alvo, chave, escopo = sem_lugar, None, "tema"
        agora = ler(i24, chave, alvo)
        semanal = ler(i7, chave, alvo)
        atual = ler(imes, chave, alvo)
        antes = ler(iant, chave, alvo)
        aproximado = escopo != "exato" and bool(atual or semanal)
        if not (atual or semanal):
            escopo = "exato"
        variacao = None
        if atual and antes:
            # Negativo significa que SUBIU: da 8a para a 3a a conta da -5.
            variacao = round(atual["posicao"] - antes["posicao"], 1)

        # Pagina e exemplo saem da consulta parecida com mais aparicoes.
        # Sem leitura no mes nao ha pagina a mostrar. A busca por chave vazia
        # casava com consulta feita so de pontuacao e trazia pagina alheia.
        pagina = ipag.get(chave, "") if chave and atual else ""
        exemplo, variantes = "", 0
        if aproximado:
            grupo = sorted(((v["impressoes"], q) for q, v in imes.items()
                            if alvo <= nucleos[q]), reverse=True)
            variantes = len(grupo)
            if grupo:
                exemplo = imes[grupo[0][1]]["consulta"]
                pagina = ipag.get(grupo[0][1], "")
        saida.append({
            "termo": termo,
            "posicao_24h": agora["posicao"] if agora else None,
            "impressoes_24h": agora["impressoes"] if agora else 0,
            "cliques_24h": agora["cliques"] if agora else 0,
            "posicao_7d": semanal["posicao"] if semanal else None,
            "impressoes_7d": semanal["impressoes"] if semanal else 0,
            "cliques_7d": semanal["cliques"] if semanal else 0,
            "posicao": atual["posicao"] if atual else None,
            "impressoes": atual["impressoes"] if atual else 0,
            "cliques": atual["cliques"] if atual else 0,
            "variacao": variacao,
            "impressoes_anterior": antes["impressoes"] if antes else 0,
            "pagina": pagina,
            # Verdadeiro quando ninguem digitou a frase exata e a leitura vem
            # das buscas equivalentes; o relatorio precisa dizer isso.
            "aproximado": aproximado,
            "escopo": escopo,
            "variantes": variantes,
            "exemplo": exemplo,
        })

    # Ordena pela posicao da semana, que e a leitura atual; sem ela, cai para
    # a do mes. Termo sem nenhuma aparicao vai para o fim da lista.
    def ordem(t):
        p = t["posicao_7d"] or t["posicao"]
        return (p is None, p or 999)

    saida.sort(key=ordem)
    atuais = [t["posicao_7d"] for t in saida
              if t["posicao_7d"] and t["escopo"] != "tema"]
    return {
        "periodo": f"{ini} a {fim}",
        "semana": f"{fim_7 - timedelta(days=6)} a {fim}",
        "termos": saida,
        "total": len(saida),
        "com_posicao": sum(1 for t in saida if t["posicao"] or t["posicao_7d"]),
        "medidos_7d": len(atuais),
        "so_tema": sum(1 for t in saida if t["escopo"] == "tema"
                       and (t["posicao"] or t["posicao_7d"])),
        "top3": sum(1 for p in atuais if p <= 3),
        "top10": sum(1 for p in atuais if p <= 10),
        "medidos_24h": sum(1 for t in saida if t["posicao_24h"]),
        "subiram": sum(1 for t in saida if t["variacao"] and t["variacao"] < 0),
        "cairam": sum(1 for t in saida if t["variacao"] and t["variacao"] > 0),
        "cliques": sum(t["cliques"] for t in saida),
        "impressoes": sum(t["impressoes"] for t in saida),
    }


def termos_do_cliente(cliente):
    """Lista de termos acompanhados, aceitando texto solto ou objeto."""
    brutos = cliente.get("termos_acompanhados") or []
    return [t if isinstance(t, str) else t.get("termo", "") for t in brutos if t]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente", required=True)
    ap.add_argument("--dias", type=int, default=30)
    args = ap.parse_args()

    with open(os.path.join(BASE, "config.json"), encoding="utf-8") as f:
        cfg = json.load(f)
    cliente = next(c for c in cfg["clientes"] if c["id"] == args.cliente)
    termos = termos_do_cliente(cliente)
    if not termos:
        print(f"{cliente['nome']} não tem termos_acompanhados no config.")
        return

    d = coletar(cfg, (cliente.get("google") or {}).get("search_console"),
                termos, args.dias)
    print(f"{cliente['nome']} · {d['periodo']} · {d['total']} termos")
    print(f"{d['com_posicao']} apareceram no período, {d['top3']} no top 3 e "
          f"{d['top10']} na primeira página na última semana, "
          f"{d['medidos_24h']} medidos nas 24h")
    print(f"\n{'termo':42s} {'24h':>6s} {'7d':>6s} {'mês':>6s} {'impr':>7s}  página")
    for t in d["termos"]:
        def p(v):
            return f"{v:.1f}" if v else "-"
        pagina = t["pagina"].split("//")[-1].split("/", 1)[-1] if t["pagina"] else ""
        print(f'{t["termo"][:42]:42s} {p(t["posicao_24h"]):>6s} '
              f'{p(t["posicao_7d"]):>6s} {p(t["posicao"]):>6s} '
              f'{t["impressoes"]:7d}  [{t["escopo"]}] /{pagina}')


if __name__ == "__main__":
    main()
