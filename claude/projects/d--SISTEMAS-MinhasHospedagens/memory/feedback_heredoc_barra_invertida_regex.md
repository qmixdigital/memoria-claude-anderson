---
name: feedback_heredoc_barra_invertida_regex
description: "Script gerado por heredoc no Git Bash do Windows perde barras invertidas; \\b virou backspace invisível numa regex e o deploy saiu \"correto\" mas inerte (08/10/2026)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-10-08T21:23:24.714Z
---

Em 08/10/2026, ao inserir `desescapaHtml()` em 4 rotas Next (saudevitalidade, institutoortopedico, cirurgiadacatarata, cirurgiadecancer) com um patch Python escrito por heredoc no Git Bash, o `\\b` do código virou `\b` no Python e, no arquivo final, um **caractere 0x08 (backspace) invisível** dentro da regex. O `grep`, o `sed -n` e o bundle minificado mostravam a regex "sem o \b" e nada acusava erro; a função só não casava nunca. Custou 4 deploys repetidos.

**Why:** heredoc no Git Bash colapsa `\\` em `\`, e o caractere resultante não aparece em nenhuma listagem.

**How to apply:** qualquer script ou patch com barra invertida (regex, `\n`, caminhos) é escrito com a ferramenta Write e enviado por scp, nunca por `cat <<EOF`. Depois de aplicar patch que contém regex, conferir com `grep -c $'\x08'` ou `python3 -c` que não há 0x08 no arquivo, e testar a função no ar antes de dar o deploy como concluído. Ver também [[reference_antonio_destino_next_contrato]].
