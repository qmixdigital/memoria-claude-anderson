/* Lista da Família
   JavaScript puro, sem framework e sem bundler.
   Sincronização por marca de tempo em /api/sync, intervalo adaptativo e
   interface otimista. Depende de icones.js e catalogo.js, carregados antes. */

'use strict'

/* Relato de falhas para o servidor. Só dispara quando algo dá errado, então
   não gera escrita no banco em carregamento normal. */
function diag(marca, detalhe) {
  try {
    new Image().src =
      '/api/diag/' + marca + '?t=' + Date.now() +
      (detalhe ? '&m=' + encodeURIComponent(String(detalhe).slice(0, 150)) : '')
  } catch (e) {}
}

window.addEventListener('error', (ev) => {
  diag('erro-js', (ev.message || '') + ' @ linha ' + (ev.lineno || '?'))
})
window.addEventListener('unhandledrejection', (ev) => {
  diag('promessa-rejeitada', (ev.reason && ev.reason.message) || ev.reason)
})

/* Trava contra par incompatível: a borda da Cloudflare leva um tempo para
   propagar arquivos novos e o navegador pode juntar um index.html de uma
   versão com este arquivo de outra. Quando as versões não batem, limpa tudo
   e recarrega uma única vez, em vez de morrer em silêncio. */
const APP_VERSION = '16'

async function limparERecarregar(motivo) {
  diag('versao-incompativel', motivo)
  try {
    if (window.caches) {
      const nomes = await caches.keys()
      await Promise.all(nomes.map((n) => caches.delete(n)))
    }
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch (e) {}
  window.location.reload()
}

const versaoHtml = document.body && document.body.getAttribute('data-app')
if (versaoHtml !== APP_VERSION) {
  let jaTentou = false
  try {
    jaTentou = sessionStorage.getItem('recarga-versao') === APP_VERSION
    sessionStorage.setItem('recarga-versao', APP_VERSION)
  } catch (e) {}
  if (!jaTentou) limparERecarregar('html=' + versaoHtml + ' js=' + APP_VERSION)
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel)

/** Cria elemento: h('div.classe', {attr}, filhos) */
function h(tag, props, ...kids) {
  const [name, ...classes] = String(tag).split('.')
  const node = document.createElement(name || 'div')
  if (classes.length) node.className = classes.join(' ')
  if (props && (typeof props !== 'object' || Array.isArray(props) || props instanceof Node)) {
    kids.unshift(props)
    props = null
  }
  for (const k in props || {}) {
    const v = props[k]
    if (v === null || v === undefined || v === false) continue
    if (k === 'text') node.textContent = v
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v)
    else if (k === 'class') node.className += ' ' + v
    else node.setAttribute(k, v === true ? '' : v)
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)))
  }
  return node
}

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
        const r = (Math.random() * 16) | 0
        return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

let toastTimer
function toast(msg) {
  const box = $('#toast')
  box.textContent = msg
  box.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (box.hidden = true), 3200)
}

/** Iniciais do nome, usadas no lugar de emoji. */
function iniciais(nome) {
  const partes = String(nome || '?').trim().split(/\s+/)
  const a = partes[0] ? partes[0][0] : '?'
  const b = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (a + b).toUpperCase()
}

function avatar(membro, tamanho) {
  const classe = 'avatar' + (tamanho ? ' ' + tamanho : '')
  if (membro && membro.photo)
    return h('img', { class: classe + ' foto', src: membro.photo, alt: '', loading: 'lazy' })
  return h('span', { class: classe, text: iniciais(membro && membro.name) })
}

/**
 * Reduz a imagem no próprio aparelho antes de enviar: recorte quadrado do
 * centro, 192px e WebP. Sai perto de 10KB, o que cabe no D1 e viaja junto da
 * sincronização que já existe, sem precisar de armazenamento separado.
 */
/** Carrega a imagem escolhida, com caminho alternativo para Safari antigo,
    que não tem createImageBitmap. */
async function carregarImagem(arquivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
    } catch (e) {
      try {
        return await createImageBitmap(arquivo)
      } catch (e2) {}
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não consegui ler essa imagem.'))
    }
    img.src = url
  })
}

async function reduzirImagem(arquivo, lado) {
  lado = lado || 192
  const bmp = await carregarImagem(arquivo)
  bmp.width = bmp.width || bmp.naturalWidth
  bmp.height = bmp.height || bmp.naturalHeight
  const menor = Math.min(bmp.width, bmp.height)
  const sx = (bmp.width - menor) / 2
  const sy = (bmp.height - menor) / 2
  const tela = document.createElement('canvas')
  tela.width = lado
  tela.height = lado
  const ctx = tela.getContext('2d')
  ctx.drawImage(bmp, sx, sy, menor, menor, 0, 0, lado, lado)
  let url = tela.toDataURL('image/webp', 0.82)
  // Navegador sem WebP cai para JPEG, que todos aceitam.
  if (url.indexOf('data:image/webp') !== 0) url = tela.toDataURL('image/jpeg', 0.82)
  return url
}

function escolherFoto() {
  const entrada = document.createElement('input')
  entrada.type = 'file'
  entrada.accept = 'image/*'
  entrada.onchange = async () => {
    const arquivo = entrada.files && entrada.files[0]
    if (!arquivo) return
    try {
      const foto = await reduzirImagem(arquivo)
      await api('/members/' + state.me.id, { method: 'PATCH', body: { photo: foto } })
      state.me.photo = foto
      if (state.members[state.me.id]) state.members[state.me.id].photo = foto
      save()
      refresh()
      toast('Foto atualizada.')
    } catch (e) {
      toast(e.message || 'Não consegui usar essa imagem.')
    }
  }
  entrada.click()
}

async function removerFoto() {
  try {
    await api('/members/' + state.me.id, { method: 'PATCH', body: { photo: '' } })
    state.me.photo = null
    if (state.members[state.me.id]) state.members[state.me.id].photo = null
    save()
    refresh()
    toast('Foto removida.')
  } catch (e) {
    toast(e.message)
  }
}

/** Data de hoje no fuso de Brasília, no formato AAAA-MM-DD. */
const TZ = 'America/Sao_Paulo'
const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date())

/* Todo horário mostrado usa o fuso de Brasília, e não o do aparelho. Assim
   quem estiver viajando, ou com o relógio do celular em outro fuso, continua
   vendo a mesma hora que o resto da família. */
const fmtHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ, hour: '2-digit', minute: '2-digit',
})
const fmtDiaHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
})

/** "as 14:32" quando e de hoje, "11/08 as 09:10" quando e de outro dia. */
function quando(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const dia = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
  return dia === todayISO()
    ? 'às ' + fmtHora.format(d)
    : fmtDiaHora.format(d).replace(', ', ' às ')
}

function humanDate(iso) {
  if (!iso) return ''
  const today = todayISO()
  if (iso === today) return 'Hoje'
  const t = new Date(today + 'T12:00:00')
  const d = new Date(iso + 'T12:00:00')
  const diff = Math.round((d - t) / 86400000)
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  const [, m, dd] = iso.split('-')
  const label = `${dd}/${m}`
  return diff < 0 ? `Atrasada, ${label}` : label
}

const ICONES_CATEGORIA = [
  'carrinho', 'fruta', 'carne', 'leite', 'pao', 'bebida', 'gelo',
  'limpeza', 'higiene', 'remedio', 'pet', 'casa', 'viagem', 'caixa',
]

/* ------------------------------------------------------------------ */
/* Camada de rede                                                      */
/* ------------------------------------------------------------------ */

let online = navigator.onLine

function setOnline(v) {
  if (online === v) return
  online = v
  $('#offline').hidden = v
}

const TIMEOUT_MS = 12000

async function api(path, options = {}) {
  let res
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null
  const prazo = setTimeout(() => ctrl && ctrl.abort(), options.timeout || TIMEOUT_MS)
  try {
    res = await fetch('/api' + path, {
      method: options.method || 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined,
    })
  } catch (e) {
    setOnline(false)
    throw new Error(
      e && e.name === 'AbortError'
        ? 'O servidor demorou demais para responder.'
        : 'Sem conexão com o servidor.',
    )
  } finally {
    clearTimeout(prazo)
  }
  setOnline(true)

  if (res.status === 401 && !options.allow401) {
    state.me = null
    save()
    showLogin()
    throw new Error('Sessão expirada.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Não foi possível concluir.')
  return data
}

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

const state = {
  me: null,
  categories: {},
  items: {},
  tasks: {},
  members: {},
  frequents: {},
  lastSync: null,
  view: { name: 'compras' },
}

const pending = new Set()
const STORAGE = 'lista-familia-v2'

function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({
      me: state.me, categories: state.categories, items: state.items,
      tasks: state.tasks, members: state.members, frequents: state.frequents,
      lastSync: state.lastSync,
    }))
  } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return
    Object.assign(state, JSON.parse(raw))
  } catch (e) {}
}

function clearCache() {
  try { localStorage.removeItem(STORAGE) } catch (e) {}
  state.me = null
  state.categories = {}
  state.items = {}
  state.tasks = {}
  state.members = {}
  state.frequents = {}
  state.lastSync = null
}

/* ------------------------------------------------------------------ */
/* Sincronização                                                       */
/* ------------------------------------------------------------------ */

function mergeInto(map, rows, full) {
  let changed = false
  if (full) {
    for (const k in map) delete map[k]
    changed = true
  }
  for (const row of rows) {
    if (pending.has(row.id)) continue
    if (row.deleted_at || row.active === 0) {
      if (map[row.id]) { delete map[row.id]; changed = true }
      continue
    }
    const old = map[row.id]
    if (!old || old.updated_at !== row.updated_at) changed = true
    map[row.id] = row
  }
  return changed
}

let syncing = false

async function sync() {
  if (syncing || !state.me) return false
  syncing = true
  $('#sync-dot').classList.add('busy')
  try {
    const qs = state.lastSync ? '?since=' + encodeURIComponent(state.lastSync) : ''
    const data = await api('/sync' + qs)
    const full = data.full
    let changed = false
    changed = mergeInto(state.categories, data.categories, full) || changed
    changed = mergeInto(state.items, data.items, full) || changed
    changed = mergeInto(state.tasks, data.tasks, full) || changed
    changed = mergeInto(state.members, data.members, full) || changed
    changed = mergeInto(state.frequents, data.frequents, full) || changed
    state.lastSync = data.now
    save()
    $('#sync-dot').classList.remove('err')
    if (changed) refresh()
    return changed
  } catch (e) {
    $('#sync-dot').classList.add('err')
    return false
  } finally {
    syncing = false
    $('#sync-dot').classList.remove('busy')
  }
}

/* Intervalo adaptativo: 5s enquanto há movimento, subindo até 30s quando nada
   muda, e pausa depois de 5 minutos sem toque. Mantém o consumo diário muito
   abaixo da cota gratuita. */
const ACTIVE_MS = 5000
const SLOW_MS = 15000
const IDLE_MS = 30000
const SLEEP_AFTER_MS = 5 * 60 * 1000

let quietRounds = 0
let lastTouch = Date.now()
let timer = null

function nextDelay() {
  if (quietRounds > 6) return IDLE_MS
  if (quietRounds > 3) return SLOW_MS
  return ACTIVE_MS
}

function scheduleSync(delay) {
  clearTimeout(timer)
  timer = setTimeout(tick, delay === undefined ? nextDelay() : delay)
}

async function tick() {
  if (!state.me) return
  const asleep = document.visibilityState !== 'visible' || Date.now() - lastTouch > SLEEP_AFTER_MS
  if (asleep) return scheduleSync(IDLE_MS)
  const changed = await sync()
  quietRounds = changed ? 0 : quietRounds + 1
  scheduleSync()
}

function wake(immediate) {
  lastTouch = Date.now()
  quietRounds = 0
  if (immediate) scheduleSync(0)
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') wake(true)
})
window.addEventListener('online', () => { setOnline(true); wake(true) })
window.addEventListener('offline', () => setOnline(false))
for (const ev of ['pointerdown', 'keydown']) {
  window.addEventListener(ev, () => wake(false), { passive: true })
}

/* ------------------------------------------------------------------ */
/* Mutações otimistas                                                  */
/* ------------------------------------------------------------------ */

const tombstones = new Set()
const chains = new Map()
const chainOf = (id) => chains.get(id) || Promise.resolve()
const chainAll = (ids) => Promise.all(ids.map(chainOf))

