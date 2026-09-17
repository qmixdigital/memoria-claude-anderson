---
name: conversao-total
description: Nome e escopo do processo padrão de migração WordPress para o portal-engine
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:50:07.398Z
---

**CONVERSÃO TOTAL** é o nome que o Anderson deu, em 15/08/2026, ao processo
completo de migrar um portal WordPress para o portal-engine na `clinicas-vps`.

O runbook está em **`D:\PORTAIS\CONVERSAO-TOTAL.md`**. Ele é autônomo de ponta a
ponta e para em **dois pontos apenas**: mudar o DNS e desligar o WordPress de
origem.

**Escopo, na palavra dele:** conversão da plataforma e da hospedagem, criação de
logomarca, favicon, indexação no Google, equipe editorial, página de contato com
teste real de envio, exclusão de todo conteúdo que mencione IPTV, ajuste de
front-end com prints tirados por mim mesmo, conferência de single post, de links
externos e das categorias do Antônio.

**Capacidade nova que isso exigiu:** eu tiro os próprios prints com o Chrome
headless da máquina local, sem instalar nada na VPS.

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new \
  --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --screenshot="<caminho>/shot.png" "https://<DOM>/?v=$(date +%s)"
```

Recortar em faixas, olhar cada uma, ajustar com a skill `frontend-design`, repetir
até limpar. Rodar também em 390x844 para o mobile.

**Why:** antes eu dependia do Anderson mandar captura de tela para achar defeito
visual, e ele encontrou vários que eu não tinha visto. Com print próprio o ciclo
fecha sem ele.

**How to apply:** ao receber um domínio novo, abrir o runbook e executar. A
próxima arquitetura livre é a **V**.

Relacionado: [[arch-u-identidade]], [[pacote-editorial-eeat]], [[estilo-de-trabalho-anderson]]

## Rede convertida ate 16/08/2026

Dez portais no `portal-engine` da clinicas-vps: agencianacional, boxnoticias,
barranews, agoranoticias, clickinfohub, gpnoticias, dataroomus, jornalconceito,
jornalacapital e jornalimigrantes.

Os cinco ultimos ainda estao **antes da virada de DNS**: prontos, servidos pela
VPS, mas o dominio aponta para o WordPress antigo na hostinger-vps1.

⚠️ **As zonas Cloudflare desses cinco nao estao em nenhuma das 30 contas do
`contas.json`.** A virada de DNS deles precisa ser feita pelo Anderson.
