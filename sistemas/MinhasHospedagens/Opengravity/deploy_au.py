# -*- coding: utf-8 -*-
"""Instala a arquitetura AU no archs.js da opengravity, sem encostar nas vizinhas.

O jeito que ja apagou uma arquitetura inteira nesta rede foi recortar "ate `const
ARCHS`". Aqui nada e recortado: o bloco novo e **inserido** logo antes da tabela,
e a linha da tabela e acrescentada no topo dela.

Tres conferencias antes de gravar:

  - a letra AU ainda nao pode existir, nem como funcao nem na tabela
  - a contagem de funcoes `*Css` tem que subir **exatamente uma**
  - o arquivo tem que carregar no node depois de gravado

Sem expressao regular neste arquivo: o transporte ate o servidor come contrabarra
e um `\b` que vira `` faz a contagem dar zero, o que aborta a instalacao com
uma mensagem que parece outro problema. A contagem e por prefixo de linha.
"""
import io
import shutil
import time

ALVO = "/opt/portal-engine/src/archs.js"
NOVO = "/tmp/AU.js"


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

if "function auCss(" in t or ("  AU: { letter: 'AU'" in t):
    print("  a letra AU ja existe no archs.js. Nada feito.")
    raise SystemExit(1)

MARCA = "const ARCHS = {"
i = t.find(MARCA)
if i < 0:
    print("  nao achei a tabela ARCHS")
    raise SystemExit(1)

# ⚠️ ja aconteceu duas vezes: a copia do deploy anterior troca a CHAVE da
# tabela e deixa au FUNCOES da vizinha. O portal sobe inteiro com a cara do
# vizinho, sem erro em lugar nenhum, e so aparece na captura de tela. Por isso
# a linha e montada a partir do prefixo, e conferida logo depois de gravar
PRE = "au"
LINHA = ("  AU: { letter: 'AU', css: %sCss, header: %sHeader, footer: %sFooter, "
         "home: %sHome, article: %sArticle, list: %sList }," % (PRE, PRE, PRE, PRE, PRE, PRE)
         + chr(10))
for f in ("Css", "Header", "Footer", "Home", "Article", "List"):
    if ("function " + PRE + f + "(") not in z:
        print("  falta a funcao %s%s no arquivo novo" % (PRE, f))
        raise SystemExit(1)
t2 = t[:i] + z + MARCA + chr(10) + LINHA + t[i + len(MARCA) + 1:]

depois = conta_css(t2)
if depois != antes + 1:
    print("  contagem de arquiteturas foi de %d para %d. NAO gravei." % (antes, depois))
    raise SystemExit(1)

shutil.copyfile(ALVO, ALVO + ".bak-au-" + time.strftime("%Y%m%d-%H%M%S"))
io.open(ALVO, "w", encoding="utf-8", newline=chr(10)).write(t2)
funcs = [l.split("(")[0].replace("function ", "") for l in z.split(chr(10))
         if l.startswith("function au")]
print("  arquiteturas: %d -> %d" % (antes, depois))
print("  funcoes do AU: %s" % ", ".join(funcs))
# confere a linha instalada, que e onde o defeito mora
for l in t2.split(chr(10)):
    if l.startswith("  AU: { letter:"):
        print("  linha da tabela: %s" % l.strip()[:120])
        if "css: auCss" not in l:
            print("  ⚠️ A LINHA APONTA PARA OUTRA ARQUITETURA")
