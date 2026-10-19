// Prepara as entradas e a tabela da Moz. Dois modos.
//
// 1) node preparar-moz.mjs entrada <pasta-03-resultados>
//    Le 01-apos-filtros.txt e 02-no-commoncrawl.txt.
//    Grava 04-amostra-fora-1000.txt (controle: 1.000 dominios aleatorios que NAO estao no ranking do Common Crawl)
//    e 05-moz-entrada.txt (os do ranking + o controle). Esse e o arquivo que vai para a Moz, fase 1 (--so-metricas).
//
// 2) node preparar-moz.mjs fase2 <pasta-03-resultados> [da-min=5] [spam-max=59] [rd-min=3]
//    Le moz-lote.json (resultado da fase 1) e 02-no-commoncrawl.txt.
//    Grava 06-moz-fase1.tsv (dominio, cc, da, spam, rd) e 07-fase2-entrada.txt (candidatos a coletar quem linka),
//    e imprime o custo estimado da fase 2 (1 linha da Moz por fonte devolvida, ate 20 por dominio).
import { readFileSync, writeFileSync } from 'node:fs'

const [, , modo, pasta, daMin = '5', ssMax = '59', rdMin = '3'] = process.argv
if (!modo || !pasta) { console.error('uso: node preparar-moz.mjs entrada|fase2 <pasta-03-resultados>'); process.exit(1) }
const dir = pasta.replace(/\/?$/, '/')
const ler = (f) => readFileSync(dir + f, 'utf8').split(/\r?\n/).filter(Boolean)

if (modo === 'entrada') {
  const todos = ler('01-apos-filtros.txt')
  const noRanking = ler('02-no-commoncrawl.txt')
  const ok = new Set(noRanking)
  const fora = todos.filter((d) => !ok.has(d))
  let s = 12345 // semente fixa: o controle e reprodutivel
  const r = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648
  for (let i = fora.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fora[i], fora[j]] = [fora[j], fora[i]] }
  const controle = fora.slice(0, 1000)
  writeFileSync(dir + '04-amostra-fora-1000.txt', controle.join('\n'))
  writeFileSync(dir + '05-moz-entrada.txt', [...noRanking, ...controle].join('\n'))
  console.log({ noRanking: noRanking.length, foraDoRanking: fora.length, controle: controle.length, entradaMoz: noRanking.length + controle.length })
} else if (modo === 'fase2') {
  const M = JSON.parse(readFileSync(dir + 'moz-lote.json', 'utf8')).metricas
  const cc = new Set(ler('02-no-commoncrawl.txt'))
  const linhas = Object.entries(M).map(([d, m]) => ({
    d, cc: cc.has(d) ? 1 : 0,
    da: m.sem_metricas ? 0 : Math.round(+m.domain_authority || 0),
    ss: m.sem_metricas ? 0 : Math.max(Math.round(+m.spam_score || 0), 0),
    rd: m.sem_metricas ? 0 : Math.round(+m.root_domains_to_root_domain || 0),
  }))
  writeFileSync(dir + '06-moz-fase1.tsv', 'dominio\tcc\tda\tspam\trd\n' + linhas.map((x) => [x.d, x.cc, x.da, x.ss, x.rd].join('\t')).join('\n'))
  const cand = linhas.filter((x) => x.da >= +daMin && x.ss <= +ssMax && x.rd >= +rdMin)
  writeFileSync(dir + '07-fase2-entrada.txt', cand.map((x) => x.d).join('\n'))
  const custo = cand.reduce((t, x) => t + Math.min(20, x.rd), 0)
  console.log({ medidos: linhas.length, candidatos: cand.length, custoMaxEstimadoLinhas: custo, filtro: `DA>=${daMin}, spam<=${ssMax}, RD>=${rdMin}` })
  console.log('Pergunte ao Anderson antes de rodar a fase 2 se o custo passar de alguns milhares de linhas.')
} else {
  console.error('modo desconhecido:', modo); process.exit(1)
}
