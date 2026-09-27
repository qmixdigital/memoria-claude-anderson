---
name: conta-cloudflare-medicos-bh
description: "Conta Cloudflare \"Médicos BH\" (db7f7f1b...) exclusiva dos clientes ortopedistas de Belo Horizonte; preview no Pages, DNS ainda no Wix"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2f5f7eba-79f5-4549-b14a-bc65d72c9615
  modified: 2026-09-20T09:45:54.177Z
---

Os sites dos irmãos Cembranelli (dreduardocembranelli.com, pé e tornozelo; henriquecembranelli.com, mão e punho) e a clínica korpem.com.br ficam na conta Cloudflare **"Médicos BH"**, id `db7f7f1b755edba76754fd154439b50e`, entrada `medicosbh` em `D:\SISTEMAS\Cloudflare\contas.json`. Anderson quis conta separada da rede QMIX para os clientes de BH terem IPs de borda próprios.

Estado em 20/09/2026: os dois sites dos médicos foram migrados do Wix para HTML estático e publicados como projetos Pages de upload direto (`dreduardocembranelli-preview` e `henriquecembranelli-preview`, ambos `.pages.dev`), repositórios privados em `github.com/qmixdigital/<dominio>`. **A virada de DNS ainda não foi feita**: os domínios continuam apontando para o Wix. Anderson faz a troca quando o cliente passar os dados do registro (previsto para a semana de 21/09/2026). Aí falta: criar a zona na conta Médicos BH, ligar `www` e apex ao projeto Pages, trocar nameservers, preencher o `GA_ID` em `js/main.js`.

**Why:** a conta é separada de propósito; não colocar essas zonas nas contas QMIX/Aluguel Sites.

**How to apply:** deploy com `wrangler pages deploy . --project-name <slug>-preview` usando o token da entrada `medicosbh` (script lê o token do contas.json, nunca colar o token no comando). Site novo de médico de BH segue o mesmo molde dos dois já feitos. Ver [[classificador-credenciais-contas-json]].
