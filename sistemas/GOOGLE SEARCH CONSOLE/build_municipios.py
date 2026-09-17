# -*- coding: utf-8 -*-
"""Gera municipios.json (lookup acentuado) a partir do JSON da API do IBGE.

Uso:
    python build_municipios.py ibge.json municipios.json

Baixe a fonte uma vez com:
    curl -s "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome" -o ibge.json
"""
import json
import sys
import unicodedata


def _slug(texto: str) -> str:
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join(c for c in nfkd if not unicodedata.combining(c)).lower()
    out = [ch if ch.isalnum() else "-" for ch in sem_acento]
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def variantes_slug(texto: str):
    """Gera variantes de slug para casar diferentes geradores de URL.

    Trata o apostrofo de duas formas: como separador ("d'Oeste" -> d-oeste) e
    removido ("d'Oeste" -> doeste), cobrindo os dois padroes comuns.
    """
    sep = _slug(texto)
    rem = _slug(texto.replace("'", "").replace("`", ""))
    return {sep, rem}


def main():
    origem = sys.argv[1] if len(sys.argv) > 1 else "ibge.json"
    destino = sys.argv[2] if len(sys.argv) > 2 else "municipios.json"

    with open(origem, "r", encoding="utf-8") as f:
        municipios = json.load(f)

    def achar_uf(obj):
        """Procura recursivamente uma 'sigla' de UF no objeto do municipio."""
        if isinstance(obj, dict):
            uf = obj.get("UF")
            if isinstance(uf, dict) and uf.get("sigla"):
                return uf["sigla"]
            for v in obj.values():
                r = achar_uf(v)
                if r:
                    return r
        return None

    lookup = {}
    for m in municipios:
        nome = m["nome"]
        sigla = achar_uf(m)
        if not sigla:
            continue
        uf = sigla.lower()
        for v in variantes_slug(nome):
            # primeira ocorrencia vence (evita sobrescrever homonimos raros)
            lookup.setdefault(f"{uf}|{v}", nome)

    with open(destino, "w", encoding="utf-8") as f:
        json.dump(lookup, f, ensure_ascii=False, indent=0, sort_keys=True)

    print(f"{len(lookup)} municipios gravados em {destino}")


if __name__ == "__main__":
    main()
