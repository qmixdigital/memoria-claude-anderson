# Configuração SSH para Notebook

## Passo 1 — Copiar a chave SSH do OpenGravity

Você precisa da chave privada que autentica no OpenGravity. No seu PC principal, copie o arquivo:

```
C:\Users\User\.ssh\id_ed25519_vps
```

Para o notebook no mesmo caminho:

```
C:\Users\SeuUsuario\.ssh\id_ed25519_vps
```

## Passo 2 — Criar o arquivo de configuração SSH

No notebook, crie/edite o arquivo `C:\Users\SeuUsuario\.ssh\config` com o conteúdo abaixo:

```
# === OpenGravity (VPS principal — jump host) ===
Host opengravity
    HostName 77.37.69.175
    User root
    IdentityFile ~/.ssh/id_ed25519_vps

# === Hostinger VPS1 (via OpenGravity) ===
Host h-vps1
    HostName 92.113.35.186
    Port 65002
    User u651115354
    ProxyJump opengravity

# === Hostinger anderson.gna (via OpenGravity) ===
Host h-anderson
    HostName 147.79.91.52
    Port 65002
    User u400588174
    ProxyJump opengravity

# === Hostinger qmixdigital (via OpenGravity) ===
Host h-qmixdigital
    HostName 82.112.247.158
    Port 65002
    User u463007860
    ProxyJump opengravity

# === Hostinger marketing-qmix (via OpenGravity) ===
Host h-marketing
    HostName 82.25.73.68
    Port 65002
    User u799434490
    ProxyJump opengravity

# === Hostverge (via OpenGravity) ===
Host hostverge
    HostName ssh.us.stackcp.com
    User qmix.com.br
    IdentityFile ~/.ssh/id_hostverge
    ProxyJump opengravity
```

## Passo 3 — Testar

Abra o terminal no notebook e teste:

```bash
# OpenGravity direto
ssh opengravity

# Hostinger VPS1 (salta automaticamente pelo OpenGravity)
ssh h-vps1
# Quando pedir senha: <<REMOVIDO>>

# Hostinger anderson
ssh h-anderson
# Senha: <<REMOVIDO>>

# Hostinger qmixdigital
ssh h-qmixdigital
# Senha: <<REMOVIDO>>

# Hostinger marketing-qmix
ssh h-marketing
# Senha: <<REMOVIDO>>

# Hostverge (usa chave, sem senha)
ssh hostverge
```

## Passo 4 — Para o Claude Code no notebook

No Claude Code, basta pedir:
- "Conecte no h-vps1" → ele roda `ssh h-vps1`
- "Conecte no h-anderson" → `ssh h-anderson`
- E assim por diante

## Resumo dos aliases

| Alias | Hospedagem | Senha SSH |
|-------|-----------|-----------|
| `opengravity` | VPS OpenGravity | (chave SSH) |
| `h-vps1` | Hostinger Cloud VPS1 | `<<REMOVIDO>>` |
| `h-anderson` | Hostinger anderson.gna | `<<REMOVIDO>>` |
| `h-qmixdigital` | Hostinger qmixdigital | `<<REMOVIDO>>` |
| `h-marketing` | Hostinger marketing-qmix | `<<REMOVIDO>>` |
| `hostverge` | Hostverge StackCP | (chave SSH via OpenGravity) |

## Arquivos necessários no notebook

```
~/.ssh/
├── config                 ← criar com conteúdo acima
├── id_ed25519_vps         ← copiar do PC principal
└── id_hostverge           ← copiar do OpenGravity (/root/.ssh/id_hostverge)
```
