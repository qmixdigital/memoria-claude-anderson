---
name: reference_blindagem_php_uploads_languages
description: "Rede QMIX blindada 16/07/2026: .htaccess bloqueia execução de PHP via HTTP em wp-content/{languages,uploads} nos 85 sites. Fecha o vetor do backdoor do euvo. NÃO afeta o Antônio (grava imagem, não PHP)."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
---

**Aplicado em 16/07/2026 nos 85 sites das 3 hospedagens Hostinger** (vps1 34, anderson-gna 42, qmix 9). Cada `wp-content/languages/.htaccess` e `wp-content/uploads/.htaccess` tem um bloco marcado `# QMIX hardening` que nega PHP por HTTP:

```apache
<FilesMatch "\.(php|phtml|php[0-9]|phar|phps)$">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>
```

**Por que:** o backdoor do euvo era um PHP em `wp-content/languages` chamado direto por URL. Com esta regra ele nasce **inerte** (plantado, mas não executa). É **prevenção**, não detecção — não depende de conhecer a assinatura do próximo ataque, ao contrário dos dois monitores por assinatura (o antigo `/opt/security-monitor` e o meu `qmix-integrity`), que só pegam família já conhecida.

**Estado antes:** `languages` protegido em **1 de 85** (só o euvo, feito à mão na limpeza); `uploads` em 32/85. **Depois: 85/85 nos dois.**

⚠️ **NÃO afeta o Antônio** (verificado com o euvo blindado em languages+uploads ao mesmo tempo):
- O receptor (`init-f9b8947b.php`) **grava imagem** (`.webp`), nunca PHP: valida MIME com `finfo`, rejeita o que não for webp/jpg/png/gif.
- Grava via `file_put_contents` = PHP escrevendo no disco **do lado do servidor**, que **não passa pelo `.htaccess`** (este só intercepta requisição HTTP de fora).
- Entrada é REST (`/f9b8-api/v1/artigos`), roteada pelo `index.php` da raiz, não por PHP em subpasta.
- Pós-blindagem: endpoint 403 (igual ao início), imagem webp carrega 200, backdoor `.php` plantado em languages → bloqueado.

**Por que é seguro em geral:** bloqueia a requisição HTTP, não o `include()`. Plugin que dá include de arquivo em uploads (AIOS, wpallexport) segue funcionando. `languages/` só deveria ter `.mo`/`.po`/`.l10n.php`, carregados por include, nunca por URL.

**Verificação pós-deploy:** 85/85 sites em 2xx/3xx, 0 caíram para 5xx. Backup: qualquer `.htaccess` pré-existente virou `.htaccess.bak-hardening`. Idempotente (pula se já tem `QMIX hardening`).

**Como refazer/estender** (script `blindar-lote.sh`): lê caminhos `public_html` da stdin, cria/append o bloco nas duas pastas. Rodar do meu ambiente via `cat script | ssh ALIAS "cat>/tmp/bl.sh; ls -d RAIZ/*/public_html>/tmp/t; bash /tmp/bl.sh</tmp/t"`.

Relacionado: [[reference_incidente_euvo_backdoor]], [[reference_wordfence_basic_vs_extended]], [[reference_vigia_integridade_qmix]].
