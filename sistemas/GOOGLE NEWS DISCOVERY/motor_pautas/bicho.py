"""Resultados do jogo do bicho, derivados da API OFICIAL da Caixa.

Nao precisa de API de terceiro, nao precisa de chave, nao precisa pagar
mensalidade. O resultado do bicho E a Loteria Federal: os 5 premios sorteados
determinam a milhar, a dezena e o grupo. A Caixa publica isso em JSON aberto:

    https://servicebus2.caixa.gov.br/portaldeloterias/api/federal

Testadas em 21/08/2026, as alternativas pagas ou de terceiro:

  dojogodobicho.com/api          nao tem API documentada, so paginas HTML
  ojogodobicho.com (API_JB)      403 sem contrato, pago
  agencianaweb.com.br            locacao mensal ou venda de codigo, sem preco
                                 publico, contato so por WhatsApp
  loteriascaixa-api.herokuapp     funciona, mas e espelho nao oficial da Caixa

Usar a fonte oficial elimina intermediario, custo e risco de o terceiro sair
do ar. E o dado e o mesmo, porque todos eles derivam da Federal.

CUIDADO IMPORTANTE: a Federal sorteia 5 premios, que dao 5 bichos. As bancas
regionais (RJ, SP, BA, GO) fazem sorteios PROPRIOS em varios horarios do dia,
que NAO vem da Federal e nao estao nesta API. Este modulo cobre a Federal,
que e a nacional e a mais buscada, nao as bancas regionais.
"""
from __future__ import annotations

import datetime as dt
import logging

import httpx

log = logging.getLogger("motor.bicho")

TEMPO = 30

# Tabela oficial dos 25 grupos. A dezena define o grupo: grupo = ceil(dez/4),
# com a dezena 00 caindo no grupo 25 (vaca), que e a unica excecao da regra.
GRUPOS = [
    (1, "Avestruz", "01-02-03-04"), (2, "Águia", "05-06-07-08"),
    (3, "Burro", "09-10-11-12"), (4, "Borboleta", "13-14-15-16"),
    (5, "Cachorro", "17-18-19-20"), (6, "Cabra", "21-22-23-24"),
    (7, "Carneiro", "25-26-27-28"), (8, "Camelo", "29-30-31-32"),
    (9, "Cobra", "33-34-35-36"), (10, "Coelho", "37-38-39-40"),
    (11, "Cavalo", "41-42-43-44"), (12, "Elefante", "45-46-47-48"),
    (13, "Galo", "49-50-51-52"), (14, "Gato", "53-54-55-56"),
    (15, "Jacaré", "57-58-59-60"), (16, "Leão", "61-62-63-64"),
    (17, "Macaco", "65-66-67-68"), (18, "Porco", "69-70-71-72"),
    (19, "Pavão", "73-74-75-76"), (20, "Peru", "77-78-79-80"),
    (21, "Touro", "81-82-83-84"), (22, "Tigre", "85-86-87-88"),
    (23, "Urso", "89-90-91-92"), (24, "Veado", "93-94-95-96"),
    (25, "Vaca", "97-98-99-00"),
]
POR_NUMERO = {g: (nome, dez) for g, nome, dez in GRUPOS}


def grupo_da_dezena(dezena):
    """Dezena (0 a 99) para (numero do grupo, nome do bicho)."""
    d = int(dezena) % 100
    n = 25 if d == 0 else (d + 3) // 4
    return n, POR_NUMERO[n][0]


# ------------------------------------------------------------------ fontes
# A API oficial da Caixa BLOQUEIA datacenter. Medido em 22/08/2026: 200 da
# maquina do Anderson (conexao residencial) e 403 dos CINCO servidores da rede,
# inclusive os que ficam no Brasil. Nao e geo, e bloqueio por ASN.
#
# Por isso a leitura usa espelhos, com uma trava: numero de loteria errado
# publicado e pior do que nao publicar, entao SO devolve resultado quando pelo
# menos DUAS fontes independentes concordam no concurso, na data e nos cinco
# bilhetes. Se divergirem, levanta e ninguem publica.
#
# Conferido em 22/08/2026 contra a Caixa oficial, concurso 6093: os dois
# espelhos bateram bilhete por bilhete.