function mutate(map, id, optimistic, request, opts = {}) {
  if (!online) {
    toast('Sem conexão. Tente de novo quando a rede voltar.')
    return Promise.resolve()
  }
  const before = map[id] ? { ...map[id] } : null
  if (opts.tombstone) tombstones.add(id)
  optimistic()
  pending.add(id)
  refresh()

  const task = chainOf(id).then(async () => {
    try {
      const row = await request()
      if (tombstones.has(id)) delete map[id]
      else if (row && row.id) {
        // O servidor pode responder com outro registro, por exemplo quando
        // descobre que o item ja existia e devolve o que estava la.
        if (row.id !== id) delete map[id]
        map[row.id] = row
      } else if (!map[id] && before) map[id] = before
      save()
    } catch (e) {
      if (opts.tombstone) tombstones.delete(id)
      if (before) map[id] = before
      else delete map[id]
      toast(e.message)
    } finally {
      pending.delete(id)
      if (chains.get(id) === task) chains.delete(id)
      refresh()
      wake(false)
    }
  })

  chains.set(id, task)
  return task
}

/* ------------------------------------------------------------------ */
/* Seletores derivados                                                 */
/* ------------------------------------------------------------------ */

const categoriasOrdenadas = () =>
  Object.values(state.categories).sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'pt-BR'),
  )

const itensDe = (categoryId) => Object.values(state.items).filter((i) => i.category_id === categoryId)
const pendentesDe = (categoryId) => itensDe(categoryId).filter((i) => !i.done)
const todosPendentes = () => Object.values(state.items).filter((i) => !i.done)
const todosComprados = () => Object.values(state.items).filter((i) => i.done)

const frequentesDe = (categoryId) =>
  Object.values(state.frequents)
    .filter((f) => f.category_id === categoryId)
    .sort((a, b) => b.times_used - a.times_used || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 10)

const membroDe = (id) => (id ? state.members[id] : null)

/** Item pendente com esse nome na categoria, para o marcador do catálogo. */
function itemPendentePorNome(categoryId, nome) {
  const alvo = normalizar(nome)
  return pendentesDe(categoryId).find((i) => normalizar(i.name) === alvo) || null
}

function tarefasOrdenadas() {
  const today = todayISO()
  const rank = (t) => {
    if (t.done) return 4
    if (!t.due_date) return 3
    if (t.due_date < today) return 0
    if (t.due_date === today) return 1
    return 2
  }
  return Object.values(state.tasks).sort((a, b) => {
    const ra = rank(a), rb = rank(b)
    if (ra !== rb) return ra - rb
    if (a.due_date && b.due_date && a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1
    return (a.created_at || '') < (b.created_at || '') ? -1 : 1
  })
}

const tarefasAbertas = () => Object.values(state.tasks).filter((t) => !t.done).length

/* ------------------------------------------------------------------ */
/* Telas de autenticação                                               */
/* ------------------------------------------------------------------ */

function showScreen(id) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id
}

function montarMarca(alvo) {
  const box = $(alvo)
  if (!box || box.dataset.pronto) return
  box.dataset.pronto = '1'
  box.append(
    logo(42),
    h('span.marca-texto', {}, h('b', { text: 'Lista da' }), h('span', { text: 'Família' })),
  )
}

function showSetup() {
  showScreen('screen-setup')
  montarMarca('#marca-setup')
  $('#form-setup').onsubmit = async (ev) => {
    ev.preventDefault()
    const err = $('#setup-error')
    err.hidden = true
    try {
      await api('/setup', {
        method: 'POST',
        body: { name: $('#setup-name').value, pin: $('#setup-pin').value },
      })
      await enterApp()
    } catch (e) {
      err.textContent = e.message
      err.hidden = false
    }
  }
}

/* ---- login ---- */

const PIN_MIN = 4
const PIN_MAX = 8
let loginMemberId = null
let pinBuffer = ''

function showLogin(members) {
  showScreen('screen-login')
  montarMarca('#marca-login')
  $('#login-error').hidden = true
  loginMemberId = null
  pinBuffer = ''
  $('#login-pin').hidden = true
  $('#login-title').textContent = 'Quem está usando?'

  const grid = $('#login-members')
  grid.hidden = false
  grid.innerHTML = ''

  const list = members || Object.values(state.members)
  if (!list.length) {
    api('/status', { allow401: true })
      .then((s) => (s.needs_setup ? showSetup() : showLogin(s.members)))
      .catch(() => toast('Não foi possível carregar os membros.'))
    return
  }

  for (const m of list) {
    grid.append(
      h('button.member-btn', { type: 'button', onclick: () => pickMember(m) },
        avatar(m), h('span', { text: m.name })),
    )
  }
}

function pickMember(m) {
  loginMemberId = m.id
  pinBuffer = ''
  $('#login-members').hidden = true
  $('#login-pin').hidden = false
  $('#login-title').textContent = m.name
  $('#login-error').hidden = true
  buildKeypad()
  renderDots()
}

function renderDots() {
  const box = $('#pin-dots')
  box.innerHTML = ''
  const total = Math.max(PIN_MIN, pinBuffer.length)
  for (let i = 0; i < total; i++) box.append(h('i', { class: i < pinBuffer.length ? 'on' : '' }))
  const entrar = $('#pin-entrar')
  if (entrar) entrar.disabled = pinBuffer.length < PIN_MIN
  const dica = $('#pin-dica')
  if (dica) {
    dica.textContent = pinBuffer.length < PIN_MIN
      ? `Digite sua senha, de ${PIN_MIN} a ${PIN_MAX} dígitos`
      : 'Toque em Entrar para continuar'
  }
}

function buildKeypad() {
  const pad = $('#keypad')
  if (pad.dataset.ready) return
  pad.dataset.ready = '1'
  for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
    pad.append(h('button', { type: 'button', text: k, onclick: () => pressKey(k) }))
  }
  pad.append(h('button.acao', { type: 'button', 'aria-label': 'Apagar', onclick: () => pressKey('apagar') }, icone('voltar', 22)))
  pad.append(h('button', { type: 'button', text: '0', onclick: () => pressKey('0') }))
  pad.append(h('button.acao.confirmar', { type: 'button', 'aria-label': 'Entrar', onclick: () => submitPin() }, icone('check', 24)))
  $('#pin-entrar').onclick = () => submitPin()
  $('#pin-cancel').onclick = () => showLogin()
}

function pressKey(k) {
  if (k === 'apagar') {
    pinBuffer = pinBuffer.slice(0, -1)
    return renderDots()
  }
  if (pinBuffer.length >= PIN_MAX) return
  pinBuffer += k
  renderDots()
}

