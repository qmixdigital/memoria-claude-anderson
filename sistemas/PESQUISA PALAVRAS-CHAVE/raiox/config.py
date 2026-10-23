"""Configuração: credenciais, países, preços de referência e padrões."""
from __future__ import annotations

import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE_URL = "https://api.dataforseo.com"


def carregar_env(caminho: Path | None = None) -> dict[str, str]:
    """Lê um .env simples (CHAVE=valor, aspas opcionais). Variáveis de ambiente têm prioridade."""
    env: dict[str, str] = {}
    arq = caminho or (RAIZ / ".env")
    if arq.exists():
        for linha in arq.read_text(encoding="utf-8").splitlines():
            linha = linha.strip()
            if not linha or linha.startswith("#") or "=" not in linha:
                continue
            k, v = linha.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    for k in ("DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


# País -> (location_code, language_code, nome, moeda local para as perguntas)
PAISES: dict[str, dict] = {
    "BR": {"location_code": 2076, "language_code": "pt", "nome": "Brasil", "idioma": "português", "moeda": "R$", "cidade": "São Paulo"},
    "PT": {"location_code": 2620, "language_code": "pt", "nome": "Portugal", "idioma": "português", "moeda": "€", "cidade": "Lisboa"},
    "US": {"location_code": 2840, "language_code": "en", "nome": "Estados Unidos", "idioma": "inglês", "moeda": "$", "cidade": "New York"},
    "GB": {"location_code": 2826, "language_code": "en", "nome": "Reino Unido", "idioma": "inglês", "moeda": "£", "cidade": "London"},
    "ES": {"location_code": 2724, "language_code": "es", "nome": "Espanha", "idioma": "espanhol", "moeda": "€", "cidade": "Madrid"},
    "MX": {"location_code": 2484, "language_code": "es", "nome": "México", "idioma": "espanhol", "moeda": "$", "cidade": "Ciudad de México"},
    "AR": {"location_code": 2032, "language_code": "es", "nome": "Argentina", "idioma": "espanhol", "moeda": "$", "cidade": "Buenos Aires"},
}

# Todos os relatórios são para clientes do Brasil. Os endpoints abaixo usam código regional,
# já fixado aqui para não precisar consultar a lista de idiomas a cada rodada.
PAIS_PADRAO = "BR"
IDIOMAS_FIXOS = {
    ("BR", "/v3/serp/google/ai_mode/languages"): "pt-BR",
    ("BR", "/v3/ai_optimization/gemini/llm_scraper/languages"): "pt-BR",
    ("BR", "/v3/ai_optimization/chat_gpt/llm_scraper/languages"): "pt-BR",
}

# Preços de referência (USD), conforme dataforseo.com/pricing em 22/10/2026.
# Servem para a estimativa antes de gastar; o custo real vem no campo "cost" de cada resposta.
PRECOS = {
    "labs_tarefa": 0.012,
    "labs_item": 0.00012,
    "ai_kw_tarefa": 0.01,
    "ai_kw_item": 0.0001,
    "llm_mentions_tarefa": 0.10,
    "llm_mentions_item": 0.001,
    "serp_live": 0.002,            # por SERP de 10 resultados
    "serp_aio_extra": 0.002,       # load_async_ai_overview
    "ai_mode_live": 0.004,
    "llm_scraper_live": 0.004,
    "llm_responses_tarefa": 0.0006,
    # custo médio do LLM com web search, por resposta (estimativa conservadora)
    "llm_chat_gpt": 0.012,
    "llm_gemini": 0.006,
    "llm_claude": 0.03,      # haiku 4.5 com web search saiu a ~US$ 0,027 por resposta em 22/10/2026
    "llm_perplexity": 0.01,
}

# Preferência de modelo por plataforma (do mais barato para o mais caro). Casado por regex contra o endpoint "models".
MODELOS_PREFERIDOS = {
    "chat_gpt": [r"^gpt-4o-mini$", r"^gpt-4\.1-mini$", r"^gpt-5-mini$", r"^gpt-4\.1-nano$", r"^gpt-5-nano$", r"^gpt-4o$", r"^gpt-4\.1$", r"^gpt-5$"],
    "gemini": [r"^gemini-2\.5-flash-lite$", r"^gemini-2\.5-flash$", r"^gemini-2\.0-flash$", r"^gemini-.*flash.*", r"^gemini-.*"],
    "claude": [r"^claude-haiku-4-5$", r"^claude-3-5-haiku.*", r"^claude-haiku.*", r"^claude-sonnet-4-5$", r"^claude-sonnet.*", r"^claude-.*"],
    "perplexity": [r"^sonar$", r"^sonar-pro$", r"^sonar.*"],
}

PLATAFORMAS_ROTULO = {
    "chat_gpt": "ChatGPT",
    "gemini": "Gemini",
    "claude": "Claude",
    "perplexity": "Perplexity",
}

PADROES = {
    "n_kw": 700,         # palavras por tema (etapa 1)
    "n_ia": 300,         # palavras para o índice de IA (etapa 2)
    "n_aio_linhas": 30,  # perguntas do LLM Mentions (etapa 3 e 5)
    "n_aio_dominios": 10,
    "n_serp": 6,         # buscas por tema no Google real (etapa 4)
    "n_modo": 2,         # buscas por tema no Modo IA (etapa 4)
    "n_perguntas": 10,   # perguntas por tema às IAs (etapa 6)
    "teto_usd": 3.0,
}
