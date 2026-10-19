// Monta alvos.json para paginas-origem.mjs: para cada dominio, as fontes que interessam (gov, edu, assoc, coop,
// noticia e Wikipedia) com o DA de cada uma.
//
// Uso:
//   node alvos-paginas-origem.mjs <pasta-03-resultados> lista.txt              # dominios de um arquivo (um por linha),
//                                                                              # ex.: a coluna dominio da "minha lista" exportada
//   node alvos-paginas-origem.mjs <pasta-03-resultados> auto [N=40]            # os N de maior nota da lista curta
//                                                                              # + todos da competicao com gov ou edu
// Saida: <pasta>/alvos.json e estimativa de custo (ate 150 linhas por dominio com --paginas 3).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { criarClassificador, SUF_FALSO } from './classificar.mjs'

const dir = process.argv[2].replace(/\/?$/, '/')
const modo = process.argv[3]
const N = Number(process.argv[4] || 40)
const QUER = new Set(['govbr', 'edubr', 'assoc', 'coop', 'news', 'wiki'])

const fontes = new Map()
for (const f of ['moz-lote.json', 'moz-comp.json']) {
  if (!existsSync(dir + f)) continue
  const L = JSON.parse(readFileSync(dir + f, 'utf8')).linking || {}
  const cat = criarClassificador(L)
  for (const [d, lk] of Object.entries(L)) if (Array.isArray(lk)) {
    const o = {}; for (const x of lk) if (QUER.has(cat(x.dominio))) o[x.dominio] = +x.da || 0
    if (Object.keys(o).length) fontes.set(d, o)
  }
}

let lista
if (modo === 'auto') {
  const nota = new Map(readFileSync(dir + 'nota-compra.tsv', 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map((l) => { const c = l.split('\t'); return [c[0], +c[1]] }))
  const curta = readFileSync(dir + '08-lista-curta.txt', 'utf8').split(/\r?\n/).filter(Boolean)
  const comp = readFileSync(dir + '10-competicao.txt', 'utf8').split(/\r?\n/).filter(Boolean)
  const topo = curta.filter((d) => fontes.has(d)).sort((a, b) => (nota.get(b) || 0) - (nota.get(a) || 0)).slice(0, N)
  const compGov = comp.filter((d) => !SUF_FALSO.test(d) && fontes.has(d) && Object.keys(fontes.get(d)).some((s) => /\.(gov|leg|jus|mp|def|tc|edu)\.br$|^[a-z]+\.br$/.test(s)))
  lista = [...new Set([...topo, ...compGov])]
} else {
  lista = readFileSync(modo, 'utf8').replace('﻿', '').split(/\r?\n/).map((s) => s.split(/[;,\t]/)[0].trim().toLowerCase()).filter((s) => /\.[a-z]{2,}$/.test(s))
}
const alvos = {}
for (const d of lista) if (fontes.has(d)) alvos[d] = fontes.get(d)
writeFileSync(dir + 'alvos.json', JSON.stringify(alvos, null, 1))
const n = Object.keys(alvos).length
console.log({ dominios: n, semFontesQueInteressam: lista.length - n, custoMaximoLinhas: n * 150, custoTipicoLinhas: n * 80 })
