---
name: qmix-newsletter-digest
description: Newsletter de artigos (tema claro) com rastreamento próprio de abertura/clique e localização; como criar, testar e agendar
metadata:
  type: project
---

Newsletter tipo `digest-artigos` (13/09/2026): `newsletters.conteudo = {type:'digest-artigos', params:{titulo, intro, slugs[]}}`,
categoria `seo` (283 clientes com newsletter_seo). Template claro em `src/lib/emails/newsletter.ts`
(`htmlDigestArtigos`), cabeçalho "QMIX  GEO · SEO · BACKLINKS" (Anderson aprovou o layout).

**Rastreamento próprio** (não depende do Resend): pixel `/api/newsletter/t/abrir?d=<id.hmac>` e
redirecionador `/api/newsletter/t/clique?d=…&u=…` (só redireciona para qmix.com.br). Grava em
`newsletter_eventos` (tipo, url, ip, user_agent, cidade/estado/pais via cabeçalhos do Cloudflare,
Managed Transform "visitor location" ligado no zone) e atualiza os mesmos contadores do Resend
(newsletter_destinatarios.opened_count/clicked_count, totais da newsletter). Abertura via proxy do
Gmail vem do IP do Google: não grava cidade ("via proxy do e-mail"); só o CLIQUE dá a cidade real.

**Fluxo:** criar newsletter (scripts/criar-newsletter-digest.mjs como modelo) → teste:
POST 127.0.0.1:3020/api/newsletter/enviar {newsletterId, testEmail} (cria destinatário status 'teste')
→ zerar relatório (delete eventos+destinatarios, zerar totais) → status 'enviar' → agendar com
`/usr/local/bin/qmix-newsletter-envio.sh <id>` no crontab (linha única, se apaga ao rodar, avisa no Telegram).
Horário escolhido com estudos + dados próprios (logins: terça 10h/15h): **terça 10h SP = 13h UTC**.
Newsletter #6 (3 artigos de 13/09) agendada para 15/09/2026 10h SP.

Servidor roda em UTC; PM2 das duas instâncias agora tem TZ=America/Sao_Paulo (painel mostra hora SP).