// No computador o teclado físico também funciona.
window.addEventListener('keydown', (ev) => {
  if ($('#screen-login').hidden || $('#login-pin').hidden) return
  if (ev.key >= '0' && ev.key <= '9') { pressKey(ev.key); ev.preventDefault() }
  else if (ev.key === 'Backspace') { pressKey('apagar'); ev.preventDefault() }
  else if (ev.key === 'Enter') { submitPin(); ev.preventDefault() }
})

async function submitPin() {
  const err = $('#login-error')
  err.hidden = true
  if (pinBuffer.length < PIN_MIN) {
    err.textContent = `A senha tem de ${PIN_MIN} a ${PIN_MAX} dígitos.`
    err.hidden = false
    return
  }
  try {
    await api('/login', { method: 'POST', body: { member_id: loginMemberId, pin: pinBuffer }, allow401: true })
    clearCache()
    await enterApp()
  } catch (e) {
    pinBuffer = ''
    renderDots()
    err.textContent = e.message
    err.hidden = false
    if (navigator.vibrate) navigator.vibrate(120)
  }
}

/* ------------------------------------------------------------------ */
/* Aplicativo                                                          */
/* ------------------------------------------------------------------ */

async function enterApp() {
  state.me = await api('/me')
  showScreen('screen-app')
  go('compras')
  await sync()
  wake(false)
  scheduleSync()
}

function go(name, params) {
  state.view = Object.assign({ name }, params || {})
  for (const tab of document.querySelectorAll('.tab')) {
    const ativo =
      tab.dataset.nav === name ||
      (name === 'catalogo' && tab.dataset.nav === 'adicionar')
    tab.setAttribute('aria-selected', ativo ? 'true' : 'false')
  }
  $('#btn-back').hidden = name !== 'catalogo'
  const view = $('#view')
  view.innerHTML = ''
  window.scrollTo(0, 0)
  VIEWS[name].mount(view)
  refresh()
}

function refresh() {
  const v = VIEWS[state.view.name]
  if (v && v.update) v.update()

  const bt = $('#tasks-badge')
  const nt = tarefasAbertas()
  bt.hidden = nt === 0
  bt.textContent = nt > 99 ? '99' : String(nt)

  const bc = $('#compras-badge')
  const nc = todosPendentes().length
  bc.hidden = nc === 0
  bc.textContent = nc > 99 ? '99' : String(nc)
}

const VIEWS = {}

/* ---------------------- painel de compras ------------------------- */

VIEWS.compras = {
  mount(root) {
    $('#view-title').textContent = 'Compras'

    const nome = h('input.name', {
      type: 'text', placeholder: 'Anotar item rápido', maxlength: '120',
      'aria-label': 'Nome do item', autocomplete: 'off',
    })
    const sel = h('select.cat', { 'aria-label': 'Categoria' })

    const enviar = () => {
      const valor = nome.value.trim()
      if (!valor) return
      if (!sel.value) return toast('Crie uma categoria primeiro.')
      addItem(sel.value, valor, '')
      nome.value = ''
      nome.focus()
    }

    root.append(
      h('div.resumo', { id: 'resumo' }),
      h('form.add-row', { style: 'margin-top:14px', onsubmit: (e) => { e.preventDefault(); enviar() } },
        nome, sel,
        h('button.btn.primary', { type: 'submit', 'aria-label': 'Adicionar' }, icone('mais', 22)),
      ),
      h('div', { id: 'compras-lista' }),
    )
    this.sel = sel
  },

  update() {
    const sel = this.sel
    if (sel) {
      const manter = sel.value
      sel.innerHTML = ''
      for (const c of categoriasOrdenadas()) sel.append(h('option', { value: c.id, text: c.name }))
      if (manter) sel.value = manter
    }

    const pendentes = todosPendentes()
    const comprados = todosComprados()
    const comItens = categoriasOrdenadas().filter((c) => pendentesDe(c.id).length).length

    const resumo = $('#resumo')
    resumo.innerHTML = ''
    resumo.append(
      h('div', {}, h('b', { text: String(pendentes.length) }), h('span', { text: 'a comprar' })),
      h('div', {}, h('b', { text: String(comItens) }), h('span', { text: 'categorias' })),
      h('div', {}, h('b', { text: String(comprados.length) }), h('span', { text: 'no carrinho' })),
    )

    const box = $('#compras-lista')
    box.innerHTML = ''

    if (!pendentes.length && !comprados.length) {
      box.append(
        h('div.empty', {},
          h('span.ic', {}, icone('sacola', 44)),
          h('div', { text: 'A lista está vazia.' }),
          h('div.muted', { text: 'Use a aba Adicionar para marcar produtos.' }),
          h('button.btn.primary.block', { type: 'button', style: 'max-width:280px;margin:18px auto 0', onclick: () => go('adicionar') }, 'Escolher produtos'),
        ),
      )
      return
    }

    for (const cat of categoriasOrdenadas()) {
      const itens = pendentesDe(cat.id)
      if (!itens.length) continue
      box.append(
        h('div.grupo', {},
          h('div.grupo-head', {},
            h('span.ic', {}, icone(cat.icon || 'caixa', 20)),
            h('h2', { text: cat.name }),
            h('span.qt', { text: itens.length + (itens.length === 1 ? ' item' : ' itens') }),
          ),
          h('ul.list', {}, itens
            .sort((a, b) => ((a.created_at || '') < (b.created_at || '') ? -1 : 1))
            .map(linhaItem)),
        ),
      )
    }

    if (comprados.length) {
      box.append(
        h('div.section-head', {},
          h('h2', { text: `No carrinho (${comprados.length})` }),
          h('button.link-btn', { type: 'button', onclick: () => limparComprados(comprados) },
            icone('lixeira', 16), 'Limpar'),
        ),
        h('ul.list', {}, comprados
          .sort((a, b) => ((b.done_at || '') < (a.done_at || '') ? -1 : 1))
          .map(linhaItem)),
      )
    }
  },
}

