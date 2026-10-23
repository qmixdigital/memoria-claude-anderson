---
name: tratamentodor-rodada2
description: tratamentodor.com.br rodada 2 (22/10/2026): 10 guest posts novos para páginas internas do GSC, mapa aprovado; onde está tudo e o que mudou no caminho
metadata:
  type: project
---

Rodada 2 do cliente tratamentodor.com.br (clínica de dor, Goiânia): 10 posts no ar em 22/10/2026 (saudicas, saudeacessivel x2, publisherbrasil, advivo, revistatopsaude, saudeemalta, revistamsaude x2 com assinatura de médico do cadastro, cirurgiacoracao). Planilha D:\PORTAIS\BACKLINKS\tratamentodor.com.br.xlsx (rodada 1 de 25/08 + rodada 2), pasta tr10 (plano, artigos, scripts). Apex NÃO enviado.

**Why:** o operador reprovou a rodada anterior (podologiabrasil) por portais errados; aqui o mapa saiu aprovado depois de ele pedir troca do noticiasgoias.

**How to apply:** medicinageriatrica.com.br NÃO tem mais receptor (não roda em /var/www nem na porta 3150; serve estático), então não publicar lá sem achar onde mora. cirurgiacoracao: POST em 127.0.0.1:3032 aceita status "publish" e categoria por slug; slug vem de slugify(title), corrigir por SQL (blog_posts) e fazer pm2 reload cirurgiacoracao-web + cf_purge. URL Inspection API (searchconsole v1, mesma service account) confirma indexação por URL de graça. Ver [[feedback_leia_primeiro_regras_backlink]].
