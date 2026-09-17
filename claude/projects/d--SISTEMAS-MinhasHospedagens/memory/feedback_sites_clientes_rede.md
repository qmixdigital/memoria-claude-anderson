---
name: Sites de clientes na rede principal QMIX
description: 26 sites de clientes (médicos/clínicas/turismo/regionais) + setorenergetico.com.br + 2 ex-WP convertidos em Next.js (arcondicionadotop, geladeirastop) não fazem parte da "rede de publicações QMIX" - excluir de planilhas, importações e operações em lote
type: feedback
originSessionId: 48ca1215-d0be-42bb-aad3-ac6d3700755f
---
Os seguintes 34 domínios **NÃO devem** ser incluídos em planilhas/operações da "rede de publicações QMIX" (importação plataforma QMIX, planilhas de categorias para importação, etc.):

**Histórico de mudanças:**
- 2026-05-27: 5 sites REMOVIDOS da exclusão (foram para rede): cirurgiacoracao.com.br, cirurgiadacatarata.com.br, cirurgiadecancer.com.br, institutoortopedico.com.br, medicodasmaos.com.br
- 2026-06-24: revistamsaude.com.br ADICIONADO à exclusão (cliente, confirmado pelo operador). Os demais saúde do hostverge (medicinageriatrica, ortopediacoluna, ortopedistadeombro, planomedicosaude, revistatopsaude, saudeacessivel, saudeemalta, saudevitalidade, saudicas, matogrossosaude, noticiasdiarios) = REDE, NÃO clientes. Allowlist de remoção canônica em D:\SISTEMAS\MinhasHospedagens\rede-publicacao-allowlist.txt


**Clientes (sites de médicos/clínicas/advogados gerenciados para terceiros):**
- blog.advdobrasil.com.br
- blog.aplusplatform.com
- blog.camilafarias.com.br
- blog.cirurgiadojoelhogoiania.com
- blog.clinicasrecuperacaosaopaulo.com
- blog.coegoiania.com.br
- blog.drbrunoair.com.br
- blog.drhenriquebufaical.com.br
- blog.drthiagotredicci.com.br
- blog.drtiagobernardes.com.br
- blog.nutricionista.digital
- blog.ombrogoiania.com.br
- arlaproducao.com
- blog.qmix.com.br
- belemduartealmeida.com.br
- carretaspresidente.com.br
- comprarsites (hostverge folder)
- comprarvisualizacoes.com
- creatinadicas.com
- cirurgiadecolunagoiania.com.br
- cirurgiadojoelhogoiania.com
- clinicasrecuperacaosaopaulo.com
- drbrunoair.com.br
- energiaeficiente.com.br
- drtiagobernardes.com.br
- itacaiugo.com.br
- notebookx.com.br
- pael.com.br
- pneusemgoiania.com.br
- qmiximoveis.com.br
- tratamentodor.com.br

**Removido da rede (não é cliente, saiu do escopo):**
- setorenergetico.com.br

**Convertidos para Next.js (instalação WP no Hostinger anderson está órfã — DNS aponta para Next.js na Cloudflare):**
- arcondicionadotop.com (removido em 2026-05-27)
- geladeirastop.com (removido em 2026-05-27)

**Domínios preview/teste do Hostinger - desconsiderar:**
- darkcyan-narwhal-224012.hostingersite.com (qmix, removido da lista em 2026-05-27 — domínio de staging)
- steelblue-turkey-830737.hostingersite.com (qmix, removido da lista em 2026-05-27 — domínio de staging)

**Why:** Os 23 sites são gerenciados PARA clientes (médicos, clínicas, advogados) — incluí-los em importações/automações da plataforma QMIX desvirtuaria os dados, pois esses sites têm propósito comercial diferente (presença online dos clientes, não monetização própria). O setorenergetico saiu da rede em 2026-04-28 e não recebe mais publicações. arcondicionadotop e geladeirastop foram migrados para Next.js (DNS aponta para Cloudflare Pages com `x-powered-by: Next.js`) — o WordPress no anderson está órfão e não deve mais receber publicações nem ser tratado como site da rede.

**How to apply:**
- Ao gerar planilhas para "Importação Plataforma QMIX", planilhas de categorias da rede, listas de autores da rede, ou qualquer operação em lote rotulada como "rede de publicações" — excluir esses 26 domínios automaticamente.
- Para arcondicionadotop/geladeirastop especificamente: o WP install no Hostinger anderson ainda existe mas é descartável (não receber mais conteúdo, não otimizar, não importar). Em ações de saúde/update do servidor anderson, OK incluir só pra manter o WP atualizado, mas não direcionar tráfego nem conteúdo novo.
- Ainda fazer: backup, manutenção, atualização de plugins, monitoramento — operações de saúde do servidor continuam aplicando.
- Lista canônica salva em `D:\SISTEMAS\MinhasHospedagens\categorias-rede-publicacoes.csv` (gerada em 2026-04-28 com 125 sites; atualizada em 2026-05-27 removendo arcondicionadotop+geladeirastop → 123 sites). Backup em `.bak-20260527`.