function linhaItem(item) {
  const quem = membroDe(item.done ? item.done_by : item.added_by)
  const sub = []
  if (item.quantity) sub.push(h('span.qty-tag', { text: item.quantity }))
  if (item.note) sub.push(h('span', { text: item.note }))
  if (quem) sub.push(h('span', { style: 'display:inline-flex;align-items:center;gap:5px' }, avatar(quem, 'xs'), quem.name))
  const horario = quando(item.done ? item.done_at : item.created_at)
  if (horario) sub.push(h('span', { text: horario }))

  const cls = ['row']
  if (item.done) cls.push('done')
  if (pending.has(item.id)) cls.push('pending')

  return h('li', { class: cls.join(' ') },
    h('button.check', {
      type: 'button',
      'aria-label': item.done ? 'Devolver ' + item.name + ' para a lista' : 'Marcar ' + item.name + ' como pego',
      onclick: () => toggleItem(item),
    }, icone('check', 15)),
    h('div.main', { onclick: () => editItem(item) },
      h('div.nm', { text: item.name }),
      sub.length ? h('div.sub', {}, sub) : null),
    h('button.del', { type: 'button', 'aria-label': 'Excluir ' + item.name, onclick: () => deleteItem(item) },
      icone('lixeira', 17)),
  )
}

/* ------------------------- adicionar ------------------------------ */

VIEWS.adicionar = {
  mount(root) {
    $('#view-title').textContent = 'Adicionar'

    const busca = h('input', {
      type: 'search', placeholder: 'Buscar em ' + TOTAL_CATALOGO + ' produtos',
      'aria-label': 'Buscar produto', autocomplete: 'off',
      oninput: () => this.update(),
    })

    root.append(
      h('div.busca-wrap', {}, h('span.lupa', {}, icone('busca', 18)), busca),
      h('div', { id: 'adicionar-corpo' }),
    )
    this.busca = busca
  },

  update() {
    const corpo = $('#adicionar-corpo')
    if (!corpo) return
    const termo = normalizar(this.busca ? this.busca.value : '')
    corpo.innerHTML = ''

    if (termo.length >= 2) {
      const achados = []
      for (const cat of categoriasOrdenadas()) {
        for (const nome of CATALOGO[cat.catalog] || []) {
          if (normalizar(nome).includes(termo)) achados.push({ cat, nome })
        }
      }
      if (!achados.length) {
        const bruto = this.busca.value.trim()
        corpo.append(
          h('div.empty', {},
            h('span.ic', {}, icone('busca', 40)),
            h('div', { text: 'Nada encontrado no catálogo.' }),
            h('div.muted', { text: 'Você pode adicionar como item novo.' }),
          ),
        )
        const cats = categoriasOrdenadas()
        if (bruto && cats.length) {
          corpo.append(h('button.btn.primary.block', {
            type: 'button',
            onclick: () => { addItem(cats[0].id, bruto, ''); this.busca.value = ''; this.update(); toast(bruto + ' foi para ' + cats[0].name) },
          }, 'Adicionar "' + bruto + '"'))
        }
        return
      }
      corpo.append(h('div.catalogo', {}, achados.slice(0, 80).map(({ cat, nome }) => itemCatalogo(cat, nome, true))))
      return
    }

    const grid = h('div.cat-grid')
    for (const cat of categoriasOrdenadas()) {
      const abertos = pendentesDe(cat.id).length
      grid.append(
        h('button', {
          class: 'cat-card' + (abertos ? ' tem' : ''),
          type: 'button',
          onclick: () => go('catalogo', { categoryId: cat.id }),
        },
          h('span.ic', {}, icone(cat.icon || 'caixa', 26)),
          h('span.nm', { text: cat.name }),
          h('span.ct', {}, abertos
            ? [h('b', { text: String(abertos) }), abertos === 1 ? ' na lista' : ' na lista']
            : (CATALOGO[cat.catalog] || []).length + ' sugestões'),
        ),
      )
    }
    corpo.append(grid)
  },
}

/* ------------------------- catálogo ------------------------------- */

VIEWS.catalogo = {
  mount(root) {
    const cat = state.categories[state.view.categoryId]
    if (!cat) return go('adicionar')
    $('#view-title').textContent = cat.name

    const nome = h('input.name', {
      type: 'text', placeholder: 'Item que não está na lista', maxlength: '120',
      'aria-label': 'Nome do item', autocomplete: 'off',
    })
    const qtd = h('input.qty', {
      type: 'text', placeholder: 'Qtd', maxlength: '40',
      'aria-label': 'Quantidade, opcional', autocomplete: 'off',
    })
    const enviar = () => {
      const valor = nome.value.trim()
      if (!valor) return
      addItem(cat.id, valor, qtd.value.trim())
      nome.value = ''
      qtd.value = ''
      nome.focus()
    }

    const busca = h('input', {
      type: 'search', placeholder: 'Buscar produto', 'aria-label': 'Buscar produto',
      autocomplete: 'off', oninput: () => this.update(),
    })

    root.append(
      h('form.add-row', { onsubmit: (e) => { e.preventDefault(); enviar() } },
        nome, qtd,
        h('button.btn.primary', { type: 'submit', 'aria-label': 'Adicionar' }, icone('mais', 22))),
      h('div.chips', { id: 'chips' }),
      h('div.busca-wrap', { style: 'margin-top:14px' }, h('span.lupa', {}, icone('busca', 18)), busca),
      h('div', { id: 'catalogo-corpo' }),
    )
    this.busca = busca
  },

  update() {
    const cat = state.categories[state.view.categoryId]
    if (!cat) return go('adicionar')

    const chips = $('#chips')
    chips.innerHTML = ''
    for (const f of frequentesDe(cat.id)) {
      chips.append(
        h('span.chip', {},
          h('span', { text: f.name, onclick: () => addItem(cat.id, f.name, '') }),
          h('button.x', { type: 'button', 'aria-label': 'Remover ' + f.name + ' dos frequentes', onclick: () => removeFrequent(f.id) },
            icone('fechar', 13))),
      )
    }

    const corpo = $('#catalogo-corpo')
    corpo.innerHTML = ''
    const termo = normalizar(this.busca ? this.busca.value : '')
    const produtos = (CATALOGO[cat.catalog] || []).filter((n) => !termo || normalizar(n).includes(termo))

    // Itens que a família digitou e não estão no catálogo entram na lista também.
    const extras = itensDe(cat.id)
      .map((i) => i.name)
      .filter((n) => !(CATALOGO[cat.catalog] || []).some((p) => normalizar(p) === normalizar(n)))
      .filter((n, i, l) => l.indexOf(n) === i)
      .filter((n) => !termo || normalizar(n).includes(termo))

    const todos = extras.concat(produtos)
    if (!todos.length) {
      corpo.append(h('div.empty', {}, h('span.ic', {}, icone('busca', 40)), 'Nenhum produto com esse nome.'))
      return
    }
    corpo.append(h('div.catalogo', {}, todos.map((nome) => itemCatalogo(cat, nome, false))))
  },
}

