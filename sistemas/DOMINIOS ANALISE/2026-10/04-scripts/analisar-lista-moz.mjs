// Analise de uma lista solta de dominios na Moz (sem tocar no banco do site).
// Fase 1: metricas (Data API v3, lotes de 50, 1 linha por dominio).
// Fase 2: linking root domains (Links API v2) para os que passarem no filtro,
//         1 linha por dominio de origem devolvido. Marca gov/edu/jus/leg/mil.
//
// Uso (na VPS, dentro de /var/www/qmix-next, Node 20):
//   node analisar-lista-moz.mjs --lista lista.txt --saida resultado.json [--min-da 10] [--max-ss 30] [--limite 20] [--so-metricas]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] }),
)
const DATA_TOKEN = env.MOZ_DATA_TOKEN, API_TOKEN = env.MOZ_API_TOKEN
if (!DATA_TOKEN || !API_TOKEN) { console.error('tokens Moz ausentes no .env'); process.exit(1) }

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const flag = (n) => process.argv.includes(`--${n}`)
const LISTA = arg('lista'), SAIDA = arg('saida', 'resultado-moz.json')
const MIN_DA = Number(arg('min-da', 10)), MAX_SS = Number(arg('max-ss', 30)), LIMITE = Number(arg('limite', 20))
const RE_GOV = /(\.(gov|leg|jus|mil|edu|mp|def|tc)\.br|\.(gov|edu|mil)|\.gob\.[a-z]{2}|\.gouv\.fr|\.gov\.[a-z]{2})$/i

const dominios = [...new Set(readFileSync(LISTA, 'utf8').split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean))]
const out = existsSync(SAIDA) ? JSON.parse(readFileSync(SAIDA, 'utf8')) : { gerado_em: new Date().toISOString(), metricas: {}, linking: {} }
const salvar = () => writeFileSync(SAIDA, JSON.stringify(out, null, 1))

async function rpc(method, data) {
  const res = await fetch('https://api.moz.com/jsonrpc', { method: 'POST', headers: { 'x-moz-token': DATA_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: randomUUID(), method, params: { data } }), signal: AbortSignal.timeout(90_000) })
  const txt = await res.text(); let j = null; try { j = JSON.parse(txt) } catch {}
  if (!res.ok || j?.error) throw new Error(`Moz ${method}: HTTP ${res.status} ${j?.error?.message || txt.slice(0, 200)}`)
  return j.result
}
async function linking(dominio) {
  const r = await fetch('https://lsapi.seomoz.com/v2/linking_root_domains', { method: 'POST', headers: { 'x-moz-token': API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: dominio, target_scope: 'root_domain', limit: LIMITE, sort: 'source_domain_authority', filter: 'external' }), signal: AbortSignal.timeout(40_000) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`)
  return j.results || []
}

const q = await rpc('quota.lookup', { path: 'api.limits.data.rows' })
console.log('cota:', JSON.stringify(q.quota))

// Fase 1
const pendentes = dominios.filter((d) => !out.metricas[d])
console.log(`fase 1: ${dominios.length} dominios, ${pendentes.length} pendentes`)
for (let i = 0; i < pendentes.length; i += 50) {
  const lote = pendentes.slice(i, i + 50)
  const r = await rpc('data.site.metrics.fetch.multiple', { site_queries: lote.map((d) => ({ query: d, scope: 'domain' })) })
  const results = r?.results_by_site || []
  if (results.length !== lote.length) throw new Error(`Moz devolveu ${results.length} para ${lote.length}`)
  lote.forEach((d, k) => { out.metricas[d] = results[k]?.site_metrics || { sem_metricas: true } })
  salvar()
  console.log(`  lote ${i / 50 + 1}: ${lote.length} ok`)
  await new Promise((r) => setTimeout(r, 1000))
}
if (flag('so-metricas')) { console.log('fim (so metricas)'); process.exit(0) }

// Fase 2
const n = (v) => Number(v ?? 0)
const candidatos = dominios.filter((d) => { const m = out.metricas[d]; return m && !m.sem_metricas && n(m.domain_authority) >= MIN_DA && n(m.spam_score) <= MAX_SS && n(m.root_domains_to_root_domain) > 0 })
  .filter((d) => !out.linking[d])
console.log(`fase 2: ${candidatos.length} candidatos (DA>=${MIN_DA}, SS<=${MAX_SS}), ate ${LIMITE} fontes cada = max ${candidatos.length * LIMITE} linhas`)
let gastas = 0
for (const d of candidatos) {
  try {
    const res = await linking(d)
    out.linking[d] = res.map((r) => ({ dominio: r.root_domain, da: r.domain_authority, ss: r.spam_score, pages: r.to_target?.pages, nofollow: r.to_target?.nofollow_pages, gov: RE_GOV.test(String(r.root_domain)) }))
    gastas += res.length
    const gov = out.linking[d].filter((x) => x.gov)
    console.log(`  ${d.padEnd(34)} ${String(res.length).padStart(2)} fontes${gov.length ? '  GOV: ' + gov.map((g) => g.dominio).join(', ') : ''}`)
  } catch (e) { out.linking[d] = { erro: e.message }; console.log(`  erro ${d}: ${e.message}`) }
  salvar()
  await new Promise((r) => setTimeout(r, 400))
}
console.log(`fim: linhas gastas na fase 2 = ${gastas}`)
