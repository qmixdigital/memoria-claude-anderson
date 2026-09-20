---
name: modo-magro-sem-build
description: Desde 19/09/2026 o geladeirastop roda em modo magro no srv1166087; não rodar build lá e não religar automação sem o dono pedir
metadata:
  type: project
---

Decisão do dono em 19/09/2026: o site quase não tem tráfego (12 a 15 cliques por
semana, posição média 42) e estava pesando na hospedagem. Ordem: "deixe o mais
magro possível, desative tudo o que quiser", manter no ar para tentar recuperar
tráfego depois.

**Why:** um `next build` no srv1166087 usa ~15 GB de RAM por 20 a 30 min numa
VPS de 32 GB com 18 apps; três builds em 19/09 levaram a carga a 25. E a
Cloudflare não cacheava HTML, então o crawl das 56 mil páginas batia na origem.

**How to apply:**
- Não rodar build/deploy nessa VPS sem o dono pedir. Mudança de código fica no
  fonte esperando; hoje há alterações prontas e não deployadas (fontes locais,
  tracking adiado, fix de COOKIE_NAME).
- Mudança de conteúdo é por banco + `revalidar_hoje.cjs` (Node 20) + purge CF.
- Cloudflare cacheia HTML público por 1 dia (Cache Rules): depois de mexer em
  conteúdo, purgar.
- Robô de notícias, RFB, newsletter: desligados. Não religar por conta própria.
- Diretório podado por status (ver ACESSO.md); 87 destinos de backlink comprados
  são intocáveis. Ver [[gsc-service-account]] e [[planilha-backlinks-sheets]].
