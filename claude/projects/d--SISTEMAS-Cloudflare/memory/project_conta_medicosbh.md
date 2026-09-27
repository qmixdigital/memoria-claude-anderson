---
name: project_conta_medicosbh
description: "Conta Cloudflare \"Médicos BH\" (medicosbh, db7f7f1b…) exclusiva para clientes ortopedistas de BH; onboard_cliente.py; nunca no cf-bot; sem IP dedicado"
metadata: 
  node_type: memory
  type: project
  originSessionId: f9f5bbd8-be7c-408d-a17c-dea721f94c15
  modified: 2026-09-20T09:14:46.080Z
---

Em 20/09/2026 o Anderson criou a conta Cloudflare **"Médicos BH"** (`account_id`
`db7f7f1b755edba76754fd154439b50e`) para hospedar só domínios de clientes
ortopedistas de Belo Horizonte, separados da rede QMIX. Ainda sem domínios.
Cadastrada em `contas.json` como `medicosbh` (usa o CF_USER_TOKEN, que enxerga
contas novas automaticamente).

**Why:** ele queria "um IP só para eles". Expliquei que conta separada dá par de
nameservers próprio e isolamento administrativo, mas IP dedicado só existe no
Enterprise; ele aceitou e pediu para deixar tudo configurado.

**How to apply:** quando chegarem domínios, `python onboard_cliente.py dominio`
(cria a zona, mostra NS; rodado de novo depois da troca de NS aplica
harden_site + suavizar_conta + cf_www_apex). Essa conta nunca entra no
`/opt/cf-bot` da VPS. Ver [[feedback_sem_challenge_usuario]] e
[[project_dominios_excluir_bulk]].
