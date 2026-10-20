---
name: vidracaria-troca-dominio-ia-br
description: vidracariaperto so existe em vidracariaperto.ia.br (desde 18/10/2026); o .com.br foi PERDIDO e e para ignorar; o site nao e estatico
metadata:
  node_type: memory
  type: project
  originSessionId: 99225f21-7fb2-4edb-8360-cb8792667b39
  modified: 2026-10-19T13:10:43.871Z
---

O diretorio de vidracarias vive em **vidracariaperto.ia.br** desde 18/10/2026. O **vidracariaperto.com.br
foi perdido** (o Anderson disse em 19/10: "esqueca ele, foco so no dominio novo"). Nao ha o que
recuperar, redirecionar ou migrar: nao propor Mudanca de endereco, redirect 301 nem restaurar DNS dele.

O Anderson disse que o site "agora e estatico no Cloudflare", mas nao confere: continua o app Next.js em
PM2 na clinicas-vps, atras do proxy da Cloudflare (as rotas /api respondem, Cache-Control e do Next
dinamico). Nao assumir que form, API e painel nao existem.

Fatos que explicam o historico: os leads pararam em 03/10 (ultimo e o n 50) porque o .com.br ficou
inacessivel ~04/10, duas semanas antes da troca. Os links de confirmacao/descadastro dos e-mails antigos
apontam para o dominio perdido e estao mortos.

**Why:** ele quer foco total no dominio novo; gastei ~1h em 19/10 recriando a zona do .com.br na Cloudflare
antes de saber que o dominio estava perdido, e ficou inutil.

**How to apply:**
- E-mail: o Resend nao aceita cadastrar o .ia.br (plano no teto de dominios). O `RESEND_FROM` do vidracarias
  e `Vidracarias Perto <vidracarias@m.qmix.com.br>` (contingencia, mesmo padrao do Consultar Imovel). Para voltar ao
  remetente proprio (RESEND_FROM=no-reply@vidracariaperto.ia.br) e preciso upgrade do plano do Resend.
- O health check de /root/deploy-vidracarias.sh usa `Host: vidracariaperto.ia.br`; se o dominio mudar de
  novo, trocar nas 4 linhas (ja derrubou um deploy em 19/10).
- Webhooks do Resend se desativam sozinhos quando o endpoint falha: conferir `GET /webhooks`.
- Credenciais da Cloudflare: D:\SISTEMAS\Cloudflare\contas.json (indice 35 = conta BYTX). O token de
  Documents\APIs\cloudflare-pages.txt esta expirado. O Anderson autoriza mexer no DNS dele quando pede, mas o
  classificador de permissoes ja bloqueou, sem motivo, uma chamada de leitura a API da Cloudflare.
- Em 19/10/2026 o Anderson deu carta branca ("corrija tudo, o dominio e novo, delete o que for preciso"). Feito:
  CPF fora dos slugs (legacy_slug + 308), titles <=60 (src/lib/seo.ts), 2.225 fichas escondidas (sem contato / INAPTA),
  links de servico quebrados corrigidos, pool do banco 10, teto do PM2 1100 MB. Base final: 57.742 fichas.
- O bloco de 13 links dofollow da rede no rodape de TODAS as paginas (src/lib/parceiros.ts) e decisao deliberada dele
  de 18/10: nao remover sozinho. Esta registrado em PENDENCIAS.md como risco para ele decidir.
- Resend: deletei smspix.com.br (failed) e o teto de dominios persistiu; nao apagar mais nada na conta, o upgrade do
  plano e o unico caminho para o remetente proprio.
- Em 19/10/2026 foram enviados: sitemap ao Google (conta seoqmix, siteFullUser, escopo `webmasters`), sitemap ao
  Bing (VerifySite + SubmitFeed) e 67.495 URLs ao IndexNow.
Ver [[deploy-do-dev-apaga-codigo]] e D:\SITES\vidracariaperto.com.br\PENDENCIAS.md.
