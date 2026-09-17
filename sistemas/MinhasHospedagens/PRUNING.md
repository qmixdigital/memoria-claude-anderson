# Content Pruning - Rede QMIX

Regra interna de despublicação/remoção de posts low-value na rede de portais QMIX.
**Fora do escopo da skill `wp-news-portal-fullsetup`** — opera lateralmente como rotina de manutenção.

Última revisão: 2026-05-27

---

## Critério de elegibilidade

Um post é candidato a pruning quando **TODOS** os critérios abaixo são verdadeiros:

| Critério | Valor | Como mede |
|---|---|---|
| `post_status` | `publish` | `wp_posts.post_status` |
| `post_type` | `post` | `wp_posts.post_type` (ignora `page`, custom types) |
| Idade | `post_date < NOW() - 120 dias` | `wp_posts.post_date` |
| Cliques (Antonio stats) | `< 5` total desde publicação | `wp_postmeta.meta_value` onde `meta_key LIKE 'v____post_views'` |
| Links externos no conteúdo | `0 outbound` | regex em `post_content`: `<a href` apontando para domínio diferente do site |

A combinação significa: **post velho + sem tráfego + sem cumprir função de PBN (publicar backlink)**. Deadweight puro.

---

## Salvaguardas (qualquer uma => SKIP, mesmo sendo elegível)

| Salvaguarda | Razão |
|---|---|
| Tem 1+ comentário aprovado | Engajamento real, mesmo que não medido como click |
| ID está em `wp_options` (front-page, menu_order, sticky_posts) | Referenciado em config do site |
| Tem `_wp_old_slug` com redirect ativo | URL antiga em uso, deletar quebraria redirect |
| Post tem `_antonio_imported_at` < 120 dias | Importado recentemente pela QMIX, ainda pode ganhar tráfego |
| Site está em [feedback_sites_clientes_rede.md](../../C:/Users/User/.claude/projects/d--SISTEMAS-MinhasHospedagens/memory/feedback_sites_clientes_rede.md) | 26 domínios de clientes ou ex-rede — pular completamente |
| Post tem custom field `qmix_keep` = `1` | Whitelist manual do operador |

---

## Ciclo de vida (Draft → Trash 30d → Delete)

Reversível em todas as etapas. Janela total: ~60 dias.

```
Publish (post_date < 120d, views < 5, no outbound)
   │
   │  pruning rodada N:
   │   - update_post_meta(_qmix_pruned_at, NOW())
   │   - update_post_meta(_qmix_pruned_stage, 'drafted')
   │   - update_post_meta(_qmix_pruned_reason, 'low_traffic_no_outbound')
   │   - update_post_meta(_qmix_pruned_views, $views)
   │   - update_post_meta(_qmix_pruned_backup_content, $post_content)
   │   - wp_update_post(post_status='draft')
   ▼
Draft (30 dias)
   │
   │  pruning rodada N+30d:
   │   - confirma _qmix_pruned_stage = 'drafted' + idade >= 30d
   │   - update_post_meta(_qmix_pruned_stage, 'trashed')
   │   - update_post_meta(<<REMOVIDO>>, NOW())
   │   - wp_trash_post()
   ▼
Trash (30 dias)
   │
   │  pruning rodada N+60d:
   │   - confirma _qmix_pruned_stage = 'trashed' + idade >= 30d
   │   - wp_delete_post(force_delete=true)
   │   - meta de backup se vai junto (não tem mais post)
   ▼
DELETED (sem volta)
```

**Recuperação manual** durante a janela de 60d:
```bash
wp post update <ID> --post_status=publish
wp post meta delete <ID> _qmix_pruned_at
wp post meta delete <ID> _qmix_pruned_stage
wp post meta delete <ID> _qmix_pruned_reason
wp post meta delete <ID> _qmix_pruned_views
wp post meta delete <ID> _qmix_pruned_backup_content
```

---

## Pacing (anti-fingerprint)

