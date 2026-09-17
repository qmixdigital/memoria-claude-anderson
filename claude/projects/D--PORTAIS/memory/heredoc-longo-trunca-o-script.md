---
name: heredoc-longo-trunca-o-script
description: Script grande escrito por heredoc no Bash chega cortado ao meio e o Python roda a metade sem erro
metadata:
  type: feedback
---

`cat > arquivo.py <<'PY' ... PY` com algumas centenas de linhas chega **cortado**:
o Bash avisa `here-document delimited by end-of-file`, o arquivo fica com a
metade que passou e o Python roda essa metade sem reclamar de nada.

**Why:** o defeito é silencioso do lado do Python: um script de patch cortado
aplica metade das alterações e o resultado parece "quase certo".

**How to apply:** para script acima de ~120 linhas, usar a ferramenta Write, ou
partir em dois arquivos e rodar em sequência. Depois de escrever por heredoc,
conferir `wc -l` e a última linha antes de executar.

Ver [[heredoc-come-contrabarra]].
