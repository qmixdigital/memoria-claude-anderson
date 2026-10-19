// Ranking final: quem tem backlink de governo, educacao, associacoes, cooperativas, portais de noticia fortes e Wikipedia.
// Uso: node ranquear-fase2.mjs moz-lote.json 06-moz-fase1.tsv saida.csv
// As regras de categoria ficam em classificar.mjs (compartilhadas com o relatorio).
import { readFileSync, writeFileSync } from 'node:fs'
import { criarClassificador } from './classificar.mjs'

const [, , jsonF, tsvF, outF] = process.argv
const J = JSON.parse(readFileSync(jsonF, 'utf8')), M = J.metricas, L = J.linking
const cc = new Map(readFileSync(tsvF, 'utf8').split('\n').slice(1).map((l) => { const c = l.split('\t'); return [c[0], +c[1]] }))
const cat = criarClassificador(L)
const PESO = { govbr: 40, edubr: 35, assoc: 15, coop: 15, news: 12, wiki: 10, govx: 8, edux: 5, outro: 0, lixo: -1 }
const rows = []
for (const [dom, lk] of Object.entries(L)) {
  if (!Array.isArray(lk)) continue
  const m = M[dom] || {}, da = +m.domain_authority || 0, ss = Math.max(+m.spam_score || 0, 0), rd = +m.root_domains_to_root_domain || 0
  const g = {}; for (const x of lk) (g[cat(x.dominio)] ||= []).push(x)
  const n = (c) => (g[c] || []).length, f = (c) => (g[c] || []).map((x) => `${x.dominio} (${x.da})`).join(', ')
  let score = 0; for (const c of Object.keys(PESO)) score += n(c) * PESO[c]
  score += da * 0.8 - (ss > 30 ? ss * 1.2 : 0)
  const interessante = n('govbr') + n('edubr') + n('assoc') + n('coop') + n('news') + n('wiki')
  rows.push({
    dominio: dom, no_ranking_cc: cc.get(dom) ? 'sim' : 'nao', DA: da, spam: ss, dominios_linkando: rd, gov_br: n('govbr'), edu_br: n('edubr'), associacoes: n('assoc'), cooperativas: n('coop'), noticias: n('news'), wikipedia: n('wiki'), gov_exterior: n('govx'), edu_exterior: n('edux'), lixo_top20: n('lixo'), score: Math.round(score * 10) / 10,
    links_gov_br: f('govbr'), links_edu_br: f('edubr'), links_associacoes: f('assoc'), links_cooperativas: f('coop'), links_noticias: f('news'), links_wikipedia: f('wiki'), links_exterior: [f('govx'), f('edux')].filter(Boolean).join(', '),
    obs: [ss >= 60 ? 'SPAM ALTO' : ss > 30 ? 'spam>30' : '', n('lixo') >= 10 ? 'perfil com muito diretorio' : '', interessante === 0 ? 'sem gov/edu/assoc/noticia/wiki' : ''].filter(Boolean).join('; '),
  })
}
rows.sort((a, b) => b.score - a.score); rows.forEach((r, i) => (r.rank = i + 1))
const cols = ['rank', ...Object.keys(rows[0]).filter((k) => k !== 'rank')]
writeFileSync(outF, '﻿' + cols.join(';') + '\n' + rows.map((r) => cols.map((c) => String(r[c] ?? '').replace(/;/g, ',')).join(';')).join('\n'))
console.log({ analisados: rows.length, comGovOuEduBR: rows.filter((r) => r.gov_br + r.edu_br > 0).length, comAssocOuCoop: rows.filter((r) => r.associacoes + r.cooperativas > 0).length, comNoticia: rows.filter((r) => r.noticias > 0).length, comWikipedia: rows.filter((r) => r.wikipedia > 0).length, semNadaInteressante: rows.filter((r) => r.obs.includes('sem gov')).length })
for (const r of rows.slice(0, Number(process.env.TOP || 40))) console.log(`${String(r.rank).padStart(3)} ${r.dominio.padEnd(32)} DA${String(r.DA).padStart(3)} SS${String(r.spam).padStart(3)} gov${r.gov_br} edu${r.edu_br} ass${r.associacoes} coop${r.cooperativas} not${r.noticias} wiki${r.wikipedia} | ${[r.links_gov_br, r.links_edu_br].filter(Boolean).join(', ').slice(0, 110)}${r.obs ? ' | ' + r.obs : ''}`)
