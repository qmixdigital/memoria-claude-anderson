// Gera o relatorio HTML (um arquivo so, funciona sem internet) a partir de 03-resultados.
// Uso: node gerar-relatorio-html.mjs <pasta-do-mes> <AAAA-MM> ["DD/MM/AAAA da geracao"] ["texto do periodo de liberacao"]
//   ex.: node gerar-relatorio-html.mjs "D:/SISTEMAS/DOMINIOS ANALISE/2026-10" 2026-10 "18/10/2026" "14/10 a 21/10/2026 às 15h"
// Tambem grava 03-resultados/nota-compra.tsv (dominio, nota, gov/edu que passam autoridade), usado pelo documento mestre.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { criarClassificador, passaAutoridade, notaCompra, CATS, NOME_CAT, SUF_FALSO } from './classificar.mjs'

const BASE = process.argv[2] || 'D:/SISTEMAS/DOMINIOS ANALISE/2026-10'
const MES = process.argv[3] || '2026-10'
const GERADO = process.argv[4] || '18/10/2026'
const LIBERACAO = process.argv[5] || '14/10 a 21/10/2026 às 15h'
const dir = BASE + '/03-resultados/'

const csv = (f) => {
  const r = readFileSync(dir + f, 'utf8').replace('\ufeff', '').split(/\r?\n/).filter(Boolean)
  const h = r[0].split(';')
  return r.slice(1).map((l) => { const c = l.split(';'), o = {}; h.forEach((k, i) => (o[k] = c[i] ?? '')); return o })
}
const lerJsonl = (f) => (existsSync(dir + f) ? readFileSync(dir + f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])
const n = (v) => +v || 0

// Fontes de link classificadas, a partir do JSON bruto da Moz (lote principal e competicao).
const FONTES = new Map(), LIXO = new Map()
for (const f of ['moz-lote.json', 'moz-comp.json']) {
  if (!existsSync(dir + f)) continue
  const L = JSON.parse(readFileSync(dir + f, 'utf8')).linking || {}
  const cat = criarClassificador(L)
  for (const [d, lk] of Object.entries(L)) {
    if (!Array.isArray(lk)) continue
    const fx = []; let lixo = 0
    for (const x of lk) {
      const c = cat(x.dominio)
      if (c === 'lixo') lixo++
      if (CATS.includes(c)) fx.push({ s: x.dominio, da: n(x.da), c, f: passaAutoridade(x) ? 1 : 0 })
    }
    fx.sort((a, b) => CATS.indexOf(a.c) - CATS.indexOf(b.c) || b.da - a.da)
    FONTES.set(d, fx); LIXO.set(d, lixo)
  }
}

// Paginas exatas de origem (opcional): gerado por paginas-origem.mjs.
const PAG = new Map(lerJsonl('12-paginas-origem.jsonl').map((j) => [j.d, j.links || []]))
const IX = new Map(lerJsonl('09-indexacao.jsonl').map((j) => [j.d, j]))
const WB = new Map(lerJsonl('03-wayback.jsonl').map((j) => [j.domain, j]))
const sinal = (w) => {
  if (!w) return ''
  if (!w.meses) return 'SEM HISTORICO NO WAYBACK'
  if (+String(w.ultima || '').slice(0, 4) >= 2025) return 'ativo ate 2025/26'
  return w.meses >= 24 ? 'historico longo' : 'historico curto'
}

const slim = (r) => ({
  d: r.dominio, da: n(r.DA), ss: n(r.spam), rd: n(r.dominios_linkando),
  gov: n(r.gov_br), edu: n(r.edu_br), ass: n(r.associacoes), coop: n(r.cooperativas), not: n(r.noticias), wik: n(r.wikipedia),
  sc: n(r.score), obs: r.obs || '',
})
const enrich = (x) => {
  const i = IX.get(x.d); if (i && i.n >= 0) { x.ix = i.n; x.it = i.top }
  const w = WB.get(x.d); x.sig = sinal(w); if (w) { x.m = w.meses || 0; x.a2 = String(w.ultima || '').slice(0, 4) }
  x.fx = (FONTES.get(x.d) || []).map((s) => ({ ...s }))
  if (PAG.has(x.d)) {
    // Situacao do link por fonte, quando a pagina de origem foi coletada: 1 = algum link ainda ativo, 0 = todos sumiram.
    const vivo = new Map()
    for (const p of PAG.get(x.d)) vivo.set(p.r, (vivo.get(p.r) || 0) | (p.gone ? 0 : 1))
    for (const s of x.fx) if (vivo.has(s.s)) s.v = vivo.get(s.s)
  }
  x.gf = x.fx.filter((s) => (s.c === 'govbr' || s.c === 'edubr') && s.f && s.v !== 0).length
  const lixo = LIXO.get(x.d) || 0
  const { nota, partes } = notaCompra({ fontes: x.fx, da: x.da, ss: x.ss, dominio: x.d, sig: x.sig, ix: x.ix, lixo })
  x.nt = nota; x.np = partes
  if (PAG.has(x.d)) x.pg = PAG.get(x.d)
  if (SUF_FALSO.test(x.d) && !x.obs.includes('DA FALSO')) x.obs = ('DA FALSO: vem do sufixo, não do domínio. ' + x.obs).trim()
  return x
}

const curtaSet = new Set(csv('LISTA-CURTA-com-historico.csv').map((r) => r.dominio))
const full = csv(readdirSync(dir).find((f) => f.startsWith('ranking-final-gov-edu'))).map((r) => enrich(slim(r)))
const COMP = new Set(readFileSync(dir + '10-competicao.txt', 'utf8').split(/\r?\n/).filter(Boolean))
const MC = JSON.parse(readFileSync(dir + 'moz-comp.json', 'utf8')).metricas
const compCsv = new Map(csv('ranking-competicao.csv').map((r) => [r.dominio, r]))
const comp = [...COMP].map((d) => {
  const m = MC[d] || {}
  const r = compCsv.get(d) || { dominio: d, DA: m.domain_authority, spam: Math.max(+m.spam_score || 0, 0) }
  r.dominios_linkando = m.root_domains_to_root_domain
  return enrich(slim(r))
})
for (const x of [...full, ...comp]) { if (COMP.has(x.d)) x.comp = 1; if (curtaSet.has(x.d)) x.curta = 1 }

const dados = { full, comp, gerado: GERADO, liberacao: LIBERACAO, nomeCat: NOME_CAT, temPaginas: PAG.size }
const template = readFileSync(BASE + '/04-scripts/relatorio-template.html', 'utf8')
const html = template.replace('__DADOS__', () => JSON.stringify(dados))
  .replace(/__LIBERACAO__/g, LIBERACAO).replace(/__GERADO__/g, GERADO).replace(/__MES__/g, MES)
mkdirSync(BASE + '/05-relatorio', { recursive: true })
writeFileSync(BASE + '/05-relatorio/relatorio-dominios-' + MES + '.html', html)

const todos = new Map([...full, ...comp].map((x) => [x.d, x]))
writeFileSync(dir + 'nota-compra.tsv', 'dominio\tnota\tgov_edu_que_passam_autoridade\n' + [...todos.values()].map((x) => [x.d, x.nt, x.gf].join('\t')).join('\n'))
console.log('ok', (html.length / 1024).toFixed(0) + ' KB | lista curta', curtaSet.size, '| analisados', full.length, '| competicao', comp.length, '| com paginas de origem', PAG.size)
