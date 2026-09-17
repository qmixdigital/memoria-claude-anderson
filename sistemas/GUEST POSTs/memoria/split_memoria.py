#!/usr/bin/env python3
"""
Reconstrói a árvore de arquivos de memória a partir de MEMORIA-COMPLETA.md.

Uso:
    python split_memoria.py                 # gera em ./arvore
    python split_memoria.py destino/        # gera na pasta indicada
"""

import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(AQUI, "MEMORIA-COMPLETA.md")
MARCADOR = re.compile(r"^<!-- FILE: (/[^>]+?) -->\s*$", re.MULTILINE)


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "arvore")

    with open(ORIGEM, encoding="utf-8") as f:
        bruto = f.read()

    partes = MARCADOR.split(bruto)
    # partes[0] é o cabeçalho, depois alterna caminho, conteúdo
    pares = list(zip(partes[1::2], partes[2::2]))

    if not pares:
        sys.exit("Nenhum marcador FILE encontrado.")

    for caminho, conteudo in pares:
        alvo = os.path.join(destino, caminho.lstrip("/"))
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        with open(alvo, "w", encoding="utf-8") as f:
            f.write(conteudo.strip() + "\n")
        print(f"gravado: {alvo}")

    print(f"\n{len(pares)} arquivo(s) em {destino}")


if __name__ == "__main__":
    main()
