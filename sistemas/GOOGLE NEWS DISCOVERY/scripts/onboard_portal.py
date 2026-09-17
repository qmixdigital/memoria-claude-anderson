#!/usr/bin/env python3
"""Onboarding industrializado: gera o esqueleto de config de um portal.

Com 150 portais, escrever config a mao e onde os erros entram. Este script
monta a entrada completa a partir do minimo que so voce sabe, e deixa marcado
com PREENCHER tudo o que depende de decisao editorial.

  python scripts/onboard_portal.py \
      --slug barranews --dominio barranews.com.br \
      --nome "Barra News" --instancia clinicas-vps \
      --ns brnw-api/v1 --chave <64 hex> \
      --categorias "Notícias,Saúde,Geral" \
      --assuntos brasil,economia,saude

Escreve em config/sites.json e config/credenciais.json, sem sobrescrever o que
ja existe. Depois rode scripts/validar_portal.py <slug>.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CFG = RAIZ / "config"


def carregar(caminho, padrao):
    if caminho.exists():
        return json.loads(caminho.read_text(encoding="utf-8"))
    return padrao


def gravar(caminho, dados, modo=0o600):
    caminho.write_text(
        json.dumps(dados, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    caminho.chmod(modo)


def modelo_site(a):
    cats = [c.strip() for c in a.categorias.split(",") if c.strip()]
    return {
        "slug": a.slug,
        "nome": a.nome,
        "dominio": a.dominio,
        "base_url": "https://{}".format(a.dominio),
        "instancia": a.instancia,
        "ativo": False,
        "_comentario": "ativo=false ate validar_portal.py passar e as vozes "
                       "estarem cadastradas na equipe do sites.json do motor "
                       "do portal",
        "assuntos": [s.strip() for s in (a.assuntos or "").split(",")
                     if s.strip()],
        "filtros_incluir": [],
        "filtros_excluir": [],
        "categorias_validas": cats or ["Notícias"],
        "categoria_padrao": (cats or ["Notícias"])[0],
        "max_por_dia": 1,
        "idade_maxima_horas": 48,
        "perfil_redacao": {
            "voz": "PREENCHER: a voz deste portal, em uma frase densa. "
                   "Precisa ser diferente das vozes que a plataforma de "
                   "conteudo ja usa neste mesmo portal.",
            "pessoa": "terceira pessoa",
            "tamanho_palavras": 700,
            "estrutura": "lide factual, contexto, desdobramento, o que "
                         "acontece a seguir",
            "registro": "formal acessivel",
            "evitar": ["jargao de assessoria", "adjetivo de opiniao"],
        },
        "equipe": [
            {"slug": "PREENCHER", "nome": "PREENCHER",
             "cats": cats[:1] or ["noticias"],
             "_avatar": "subir em /img/autores/<slug>.webp no portal e "
                        "cadastrar em equipe[] no sites.json do portal-engine"}
        ],
        "tags_padrao": [],
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--slug", required=True)
    p.add_argument("--dominio", required=True)
    p.add_argument("--nome", required=True)
    p.add_argument("--instancia", required=True,
                   help="clinicas-vps | opengravity | srv1166087 | wp-<host>")
    p.add_argument("--ns", required=True, help="ex: brnw-api/v1")
    p.add_argument("--chave", required=True, help="X-API-KEY de 64 hex")
    p.add_argument("--categorias", required=True,
                   help="lista separada por virgula, LITERAL como no portal")
    p.add_argument("--assuntos", default="")
    p.add_argument("--forcar", action="store_true")
    a = p.parse_args()

    CFG.mkdir(parents=True, exist_ok=True)

    sites = carregar(CFG / "sites.json", {"geral": {}, "sites": []})
    if any(s["slug"] == a.slug for s in sites["sites"]) and not a.forcar:
        print("portal {} ja existe em sites.json (use --forcar)".format(a.slug))
        return 1
    sites["sites"] = [s for s in sites["sites"] if s["slug"] != a.slug]
    sites["sites"].append(modelo_site(a))
    sites["sites"].sort(key=lambda s: s["slug"])
    gravar(CFG / "sites.json", sites, 0o600)

    cred = carregar(CFG / "credenciais.json", {"portais": {}})
    cred["portais"][a.slug] = {
        "endpoint": "https://{}/wp-json/{}/artigos".format(
            a.dominio, a.ns.strip("/")),
        "api_key": a.chave,
    }
    gravar(CFG / "credenciais.json", cred, 0o600)

    print("portal {} adicionado (ativo=false)".format(a.slug))
    print("\nfalta preencher, e so voce pode:")
    print("  1. perfil_redacao.voz")
    print("  2. equipe[]: nome, slug e afinidade de categoria de cada "
          "assinatura nova")
    print("  3. avatar de cada assinatura em /img/autores/<slug>.webp no "
          "portal, e a mesma equipe cadastrada no sites.json do portal-engine")
    print("\ndepois:  python scripts/validar_portal.py {}".format(a.slug))
    print("e entao vire ativo=true em config/sites.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
