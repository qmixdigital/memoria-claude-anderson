# Documentação — blog.ombrogoiania.com.br

**Cliente:** Dr. Thiago Caixeta — Ortopedista especialista em **ombro e cotovelo** em Goiânia (CRM-GO 1329 · RQE 8070)
**Tipo:** Blog de conteúdo (WordPress + tema Jannah)
**Última atualização desta doc:** 2026-07-02

> Blog de CLIENTE (não é da rede de publicações QMIX). Um dos 5 blogs pendentes de migração opengravity→srv1166087 (ver `MIGRACAO-BLOGS-CLIENTES.md`). Site principal do médico: **ombrogoiania.com.br**.

---

## 1. Acesso e infraestrutura

| Item | Valor |
|------|-------|
| SSH | `ssh opengravity` (HestiaCP, user `qmix`) |
| Docroot | `/home/qmix/web/blog.ombrogoiania.com.br/public_html` |
| ⚠️ WP-CLI | roda como **root** → usar **`--allow-root`** em TODO comando e filtrar o aviso "YIKES" do output |
| Versões | WordPress 7.0 · PHP 8.3.31 · 216 posts |
| Tema | **Jannah** (TieLabs) ativo · jannah-child inativo · opções em `tie_jannah_options` (NÃO `tie_options`) |
| Plugins ativos | jannah-optimization · seo-by-rank-math · redis-cache · xml-sitemap-feed |
| Cache | **Redis** (`wp redis flush` / `wp cache flush`) + **Cloudflare** APO |
| Cloudflare | account `b7827330baf3a3a92f02972b89523639` · zona `273d1aeb06ffda98885f0879303a11e5` · token `cfat_oKIqK…` (ver `MIGRACAO-BLOGS-CLIENTES.md`) |
| Deploy de arquivos | `base64 -w0 arquivo | ssh opengravity "base64 -d > destino"` |
| WhatsApp/tel oficial | **5562991535719** (62 99153-5719) — número ÚNICO p/ ligação e WhatsApp (blog + site principal). Trocado 2026-07-02; antigos `556230890978`, `556291169657` e `(62) 99835-0080` **aposentados, não usar** |

### Purga de cache (ordem)
```bash
ssh opengravity "cd /home/qmix/web/blog.ombrogoiania.com.br/public_html && wp cache flush --allow-root"
TOKEN="<<REMOVIDO>>"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/273d1aeb06ffda98885f0879303a11e5/purge_cache" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data '{"purge_everything":true}'
```

---

## 2. Estratégia — qualificação de lead cirúrgico

**Problema:** o Dr. é **cirurgião** de ombro e cotovelo. O blog tem muito conteúdo de dor/informativo (dá autoridade/SEO) mas atraía muitos contatos de casos **não-cirúrgicos**, que não interessam ao médico.

**Solução implementada:**
1. **Removida toda a publicidade automática do tema** (aparecia em todo conteúdo).
2. **Tags de intenção cirúrgica** aplicadas só aos posts que podem **converter** em cirurgia (ombro e cotovelo).
3. **CTA de contato aparece SÓ nos posts marcados** (mu-plugin), com copy que **qualifica** o lead — o paciente não-cirúrgico se autodesqualifica.
4. Posts não-cirúrgicos ficam **sem contato** (o "cerco"): quem quiser contato usa o menu Contatos (header/footer) = caminho do determinado.

---

## 3. Publicidade automática REMOVIDA (2026-07-02, reversível)

Eram DUAS fontes (um banner roxo/teal "Dr. Thiago Caixeta → Saiba Mais" apontando p/ ombrogoiania.com.br):

**A) 5 slots de Ad do Jannah** (`tie_jannah_options`, toggles → `false`, códigos preservados):
`banner_top_tab`, `banner_above_content`, `banner_category_below_posts`, `article_inline_ad_1` (após 20 parág.), `article_inline_ad_2` (após 40).

**B) 3 widgets "Stream Item"** movidas p/ `wp_inactive_widgets` (sidebar `primary-widget-area` + 2 seções da home `tiepost-1015-section-*`).

- **Backup:** `opengravity:/home/qmix/tie_jannah_options.backup-20260702.json`
- **Banner HTML original:** `D:\SISTEMAS\MinhasHospedagens\blog-ombrogoiania\banner-cta-original.html`

---

## 4. Tags de cirurgia

| Tag | ID | slug | Posts | Cobre |
|-----|----|----|------|-------|
| Cirurgia de Ombro | 34 | `cirurgia-de-ombro` | 68 | cirurgia/artroscopia/prótese de ombro; lesão de manguito; luxação/instabilidade (Bankart, Hill-Sachs, SLAP, HAGL, labral); fratura úmero proximal/clavícula; ruptura de tendão; artrose/osteonecrose→prótese |
| Cirurgia de Cotovelo | 35 | `cirurgia-de-cotovelo` | 19 | artroscopia/liberação de cotovelo; ruptura bíceps/tríceps distal; fraturas (rádio, olécrano, úmero distal); luxação; túnel cubital; lig. colateral ulnar; condromatose; PVNS; artrose de cotovelo |

