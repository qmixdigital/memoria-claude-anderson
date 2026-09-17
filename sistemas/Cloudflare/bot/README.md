# Cloudflare Redirects Telegram Bot

Bot Telegram para gerenciar redirects Cloudflare em massa nos 162 domínios da lista.

## Princípios de segurança

- **Whitelist por chat_id**: só usuários autorizados em `config.json` podem usar
- **Não mexe em regras internas**: raiz↔www, paths internos, WAF, rate limit, HSTS são preservados
- **Só opera em regras cross-domain**: regras que redirecionam para outro domínio

## Comandos

| Comando | Função |
|---------|--------|
| `/start` ou `/help` | Mostra comandos disponíveis |
| `/status` | Quantos domínios estão redirecionando + para qual destino |
| `/destino <url>` | Redireciona todos para a URL |
| `/whatsapp` | Redireciona todos para WhatsApp pré-formatado |
| `/desativar` | Desativa regras (mantém configurações) |
| `/ativar` | Reativa regras desativadas |
| `/desfazer` | DELETA todas as regras cross-domain |
| `/aleatorio N <url>` | Sorteia N domínios e redireciona |

## Deploy na VPS (opengravity)

### 1. Copiar arquivos
```bash
scp -r d:/SISTEMAS/Cloudflare/bot opengravity:/opt/cf-bot
```

### 2. Instalar dependências
```bash
ssh opengravity
cd /opt/cf-bot
pip3 install -r requirements.txt
```

### 3. Criar config.json
```bash
cp config.json.example config.json
nano config.json
# Preencher bot_token e authorized_chats
```

### 4. Instalar como systemd service
```bash
cp cf-bot.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cf-bot
systemctl start cf-bot
systemctl status cf-bot
```

### 5. Ver logs
```bash
tail -f /var/log/cf-bot.log
```

## Como pegar credenciais

### Token do bot
1. Abre [@BotFather](https://t.me/BotFather) no Telegram
2. `/mybots` → seleciona `qmixdigital_bot` → API Token
3. Cola em `config.json` → `bot_token`

### Chat ID (seu)
1. Abre [@userinfobot](https://t.me/userinfobot)
2. Envia qualquer mensagem
3. Ele retorna seu `id` (número inteiro)
4. Coloca em `config.json` → `authorized_chats: [SEU_ID]`

## Atualização da lista de domínios

Sempre que adicionar/remover domínio da lista funnel:
```bash
scp d:/SISTEMAS/Cloudflare/dominios_funnel_*.txt opengravity:/opt/cf-bot/dominios_funnel.txt
systemctl restart cf-bot
```
