import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const dir = 'D:/SISTEMAS/DOMINIOS ANALISE/resultados/lista-rb-2026-10-14/'
const csv = (f) => {
  const r = readFileSync(dir + f, 'utf8').replace('\ufeff', '').split(/\r?\n/).filter(Boolean)
  const h = r[0].split(';')
  return r.slice(1).map((l) => { const c = l.split(';'), o = {}; h.forEach((k, i) => (o[k] = c[i] ?? '')); return o })
}
const curta = csv('LISTA-CURTA-com-historico.csv')
const full = csv('ranking-final-gov-edu-2026-10-18.csv')
const n = (v) => +v || 0
const slim = (r, hist) => ({
  d: r.dominio, da: n(r.DA), ss: n(r.spam), rd: n(r.dominios_linkando || 0),
  gov: n(r.gov_br), edu: n(r.edu_br), ass: n(r.associacoes), coop: n(r.cooperativas), not: n(r.noticias), wik: n(r.wikipedia),
  lg: r.links_gov_br || '', le: r.links_edu_br || '', la: r.links_associacoes || '', lc: r.links_cooperativas || '', ln: r.links_noticias || '', lw: r.links_wikipedia || '',
  ...(hist
    ? { m: n(r.meses_com_pagina_200), a2: r.ultima_captura, sig: r.sinal }
    : { sc: n(r.score), obs: r.obs || '' }),
})
const lerJsonl = (f) => { try { return readFileSync(dir + f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) } catch { return [] } }
const IX = new Map(lerJsonl('09-indexacao.jsonl').map((j) => [j.d, j]))
const WB = new Map(lerJsonl('03-wayback.jsonl').map((j) => [j.domain, j]))
const sinal = (w) => {
  if (!w) return ''
  const a2 = +String(w.ultima || '').slice(0, 4)
  if (!w.meses) return 'SEM HISTORICO NO WAYBACK'
  if (a2 >= 2025) return 'ativo ate 2025/26'
  return w.meses >= 24 ? 'historico longo' : 'historico curto'
}
const enrich = (x) => {
  const i = IX.get(x.d); if (i) { x.ix = i.n; x.it = i.top }
  if (!x.sig) { const w = WB.get(x.d); x.sig = sinal(w); if (w) { x.m = w.meses; x.a2 = String(w.ultima || '').slice(0, 4) } }
  return x
}
const COMP = new Set(readFileSync(dir + '10-competicao.txt', 'utf8').split(/\r?\n/).filter(Boolean))
const MC = JSON.parse(readFileSync(dir + 'moz-comp.json', 'utf8')).metricas
const compCsv = new Map(csv('ranking-competicao.csv').map((r) => [r.dominio, r]))
const SUF_FALSO = /\.(app|dev|tec|ia|api|ong|social|seg|log|des|xyz)\.br$/
const compRows = [...COMP].map((d) => {
  const m = MC[d] || {}
  const r = compCsv.get(d) || { dominio: d, DA: m.domain_authority, spam: Math.max(+m.spam_score || 0, 0), dominios_linkando: m.root_domains_to_root_domain }
  r.DA = r.DA ?? m.domain_authority; r.dominios_linkando = m.root_domains_to_root_domain ?? r.dominios_linkando
  const x = slim(r, false)
  x.rd = n(m.root_domains_to_root_domain)
  if (SUF_FALSO.test(d)) x.obs = 'DA FALSO: vem do sufixo, não do domínio. ' + (x.obs || '')
  return x
})
const dados = {
  curta: curta.map((r) => enrich(slim(r, true))),
  full: full.map((r) => enrich(slim(r, false))),
  comp: compRows.map(enrich),
  gerado: '18/10/2026',
  liberacao: '14/10 a 21/10/2026 às 15h',
}
const template = readFileSync('D:/SISTEMAS/DOMINIOS ANALISE/scripts/relatorio-template.html', 'utf8')
for (const x of [...dados.curta, ...dados.full, ...dados.comp]) if (COMP.has(x.d)) x.comp = true
const html = template.replace('__DADOS__', () => JSON.stringify(dados)).replace(/__LIBERACAO__/g, dados.liberacao).replace(/__GERADO__/g, dados.gerado).replace(/__NCOMP__/g, String(dados.comp.length))
mkdirSync('D:/SISTEMAS/DOMINIOS ANALISE/relatorio', { recursive: true })
writeFileSync('D:/SISTEMAS/DOMINIOS ANALISE/relatorio/relatorio-dominios-2026-10-18.html', html)
console.log('ok', (html.length / 1024).toFixed(0) + ' KB', dados.curta.length, dados.full.length)
