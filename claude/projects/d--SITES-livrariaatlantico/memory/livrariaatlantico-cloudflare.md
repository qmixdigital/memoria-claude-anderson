---
name: livrariaatlantico-cloudflare
description: "Deploy e segurança Cloudflare do site livrariaatlantico.com.br (diretório IPTV \"Atlântico\")"
metadata: 
  node_type: memory
  type: project
  originSessionId: 46cd7876-9baa-4b9e-b158-7745e1c8791f
---

Site **Atlântico Diretório** (teste IPTV) em `livrariaatlantico.com.br` — projeto Next.js 16 static export em `d:\SITES\livrariaatlantico` (era cópia do site RBLC; domínio, marca e classes CSS já diversificados).

**Deploy (Cloudflare Pages):**
- Conta: `conta16` em [[d:\SISTEMAS\Cloudflare\contas.json]] — account_id `862514f37ef20f4575c631621a1dd750`
- Zone: `livrariaatlantico.com.br` = `97fd77ebb4b859f9f0cf7a7d7535e024` (plano Free)
- Pages project: `iptv-atlantico`, conectado ao GitHub `qmixdigital/iptv-atlantico` (branch `main`, auto-deploy)
- Build: `npm run build` → output `out/`, Node 22 via `.nvmrc`. NÃO commitar `out/` (Cloudflare buildando do source).

**Postura de segurança (intencional):** PERMITIR bots de IA + buscadores; BLOQUEAR ferramentas de SEO (Ahrefs, Semrush, Majestic, Moz, DataForSeo) e demais bots não-IA/não-buscador. `ai_bots_protection` foi **desligado** de propósito (o toggle gerenciado "Block AI bots" do Cloudflare bloqueia IA — manter OFF). WAF custom (5/5 no Free): SEO block, bot não-IA/buscador block, `.env`/`.git`, threat>30, sem User-Agent. Rate limit anti-flood >200 req/10s. Scripts aplicados: `harden_atlantico.py` e `reconcile_atlantico.py` na pasta Cloudflare.

**Cuidado:** a regra anti-bot bloqueia `curl`/`python-requests`/UA genérico — adicionar à allowlist se precisar de monitor/uptime/API.