A rede tem ~129 sites. Despublicar 100+ posts simultaneamente em 100+ portais cria um sinal de batch facilmente detectável (clustering de `Last-Modified` no CDN, sitemap diff, padrão de 404 burst).

**Regras de pacing:**

- Máximo **5 posts despublicados por site por dia**
- Jitter aleatório de **4 a 12 horas entre portais** dentro da mesma rodada
- Rodada completa da rede leva **~30 dias** (com 5/dia/site, ~150 posts/site se houver tantos candidatos)
- **NÃO atualizar `post_modified` em nenhum post remanescente** (mesma regra crítica da skill regra 14)
- Não rodar na mesma janela do `wp oie audit-links` rollout (evitar overlap de sinais)

---

## Estratégia operacional VALIDADA (2026-05-27 advivo) - seguir nos próximos sites

Padrão de execução validado com advivo.com.br (1104 posts processados sem incidente). **Aplicar este mesmo fluxo nos 128 sites restantes da rede sem pedir confirmação a cada um**, exceto se aparecer anomalia (ver gates abaixo).

**Por site, a ordem é:**

1. **Audit** via `wp eval-file /tmp/prune_audit.php` com env vars `QMIX_PRUNE_MIN_AGE=120 QMIX_PRUNE_MAX_VIEWS=5`. Captura JSON com candidatos.

2. **Sanidade rápida (NÃO bloqueia, só registra log):**
   - `candidates_count / total_published` deve estar entre 5% e 40% → normal, segue.
   - `< 5%`: site tem pouca deadweight, OK seguir.
   - `> 40%`: anômalo (Antonio stats pode não estar rodando, ou meta_key errado, ou site é muito novo). **PARAR esse site, pular pro próximo, alertar operador no resumo final.**
   - `views_meta_key` é NULL: Antonio stats não tem dados ainda. **PARAR esse site, pular.**
   - `skipped.has_outbound = 0` E `candidates_count > 100`: estranho (esperado é ~10-30% dos rows ter outbound). Investigar antes de trashar.

3. **Direct trash** (skip draft step): roda `direct_trash.php` (mesmo script usado no advivo). 
   - Backup das 7 meta-keys antes de cada trash
   - `$wpdb->update` direto (NÃO mexe em `post_modified`)
   - `_qmix_pruned_stage = 'trashed'` + `<<REMOVIDO>> = now`
   - Purge LSCache + cache flush ao final
   - Marca `_qmix_pruned_reason = 'low_traffic_no_outbound_direct'`

4. **Spot-check pós-trash** (silent, só registra):
   - `wp post list --post_status=trash --post_type=post --format=count` confirma o delta
   - Se houver erros no JSON de retorno: salvar lista de IDs com erro

5. **Inter-site jitter:** sleep aleatório 4-12h ANTES do próximo site. Isso evita batch fingerprint no CDN (Cloudflare). Em rollout urgente o operador pode passar `--no-jitter` mas default é com pacing.

**Lifecycle:**
- Fase 2 (trash 30d → delete) acontece via `prune_low_value_posts.py --mode=execute` agendado pra +30d
- Operador pode inspecionar lixeira a qualquer momento até force-delete

**Rank Math stale data: ignorar.** Painel SEO pode mostrar "tem link externo" em posts trashados mesmo quando `post_content` real não tem mais. RM se auto-corrige no force-delete.

**Não perguntar a cada site.** Só perguntar/parar se:
- Site é da lista de excluídos (26 domínios) → SKIP automático
- `views_meta_key` é NULL (sem Antonio stats) → SKIP, registra
- Volume anômalo (>40% do total) → SKIP, registra
- Erro de SSH/SCP/wp-cli → registra, segue pro próximo

**Reporte final por hospedagem:**
```
=== ROLLOUT $(date) ===
ANDERSON 46 sites:
  ok: 38 sites, 24580 posts trashados
  skipped:
    advivo.com.br (já feito anteriormente)
    blog.aplusplatform.com (excluído por memória clientes)
    folhadabahia.net (volume 47% anômalo - investigar)
    ...
  errors: 0
HOSTVERGE 27 sites:
  ok: 24 sites, 9180 posts trashados
  skipped: clientes (5)
  errors: 0
TOTAL: 124 sites processados, ~50k posts em lixeira
```