/**
 * Linha do catálogo. A ação fica escrita, e não apenas no marcador: um alvo
 * que alterna em silêncio faz a pessoa tocar de novo para conferir, e o
 * segundo toque desfaz o primeiro. Toda mudança avisa por mensagem na tela.
 */
function itemCatalogo(cat, nome, mostrarCategoria) {
  const existente = itemPendentePorNome(cat.id, nome)
  return h('button', {
    class: 'cat-item',
    type: 'button',
    'aria-pressed': existente ? 'true' : 'false',
    onclick: () => {
      if (existente) {
        deleteItem(existente)
        toast(nome + ' saiu da lista')
      } else {
        addItem(cat.id, nome, '')
        toast(nome + ' foi para a lista')
      }
    },
  },
    h('span.marcador', {}, icone('check', 14)),
    h('span.nome', { text: nome }),
    mostrarCategoria ? h('span.qty-tag', { text: cat.name }) : null,
    existente
      ? h('span.acao.dentro', {}, icone('check', 14), 'Na lista')
      : h('span.acao', {}, icone('mais', 14), 'Incluir'),
  )
}

/* ---------------------------- tarefas ----------------------------- */

VIEWS.tarefas = {
  mount(root) {
    $('#view-title').textContent = 'Tarefas'

    const titulo = h('input.name', {
      type: 'text', placeholder: 'Nova tarefa', maxlength: '120',
      'aria-label': 'Título da tarefa', autocomplete: 'off',
    })
    const data = h('input', { type: 'date', 'aria-label': 'Data, opcional' })
    const quem = h('select', { 'aria-label': 'Responsável, opcional' })

    const enviar = () => {
      const valor = titulo.value.trim()
      if (!valor) return
      addTask(valor, quem.value, data.value)
      titulo.value = ''
      data.value = ''
      titulo.focus()
    }

    root.append(
      h('form', { onsubmit: (e) => { e.preventDefault(); enviar() } },
        h('div.add-row', {}, titulo,
          h('button.btn.primary', { type: 'submit', 'aria-label': 'Adicionar' }, icone('mais', 22))),
        h('div.add-row', { style: 'margin-top:8px' }, quem, data),
      ),
      h('div', { id: 'tarefas-corpo' }),
    )
    this.quem = quem
  },

  update() {
    const quem = this.quem
    if (quem) {
      const manter = quem.value
      quem.innerHTML = ''
      quem.append(h('option', { value: '', text: 'Sem responsável' }))
      for (const m of Object.values(state.members)) quem.append(h('option', { value: m.id, text: m.name }))
      quem.value = manter
    }

    const box = $('#tarefas-corpo')
    if (!box) return
    box.innerHTML = ''
    const todas = tarefasOrdenadas()
    const abertas = todas.filter((t) => !t.done)
    const feitas = todas.filter((t) => t.done)

    if (!todas.length) {
      box.append(h('div.empty', {}, h('span.ic', {}, icone('tarefas', 42)), 'Nenhuma tarefa por aqui.'))
      return
    }

    if (abertas.length) box.append(h('ul.list', {}, abertas.map(linhaTarefa)))
    else box.append(h('div.empty', {}, h('span.ic', {}, icone('check', 42)), 'Tudo em dia.'))

    if (feitas.length) {
      box.append(
        h('div.section-head', {},
          h('h2', { text: `Concluídas (${feitas.length})` }),
          h('button.link-btn', { type: 'button', onclick: () => limparTarefasFeitas(feitas) },
            icone('lixeira', 16), 'Limpar')),
        h('ul.list', {}, feitas.map(linhaTarefa)),
      )
    }
  },
}

function linhaTarefa(task) {
  const hoje = todayISO()
  const quem = membroDe(task.assignee_id)
  const sub = []
  if (task.due_date) sub.push(h('span', { style: 'display:inline-flex;align-items:center;gap:5px' }, icone('calendario', 13), humanDate(task.due_date)))
  if (quem) sub.push(h('span', { style: 'display:inline-flex;align-items:center;gap:5px' }, avatar(quem, 'xs'), quem.name))
  if (task.note) sub.push(h('span', { text: task.note }))

  const cls = ['row']
  if (task.done) cls.push('done')
  else if (task.due_date && task.due_date < hoje) cls.push('overdue')
  else if (task.due_date === hoje) cls.push('today')
  if (pending.has(task.id)) cls.push('pending')

  return h('li', { class: cls.join(' ') },
    h('button.check', {
      type: 'button',
      'aria-label': task.done ? 'Reabrir ' + task.title : 'Concluir ' + task.title,
      onclick: () => toggleTask(task),
    }, icone('check', 15)),
    h('div.main', { onclick: () => editTask(task) },
      h('div.nm', { text: task.title }),
      sub.length ? h('div.sub', {}, sub) : null),
    h('button.del', { type: 'button', 'aria-label': 'Excluir ' + task.title, onclick: () => deleteTask(task) },
      icone('lixeira', 17)),
  )
}

/* ---------------------------- ajustes ----------------------------- */

