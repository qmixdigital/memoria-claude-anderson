/* Teste de interface: carrega index.html, icones.js, catalogo.js e app.js num
   DOM real (jsdom), com fetch apontando para o Worker local, e simula toques.

   Atenção: o jsdom não avalia CSS, então aqui só dá para conferir o atributo
   hidden e a árvore do DOM. Se o que importa é o que a tela realmente desenha,
   o teste certo é o tests/navegador.mjs, que roda num Chrome de verdade. */

import { JSDOM, VirtualConsole } from 'jsdom'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'public') + '/'
const BASE = 'http://127.0.0.1:8787'
let falhas = 0
const erros = []

function ok(cond, label, extra) {
  console.log((cond ? '  ok   ' : '  FALHA') + '  ' + label + (!cond && extra !== undefined ? '  ' + JSON.stringify(extra) : ''))
  if (!cond) falhas++
}

const vc = new VirtualConsole()
vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) erros.push('jsdom: ' + e.message) })
vc.on('error', (...a) => erros.push('console.error: ' + a.join(' ')))

const dom = new JSDOM(readFileSync(RAIZ + 'index.html', 'utf8'), {
  url: BASE + '/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc,
})
const { window } = dom
const doc = window.document

// Cookie jar manual: o jsdom não guarda cookies de fetch nativo.
let cookie = ''
window.fetch = async (url, opts = {}) => {
  const full = String(url).startsWith('http') ? String(url) : BASE + url
  const headers = { ...(opts.headers || {}) }
  if (cookie) headers.Cookie = cookie
  const res = await fetch(full, { ...opts, headers, redirect: 'follow' })
  for (const c of res.headers.getSetCookie?.() || [])
    if (c.startsWith('sid=')) cookie = c.split(';')[0]
  return res
}
Object.defineProperty(window, 'crypto', { value: globalThis.crypto, configurable: true })
window.navigator.vibrate = () => {}
Object.defineProperty(window.document, 'visibilityState', { get: () => 'visible' })
window.confirm = () => true
window.prompt = (msg, def) => (window.__prompts.length ? window.__prompts.shift() : def)
window.__prompts = []
// O beacon de diagnóstico usa Image, que o jsdom não dispara de verdade.
window.Image = function () { return { set src(v) {} } }

// Os três arquivos vão num eval só de propósito. Com 'use strict', cada eval
// cria um escopo próprio e o app.js não enxergaria as funções do icones.js.
// No navegador isso não acontece, porque as tags script dividem o global.
window.eval(
  ['icones.js', 'catalogo.js', 'app.js']
    .map((a) => readFileSync(RAIZ + a, 'utf8'))
    .join('\n;\n'),
)

const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const $ = (s) => doc.querySelector(s)
const $$ = (s) => [...doc.querySelectorAll(s)]
const visivel = (id) => !$(id).hidden
const clique = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
const enviar = (form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
const digitar = (el, v) => { el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })) }
const aba = (nome) => $$('.tab').find((t) => t.dataset.nav === nome)

async function ate(cond, ms = 10000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (cond()) return true
    await espera(50)
  }
  return false
}

console.log('\n[1] primeiro acesso')
ok(await ate(() => visivel('#screen-setup')), 'mostra a tela de primeiro acesso')
ok($$('#marca-setup svg').length === 1, 'a marca aparece na tela de entrada')
ok($$('#screen-setup .emoji-opt').length === 0, 'não existe mais seleção de emoji')
$('#setup-name').value = 'Anderson'
$('#setup-pin').value = '199899'
enviar($('#form-setup'))
ok(await ate(() => visivel('#screen-app')), 'PIN de seis dígitos é aceito no cadastro')

console.log('\n[2] painel de compras')
ok($('#view-title').textContent === 'Compras', 'abre no painel de compras')
ok(await ate(() => !!$('#resumo b')), 'resumo montado')
ok($('#view').textContent.includes('A lista está vazia'), 'estado vazio explica o que fazer')
ok($$('.tab').length === 4, 'quatro abas', $$('.tab').length)
ok($$('.tab svg').length === 4, 'cada aba tem ícone, sem emoji')

console.log('\n[3] catálogo de produtos')
clique(aba('adicionar'))
ok(await ate(() => $$('.cat-card').length === 13), 'treze categorias no catálogo', $$('.cat-card').length)
ok($$('.cat-card svg').length === 13, 'cada categoria com seu ícone')
const mercearia = $$('.cat-card').find((c) => c.textContent.includes('Mercearia'))
ok(!!mercearia, 'categoria Mercearia presente')
ok(/\d+ sugestões/.test(mercearia.textContent), 'mostra quantas sugestões existem', mercearia.textContent)

