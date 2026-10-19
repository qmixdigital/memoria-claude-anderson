// Regras compartilhadas: categoria de cada dominio de origem e a nota de compra (0 a 10).
// Usado por ranquear-fase2.mjs, gerar-relatorio-html.mjs e montar-documento-mestre.mjs.

export const GOVBR = /\.(gov|leg|jus|mil|mp|def|tc)\.br$/i
export const EDUBR = /(\.edu\.br$|^(u[a-z]{2,8}|if[a-z]{2,8}|embrapa|fapesp|fiocruz|capes|cnpq|ibge|senado|camara|bndes|ebc)\.br$|\.(u[a-z]{2,8}|usp|unicamp|unesp|unb)\.br$)/i
export const ASSOC = /\.org\.br$/i
export const COOP = /\.coop\.br$/i
export const GOVX = /(\.(gov|mil)$|\.gob\.[a-z]{2}$|\.gouv\.[a-z]{2}$|\.gov\.[a-z]{2}$)/i
export const EDUX = /(\.edu$|\.edu\.[a-z]{2}$|\.ac\.[a-z]{2}$)/i
export const WIKI = /(^|\.)(wikipedia|wikimedia|wikidata|wikiquote|wikibooks|wikivoyage)\.org$/i
export const NEWS = new Set(`globo.com g1.globo.com oglobo.globo.com uol.com.br folha.uol.com.br noticias.uol.com.br terra.com.br estadao.com.br abril.com.br veja.abril.com.br r7.com ig.com.br band.uol.com.br correiobraziliense.com.br metropoles.com gazetadopovo.com.br clicrbs.com.br ebc.com.br agenciabrasil.ebc.com.br cnnbrasil.com.br istoe.com.br exame.com infomoney.com.br canaltech.com.br tecmundo.com.br olhardigital.com.br em.com.br correiodopovo.com.br diariodepernambuco.com.br jornaldocomercio.com tribunapr.com.br bemparana.com.br hypeness.com.br brasildefato.com.br cartacapital.com.br jusbrasil.com.br catracalivre.com.br guiadasemana.com.br diariodocentrodomundo.com.br correioweb.com.br folhavitoria.com.br gaz.com.br tupi.fm bonde.com.br nsctotal.com.br opovo.com.br otempo.com.br zerohora.com.br gauchazh.clicrbs.com.br jovempan.com.br cbn.globoradio.globo.com mundopositivo.com.br noticiasaominuto.com.br poder360.com.br nexojornal.com.br intercept.com.br reporterbrasil.org.br oglobo.com`.split(/\s+/))
export const LIXO = /(director|directoy|ranks|posting|article|seo|backlink|toplist|topsite|listo|classified|bookmark|submit|webrank|siteprice|sitesimilar|similartech|websitedetection|woorank|securitytrails|all-aged|domains)/i
export const PLAT = new Set('goo.gl bit.ly ow.ly tinyurl.com is.gd linktr.ee pages.dev sakura.ne.jp home.pl secureserver.net hol.es esy.es blog.fc2.com geocities.ws oocities.org webnode.com.br atspace.com cba.pl tntcode.com apsoz.com kiuly.com pdfslide.net cupdf.com'.split(' '))
export const SUF_FALSO = /\.(app|dev|tec|ia|api|ong|social|seg|log|des|xyz)\.br$/

// Categorias que interessam, na ordem em que aparecem no relatorio.
export const CATS = ['govbr', 'edubr', 'assoc', 'coop', 'news', 'wiki', 'govx', 'edux']
export const NOME_CAT = { govbr: 'Governo (Brasil)', edubr: 'Educação (Brasil)', assoc: 'Associações', coop: 'Cooperativas', news: 'Portais de notícia', wiki: 'Wikipedia', govx: 'Governo (exterior)', edux: 'Educação (exterior)' }

// L = objeto { dominio: [ {dominio, da, ss, pages, nofollow, gov}, ... ] } vindo da fase 2 (analisar-lista-moz.mjs).
// A frequencia serve para descartar origens que apontam para 15 ou mais dominios da mesma lista (diretorio/PBN).
export function criarClassificador(L) {
  const freq = new Map()
  for (const lk of Object.values(L)) if (Array.isArray(lk)) for (const x of lk) freq.set(x.dominio, (freq.get(x.dominio) || 0) + 1)
  const lixo = (s) => !WIKI.test(s) && !NEWS.has(s) && (PLAT.has(s) || LIXO.test(s) || (freq.get(s) || 0) >= 15)
  return (s) => GOVBR.test(s) ? 'govbr' : EDUBR.test(s) ? 'edubr' : COOP.test(s) ? 'coop' : ASSOC.test(s) ? 'assoc' : WIKI.test(s) ? 'wiki' : NEWS.has(s) ? 'news' : GOVX.test(s) ? 'govx' : EDUX.test(s) ? 'edux' : lixo(s) ? 'lixo' : 'outro'
}

// Um link "passa autoridade" quando a origem tem pelo menos uma pagina com link sem nofollow para o dominio.
export const passaAutoridade = (x) => (+x.pages || 0) > (+x.nofollow || 0)

// Pesos por fonte de link: [passa autoridade, nofollow].
export const PESOS_NOTA = { govbr: [3, 1], edubr: [2.5, 0.8], assoc: [1, 0.3], coop: [1, 0.3], news: [1.2, 0.4], wiki: [0.6, 0.6], govx: [0.6, 0.2], edux: [0.4, 0.1] }

// Nota de compra de 0 a 10. Entrada:
//   fontes: [{c: categoria, f: 1 se passa autoridade, v: 0 se a Moz diz que o link sumiu (opcional)}], da, ss (spam), dominio, sig (sinal do Wayback), ix (paginas indexadas), lixo (fontes lixo no top 20)
// Devolve { nota, partes } para o relatorio mostrar como a nota foi montada.
export function notaCompra({ fontes = [], da = 0, ss = 0, dominio = '', sig = '', ix, lixo = 0 }) {
  let pts = 0, sumidos = 0
  for (const s of fontes) { const p = PESOS_NOTA[s.c]; if (!p) continue; if (s.v === 0) { sumidos++; continue } pts += s.f ? p[0] : p[1] }
  const partes = []
  const links = 6 * (1 - Math.exp(-pts / 12))
  partes.push(['Links de valor', links])
  if (sumidos) partes.push([sumidos + (sumidos === 1 ? ' fonte com link que sumiu (não conta)' : ' fontes com link que sumiu (não contam)'), 0])
  const daFalso = SUF_FALSO.test(dominio)
  partes.push([daFalso ? 'DA (falso, ignorado)' : 'DA', daFalso ? 0 : Math.min(2, da / 20)])
  const s = String(sig || '').toLowerCase()
  const hist = s.includes('longo') ? 1 : s.includes('curto') ? 0.3 : s.startsWith('sem') ? -1 : 0
  if (s) partes.push(['Histórico no Wayback', hist])
  if (ix > 0) partes.push(['Páginas indexadas', 0.5])
  if (ss >= 60) partes.push(['Spam alto', -4])
  else if (ss > 30) partes.push(['Spam acima de 30', -2])
  if (lixo >= 10) partes.push(['Muitos diretórios', -1])
  const total = partes.reduce((t, p) => t + p[1], 0)
  return { nota: Math.max(0, Math.min(10, Math.round(total * 10) / 10)), partes: partes.map(([a, b]) => [a, Math.round(b * 10) / 10]) }
}
