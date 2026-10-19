// Historico no Wayback via CDX: marca quem ja teve pagina com status 200 e quantas capturas.
// Ritmo seguro (1 pedido/s por padrao) porque o archive.org bloqueia rajadas. Retomavel.
// Uso: node wayback.mjs entrada.txt saida.jsonl [pedidos_por_segundo=1]
import { readFileSync, appendFileSync, existsSync } from 'node:fs'
const [,, ent, sai, rps='1'] = process.argv
const todos = readFileSync(ent,'utf8').split('\n').map(s=>s.trim()).filter(Boolean)
const feitos = new Set(existsSync(sai) ? readFileSync(sai,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l).domain) : [])
const falta = todos.filter(d=>!feitos.has(d)); console.log(`${todos.length} total, ${falta.length} a consultar`)
const gap = 1000/Number(rps); let pausa429 = 60000, n=0
for (const d of falta) {
  while (true) {
    try {
      const r = await fetch(`https://web.archive.org/cdx/search/cdx?url=${d}&output=json&fl=timestamp&filter=statuscode:200&collapse=timestamp:6&limit=400`,{signal:AbortSignal.timeout(40000)})
      if (r.status===429 || r.status===503) { console.log(`${r.status}, aguardando ${pausa429/1000}s`); await new Promise(x=>setTimeout(x,pausa429)); pausa429=Math.min(pausa429*2,600000); continue }
      pausa429 = 60000
      const j = await r.json().catch(()=>[]); const ts = j.slice(1).map(x=>x[0])
      appendFileSync(sai, JSON.stringify({domain:d, meses:ts.length, primeira:ts[0]||null, ultima:ts[ts.length-1]||null})+'\n'); break
    } catch(e){ await new Promise(x=>setTimeout(x,5000)) }
  }
  if (++n%200===0) console.log(`${n}/${falta.length}`)
  await new Promise(x=>setTimeout(x,gap))
}
console.log('fim')
