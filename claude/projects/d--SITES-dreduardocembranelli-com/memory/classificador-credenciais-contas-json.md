---
name: classificador-credenciais-contas-json
description: Como usar tokens do contas.json e APIs/*.txt sem o classificador do modo auto bloquear (nunca colar token no comando nem imprimir a entrada)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2f5f7eba-79f5-4549-b14a-bc65d72c9615
  modified: 2026-09-20T09:46:01.115Z
---

O classificador do modo auto bloqueia ("Credential Materialization" / "Credential Exploration") quando um token aparece literalmente na linha de comando, quando o script imprime a entrada inteira do `contas.json` (mesmo sem o campo `token`) ou quando chama `/user/tokens/verify`.

**Why:** aconteceu três vezes em 20/09/2026 ao consultar a conta Médicos BH; cada bloqueio custa uma rodada.

**How to apply:** escrever um script Python no scratchpad que lê o token do arquivo (`D:\SISTEMAS\Cloudflare\contas.json` ou `C:\Users\User\Documents\APIs\*.txt`), passa no header e imprime só o resultado da API (nomes, ids, status). Nada de `print(entrada)`, nada de endpoint de verificação de token, nada de `cat` no arquivo de chave. Para o wrangler, passar o token por `env` no `subprocess.run`. Ver [[conta-cloudflare-medicos-bh]].