---

## Workflow de execução (3 passos obrigatórios)

### Passo 1: Audit (dry-run, sem mutação)

```bash
cd D:\SISTEMAS\MinhasHospedagens\scripts
python prune_low_value_posts.py --mode=audit --output=audit.csv
```

Itera todos os 129 sites via SSH. Em cada um:
1. SCP `prune_audit.php` para `/tmp/`
2. `wp eval-file /tmp/prune_audit.php`
3. Coleta JSON: `{site, candidates: [{id, title, date, views, content_size, has_comments, ...}]}`
4. Aggrega tudo em `audit.csv`

CSV gerado para revisão:
```
site,id,title,post_date,views,age_days,content_size,has_comments,decision,override
advivo.com.br,12345,"Como fazer X",2026-01-10,2,138,2890,no,prune,
diariopernambucano.com.br,6789,"O que é Y",2026-01-05,1,143,1456,no,prune,
```

Coluna `override` é editada pelo operador: vazio = aplicar decisão, `keep` = não prunar, `force` = prunar mesmo se salvaguarda dispararia.

### Passo 2: Review + decide

Operador abre `audit.csv` em Excel/Numbers, marca exceções na coluna `override`, salva.

Eu verifico antes de executar:
- Volume total razoável? (esperado: ~30-50% dos posts publicados antigos)
- Algum site com volume desproporcional? (suspeita: meta_key wrong, ou stats não rodando)
- Spot-check 5 posts random — confirma manualmente que merecem ser despublicados?

### Passo 3: Execute (paced rollout)

```bash
python prune_low_value_posts.py --mode=execute --input=audit.csv --pace=5perdayperhost
```

Aplica o ciclo de vida em batches. Roda como cron diário ou manual. Cada execução:
- Estágio `published` → `draft`: até N posts/site/dia (default 5)
- Estágio `draft` → `trash`: posts com `_qmix_pruned_at` + 30d
- Estágio `trash` → `delete`: posts com `<<REMOVIDO>>` + 30d

Output: log incremental em `D:\SISTEMAS\MinhasHospedagens\pruning-logs\<YYYY-MM-DD>.log`

---

## Exclusões duras (NUNCA prunar)

Lista canônica em `feedback_sites_clientes_rede.md` (memória). Reproduzo aqui pra consulta rápida:

**Clientes (sites médicos/clínicas/advogados gerenciados pra terceiros, 23):**
blog.advdobrasil.com.br, blog.aplusplatform.com, blog.camilafarias.com.br, blog.cirurgiadojoelhogoiania.com, blog.clinicasrecuperacaosaopaulo.com, blog.coegoiania.com.br, blog.drbrunoair.com.br, blog.drhenriquebufaical.com.br, blog.drthiagotredicci.com.br, blog.drtiagobernardes.com.br, blog.nutricionista.digital, blog.ombrogoiania.com.br, blog.qmix.com.br, cirurgiacoracao.com.br, cirurgiadacatarata.com.br, cirurgiadecancer.com.br, cirurgiadecolunagoiania.com.br, cirurgiadojoelhogoiania.com, clinicasrecuperacaosaopaulo.com, drbrunoair.com.br, drtiagobernardes.com.br, institutoortopedico.com.br, medicodasmaos.com.br

**Removidos da rede (3):**
setorenergetico.com.br, arcondicionadotop.com (DNS → Next.js), geladeirastop.com (DNS → Next.js)

---

## Reversão de emergência (todo o pruning de uma rodada)

Se descobrirmos que a rodada N foi mal — meta_key errado, threshold mal calibrado, etc:

```bash
python prune_low_value_posts.py --mode=rollback --pruning-run=<YYYY-MM-DD>
```

