// Filtro de nome e sufixo da lista de liberacao do Registro.br.
// Uso: node funil-filtros.mjs <lista-processo-liberacao.txt> <saida-01-apos-filtros.txt>
// Descarta: sufixos de autoridade falsa, categorias restritas, nome gerado ao acaso, nome com 25+ letras.
import { readFileSync, writeFileSync } from 'node:fs'
import { ehSpam, TLDS_FALSA_AUTORIDADE as F, TLDS_RESTRITOS as R } from './spam-dominio.mjs'

const [, , ent, sai] = process.argv
if (!ent || !sai) { console.error('uso: node funil-filtros.mjs lista.txt saida.txt'); process.exit(1) }
const L = readFileSync(ent, 'latin1').split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter((s) => s && !s.startsWith('#'))
const termina = (d, T) => T.some((t) => d.endsWith('.' + t))
const falsa = L.filter((d) => termina(d, F))
const restr = L.filter((d) => !termina(d, F) && termina(d, R))
const r1 = L.filter((d) => !termina(d, F) && !termina(d, R))
const spam = r1.filter(ehSpam)
const r2 = r1.filter((d) => !ehSpam(d))
const longos = r2.filter((d) => d.split('.')[0].length >= 25)
const r3 = r2.filter((d) => d.split('.')[0].length < 25)
writeFileSync(sai, r3.join('\n'))
console.log({ total: L.length, sufixoFalso: falsa.length, restritos: restr.length, nomeSpam: spam.length, nomeLongo: longos.length, restante: r3.length })
