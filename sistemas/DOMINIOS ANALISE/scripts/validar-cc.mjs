import { readFileSync } from 'node:fs'
const rev = d => d.split('.').reverse().join('.')
const mapa = new Map()
for (const l of readFileSync('lista-rb-2026-10-14/cc-ranks-br.tsv','utf8').split('\n').slice(1)) { const c=l.split('\t'); if(c.length>=6) mapa.set(c[4], +c[5]) }
const M = JSON.parse(readFileSync('resultado-200.json','utf8')).metricas
const L = JSON.parse(readFileSync('resultado-200.json','utf8')).linking
const rows = Object.entries(M).filter(([,m])=>!m.sem_metricas).map(([d,m])=>({d,da:+m.domain_authority||0,rd:+m.root_domains_to_root_domain||0,cc:mapa.has(rev(d)),hosts:mapa.get(rev(d))||0,gov:Array.isArray(L[d])&&L[d].some(x=>x.gov)}))
const f=(nome,fn)=>{const s=rows.filter(fn);console.log(nome.padEnd(34),String(s.length).padStart(3),'domínios | no ranking:',s.filter(x=>x.cc).length,`(${Math.round(100*s.filter(x=>x.cc).length/Math.max(1,s.length))}%)`)}
f('todos',()=>true); f('DA >= 25',x=>x.da>=25); f('DA 15-24',x=>x.da>=15&&x.da<25); f('DA 5-14',x=>x.da>=5&&x.da<15); f('DA < 5',x=>x.da<5)
f('com link gov/edu',x=>x.gov); f('RD >= 100',x=>x.rd>=100); f('RD 30-99',x=>x.rd>=30&&x.rd<100)
console.log('\nOs bons que o ranking PERDERIA (DA>=20 ou gov):'); rows.filter(x=>!x.cc&&(x.da>=20||x.gov)).sort((a,b)=>b.da-a.da).forEach(x=>console.log(' ',x.d,'DA',x.da,'RD',x.rd,x.gov?'GOV':''))