VIEWS.ajustes = {
  mount(root) {
    $('#view-title').textContent = 'Ajustes'
    root.append(h('div', { id: 'ajustes-corpo' }))
  },

  update() {
    const box = $('#ajustes-corpo')
    if (!box) return
    box.innerHTML = ''
    const me = state.me
    const admin = me && me.is_admin

    box.append(
      h('div.settings-group', {},
        h('h2', { text: 'Meu acesso' }),
        h('div.card', {},
          h('div.person', {}, avatar(me), h('span.nm', { text: me.name }), admin ? h('span.tag', { text: 'admin' }) : null),
          h('button.btn.ghost.block', { type: 'button', onclick: recarregarDados }, icone('lista', 18), 'Recarregar dados do app'),
          h('button.btn.ghost.block', { type: 'button', onclick: escolherFoto }, icone('pessoa', 18),
            me.photo ? 'Trocar minha foto' : 'Colocar minha foto'),
          me.photo ? h('button.btn.ghost.block', { type: 'button', onclick: removerFoto }, icone('lixeira', 18), 'Remover foto') : null,
          h('button.btn.ghost.block', { type: 'button', onclick: changeMyPin }, icone('editar', 18), 'Trocar minha senha'),
          h('button.btn.ghost.block', { type: 'button', onclick: logout }, icone('sair', 18), 'Sair do aplicativo'),
        )),
    )

    const catBox = h('div.card', {})
    for (const cat of categoriasOrdenadas()) {
      catBox.append(
        h('div.person', {},
          h('span.ic', {}, icone(cat.icon || 'caixa', 20)),
          h('span.nm', { text: cat.name }),
          admin ? h('button.link-btn', { type: 'button', onclick: () => editCategory(cat) }, 'Editar') : null,
          admin ? h('button.link-btn', { type: 'button', onclick: () => deleteCategory(cat) }, 'Excluir') : null),
      )
    }
    if (admin) catBox.append(h('button.btn.ghost.block', { type: 'button', onclick: newCategory }, icone('mais', 18), 'Nova categoria'))
    box.append(h('div.settings-group', {}, h('h2', { text: 'Categorias' }), catBox))

    const memBox = h('div.card', {})
    for (const m of Object.values(state.members)) {
      memBox.append(
        h('div.person', {}, avatar(m, 'sm'), h('span.nm', { text: m.name }),
          m.is_admin ? h('span.tag', { text: 'admin' }) : null,
          admin && m.id !== me.id ? h('button.link-btn', { type: 'button', onclick: () => removeMember(m) }, 'Remover') : null),
      )
    }
    if (admin) memBox.append(h('button.btn.ghost.block', { type: 'button', onclick: newMember }, icone('pessoas', 18), 'Adicionar membro'))
    box.append(h('div.settings-group', {}, h('h2', { text: 'Membros da família' }), memBox))

    box.append(h('p.muted', { style: 'text-align:center', text: 'Para abrir como aplicativo, use o menu do navegador e escolha adicionar à tela inicial.' }))
  },
}

/* ------------------------------------------------------------------ */
/* Ações                                                               */
/* ------------------------------------------------------------------ */

function addItem(categoryId, name, quantity) {
  const existente = itemPendentePorNome(categoryId, name)
  if (existente) return toast(name + ' já está na lista.')

  const id = uid()
  const ts = new Date().toISOString()
  mutate(state.items, id,
    () => {
      state.items[id] = {
        id, category_id: categoryId, name, quantity: quantity || null, note: null,
        done: 0, added_by: state.me.id, created_at: ts, updated_at: ts,
      }
    },
    async () => {
      const row = await api('/items', {
        method: 'POST',
        body: { id, category_id: categoryId, name, quantity: quantity || null },
      })
      if (row.frequent) {
        state.frequents[row.frequent.id] = row.frequent
        delete row.frequent
      }
      if (row.ja_existia) {
        toast(name + ' já estava na lista')
        delete row.ja_existia
      }
      return row
    })
}

function toggleItem(item) {
  const done = item.done ? 0 : 1
  mutate(state.items, item.id,
    () => {
      state.items[item.id] = {
        ...item, done,
        done_by: done ? state.me.id : null,
        done_at: done ? new Date().toISOString() : null,
      }
    },
    () => api('/items/' + item.id, { method: 'PATCH', body: { done: !!done } }))
}

function editItem(item) {
  const name = prompt('Nome do item', item.name)
  if (name === null) return
  const valor = name.trim()
  if (!valor) return toast('O nome não pode ficar vazio.')
  const quantity = prompt('Quantidade, opcional', item.quantity || '')
  if (quantity === null) return
  mutate(state.items, item.id,
    () => { state.items[item.id] = { ...item, name: valor, quantity: quantity.trim() || null } },
    () => api('/items/' + item.id, { method: 'PATCH', body: { name: valor, quantity: quantity.trim() || null } }))
}

function deleteItem(item) {
  mutate(state.items, item.id,
    () => { delete state.items[item.id] },
    async () => { await api('/items/' + item.id, { method: 'DELETE' }); return null },
    { tombstone: true })
}

async function limparComprados(comprados) {
  if (!comprados.length) return
  if (!confirm(`Tirar ${comprados.length} item(ns) já pego(s) da lista?`)) return
  const porCategoria = {}
  const backup = {}
  const ids = []
  for (const i of comprados) {
    backup[i.id] = i
    ids.push(i.id)
    ;(porCategoria[i.category_id] = porCategoria[i.category_id] || []).push(i.id)
    delete state.items[i.id]
    pending.add(i.id)
    tombstones.add(i.id)
  }
  refresh()
  try {
    await chainAll(ids)
    for (const catId in porCategoria) {
      await api('/items/clear-done', { method: 'POST', body: { category_id: catId, ids: porCategoria[catId] } })
    }
    save()
  } catch (e) {
    for (const id of ids) tombstones.delete(id)
    Object.assign(state.items, backup)
    toast(e.message)
  } finally {
    for (const id of ids) pending.delete(id)
    refresh()
  }
}

function addTask(title, assignee, due) {
  const id = uid()
  const ts = new Date().toISOString()
  mutate(state.tasks, id,
    () => {
      state.tasks[id] = {
        id, title, note: null, assignee_id: assignee || null, due_date: due || null,
        done: 0, added_by: state.me.id, created_at: ts, updated_at: ts,
      }
    },
    () => api('/tasks', { method: 'POST', body: { id, title, assignee_id: assignee || null, due_date: due || null } }))
}

function toggleTask(task) {
  const done = task.done ? 0 : 1
  mutate(state.tasks, task.id,
    () => {
      state.tasks[task.id] = {
        ...task, done,
        done_by: done ? state.me.id : null,
        done_at: done ? new Date().toISOString() : null,
      }
    },
    () => api('/tasks/' + task.id, { method: 'PATCH', body: { done: !!done } }))
}

function editTask(task) {
  const title = prompt('Título da tarefa', task.title)
  if (title === null) return
  const valor = title.trim()
  if (!valor) return toast('O título não pode ficar vazio.')
  const due = prompt('Data no formato AAAA-MM-DD, deixe vazio para nenhuma', task.due_date || '')
  if (due === null) return
  const data = due.trim()
  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) return toast('Data inválida. Use AAAA-MM-DD.')
  mutate(state.tasks, task.id,
    () => { state.tasks[task.id] = { ...task, title: valor, due_date: data || null } },
    () => api('/tasks/' + task.id, { method: 'PATCH', body: { title: valor, due_date: data || null } }))
}

function deleteTask(task) {
  mutate(state.tasks, task.id,
    () => { delete state.tasks[task.id] },
    async () => { await api('/tasks/' + task.id, { method: 'DELETE' }); return null },
    { tombstone: true })
}

