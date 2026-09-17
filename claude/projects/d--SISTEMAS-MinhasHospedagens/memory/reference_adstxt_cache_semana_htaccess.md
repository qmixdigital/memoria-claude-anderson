---
name: reference_adstxt_cache_semana_htaccess
description: "ads.txt preso 7 dias na borda por ExpiresDefault do .htaccess - o AdSense continua vendo \"não encontrado\" muito depois do upload; conta CF do euvo é a conta29"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T22:27:20.241Z
---

Diagnóstico de 09/08/2026 no `euvo.com.br` (hostinger-vps1, `/home/u651115354/domains/euvo.com.br/public_html`), válido para qualquer site da rede com o mesmo `.htaccess`.

O painel do AdSense dizia "arquivo ads.txt não encontrado" com o arquivo **presente e correto desde 03/03**. Causa: o `.htaccess` tem `ExpiresDefault "access plus 1 weeks"`, e o `ads.txt` caía nessa regra — a Cloudflare guardava o objeto por **7 dias**. O efeito grave é o inverso: **enquanto o arquivo não existia, o 404 também ficava cacheado a semana inteira**, então o rastreador do AdSense seguia vendo "não encontrado" muito depois do upload.

Correção aplicada (vale replicar na rede):
```apache
<FilesMatch "^ads\.txt$">
    ExpiresDefault "access plus 5 minutes"
    Header set Cache-Control "public, max-age=300"
</FilesMatch>
```
antes do `ExpiresDefault` genérico. Backup em `.htaccess.bak-adstxt-20260809`.

Como diagnosticar sem adivinhar: `curl -sI SITE/ads.txt` e olhar `Cache-Control`, `Age`, `Last-Modified` e `cf-cache-status`. `Last-Modified` antigo com `cf-cache-status: HIT` = a borda está com cópia velha, e só purge resolve. Comparar sempre com a origem: `curl -sk --resolve dominio:443:IP_ORIGEM`.

Outros achados do mesmo dia no euvo:
- **Não tinha código nenhum do AdSense** (nem script nem meta), apesar de aprovado — provavelmente perdido no redesign ([[reference_euvo_redesign_neve]]). Instalado o mu-plugin `qmix-adsense.php` (fonte em `D:\SISTEMAS\MinhasHospedagens\scripts\`): normaliza o ID para a forma `ca-pub-`, injeta script + meta, fica fora de admin/login/feed/preview e usa `pauseAdRequests` em 404.
- A zona estava em **SSL flexible** (tráfego CF→origem em texto puro) com a origem tendo certificado válido da Google Trust Services. Passou para **full strict** + `always_use_https on` + `min_tls_version 1.2`, tudo verificado depois (http→https, www e ads.txt em 200). Se a renovação do certificado da origem falhar, isso vira 526 — reverter para `full` resolve.
- WAF da zona já estava bom, com `skip (cf.client.bot)` no topo ("nunca bloquear bot verificado") e bypass para admin/ads — ao contrário do `harden_site.py`, que aplica `block cf.threat_score gt 30` e `block user-agent vazio` **sem** regra de skip. Não rodar o harden padrão em zona que está em verificação do AdSense sem antes garantir o skip de bots verificados (ver [[reference_ratelimit_nginx_zona_chave]]).

A conta Cloudflare do euvo foi adicionada como **conta29** em `D:/SISTEMAS/cloudflare/contas.json` (account_id `02586bf98d769cb53405e4caf7dc6a85`, uma zona só). O token fica nesse arquivo, não aqui. Antes disso o euvo era o buraco do [[reference_cloudflare_api_hardening]]: nenhuma conta do arquivo enxergava a zona, então não dava para purgar por API.
