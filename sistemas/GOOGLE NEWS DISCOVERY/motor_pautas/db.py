"""Acesso ao PostgreSQL. psycopg 3 com pool."""
from __future__ import annotations

import json
from pathlib import Path

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from . import config

_pool = None


def pool():
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            config.dsn(), min_size=1, max_size=8,
            kwargs={"row_factory": dict_row}, open=True,
        )
    return _pool


def conn():
    return pool().connection()


def init():
    """Cria o esquema. Idempotente."""
    sql = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
    with conn() as c:
        c.execute(sql)
    return True


def q(sql, params=None, um=False):
    """SELECT. Devolve lista de dicts, ou o primeiro dict se um=True."""
    with conn() as c:
        cur = c.execute(sql, params or ())
        if cur.description is None:
            return None
        linhas = cur.fetchall()
    return (linhas[0] if linhas else None) if um else linhas


def exec1(sql, params=None):
    """INSERT/UPDATE/DELETE. Devolve rowcount."""
    with conn() as c:
        cur = c.execute(sql, params or ())
        return cur.rowcount


def inserir_devolvendo(sql, params=None):
    """INSERT ... RETURNING. Devolve a primeira linha."""
    with conn() as c:
        cur = c.execute(sql, params or ())
        return cur.fetchone()


def estado_get(chave, padrao=None):
    r = q("SELECT valor FROM motor_estado WHERE chave=%s", (chave,), um=True)
    return r["valor"] if r else padrao


def estado_set(chave, valor):
    exec1(
        "INSERT INTO motor_estado (chave, valor) VALUES (%s, %s) "
        "ON CONFLICT (chave) DO UPDATE "
        "SET valor = EXCLUDED.valor, atualizado_em = now()",
        (chave, json.dumps(valor)),
    )
