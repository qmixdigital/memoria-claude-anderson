---
name: project_funnel_pulse
description: "Pulso de redirects funnel roda na VPS opengravity (/opt/cf-bot + at); doc completa em d:\\SISTEMAS\\Cloudflare\\docs\\PULSO_REDIRECTS_FUNNEL.md"
metadata:
  node_type: memory
  type: project
  originSessionId: fbc8d0f3-4277-48dc-a3a3-f65d9a464b49
  modified: 2026-08-14T13:04:22.906Z
---

**A documentação completa agora vive no repositório:** `d:\SISTEMAS\Cloudflare\docs\PULSO_REDIRECTS_FUNNEL.md`, com ponteiro no `CLAUDE.md` do projeto. Ler esse arquivo antes de agendar qualquer pulso — ele tem os comandos prontos, a receita de gerar `dividirN` novo e o checklist. O que segue aqui é só o resumo para orientar a busca.

**MECANISMO:** agendamentos rodam DENTRO da VPS `opengravity`, em `/opt/cf-bot/`, com `at` one-shot. NUNCA usar Agendador de Tarefas do Windows nem rodar do PC do Anderson.

**FUSO:** VPS em UTC, São Paulo = UTC-3. Somar +3h ao agendar. Data do `at` em `MM/DD/YYYY`.

**LISTA:** local `d:\SISTEMAS\Cloudflare\lista de domínios para redirecionamentos.txt`, cópia em uso `/opt/cf-bot/dominios_funnel.txt` — **sincronizar após editar, senão a edição não tem efeito**. Em 14/08/2026: **219 domínios**.

**Horários padrão:** madrugada 02:00 → 06:00 SP; noite 18:00 → 22:00 SP. "Desfazer às 22 horas" = **às 22:00**, não daqui a 22h.

**Decisões do Anderson que não devem ser reperguntadas:**
- Os 35 diretórios de IPTV (aesupar, cieh, ticketson, jornaldejales, hotec, etc.) são **origem permanente**, nunca mais destino.
- `criexp.com.br` e `mareonline.com.br` foram removidos da lista em 10/08/2026.
- Permalink da rede: sempre `--preserve-permalink`.

**Armadilhas já pagas:** zona fora do `contas.json` é ignorada em silêncio; remover domínio da lista com regra ativa deixa regra órfã; `curl` sem User-Agent leva 403 do WAF; `pgrep -f nome_script` casa consigo mesmo (usar `nome[_]script`); scripts `dividirN` antigos em `/opt/cf-bot/arquivo-20260806/` têm destinos obsoletos e causariam anti-loop silencioso.

Ver [[cf_user_token_master]] e [[project_tokens_limitados]].
