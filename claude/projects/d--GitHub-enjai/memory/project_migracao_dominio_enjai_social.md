---
name: project_migracao_dominio_enjai_social
description: "2026-10-03: enjai MIGROU de enjai.com.br para enjai.social (virada concluida 19:40 UTC). Dominio antigo responde 301, menos /api/. Lista do que NAO trocar e pendencias do Anderson"
metadata:
  type: project
---

**Ordem do Anderson em 2026-10-03:** o Enjai passa a usar **enjai.social** (registrado 19:19 UTC desse dia, Njalla/Tucows). Redirecionar tudo do enjai.com.br, inclusive e-mail no Resend.

**Cloudflare:** mesma conta do enjai.com.br (conta27 em `D:/SISTEMAS/Cloudflare/contas.json`, account `75a81880...`; a nota do contas.json diz "DanfeMax" mas o token edita todas as zonas da conta). Zona nova `e33ab905343b6d6eb932ace4d2f82e81` (NS hadlee/melnicoff), zona antiga `2372d1b17fc71e21517eca5977a1dc64`.

**Feito no preparo (antes do dominio resolver):**
- Zona nova: A apex + CNAME www proxied para 31.97.173.40; ssl full, always_use_https, min TLS 1.2, security high; WAF custom, rate limit e headers copiados da zona antiga; regras de Email Routing `contato@` e `social@` criadas (o `enable` do routing so funciona com zona ATIVA: refazer `POST /zones/<id>/email/routing/enable`).
- Resend: dominio `enjai.social` criado (id `92d067e5-b547-4242-95b6-192e5a760a40`, sa-east-1). Registros no CF: `resend._domainkey` TXT, `send` MX + TXT, **`rsend` CNAME -> send.forge.rmta.net (registro novo que o Resend passou a pedir, DNS only)**, mais `_dmarc` p=none. Verificar com `POST /domains/<id>/verify` depois que o dominio resolver.
- nginx: `enjai.social www.enjai.social` adicionados ao server_name (backup `/root/enjai.conf.bak-20261003-presocial`). Config da virada pronta em `/root/enjai.conf.new` (gerada por `/root/gera_nginx.py`).
- Script de troca no codigo: `/root/troca_dominio.py /var/www/enjai [--apply] [--email]` (backup `.bak-dominio` por arquivo).

