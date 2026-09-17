#!/usr/bin/env python3
"""
Audita os relatórios gerados antes de enviar ao cliente.

Existe porque um texto interpretativo escrito para um cliente ficou fixo no
modelo e vazou para os nove relatórios: uma loja de malas afirmava que Goiânia
é polo de cirurgia de joelho. Erro assim não aparece em teste de código, só na
leitura, e a leitura de nove arquivos por mês ninguém faz com atenção.

Uso:
  python auditar.py           # audita tudo em resultados/
  python auditar.py --cliente id
"""

import argparse
import glob
import json
import os
import re
import unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(BASE, "config.json")
SAIDA = os.path.join(BASE, "resultados")

# Codigo tecnico que o Google devolve e que nao pode chegar ao cliente.
CODIGOS_CRUS = ["(not set)", "(none)", "(other)", "(not provided)",
                "(data not available)", "State of ", "vertexaisearch"]

# Canais do GA4 em ingles: se sobrar algum, e porque falta traducao.
CANAIS_INGLES = ["Organic Search", "Paid Search", "Organic Social", "Paid Social",
                 "Cross-network", "Paid Shopping", "Organic Shopping", "Referral",
                 "Unassigned", "Display", "Affiliates", "Paid Video", "Paid Other"]

# Glifos quebrados por escape de CSS mal escrito, ja aconteceu quatro vezes.
GLIFOS_QUEBRADOS = ["\x11", "\x91", "¹3", "␑"]


def sem_acento(t):
    n = unicodedata.normalize("NFKD", str(t).lower())
    return "".join(c for c in n if not unicodedata.combining(c))


def dominio_de(cliente):
    g = cliente.get("google") or {}
    bruto = (cliente.get("dominio")
             or (g.get("search_console") or {}).get("site", ""))
    return (str(bruto).replace("sc-domain:", "").replace("https://", "")
            .replace("http://", "").split("/")[0].replace("www.", "").lower())


def auditar(caminho, cliente, outros):
    """Lista de problemas encontrados num relatório."""
    with open(caminho, encoding="utf-8") as f:
        html = f.read()
    corpo = re.sub(r"<style.*?</style>", "", html, flags=re.S)
    texto = re.sub(r"<[^>]+>", " ", corpo)
    plano = sem_acento(texto)
    problemas = []

    # 1. Dado de outro cliente dentro deste relatorio.
    #    Duas excecoes legitimas: cliente do mesmo grupo, declarado no config,
    #    e mencao dentro de citacao da IA, que e fala dela e nao texto nosso.
    grupo = set(cliente.get("grupo", []))
    fora_de_citacao = sem_acento(
        re.sub(r"<[^>]+>", " ",
               re.sub(r'<p class="citacao">.*?</p>', "", corpo, flags=re.S)))
    for alheio in outros:
        if alheio["id"] in grupo:
            continue
        # A agencia assina todos os relatorios (rodape e creditos). Quando ela
        # tambem e cliente no config, "agencia": true evita o falso positivo.
        if alheio.get("agencia"):
            continue
        if sem_acento(alheio["nome"]) in fora_de_citacao:
            problemas.append(f"cita outro cliente: {alheio['nome']}")
        dom = dominio_de(alheio)
        if dom and dom in fora_de_citacao and dom != dominio_de(cliente):
            problemas.append(f"cita domínio de outro cliente: {dom}")

    # 2. O proprio cliente precisa aparecer.
    if sem_acento(cliente["nome"]) not in plano:
        problemas.append("o nome do próprio cliente não aparece")
    meu = dominio_de(cliente)
    if meu and meu not in plano:
        problemas.append(f"o domínio do cliente ({meu}) não aparece")

    # 3. Codigo tecnico e canal em ingles.
    for c in CODIGOS_CRUS:
        if c in texto:
            problemas.append(f"código técnico visível: {c.strip()}")
    for c in CANAIS_INGLES:
        if re.search(rf">\s*{re.escape(c)}\s*<", corpo):
            problemas.append(f"canal em inglês: {c}")

    # 4. Glifo quebrado por escape de CSS.
    for g in GLIFOS_QUEBRADOS:
        if g in html:
            problemas.append(f"glifo quebrado no CSS: {g!r}")

    # 5. Travessao no texto proprio. Dentro de citacao da IA e legitimo,
    #    porque e fala literal dela, entao esses trechos ficam de fora.
    sem_citacao = re.sub(r'<p class="citacao">.*?</p>', "", corpo, flags=re.S)
    if "—" in re.sub(r"<[^>]+>", " ", sem_citacao):
        problemas.append("travessão em texto próprio")

    # 6. Placeholder esquecido do f-string.
    for achado in set(re.findall(r"\{[a-z_]{3,30}\}", texto)):
        problemas.append(f"placeholder não substituído: {achado}")

    # 7. Bloco vazio. Um ou outro e normal em cliente novo; varios seguidos
    #    dao ao relatorio cara de quebrado.
    vazios = texto.count("Sem dados no período")
    if vazios >= 2:
        problemas.append(f"{vazios} blocos sem dados; a seção deveria aparecer?")

    return problemas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente")
    args = ap.parse_args()

    with open(CONFIG, encoding="utf-8") as f:
        cfg = json.load(f)
    clientes = {c["id"]: c for c in cfg["clientes"]}

    arquivos = sorted(glob.glob(os.path.join(SAIDA, "relatorio-*.html")))
    total_problemas = 0
    for caminho in arquivos:
        cid = os.path.basename(caminho)[len("relatorio-"):-len(".html")]
        if args.cliente and cid != args.cliente:
            continue
        cliente = clientes.get(cid)
        if not cliente:
            print(f"[?] {cid}: relatório sem cliente correspondente no config")
            continue
        outros = [c for k, c in clientes.items() if k != cid]
        problemas = auditar(caminho, cliente, outros)
        if problemas:
            total_problemas += len(problemas)
            print(f"[X] {cliente['nome']}")
            for p in problemas:
                print(f"      {p}")
        else:
            print(f"[ok] {cliente['nome']}")

    print()
    if total_problemas:
        print(f"{total_problemas} problema(s). Corrija antes de enviar.")
        raise SystemExit(1)
    print("Nenhum problema encontrado.")


if __name__ == "__main__":
    main()
