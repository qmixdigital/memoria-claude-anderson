---
name: chatbotbrx-plataforma
description: "chatbotbrx.com.br (SaaS de bot WhatsApp do Antônio) roda na srv1166087 em PHP+MySQL+Baileys; onde está cada coisa, o que já tem e o que falta para virar CRM (análise de 21/09/2026)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 055b3928-9368-4d16-8a05-4e948ba465ef
  modified: 2026-09-21T11:00:10.335Z
---

**Onde:** VPS `hostinger-vps-srv1166087`, Hestia, `/home/boot/web/chatbotbrx.com.br/public_html` (usuário `boot`),
Apache na 8080 atrás do nginx. PHP procedural + MySQL `boot_chatbotbrx` (senha em `includes/config.php`).
Bots Node em PM2 (`bot-brx-<usuario_id>`, script `whats/whatsapp-bot/bot-brx.js`, Baileys 6.7, auth em
`whats/whatsapp-bot/baileys_auth_brx-N`). Dono do código: Antônio (dev externo). É um SaaS multi-assinante
(planos, assinaturas, Asaas, afiliados, restaurantes/cardápio, n8n, OpenAI).

**"API gratuita própria" = Baileys** (protocolo do WhatsApp Web, não oficial, sem custo), integração `interno`
em `usuarios.tipo_integracao`. A alternativa paga era Z-API. Não é a Cloud API oficial da Meta.

**Contas:** usuário 2 "Qmix" (qmixdigital@gmail.com) via Z-API, 2.346 mensagens de nov/25 a mai/26 (parou);
usuário 3 Antônio via interno, nº 556199170038, 23 mensagens (teste). O número do Anderson NÃO está conectado
ao bot interno (21/09/2026).

**O que já existe e serve para CRM:** `contatos` (nome, telefone, e-mail, observações, bot_ativo, pausa,
arquivada), `mensagens` (entrada/saída, `from_api` 0 = respondida à mão pelo celular, 1 = bot; mídia; áudio
transcrito), inbox `assinante/atendimento.php` (arquivar, filtro, respostas prontas), `respostas_prontas`,
campanhas/listas de disparo, `bots` (funil por palavra-chave), base de conhecimento + prompts OpenAI.
**O bot interno já entrega ao PHP o que é enviado do celular** (`fromMe` sem `fromApi` → grava saída e pausa o
bot), então "responder pelo celular e ficar registrado" funciona com o interno. Mídia enviada do celular não é
salva (url null). `syncFullHistory: false` no bot-brx.js: não puxa histórico ao parear.

**O que falta para CRM:** funil de vendas por etapas (kanban), etiquetas, tarefas/follow-up, campos (empresa,
site, origem, valor), notas na linha do tempo, responsável, importador de conversa exportada do celular (.txt
"dd/mm/aaaa hh:mm - Nome: texto", uma conversa por vez, sem exportação em massa no WhatsApp), ponte com
`faturamento_clientes`/pedidos do qmix-next.

**Riscos:** Baileys é não oficial (risco de banimento do número principal, maior com disparos em massa);
`pm2 update` pendente na VPS (NÃO rodar: derruba tudo, ver CLAUDE.md); logs brutos do Z-API em `webhooks/`
dentro do public_html (404 via web, ok).
