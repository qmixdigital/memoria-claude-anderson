---
name: terceironome-projeto
description: "Estado do site terceironome.com.br (loja de visualizações Reels): repo, VPS, DNS pendente, decisões do usuário"
metadata:
  node_type: memory
  type: project
  originSessionId: 13225851-a65d-45e5-bcd6-8d0d91103e0b
  modified: 2026-10-14T12:16:54.408Z
---

Site novo em `d:\SITES\terceironome.com.br`, motor copiado do Enjai (Next 14 + Prisma + OpenPix + painel SMM), enxugado para o nicho único "comprar visualizações Reels" (views, curtidas, salvamentos). Marca: "Terceiro Nome" (palpite derivado do domínio).

- GitHub: `qmixdigital/terceironome` (privado), token em `C:\Users\User\Documents\APIs\github.txt`. Push com token na URL foi bloqueado; `git push` simples funciona pelo credential manager.
- VPS escolhida: `clinicas-vps` (31.97.162.199), app em `/var/www/terceironome`, PM2 `terceironome` porta 3130 (efêmera `-b` 3131), PM2_HOME=/root/.pm2 e PATH com /root/.bun/bin; NUNCA `pm2 update`. DB Postgres `terceironome` (role `terceironome`). Nginx em `/etc/nginx/conf.d/terceironome.conf`, cert autoassinado em `/etc/ssl/terceironome` (provisório, modo Cloudflare Full).
- Cloudflare: zona `terceironome.com.br` (id c179350f...) está `pending`: faltam trocar os NS no Registro.br para dimitris.ns.cloudflare.com e lila.ns.cloudflare.com. Token em `APIs\cloudflare-pages.txt` lê DNS mas não SSL. Depois falta criar registro A para 31.97.162.199.

**Decisões do usuário (14/10/2026):** sem depoimentos por ora; GA4 e Clarity limpos (ID novo do GA4 ainda não informado); artigos NÃO copiados do Enjai, serão escritos depois; textos só sobre Reels.

**Why:** domínio expirado comprado em leilão, quer site novo de um único nicho.
**How to apply:** não reintroduzir depoimentos, GA4/Clarity do Enjai nem conteúdo de outras redes; artigos só quando o usuário pedir.

## Atualização 14/10/2026 (noite)
- Marca definitiva: **Terceiro Reels** (domínio terceironome.com.br, canônico www). Design "sala de projeção" (papel creme, tinta, vermelho REC, Big Shoulders). Categoria no banco precisa ter slug `instagram` (checkout valida link do Instagram por ele).
- **Deploy**: sempre `scp` do fonte para /var/www/terceironome e `bash deploy.sh` (build em /var/www/terceironome-build, B sobe, A é parada, troca .next, A volta). NUNCA buildar na pasta no ar: dava "Application error" para todos. Validado com probe: 338 páginas, 0 falhas. ecosystem.config.cjs não vai no tar (B usa cwd do build).
- GA4: propriedade `properties/558902038`, fluxo G-5LGQFDXVKF, configurada pela Admin API com a SA enjai-ga4-reader (tem permissão de edição): retenção 14 meses, medição aprimorada, eventos-chave e dimensões. GSC: `sc-domain:terceironome.com.br`, sitemap enviado. Bing: site verificado por BingSiteAuth.xml. IndexNow chave <<REMOVIDO>>
- Não copiei a chave da SA para o servidor (os relatórios do /admin/analytics precisariam de GOOGLE_APPLICATION_CREDENTIALS).
