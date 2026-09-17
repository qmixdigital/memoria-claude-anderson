---
name: reference_dominios_saude_viraram_diretorio_next
description: Domínios de cirurgia/saúde da rede estão sendo convertidos de WordPress para diretório Next; o WP antigo continua no servidor sem servir o domínio
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T15:19:15.367Z
---

Verificado em 09/08/2026: `cirurgiacoracao.com.br`, `cirurgiadacatarata.com.br` e `cirurgiadecancer.com.br` já respondem como **diretório Next** (`_next/static` no HTML, títulos do tipo "Onde tratar o coração: 13.108 hospitais e clínicas"). É a mesma engine de diretório de [[reference_next_engine_adsense_adstxt]] e [[reference_clinicas_vps_desentupidora]].

Armadilha: a instalação **WordPress antiga continua no disco** (hostverge tem WP para cirurgiadacatarata e cirurgiadecancer) e continua respondendo a `wp-cli`, mesmo sem servir o domínio. Um loop de rede que itera pastas de WP vai "encontrar" e "atualizar" esses sites sem que nada disso apareça no ar.

Regra do operador: **antes de mexer em domínio de saúde, conferir o que está no ar** (`curl` + procurar `_next/static`), e lembrar que site de saúde da rede **não tem conteúdo de backlink** — qualquer script de backlink/SEO ali deve dar zero match. Se der match, é conteúdo fora do lugar, não sucesso.