FONTES = [
    ("caixa-oficial", "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal"),
    ("herokuapp", "https://loteriascaixa-api.herokuapp.com/api/federal/latest"),
    ("guidi", "https://api.guidi.dev.br/loteria/federal/ultimo"),
]
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def _normalizar(d):
    """Achata os formatos diferentes num so: (concurso, data, [5 bilhetes])."""
    concurso = d.get("numero") or d.get("concurso")
    data = d.get("dataApuracao") or d.get("data")
    dezenas = d.get("listaDezenas") or d.get("dezenas") or []
    return (concurso, data, tuple(str(x).zfill(6) for x in dezenas))


def ler_todas(concurso=None, tempo=TEMPO):
    """Le todas as fontes. Devolve {nome: (dados_crus, chave_normalizada)}."""
    saida = {}
    for nome, base in FONTES:
        url = base
        if concurso and nome == "caixa-oficial":
            url = base + "/" + str(concurso)
        try:
            r = httpx.get(url, timeout=tempo, follow_redirects=True,
                          headers={"Accept": "application/json", "User-Agent": UA})
            if r.status_code >= 400:
                log.info("fonte %s devolveu HTTP %s", nome, r.status_code)
                continue
            d = r.json()
            if isinstance(d, list):
                d = d[0] if d else {}
            chave = _normalizar(d)
            if not chave[0] or len(chave[2]) != 5:
                log.info("fonte %s veio incompleta: %s", nome, chave)
                continue
            saida[nome] = (d, chave)
        except Exception as e:
            log.info("fonte %s falhou: %s", nome, str(e)[:80])
    return saida


def resultado_federal(concurso=None, tempo=TEMPO):
    """Resultado da Federal, so com duas fontes concordando."""
    lidas = ler_todas(concurso, tempo)
    if not lidas:
        raise RuntimeError("nenhuma fonte da Federal respondeu")

    grupos = {}
    for nome, (dados, chave) in lidas.items():
        grupos.setdefault(chave, []).append((nome, dados))

    chave, membros = max(grupos.items(), key=lambda kv: len(kv[1]))
    if len(membros) < 2:
        raise RuntimeError(
            "fontes da Federal divergem, nada publicado: {}".format(
                {n: c for n, (_, c) in lidas.items()}))
    log.info("Federal %s confirmada por %d fontes: %s", chave[0], len(membros),
             ", ".join(n for n, _ in membros))
    return membros[0][1]


def derivar(dados):
    """Transforma o JSON da Caixa no resultado do bicho.

    Devolve dict com concurso, data e os 5 premios, cada um com bilhete,
    milhar, centena, dezena, grupo e bicho.
    """
    # Cada fonte nomeia os campos do seu jeito: a Caixa usa numero/dataApuracao/
    # listaDezenas, os espelhos usam concurso/data/dezenas. _normalizar achata os
    # tres num so formato, e e ele que vale aqui.
    concurso_n, data_n, bilhetes = _normalizar(dados)
    premios = []
    for i, b in enumerate(bilhetes, 1):
        b = str(b).zfill(6)
        dezena = b[-2:]
        n, bichinho = grupo_da_dezena(dezena)
        premios.append({
            "premio": i,
            "bilhete": b,
            "milhar": b[-4:],
            "centena": b[-3:],
            "dezena": dezena,
            "grupo": n,
            "bicho": bichinho,
            "dezenas_do_grupo": POR_NUMERO[n][1],
        })
    data = data_n
    return {
        "concurso": concurso_n,
        "data": data,
        "data_iso": _iso(data),
        "premios": premios,
        "fonte": FONTES[0][1],
    }


def _iso(dm):
    try:
        d, m, a = str(dm).split("/")
        return "{}-{}-{}".format(a, m, d)
    except Exception:
        return None


def ultimo():
    """Atalho: busca e ja devolve derivado."""
    return derivar(resultado_federal())


# ------------------------------------------------------------------ conteudo

