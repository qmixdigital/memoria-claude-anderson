"""Agenda de publicacao: 3 materias por semana por portal, 150 portais.

Regras que a distribuicao tem que respeitar:

  - nunca os 3 artigos de um portal no mesmo dia. O sorteio escolhe 3 dias da
    semana com pelo menos um dia de intervalo entre eles;
  - o volume diario (~65 materias) espalhado ao longo do dia, dentro de uma
    janela editorial, e nao concentrado numa rajada;
  - no momento de publicar, throttle de 1 artigo a cada 30-60 s POR INSTANCIA
    do Portal Engine (que faz rebuild de indices a cada publicacao). Portais em
    instancias diferentes publicam em paralelo.

O sorteio dos dias e deterministico por (portal, semana): a mesma semana sempre
gera a mesma grade, entao reprocessar nao embaralha o que ja foi agendado.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import logging
import random

from . import config, db

log = logging.getLogger("motor.schedule")

TZ = dt.timezone(dt.timedelta(hours=-3))
HORA_INICIO, HORA_FIM = 7, 21  # janela editorial, horario de Brasilia

# combinacoes de 3 dias (0=segunda .. 6=domingo) sem dois dias seguidos
COMBOS = [(0, 2, 4), (0, 2, 5), (0, 3, 5), (0, 3, 6), (0, 4, 6),
          (1, 3, 5), (1, 3, 6), (1, 4, 6), (2, 4, 6)]


def semana_de(data=None):
    d = data or dt.datetime.now(TZ).date()
    return d - dt.timedelta(days=d.weekday())


def _rng(site_slug, semana):
    semente = hashlib.md5(
        "{}|{}".format(site_slug, semana.isoformat()).encode()).hexdigest()
    return random.Random(int(semente[:16], 16))


def dias_do_portal(site_slug, semana, por_semana=3):
    """Escolhe dias nao adjacentes, deterministico por portal e semana."""
    r = _rng(site_slug, semana)
    if por_semana == 3:
        return list(r.choice(COMBOS))
    dias, disponiveis = [], list(range(7))
    while len(dias) < por_semana and disponiveis:
        d = r.choice(disponiveis)
        dias.append(d)
        disponiveis = [x for x in disponiveis if abs(x - d) > 1]
    return sorted(dias)


def gerar_grade(semana=None):
    """Cria os slots livres da semana para todos os portais ativos."""
    semana = semana or semana_de()
    por_semana = config.artigos_por_semana()
    criados = 0
    for s in config.sites():
        slug = s["slug"]
        r = _rng(slug, semana)
        for dia in dias_do_portal(slug, semana, por_semana):
            # minuto sorteado dentro da janela editorial: espalha o volume
            hora = r.randint(HORA_INICIO, HORA_FIM - 1)
            minuto = r.randint(0, 59)
            slot = dt.datetime.combine(
                semana + dt.timedelta(days=dia),
                dt.time(hora, minuto), tzinfo=TZ)
            n = db.exec1(
                "INSERT INTO agenda (site_slug, semana, slot) "
                "VALUES (%s,%s,%s) ON CONFLICT (site_slug, slot) DO NOTHING",
                (slug, semana, slot))
            criados += n or 0
    if criados:
        log.info("grade da semana %s: %d slots criados", semana, criados)
    return criados


def slots_para_gerar(horizonte_horas=30, limite=200):
    """Slots livres cuja materia precisa ser gerada agora.

    O horizonte e maior que 24 h de proposito: a geracao vai por Batch API, que
    pode levar ate 24 h, entao a materia do slot de amanha e encomendada hoje.
    """
    return db.q(
        "SELECT a.id, a.site_slug, a.slot FROM agenda a "
        "WHERE a.estado='livre' AND a.slot <= now() + %s "
        "AND a.slot > now() - interval '6 hours' "
        "ORDER BY a.slot ASC LIMIT %s",
        (dt.timedelta(hours=horizonte_horas), limite)) or []


def slots_para_publicar(limite=100):
    """Slots cuja materia ja esta pronta e cuja hora chegou."""
    return db.q(
        "SELECT a.id, a.site_slug, a.slot, a.fato_guid, m.id AS materia_id "
        "FROM agenda a JOIN materias m "
        "  ON m.agenda_id = a.id AND m.estado='pronta' "
        "WHERE a.estado='gerado' AND a.slot <= now() "
        "ORDER BY a.slot ASC LIMIT %s", (limite,)) or []


def reservar(agenda_id, fato_guid):
    return db.exec1(
        "UPDATE agenda SET fato_guid=%s, estado='reservado' "
        "WHERE id=%s AND estado='livre'", (fato_guid, agenda_id))


def marcar(agenda_id, estado):
    return db.exec1("UPDATE agenda SET estado=%s WHERE id=%s",
                    (estado, agenda_id))


def escolher_fato(site, ja_usados):
    """Escolhe o melhor fato ainda nao publicado neste portal.

    Aplica os filtros do portal e o registro de publicacoes: um fato nunca
    volta ao mesmo portal, e a preferencia e por fato com mais dominios (mais
    confirmado) e mais recente.
    """
    from .dedupe import fatos_prontos
    inc = [t.lower() for t in site.get("filtros_incluir", [])]
    exc = [t.lower() for t in site.get("filtros_excluir", [])]
    assuntos_do_site = set(site.get("assuntos", []))

    for f in fatos_prontos(limite=200):
        if str(f["guid"]) in ja_usados:
            continue
        titulo = (f["titulo_representativo"] or "").lower()
        if exc and any(t in titulo for t in exc):
            continue
        if inc and not any(t in titulo for t in inc):
            continue
        if assuntos_do_site:
            origens = db.q(
                "SELECT DISTINCT query_origem FROM artigos_fonte "
                "WHERE fato_id=%s", (f["id"],)) or []
            if not (assuntos_do_site & {o["query_origem"] for o in origens}):
                continue
        ja = db.q("SELECT 1 FROM publicacoes WHERE fato_guid=%s "
                  "AND site_slug=%s", (f["guid"], site["slug"]), um=True)
        if ja:
            continue
        return f
    return None
