---
name: conta-cloudflare-medicos-bh
description: "Conta Cloudflare \"Médicos BH\" (db7f7f1b...) exclusiva dos clientes ortopedistas de Belo Horizonte; domínios definitivos .com.br no ar; os .com antigos ficam no Wix fazendo 301 pela VPS"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2f5f7eba-79f5-4549-b14a-bc65d72c9615
  modified: 2026-09-20T09:45:54.177Z
---

Os sites dos irmãos Cembranelli (dreduardocembranelli.com, pé e tornozelo; henriquecembranelli.com, mão e punho) e a clínica korpem.com.br ficam na conta Cloudflare **"Médicos BH"**, id `db7f7f1b755edba76754fd154439b50e`, entrada `medicosbh` em `D:\SISTEMAS\Cloudflare\contas.json`. Anderson quis conta separada da rede QMIX para os clientes de BH terem IPs de borda próprios.

Estado em 03/10/2026: os sites estão no ar nos domínios definitivos **`dreduardocembranelli.com.br`** e **`drhenriquecembranelli.com.br`** (apex canônico, `www` → apex por Redirect Rule), zonas ativas nessa conta, servidos pelos projetos Pages de upload direto `dreduardocembranelli-preview` e `henriquecembranelli-preview` (o nome "preview" ficou). `drjoaolopo.com.br` segue o mesmo padrão (projeto `drjoaolopo`).

Os `.com` antigos (`dreduardocembranelli.com`, `henriquecembranelli.com`) são registrados **no Wix, que não permite trocar nameservers**; a Cloudflare Registrar também não aceita transferência sem a zona ativa. Por isso eles ficam no Wix com os registros A apontando para a VPS opengravity (`77.37.69.175`), que devolve 301 URL a URL para o `.com.br`. Zona `.com` na Cloudflare fica "pending" para sempre: não adianta criar. Ver [[css-critico-mobile-full-e-portas]] para o gerador de CSS.

O e-mail `eduardocembranelli@dreduardocembranelli.com` é uma caixa na VPS que encaminha para o e-mail pessoal do cliente (provisório).

**Why:** a conta é separada de propósito; não colocar essas zonas nas contas QMIX/Aluguel Sites.

**How to apply:** domínio novo de cliente dessa conta: `python onboard_cliente.py <dominio>` em `D:/SISTEMAS/Cloudflare` (cria a zona com o token `medicosbh`, e depois de ativa aplica hardening, sem-desafio e www→apex); o token de `cloudflare-pages.txt` não cria zona, mas escreve DNS e domínios do Pages. Deploy do site do Dr. Eduardo: **`bash scripts/deploy.sh`**, nunca `wrangler pages deploy .` na raiz (publicava CLAUDE.md, README, scripts e _mockups no domínio; corrigido em 03/10/2026, e o site do Dr. Henrique ainda expõe README.md e scripts/). Nos outros, `wrangler pages deploy <pasta-pública> --project-name <slug>-preview` usando o token da entrada `medicosbh` (script lê o token do contas.json, nunca colar o token no comando). Site novo de médico de BH segue o mesmo molde dos dois já feitos. Ver [[classificador-credenciais-contas-json]].
