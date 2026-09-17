---
name: qmix-moz-api
description: Conta Moz API da QMIX (plano, tokens, scripts, cota) e a fila de 118 mil domínios do Registro.br esperando DA
metadata:
  type: project
---

Moz API, conta 18000665, plano **Growth Medium: 120.000 linhas/mês**, reset mensal (período começou 31/08/2026), overage
ligado (US$ 20 por 10.000 linhas extras). Credenciais "legacy" (access id `<<REMOVIDO>>`) trocadas em 14/09/2026;
o token = base64(`access_id:secret`) vale para a **Links API v2** (`lsapi.seomoz.com/v2`, header Basic) e para a
**Data API v3** (`api.moz.com/jsonrpc`, header `x-moz-token`). No `.env` da VPS: `MOZ_ACCESS_ID`, `MOZ_SECRET_KEY`,
`MOZ_API_TOKEN` e `MOZ_DATA_TOKEN` (todos com o mesmo par). Trocar `.env` exige `pm2 reload qmix-next --update-env`.

- `usage_data` da v2 devolve `rows_consumed` **acumulado da vida da conta** (1,55 milhão), não do mês; a cota do mês vem de
  `quota.lookup` v3 com path `api.limits.data.rows` (`node scripts/verificar-moz.mjs --cota`, não gasta linha).
- `scripts/verificar-moz.mjs --total N` marca domínios `novo` de `dominios_rb` (Data API, 50 por chamada, 1 linha por domínio).
  `moz-autoridade.ts` (Análise de Domínios) usa a v2 com `MOZ_API_TOKEN`.
- Em 14/09/2026 havia **118.783 domínios de 09/2026 sem DA** (≈ a cota inteira do mês). Anderson pediu para verificar a cota
  e NÃO rodar sem ele autorizar.

## Sufixos de autoridade falsa (14/09/2026)

A Moz não reconhece vários segundos níveis do .br como sufixo público e dá a todos os domínios o DA do sufixo
(app.br 79, dev.br 75, tec.br 57, ia.br 48, ong.br 52, seg.br 44, log.br 41, api.br 33, social.br 32, des.br,
xyz.br e cidades curitiba/riopreto/bib/manaus/maringa/campinagrande). Lista em `scripts/spam-dominio.mjs`
(`TLDS_FALSA_AUTORIDADE`, `tldBloqueado`); o `importar-registrobr.mjs` descarta na entrada e 2.012 já na base viraram
`excluido`. Os sufixos com.br, net.br, org.br, adv.br, art.br, blog.br, ind.br etc. têm DA real (varia por domínio).

Lote de 09/2026: Anderson aprovou eliminar apostas (571) + sem vogal (1.587) e verificar o resto; `verificar-moz.mjs`
ganhou `--periodo MM/YYYY`. Rodou em 14/09 à noite (log `/tmp/verificar-moz-092026.log`), ~2.000 domínios/min.

Categorias restritas do Registro.br (org.br = só entidade sem fins lucrativos; coop, g12, gov, mil, psi, am, fm; e as de
profissional liberal adv/med/eng/arq/jor/psc/vet/odo/bio/ntr/not) também são bloqueadas (`TLDS_RESTRITOS`) desde
15/09/2026: 1.378 marcados como excluído. eco.br e far.br são livres (ficam). Fontes: registro.br/dominio/categorias e
nic.br sobre ong.br ("alternativa livre de restrições ao org.br").

**Linking domains (16/09/2026):** `scripts/coletar-linking.mjs --indexados --periodo MM/YYYY --limite 20` usa a Links API v2 `POST lsapi.seomoz.com/v2/linking_root_domains` (sort `source_domain_authority`, filter `external`); cada fonte devolvida = 1 linha da cota (o `quota.lookup` só atualiza por dia, não confiar nele ao vivo; id do JSON-RPC precisa ter 24+ chars). Grava `dominios_rb_linking` + `dominios_rb.gov_links/linking_coletado_em`; coluna **Gov/Edu** com filtro (com/sem/sem check) nas abas de domínios. Rodado para os 211 indexados de 09/2026: 4.202 linhas, 37 com fonte gov/edu. Cota do mês praticamente esgotada (~560 linhas até 01/10).
