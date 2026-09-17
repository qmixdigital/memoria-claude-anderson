"""Tabela de preços por modelo, em USD por 1M de tokens.

Fonte: tabela oficial da Anthropic (cache 2026-06-24). O desconto do Batch API
é de 50% sobre entrada e saída. Leitura de cache custa 0,1x a entrada.

Preços de provedores que não a Anthropic ficam com valor None até serem
confirmados: o motor então registra tokens mas contabiliza custo 0 e emite
aviso, em vez de inventar número e estourar o teto sem que ninguém perceba.
"""
from __future__ import annotations

BATCH_DESCONTO = 0.5
CACHE_LEITURA_FATOR = 0.1

PRECOS = {
    # modelo: (entrada_por_MTok, saida_por_MTok)
    "claude-opus-5":   (5.00, 25.00),
    "claude-sonnet-5": (3.00, 15.00),
    "claude-haiku-4-5": (1.00, 5.00),
    # Provedor secundário do teste cego. Preço informado pelo Anderson em
    # 20/08/2026. Batch a 50% e cached input a 10%, iguais aos da Anthropic,
    # então BATCH_DESCONTO e CACHE_LEITURA_FATOR valem para ele também.
    # O id ainda é validado contra o endpoint de modelos na primeira chamada
    # real, em providers/openai_p.validar_modelo().
    "gpt-5.6-luna": (0.20, 1.20),
}

# De qual provedor é cada modelo. Serve para o alerta de crédito por provedor:
# o Anderson abastece Anthropic, OpenAI e Runware em contas separadas.
PROVEDOR_DO_MODELO = {
    "claude-opus-5": "anthropic",
    "claude-sonnet-5": "anthropic",
    "claude-haiku-4-5": "anthropic",
    "gpt-5.6-luna": "openai",
    "text-embedding-3-small": "openai",
    "text-embedding-3-large": "openai",
    "voyage-3-lite": "voyage",
    "runware:100@1": "runware",
}


def provedor_de(modelo):
    return PROVEDOR_DO_MODELO.get(modelo, "desconhecido")

# embeddings: USD por 1M de tokens
PRECOS_EMBEDDING = {
    "text-embedding-3-small": 0.02,
    "text-embedding-3-large": 0.13,
    "voyage-3-lite": 0.02,
}

# imagem: USD por unidade
PRECOS_IMAGEM = {
    "runware:100@1": 0.0012,
}


class PrecoDesconhecido(Exception):
    pass


def custo_tokens(modelo, tokens_in, tokens_out, cache_read=0, cache_write=0,
                 batch=False):
    """Custo em USD. Levanta PrecoDesconhecido se o modelo não tem preço."""
    par = PRECOS.get(modelo)
    if not par or par[0] is None:
        raise PrecoDesconhecido(modelo)
    p_in, p_out = par
    m = BATCH_DESCONTO if batch else 1.0
    # tokens_in já exclui o que veio de cache
    total = (tokens_in * p_in + tokens_out * p_out) / 1e6
    total += cache_read * p_in * CACHE_LEITURA_FATOR / 1e6
    total += cache_write * p_in * 1.25 / 1e6
    return total * m


def custo_embedding(modelo, tokens):
    p = PRECOS_EMBEDDING.get(modelo)
    if p is None:
        raise PrecoDesconhecido(modelo)
    return tokens * p / 1e6


def custo_imagem(modelo, n=1):
    p = PRECOS_IMAGEM.get(modelo)
    if p is None:
        raise PrecoDesconhecido(modelo)
    return p * n
