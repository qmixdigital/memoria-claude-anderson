"""Imagem de capa via Runware.

Nao e enfeite: o receptor do Portal Engine grava como RASCUNHO todo artigo que
chega sem `image_base64` (site.exigeImagem). Sem imagem, a materia nunca vai ao
ar. Por isso a geracao de imagem faz parte do caminho critico e entra na conta
de custo.

Regras da casa aplicadas: prompt em ingles, "no text" sempre (texto dentro de
imagem de IA sai ilegivel), WebP, dimensoes multiplas de 64.
"""
from __future__ import annotations

import base64
import logging
import time
import uuid

import httpx

from .. import budget, config

log = logging.getLogger("motor.runware")

URL = "https://api.runware.ai/v1"
LARGURA, ALTURA = 1216, 640  # multiplos de 64, proporcao de capa/OG


def chave():
    return config.env("RUNWARE_API_KEY", obrigatorio=True)


def gerar(prompt, largura=LARGURA, altura=ALTURA, modelo=None, tentativas=3):
    """Devolve (base64_webp, erro). Nunca levanta: sem imagem vira rascunho.

    Tenta mais de uma vez porque a falha medida em producao e TRANSITORIA:
    "Inference error occurred while processing the request. Please try again".
    Sem retentativa, 1 imagem em 16 falhou e levou a materia inteira junto,
    porque sem imagem o receptor grava como rascunho e o slot da agenda vira
    'falhou'. Uma materia paga perdida por um erro que pedia "tente de novo".
    """
    ultimo = None
    for i in range(tentativas):
        b64, err = _gerar_uma(prompt, largura, altura, modelo)
        if b64:
            if i:
                log.info("imagem gerada na tentativa %d", i + 1)
            return b64, None
        ultimo = err
        if not _vale_repetir(err):
            break
        time.sleep(3 * (i + 1))
    return None, ultimo


def _vale_repetir(err):
    """Erro transitorio se repete; credito e chave nao."""
    t = (err or "").lower()
    if "http 401" in t or "http 402" in t or "http 403" in t:
        return False
    return True


def _gerar_uma(prompt, largura, altura, modelo):
    modelo = modelo or config.modelo_imagem()
    prompt_final = "{}, professional, high quality, photorealistic, no text".format(
        prompt.strip().rstrip(","))
    corpo = [{
        "taskType": "imageInference",
        "taskUUID": str(uuid.uuid4()),
        "model": modelo,
        "positivePrompt": prompt_final,
        "width": largura,
        "height": altura,
        "numberResults": 1,
        "steps": 4,
        "outputFormat": "WEBP",
        "outputType": "base64Data",
    }]
    try:
        r = httpx.post(URL, timeout=90,
                       headers={"Authorization": "Bearer " + chave(),
                                "Content-Type": "application/json"},
                       json=corpo)
        if r.status_code >= 400:
            erro = "http {}: {}".format(r.status_code, r.text[:200])
            if r.status_code in (401, 402, 403, 429):
                budget.alertar_falha_credito(
                    "runware", RuntimeError(erro), "imageInference")
            return None, erro
        dados = r.json().get("data") or []
        if not dados:
            return None, "resposta sem data: {}".format(str(r.json())[:200])
        item = dados[0]
        b64 = item.get("imageBase64Data")
        if not b64 and item.get("imageURL"):
            img = httpx.get(item["imageURL"], timeout=60)
            img.raise_for_status()
            b64 = base64.b64encode(img.content).decode("ascii")
        if not b64:
            return None, "sem imagem na resposta"
        budget.registrar("imagem", provedor="runware", modelo=modelo,
                         unidades=1)
        return b64, None
    except Exception as e:
        return None, "excecao: {}".format(e)
