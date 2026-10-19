// Confere se o dominio tem paginas no Google via Serper.dev (site:dominio). 1 consulta = 1 credito.
// Uso: SERPER_KEY=chave node indexacao-serper.mjs entrada.txt saida.jsonl [concorrencia=5]
// Retomavel: pula o que ja esta na saida. Grava: dominio, n (resultados organicos, max 10), top 3 (titulo, link).
import { readFileSync, appendFileSync, existsSync } from 'node:fs'

const [, , ent, sai, conc = '5'] = process.argv
const KEY = process.env.SERPER_KEY
if (!KEY || !ent || !sai) { console.error('uso: SERPER_KEY=chave node indexacao-serper.mjs entrada.txt saida.jsonl [conc]'); process.exit(1) }
const todos = readFileSync(ent, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
const feitos = new Set(existsSync(sai) ? readFileSync(sai, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).d) : [])
const fila = todos.filter((d) => !feitos.has(d))
console.log(`${todos.length} total, ${fila.length} a consultar`)

async function consultar(d) {
  for (let t = 1; t <= 4; t++) {
    try {
      const r = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: 'site:' + d, gl: 'br', hl: 'pt-br', num: 10 }),
        signal: AbortSignal.timeout(30000),
      })
      if (r.status === 429) { await new Promise((x) => setTimeout(x, 3000 * t)); continue }
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const j = await r.json()
      const org = (j.organic || []).filter((o) => String(o.link || '').toLowerCase().includes(d))
      return { d, n: org.length, top: org.slice(0, 3).map((o) => ({ t: String(o.title || '').slice(0, 90), l: o.link })) }
    } catch (e) {
      if (t === 4) return { d, n: -1, erro: e.message }
      await new Promise((x) => setTimeout(x, 1500 * t))
    }
  }
}

let i = 0, ok = 0, com = 0, erro = 0
async function worker() {
  while (i < fila.length) {
    const d = fila[i++]
    const r = await consultar(d)
    if (r.n < 0) erro++
    else { ok++; if (r.n > 0) com++; appendFileSync(sai, JSON.stringify(r) + '\n') }
    if ((ok + erro) % 250 === 0) console.log(`${ok + erro}/${fila.length} | com paginas ${com} | erros ${erro}`)
  }
}
await Promise.all(Array.from({ length: Number(conc) }, worker))
console.log(`fim: ${ok} consultados | com paginas indexadas ${com} | erros ${erro}`)