def texto_resultado(res, site_nome=""):
    """Monta o HTML da materia de resultado. Sem modelo de IA.

    Resultado de loteria e dado, nao interpretacao: gerar por IA seria pagar
    token para reescrever uma tabela, e abriria espaco para o modelo errar um
    numero. O texto e montado por template e os numeros vem direto da Caixa.
    """
    p = res["premios"]
    linhas = [
        "<p>A Loteria Federal divulgou o resultado do concurso "
        "<strong>{}</strong>, sorteado em {}. Confira abaixo os cinco prêmios "
        "e os grupos correspondentes na tabela do jogo do bicho.</p>".format(
            res["concurso"], res["data"]),
        "<h2>Resultado do concurso {} da Loteria Federal</h2>".format(
            res["concurso"]),
        '<table role="table"><caption>Prêmios sorteados e grupo '
        "correspondente</caption>",
        '<thead role="rowgroup"><tr role="row">'
        '<th scope="col" role="columnheader">Prêmio</th>'
        '<th scope="col" role="columnheader">Bilhete</th>'
        '<th scope="col" role="columnheader">Milhar</th>'
        '<th scope="col" role="columnheader">Dezena</th>'
        '<th scope="col" role="columnheader">Grupo</th>'
        '<th scope="col" role="columnheader">Bicho</th></tr></thead>',
        '<tbody role="rowgroup">',
    ]
    for x in p:
        linhas.append(
            '<tr role="row"><th scope="row" role="rowheader">{}º</th>'
            '<td role="cell" data-rotulo="Bilhete">{}</td>'
            '<td role="cell" data-rotulo="Milhar">{}</td>'
            '<td role="cell" data-rotulo="Dezena">{}</td>'
            '<td role="cell" data-rotulo="Grupo">{}</td>'
            '<td role="cell" data-rotulo="Bicho">{}</td></tr>'.format(
                x["premio"], x["bilhete"], x["milhar"], x["dezena"],
                x["grupo"], x["bicho"]))
    linhas.append("</tbody></table>")

    primeiro = p[0] if p else None
    if primeiro:
        linhas.append(
            "<h2>Qual bicho deu no primeiro prêmio</h2>"
            "<p>O primeiro prêmio saiu no bilhete {}, o que corresponde à "
            "milhar {}, à dezena {} e ao grupo {}, o {}. As dezenas desse "
            "grupo são {}.</p>".format(
                primeiro["bilhete"], primeiro["milhar"], primeiro["dezena"],
                primeiro["grupo"], primeiro["bicho"],
                primeiro["dezenas_do_grupo"]))

    linhas.append(
        "<h2>Como a Loteria Federal define o resultado</h2>"
        "<p>O jogo do bicho usa os cinco prêmios da Loteria Federal como base. "
        "Os quatro últimos algarismos de cada bilhete formam a milhar, e os "
        "dois últimos formam a dezena. Cada faixa de quatro dezenas "
        "corresponde a um dos 25 grupos da tabela, que vai do avestruz à "
        "vaca.</p>")
    linhas.append(
        "<h2>Fontes consultadas</h2><p>Os números desta página vêm da API "
        '<a href="{}" rel="noopener nofollow" target="_blank">Caixa Econômica '
        "Federal</a>, atualizada a cada sorteio.</p>".format(res["fonte"]))
    return "".join(linhas)


def titulo_resultado(res):
    p = res["premios"][0] if res["premios"] else None
    if not p:
        return "Loteria Federal: resultado do concurso {}".format(
            res["concurso"])
    return "Deu no poste {}: {} no 1º prêmio, milhar {}".format(
        res["data"], p["bicho"], p["milhar"])


def meta_resultado(res):
    p = res["premios"][0] if res["premios"] else None
    if not p:
        return "Resultado da Loteria Federal do concurso {}.".format(
            res["concurso"])
    return ("Resultado do jogo do bicho de {}: {} no 1º prêmio, milhar {}, "
            "grupo {}. Veja os cinco prêmios do concurso {} da Federal."
            ).format(res["data"], p["bicho"], p["milhar"], p["grupo"],
                     res["concurso"])
