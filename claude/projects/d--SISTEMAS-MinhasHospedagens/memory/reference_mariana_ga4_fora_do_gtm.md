---
name: reference_mariana_ga4_fora_do_gtm
description: "GA4 do marianacabraldermato.com.br é carregado pelo mu-plugin mc-tracking.php (gtag lazy), não pelo container do GTM - remover do site se a tag GA4 voltar a ser publicada no GTM, senão conta dobrado"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-12T12:49:00.055Z
---

Em 06/08/2026 o site estava sem medição de audiência.

**CAUSA REAL (confirmada em 12/08/2026, corrigindo o diagnóstico original):** até
01/07 o GA4 era disparado por um snippet `gtag.js` gravado no **`codes_header`
das opções do tema SmartMag** — ele está íntegro no backup
`/home/u761201864/backups-mariana/pre-audit-mariana.sql`, junto da config do Site
Kit (`propertyID=497957627`, `googleTagID=GT-WRC3XN7B`). Esse snippet **se perdeu
no redesign de 01/07** (remoção do Site Kit + incidente que sobrescreveu
`smartmag_theme_options`), e o `mc-tracking.php` v1.1 nasceu supondo que o
container do GTM disparava o GA4. **O container nunca disparou** — só tinha a
conversão do Google Ads. Ou seja: não foi terceiro mexendo no GTM, foi a nossa
própria edição, e a suposição sobre o container escondeu a falha por cinco
semanas. Custo medido: julho fechou com **45 sessões** contra 1.057 em junho
(-96%).

**Lição:** ao migrar front-end para mu-plugin, o `codes_header` do tema guarda
código de medição que não aparece em nenhum arquivo do projeto — some sem rastro
no diff. Rodar `wp option get smartmag_theme_options` e salvar o que houver de
`gtag`/`G-`/`AW-` antes de mexer.

**Como diagnosticar isso rápido:** baixar o container e procurar ID de medição.
`curl -s "https://www.googletagmanager.com/gtm.js?id=GTM-K957KCH8" | grep -oE 'G-[A-Z0-9]{6,12}|AW-[0-9]+'`
Só voltava `AW-11559895530` (Google Ads). Nenhum `G-*`. Do lado do HTML nada denunciava a falta, porque o GTM carregava normalmente.

**Correção (v1.2 do `mc-tracking.php`):** GA4 `G-MLFHFRC852` carregado direto por `gtag.js`, no mesmo listener de primeira interação que já servia o GTM (scroll/click/touchstart/keydown/mousemove). Backup em `mc-tracking.php.bak-20260806`. Resultado medido: TBT 0 ms, campo CrUX com LCP 1,60s / CLS 0 / INP 0,13s, e nenhum `<script src>` de terceiro no caminho crítico.

**ARMADILHA:** se a tag GA4 voltar a ser publicada dentro do GTM, **remover o bloco gtag do mu-plugin**, senão a mesma pageview é contada duas vezes. O aviso está no cabeçalho do arquivo.

Efeito colateral aceito da carga sob demanda: visitante que sai sem nenhuma interação não é contabilizado (no desktop o `mousemove` cobre quase todos; no mobile, quem não rola a tela escapa).

Site fica na hostinger-mariana, `/home/u761201864/domains/marianacabraldermato.com.br/public_html`. Ver também [[reference_mariana_cache_apo_lsws]] (cache teimoso: purgar LSWS e Cloudflare) e [[reference_mariana_elementor_free]].

**Acessos (12/08/2026):** a service account `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` (chave no Desktop, `enjai-493011-5bc78ff8f355.json`) lê o **GSC** (`sc-domain:marianacabraldermato.com.br`, siteOwner) e o **GA4** (propriedade **497957627** — Data API ligada, Admin API não). Scripts prontos em `D:/SITES/marianacabraldermato.com.br/infra/` (`gsc-relatorio.py`, `ga4-relatorio.py`).

**Subcontagem que continua:** 219 sessões no GA4 contra 1.136 cliques no GSC em 28 dias, porque o loader só dispara em `scroll/click/touchstart/keydown/mousemove` com `{once:true}` e **não tem fallback por tempo**. Quem lê e sai sem interagir não vira pageview (199 `first_visit` para 219 `session_start`). Correção pendente: `requestIdleCallback` + `setTimeout(load, 3000)`.
