# -*- coding: utf-8 -*-
"""Troca o bloco de UMA arquitetura ja instalada no archs.js, sem tocar nas outras.

O `deploy_a*.py` so sabe INSERIR arquitetura nova. Para corrigir uma que ja esta
no ar era preciso recortar na mao, que e exatamente o gesto que ja apagou a
vizinha nesta rede. Aqui o recorte tem duas pontas explicitas:

  - inicio: o cabecalho " * Arquitetura XX, arquetipo" do proprio arquivo
  - fim: o cabecalho da arquitetura SEGUINTE, ou `const ARCHS` se for a ultima

E tres conferencias: a contagem de `*Css` nao pode mudar, a linha da tabela tem
que continuar apontando para as funcoes do proprio prefixo, e o arquivo tem que
carregar no node depois de gravado.
"""
import io
import shutil
import sys
import time

ALVO = "/opt/portal-engine/src/archs.js"
L = sys.argv[1]
PRE = sys.argv[2]
NOVO = "/tmp/%s.js" % L


def conta_css(texto):
    n = 0
    for l in texto.split(chr(10)):
        if l.startswith("function ") and "Css(" in l:
            n += 1
    return n


z = io.open(NOVO, encoding="utf-8").read()
k = z.rfind("module.exports")
if k > 0:
    z = z[:k].rstrip() + chr(10) + chr(10)
for f in ("Css", "Header", "Footer", "Home", "Article", "List"):
    if ("function " + PRE + f + "(") not in z:
        print("  falta a funcao %s%s no arquivo novo" % (PRE, f))
        raise SystemExit(1)

t = io.open(ALVO, encoding="utf-8").read()
antes = conta_css(t)

CAB = " * Arquitetura %s, arquetipo" % L
p = t.find(CAB)
if p < 0:
    print("  a arquitetura %s nao esta instalada" % L)
    raise SystemExit(1)
i = t.rfind("/*", 0, p)

# o fim e o comeco da vizinha de baixo, ou a tabela
fim = t.find("const ARCHS = {")
q = t.find(" * Arquitetura ", p + len(CAB))
while q > 0:
    ini_viz = t.rfind("/*", 0, q)
    if ini_viz > i:
        fim = min(fim, ini_viz)
        break
    q = t.find(" * Arquitetura ", q + 10)

t2 = t[:i] + z + t[fim:]
depois = conta_css(t2)
if depois != antes:
    print("  contagem de arquiteturas foi de %d para %d. NAO gravei." % (antes, depois))
    raise SystemExit(1)

shutil.copyfile(ALVO, ALVO + ".bal-%s-" % PRE + time.strftime("%Y%m%d-%H%M%S"))
io.open(ALVO, "w", encoding="utf-8", newline=chr(10)).write(t2)
print("  %s trocado | arquiteturas: %d | bloco de %d para %d bytes"
      % (L, depois, fim - i, len(z)))
for l in t2.split(chr(10)):
    if l.startswith("  %s: { letter:" % L):
        print("  linha da tabela: %s" % l.strip()[:120])
        if ("css: %sCss" % PRE) not in l:
            print("  ⚠️ A LINHA APONTA PARA OUTRA ARQUITETURA")
