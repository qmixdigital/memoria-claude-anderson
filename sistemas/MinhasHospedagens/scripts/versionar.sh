#!/bin/bash
# Versiona um projeto no git com barreira anti-segredo ANTES do primeiro commit.
#
# Por que a barreira: segredo commitado nao sai mais do historico. O .gitignore
# so protege arquivo NAO rastreado, entao a ordem importa - ignorar primeiro,
# adicionar depois. E conferir pelo CONTEUDO tambem, porque segredo vaza dentro
# de arquivo comum (foi assim que o Client Secret do Google foi parar num .mjs).
#
# A BARREIRA FALHA FECHADA. A primeira versao deste script tratava erro do git
# como "lista vazia" e teria liberado o commit sem conferir nada - foi o que
# aconteceu no notebookx, onde o git recusou o diretorio por dono diferente e o
# script anunciou "nenhum segredo encontrado".
set -uo pipefail
DIR=$1
cd "$DIR" || exit 1
echo "### $(basename "$DIR")"

git config --global --add safe.directory "$DIR" 2>/dev/null || true

# ---------- 1. .gitignore ----------
touch .gitignore
adicionar() { grep -qxF "$1" .gitignore || { echo "$1" >> .gitignore; echo "    + $1"; }; }
echo "  ajustando .gitignore:"
adicionar "node_modules"
adicionar "/.next/"
adicionar ".env"
adicionar ".env.*"
adicionar "!.env.example"
adicionar "!.env.local.example"
adicionar "*.pem"
adicionar "*.key"
adicionar "tsconfig.tsbuildinfo"
adicionar "/public/uploads/"

# ---------- 2. init ----------
if [ ! -d .git ]; then
  git init -q
  git symbolic-ref HEAD refs/heads/main
  echo "  repositorio iniciado"
fi

git reset -q >/dev/null 2>&1 || true
if ! git add -A; then
  echo "  !! ABORTADO - o git nao conseguiu montar o indice."
  exit 1
fi

# ---------- 3. barreira anti-segredo ----------
echo "  conferindo o que entraria no commit:"
LISTA=$(mktemp)
if ! git diff --cached --name-only > "$LISTA" 2>/dev/null; then
  echo "  !! ABORTADO - o git nao listou o que seria commitado."
  echo "     Sem essa lista nao da para afirmar que nao ha segredo."
  rm -f "$LISTA"; exit 1
fi

if [ ! -s "$LISTA" ]; then
  echo "  !! ABORTADO - lista vazia. Nada a versionar, ou o git falhou em silencio."
  rm -f "$LISTA"; exit 1
fi

SUSPEITOS=$(grep -EI "(^|/)\.env|\.pem$|\.key$|id_rsa|id_ed25519|\.sql$|\.sql\.gz$|secret" "$LISTA" \
  | grep -vE "(^|/)\.env(\.local)?\.example$" || true)

CONTEUDO=$(tr '\n' '\0' < "$LISTA" \
  | xargs -0 -r grep -lIE "GOCSPX-[A-Za-z0-9_-]{10,}|(postgres(ql)?|mysql|mongodb(\+srv)?)://[A-Za-z0-9_.-]+:[^@[:space:]\"']{6,}@|sk-[A-Za-z0-9]{20,}|gh[ps]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}" 2>/dev/null || true)

if [ -n "$SUSPEITOS$CONTEUDO" ]; then
  echo "  !! ABORTADO - isto entraria no commit:"
  [ -n "$SUSPEITOS" ] && echo "$SUSPEITOS" | sed 's/^/     nome suspeito: /'
  [ -n "$CONTEUDO" ] && echo "$CONTEUDO" | sed 's/^/     segredo no conteudo: /'
  git reset -q; rm -f "$LISTA"; exit 1
fi
echo "    nenhum segredo encontrado"
echo "  arquivos a versionar: $(wc -l < "$LISTA")"
rm -f "$LISTA"
exit 0
