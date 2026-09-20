---
name: cofre-keepassxc-licoes
description: "Cofre de segredos (KeePassXC + MCP cofre) criado em 19/09/2026; armadilhas que custaram tempo (UsePageant, sandbox, classificador) e como operar/depurar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 846633ed-f9e1-4c3a-bb7f-f4dfbb3ccfb3
  modified: 2026-09-20T00:24:09.943Z
---

Em 19/09/2026 todos os tokens de API (`Documents\APIs`, apagada) e 15 chaves
SSH privadas (removidas de `~/.ssh`, só `.pub` ficou) foram para
`C:\Users\User\Cofre\cofre.kdbx`. Uso no dia a dia está no CLAUDE.md, seção
"Cofre de segredos". Aqui só o que não está lá:

- **KeePassXC no Windows exige `SSHAgent/UsePageant=false`** no
  `%APPDATA%\KeePassXC\keepassxc.ini`. Com `UseOpenSSH=true` e `UsePageant=true`
  (padrão) ele só considera o agente ativo se o Pageant TAMBÉM estiver rodando,
  e mostra "Nenhum agente em execução". Custou uma hora.
- **KeePassXC aberto de dentro do Bash do Claude Code roda no sandbox**: não
  enxerga o pipe `\\.\pipe\openssh-ssh-agent` e nem dá para matar (`Acesso
  negado`). Sempre pedir ao Anderson para abrir pelo menu Iniciar.
- O formato do anexo `KeeAgent.settings` gerado pelo `setup_cofre.py` está
  correto (testado: 15 chaves sobem ao destravar).
- O classificador do auto mode bloqueia: ler os arquivos de token (bom), criar
  atalho na pasta Startup (persistência), editar `~/.claude.json` direto. Para
  MCP usar `claude mcp add --scope user nome cmd args` (sem `-e`, que quebra o
  parse). Atalho de inicialização: o Anderson cria ou aprova.
- `pykeepass.create_database` gera Argon2d + AES-256 (KDBX 4). Ok.
- `id_ed25519` (chave default, com passphrase própria) ficou em `~/.ssh` de
  propósito; o agente já a tinha (`user@GIGABYTE`).
- Teste de ponta a ponta: `python C:\Users\User\Cofre\teste_cliente.py`
  **pelo PowerShell** (pede senha + aprovação, roda curl no Pixabay, saída
  volta `[REDIGIDO]`; a 2a rodada não abre janela).
- Reestruturado em 19/09/2026 à noite: um serviço por login
  (`cofre_daemon.py`, named pipe) em vez de um cofre por janela, porque 7
  janelas pediam 7 senhas e cada uma trancava sozinha a cada 10 min. O
  serviço é gateado pelo KeePassXC (≥2 chaves no agente = aberto).
- **Sandbox do Bash não enxerga named pipes criados fora dele** (erro 161 no
  pipe do serviço) e um daemon subido de dentro dele fica isolado. Subir e
  testar o serviço pelo PowerShell ou pelo atalho da pasta Iniciar. O pipe
  do agente SSH é a exceção, visível dos dois lados.
- `ssh-add.exe` devolve rc 255 no ambiente mínimo que o SDK do MCP passa aos
  filhos; por isso o daemon lê o agente direto pelo pipe
  (SSH_AGENTC_REQUEST_IDENTITIES), sem subprocesso.
- Matar processo do Bash: `taskkill /PID` quebra (MSYS converte `/PID` em
  caminho). Usar `Stop-Process` no PowerShell.
- Depurar "Permission denied (publickey)": `ssh-add -l` com só 1 chave = cofre
  trancado no KeePassXC.

**Why:** Anderson pediu "o mais seguro": nada em texto puro, IA nunca vê o
valor, cada uso aprovado por clique. Ver [[github-api-publicacao]] e
[[agenda-telegram-bot]] para segredos que migraram.

**How to apply:** nunca sugerir gravar token em arquivo; toda chamada com
segredo vai por `cofre_run`; se um segredo novo aparecer, cadastrar no
KeePassXC (grupo APIs, usuário = nome da variável) e não em disco.