async function limparTarefasFeitas(feitas) {
  if (!confirm(`Remover ${feitas.length} tarefa(s) concluída(s)?`)) return
  for (const t of feitas) deleteTask(t)
}

function removeFrequent(id) {
  const backup = state.frequents[id]
  delete state.frequents[id]
  refresh()
  api('/frequents/' + id, { method: 'DELETE' }).catch((e) => {
    state.frequents[id] = backup
    toast(e.message)
    refresh()
  })
}

/* ---- categorias e membros ---- */

function escolherIcone(atual) {
  const escolha = prompt(
    'Ícone da categoria. Escolha um destes nomes:\n' + ICONES_CATEGORIA.join(', '),
    atual || 'caixa',
  )
  if (escolha === null) return null
  const limpo = String(escolha).trim().toLowerCase()
  return ICONES_CATEGORIA.includes(limpo) ? limpo : 'caixa'
}

async function newCategory() {
  const name = prompt('Nome da nova categoria')
  if (name === null) return
  const valor = name.trim()
  if (!valor) return
  const icon = escolherIcone()
  if (icon === null) return
  try {
    const row = await api('/categories', { method: 'POST', body: { name: valor, icon } })
    state.categories[row.id] = row
    save()
    refresh()
  } catch (e) { toast(e.message) }
}

async function editCategory(cat) {
  const name = prompt('Nome da categoria', cat.name)
  if (name === null) return
  const valor = name.trim()
  if (!valor) return
  const icon = escolherIcone(cat.icon)
  if (icon === null) return
  try {
    const row = await api('/categories/' + cat.id, { method: 'PATCH', body: { name: valor, icon } })
    state.categories[row.id] = row
    save()
    refresh()
  } catch (e) { toast(e.message) }
}

async function deleteCategory(cat) {
  if (!confirm(`Excluir a categoria ${cat.name} e os itens dela?`)) return
  try {
    await api('/categories/' + cat.id, { method: 'DELETE' })
    delete state.categories[cat.id]
    for (const i of Object.values(state.items)) if (i.category_id === cat.id) delete state.items[i.id]
    save()
    refresh()
  } catch (e) { toast(e.message) }
}

async function newMember() {
  const name = prompt('Nome do novo membro')
  if (name === null) return
  const valor = name.trim()
  if (!valor) return
  const pin = prompt(`Senha de ${PIN_MIN} a ${PIN_MAX} dígitos para ${valor}`)
  if (pin === null) return
  if (!/^\d{4,8}$/.test(pin.trim())) return toast(`A senha precisa ter de ${PIN_MIN} a ${PIN_MAX} dígitos.`)
  try {
    const row = await api('/members', { method: 'POST', body: { name: valor, pin: pin.trim() } })
    state.members[row.id] = row
    save()
    refresh()
    toast(valor + ' já pode entrar com a senha escolhida.')
  } catch (e) { toast(e.message) }
}

async function removeMember(m) {
  if (!confirm(`Remover o acesso de ${m.name}?`)) return
  try {
    await api('/members/' + m.id, { method: 'DELETE' })
    delete state.members[m.id]
    save()
    refresh()
  } catch (e) { toast(e.message) }
}

async function changeMyPin() {
  const atual = prompt('Senha atual')
  if (atual === null) return
  const novo = prompt(`Nova senha, de ${PIN_MIN} a ${PIN_MAX} dígitos`)
  if (novo === null) return
  if (!/^\d{4,8}$/.test(novo.trim())) return toast(`A senha precisa ter de ${PIN_MIN} a ${PIN_MAX} dígitos.`)
  try {
    await api('/members/' + state.me.id, { method: 'PATCH', body: { current_pin: atual.trim(), pin: novo.trim() } })
    toast('Senha atualizada.')
  } catch (e) { toast(e.message) }
}

/** Descarta o que estiver guardado no aparelho e busca tudo de novo. */
async function recarregarDados() {
  const eu = state.me
  clearCache()
  state.me = eu
  try {
    await sync()
    toast('Dados recarregados do servidor.')
  } catch (e) {
    toast(e.message)
  }
  refresh()
}

async function logout() {
  if (!confirm('Sair do aplicativo?')) return
  try { await api('/logout', { method: 'POST', allow401: true }) } catch (e) {}
  clearTimeout(timer)
  clearCache()
  showLogin()
}

/* ------------------------------------------------------------------ */
/* Navegação e início                                                  */
/* ------------------------------------------------------------------ */

for (const tab of document.querySelectorAll('.tab')) {
  tab.prepend(icone(tab.dataset.icone, 22))
  tab.addEventListener('click', () => go(tab.dataset.nav))
}

const btnBack = $('#btn-back')
if (btnBack) {
  btnBack.append(icone('voltar', 24))
  btnBack.addEventListener('click', () => go('adicionar'))
}

/* Os guardas de nulo não são zelo excessivo: se o navegador servir um
   index.html antigo junto com este arquivo novo, esses elementos não existem
   e um erro aqui mataria o script antes de o boot começar. */
const btnRetry = $('#boot-retry')
if (btnRetry) btnRetry.addEventListener('click', () => window.location.reload())

const btnReset = $('#boot-reset')
if (btnReset) btnReset.addEventListener('click', () => limparERecarregar('pedido pelo usuário'))

function bootFailed(msg) {
  showScreen('screen-loading')
  $('#boot-spinner').hidden = true
  $('#boot-error').textContent = msg
  $('#boot-fail').hidden = false
}

async function boot() {
  load()
  online = navigator.onLine
  $('#offline').hidden = online

  if (state.me) {
    showScreen('screen-app')
    go('compras')
    try {
      state.me = await api('/me', { allow401: true })
      // Carga completa a cada abertura, e nao a partir do ultimo acerto de
      // relogio. Custa uma requisicao um pouco maior por abertura e garante
      // que a tela nunca fique com item fantasma se algo divergir do servidor.
      state.lastSync = null
      await sync()
      wake(false)
      scheduleSync()
      return
    } catch (e) {
      if (!online) return toast('Sem conexão. Mostrando a última versão salva.')
    }
  }

  try {
    const status = await api('/status', { allow401: true })
    if (status.needs_setup) return showSetup()
    if (status.logged_in) return enterApp()
    clearCache()
    showLogin(status.members)
  } catch (e) {
    diag('boot-falhou', e && e.message)
    bootFailed(e && e.message ? e.message : 'Erro desconhecido.')
  }
}

boot()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
