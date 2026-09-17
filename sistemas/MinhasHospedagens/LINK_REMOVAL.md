# Sistema de Remoção de Links Externos da Rede QMIX

Workflow para remover links externos editoriais apontando para domínios específicos em toda a rede de portais.

Mu-plugin: `wp-content/mu-plugins/oie-link-audit.php` (deployado em 129 sites em 2026-05-27)
Skill: regra 14 de `wp-news-portal-fullsetup`

## Como funciona

O mu-plugin registra o comando WP-CLI `wp oie audit-links` que:
- Auditoria: lista posts com `<a href>` apontando para domínios alvo
- Remoção: substitui `<a href="alvo">texto</a>` por apenas `texto` (mode default)
- Preserva `post_modified` via `$wpdb->update` direto (sem `wp_update_post`)
- Backup do `post_content` original em `_postmeta.oie_link_removed_<timestamp>` (reversível)
- Modos: `text` (default, strip anchor), `nofollow` (add rel), `placeholder` (href=#)

## Comandos por site

```bash
# Audit (sem mutação)
wp oie audit-links --domain=alvo.com,outro.com

# Remoção (default text mode)
wp oie audit-links --domain=alvo.com --remove

# Dry-run
wp oie audit-links --domain=alvo.com --remove --dry-run

# Modos alternativos
wp oie audit-links --domain=alvo.com --remove --replacement=nofollow
wp oie audit-links --domain=alvo.com --remove --replacement=placeholder
```

## Workflow de orquestração da rede

### Passo 1: Auditar
Em cada uma das 4 hospedagens, iterar sites e rodar audit. Resultado: arquivo TXT por host com sites/posts/links que têm hits.

Scripts:
- `D:\SISTEMAS\MinhasHospedagens\scripts\audit-iptv-anderson.sh` (template anderson)
- `D:\SISTEMAS\MinhasHospedagens\scripts\audit-iptv-hostverge.sh` (template hostverge via jump)

### Passo 2: Aggregate
Python aggregator: combina os 4 TXTs em CSV com `hosting, site, posts, links`.

Output: `pruning-audits/<dominio>-link-removal-plan.csv`

### Passo 3: Review
Operador abre CSV, valida volume e sites alvo. Decide:
- Tudo de uma vez (rápido, mais signal anti-fingerprint)
- Em batches de N por dia (skill rule 14i recomenda 3-7 dias)

### Passo 4: Remoção
Roda `wp oie audit-links --domain=X --remove` por site + purge LSCache.

### Passo 5: Validação
Re-roda audit. Esperado: 0 sites com hits.

## Histórico de remoções

### 2026-07-03: clinicasrecuperacaosaopaulo.com + desentupidoras.pro + concar.com.br
Removidos os 3 juntos (`--domain=clinicasrecuperacaosaopaulo.com,desentupidoras.pro,concar.com.br`), **allowlist-scoped**. **~893 links**: anderson (3 sites, 46 — 1º run deu timeout/parcial, re-run limpou o resto, re-audit 0), qmix (4, 85), vps1 (24, 506), hostverge (9, 192) via `oie audit-links --remove`. 3 WP comando-quebrado (blogse 22, qmixdigital 21, desassossegada 21 = 64) via `strip_real3.php` (DB regex = 0). **Portal-engine = 0** em AMBOS os servidores (via `strip_pe3.js`, que auto-descobre os portais de `cfg.sites`). **Re-auditoria todas as camadas: 0.** ⚠️ Descoberto: existe **2º portal-engine no opengravity** (além do srv1166087) — o sweep agora cobre os dois. `www.concar.com.br` = casa por host (pegou www e não-www + qualquer path). Backups WP `_postmeta.oie_link_removed_*`.

### 2026-07-02: enjai + portugaldigital + skipark (3 domínios juntos, REINJEÇÃO send-remove)
Removidos os 3 de uma vez (`--domain=enjai.com.br,portugaldigital.com.br,skipark.com.br`), **allowlist-scoped** (protege clientes). **~1.757 links / ~86 sites WP + 10 portais**:
- anderson (34 sites, 731), qmix (4, 89), vps1 (24, 510 + 2 residual), hostverge (9, 202) via `oie audit-links --remove`.
- **vps1 residual (2):** jornalacapital (1 link real portugaldigital reinjetado) + maragoginoticias (1 âncora MALFORMADA `<a href="//enjai.com.br/&quot;"...>` que o mu-plugin não pega) → removidos via `strip_real.php` (regex âncora real + tag de abertura solta). Menções entity-encoded (`&lt;a&gt;` = texto, não link) deixadas.
- 3 WP comando-quebrado (blogse 22, qmixdigital 23, desassossegada 23 = 68) via `strip_real.php` eval-file (verificação DB regex = 0).
- portal-engine (10 portais, 155; jornaldiario/medicodasmaos = 0) via `strip_pe.js` (strip content/dek/excerpt, preserva `modified`, backup `.linkbak-<TS>`, `rebuildIndexes` por portal). Público + live = 0.
- **Matching hostverge:** dirs têm slug (não domínio) → casar pelo `wp option get home`/`Site:` do audit contra allowlist (dir "exquisito"→"exquisito.com.br"). Nenhum cliente tocado.
- **Re-auditoria todas as 6 camadas: 0.** Backups: WP `_postmeta.oie_link_removed_*`, portais `.linkbak-*`. Scripts: `scratchpad/strip_real.php` + `strip_pe.js`.

### 2026-06-30: links "comprar backlinks" QMIX (4 URLs — MATCHING POR HOST+PATH, não domínio)
Removidos 4 alvos de auto-promoção da rede: `qmix.com.br/comprar-backlinks`, `comprarbacklinks.store`, `comprar-backlinks.store`, `instagram.com/comprarbacklinks_qmix`.
**ARMADILHA CRÍTICA:** 2 dos 4 alvos vivem em hosts COMPARTILHADOS (`qmix.com.br` = domínio da própria rede; `instagram.com`). O `oie audit-links --domain=` casa por HOST (`wp_parse_url`), então `--domain=qmix.com.br`/`instagram.com` apagaria links legítimos. **NÃO usar o mu-plugin aqui.** Em vez disso, script próprio via `wp eval-file` (WP) e node (portal-engine) com matching preciso: host exato + path (`qmix.com.br` só se path inicia `/comprar-backlinks`; `instagram.com` só `/comprarbacklinks_qmix`; as 2 `.store` por host).
**Falso-positivo evitado:** um regex amplo `comprar-?backlinks` no href pega links EDITORIAIS legítimos (ex: `band.com.br/...como-comprar-backlinks...`, `linkedin.com/pulse/comprar-backlinks-...`). SEMPRE inspecionar hrefs reais antes de remover em massa.
Cobertura: **77 sites WP** (anderson 35, qmix 5, vps1 27, hostverge 10 — inclui os 3 de comando-quebrado blogse/qmixdigital/desassossegada, tratados pelo mesmo eval-file que bypassa o mu-plugin) + **10 portais portal-engine** (~70 links, via node strip + `rebuildIndexes`, backup `.linkbak-<TS>`). ~840 links no total. Backup WP em `_postmeta.oie_link_removed_20260630054701`. Re-auditoria todas as camadas: **0**. Scripts: `scratchpad/strip-backlinks.php` + `strip-pe.js`.

### 2026-06-24: drbrunoair.com.br (REINJEÇÃO residual, send-remove)
Re-sweep completo (operador notou que sites fora de lista podiam ter sobrado). Pegada pequena: **12 links / ~10 sites**: anderson (6, 1/site: azulmagazine, cameracotidiana, jornaldobairroalto, opopularjornal, publisherbrasil, revistarumo), qmix (3 sites, 4: barranews, folhadonoroeste, folhar), vps1 (1: euvo), hostverge (0), WP quebrado (blogse 1; qmixdigital/desassossegada 0), portal-engine (0). Re-auditoria todas as camadas: **0**. Confirma a lição: a varredura NÃO usa lista, itera todos os `*/public_html` + 3 WP quebrados + todos os portais → nada fica de fora.

### 2026-06-24: portugaldigital.com.br (REINJEÇÃO, send-remove)
Removido de novo, **662 links / 84 sites**, cobertura completa das 6 camadas (mesmo fluxo do enjai do mesmo dia): anderson (34, 266), qmix (4, 31), vps1 (24, 190), hostverge (9 de 26, 71), 3 WP comando-quebrado (24, via `pd_strip.php`), portal-engine (10 portais, 80, via `pd_pe.js` + `pd_pe2.js` p/ 1 URL em texto no projetob). Pegou www e não-www (`--domain=portugaldigital.com.br`). Re-auditoria todas as camadas: **0**. Backups `.linkbak-pd-*`.

### 2026-06-24: enjai.com.br (3ª+ rodada — REINJEÇÃO, send-remove)
Removido de novo, **662 links / 84 sites**, com cobertura COMPLETA das 6 camadas + cross-check da lista do operador (~92 sites):
- anderson (34 sites, 268), qmix (4, 32), vps1 (24, 193), hostverge (9 de 26, 72) via `oie audit-links --remove`.
- 3 WP comando-quebrado (blogse, qmixdigital, desassossegada): 24 links via `enjai_strip.php` (regex `<a...enjai...>txt</a>`→txt + fallback malformada, backup `_postmeta.oie_link_removed_*`). restante DB = 0.
- portal-engine (10 portais: diariodatv, diariodegoiania, diariodobrejo, edenoticias, entrenoticia, folhaum, gdsnoticias, projetob, romanceseleituras, todossomosgeek): 73 links via node `enjai_pe.js` (strip raw no JSON, preserva `modified`, `rebuildIndexes` re-renderiza tudo) + `enjai_pe2.js` p/ 3 URLs em texto/âncora quebrada. backup `.linkbak-*`/`.linkbak2-*`.
- **Re-auditoria todas as 6 camadas: 0.** Sites da lista que não tinham o link (jornaldebarcelos, girodasnoticias, nerddahora, noticias9, noticiasdasemana, noticiasgoias, osertaoenoticia, portalnoticiasbh, wtw19) confirmados 0. diariodatv/etc. têm WP morto no vps1; versão viva = portal-engine.
- **Loop hostverge:** usar `bash -s` heredoc (não single-quote inline, colapsa) + Bash-tool timeout alto (conta sobrecarregada, ~9min). vps1 = `/home/u651115354/domains`.

### 2026-06-16: 28 domínios de âncora IPTV (rodada grande, EXCLUINDO CLIENTES)
Descobertos via scan de âncoras com a keyword "IPTV" (iptv_scan.php — anchor text contém "iptv", extrai domínio externo). Removidos 28 domínios da REDE: conini.com.br, nucleomusicanova.com, happybiz.com.br, ctaonline.com.br, renser.com.br, kamari.com.br, cerebronosso.bio.br, cba2023.com.br, sbemparana.com.br, congressoservicosocialuel.com.br, otec.net.br, luminapdv.com.br, testeseletivo.com.br, posot.com.br, podcast1.com.br, etecsantacruz.com.br, etecparquedajuventude.com.br, congressomarista.com.br, cinemus.com.br, supervolt.com.br, socesp2022.com.br, example.com, comiteibicui.com.br, catadorasdemangaba.com.br, camara40.com.br, americaeconomiabrasil.com.br, abeneventos.com.br, buscaferias.net.
**NÃO incluídos** (operador omitiu): mareonline.com.br, enraizados.com.br, rblc.com.br, cbgo2023.com.br, imesp.com.br, cozot.com.br, correntecoats.com.br, vinhosbianchetti.com.br, lepur.com.br, quatrode15.com.br.
Por etapas (hosting a hosting): anderson 4016, qmix 433, vps1 3524, hostverge 1074, 3 WP-quebrado 350, portal-engine (9 portais, incl. diariodatv/degoiania/dobrejo/edenoticia/entrenoticia) ~516. **Total ~9.913 links.** Re-audit final: 0 (1 reinjeção no euvo/supervolt tratada durante o processo). Clientes excluídos. Modo text.
Nota: operador pediu pra "ignorar supervolt" DEPOIS de já estar removido → decidiu deixar removido.

### 2026-06-16: lightrio.com.br (EXCLUINDO CLIENTES)
Removido da REDE (96 sites, ~750 links): anderson (37, 299), qmix (4, 31), vps1 (35, 278), hostverge (10, ~85), 3 WP comando-quebrado (blogse/qmixdigital/desassossegada, 23), 7 portal-engine (diariodatv, diariodegoiania, diariodobrejo, jornaldiario, projetob, romanceseleituras, todossomosgeek, ~38). 16 clientes pulados. Modo text. Re-auditoria todas as camadas: **0**.

### 2026-06-16: drbrunoair.com.br (ciclo send-remove, EXCLUINDO CLIENTES)
Removido da REDE (92 sites), com exclusão explícita de sites de clientes (lista em feedback_sites_clientes_rede): anderson (37), qmix (4), vps1 (35), hostverge (10), 3 WP comando-quebrado (blogse, qmixdigital, desassossegada), 3 portal-engine (diariodatv, diariodegoiania, diariodobrejo). **16 sites de clientes pulados** pelo filtro de exclusão. Audit confirmou que nenhum cliente tinha o link (backlinks só entram na rede de publicação). Modo text. Re-auditoria todas as camadas: **0**. Novos portais (diariodatv/degoiania/dobrejo) entraram no fluxo automaticamente.

### 2026-06-14: lepur.com.br + quatrode15.com.br (VOLUME ALTO — backlinks antigos)
Removidos da rede COMPLETA (~94 sites, ~8.250 links — ~90/site, em quase todo post): anderson (37, 3365), qmix (4, 364), vps1 (36, 3261), hostverge (10, ~914), + 3 WP comando-quebrado (276) + 4 portais portal-engine (67). Re-audit todas as camadas: **0**.
Edge case: divirto.com.br post 19779 tinha âncora MALFORMADA (`<a href="quatrode15...">txt <a href=""></a></p>` — `<a>` aninhados sem fechamento) que o regex `<a>...</a>` do mu-plugin NÃO removeu (mas detectou no audit). Corrigido com fallback que remove só a tag de abertura `<a ...dom...>`. **TODO:** considerar adicionar esse fallback ao mu-plugin/scripts pra pegar âncoras malformadas automaticamente.

### 2026-06-14: COBERTURA DE PONTOS CEGOS (8 sites pulados antes)
Ao cruzar com a lista real de publicação, achados 8 sites que TODAS as rodadas acima pularam. Removidos os 6 domínios do dia (drbrunoair, clinicasrecuperacaosaopaulo, desentupidoras.pro, enjai, portugaldigital, skipark):
- **WP sem comando funcional (via wp eval-file):** blogse.com.br (36 links/34 posts), qmixdigital.com.br (37/34), desassossegada.com.br (38/35). Backup `_postmeta.oie_link_removed_*`. Validação DB: 0 (1 falso-positivo no blogse = link de Instagram com `data-id`).
- **portal-engine (JSON + rebuild):** romanceseleituras (12), projetob (13), todossomosgeek (11), jornaldiario (1), medicodasmaos (3). Backup em `/srv/portais/<slug>/data/.linkbak-<TS>/`. Validação data+public: 0. Live OK (cf DYNAMIC).
Ver seção "PONTOS CEGOS DO SWEEP" acima.

### 2026-06-14: skipark.com.br
Removido da rede inteira (87 sites, ~520 links): anderson (37), qmix (4), vps1 (36), hostverge (10).
Modo: text. Re-auditoria: **0 links** nas 4 hospedagens. LSCache purgado por site.

### 2026-06-14: portugaldigital.com.br
Removido da rede inteira (87 sites, ~600 links): anderson (37), qmix (4), vps1 (36), hostverge (10).
Modo: text. Re-auditoria: **0 links** nas 4 hospedagens. LSCache purgado por site.

### 2026-06-14: enjai.com.br (2ª rodada — REINJEÇÃO)
Removido de novo (87 sites, ~600 links): anderson (37), qmix (4), vps1 (36), hostverge (10).
**ALERTA:** já tinha sido zerado em 2026-06-06 e voltou ao volume cheio em 8 dias. A fonte de publicação (plataforma Antônio/receptor de artigos) reinjeta o link do enjai em cada post novo. Remoção é paliativa — reacumula. Pendente: investigar template/fonte que insere o link para cortar na origem.
Modo: text. Re-auditoria: **0 links** nas 4 hospedagens.

### 2026-06-14: desentupidoras.pro
Removido da rede inteira (87 sites, ~90 links — 1 link/site). NÃO confundir com desentupidora.pro (singular, removido em 2026-06-10):
- anderson (37), qmix (4), vps1 (36), hostverge (10)

Modo: text. Backup em `_postmeta.oie_link_removed_*`. Re-auditoria pós-remoção: **0 links** nas 4 hospedagens. LSCache purgado por site.

### 2026-06-14: clinicasrecuperacaosaopaulo.com
Removido da rede inteira (102 sites, ~450 links):
- anderson (38), qmix (4), vps1 (36), hostverge (24)

Modo: text (strip anchor, mantém texto e post_modified). Backup em `_postmeta.oie_link_removed_*`. Re-auditoria pós-remoção: **0 links** nas 4 hospedagens. LSCache purgado por site.

### 2026-06-14: drbrunoair.com.br
Removido da rede inteira (99 sites, ~300 links) — primeiro domínio de uma nova rodada de limpeza:
- anderson (37), qmix (4), vps1 (36), hostverge (22)

Modo: text (strip anchor, mantém texto e post_modified). Backup em `_postmeta.oie_link_removed_*`. Re-auditoria pós-remoção: **0 links** nas 4 hospedagens. LSCache purgado por site.

### 2026-06-10: desentupidora.pro (limpeza p/ recomeçar links novos)
Removidos da rede (16 sites, 16 posts, 16 links) — pra zerar o perfil de links internos antes de começar links novos pro domínio:
- anderson (11): adonline, advivo, azulmagazine, cameracotidiana, diariopernambucano, ebookcult, incast, jornaldobairroalto, opopularjornal, revistarumo, universoneo
- qmix (1): oiempreendedores
- vps1 (2): advdobrasil, blog.advdobrasil
- hostverge (2): revistadeducao, viajenodetalhe

Modo: text (strip anchor, mantém texto). Backup em `_postmeta.oie_link_removed_*`. Re-auditoria: 0 hits nos 16. (Cobre só os 4 hostings WP; portal-engine estático e sites Next não têm o mu-plugin.)

### 2026-05-27: 6 domínios IPTV
Removidos da rede inteira (61 sites afetados, 538 posts, 547 links):
- flowplay.com.br
- generation.com.br
- iptvai.tv
- brasil247.com
- revendaiptv.me
- welessonoliveira.com.br

Modo: text (strip anchor, mantém texto). Backup em `_postmeta.oie_link_removed_*`.
Reports em `pruning-audits/iptv-removal-*.txt`.

## PONTOS CEGOS DO SWEEP (descobertos 2026-06-14)

O orquestrador das 4 hospedagens WP **não cobre tudo**. Ao verificar a lista de sites que o operador publica de fato, foram achados 8 sites que TODAS as remoções anteriores pularam silenciosamente:

**1. Sites WP sem o comando `oie audit-links` funcional (3):** `blogse.com.br`, `qmixdigital.com.br` (anderson), `desassossegada.com.br` (qmix). O tema deles declara a classe `OIE_Link_Audit_Command` no `functions.php` mas registra OUTROS subcomandos `oie` — o `audit-links` dá `Error: not a registered subcommand`. No loop, `OUT` fica vazio → POSTS vazio → site PULADO como se fosse 0 hits. **NÃO** dá pra resolver copiando o mu-plugin (conflito de classe duplicada = fatal error, derruba o front). Solução: remover via `wp eval-file` com script próprio (regex strip de `<a href=...dominio...>texto</a>` → `texto`, backup em `_postmeta.oie_link_removed_<TS>`, `$wpdb->update` direto preservando post_modified). Script usado: ver histórico abaixo.
   - **Verificação real (ignora o comando quebrado):** `wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_status='publish' AND post_content REGEXP '<a[^>]+dominio[.]com'"`. CUIDADO: `data-id="dominio"` (resíduo de bloco Gutenberg em link de Instagram etc.) dá falso-positivo — conferir se o `href` realmente aponta pro domínio.
   - **Detectar quais sites têm o problema:** checar `wp-content/mu-plugins/oie-link-audit.php` ausente E `wp oie audit-links` retornando erro.

**2. Portais portal-engine (estáticos, não-WP) — VPS srv1166087:** não têm WP nem mu-plugin. Conteúdo em `/srv/portais/<slug>/data/*.json` (campo `content`/`dek`/`excerpt` em HTML). Em 2026-06-14 tinham links: `romanceseleituras`, `projetob`, `todossomosgeek`, `jornaldiario`, `medicodasmaos`. Remover editando os JSONs (strip `<a>`, manter texto, preservar `modified`) + `rebuildIndexes(cfg, site)` (regenera home/artigos/categorias/sitemap). Rodar como usuário `portais` (`runuser -u portais -- node ...`), NUNCA root. Cloudflare serve esses portais com `cf-cache-status: DYNAMIC` (HTML não-cacheado) → sem purge necessário.

**Lição:** "rede inteira" no orquestrador = só os ~127 sites WP com mu-plugin OK. Para cobertura REAL, cruzar sempre com a lista de publicação do operador e tratar (a) WP com comando quebrado via DB/eval e (b) portal-engine via JSON+rebuild.

## Reversão

Cada post tem backup do `post_content` original em meta `oie_link_removed_<timestamp>`. Para reverter um post específico:

```bash
wp eval '
$id = 12345;
$keys = get_post_meta($id);
foreach ($keys as $k => $v) {
    if (strpos($k, "oie_link_removed_") === 0) {
        global $wpdb;
        $wpdb->update($wpdb->posts, array("post_content" => maybe_unserialize($v[0])), array("ID" => $id));
        delete_post_meta($id, $k);
        clean_post_cache($id);
        break;
    }
}'
```

Para reverter tudo de uma rodada (todos os posts com meta entre timestamps X e Y):
```bash
wp db query "
UPDATE wp_posts p
JOIN wp_postmeta m ON m.post_id = p.ID
SET p.post_content = m.meta_value
WHERE m.meta_key LIKE 'oie_link_removed_%'
  AND m.meta_key BETWEEN 'oie_link_removed_<TS_START>' AND 'oie_link_removed_<TS_END>';
"
wp db query "DELETE FROM wp_postmeta WHERE meta_key LIKE 'oie_link_removed_%' AND meta_key BETWEEN 'oie_link_removed_<TS_START>' AND 'oie_link_removed_<TS_END>';"
```

## Próxima rodada (template)

Para remover novo conjunto de domínios:

1. Editar lista de domínios alvo:
```
DOMAINS="dominio1.com,dominio2.com,dominio3.com"
```

2. Auditar nos 4 hostings (paralelo):
```bash
ssh hostinger-anderson-gna 'cd /home/u400588174/domains; for d in */public_html; do
  [ ! -f "$d/wp-config.php" ] && continue
  SITE=$(basename "$(dirname "$d")")
  OUT=$(wp --path="$d" oie audit-links --domain="$DOMAINS" 2>/dev/null)
  POSTS=$(echo "$OUT" | head -1 | grep -oP "Posts: \K\d+")
  LINKS=$(echo "$OUT" | head -1 | grep -oP "Links: \K\d+")
  [ -n "$POSTS" ] && [ "$POSTS" != "0" ] && echo "$SITE|posts=$POSTS|links=$LINKS"
done' > audit-anderson.txt
```

(Adaptar paths para qmix `/home/u463007860`, vps1 `/home/u651115354`, hostverge `/home/sites/18a/7/7672b9147f//public_html` via jump opengravity.)

3. Aplicar remoção (mesmo loop, trocar `audit-links` por `audit-links ... --remove`).

4. Purge LSCache:
```bash
wp eval 'do_action("litespeed_purge_all");'
```
