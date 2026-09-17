---
name: content-pruning-rule-rede-qmix-fora-da-skill
description: "Regra de despublicação/remoção de posts low-value na rede de 129 portais. Critério 120d+<5views+0outbound. Lifecycle Draft->Trash30d->Delete. NÃO está na skill wp-news-portal-fullsetup, vive em D:\\SISTEMAS\\MinhasHospedagens\\PRUNING.md + scripts."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
---

Regra de content pruning criada por solicitação em 2026-05-27. Mantida FORA da skill `wp-news-portal-fullsetup` (decisão do operador) — vive como rotina de manutenção em `D:\SISTEMAS\MinhasHospedagens\`.

**Critério (TODOS verdadeiros):**
- `post_status = publish` AND `post_type = post`
- `post_date < NOW() - 120 dias`
- views < 5 (Antonio stats: `wp_postmeta.meta_key REGEXP '^v[0-9a-f]{4}_post_views$'`)
- 0 outbound links em `post_content` (regex `<a href` apontando para domínio != self)

**Salvaguardas (qualquer uma => SKIP):**
- comentários aprovados >= 1
- ID em `wp_options` (page_on_front, page_for_posts, sticky_posts)
- tem `_wp_old_slug` ativo
- `_antonio_imported_at` < 120 dias
- `qmix_keep = 1` (whitelist manual)
- domínio em [[sites-clientes-na-rede-principal-qmix]] (26 excluídos)

**Lifecycle (60 dias total de janela recuperável):**
1. `publish` → `draft` (grava 5 meta-keys de backup + reason)
2. Após 30d como draft → `trash` (sem mexer em `post_modified`)
3. Após +30d em trash → `wp_delete_post(true)` (sem volta)

**Pacing:** 5 posts/site/dia max, jitter 4-12h entre portais. Rodada completa da rede leva ~30 dias.

**Arquivos:**
- `D:\SISTEMAS\MinhasHospedagens\PRUNING.md` — doc completa
- `D:\SISTEMAS\MinhasHospedagens\scripts\prune_low_value_posts.py` — orquestrador (modos: audit, execute, rollback, status)
- `D:\SISTEMAS\MinhasHospedagens\scripts\prune_audit.php` — audit per-portal via `wp eval-file`
- `D:\SISTEMAS\MinhasHospedagens\scripts\prune_execute.php` — executor das 3 fases
- `D:\SISTEMAS\MinhasHospedagens\pruning-logs\` — logs por rodada
- `D:\SISTEMAS\MinhasHospedagens\pruning-audits\` — CSVs revisáveis

**Fluxo de uso:**
```bash
# 1. Audit (sem mutação)
python prune_low_value_posts.py --mode=audit --output=audit-2026-05-27.csv

# 2. Operador revisa CSV, marca exceções na coluna 'override' (vazio | keep | force)

# 3. Execute (com pacing)
python prune_low_value_posts.py --mode=execute --input=audit-2026-05-27.csv --pace=5

# Status
python prune_low_value_posts.py --mode=status

