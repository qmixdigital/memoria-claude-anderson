---
name: reference_adsense_loader_rede_qmix
description: 55 sites da rede estavam sem nenhum código do AdSense; loader instalado via mu-plugin qmix-adsense.php - e por que ter o loader ainda não faz anúncio aparecer
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T22:46:34.649Z
---

**REVERTIDO EM 09/08/2026** — a instalação em massa descrita aqui foi desfeita a pedido do operador; só os 25 domínios de [[feedback_adsense_somente_lista_autorizada]] devem ter AdSense. O valor deste arquivo é o diagnóstico dos defeitos, não a ação.

Varredura de 09/08/2026 nos 91 sites da rede: **só 14 serviam o script do AdSense**. O resto se dividia em dois defeitos:

1. **Sem código nenhum** (55 sites, incluindo euvo e advivo) — nem script nem meta. Corrigido em massa com o mu-plugin `qmix-adsense.php` (fonte em `D:\SISTEMAS\MinhasHospedagens\scripts\`): normaliza o ID para `ca-pub-`, injeta script + meta `google-adsense-account`, fica fora de admin/login/feed/preview e usa `pauseAdRequests` em 404. Kill switch = apagar o arquivo.
2. **Placeholder nunca substituído** — `data-ad-client="ca-pub-PORTAL_PUB_ID"` no `<ins>` do tema, sem loader nenhum: adonline, df8, exquisito. Corrigido com `sed` + loader no `functions.php` do tema (padrão que o revistarumo já usava desde 23/06, com backup `.bak-adsense-<data>`).

**Ter o loader NÃO faz anúncio aparecer.** Duas travas continuam, e as duas são no painel do AdSense, não no código:
- o site precisa estar adicionado e aprovado na conta;
- **Auto Ads precisa estar ligado**. Isso importa porque adonline, revistarumo, folhadonoroeste e exquisito têm `<ins>` com `data-ad-slot` de placeholder (`RR_SLOT_HOME_TOP`, `ADON_SLOT_HOME_TOP`…). Slot falso **nunca preenche**: aquelas posições ficam vazias para sempre e a receita só vem do Auto Ads. Para preencher aquelas posições específicas é preciso criar as unidades no AdSense e trocar os slots.

Quatro sites (azulmagazine, cameracotidiana, jornaldobairroalto, opopularjornal) **bloqueiam AdSense na home de propósito** (`if (is_front_page()||is_home()) return;` no tema, colocação manual in-article). Varredura que olha só a home marca esses quatro como falso positivo — conferir uma página de artigo antes de "corrigir".

Armadilhas da varredura, ambas custaram falso negativo aqui: vários domínios canonizam em **www** (curl sem `-L` pega o 301 e conclui que não tem código), e a lista `scripts/qmix-video-backlinks-sites.txt` traz **nomes de pasta sem TLD** para a hostverge (exquisito, viajenodetalhe, saudevitalidade…). Ver [[reference_qmix_adsense_portal_pub_id]] e [[reference_adstxt_cache_semana_htaccess]].
