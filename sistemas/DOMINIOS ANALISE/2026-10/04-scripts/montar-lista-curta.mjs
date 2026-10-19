// Monta a lista curta (gov + edu BR >= 2, spam <= 30, pouco diretorio) e junta o historico do Wayback.
// Uso: node montar-lista-curta.mjs <pasta-03-resultados> [min-gov-edu=2]
// Entrada: ranking-final-gov-edu*.csv (gerado por ranquear-fase2.mjs) e 03-wayback.jsonl (opcional; rode wayback.mjs na 08-lista-curta.txt).
// Saida: LISTA-CURTA-gov-edu.csv, 08-lista-curta.txt e, se houver Wayback, LISTA-CURTA-com-historico.csv.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'

const dir = process.argv[2].replace(/\/?$/, '/')
const MIN = Number(process.argv[3] || 2)
const csv = (f) => {
  const r = readFileSync(f, 'utf8').replace('﻿', '').split(/\r?\n/).filter(Boolean)
  const h = r[0].split(';')
  return r.slice(1).map((l) => { const c = l.split(';'), o = {}; h.forEach((k, i) => (o[k] = c[i] ?? '')); return o })
}
const rank = csv(dir + readdirSync(dir).find((f) => f.startsWith('ranking-final-gov-edu')))
const C = ['rank', 'dominio', 'DA', 'spam', 'gov_br', 'edu_br', 'associacoes', 'cooperativas', 'noticias', 'wikipedia', 'links_gov_br', 'links_edu_br', 'links_noticias', 'links_wikipedia']
const curta = rank.filter((r) => +r.gov_br + +r.edu_br >= MIN && +r.spam <= 30 && +r.lixo_top20 < 12)
writeFileSync(dir + 'LISTA-CURTA-gov-edu.csv', '﻿' + [C.join(';'), ...curta.map((r) => C.map((k) => r[k]).join(';'))].join('\n'))
writeFileSync(dir + '08-lista-curta.txt', curta.map((r) => r.dominio).join('\n'))
console.log('lista curta:', curta.length)

if (existsSync(dir + '03-wayback.jsonl')) {
  const W = new Map(readFileSync(dir + '03-wayback.jsonl', 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { const j = JSON.parse(l); return [j.domain, j] }))
  const ano = (t) => (t ? t.slice(0, 4) : '-')
  const out = ['rank;dominio;DA;spam;gov_br;edu_br;associacoes;cooperativas;noticias;wikipedia;meses_com_pagina_200;primeira_captura;ultima_captura;anos_no_ar;sinal;links_gov_br;links_edu_br;links_noticias;links_wikipedia']
  for (const o of curta) {
    const w = W.get(o.dominio) || {}
    const a1 = +ano(w.primeira), a2 = +ano(w.ultima)
    const sinal = !w.meses ? 'SEM HISTORICO NO WAYBACK' : a2 >= 2025 ? 'ativo ate 2025/26 (pode estar em uso ou redencao)' : w.meses >= 24 ? 'historico longo' : 'historico curto'
    out.push([o.rank, o.dominio, o.DA, o.spam, o.gov_br, o.edu_br, o.associacoes, o.cooperativas, o.noticias, o.wikipedia, w.meses || 0, ano(w.primeira), ano(w.ultima), a1 && a2 ? a2 - a1 : 0, sinal, o.links_gov_br, o.links_edu_br, o.links_noticias, o.links_wikipedia].join(';'))
  }
  writeFileSync(dir + 'LISTA-CURTA-com-historico.csv', '﻿' + out.join('\n'))
  console.log('com historico: ok')
}
