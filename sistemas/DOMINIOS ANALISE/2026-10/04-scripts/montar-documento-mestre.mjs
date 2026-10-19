// Monta o documento mestre: TODOS os dominios da lista de liberacao + competicao, com o destino de cada um no funil.
// Uso: node montar-documento-mestre.mjs <pasta-do-mes> <AAAA-MM> <sufixo-data-das-listas>
//   ex.: node montar-documento-mestre.mjs "D:/SISTEMAS/DOMINIOS ANALISE/2026-10" 2026-10 2026-10-14
// Le 01-listas-registrobr e 03-resultados; grava TODOS-OS-DOMINIOS-<AAAA-MM>.csv na pasta do mes.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { ehSpam, TLDS_FALSA_AUTORIDADE as FALSA, TLDS_RESTRITOS as RESTR } from './spam-dominio.mjs'

const [, , BASE, MES = '2026-10', DATA = '2026-10-14'] = process.argv
if (!BASE) { console.error('uso: node montar-documento-mestre.mjs <pasta-do-mes> <AAAA-MM> <data-listas>'); process.exit(1) }
const R = (f) => BASE + '/03-resultados/' + f
const lerLista = (f) => readFileSync(f, 'latin1').split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter((s) => s && !s.startsWith('#'))
const csv = (f) => {
  if (!existsSync(f)) return []
  const r = readFileSync(f, 'utf8').replace('\ufeff', '').split(/\r?\n/).filter(Boolean)
  const h = r[0].split(';')
  return r.slice(1).map((l) => { const c = l.split(';'), o = {}; h.forEach((k, i) => (o[k] = c[i] ?? '')); return o })
}
const jsonl = (f) => (existsSync(f) ? readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)) : [])

const liberacao = lerLista(`${BASE}/01-listas-registrobr/lista-processo-liberacao-${DATA}.txt`)
const competicao = new Set(lerLista(`${BASE}/01-listas-registrobr/lista-processo-competitivo-${DATA}.txt`))
const libSet = new Set(liberacao)
const todos = [...new Set([...liberacao, ...competicao])]

const cc = new Set(readFileSync(R('02-no-commoncrawl.txt'), 'utf8').split(/\r?\n/).filter(Boolean))
const apos = new Set(readFileSync(R('01-apos-filtros.txt'), 'utf8').split(/\r?\n/).filter(Boolean))
const curta = new Set(readFileSync(R('08-lista-curta.txt'), 'utf8').split(/\r?\n/).filter(Boolean))

const moz = new Map()
for (const f of ['moz-lote.json', 'moz-comp.json']) {
  if (!existsSync(R(f))) continue
  const J = JSON.parse(readFileSync(R(f), 'utf8'))
  for (const [d, m] of Object.entries(J.metricas || {})) if (!m.sem_metricas) moz.set(d, m)
}
const rank = new Map()
for (const f of [readdirSync(BASE + '/03-resultados').find((x) => x.startsWith('ranking-final-gov-edu')), 'ranking-competicao.csv']) for (const r of csv(R(f))) rank.set(r.dominio, r)
const ix = new Map(jsonl(R('09-indexacao.jsonl')).map((j) => [j.d, j.n]))
// nota-compra.tsv e gerado por gerar-relatorio-html.mjs (rode o relatorio antes deste script)
const notaMap = new Map(existsSync(R('nota-compra.tsv')) ? readFileSync(R('nota-compra.tsv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map((l) => { const c = l.split('\t'); return [c[0], c] }) : [])
const wb = new Map(jsonl(R('03-wayback.jsonl')).map((j) => [j.domain, j]))
const sinal = (w) => {
  if (!w) return ''
  if (!w.meses) return 'sem historico'
  if (+String(w.ultima).slice(0, 4) >= 2025) return 'ativo ate 2025/26'
  return w.meses >= 24 ? 'historico longo' : 'historico curto'
}

function motivo(d) {
  if (FALSA.some((t) => d.endsWith('.' + t))) return 'sufixo de autoridade falsa'
  if (RESTR.some((t) => d.endsWith('.' + t))) return 'categoria restrita do Registro.br'
  if (ehSpam(d)) return 'nome gerado ao acaso (spam)'
  if (d.split('.')[0].length >= 25) return 'nome com 25 letras ou mais'
  return ''
}

const COLS = ['dominio', 'lista_liberacao', 'competicao', 'descartado_no_filtro_de_nome', 'motivo_do_descarte', 'no_ranking_common_crawl', 'medido_na_moz', 'DA', 'spam', 'dominios_linkando',
  'gov_br', 'edu_br', 'associacoes', 'cooperativas', 'noticias', 'wikipedia', 'paginas_indexadas_google', 'sinal_wayback', 'na_lista_curta', 'nota_compra', 'gov_edu_que_passam_autoridade', 'observacao']
const linhas = [COLS.join(';')]
let nComp = 0, nMoz = 0
for (const d of todos) {
  const m = moz.get(d), r = rank.get(d), mot = motivo(d)
  const comp = competicao.has(d)
  if (comp) nComp++
  if (m) nMoz++
  const obs = []
  if (comp && /\.(app|dev|tec|ia|api|ong|social|seg|log|des|xyz)\.br$/.test(d)) obs.push('DA falso do sufixo')
  if (mot && comp) obs.push('competicao descartada pelo filtro mas medida mesmo assim')
  linhas.push([
    d, libSet.has(d) ? 'sim' : 'nao', comp ? 'sim' : 'nao', mot ? 'sim' : 'nao', mot, cc.has(d) ? 'sim' : 'nao', m ? 'sim' : 'nao',
    m ? Math.round(+m.domain_authority || 0) : '', m ? Math.max(Math.round(+m.spam_score || 0), 0) : '', m ? Math.round(+m.root_domains_to_root_domain || 0) : '',
    r?.gov_br ?? '', r?.edu_br ?? '', r?.associacoes ?? '', r?.cooperativas ?? '', r?.noticias ?? '', r?.wikipedia ?? '',
    ix.has(d) ? ix.get(d) : '', sinal(wb.get(d)), curta.has(d) ? 'sim' : 'nao',
    notaMap.has(d) ? String(notaMap.get(d)[1]).replace('.', ',') : '', notaMap.has(d) ? notaMap.get(d)[2] : '', obs.join('; '),
  ].join(';'))
}
const saida = `${BASE}/TODOS-OS-DOMINIOS-${MES}.csv`
writeFileSync(saida, '\ufeff' + linhas.join('\n'))
console.log({ total: todos.length, liberacao: liberacao.length, competicao: nComp, medidosNaMoz: nMoz, apos_filtros: apos.size, saida })
