#!/usr/bin/env python3
"""
Recalcula mencao, posicao e concorrentes sobre as respostas JA salvas no banco.

Serve para quando a lista de concorrentes ou os apelidos do cliente mudam:
o texto da IA nao muda, so a leitura que fazemos dele. Custo zero de API.

Uso:
  python reanalisar.py                # todos os clientes do config
  python reanalisar.py --cliente id   # so um
"""

import argparse
import json
import os
import sqlite3
import sys

from monitor import CONFIG, DB, abrir_banco, analisar, urls_do_texto

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cliente")
    args = ap.parse_args()

    if not os.path.exists(CONFIG):
        sys.exit("config.json nao encontrado.")
    if not os.path.exists(DB):
        sys.exit("monitor.db nao encontrado. Rode monitor.py primeiro.")

    with open(CONFIG, encoding="utf-8") as f:
        cfg = json.load(f)

    por_id = {c["id"]: c for c in cfg["clientes"]}
    con = abrir_banco()          # tambem aplica a migracao da coluna sequencia
    con.row_factory = sqlite3.Row

    sql = ("SELECT id, cliente_id, resposta_completa, fontes FROM consultas"
           " WHERE erro IS NULL AND resposta_completa IS NOT NULL")
    params = []
    if args.cliente:
        sql += " AND cliente_id = ?"
        params.append(args.cliente)

    atualizadas, mudaram, ignoradas = 0, 0, 0
    for r in con.execute(sql, params).fetchall():
        cliente = por_id.get(r["cliente_id"])
        if cliente is None:
            ignoradas += 1
            continue
        rivais = cliente.get("concorrentes", cfg.get("concorrentes", []))
        det = analisar(r["resposta_completa"], cliente, rivais)

        antes = con.execute(
            "SELECT mencionado, posicao FROM consultas WHERE id = ?", (r["id"],)).fetchone()
        if (bool(antes["mencionado"]), antes["posicao"]) != (det["mencionado"], det["posicao"]):
            mudaram += 1

        # Rodadas antigas gravaram so o dominio. As URLs completas estao no
        # corpo da resposta, entao da para recuperar o link do artigo sem
        # consultar a IA de novo.
        fontes = json.loads(r["fontes"] or "[]")
        if not any(str(f).startswith("http") for f in fontes):
            recuperadas = urls_do_texto(r["resposta_completa"])
            if recuperadas:
                fontes = sorted(set(recuperadas))
                con.execute("UPDATE consultas SET fontes=? WHERE id=?",
                            (json.dumps(fontes, ensure_ascii=False), r["id"]))

        con.execute(
            "UPDATE consultas SET mencionado=?, posicao=?, total_citados=?, ocorrencias=?,"
            " termo_encontrado=?, trecho=?, concorrentes=?, sequencia=? WHERE id=?",
            (int(det["mencionado"]), det["posicao"], det["total_citados"],
             det["ocorrencias"], det["termo_encontrado"], det["trecho"],
             json.dumps(det["concorrentes"], ensure_ascii=False),
             json.dumps(det["sequencia"], ensure_ascii=False), r["id"]))
        atualizadas += 1

    con.commit()
    con.close()
    print(f"{atualizadas} consultas reanalisadas, {mudaram} mudaram de resultado.")
    if ignoradas:
        print(f"{ignoradas} ignoradas (cliente nao esta mais no config.json).")
    print("Gere o relatorio com: python relatorio.py")


if __name__ == "__main__":
    main()
