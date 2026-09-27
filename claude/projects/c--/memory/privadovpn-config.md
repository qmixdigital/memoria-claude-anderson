---
name: privadovpn-config
description: "PrivadoVPN do Anderson configurada em 21/09/2026 no modo SmartRoute \"Tunnel\" (só navegadores pela VPN); como editar as configuracoes pelo registro (DPAPI) e por que a VPN nao pode cobrir SSH/VS Code"
metadata: 
  node_type: memory
  type: project
  originSessionId: 846633ed-f9e1-4c3a-bb7f-f4dfbb3ccfb3
  modified: 2026-09-21T09:06:20.859Z
---

PrivadoVPN 4.1.4 (`C:\Program Files (x86)\PrivadoVPN`), WireGuard, servidor
São Paulo, auto-conecta ao iniciar. **SmartRoute em modo `Tunnel`**: só Chrome,
Brave, Edge e Firefox passam pela VPN; VS Code, SSH, VozQMIX (app de ditado do
Anderson, `C:\Users\User\Desktop\VozQMIX.exe`) e APIs vão direto. DNS de tudo
vai pela VPN (198.18.0.1), de propósito, para o provedor não ver os sites.

**Why:** com a VPN cobrindo tudo, o trabalho ficava lento, o VozQMIX travava
(DNS do túnel demorando) e os servidores Hostinger davam timeout na porta 22
(IP compartilhado da VPN cai no fail2ban). O Anderson quer privacidade só na
navegação; segurança da máquina é outro assunto.

**How to apply:** as configuracoes ficam em `HKCU:\SOFTWARE\PrivadoVPN`,
valores cifrados com DPAPI (CurrentUser, UTF-16LE). Chaves que importam:
`SplitTunnelingSettings` (JSON `{"UserWebsites":[],"UserSelectedWebsites":[],
"UserSelectedApps":["caminho.exe", ...]}`), `TunnelMode` (`Tunnel` = só os
apps listados usam a VPN; `Bypass` = todos usam, menos os listados; "ByTunnel"
é só texto da tela e NAO funciona), `IsSmartRouteEnabled`/
`IsSplitTunnelingEnabled` ("True"), `ApplicationAutoConnect`, `AutoConnectType`
(`ConnectToLastSelected`). **Fechar a interface (Stop-Process PrivadoVPN)
antes de gravar**, senão ela sobrescreve ao sair; reabrir depois. Conferir no
log `C:\ProgramData\PrivadoVPN\AppData\AppData.txt` a linha
`SplitTunneling [UP], mode [Tunnel] ... apps: [...]`. Teste: `curl
api.ipify.org` (IP real) vs `msedge --headless=new --dump-dom
https://api.ipify.org` (IP da Privado).
