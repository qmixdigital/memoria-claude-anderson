// Cruza a lista de dominios com o ranking de dominios do Common Crawl (br.com.exemplo = exemplo.com.br).
import { readFileSync, writeFileSync } from 'node:fs'
const dir = process.argv[2]
const lista = readFileSync(`${dir}/01-apos-filtros.txt`,'utf8').split('\n').map(s=>s.trim()).filter(Boolean)
const rev = d => d.split('.').reverse().join('.')
const mapa = new Map()
for (const l of readFileSync(`${dir}/cc-ranks-br.tsv`,'utf8').split('\n').slice(1)) {
  const c = l.split('\t'); if (c.length<6) continue
  mapa.set(c[4], { hpos:+c[0], hval:+c[1], pr:+c[3], hosts:+c[5] })
}
const achados = lista.map(d=>({d, ...mapa.get(rev(d))})).filter(x=>x.hpos)
achados.sort((a,b)=>a.hpos-b.hpos)
writeFileSync(`${dir}/02-no-commoncrawl.tsv`, 'dominio\thpos\thval\tpr\thosts\n'+achados.map(x=>[x.d,x.hpos,x.hval,x.pr,x.hosts].join('\t')).join('\n'))
writeFileSync(`${dir}/02-no-commoncrawl.txt`, achados.map(x=>x.d).join('\n'))
const q = (n)=>achados.filter(x=>x.hosts>=n).length
console.log({lista:lista.length, noRanking:achados.length, comMaisDe1Host:q(2), comMais5Hosts:q(5), com20Hosts:q(20)})
console.log('top 15:'); achados.slice(0,15).forEach(x=>console.log(' ',x.hpos,x.d,x.hosts+' hosts'))
const faixas=[1e5,5e5,1e6,5e6,1e7,2e7,5e7]; console.log('por faixa de posicao harmonica:', faixas.map(f=>f+': '+achados.filter(x=>x.hpos<=f).length).join(' | '))