Faz, em ordem:
1. Encontra todos posts com `_qmix_pruned_at` daquele dia
2. Restaura `post_status` baseado em `_qmix_pruned_stage` original ou hard `publish`
3. Apaga as 5 meta-keys `_qmix_pruned_*`
4. Restaura `post_content` do backup meta caso tenha sido modificado
5. Roda `litespeed_purge_all` por site

**Só funciona se posts ainda não foram force-deletados** (estágio 3). Após force-delete, recuperação é só via backup do `wp_posts` row do dia anterior (que não temos guardado por default).

---

## Threshold (calibrar com cuidado)

Valores default propostos. Mudanças requerem audit antes/depois:

| Variável | Default | Conservador | Agressivo |
|---|---|---|---|
| `min_age_days` | 120 | 180 | 90 |
| `max_views` | 5 | 2 | 10 |
| `pace_per_day_per_site` | 5 | 2 | 10 |
| `draft_grace_days` | 30 | 60 | 14 |
| `trash_grace_days` | 30 | 60 | 14 |

Se a rodada inicial pegar >20% dos posts publicados de um site, **subir threshold de age** (180d primeiro). Indica que stats Antonio pode estar registrando menos views que o esperado.

---

## Rank Math stale data (expected, não é bug)

Rank Math grava links externos detectados na tabela `wp_rank_math_internal_links` e marca o post com `_postmeta.rank_math_internal_links_processed = 1` na primeira indexação. **Nunca reprocessa.** Se um link externo foi removido depois da indexação inicial (via `wp oie audit-links`, edição manual, ou qualquer outra operação), o painel SEO da Rank Math continua mostrando "1 link externo" mesmo que o `post_content` atual tenha zero.

**Implicação para pruning:**
- Painel admin do post (sidebar Rank Math) pode dizer "Links: 0 1 0" (1 externo) mesmo após pruning.
- O audit do `prune_audit.php` lê **`post_content` direto** (verdade de agora), não a tabela RM.
- Se RM diz "tem externo" mas o `post_content` não tem URL externa → o post realmente é deadweight (link já sumiu antes, conteúdo perdeu propósito PBN).

**Verificação rápida em caso de dúvida** num post trashado:
```bash
# Mostra URLs externas REAIS no backup do post pré-trash
wp post meta get <ID> _qmix_pruned_backup_content | grep -oE 'https?://[^"'"'"' <>]+' | grep -v <self_domain>

# Vs. o que RM diz
wp db query "SELECT url, type FROM wp_rank_math_internal_links WHERE post_id=<ID> AND type='external'"
```

Se a primeira retorna vazio e a segunda retorna URL: **dado RM stale, pruning correto**.

Não há ação necessária — quando o post for force-deletado na fase 3 do lifecycle, o `wp_delete_post(true)` aciona o hook do Rank Math que limpa a tabela `wp_rank_math_internal_links`. Stale data se auto-resolve.

---

## Validação pós-rodada

Após cada rodada de `--mode=execute`, validar:

```bash
# Quantos posts em cada estágio
for SITE in $(ls); do
    wp --path=$SITE postmeta query --meta_key=_qmix_pruned_stage --count
done

# Diff de sitemap antes/depois
curl -s https://site.com/sitemap_index.xml | xmllint --xpath 'count(//url)' -
# Esperado: -N onde N = posts despublicados daquele dia

# Confirma 404 público (Cloudflare purge funcionou)
curl -sI https://site.com/url-do-post-prunado/ | head -1
# Esperado: HTTP/2 404
```

Se sitemap não reduziu mas DB sim → RankMath cache não atualizou. Rodar `wp rank-math sitemap regenerate`.

---

## Arquivos relacionados

- `scripts/prune_low_value_posts.py` - orquestrador
- `scripts/prune_audit.php` - audit per-portal (rodado via `wp eval-file`)
- `scripts/prune_execute.php` - executor das transições
- `pruning-logs/` - logs de cada rodada
- `pruning-audits/` - CSVs de cada audit
- `feedback_sites_clientes_rede.md` (memória) - lista de exclusão canônica
