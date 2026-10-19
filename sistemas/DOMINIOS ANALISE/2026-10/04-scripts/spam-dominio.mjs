// Detector de dominio "gerado" (tecla batida ao acaso: asxzd, cixvxcxz, cqoipnxzm).
//
// Regra aprovada em 2026-09-12 sobre o lote do Registro.br: cai quem soma DOIS
// sinais independentes (poucas vogais, par de letras impossivel em portugues,
// excesso de k/w/x/z/q, sequencia longa de consoantes, "q" sem "u"). Sigla de
// associacao (brapec, abrhrs, cnpq) e sigla colada a palavra real
// (mndvtransportes, wzklogistica) passam: nome com trecho pronunciavel de 6+
// letras ou palavra comum de negocio e protegido.
//
// Uso: import { ehSpam } from './spam-dominio.mjs'; ehSpam('asxzd.com.br') → true

// Terminacoes em que a Moz nao reconhece o segundo nivel como sufixo publico e da
// a TODOS os dominios o DA do proprio sufixo (app.br = 79, dev.br = 75, tec.br = 57,
// ia.br = 48...). Autoridade falsa: nao entram na base nem na verificacao.
// Medido em 14/09/2026 sobre 25 mil dominios verificados: nesses sufixos o DA e
// identico em 100% dos dominios; nos demais (com.br, net.br, org.br, adv.br...) varia.
export const TLDS_FALSA_AUTORIDADE = ['app.br', 'dev.br', 'tec.br', 'ia.br', 'api.br', 'ong.br', 'social.br', 'seg.br', 'log.br', 'des.br', 'xyz.br', 'curitiba.br', 'riopreto.br', 'bib.br', 'manaus.br', 'maringa.br', 'campinagrande.br']
// Categorias que o Registro.br so libera com documento que a QMIX nao tem:
// org.br (entidade sem fins lucrativos), coop.br (cooperativa), g12/gov/mil/psi/am/fm,
// e as de profissional liberal com registro no conselho (adv=OAB, med=CRM, eng=CREA,
// arq=CAU, jor=MTb, psc=CRP, vet=CRMV, odo=CRO, bio=CRBio, ntr=CRN, not=cartorio).
// Nao adianta verificar: nao da para comprar. Regra do Anderson, 15/09/2026.
export const TLDS_RESTRITOS = ['org.br', 'coop.br', 'g12.br', 'gov.br', 'mil.br', 'psi.br', 'am.br', 'fm.br', 'adv.br', 'med.br', 'eng.br', 'arq.br', 'jor.br', 'psc.br', 'vet.br', 'odo.br', 'bio.br', 'ntr.br', 'not.br', 'jus.br', 'leg.br', 'def.br', 'cri.br', 'b.br']
export function tldBloqueado(dominio) {
  const d = String(dominio).toLowerCase()
  return [...TLDS_FALSA_AUTORIDADE, ...TLDS_RESTRITOS].some((t) => d.endsWith('.' + t))
}

const VOG = new Set('aeiouy')
const RARAS = new Set('kwxzq')
const HARD = new Set('xz zx kz zk jx xj jz zj jq qj kq qk wx xw xk kx qw wq vx xv zv vz vq qv jk kj vk kv wz zw wv vw jw wj'.split(' '))
const PALAVRAS = `brasil brazil sports sport script scripts tech web digital online shop store loja games game filmes films imoveis consult quimica drones rental world dream sheep transportes transporte logistica express group grupo solucoes servicos engenharia consultoria advocacia clinica odonto medic saude moda beleza <<REMOVIDO>> viagens festas eventos foto video music radio news blog apps cloud host code data marketing midia design arte studio estudio center centro plus prime smart easy fast mega super ultra king house home life style bike food burger pizza cafe doces bolos sabor gourmet brew wine vinho cerveja bet aposta bingo casino poker jogo kids baby escola curso ensino educa faculdade igreja missao evangel gospel cristo deus santo nossa senhora cidade bairro minas goias bahia parana ceara amazon norte campo serra praia terra agua vida amor obra construcao reforma pintura eletrica solar energia metal ferro madeira vidro papel plastico textil roupa joia otica relogio celular telecom informatica notebook seguranca alarme camera portao chaveiro limpeza lavanderia jardim piscina contabil juridico advogado imobiliaria corretor seguro credito financ banco invest cripto bitcoin forex trade consorcio emprestimo cartao pagamento delivery entrega motoboy frete mudanca guincho taxi aluguel locacao brasilia paulo rio santos lopes silva souza costa alves lima pereira oliveira rodrigues ferreira martins gomes ribeiro carvalho nunes dias barbosa castro rocha moura franquia franquias academia fitness dance dental odontologia veterinaria hotel pousada motel restaurante padaria mercado atacado varejo distribuidora industria fabrica grafica editora livraria papelaria farmacia drogaria laboratorio hospital petshop autopecas oficina mecanica funilaria lavajato estacionamento imobiliario arquitetura arquiteto interiores decor moveis colchoes eletro celulares acessorios cosmeticos perfumaria salao barbearia estetica tattoo sapataria confeccao uniformes bordados brindes embalagens tintas ferragens materiais eletricista encanador pedreiro marceneiro serralheria vidracaria climatizacao refrigeracao church club watts quiz stretch luiz joao jose maria pedro lucas mateus julia carlos marcos`
  .split(/\s+/).filter((p) => p.length >= 4)

const consRuns = (s) => (s.match(/[^aeiouy]+/g) || []).map((m) => m.length)

export function ehSpam(dominio) {
  const letras = String(dominio).toLowerCase().split('.')[0].replace(/[^a-z]/g, '')
  const n = letras.length
  if (n < 5) return false
  let vogais = 0, raras = 0, hard = 0
  for (let i = 0; i < n; i++) {
    if (VOG.has(letras[i])) vogais++
    if (RARAS.has(letras[i])) raras++
    if (i < n - 1 && HARD.has(letras.slice(i, i + 2))) hard++
  }
  hard += (letras.match(/q(?!u)/g) || []).length
  const vog = vogais / n
  const run = Math.max(0, ...consRuns(letras))

  const sinais = []
  let forte = 0
  if (vog === 0) { sinais.push('semvogal'); forte++ }
  else if (vog <= 0.2 && (n >= 6 || raras >= 2)) { sinais.push('vog'); forte++ }
  if (hard >= 1) sinais.push('hard')
  if (hard >= 2) sinais.push('hard+')
  if (raras >= 3) { sinais.push('raras'); forte++ }
  if (run >= 6) { sinais.push('cons'); forte++ }
  if (sinais.length < 2) return false
  if (n >= 12 && !forte) return false
  if (n >= 13 && !(vog <= 0.2 && (raras >= 3 || run >= 6))) return false
  if (PALAVRAS.some((p) => letras.includes(p))) return false
  for (let i = 0; i <= n - 6; i++) {
    const tr = letras.slice(i, i + 6)
    const v = [...tr].filter((c) => VOG.has(c)).length
    const temRara = [...tr].some((c) => RARAS.has(c))
    if (v >= 2 && !temRara && Math.max(0, ...consRuns(tr)) <= 3) return false
  }
  return true
}
