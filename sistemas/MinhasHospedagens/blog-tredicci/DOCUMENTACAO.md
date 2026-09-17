# blog.drthiagotredicci.com.br — Dr. Thiago Tredicci

**Médico:** Dr. Thiago Tredicci — cirurgião do aparelho digestivo (gastrocirurgião) em Goiânia. **CRM-GO 12828.**
**Localização técnica:** opengravity, user `qmix`, `/home/qmix/web/blog.drthiagotredicci.com.br/public_html`. Tema **Jannah (TieLabs)**. GA4 `G-22P08JP0F7`. Cloudflare conta16, zona `0bb4d69d99b4eb3bb98dd6cde6247cf4`.
**WhatsApp/CTA:** `5562999209156`.

Mesmo tratamento em 3 fases aplicado nos blogs de joelho (Dr. Ulbiramar) e ombro (Dr. Thiago Caixeta).

## Fase 1 — Remoção de publicidade genérica do tema

Desativados 5 slots de anúncio do Jannah em `tie_jannah_options`: `banner_top_tab`, `banner_above_content`, `banner_category_below_posts`, `article_inline_ad_1`, `article_inline_ad_2`. Movidos os widgets **stream-item-widget-3/-4/-5** para inativos. Verificado: banner = 0 na home e em post. **Reversível** (basta reativar as options/widgets).

## Fase 2 — Tag de conversão cirúrgica

Criada tag `cirurgia-digestiva` (**post_tag id 46**), aplicada a **91 posts** — só o conteúdo que realmente pode virar cirurgia do aparelho digestivo (vesícula/colecistectomia, hérnias de parede, refluxo/hérnia de hiato, tumores/oncologia digestiva, obesidade/bariátrica, indicação cirúrgica, pós/pré-operatório de decisão). Ficam de fora perguntas puramente clínicas/sintomáticas que começam com tratamento clínico.
URL: https://blog.drthiagotredicci.com.br/tag/cirurgia-digestiva/

## Fase 3 — CTA seletivo por tag

mu-plugin **`mc-cta-cirurgia.php`** (`wp-content/mu-plugins/`). Insere o CTA **somente** em posts com a tag `cirurgia-digestiva` (via filtro `the_content`, após o 3º `</p>` + no fim). Posts não-cirúrgicos ficam sem contato.

- Card azul da marca (`linear-gradient(135deg,#0f506d,#0a3a50)`), botão **verde WhatsApp #25D366**.
- Título: "Seu caso pode ter indicação de cirurgia digestiva?"
- WhatsApp com contexto: menciona o título do artigo + `5562999209156`.
- **Rastreamento de leads:** clique dispara `navigator.sendBeacon` → `POST /wp-json/mccta/v1/click` (contador server-side).
  - **09/09/2026:** os disparos de GA4 saíram daqui. O bloco mandava `generate_lead` **e** `cta_cirurgia_wa` no mesmo clique, dobrando a contagem, e ainda empurrava `cta_cirurgia_wa` para o `dataLayer`. Backup em `mc-cta-cirurgia.php.bak-20260909`. Quem mede contato agora é o mu-plugin **`rastreio-qmix.php`**, que carrega `/js/rastreio.js` e dispara um único `generate_lead` com os parâmetros `metodo`, `local`, `texto_botao` e `pagina`. O botão do CTA ganhou `data-rastreio-local="cta_cirurgia"` para o parâmetro `local` chegar identificado. O `sendBeacon` ficou: é independente do GA4 e alimenta o relatório.
  - Meta por post: `_mccta_wa_clicks` (total) e `_mccta_wa_monthly` (buckets `Y-m`).
  - Relatório: `GET /wp-json/mccta/v1/report?key=r7Kp9mQ2xL` → ranking JSON dos artigos por cliques.

## Comandos úteis

```bash
# ranking de leads
curl -s "https://blog.drthiagotredicci.com.br/wp-json/mccta/v1/report?key=r7Kp9mQ2xL"

# reaplicar/ajustar a tag: editar lista e rodar wp post term add
# purge pós-alteração
ssh opengravity "cd /home/qmix/web/blog.drthiagotredicci.com.br/public_html && wp redis flush --allow-root && wp cache flush --allow-root"
# + purge Cloudflare conta16 zona 0bb4d69d99b4eb3bb98dd6cde6247cf4
```


## Medição de contatos (09/09/2026)

Auditoria da propriedade GA4 **370584361** mostrou três nomes de evento para a
mesma ação: `whatsapp_click` (65, só no site estático), `cta_cirurgia_wa` (36,
só no blog) e `generate_lead` (36, só no blog, disparado junto do anterior).

O que foi feito:

| Onde | Mudança |
|---|---|
| Site estático (repo `drthiagotredicci.com.br`) | `/js/rastreio.js` nas 16 páginas; disparo de `whatsapp_click` removido do `main.js` |
| Blog, `mc-cta-cirurgia.php` | disparos de `generate_lead` e `cta_cirurgia_wa` removidos; `sendBeacon` mantido |
| Blog, `rastreio-qmix.php` (novo mu-plugin) | carrega `/js/rastreio.js` com `data-cfasync="false"` |
| GA4 | medição aprimorada ligada com **cliques de saída**; `generate_lead` marcado como evento-chave (`ONCE_PER_SESSION`); dimensões `metodo`, `local`, `texto_botao` criadas |

Agora `generate_lead` é o único evento de contato e vem exclusivamente do
`rastreio.js`, nos dois hosts.
