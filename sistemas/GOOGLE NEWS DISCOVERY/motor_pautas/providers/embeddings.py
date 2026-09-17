"""Embeddings para o dedupe por fato.

A Anthropic NAO tem endpoint de embeddings — recomenda parceiro. Como a chave
da OpenAI ja entra no projeto para o teste cego, o padrao e
`text-embedding-3-small`, que e o mais barato dos que servem aqui
(US$ 0,02 por milhao de tokens: ~US$ 0,09/mes no volume previsto).

O provedor e plugavel: trocar MP_PROVEDOR_EMBEDDING para `voyage` usa a Voyage
AI, que e a parceira recomendada pela Anthropic.
"""
from __future__ import annotations

import logging
import math

from .. import budget, config

log = logging.getLogger("motor.embeddings")

_cliente = None


def provedor():
    return config.env("MP_PROVEDOR_EMBEDDING", "openai")


def _openai(textos, modelo):
    global _cliente
    if _cliente is None:
        from openai import OpenAI
        _cliente = OpenAI(api_key=config.env("OPENAI_API_KEY",
                                             obrigatorio=True))
    r = _cliente.embeddings.create(model=modelo, input=textos)
    vetores = [d.embedding for d in r.data]
    tokens = getattr(getattr(r, "usage", None), "total_tokens", 0) or 0
    return vetores, tokens


def _voyage(textos, modelo):
    import httpx
    chave = config.env("VOYAGE_API_KEY", obrigatorio=True)
    r = httpx.post("https://api.voyageai.com/v1/embeddings", timeout=60,
                   headers={"Authorization": "Bearer " + chave},
                   json={"model": modelo, "input": textos})
    r.raise_for_status()
    d = r.json()
    vetores = [x["embedding"] for x in d["data"]]
    tokens = d.get("usage", {}).get("total_tokens", 0)
    return vetores, tokens


def embutir(textos, modelo=None):
    """Devolve a lista de vetores para os textos dados, e registra o gasto."""
    if not textos:
        return []
    modelo = modelo or config.modelo_embedding()
    p = provedor()
    try:
        if p == "voyage":
            vetores, tokens = _voyage(textos, modelo)
        else:
            vetores, tokens = _openai(textos, modelo)
    except Exception as e:
        # embedding e dependencia de PRODUCAO, nao so do teste cego: sem ela o
        # dedupe cai na peneira e fragmenta cluster. Alerta na hora.
        budget.alertar_falha_credito(p, e, "embeddings modelo={}".format(modelo))
        raise
    budget.registrar("embedding", provedor=p, modelo=modelo,
                     tokens_in=tokens, unidades=len(textos))
    return vetores


def cosseno(a, b):
    if not a or not b or len(a) != len(b):
        return 0.0
    num = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return (num / (na * nb)) if na and nb else 0.0