**Critério de inclusão:** "diretamente relacionado a cirurgia OU que pode levar/converter em cirurgia".
**Excluídos:** anatomia pura, dor genérica/irradiada, infiltração/PRP/regenerativa, bursite/tendinite/capsulite/epicondilite simples (conservador), escápula alada, e **pós-operatório** (público que já operou = não converte).

> Links: https://blog.ombrogoiania.com.br/tag/cirurgia-de-ombro/ · https://blog.ombrogoiania.com.br/tag/cirurgia-de-cotovelo/

**Histórico de ajuste:** o `cirurgia-de-ombro` começou com 72 posts; removidos 4 de pós-operatório por não converterem (Dieta após cirurgia, Como dormir após cirurgia, Como dormir com prótese, Muita dor após artroscopia) → 68. Removeu-se a TAG, não o artigo.

---

## 5. CTA seletivo — mu-plugin `mc-cta-cirurgia.php`

Injeta o CTA de contato via filtro `the_content`, **APENAS** em `is_singular('post')` que tenham a tag `cirurgia-de-ombro` OU `cirurgia-de-cotovelo` (`has_term`).

- **2 posições:** após o 3º parágrafo (fim da introdução) + no fim do artigo.
- **Copy que qualifica** (o "cerco"): *"Seu caso pode ter indicação de cirurgia? … Se você já tem indicação de cirurgia, laudo de ressonância ou não melhorou com o tratamento conservador…"* + nota *"Atendimento voltado a casos cirúrgicos. Dores sem indicação geralmente começam pela fisioterapia."*
- **WhatsApp** `5562991535719`, mensagem pré-preenchida **com o título do artigo** (o Dr. vê de qual conteúdo veio cada lead → métrica).
- **Visual:** card roxo (#6E417C) + **botão verde WhatsApp (#25D366) com texto verde-escuro (#0a3d1f)** + badge/borda verdes. Constantes no topo do arquivo (`MC_CTA_TAGS`, `MC_CTA_WHATS`).
- Para **adicionar outra tag** ao gatilho, basta incluí-la em `MC_CTA_TAGS`.

---

## 6. Logo e avatar (fix 2026-07-02)

- **Logo do header** apontava p/ `2025/11/Ortopedista-ombro-Dr-Thiago-Logo-cor.webp` que foi **deletado** (301→home = imagem quebrada). A logo real (wordmark horizontal 230×50) estava no site principal em `ombrogoiania.com.br/img/Ortopedista-ombro-Dr-Thiago-Logo-cor.webp` → baixada p/ a mídia (attachment 4802) e as 4 chaves de logo do `tie_jannah_options` (logo/logo_retina/mobile_logo/mobile_logo_retina) apontadas p/ ela. ⚠️ **NÃO usar** `cropped-cropped-…Logo-cor.webp` (512×512) — esse é o **favicon**, não a logo do header.
- **Avatar do autor** (Dr. Thiago, user ID 2): não aparecia (e-mail local sem Gravatar + simple-local-avatars NÃO ativo aqui). Foto do Dr. baixada do site principal (og:image, attachment 4801) e forçada via mu-plugin **`author-avatar.php`** (filtro `pre_get_avatar_data` p/ user 2) — independe de plugin.

---

## 7. mu-plugins (`wp-content/mu-plugins/`)

| Arquivo | Função |
|---------|--------|
| **mc-cta-cirurgia.php** | CTA seletivo por tag de cirurgia (ver §5). |
| **author-avatar.php** | Força a foto do Dr. Thiago (user 2) como avatar (ver §6). |
| author-privacy.php | Desabilita author archives (301→home), remove sitemap de users, bloqueia REST `/wp/v2/users` p/ não-admin. |
| s2645dc-links.php · s2645dc-shield.php | Rede: auditoria/remoção de links externos + hardening. |
| stats-2645dc.php | Rede: contador de cliques/views real. **NÃO deletar.** |
| tf-e26616.php | Exige imagem destacada em arquivos/home (`pre_get_posts`). |
| wp-password-bcrypt.php | Hash de senha bcrypt. |

---

## 8. Avisos / o que NÃO fazer

- ❌ Não rodar WP-CLI sem `--allow-root` (roda como root).
- ❌ Não usar o `cropped-cropped-…Logo-cor.webp` como logo do header (é favicon).
- ❌ Não inventar WhatsApp — só `5562991535719` (o do site principal).
- ❌ Não deletar `stats-2645dc.php` (contador real).
- ❌ Não reativar os Ads do Jannah / widgets Stream Item (a publicidade agora é só via `mc-cta-cirurgia.php`).
- ✅ Reabilitar um Ad/widget = reverter os toggles em `tie_jannah_options` (backup salvo) ou mover a widget de volta de `wp_inactive_widgets`.

---

## 9. Pendências / próximos passos (opcionais)

- **CTA de funil** nos posts NÃO-cirúrgicos: um link discreto "Quando a dor vira caso de cirurgia? →" p/ um post-pilar cirúrgico, **sem contato** — empurra o leitor de perfil certo para onde o CTA existe, sem aumentar contato de não-cirúrgico.
- **Menu "Contatos"** é global (header/footer) = caminho do determinado; se quiser fechar mais, tirar do header e deixar só no rodapé.
- **Migração** WP→WP p/ srv1166087 (pendente para todos os 5 blogs — ver runbook).

---

*Referência na memória do Claude:* `reference_blog_ombrogoiania`.