clique(mercearia)
ok(await ate(() => $$('.cat-item').length > 30), 'lista de produtos da categoria', $$('.cat-item').length)
const arroz = $$('.cat-item').find((i) => i.textContent.includes('Arroz branco'))
ok(!!arroz, 'produto Arroz branco no catálogo')
ok(arroz.getAttribute('aria-pressed') === 'false', 'começa desmarcado')
ok(arroz.textContent.includes('Incluir'), 'a linha diz o que o toque faz', arroz.textContent)

console.log('\n[4] marcar produtos com um toque')
clique(arroz)
ok(await ate(() => $$('.cat-item').find((i) => i.textContent.includes('Arroz branco')).getAttribute('aria-pressed') === 'true'),
  'um toque marca o produto')
ok(!$('#toast').hidden && $('#toast').textContent.includes('foi para a lista'),
  'confirma na tela que entrou na lista', $('#toast').textContent)
ok($$('.cat-item').find((i) => i.textContent.includes('Arroz branco')).textContent.includes('Na lista'),
  'a linha passa a mostrar Na lista')
const feijao = $$('.cat-item').find((i) => i.textContent.includes('Feijão carioca'))
clique(feijao)
await ate(() => $$('.cat-item').filter((i) => i.getAttribute('aria-pressed') === 'true').length === 2)
ok($$('.cat-item').filter((i) => i.getAttribute('aria-pressed') === 'true').length === 2, 'dois produtos marcados')

console.log('\n[4b] tocar de novo retira, e avisa')
const arrozNaLista = $$('.cat-item').find((i) => i.textContent.includes('Arroz branco'))
clique(arrozNaLista)
ok(await ate(() => $$('.cat-item').find((i) => i.textContent.includes('Arroz branco')).getAttribute('aria-pressed') === 'false'),
  'segundo toque retira da lista')
ok($('#toast').textContent.includes('saiu da lista'), 'avisa que saiu', $('#toast').textContent)
clique($$('.cat-item').find((i) => i.textContent.includes('Arroz branco')))
await ate(() => $$('.cat-item').find((i) => i.textContent.includes('Arroz branco')).getAttribute('aria-pressed') === 'true')

console.log('\n[5] busca no catálogo')
const buscaCat = $('#view input[type="search"]')
digitar(buscaCat, 'sabao')
ok(await ate(() => $$('.cat-item').length === 0 || !$('#view').textContent.includes('Arroz branco')),
  'busca filtra a lista da categoria')
digitar(buscaCat, '')
await ate(() => $$('.cat-item').length > 30)

console.log('\n[6] busca global por produto')
clique(aba('adicionar'))
const buscaGlobal = $('#view input[type="search"]')
digitar(buscaGlobal, 'desodorante')
ok(await ate(() => $$('.cat-item').length > 0), 'encontra produto de outra categoria')
ok($('#view').textContent.includes('Higiene Pessoal'), 'mostra a categoria do resultado', $('#view').textContent.slice(0, 80))
clique($$('.cat-item')[0])
ok(await ate(() => $$('.cat-item')[0].getAttribute('aria-pressed') === 'true'), 'marca direto pela busca global')

console.log('\n[7] o que foi marcado aparece no painel')
clique(aba('compras'))
ok(await ate(() => $$('.row').length === 3), 'os três itens marcados estão na lista', $$('.row').length)
ok($('#view').textContent.includes('Arroz branco'), 'item do catálogo listado')
ok(/às \d{2}:\d{2}/.test($('#view').textContent), 'mostra o horário de Brasília do item', $('.row .sub').textContent)
ok($$('.grupo').length === 2, 'agrupado por categoria', $$('.grupo').length)
ok($('#resumo b').textContent === '3', 'resumo conta os itens a comprar', $('#resumo b').textContent)
ok(!$('#compras-badge').hidden && $('#compras-badge').textContent === '3', 'aba mostra o total pendente')

