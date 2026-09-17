---
name: project_teste_video_backlinks_serp
description: "Teste em andamento (01/08/2026) - vídeo YouTube hE0EdPWue2U embutido via mu-plugin em ~260 artigos de SEO/backlinks de 91 sites da rede, para tentar aparecer no bloco de vídeo da SERP"
metadata: 
  node_type: memory
  type: project
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T15:19:02.344Z
---

Teste de SERP iniciado em 01/08/2026: vídeos do canal QMIX Digital são injetados em artigos de backlinks/SEO junto com JSON-LD `VideoObject`.

Desde 09/08/2026 (v4.0) entrou um **quarto vídeo**, `RQevDiUOJz0` "O que são backlinks e para que servem, do jeito mais simples" → artigo **didático** (título casa backlink/link building/autoridade de domínio **e** um marcador explicativo: "o que é", "para que serve", "guia para iniciantes"…) — 40 posts em 32 sites. Ele é avaliado **antes** do bucket genérico, então essas 40 páginas trocaram o vídeo de "comprar backlinks" pelo explicativo.

Só esse vídeo usa posicionamento por seção (`qmix_vb_pos_secao()`): entra logo após o 1º parágrafo do bloco cujo subtítulo fala de links (backlink / link building / links externos), com fallback para o subtítulo de "autoridade de domínio" e, por último, o slot padrão. Nos 40 posts a seção foi encontrada em 100% dos casos. Os outros três vídeos mantêm a posição antiga de propósito, para não mexer no que o Google já rastreou. O `duration` do VideoObject virou opcional — o YouTube não devolveu a duração desse vídeo e chutar valor é pior que omitir.

Desde 04/08/2026 (v3.0) são **três vídeos, UM por página** — a ordem de avaliação garante que nenhuma página troque de vídeo ao entrar um novo:
1. `S-NDuJXnCuQ` "Comprar Backlinks Vale a Pena em 2026?" → artigo **de backlinks** (título casa `backlink|link building|autoridade de domínio`, ou corpo cita "backlink" ≥5×; filtro `qmix_vb_min_mencoes`) — 245 posts.
2. `hE0EdPWue2U` "7 Erros ao Comprar Backlinks" → artigo **de SEO em geral** — 118 posts.
3. `KeAFoto-QW0` "Onde Comprar Backlinks: 6 Sinais de Agência Confiável" → cita backlink 3-4× e **não tinha vídeo nenhum** (filtro `qmix_vb_min_mencoes_onde`) — 203 posts.

Guarda adicional da v3.0: post cujo `post_content` já traz iframe de YouTube/Vimeo **não recebe nada** (evita dois vídeos na mesma página) — tirou o vídeo de ~25 posts que tinham embed próprio.

- Implementação: mu-plugin `qmix-video-backlinks.php` (fonte versionada em `D:\SISTEMAS\MinhasHospedagens\scripts\`), instalado em **90** sites — 36 hostinger-anderson-gna, 5 hostinger-qmix, 27 hostinger-vps1, 22 hostverge. A lista `scripts/qmix-video-backlinks-sites.txt` tem 91 nomes: `cirurgiacoracao.com.br` está nela mas nunca recebeu o plugin. Sites de cliente ficaram de fora (ver [[feedback_sites_clientes_rede]]).
- Forma segura de redeployar: sobrescrever **só onde o arquivo já existe** (`for f in .../mu-plugins/qmix-video-backlinks.php`) — o alvo se autodefine e não há risco de instalar em site errado.
- Os ~12 sites de **saúde** da rede (saudicas, saudeemalta, planomedicosaude, ortopediacoluna, institutoortopedico, medicinageriatrica, revistatopsaude, saudeacessivel, matogrossosaude…) têm o plugin mas **zero match** — site de saúde não recebe conteúdo de backlink. Única exceção: `saudevitalidade.com.br/seo-para-medicos/` (artigo real de SEO para médicos, cai no bucket 'seo').
- **Não grava nada no banco** — injeção por filtro `the_content` + `wp_head`. Kill switch = apagar o arquivo de `wp-content/mu-plugins/` e purgar cache.
- Marcação varia por domínio via `md5(host)` (classe CSS, `figure`/`div`, posição: após 1º H2 / 1º / 2º parágrafo) — mesma lógica anti-footprint do [[reference_mapa_do_site_link_interno]].
- Armadilha resolvida: o LiteSpeed troca o `src` do iframe por `about:blank` (lazy-load) e o Googlebot não vê o embed no HTML de origem — o iframe leva `data-no-lazy="1" data-skip-lazy="1"`.
- Grupo de controle natural: ~811 artigos que só citam backlink no corpo (sem casar no título) ficaram **sem** o vídeo.
- Falsos positivos corrigidos na v1.1 (216 posts, era 246): `\bseo\b` casava com sobrenome coreano ("Lee Seo Yi", "Kang Seo-ha") → sigla solta só vale em CAIXA ALTA ou com termo de contexto; e 27 posts cujo título é vazamento de prompt de IA ("Hmm, o usuário pede um título jornalístico…") ficaram fora — esses títulos quebrados existem em ~20 sites da rede e são um problema à parte, ainda não tratado.

**Why:** o operador quer medir se a página com vídeo + VideoObject sobe no bloco de vídeo do Google para "comprar backlinks".

**How to apply:** ao avaliar o resultado, comparar posts com título temático (com vídeo) contra os que só citam no corpo (sem vídeo). Para mudar o vídeo ou o critério de match, editar as constantes `QMIX_VB_*` / `qmix_vb_is_target()` e redeployar a partir de `scripts/qmix-video-backlinks.php`.
