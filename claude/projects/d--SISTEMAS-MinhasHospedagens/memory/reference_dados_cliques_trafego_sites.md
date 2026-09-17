---
name: reference_dados_cliques_trafego_sites
description: Onde achar dados de cliques/tráfego por artigo nos sites da rede (Rank Math + meta v4940_post_views)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 611c5219-ea2f-4933-b1d7-762f552ee8c8
---

Para identificar os artigos de maior tráfego/cliques nos sites WP da rede (ex: revistarumo.com.br no servidor anderson), as fontes no banco são:

- **Rank Math analytics**: tabela `wp_rank_math_analytics_ga` (pageviews/visitors por página/dia) cruzada com `wp_rank_math_analytics_objects` (page→object_id/título). A tabela `wp_rank_math_analytics_gsc` (Search Console: clicks/impressions/position) costuma estar VAZIA se o GSC não foi conectado — checar antes. `wp_rank_math_internal_meta` (object_id → internal_link_count/incoming_link_count) mostra quantos links internos cada post tem (saída/entrada) — ótimo pra achar órfãos e páginas sem links de saída.
- **Meta `v4940_post_views`** (FONTE OFICIAL do dono): contador custom no mu-plugin `wp-content/mu-plugins/stats-4940ef.php` ("Stats 4940eff4" v3.0). Conta pageview real de visitante via **JS → endpoint REST `/wp-json/stats-4940ef/v1/view`** (1,2s após load, fura cache LiteSpeed/Cloudflare), com fallback AJAX e fallback PHP (só em cache miss). Anti-bot (UA list) + anti-flood (transient IP+post 30min). Incremento SQL atômico. Coluna admin "Views" ordenável = `orderby=v4940_views`. É views-on-site acumulado, NÃO cliques do Google. Em 2026-06-05 foi ZERADO no revistarumo (baseline limpo pós-cross-link; backup em D:\SISTEMAS\MinhasHospedagens\stats-backups\revistarumo_v4940_20260605.tsv e no servidor ~/v4940_backup_20260605.tsv). Provável que o mesmo mu-plugin esteja em outros sites da rede.
- **Independent Analytics (`iawp_*`)**: REMOVIDO por completo do revistarumo em 2026-06-05 (a pedido do dono, deixar só o v4940). Plugin já estava desinstalado; limpei rastros órfãos: 1362 postmeta `iawp_total_views`, 31 options `iawp_*`, cron `fs_data_sync_independent-analytics`, e as 5 options Freemius (`fs_accounts/fs_active_plugins/fs_api_cache/fs_debug_mode/fs_gdpr` — IA era o ÚNICO plugin Freemius do site). Backup em ~/iawp_backup_20260605.tsv e ~/freemius_iawp_backup_20260605.json.
- IGNORAR `pdy_post_views` (fica zerado, não coleta).

Permalink da rede: `/%category%/%postname%/`. Ao cross-linkar, usar a URL canônica final (alguns posts foram despublicados pelo pruning e redirecionam 301 pra home — link com âncora descritiva caindo na home é link morto, evitar). Ver [[reference_content_pruning]] e [[reference_link_removal_system]].

Cross-link aplicado em 2026-06-05 (revistarumo): **Rodada 1** — top 40 artigos ganharam 2-4 links internos de saída inline cada (antes ~0). **Rodada 2** — 25 alvos top (que tinham incoming≤1) receberam ~53 links de ENTRADA de artigos relacionados; todos agora com incoming 2-3. Execução via 5 subagentes paralelos particionados por **categoria de origem disjunta** (Mkt/Neg/Tec | Entretenimento | Notícias | Dicas/Saúde | Casa/Insights/Turismo/Moda) pra nunca escreverem no mesmo post. LIÇÃO CRÍTICA: `wp post update <id> -` com STDIN VAZIO ZERA o conteúdo do post (aconteceu no 2244, restaurado do backup). Sempre usar guarda: só pushar se o arquivo novo tiver tamanho >= original E contiver a URL alvo. NOTA de ambiente: `python3` nas chamadas Bash roda em sandbox SEM acesso ao /tmp local — usar perl/sed/awk pra editar arquivos em /tmp, nunca python. Pendente opcional: escalar cross-link de saída pros próximos 40 (41-80) e limpar links pré-existentes que dão 301→home (resíduo do pruning).