console.log('\n[8] comprando no mercado')
clique($('.row .check'))
ok(await ate(() => $$('.row.done').length === 1), 'marcar como pego risca o item')
ok(await ate(() => $('#view').textContent.includes('No carrinho (1)')), 'item vai para o carrinho')
ok($('#resumo b').textContent === '2', 'resumo desconta o item pego', $('#resumo b').textContent)
clique($('.section-head .link-btn'))
ok(await ate(() => $$('.row.done').length === 0), 'limpar tira os pegos da lista')
ok(await ate(() => $$('.row').length === 2), 'sobram os pendentes', $$('.row').length)

console.log('\n[9] anotar item rápido no painel')
const rapido = $('#view input.name')
rapido.value = 'Fermento biológico'
enviar($('#view form.add-row'))
ok(await ate(() => $('#view').textContent.includes('Fermento biológico')), 'item digitado entra na lista')
ok(await ate(() => $$('.row').length === 3), 'três itens pendentes', $$('.row').length)

console.log('\n[10] excluir enquanto compra')
clique($('.row .del'))
ok(await ate(() => $$('.row').length === 2), 'exclusão some da tela')

console.log('\n[11] tarefas')
clique(aba('tarefas'))
ok($('#view-title').textContent === 'Tarefas', 'abre tarefas')
$('#view input.name').value = 'Marcar consulta'
$('#view input[type="date"]').value = '2020-01-01'
enviar($('#view form'))
ok(await ate(() => $$('.row').length === 1), 'tarefa criada')
ok($('.row').classList.contains('overdue'), 'tarefa vencida destacada')
ok(!$('#tasks-badge').hidden, 'badge de tarefas')
clique($('.row .check'))
ok(await ate(() => $('.row').classList.contains('done')), 'tarefa concluída')

console.log('\n[12] ajustes, membros e avatar por inicial')
clique(aba('ajustes'))
ok($('#view').textContent.includes('admin'), 'marca o administrador')
ok($$('#view .avatar').length >= 2, 'membros usam avatar de inicial')
ok($('#view .avatar').textContent === 'A', 'inicial correta para Anderson', $('#view .avatar').textContent)
window.__prompts = ['Divina', '199899']
clique($$('#view .btn.ghost.block').find((b) => b.textContent.includes('Adicionar membro')))
ok(await ate(() => $('#view').textContent.includes('Divina')), 'membro novo com PIN de seis dígitos')

console.log('\n[13] sincronização entre aparelhos')
const dados = await (await window.fetch('/api/sync')).json()
const catId = dados.categories.find((c) => c.name === 'Bebidas').id
await window.fetch('/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ category_id: catId, name: 'Café do outro celular' }),
})
clique(aba('compras'))
ok(await ate(() => $('#view').textContent.includes('Café do outro celular'), 12000), 'item de outro aparelho chega pelo polling')

console.log('\n[14] sessão com PIN de seis dígitos')
clique(aba('ajustes'))
clique($$('#view .btn.ghost.block').find((b) => b.textContent.includes('Sair do aplicativo')))
ok(await ate(() => visivel('#screen-login')), 'logout leva para o login')
ok(await ate(() => $$('.member-btn').length === 2), 'login lista os membros', $$('.member-btn').length)
ok($$('.member-btn .avatar').length === 2, 'login usa avatar de inicial')
clique($$('.member-btn').find((b) => b.textContent.includes('Anderson')))
ok(!$('#login-pin').hidden, 'teclado de PIN aparece')
ok($$('#keypad button').length === 12, 'teclado com dígitos, apagar e entrar', $$('#keypad button').length)
ok($('#pin-entrar').disabled === true, 'botão Entrar começa desabilitado')
for (const d of ['1', '9', '9', '8', '9', '9']) clique($$('#keypad button').find((b) => b.textContent === d))
ok($$('#pin-dots i.on').length === 6, 'aceita seis dígitos no teclado', $$('#pin-dots i.on').length)
ok($('#pin-entrar').disabled === false, 'botão Entrar libera com o PIN completo')
ok($('#pin-dica').textContent.includes('Entrar'), 'a tela avisa que precisa confirmar', $('#pin-dica').textContent)
clique($('#pin-entrar'))
ok(await ate(() => visivel('#screen-app')), 'entra com o PIN de seis dígitos')
ok(await ate(() => $$('.row').length >= 3), 'estado recarregado depois do login', $$('.row').length)

console.log('\n[15] erros de execução')
ok(erros.length === 0, 'nenhum erro de JavaScript durante o teste', erros)

console.log('\n' + (falhas ? falhas + ' FALHA(S)' : 'interface aprovada em todos os testes'))
process.exit(falhas ? 1 : 0)
