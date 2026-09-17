# Documentação — blog.cirurgiadojoelhogoiania.com

**Cliente:** Dr. Ulbiramar Correia — Ortopedista especialista em **joelho** em Goiânia (CRM-GO 11552 · RQE 7240)
**Tipo:** Blog de conteúdo (WordPress + tema Jannah)
**Última atualização desta doc:** 2026-07-02

> Blog de CLIENTE. Site principal do médico: **cirurgiadojoelhogoiania.com**. Mesmo padrão do blog do ombro (Dr. Thiago) — ver `blog-ombrogoiania/DOCUMENTACAO.md`.

---

## 1. Acesso e infraestrutura

| Item | Valor |
|------|-------|
| SSH | `ssh hostinger-vps-srv1166087` (HestiaCP, user `boot` = plataforma Antônio) |
| Docroot | `/home/boot/web/blog.cirurgiadojoelhogoiania.com/public_html` |
| ⚠️ WP-CLI | `/usr/local/bin/wp` — rodar como **root** → `wp --path=<dir> --allow-root` e filtrar o aviso "YIKES" |
| ⚠️ Transferência | **scp falha** ("Connection closed") → mandar arquivo via `base64 -w0 | ssh ... base64 -d > destino` |
| Versões | WordPress · PHP 8.x · **432 posts** · AVIF aceito |
| Tema | **Jannah** (TieLabs) · opções em `tie_jannah_options` |
| Plugins ativos | seo-by-rank-math · redis-cache · xml-sitemap-feed |
| Cache | **Redis** (`wp redis flush`) + `wp cache flush` + **Cloudflare** |
| Cloudflare | **conta25** (`e1afd354b17fd5c336f44c6095f41081`) · zona `a543b64e2c25df9d5174e012757e71a0` · token account-scoped (falha em `/user/tokens/verify` mas funciona em purge) |
| WhatsApp/tel oficial | **556230890978** (confirmado pelo operador como o número do joelho — NÃO é o mesmo caso do ombro, que aposentou esse número) |

### Purga de cache
```bash
ssh hostinger-vps-srv1166087 "cd /home/boot/web/blog.cirurgiadojoelhogoiania.com/public_html && wp redis flush --allow-root && wp cache flush --allow-root"
TOKEN=$(python3 -c "import json;d=json.load(open(r'D:/SISTEMAS/Cloudflare/contas.json',encoding='utf-8'));print(next(x['token'] for x in d if x.get('nome')=='conta25'))")
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/a543b64e2c25df9d5174e012757e71a0/purge_cache" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data '{"purge_everything":true}'
```

---

## 2. Estratégia — qualificação de lead cirúrgico (2026-07-02)

**Problema:** o Dr. Ulbiramar é cirurgião de joelho. O blog tem muito conteúdo de dor/informativo (autoridade/SEO) que atraía contatos de casos **não-cirúrgicos**.

**Solução (idêntica ao blog do ombro):**
1. Removida toda a publicidade automática do tema.
2. Tag `cirurgia-de-joelho` só nos posts que podem **converter** em cirurgia.
3. CTA de contato aparece **só nos posts marcados**, com copy que **qualifica** o lead.
4. Posts não-cirúrgicos ficam **sem contato** (o "cerco").

---

## 3. Publicidade automática REMOVIDA (reversível)

Banner (estilo azul `--joelho-blue: #024E70`) que linkava p/ cirurgiadojoelhogoiania.com, em 2 fontes:

**A) 4 slots de Ad do Jannah** (`tie_jannah_options`, toggles → `false`, códigos preservados):
`banner_top_tab`, `banner_above_content`, `banner_category_below_posts`, `article_inline_ad_1`.

**B) 3 widgets "Stream Item"** → `wp_inactive_widgets` (sidebar `primary-widget-area` + 2 seções da home `tiepost-1230-section-*`).

- **Backup:** `srv1166087:/home/boot/tie_jannah_options.backup-20260702.json`
- **Banner HTML original:** `D:\SISTEMAS\MinhasHospedagens\blog-cirurgiadojoelho\banner-cta-original.html`

---

## 4. Tag de cirurgia

| Tag | ID | slug | Posts |
|-----|----|----|------|
| Cirurgia de Joelho | 46 | `cirurgia-de-joelho` | 131 |

**Critério:** cirúrgico ou que leva/converte em cirurgia — categoria Cirurgia do Joelho + Prótese de Joelho; ruptura de LCA/LCP; lesão/ruptura de menisco; luxação/instabilidade patelar; fraturas/joelho quebrado; osteotomia; condropatia grau 3-4 que opera; tumores (osteossarcoma, células gigantes, osteoma), PVNS/condromatose sinovial; hemartrose; osteocondrite dissecante; osteonecrose (Ahlback), cisto/menisco discoide, lesão condral profunda; e "tempo de recuperação/afastamento DA cirurgia" (fator de decisão pré-op — NÃO os milestones "X dias após").

**Excluídos** (não convertem): dor genérica, anatomia/saúde geral, exercícios/fisioterapia, **pós-operatório** (já operou), infiltração/PRP/células-tronco/regenerativa, artrose e condropatia grau 1-2 de manejo conservador, sintomas informativos, bursite/tendinite/cisto de Baker conservadores.

> Link: https://blog.cirurgiadojoelhogoiania.com/tag/cirurgia-de-joelho/

Categorias (topicais, não por intenção): Lesões e Doenças do Joelho (176), Cirurgia do Joelho (48), Tratamentos e Procedimentos (44), Dor no Joelho (42), Recuperação e Pós-Operatório (35), Sintomas e Sinais (27), Exercícios e Fisioterapia (23), Prótese de Joelho (22), Anatomia e Saúde Geral (17).

---

## 5. CTA seletivo — mu-plugin `mc-cta-cirurgia.php`

Injeta o CTA via `the_content`, **APENAS** em `is_singular('post')` com a tag `cirurgia-de-joelho` (`has_term`).

- **2 posições:** após o 3º parágrafo + no fim do artigo.
- **Copy que qualifica** (o "cerco"): *"Seu caso de joelho pode ter indicação de cirurgia? … Se você já tem indicação de cirurgia, laudo de ressonância/raio-x ou não melhorou com o tratamento conservador…"* + nota *"Atendimento voltado a casos cirúrgicos do joelho. Dores sem indicação geralmente começam pela fisioterapia."*
- **WhatsApp** `556230890978`, mensagem pré-preenchida **com o título do artigo** (rastreia origem do lead).
- **Visual:** card azul do joelho (#024E70) + **botão verde WhatsApp (#25D366) com texto verde-escuro** + badge/borda verdes.
- Para adicionar tag ao gatilho: incluir em `MC_CTA_TAGS`.

---

## 6. Avisos / o que NÃO fazer

- ❌ Não rodar WP-CLI sem `--allow-root`.
- ❌ Não usar scp (falha) — usar base64 sobre SSH.
- ❌ Não reativar os Ads do Jannah / widgets Stream Item (publicidade agora é só via `mc-cta-cirurgia.php`).
- ❌ WhatsApp do joelho é `556230890978` (confirmado) — não confundir com a troca feita no ombro.
- ✅ Reverter Ad/widget = restaurar toggles em `tie_jannah_options` (backup) ou mover widget de volta de `wp_inactive_widgets`. Reverter tag = `wp_remove_object_terms`.

---

*Referência na memória do Claude:* `reference_blog_cirurgiadojoelho_location_cf`.
