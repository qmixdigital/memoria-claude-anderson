"""Avisos de publicacao pelo Telegram.

Reaproveita o canal ja montado em `budget` (mesmo bot, mesmo chat), mas o
proposito e outro: `budget` avisa sobre DINHEIRO, este modulo avisa sobre
PRODUCAO. Manter separado evita que um alerta de credito se perca no meio de
uma lista de links.

Duas modalidades, ligaveis por separado em `geral`:

  avisar_por_artigo   uma mensagem por materia publicada, na hora.
                      Bom no piloto (~2 a 3 por dia). No volume final de 65 por
                      dia vira ruido, e a regra deixa de ser lida.

  resumo_diario_hora  uma mensagem por dia, com tudo o que saiu, agrupado por
                      portal. E o formato que sobrevive a escala.

Falha de publicacao entra nas duas: quem so recebe sucesso nao percebe quando o
motor para de publicar, que e exatamente o que precisa ser percebido.
"""
from __future__ import annotations

import datetime as dt
import logging

from . import budget, config, db

log = logging.getLogger("motor.notificacao")

TZ = dt.timezone(dt.timedelta(hours=-3))
CHAVE_ULTIMO_RESUMO = "ultimo_resumo_diario"


def _cfg(chave, padrao):
    return config.geral().get(chave, padrao)


def avisar_por_artigo():
    return bool(_cfg("avisar_por_artigo", True))


def hora_do_resumo():
    return int(_cfg("resumo_diario_hora", 20))


# ------------------------------------------------------------ por publicacao

def notificar_publicacao(site, materia, resultado):
    """Chamado logo depois de cada tentativa de publicacao."""
    if not avisar_por_artigo():
        return False

    status = resultado.get("status")
    url = resultado.get("url") or ""
    titulo = (materia.get("titulo") or "")[:120]

    if status == "publicado":
        cabeca = "PUBLICADO: {}".format(site.get("nome") or site["slug"])
        linhas = [
            titulo,
            "",
            url or "(o receptor nao devolveu url)",
            "",
            "Portal   : {}".format(site["dominio"]),
            "Categoria: {}".format(materia.get("categoria") or "-"),
            "Autor    : {}".format(materia.get("autor") or "-"),
        ]
        if materia.get("usd") is not None:
            linhas.append("Custo    : US$ {:.4f} ({})".format(
                float(materia["usd"]), materia.get("modelo") or "-"))
        fontes = materia.get("fontes") or []
        if fontes:
            linhas += ["", "Fontes ({}):".format(len(fontes))]
            linhas += ["  " + (f.get("veiculo") or f.get("dominio") or "?")
                       for f in fontes[:6]]
    else:
        cabeca = "FALHOU: {}".format(site.get("nome") or site["slug"])
        linhas = [
            titulo,
            "",
            "Portal : {}".format(site["dominio"]),
            "Status : {}".format(status),
            "Motivo : {}".format(resultado.get("erro") or "-"),
        ]
        if status == "skipped":
            linhas += [
                "",
                "O receptor respondeu 201 mas NAO publicou: o slug ja pertence "
                "a outro portal da rede. Nao e erro de rede.",
            ]

    return budget._telegram_enviar(cabeca, "\n".join(linhas),
                                   urgente=(status != "publicado"))


# ------------------------------------------------------------- resumo diario

def montar_resumo(dia=None):
    """Devolve (texto, n_publicados). Texto vazio se nao houve movimento."""
    dia = dia or dt.datetime.now(TZ).date()
    linhas_db = db.q(
        "SELECT p.site_slug, p.status, p.url, p.erro, m.titulo, m.usd, "
        "m.modelo FROM publicacoes p LEFT JOIN materias m ON m.id = p.materia_id "
        "WHERE (p.publicado_em AT TIME ZONE 'America/Sao_Paulo')::date = %s "
        "   OR (p.publicado_em IS NULL AND "
        "       (p.criado_em AT TIME ZONE 'America/Sao_Paulo')::date = %s) "
        "ORDER BY p.site_slug, p.criado_em", (dia, dia)) or []

    if not linhas_db:
        return "", 0

    por_site = {}
    for l in linhas_db:
        por_site.setdefault(l["site_slug"], []).append(l)

    pub = [l for l in linhas_db if l["status"] == "publicado"]
    falhas = [l for l in linhas_db if l["status"] != "publicado"]
    custo = sum(float(l["usd"] or 0) for l in linhas_db)

    partes = [
        "Resumo de {}".format(dia.strftime("%d/%m/%Y")),
        "",
        "{} publicadas, {} falhas, {} portais".format(
            len(pub), len(falhas), len(por_site)),
        "Custo do dia: US$ {:.4f}".format(custo),
        "",
    ]
    for slug in sorted(por_site):
        site = config.site(slug) or {}
        partes.append("--- {} ---".format(site.get("nome") or slug))
        for l in por_site[slug]:
            if l["status"] == "publicado":
                partes.append("  {}".format((l["titulo"] or "")[:90]))
                partes.append("  {}".format(l["url"] or "(sem url)"))
            else:
                partes.append("  [{}] {} :: {}".format(
                    l["status"], (l["titulo"] or "")[:60],
                    (l["erro"] or "")[:60]))
        partes.append("")

    r = budget.resumo_mes()
    partes += [
        "Mes ate agora: US$ {:.2f}".format(r["total_usd"]),
        "Projecao     : US$ {:.2f}".format(r["projecao_mes_usd"]),
    ]
    if r["teto_usd"]:
        partes.append("Teto         : US$ {:.2f} ({}% usado)".format(
            r["teto_usd"], r["percentual_do_teto"]))
    partes += ["", "Painel: " + config.url_painel()]
    return "\n".join(partes), len(pub)


def enviar_resumo(dia=None, forcar=False):
    """Manda o resumo do dia. Uma vez por dia, salvo --forcar."""
    dia = dia or dt.datetime.now(TZ).date()
    if not forcar and db.estado_get(CHAVE_ULTIMO_RESUMO) == dia.isoformat():
        return False, "resumo de hoje ja foi enviado"

    texto, n = montar_resumo(dia)
    if not texto:
        db.estado_set(CHAVE_ULTIMO_RESUMO, dia.isoformat())
        return False, "nenhuma publicacao hoje, nada a enviar"

    ok = budget._telegram_enviar(
        "Motor de pautas: {} publicacoes hoje".format(n), texto)
    if ok:
        db.estado_set(CHAVE_ULTIMO_RESUMO, dia.isoformat())
    return ok, ("enviado" if ok else "falhou ao enviar")


def hora_de_resumir():
    """True quando passou da hora configurada e o resumo do dia nao saiu."""
    agora = dt.datetime.now(TZ)
    if agora.hour < hora_do_resumo():
        return False
    return db.estado_get(CHAVE_ULTIMO_RESUMO) != agora.date().isoformat()
