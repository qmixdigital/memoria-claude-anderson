---
name: projeto-cirurgiaquadril
description: "Site Calábria & Bernardes (cirurgiaquadril.com.br): estado, deploy Cloudflare Pages, pendências antes de abrir ao Google"
metadata:
  node_type: memory
  type: project
  originSessionId: fb846b32-49fb-4a5f-beff-ea387b445c50
  modified: 2026-10-12T22:11:02.054Z
---

Site estático gerado por `_build/build.py` (+ content.py, style.css, main.js) para `site/`. 12 páginas do mapa da agência + privacidade, termos, 404. Deploy: Cloudflare Pages, projeto `cirurgiaquadril`, conta 45e7dafa18fcf3b5ee851edc25343702, token em `C:\Users\User\Documents\APIs\cloudflare-pages.txt` (expira 15/10/2026). Comando: `npx wrangler@4 pages deploy site --project-name cirurgiaquadril --branch main`. Prévia em cirurgiaquadril.pages.dev com noindex só nesse host (`_headers`).

**Why:** dois cirurgiões (Márcio Calábria CRM-GO 13.591 RQE 8033; Tiago Bernardes CRM-GO 13.658 RQE 8594) operam juntos desde 2010; agência (Camila Farias) mandou proposta de redes e mapa do site. Home focada em cirurgia do quadril em Goiânia.

**How to apply:** antes de lançar: zona cirurgiaquadril.com.br NÃO está na conta Cloudflare 45e7...; textos precisam de revisão clínica dos dois; WhatsApp é provisório por médico (TEAM_WA vazio em build.py); GA4 vazio (GA_ID); RQE do Márcio só confirmado na Doctoralia; fotos do Tiago são de baixa resolução. Não citar HUGOL nem Clínica do Esporte (agência pediu remover). Ver [[padrao-deploy-hospedagem]].

**Fato verificado (12/10/2026):** Dr. Tiago Bernardes NÃO é só diagnóstico/dor: é cirurgião de quadril como o Dr. Márcio, faz prótese e opera todas as cirurgias da equipe em conjunto. A divisão 'diagnóstico no site do Tiago, cirurgia no site novo' do mapa da agência é só divisão de conteúdo entre sites, não de especialidade. Nunca descrever um médico como foco exclusivo em algo sem ver o site dele.

**Locais e contatos (12/10/2026, do cliente e dos sites dos médicos):** Dr. Tiago atende no COE (R. S-6, 146, 1º andar, S-6 Medical Center, Setor Bela Vista, CEP 74823-470; maps.app.goo.gl/rXQ2wrf2LQNyjLyNA; fones (62) 3089-0978 e 9 8660-0978; WhatsApp do site dele = 556230890978). Dr. Márcio atende no Hospital Clínica do Esporte (Rua 87, nº 74, Setor Sul, ao lado da Praça do Cruzeiro; (62) 9855-9583 = wa 556298559583; (62) 3239-0101); o site dele também lista EVOLUE e CRD Planalto, não usados aqui. Horário definido pelo cliente: seg a sex, 8h às 18h para os dois (site do Márcio mostra 07:30 às 19:00, divergente). Formação do Tiago: Medicina ESCS/DF 2008, residência HC/UFG 2010-2012, treinamento em quadril HGG 2013-2014, título SBQ, staff COE, preceptor CRER; 6 citações na imprensa e Doctoralia 5,0 (24). Maps (maps.app.goo.gl/W7LSj9v2k7QS5Ef89), CEP 74270-220 e coordenadas do Márcio JÁ incluídos. Falta: decidir convênio do Márcio (site dele diz convênios e reembolso; Doctoralia diz só particular).

**Performance (12/10/2026):** fontes auto-hospedadas em `_build/fonts` (Bricolage, Hanken, DM Mono; sem Google Fonts), CSS minificado inline em cada página (`__CSS__` em build.py), radiografias com variante `-800.webp` + srcset. PSI mobile subiu de 84-90 para 98-99 (LCP 1,8-1,9 s). SEO 69 no PSI é só o noindex do pages.dev; some ao lançar no domínio. Ao mudar CSS, só rodar `python _build/build.py` (não há mais style.css externo).

**NO AR (13/10/2026):** domínio cirurgiaquadril.com.br e www ligados ao projeto Pages (zona ativa, NS celine/margo.ns.cloudflare.com, CNAME proxied criados, SSL ativo). Pode indexar (noindex só no host pages.dev e na página /blog vazia). Token Pages/DNS expira 15/10/2026 23:59. Token não altera zone settings/rulesets: "Always Use HTTPS" já redireciona http->https; www->apex só por canonical + script no head (301 real exigiria regra de redirecionamento). Script: `_build/virar_chave.py --check|--go`. Falta: GA4, Search Console (enviar sitemap), revisão clínica, WhatsApp único da equipe, calabriabernardes.com.br.

**WhatsApp central (13/10/2026):** +55 62 99233-3888 (wa 5562992333888), WhatsApp Business do Dr. Tiago que atende os dois; TEAM_WA em build.py. Botões abrem mensagem curta e natural ("Olá! Vim pelo site e gostaria de agendar...") com médico/local nos botões específicos e assunto nas páginas de cirurgia. NUNCA mostrar origem/página/botão nem "(ainda não escolhi o médico)" no texto: o cliente estranhou; a origem fica só no GA4 (cta/medico).

**Buscadores (13/10/2026):** sitemap enviado ao Search Console (conta seoqmix, siteFullUser) e ao Bing (site adicionado e verificado por CNAME no Cloudflare + BingSiteAuth.xml). IndexNow: chave em `C:\Users\User\Documents\APIs\indexnow-cirurgiaquadril.txt`, arquivo-chave e BingSiteAuth.xml ficam em `_build/static/` (copiados pelo build para a raiz). GA4 propriedade 558734043 (G-LQNKZG1PBQ), evento-chave generate_lead e dimensões cta/medico criados; cliente `calabria-bernardes` incluído no monitor-ia (config.json). Ao publicar artigo novo: reenviar IndexNow e o sitemap.

**Indexação Apex (13/10/2026):** "Apex" = modo Apex do Rapid URL Indexer (chave e endpoints em [[rapidurlindexer-api]], memória do projeto PORTAIS; precisa User-Agent de navegador). Enviado a pedido do usuário: projeto "cirurgiaquadril 6 artigos + blog 13-10 APEX" com /blog e os 6 artigos (7 URLs, 3 créditos cada). Antes de novo envio, conferir `GET /projects/{id}` para não repetir URL. Só enviar quando o usuário pedir.

**Blog (15/10/2026):** 20 artigos no ar (6 de 13/10 + 14 de 14 e 15/10), todos via `_build/importar_artigos.py` (META com slug, title, desc, links, fotos) e `build.py`. Só os 6 primeiros foram ao Apex (projeto 1252470); os 14 novos foram ao Apex em 15/10/2026 a pedido (projeto 1256449, 42 créditos, saldo 241). Regras em [[feedback-artigos-blog-regras]].
