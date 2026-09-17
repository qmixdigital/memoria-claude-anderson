# -*- coding: utf-8 -*-
"""Roda o validador_materia.py (skill de materias jornalisticas) sobre o CORPO de um
artigo destinado a REDE PROPRIA (portal-engine).

Duas exigencias das skills sao opostas, e por isso dois bloqueios do validador nao se
aplicam aqui. Eles sao separados no relatorio em vez de escondidos:

  1. bloco "Leia tambem" (<aside class=pe-leia-meio>): a guest-post-rede EXIGE, porque e
     ele que entrega os 2 links internos e evita a injecao automatica do motor. A skill
     de parceiros proibe link no ultimo paragrafo.
  2. lista ordenada (<ol>): o auditar.py EXIGE uma; o validador conta ul e ol como
     bullet e proibe.

Todo o resto (tamanho, keyword, termos fortes, trigramas, frases longas, humanizacao)
vale integralmente e precisa passar.

Uso: python val2.py <arquivo.html> <titulo> <keyword> <resumo>
"""
import io, os, re, subprocess, sys, tempfile

VAL = r"C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py"
IGNORAR = ("link no ULTIMO paragrafo", "lista(s) com bullets no corpo")


def rodar(arq, titulo, kw, resumo):
    t = io.open(arq, encoding="utf-8").read()
    corpo = re.sub(r"<aside[\s\S]*?</aside>", "", t).strip()
    tmp = os.path.join(tempfile.gettempdir(), "corpo_" + os.path.basename(arq))
    io.open(tmp, "w", encoding="utf-8").write(corpo)
    try:
        r = subprocess.run([sys.executable, VAL, tmp, "--links", "1", "--titulo", titulo,
                            "--kw", kw, "--resumo", resumo],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        return r.stdout or ""
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    arq, titulo, kw, resumo = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    saida = rodar(arq, titulo, kw, resumo)
    reais, conhecidos, alertas, score = [], [], [], ""
    for l in saida.splitlines():
        s = l.strip()
        if "humanizacao" in s and "CAMADA B" in s:
            score = s
        if s.startswith("XX"):
            (conhecidos if any(x in s for x in IGNORAR) else reais).append(s)
        elif s.startswith("!"):
            alertas.append(s)
    print(os.path.basename(arq), "|", score)
    for x in reais:
        print("  ERRO   ", x[2:].strip())
    for x in alertas:
        print("  alerta ", x[1:].strip())
    for x in conhecidos:
        print("  (conflito estrutural conhecido, nao se aplica)", x[2:].strip()[:60])
    print("  >>>", "APROVADO" if not reais else "REPROVADO: %d erro(s)" % len(reais))


if __name__ == "__main__":
    main()
