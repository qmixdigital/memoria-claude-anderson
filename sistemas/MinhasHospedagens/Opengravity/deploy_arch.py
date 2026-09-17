# -*- coding: utf-8 -*-
"""Manda uma arquitetura local para o archs.js de um servidor do motor.

Escrito depois do erro de 17/08, em que o deploy cortava o arquivo ate
`const ARCHS` e levava junto a arquitetura seguinte. Aqui nada e cortado: o
corpo novo e inserido ANTES do bloco `const ARCHS = {` e a linha de registro
entra DENTRO do objeto, sem tocar no que ja existe.

O transporte e por scp. Mandar o arquivo em base64 numa linha de echo estoura
o limite do shell com 10 KB de fonte.

Uso:  python deploy_arch.py <servidor> <letra> [<letra> ...]
A fonte e sempre D:\\PORTAIS\\_infra\\arch-<LETRA>.js, nunca o servidor.
"""
import io, os, re, subprocess, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
FONTE = r"D:\PORTAIS\_infra"
REMOTO = "/opt/portal-engine/src/archs.js"
TMP = os.environ.get("TEMP", ".")

INSERIDOR = '''import io
alvo = "/opt/portal-engine/src/archs.js"
t = io.open(alvo, encoding="utf-8").read()
corpo = io.open("/tmp/arch_corpo.js", encoding="utf-8").read()
linha = io.open("/tmp/arch_linha.txt", encoding="utf-8").read()
marca = "const ARCHS = {"
i = t.index(marca)
t = t[:i] + corpo + "\\n" + t[i:]
j = t.index(marca) + len(marca)
t = t[:j] + "\\n" + linha.rstrip("\\n") + t[j:]
io.open(alvo, "w", encoding="utf-8").write(t)
print("inserido")
'''

SCRIPT = (
    "set -e\n"
    "A=/opt/portal-engine/src/archs.js\n"
    "cp $A $A.bak-$(date +%Y%m%d-%H%M%S)\n"
    "python3 /tmp/insere_arch.py\n"
    "node --check $A && echo SINTAXE_OK\n"
    "node -e \"const{ARCHS}=require('/opt/portal-engine/src/archs.js');"
    "console.log('arquiteturas:',Object.keys(ARCHS).length,Object.keys(ARCHS).join(' '))\"\n"
)


def sh(host, cmd):
    p = subprocess.run(["ssh", host, cmd], capture_output=True, timeout=600)
    return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")


def envia(host, local, remoto):
    p = subprocess.run(["scp", "-q", local, "%s:%s" % (host, remoto)], capture_output=True, timeout=300)
    return p.returncode == 0, p.stderr.decode("utf-8", "replace")[:160]


def grava(caminho, texto):
    io.open(caminho, "w", encoding="utf-8", newline="\n").write(texto)


def deploy(host, letra):
    cam = os.path.join(FONTE, "arch-%s.js" % letra)
    if not os.path.exists(cam):
        print("  [%s] fonte nao existe: %s" % (letra, cam))
        return False
    src = io.open(cam, encoding="utf-8").read()
    corpo = re.sub(r"\nmodule\.exports\s*=\s*\{[^}]*\};?\s*$", "\n", src).rstrip() + "\n"
    p = letra.lower()
    linha = ("  %s: { letter: '%s', css: %sCss, header: %sHeader, footer: %sFooter, "
             "home: %sHome, article: %sArticle, list: %sList },\n"
             % (letra, letra, p, p, p, p, p, p))

    rc, out, err = sh(host, "grep -c \"^  %s: {\" %s || true" % (letra, REMOTO))
    if out.strip().isdigit() and int(out.strip()) > 0:
        print("  [%s] ja registrada no servidor, pulando" % letra)
        return True

    c1 = os.path.join(TMP, "arch_corpo_%s.js" % letra)
    c2 = os.path.join(TMP, "arch_linha_%s.txt" % letra)
    c3 = os.path.join(TMP, "insere_arch.py")
    grava(c1, corpo)
    grava(c2, linha)
    grava(c3, INSERIDOR)
    for local, remoto in ((c1, "/tmp/arch_corpo.js"), (c2, "/tmp/arch_linha.txt"), (c3, "/tmp/insere_arch.py")):
        ok, msg = envia(host, local, remoto)
        if not ok:
            print("  [%s] scp falhou em %s: %s" % (letra, remoto, msg))
            return False

    rc, out, err = sh(host, SCRIPT)
    txt = (out.strip() or err.strip()[:300]).replace("\n", " | ")
    print("  [%s] %s" % (letra, txt))
    return rc == 0 and "SINTAXE_OK" in out


if __name__ == "__main__":
    host = sys.argv[1]
    letras = sys.argv[2:]
    ok = sum(1 for L in letras if deploy(host, L))
    print("\n%d de %d arquiteturas no ar" % (ok, len(letras)))
    if ok:
        rc, out, err = sh(host, "systemctl restart portal-engine 2>/dev/null; sleep 2; "
                                "systemctl is-active portal-engine 2>/dev/null || echo '(sem systemd)'")
        print("servico:", (out.strip() or err.strip())[:200])
