"""Funções de apoio: normalização de texto, domínio, slug, detecção de perguntas."""
from __future__ import annotations

import re
import unicodedata
from urllib.parse import urlparse


def sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slug(s: str) -> str:
    s = sem_acento(s.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "tema"


def dominio(url: str | None) -> str | None:
    if not url:
        return None
    u = url.strip()
    if "://" not in u:
        u = "https://" + u
    try:
        host = urlparse(u).hostname or ""
    except ValueError:
        return None
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    return host or None


# Começos de pergunta em pt, es e en. Usado para separar "perguntas" das demais buscas.
_INICIO_PERGUNTA = re.compile(
    r"^(como|qual|quais|quanto|quanta|quantos|quantas|quando|onde|por que|porque|o que|oque|que|quem|"
    r"vale a pena|pode|posso|é|e|tem|existe|precisa|preciso|deve|devo|cobre|serve|"
    r"cómo|cuál|cuáles|cuánto|cuánta|cuándo|dónde|por qué|qué|quién|"
    r"how|what|which|when|where|why|who|is|are|can|does|do|should|will)\b",
    re.I,
)


def eh_pergunta(kw: str) -> bool:
    k = sem_acento(kw.strip().lower())
    return bool(_INICIO_PERGUNTA.match(k)) or k.endswith("?") or " vale a pena" in k


def marca_aparece(marca: str, texto: str) -> bool:
    """Procura a marca como palavra inteira, sem acento e sem diferença de caixa."""
    m = sem_acento(marca.lower()).strip()
    if len(m) < 3:
        return False
    t = sem_acento(texto.lower())
    return re.search(r"(?<![\w])" + re.escape(m) + r"(?![\w])", t) is not None


def trecho(texto: str, n: int = 320) -> str:
    t = re.sub(r"\s+", " ", texto or "").strip()
    t = re.sub(r"[#*_>`\[\]]+", "", t)
    return t[:n]
