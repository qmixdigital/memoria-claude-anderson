# cerebro-claude

Backup diário do conhecimento de trabalho do Anderson (QMIX Digital): memória e skills do
Claude Code, documentação de hospedagens, clientes e processos. **Sem credenciais**: chaves,
senhas, tokens e chaves SSH não entram; onde estavam no meio de um texto, aparecem como
`<<REMOVIDO>>` (ordem do Anderson, 17/09/2026).

| Pasta no repo | Origem | O que é |
|---|---|---|
| `claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | regras globais (settings.json fica fora: lista de permissões com comandos que carregam senha) |
| `claude/skills/` | `~/.claude/skills/` | skills (guest-post-rede, materias-jornalisticas, etc.) |
| `claude/agents/`, `claude/commands/`, `claude/scheduled-tasks/` | idem | agentes, comandos, tarefas |
| `claude/projects/<slug>/memory/` | `~/.claude/projects/<slug>/memory/` | memória por projeto (MEMORY.md + fatos) |
| `sistemas/` | `D:\SISTEMAS\` | MinhasHospedagens (sem `backups`), GUEST POSTs, parceiros/wp-mcp, etc. |

Fora do backup, de propósito: transcritos de conversa (`.jsonl`, 3+ GB), `D:\SISTEMAS\MinhasHospedagens\backups`
(66 GB de dumps), `D:\SISTEMAS\QMIX VIDEOS`, código dos sites (cada um tem o próprio repositório em `qmixdigital`).

## Como roda

`backup.ps1` (tarefa agendada do Windows "Backup cerebro-claude", todo dia às 22h):
1. `robocopy /MIR` das origens para as pastas do repo, já excluindo caches, dumps e arquivos de credencial;
2. `limpar.py` varre a cópia e troca chaves/senhas por `<<REMOVIDO>>` (só na cópia, nunca nos originais);
3. `git add`, commit com a data e `push` para `origin` (repositório privado).

Log da última execução em `ultimo-backup.log` (não versionado). Rodar à mão: `powershell -File D:\GitHub\cerebro-claude\backup.ps1`.

## Restaurar em máquina nova

1. Instalar Git, Python e Claude Code; `git clone git@github.com:qmixdigital/cerebro-claude.git D:\GitHub\cerebro-claude`.
2. `powershell -File restaurar.ps1` copia `claude/` para `~/.claude/` e `sistemas/` para `D:\SISTEMAS\` (sem sobrescrever o que já existir mais novo).
3. Recriar à mão o que não está aqui: chaves SSH (`~/.ssh`), `Documents/APIs/*.txt`, `.env` de cada projeto,
   e preencher os `<<REMOVIDO>>` de `CLAUDE.md` e das skills com as chaves guardadas no gerenciador de senhas.