# Rollback (dentro da janela de 60d, antes de force-delete)
python prune_low_value_posts.py --mode=rollback --pruning-run=2026-05-27
```

**Decisões de design (originSession 19f07376):**
- Fonte de cliques: só Antonio stats (sem GSC, sem GA4). Trade-off: pode incluir bots não filtrados, mas é o que está disponível instantâneo.
- Links: outbound em `post_content` (não inbound/backlinks). Justificativa: post sem outbound é deadweight de PBN.
- Lifecycle escolhido: Draft → Trash 30d → Delete (recuperável 60d).
- Exclusões: 26 domínios (23 clientes + setorenergetico + arcondicionadotop + geladeirastop).

**Threshold ajustável via CLI:** `--min-age=180 --max-views=2` pra conservador, `--min-age=90 --max-views=10` pra agressivo.

**Use isso quando:** o operador pedir pra limpar conteúdo low-value, executar pruning, expandir critérios, rodar audit de manutenção, ou descobrir um post que precisa ser pruned manualmente (caso isolado: usar `wp post update ID --post_status=draft` direto, não passar pelo orquestrador).

**Portal-engine agora TEM rastreamento de tráfego (desde 2026-07-10)** — antes NÃO tinha views (JSON sem campo de tráfego, sem GA), então pruning por tráfego era impossível. Solução implementada: micro-serviço isolado **`views-counter.js`** (systemd `portal-views.service`, porta **127.0.0.1:8795**, user `portais`, nos DOIS servidores opengravity+srv1166087) + **beacon** `/_b.js` injetado via **nginx `sub_filter`** (sem rebuild) que dá `sendBeacon('/_h?s=slug')` só em navegador real (filtra bots por `navigator.webdriver` + só URL de 1 segmento). Contagem por portal em **`/srv/portais/<slug>/views.json`** = `{artSlug:{total, "YYYY-MM":n, last:ts}}`. 16 portais instrumentados (9 opengravity + 7 srv1166087). **Coletar ~30 dias ANTES de prunar** — aí o critério fica completo (idade + views.json 30d < 5 + 0 link externo). NÃO deletar portal-engine sem esse dado (deletar só por idade+sem-link apagaria ~15-40%/portal às cegas). rota nginx: `location=/_h`→8795, `location=/_b.js`→`/srv/portais/_shared/beacon.js`.

**Bugs do orquestrador CORRIGIDOS em 2026-07-10 (o script estava quebrado, audit voltava zerado):**
1. Faltava **filtro allowlist** — varria TODOS os sites do hosting; adicionei gate `if domain not in ALLOWLIST: continue` (lê `rede-publicacao-allowlist.txt`).
2. Check `wp-config.php`: `rc, _, _ = run_ssh(...)` lia **stderr** em vez de stdout → pulava TODO site. Fix: `rc, _wpcfg, _`.
3. `subprocess.run(text=True)` decodava em **cp1252** no Windows → `UnicodeDecodeError` num título e derrubava o run. Fix: `encoding="utf-8", errors="replace"`.
4. `prune_execute.php`: `getenv(...) ?: 30` trata string `"0"` como **falsy** → `--draft-grace=0` virava 30 (posts iam pra draft, não trash). Fix: checar `=== false || === ''` explícito.
Padrão de execução direto-pra-lixeira: `--draft-grace=0 --trash-grace=99999` (publish→draft→trash num passo, NADA deletado). Rollback: `--mode=rollback --pruning-run=YYYY-MM-DD`.

**Histórico de rodadas:**
- 2026-07-10 rollout rede: **9.231 posts publish→lixeira** (anderson 6327 + vps1 2774 + qmix 81 + **hostverge 49**), 0 deletados, 0 erros. Critério 120d+<5views+0outbound. Allowlist-scoped, clientes pulados. Reversível via `rollback --pruning-run=2026-07-10`. **hostverge**: SSH ssh.us.stackcp.com é INTERMITENTE (20i auto-desliga; "connection refused" quando off). Quando volta, orquestrador usa acesso DIRETO (não o jump quebrado): `ssh="hostverge"`, `base="/home/sites/18a/7/7672b9147f/public_html"`, `needs_jump=False`. Estrutura `public_html/<dom>/` com wp-config direto. **Mais 2 fixes**: `run_ssh` agora captura `TimeoutExpired`→skip (hostverge lento crashava tudo) e timeout do check subiu p/ 45s. **PENDENTE**: os 16 portais portal-engine — agora TÊM tracking (ver acima), mas precisam coletar ~30d de views antes de prunar.
- 2026-05-27 advivo.com.br: 1104 posts publish→trash direto (skipping draft, conforme pedido). Total publicados antes: 4052, depois: 2948. Confirmado deadweight real (Rank Math mostrava 347 com "link externo" mas era cache stale: post_content e backup ambos sem `https` editorial). Force-delete agendado pra 2026-06-26 via lifecycle fase 3.

**Rank Math stale data (importante):** A tabela `wp_rank_math_internal_links` é indexada UMA vez (`rank_math_internal_links_processed=1`) e nunca reprocessada. Posts que tiveram links externos removidos depois (via `wp oie audit-links` ou edição) continuam aparecendo no painel RM como "tendo link externo". O `prune_audit.php` lê `post_content` direto (verdade atual) — discrepância com RM é esperada, não é falso-positivo do pruning. RM se auto-corrige quando `wp_delete_post(true)` roda na fase 3 do lifecycle.

## Estratégia operacional (NÃO pedir confirmação a cada site)

Após validação em advivo.com.br (2026-05-27), o operador autorizou rollout autônomo nos 128 sites restantes. Por site:

1. `wp eval-file prune_audit.php` com `QMIX_PRUNE_MIN_AGE=120 QMIX_PRUNE_MAX_VIEWS=5`
2. Sanidade automática (sem perguntar): pula se `views_meta_key=NULL` OU `candidates > 40% do total` OU site em lista de excluídos
3. `wp eval-file direct_trash.php` — publish→trash DIRETO (sem step draft)
4. Backup 7 meta-keys + `$wpdb->update` direto (preserva post_modified)
5. Purge LSCache + cache flush
6. Sleep 4-12h aleatório antes do próximo site (anti-fingerprint inter-site)
7. Registra resultado em log

**SÓ parar e perguntar se:** erro de SSH/SCP, volume >40% (anômalo), ou operador interromper. Para sites normais, executar autonomamente.

Force-delete (fase 3) agendado pra +30d via `prune_low_value_posts.py --mode=execute` ou trigger manual.
