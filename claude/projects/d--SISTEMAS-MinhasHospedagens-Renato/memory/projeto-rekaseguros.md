---
name: projeto-rekaseguros
description: "Site estático rekaseguros.com.br (corretora de seguros) criado em 09/10/2026 em D:\\SITES\\rekaseguros.com.br, hospedado na VPS renato-novo; placeholders pendentes do cliente"
metadata:
  node_type: memory
  type: project
  originSessionId: 6e4293bd-5182-4aa3-82d2-9b18580f5ab9
  modified: 2026-10-09T11:53:28.907Z
---

Site da corretora **Reka Seguros** (rekaseguros.com.br), estático, gerado por
`D:\SITES\rekaseguros.com.br\_dev\build.py` (rodar sobrescreve os .html). Baseado na
estrutura do concorrente minutoseguros.com.br, com textos originais. Publicado em
09/10/2026 na VPS renato-novo (CloudPanel, site id 6, vhost trocado de Node para estático).

**Why:** o usuário pediu "insira todos os dados na pasta do projeto para seguir por lá";
toda a documentação (análise, SEO, design, imagens, deploy, pendências) está em `docs/`.

**How to apply:** ao mexer no site, ler `docs/DADOS-PENDENTES.md` primeiro: telefone
WhatsApp (`5500000000000`), SUSEP (`00.000000.0`), GA4 (`G-XXXXXXXXXX`) e lista de
seguradoras ainda são placeholders. Publicar com tar | ssh renato-novo (ver `docs/DEPLOY.md`).
Screenshots headless abaixo de ~500px de largura saem cortadas (Chromium clampa a janela);
testar mobile com `--window-size=500`.
