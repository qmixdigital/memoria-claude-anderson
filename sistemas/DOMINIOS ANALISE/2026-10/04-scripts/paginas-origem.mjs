// Coleta a pagina EXATA que linka (URL, ancora, nofollow, ultima vez visto) para as fontes que interessam.
// Moz Links API v2, metodo "links". Cada link devolvido gasta 1 linha da cota. Roda na VPS (tokens no .env).
//
// Uso (na VPS, dentro de /var/www/qmix-next):
//   node /tmp/paginas-origem.mjs --alvos /tmp/alvos.json --saida /tmp/12-paginas-origem.jsonl [--paginas 3] [--reserva 3000]
// alvos.json: { "dominio.com.br": { "mec.gov.br": 93, "usp.br": 92 }, ... }  (fonte: DA; gerado por alvos-paginas-origem.mjs)
//
// Para cada dominio, pede os links em ordem de DA da origem, 50 por pagina, e para quando achou todas as fontes
// alvo, quando a origem fica com DA menor que a menor fonte alvo, ou depois de --paginas paginas (padrao 3 = 150 linhas).
// Guarda ate 3 links por fonte. Retomavel: pula dominios que ja estao na saida.
import { readFileSync, appendFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter((l) => /^[A-Z_]+=/.test(l))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] }))
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const ALVOS = JSON.parse(readFileSync(arg('alvos'), 'utf8'))
const SAIDA = arg('saida', '/tmp/12-paginas-origem.jsonl')
const PAGINAS = Number(arg('paginas', 3)), RESERVA = Number(arg('reserva', 3000))
const TOKEN = env.MOZ_API_TOKEN, DATA = env.MOZ_DATA_TOKEN

async function cota() {
  const r = await fetch('https://api.moz.com/jsonrpc', { method: 'POST', headers: { 'x-moz-token': DATA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: randomUUID(), method: 'quota.lookup', params: { data: { path: 'api.limits.data.rows' } } }) })
  const q = (await r.json())?.result?.quota
  return q ? q.allotted - q.used : null
}
async function links(target, next) {
  const body = { target, target_scope: 'root_domain', filter: 'external', sort: 'source_domain_authority', limit: 50 }
  if (next) body.next_token = next
  for (let t = 1; t <= 3; t++) {
    const r = await fetch('https://lsapi.seomoz.com/v2/links', { method: 'POST', headers: { 'x-moz-token': TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
    const j = await r.json().catch(() => ({}))
    if (r.ok) return j
    if (t === 3) throw new Error(j?.message || 'HTTP ' + r.status)
    await new Promise((x) => setTimeout(x, 3000 * t))
  }
}

const feitos = new Set(existsSync(SAIDA) ? readFileSync(SAIDA, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).d) : [])
const fila = Object.keys(ALVOS).filter((d) => !feitos.has(d))
let sobra = await cota()
console.log(`cota restante: ${sobra} | dominios: ${fila.length} | ate ${PAGINAS * 50} linhas por dominio | reserva ${RESERVA}`)
let gastas = 0
for (const d of fila) {
  if (sobra !== null && sobra - gastas - PAGINAS * 50 < RESERVA) { console.log('parando: chegaria na reserva da cota'); break }
  const alvo = new Set(Object.keys(ALVOS[d])); const minDaAlvo = Math.min(...Object.values(ALVOS[d])); const achados = new Map()
  let next = null, pag = 0, usadas = 0
  try {
    while (pag < PAGINAS) {
      const j = await links(d, next); pag++
      const rs = j.results || []; usadas += rs.length
      for (const x of rs) {
        const root = x.source?.root_domain
        if (!alvo.has(root)) continue
        const a = achados.get(root) || []
        if (a.length < 3) a.push({ r: root, da: x.source.domain_authority, pg: x.source.page, tg: x.target?.page, an: (x.anchor_text || '').slice(0, 80), nf: x.nofollow ? 1 : 0, last: x.date_last_seen || '', gone: x.date_disappeared || '' })
        achados.set(root, a)
      }
      const ultimoDa = rs.length ? rs[rs.length - 1].source?.domain_authority ?? 0 : 0
      if (achados.size >= alvo.size || !j.next_token || !rs.length || ultimoDa < minDaAlvo) break
      next = j.next_token
    }
    gastas += usadas
    appendFileSync(SAIDA, JSON.stringify({ d, links: [...achados.values()].flat(), linhas: usadas, faltaram: [...alvo].filter((r) => !achados.has(r)) }) + '\n')
    console.log(`  ${d.padEnd(34)} ${String(achados.size).padStart(2)}/${alvo.size} fontes achadas | ${usadas} linhas`)
  } catch (e) { console.log(`  erro ${d}: ${e.message}`) }
  await new Promise((x) => setTimeout(x, 400))
}
console.log(`fim: linhas gastas ${gastas}`)