**Ordem da virada (so com https://enjai.social respondendo 200 pela Cloudflare):** verificar Resend; `troca_dominio.py --apply --email`; `.env.local` (NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL, VAPID_SUBJECT); chave `"enjai.social"` no BRANDS de `campanha_enviar.mjs` e `fluxos_enviar.mjs` (eles escolhem remetente pelo host do SITE_URL); deploy; trocar nginx pelo `.new`; purge das duas zonas; Telegram setWebhook; cron `reenviar-pendencias` (usa URL publica); DB `Artigo.imagemCapa` (48) e `Banner` (1).

**NAO trocar:**
- `anonimo@enjai.com.br`: sentinela gravada em ~1.990 pedidos; codigo compara com ela.
- `GSC_SITE_URL sc-domain:enjai.com.br` ate existir propriedade nova no Search Console.
- Webhook OpenPix continua registrado em `https://enjai.com.br/api/webhook/openpix`: por isso o dominio antigo NAO redireciona `/api/` nem metodo nao-GET. Cada webhook Woovi tem hmac proprio (ver [[reference_truenet_infra]]); migrar exige trocar `OPENPIX_WEBHOOK_SECRET`.

**So o Anderson pode fazer:** adicionar `https://enjai.social/api/auth/callback/google` (e a origem `https://enjai.social`) no cliente OAuth do Google Cloud, senao o login Google das ferramentas gratis quebra no dominio novo; criar a propriedade no Search Console e usar "Mudanca de endereco"; atualizar a URL do fluxo no GA4.

Ver [[project_migracao_enjai_srv1166087]], [[project_resend_dominios]], [[reference_dominios_sites]].

**VIRADA CONCLUIDA em 2026-10-03 ~19:40 UTC.** Estado final, verificado ao vivo:
- `https://enjai.social` = principal (canonical, og:url, sitemap com 340 URLs, robots). `www.enjai.social` 301 para o apex.
- `enjai.com.br` e `www.` respondem 301 para `https://enjai.social$request_uri` (GET/HEAD). `/api/` e metodos nao-GET continuam atendidos no host antigo. nginx em `/etc/nginx/conf.d/enjai.conf`; backups `/root/enjai.conf.bak-20261003-presocial` (original) e `-previrada`.
- Codigo: 158 arquivos / 271 ocorrencias trocadas (backup `.bak-dominio`). `.env.local`: NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL, VAPID_SUBJECT (backup `/root/enjai.env.local.bak-20261003-predominio`).
- Resend: `enjai.social` VERIFIED; remetente `noreply@enjai.social` em `lib/email.ts`, `campanha_enviar.mjs`, `fluxos_enviar.mjs`. Teste enviado e `delivered` em contato@enjai.social (Email Routing ativo: contato@ -> anderson.gna, social@ -> qmixdigital).
- Telegram webhook em `https://enjai.social/api/webhook/telegram`. Cron `reenviar-pendencias` com URL nova (backup `/root/crontab.bak-20261003-predominio`).
- Banco: 48 `Artigo.imagemCapa` e 1 `Banner.linkDireito` atualizados. Restam so dados historicos de cliente/ticket.
- Cache das duas zonas purgado.

**Dominio publico do enjai agora e `enjai.social`** (atualiza [[reference_dominios_sites]]). Para curl de verificacao usar esse host.

**Licao:** dominio recem-registrado da NXDOMAIN ate o TLD publicar (levou 14 min) e depois o certificado de borda da Cloudflare leva mais ~2 min. Consultar o dominio antes disso deixa NXDOMAIN em cache negativo no resolvedor usado (1.1.1.1 ficou assim). Nao redirecionar antes de `https://dominio-novo` responder 200 pela borda.

**Indexacao do dominio novo (2026-10-03 ~19:55 UTC):**
- Search Console: o Anderson adicionou a service account `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` (chave `<<REMOVIDO>>`) como usuario total de `sc-domain:enjai.social`. Sitemap `https://enjai.social/sitemap.xml` enviado pela API (340 URLs).
- Bing Webmaster (chave em `C:/Users/User/Documents/APIs/bing-webmaster-tools.txt`, conta com 69 sites): `https://enjai.social/` adicionado e VERIFICADO; sitemap enviado por `SubmitFeed`. A verificacao por CNAME (`<DnsVerificationCode>.enjai.social` -> verify.bing.com) nao confirmou em 2 min; confirmou na hora com `public/BingSiteAuth.xml` (exige `pm2 reload`, o `next start` so le o public/ ao subir). Os dois ficaram no ar.
- IndexNow: chave do enjai `0c94462930d9ef41bdeefc911095d9d1` (arquivo ja existia em public/). As 340 URLs enviadas a api.indexnow.org (200) e yandex (202). **Com o dominio novo deu 403 `SiteVerificationNotCompleted` na primeira tentativa; passou depois de o site ser verificado no Bing.**
- Pendente do Anderson: "Mudanca de endereco" no Search Console (so pela interface) e o OAuth do Google (cliente "Ferramentas enjai").

**OAuth Google liberado em 2026-10-03 19:54 UTC:** o Anderson adicionou origem e redirect do enjai.social no cliente "Ferramentas enjai" (`325392343815-dntg...`). Teste do inicio do fluxo: sem `redirect_uri_mismatch`. Resta dele so a "Mudanca de endereco" no Search Console.

**Mudanca de endereco no Search Console feita pelo Anderson em 2026-10-03** (enjai.com.br -> enjai.social, "Este site esta sendo movido"). O Google mantem a mudanca por 180 dias: o 301 e o dominio antigo precisam ficar no ar pelo menos ate abril de 2027. Pendencias restantes da migracao: confirmar um login Google real nas ferramentas, trocar links externos (bio, cadastro OpenPix), URL do fluxo no GA4; opcionais meus: webhook OpenPix no dominio novo, GSC_SITE_URL do painel admin, upstream do nginx (max_fails=0 + keepalive_timeout 3s).

**Acabamentos feitos em 2026-10-03 ~20:25 UTC (o Anderson pediu "todo o restante"):**
- GA4: URL do fluxo de dados (propriedade 529296876, stream 14168694548, `G-KZWCNV8E2L`) trocada para `https://enjai.social` pela Admin API. A service account `enjai-ga4-reader` TEM permissao de edicao, apesar do nome.
- **Webhook OpenPix agora no dominio novo:** criados "Enjai Social" (CHARGE_COMPLETED) e "Enjai Social Expirado" em `https://enjai.social/api/webhook/openpix`; `OPENPIX_WEBHOOK_SECRET` trocado pelo hmac do novo COMPLETED (prefixo `openpix_SbWB`); os dois webhooks do enjai.com.br foram APAGADOS. Teste: assinatura nova 200, antiga 401, nas duas portas e pelo publico. Backups: `/root/woovi-webhooks.bak-20261003.json` (lista antiga com hmac) e `/root/enjai.env.local.bak-20261003-prewebhook`. Isso substitui a nota acima de que o webhook ficava no dominio antigo; a excecao de `/api/` no nginx do dominio antigo continua, por causa de links e descadastro de e-mails ja enviados.
- Painel admin/search-console: `lib/gsc-data.ts` passou a consultar `sc-domain:enjai.social` E `sc-domain:enjai.com.br` e somar (env `GSC_SITE_URL_ANTERIOR`, vazio desliga). Backup `.bak-gsc-duas-propriedades`.
- nginx srv1166087: upstreams de enjai, portuga e truenet com `max_fails=0` e `keepalive_timeout 3s` (estavam fora da regra global; backups `/root/<site>.conf.bak-20261003-upstream`).
- `/root/deploy-truenet.sh` com permissao de execucao.
- **Deploy do skipark reescrito para o `-b` efemero** (sobe 3014, espera saude, recarrega 3013, derruba 3014 por trap). Antes o script abortava em `pm2 reload skipark-b` e mandava "Deploy FALHOU" falso no Telegram a cada deploy. Backup `/root/deploy-skipark.sh.bak-20261003-b-efemero`. Testado: 127s, B removido no fim. Atualiza [[reference_deploy_skipark]].
- Ao gerar TS por heredoc + Python, barras invertidas somem (`"\."` virou `"\."`): montar com `chr(92)` e conferir o arquivo final.

**Nao feito, fora do meu alcance:** links externos (bio do Instagram, cadastro da OpenPix) e o teste de login Google com conta real. **Nao iniciado de proposito:** fase 2 do "sem comprar" ([[project_reposicionamento_sem_comprar]]): o Google recomenda nao mexer em conteudo durante mudanca de dominio; no enjai esperar a migracao assentar.
