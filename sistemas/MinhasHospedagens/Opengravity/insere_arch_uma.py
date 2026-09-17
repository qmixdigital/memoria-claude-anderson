# -*- coding: utf-8 -*-
"""Instala uma arquitetura no archs.js do servidor, sem encostar nas vizinhas.

Uso, no servidor:  python3 /tmp/deploy_arch.py <LETRA> <prefixo> /tmp/<LETRA>.js

O jeito que ja apagou uma arquitetura inteira nesta rede foi recortar "ate
`const ARCHS`". Aqui nada e recortado: o bloco novo e **inserido** logo antes da
tabela, e a linha da tabela e acrescentada no topo dela.

Quatro conferencias antes de gravar:

  - a letra ainda nao pode existir, nem como funcao nem na tabela
  - as seis funcoes do prefixo precisam existir no arquivo novo
  - a contagem de funcoes `*Css` tem que subir **exatamente uma**
  - depois de gravar, a linha da tabela e lida de volta

🔴 A linha da tabela e montada **a partir do prefixo recebido**, e nunca copiada
de um deploy anterior: ja aconteceu duas vezes de a chave ser a nova e as
funcoes serem as da vizinha. O portal sobe inteiro com a cara do vizinho, sem
erro em lugar nenhum, e so aparece na captura de tela.

Sem expressao regular neste arquivo: o transporte ate o servidor come contrabarra
e um `\\b` que vira nada faz a contagem dar zero, o que aborta a instalacao com
uma mensagem que parece outro problema. A contagem e por prefixo de linha.
"""
import io
import shutil
import sys
import time

if len(sys.argv) < 4:
    print("  uso: deploy_arch.py <LETRA> <prefixo> <arquivo.js>")
    raise SystemExit(2)

LETRA = sys.argv[1]
PRE = sys.argv[2]
NOVO = sys.argv[3]
ALVO = "/opt/portal-engine/src/archs.js"


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

t = io.open(ALVO, encoding="utf-8").read()
antes = conta_css(t)

if ("function " + PRE + "Css(") in t or ("  " + LETRA + ": { letter: '" + LETRA + "'") in t:
    print("  a letra %s ja existe no archs.js. Nada feito." % LETRA)
    raise SystemExit(1)

for f in ("Css", "Header", "Footer", "Home", "Article", "List"):
    if ("function " + PRE + f + "(") not in z:
        print("  falta a funcao %s%s no arquivo novo" % (PRE, f))
        raise SystemExit(1)

MARCA = "const ARCHS = {"
i = t.find(MARCA)
if i < 0:
    print("  nao achei a tabela ARCHS")
    raise SystemExit(1)

LINHA = ("  %s: { letter: '%s', css: %sCss, header: %sHeader, footer: %sFooter, "
         "home: %sHome, article: %sArticle, list: %sList }," % (LETRA, LETRA, PRE, PRE, PRE,
                                                                PRE, PRE, PRE) + chr(10))
t2 = t[:i] + z + MARCA + chr(10) + LINHA + t[i + len(MARCA) + 1:]

depois = conta_css(t2)
if depois != antes + 1:
    print("  contagem de arquiteturas foi de %d para %d. NAO gravei." % (antes, depois))
    raise SystemExit(1)

shutil.copyfile(ALVO, ALVO + ".bak-" + PRE + "-" + time.strftime("%Y%m%d-%H%M%S"))
io.open(ALVO, "w", encoding="utf-8", newline=chr(10)).write(t2)

funcs = [l.split("(")[0].replace("function ", "") for l in z.split(chr(10))
         if l.startswith("function " + PRE)]
print("  arquiteturas: %d -> %d" % (antes, depois))
print("  funcoes de %s: %s" % (LETRA, ", ".join(funcs)))
for l in t2.split(chr(10)):
    if l.startswith("  %s: { letter:" % LETRA):
        print("  linha da tabela: %s" % l.strip()[:130])
        if ("css: " + PRE + "Css") not in l:
            print("  ⚠️ A LINHA APONTA PARA OUTRA ARQUITETURA")
