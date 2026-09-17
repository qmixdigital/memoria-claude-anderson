# OpenGravity - Detalhes do Projeto

## VPS Principal
- IP: 77.37.69.175 (root, SSH key auth)
- PM2 process: "opengravity"
- Diretorio: /opt/opengravity
- Node.js + npm

## Twitter/X Integration
- Conta: @QmixDigital (app "OpenGravity" no X Developer Portal)
- Plano: Pay Per Use ($5 balance adicionado)
- Workflow: usuario digita "Postar no X: [texto]" -> IA traduz/resume para PT-BR (max 220 chars) -> preview -> usuario digita "aprovado" ou "cancelar"
- Hashtags automaticas: #qmixbacklinks #comprarbacklinks #backlinksbrazil
- Termos SEO mantidos em ingles (disavow, backlinks, anchor text, etc)
- Regex de match: /^post(?:e|ar|a)\s+(?:para\s+o\s+|no\s+|n[oa]\s+)?(?:x|twitter)[:\s]+(.+)/is
- post_tweet removido das tools do agente (evita publicacao sem aprovacao)
- Segunda conta (@andersonqmix) foi abandonada - usuario nao conseguiu acessar Developer Portal

## LLM Config
- Primario: OpenAI GPT-4o (OPENAI_API_KEY no .env)
- Fallback: Groq (llama-3.3-70b-versatile, ou llama-3.2-11b-vision para imagens)
- Groq e gratuito mas instavel (429 errors frequentes)
- Migracao feita de Groq -> OpenAI como primario

## Site Monitor
- Arquivo: sites_monitorar.txt (134 dominios, um por linha)
- Verifica a cada 10 minutos
- HEAD request primeiro, GET fallback para 405
- HTTPS primeiro, HTTP fallback se HTTPS falhar
- Timeout: 15s por site
- Batch: 10 sites simultaneos
- Notifica apenas mudancas de status (down novo ou recuperado)
- Comando /sites para verificacao manual

## Email Checker
- Intervalo configuravel (EMAIL_CHECK_INTERVAL, default 5 min)
- Lista de emails ignorados para pular auto-replies
- Notifica via Telegram

## Stripe Webhook
- Endpoint: POST /stripe/webhook
- Notifica pagamentos via Telegram para todos os usuarios permitidos

## HostVerge (qmix.com.br) - PENDENTE
- Hospedagem com malware detectado pelo scanner da propria HostVerge
- SSH Host: ssh.us.stackcp.com
- Username: qmix.com.br
- Chave SSH: /root/.ssh/id_hostverge (ed25519) na VPS
- Home: /home/sites/18a/7/7672b9147f/
- PROBLEMA: SSH autentica mas authorize_ssh_login_with_cloud bloqueia comandos (exit 255)
- SFTP/SCP tambem bloqueados
- ACAO: Usuario vai contatar suporte HostVerge pedindo liberacao SSH
- ALTERNATIVA: Tentar FTP ou File Manager web do painel

## Google OAuth
- Tokens expiram a cada 7 dias (app em modo "testing")
- Precisa publicar o app para tokens permanentes

## Preferencias do Usuario
- Idioma: Portugues do Brasil
- Respostas devem ser em PT-BR
- Tweets traduzidos para PT-BR com termos SEO em ingles
- Usuario: Anderson (QMix Digital)
