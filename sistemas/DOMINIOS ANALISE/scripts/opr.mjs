// Open PageRank em lote (100 dominios por chamada). Retomavel: so consulta o que falta.
// Uso: OPR_KEY=xxxx node opr.mjs entrada.txt saida.jsonl
import { readFileSync, appendFileSync, existsSync } from 'node:fs'
const [,, ent, sai] = process.argv, KEY = process.env.OPR_KEY
if (!KEY || !ent || !sai) { console.error('uso: OPR_KEY=chave node opr.mjs entrada.txt saida.jsonl'); process.exit(1) }
const todos = readFileSync(ent,'utf8').split('\n').map(s=>s.trim()).filter(Boolean)
const feitos = new Set(existsSync(sai) ? readFileSync(sai,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l).domain) : [])
const falta = todos.filter(d=>!feitos.has(d)); console.log(`${todos.length} total, ${falta.length} a consultar`)
for (let i=0;i<falta.length;i+=100) {
  const lote = falta.slice(i,i+100)
  const q = lote.map(d=>'domains[]='+encodeURIComponent(d)).join('&')
  let r, tent=0
  while (true) {
    try { r = await fetch('https://openpagerank.com/api/v1.0/getPageRank?'+q,{headers:{'API-OPR':KEY},signal:AbortSignal.timeout(60000)})
      if (r.status===429) { console.log('429, aguardando 60s'); await new Promise(x=>setTimeout(x,60000)); continue }
      if (!r.ok) throw new Error('HTTP '+r.status+' '+(await r.text()).slice(0,150)); break
    } catch(e){ if(++tent>4){console.error('ERRO',e.message);process.exit(1)} await new Promise(x=>setTimeout(x,5000)) }
  }
  const j = await r.json()
  appendFileSync(sai, (j.response||[]).map(x=>JSON.stringify({domain:x.domain,rank:x.rank,pr:x.page_rank_decimal,status:x.status_code})).join('\n')+'\n')
  if ((i/100)%20===0) console.log(`${i+lote.length}/${falta.length}`)
  await new Promise(x=>setTimeout(x,250))
}
console.log('fim')
