#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a imagem da matéria pela Runware e devolve a URL pública, pronta para o
`subir_imagem` do conector MCP.

MODELO PADRÃO: runware:100@1 (FLUX schnell, ~US$ 0,0006 por imagem).
O premium google:4@2 (Nano Banana Pro, ~US$ 0,138) SÓ com autorização explícita
do Anderson, pedida ANTES, informando quantidade e custo.

Uso:
  python gerar_imagem.py --prompt "wide view of a hospital corridor, candid documentary photograph, no text" \
                         --slug dor-nas-costas-diagnostico

  # com autorização dele, e só então:
  python gerar_imagem.py --prompt "..." --slug ... --premium
"""
import argparse
import json
import sys
import urllib.request
import uuid

API = "https://api.runware.ai/v1"
CHAVE = "<<REMOVIDO>>"

# FLUX aceita múltiplos de 64. 1344x768 é o mais próximo de 16:9 válido.
DIM_BARATO = (1344, 768)
# Nano Banana Pro usa lista fechada de dimensões; 1376x768 passa em 16:9 (1K).
DIM_PREMIUM = (1376, 768)


def gerar(prompt, premium=False):
    modelo = "google:4@2" if premium else "runware:100@1"
    largura, altura = DIM_PREMIUM if premium else DIM_BARATO

    tarefa = {
        "taskType": "imageInference",
        "taskUUID": str(uuid.uuid4()),
        "model": modelo,
        "positivePrompt": prompt,
        "width": largura,
        "height": altura,
        "numberResults": 1,
        "outputType": "URL",      # URL evita base64 truncado em imagem grande
        "outputFormat": "WEBP",
        "includeCost": True,
    }
    # ATENÇÃO: o modelo premium NÃO aceita "steps" (devolve
    # unsupportedArchitectureSteps com HTTP 200). Por isso não mandamos steps.

    req = urllib.request.Request(
        API,
        data=json.dumps([tarefa]).encode("utf-8"),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {CHAVE}"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.loads(r.read().decode("utf-8"))

    if "errors" in resp and resp["errors"]:
        sys.exit("ERRO da Runware: " + json.dumps(resp["errors"], ensure_ascii=False))
    dados = resp.get("data") or []
    if not dados:
        sys.exit("Resposta sem imagem: " + json.dumps(resp, ensure_ascii=False)[:400])
    return dados[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True, help="em INGLES, terminando com 'no text'")
    ap.add_argument("--slug", required=True, help="slug da keyword, vira o nome do arquivo")
    ap.add_argument("--premium", action="store_true",
                    help="usa google:4@2 (~US$0,138). SO com autorizacao do Anderson.")
    a = ap.parse_args()

    prompt = a.prompt
    if "no text" not in prompt.lower():
        prompt += ", no text"

    if a.premium:
        print("[!] MODELO PREMIUM (~US$ 0,138). Use apenas com autorizacao explicita.\n")

    d = gerar(prompt, a.premium)

    print("URL      :", d.get("imageURL"))
    print("custo US$:", d.get("cost"))
    print("arquivo  :", f"{a.slug}.webp   (usar como nome_arquivo no subir_imagem)")
    print("\nProximo passo: subir_imagem(site=..., url_imagem=<URL acima>,")
    print(f"               nome_arquivo='{a.slug}.webp', alt='<descricao em pt-BR>')")
    print("\nABRA A IMAGEM E OLHE antes de publicar. O modelo barato erra anatomia.")


if __name__ == "__main__":
    main()
