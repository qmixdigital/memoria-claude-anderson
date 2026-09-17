#!/usr/bin/env python3
"""Relatorio consolidado do estagio 1, enviado pelo Telegram com prefixo [MOTOR].

Roda no proprio gnd-motor por timer do systemd, a cada 48 horas. Nao depende de
sessao de ninguem: e o unico jeito de o dado chegar sozinho.

  python scripts/relatorio_48h.py            envia
  python scripts/relatorio_48h.py --seco     imprime e nao envia
  python scripts/relatorio_48h.py --horas 24 outra janela
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from motor_pautas import budget, config, db, dedupe  # noqa: E402


def coletar(horas):
    j = "{} hours".format(horas)

    pub = db.q(
        "SELECT p.site_slug, p.status, p.url, p.erro, p.http_code, "
        "m.titulo, m.usd, m.modelo "
        "FROM publicacoes p LEFT JOIN materias m ON m.id = p.materia_id "
        "WHERE p.criado_em > now() - %s::interval "
        "ORDER BY p.site_slug, p.criado_em", (j,)) or []

    materias = db.q(
        "SELECT estado, COUNT(*) n FROM materias "
        "WHERE criado_em > now() - %s::interval GROUP BY estado", (j,)) or []

    fontes = db.q(
        "SELECT estado, COUNT(*) n FROM artigos_fonte "
        "WHERE coletado_em > now() - %s::interval GROUP BY estado", (j,)) or []

    fatos = db.q(
        "SELECT COUNT(*) total, COUNT(*) FILTER (WHERE pronto) prontos "
        "FROM fatos WHERE criado_em > now() - %s::interval", (j,), um=True) or {}

    agenda = db.q(
        "SELECT estado, COUNT(*) n FROM agenda "
        "WHERE slot > now() - %s::interval GROUP BY estado", (j,)) or []

    cego = db.q(
        "SELECT COUNT(DISTINCT fato_guid) pautas, COUNT(*) saidas, "
        "COUNT(*) FILTER (WHERE erro IS NOT NULL) erros FROM teste_cego",
        um=True) or {}

    return dict(pub=pub, materias=materias, fontes=fontes, fatos=fatos,
                agenda=agenda, cego=cego, horas=horas)


def montar(d):
    pub = d["pub"]
    ok = [p for p in pub if p["status"] == "publicado"]
    skip = [p for p in pub if p["status"] == "skipped"]
    erro = [p for p in pub if p["status"] not in ("publicado", "skipped")]
    total = len(pub) or 1

    L = ["[MOTOR] Relatorio de {}h - estagio 1".format(d["horas"]), ""]

    L.append("PUBLICACAO")
    L.append("  publicadas : {}".format(len(ok)))
    L.append("  skipped    : {}  ({:.1f}%)".format(len(skip),
                                                   len(skip) / total * 100))
    L.append("  falhas     : {}  ({:.1f}%)".format(len(erro),
                                                   len(erro) / total * 100))

    por_site = {}
    for p in pub:
        s = por_site.setdefault(p["site_slug"], {"ok": 0, "skip": 0, "erro": 0})
        s["ok" if p["status"] == "publicado" else
          ("skip" if p["status"] == "skipped" else "erro")] += 1
    if por_site:
        L += ["", "POR PORTAL"]
        for slug in sorted(por_site):
            s = por_site[slug]
            site = config.site(slug) or {}
            L.append("  {:<22} {} pub, {} skip, {} erro".format(
                (site.get("nome") or slug)[:22], s["ok"], s["skip"], s["erro"]))

    if erro or skip:
        L += ["", "FALHAS, CASO A CASO"]
        for p in (erro + skip)[:12]:
            L.append("  [{}] {} :: {}".format(
                p["status"], p["site_slug"], (p["erro"] or "")[:70]))

    L += ["", "PIPELINE"]
    L.append("  fontes    : " + ", ".join(
        "{}={}".format(f["estado"], f["n"]) for f in d["fontes"]) or "  (vazio)")
    L.append("  fatos     : {} novos, {} prontos".format(
        d["fatos"].get("total", 0), d["fatos"].get("prontos", 0)))
    L.append("  materias  : " + ", ".join(
        "{}={}".format(m["estado"], m["n"]) for m in d["materias"]) or "-")
    L.append("  agenda    : " + ", ".join(
        "{}={}".format(a["estado"], a["n"]) for a in d["agenda"]) or "-")
    arb = dedupe.metricas_arbitro()
    L.append("  arbitro   : {} chamadas, {}% confirmacao".format(
        arb["chamadas"], arb["taxa_confirmacao"]))

    r = budget.resumo_mes()
    L += ["", "GASTO"]
    L.append("  mes ate agora : US$ {:.2f}".format(r["total_usd"]))
    L.append("  projecao mes  : US$ {:.2f}".format(r["projecao_mes_usd"]))
    if r["teto_usd"]:
        L.append("  teto          : US$ {:.2f}  ({}% da projecao)".format(
            r["teto_usd"], r["percentual_do_teto"]))
    L.append("  por provedor  : " + ", ".join(
        "{}=US$ {:.2f}".format(k, v) for k, v in r["por_provedor"].items())
        or "sem gasto")
    if r["pausado"]:
        L.append("  *** GERACAO PAUSADA POR ORCAMENTO ***")

    c = d["cego"]
    L += ["", "TESTE CEGO"]
    L.append("  {} de {} pautas comparadas, {} saidas, {} erros".format(
        c.get("pautas", 0), config.teste_cego_alvo(),
        c.get("saidas", 0), c.get("erros", 0)))

    # amostra: ate 3 URLs de portais DIFERENTES
    vistos, amostra = set(), []
    for p in ok:
        if p["site_slug"] in vistos or not p["url"]:
            continue
        vistos.add(p["site_slug"])
        amostra.append(p)
        if len(amostra) == 3:
            break
    L += ["", "AMOSTRA PARA LEITURA"]
    if amostra:
        for p in amostra:
            L.append("  {}".format((p["titulo"] or "")[:80]))
            L.append("  {}".format(p["url"]))
            L.append("")
    else:
        L.append("  nenhuma publicacao com url nesta janela")

    L.append("Painel: " + config.url_painel())
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--horas", type=int, default=48)
    ap.add_argument("--seco", action="store_true")
    a = ap.parse_args()

    texto = montar(coletar(a.horas))
    if a.seco:
        print(texto)
        return 0
    ok = budget._telegram_enviar(
        "[MOTOR] Relatorio de {}h".format(a.horas), texto)
    print("enviado" if ok else "FALHOU ao enviar")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
