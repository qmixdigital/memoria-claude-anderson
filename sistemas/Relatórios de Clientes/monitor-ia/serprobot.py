#!/usr/bin/env python3
"""
Lê as exportações do SERPRobot e devolve a posição por palavra-chave.

Por que existe: o Search Console mostra o termo que traz volume, quase sempre
informativo e nacional. O SERPRobot rastreia o termo que a agência escolheu
acompanhar, quase sempre comercial e local, que é o que traz cliente. São
recortes diferentes e um não substitui o outro.

Uso:
  Baixe o "full data export" de cada projeto e jogue os arquivos em
  monitor-ia/serprobot/. Não precisa renomear nem configurar nada: o
  cabeçalho do arquivo traz o domínio do projeto, e é por ele que o
  relatório encontra o cliente certo.

  python serprobot.py            # lista o que foi encontrado em cada arquivo
"""

import csv
import glob
import io
import os
import re
from collections import defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.join(BASE, "serprobot")


def _dominio_limpo(valor):
    d = str(valor or "").strip().lower()
    for prefixo in ("sc-domain:", "https://", "http://"):
        d = d.replace(prefixo, "")
    return d.split("/")[0].replace("www.", "")


def ler_arquivo(caminho):
    """Devolve {'dominio', 'projeto', 'termos': [...]} de uma exportação."""
    with open(caminho, encoding="utf-8-sig") as f:
        linhas = list(csv.reader(io.StringIO(f.read())))

    projeto, dominio = "", ""
    medicoes = defaultdict(list)
    melhor = {}
    termo_atual = None

    for linha in linhas:
        if not linha or not linha[0]:
            continue
        if linha[0].startswith("Project Name:"):
            for celula in linha:
                rotulo, _, valor = celula.partition(": ")
                if rotulo == "Project Name":
                    projeto = valor
                elif rotulo == "Project Domain":
                    dominio = _dominio_limpo(valor)
        elif linha[0].startswith("Keyword:"):
            termo_atual = linha[0].split(": ", 1)[1]
            if len(linha) > 1 and linha[1].startswith("Best Position:"):
                bruto = linha[1].split(": ", 1)[1].strip()
                melhor[termo_atual] = int(bruto) if bruto.isdigit() else None
        elif linha[0] == "Date (UTC)":
            continue
        # Linha de medicao: comeca com data. Vale para o "full export", que
        # traz um cabecalho "Keyword:" antes de cada termo, e para o "brief
        # consolidated", que nao traz cabecalho nenhum e lista tudo seguido.
        elif len(linha) >= 4 and re.match(r"\d{4}-\d{2}-\d{2}", linha[0]):
            posicao = linha[2].strip()
            medicoes[linha[1]].append({
                "data": linha[0][:10],
                # Vazio significa fora do alcance da varredura, nao posicao 0.
                "posicao": int(posicao) if posicao.isdigit() else None,
                "url": linha[3].strip(),
            })

    termos = []
    for termo, historico in medicoes.items():
        historico.sort(key=lambda x: x["data"])
        com_posicao = [h for h in historico if h["posicao"]]
        if not com_posicao:
            termos.append({"termo": termo, "posicao": None, "anterior": None,
                           "melhor": melhor.get(termo), "url": "",
                           "variacao": None, "medicoes": len(historico)})
            continue
        atual = com_posicao[-1]
        primeiro = com_posicao[0]
        if melhor.get(termo) is None:
            melhor[termo] = min(h["posicao"] for h in com_posicao)
        termos.append({
            "termo": termo,
            "posicao": atual["posicao"],
            "anterior": primeiro["posicao"],
            # Negativo significa que SUBIU: saiu da 8a para a 3a e a conta da -5.
            "variacao": atual["posicao"] - primeiro["posicao"],
            "melhor": melhor.get(termo),
            "url": atual["url"],
            "medicoes": len(historico),
        })

    termos.sort(key=lambda t: (t["posicao"] is None, t["posicao"] or 999))
    datas = sorted({h["data"] for hist in medicoes.values() for h in hist})
    return {
        "arquivo": os.path.basename(caminho),
        "projeto": projeto, "dominio": dominio, "termos": termos,
        "periodo": f"{datas[0]} a {datas[-1]}" if datas else "",
    }


def carregar(pasta=PASTA):
    """{dominio: dados} de todos os arquivos da pasta.

    Havendo mais de uma exportação do mesmo domínio, fica a mais recente pelo
    horário do arquivo, que é o comportamento esperado de quem exporta de novo
    sem apagar a anterior.
    """
    achados = {}
    for caminho in sorted(glob.glob(os.path.join(pasta, "*.csv")),
                          key=os.path.getmtime):
        try:
            dados = ler_arquivo(caminho)
        except Exception:
            continue
        if dados["dominio"] and dados["termos"]:
            achados[dados["dominio"]] = dados
    return achados


def resumir(dados):
    """Contagem por faixa de posição, que é a leitura que o cliente entende."""
    termos = dados["termos"]
    com = [t for t in termos if t["posicao"]]
    return {
        "total": len(termos),
        "primeiro": sum(1 for t in com if t["posicao"] == 1),
        "top3": sum(1 for t in com if t["posicao"] <= 3),
        "top10": sum(1 for t in com if t["posicao"] <= 10),
        "subiram": sum(1 for t in com if t["variacao"] and t["variacao"] < 0),
        "cairam": sum(1 for t in com if t["variacao"] and t["variacao"] > 0),
        "sem_posicao": sum(1 for t in termos if not t["posicao"]),
    }


if __name__ == "__main__":
    encontrados = carregar()
    if not encontrados:
        print(f"Nenhum CSV do SERPRobot em {PASTA}")
    for dominio, dados in encontrados.items():
        r = resumir(dados)
        print(f"{dados['projeto']} ({dominio}) · {dados['periodo']}")
        print(f"   {r['total']} termos | {r['primeiro']} em 1o | {r['top3']} no top 3 "
              f"| {r['top10']} no top 10 | subiram {r['subiram']} | caíram {r['cairam']}")
        print(f"   arquivo: {dados['arquivo']}")
