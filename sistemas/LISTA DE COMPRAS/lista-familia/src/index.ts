import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
}

type Member = {
  id: string
  name: string
  photo: string | null
  is_admin: number
}

type Variables = {
  member: Member
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const COOKIE = 'sid'
const SESSION_DAYS = 90
const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW_MIN = 10
const PURGE_DELETED_DAYS = 30

// Iteracoes do PBKDF2, medidas para caber no teto de 10ms de CPU por
// invocacao do plano gratuito. A troca de PIN faz duas derivacoes na mesma
// requisicao (conferir a atual e gravar a nova), entao o orcamento real e
// metade do teto. Medicao de referencia: 15 mil iteracoes custam cerca de
// 4ms por derivacao.
// O numero fica gravado dentro do proprio hash, entao pode ser aumentado
// depois (por exemplo no plano pago) sem invalidar os PINs ja cadastrados.
const PBKDF2_ITERATIONS = 15_000

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const now = () => new Date().toISOString()
const uuid = () => crypto.randomUUID()

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString()

const minutesAgo = (min: number) =>
  new Date(Date.now() - min * 60_000).toISOString()

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString()

function b64encode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function b64decode(str: string): Uint8Array {
  const bin = atob(str)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function derive(pin: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256,
  )
}

async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derive(pin, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64encode(salt.buffer)}$${b64encode(bits)}`
}

async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  if (!Number.isFinite(iterations) || iterations < 1) return false
  const salt = b64decode(parts[2])
  const bits = await derive(pin, salt, iterations)
  // Comparacao de tempo constante.
  const a = new Uint8Array(bits)
  const b = b64decode(parts[3])
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const bad = (msg: string) => new ApiError(400, msg)

/** Texto obrigatorio, aparado e com limite de tamanho. */
function reqText(v: unknown, field: string, max = 120): string {
  if (typeof v !== 'string') throw bad(`Campo ${field} invalido.`)
  const s = v.trim()
  if (!s) throw bad(`Campo ${field} nao pode ficar vazio.`)
  if (s.length > max) throw bad(`Campo ${field} passou de ${max} caracteres.`)
  return s
}

/** Texto opcional. Devolve null quando ausente ou vazio. */
function optText(v: unknown, field: string, max = 400): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string') throw bad(`Campo ${field} invalido.`)
  const s = v.trim()
  if (!s) return null
  if (s.length > max) throw bad(`Campo ${field} passou de ${max} caracteres.`)
  return s
}

// O PIN aceita de 4 a 8 digitos. A familia usa um numero que ja conhece de
// cor, e obrigar exatamente 4 so atrapalharia.
const PIN_MIN = 4
const PIN_MAX = 8

// Regex literal de proposito: dentro de template literal o \d perderia a
// barra e a validacao passaria a exigir a letra d.
const PIN_RE = /^\d{4,8}$/

function reqPin(v: unknown): string {
  if (typeof v !== 'string' || !PIN_RE.test(v))
    throw bad(`A senha precisa ter de ${PIN_MIN} a ${PIN_MAX} digitos.`)
  return v
}

/**
 * Foto de perfil como data URI. O aplicativo ja envia reduzida para 192px,
 * o que da algo perto de 10KB. O teto de 200KB aqui e so uma trava contra
 * envio de imagem crua, que estouraria o limite de tamanho de linha do D1.
 */
const FOTO_MAX = 200_000
const FOTO_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/

function optFoto(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string') throw bad('Foto invalida.')
  if (!FOTO_RE.test(v)) throw bad('Formato de foto nao aceito.')
  if (v.length > FOTO_MAX) throw bad('A foto ficou grande demais. Tente outra.')
  return v
}

function optId(v: unknown, field: string): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string' || v.length > 64) throw bad(`Campo ${field} invalido.`)
  return v
}

function reqId(v: unknown, field: string): string {
  const id = optId(v, field)
  if (!id) throw bad(`Campo ${field} obrigatorio.`)
  return id
}

/** Aceita id enviado pelo cliente (para UI otimista) ou gera um novo. */
function idOrNew(v: unknown): string {
  if (v === undefined || v === null || v === '') return uuid()
  if (typeof v !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(v))
    throw bad('Id invalido.')
  return v
}

function optDate(v: unknown, field: string): string | null {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v))
    throw bad(`Campo ${field} precisa estar no formato AAAA-MM-DD.`)
  return v
}

function toBool(v: unknown, field: string): number {
  if (typeof v === 'boolean') return v ? 1 : 0
  if (v === 0 || v === 1) return v as number
  throw bad(`Campo ${field} precisa ser verdadeiro ou falso.`)
}

const clientIp = (c: any) =>
  c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'local'

/* ------------------------------------------------------------------ */
/* Portaria: nada de robo                                              */
/* ------------------------------------------------------------------ */

/**
 * Lista de robos conhecidos, incluindo os de coleta para treinar modelo.
 * O robots.txt e um pedido, e robo mal educado ignora pedido. Aqui a porta
 * fecha de verdade, com 403.
 *
 * Nada de valor fica exposto de qualquer forma: toda rota de dado exige
 * sessao. Isto e a camada de fora, para o aplicativo nem aparecer.
 */
const ROBOS = new RegExp(
  [
    'bot', 'crawl', 'spider', 'scraper', 'slurp', 'archiver', 'wget', 'httrack',
    'python-requests', 'scrapy', 'headlesschrome', 'phantomjs', 'puppeteer',
    'gptbot', 'oai-searchbot', 'chatgpt-user', 'claude-web', 'anthropic',
    'perplexity', 'ccbot', 'bytespider', 'amazonbot', 'applebot',
    'google-extended', 'meta-externalagent', 'cohere', 'diffbot', 'omgili',
    'imagesift', 'timpi', 'youbot', 'ahrefs', 'semrush', 'mj12', 'dotbot',
    'dataforseo', 'petalbot', 'seekport', 'facebookexternalhit', 'whatsapp',
    'telegrambot', 'twitterbot', 'discordbot', 'linkedinbot', 'skypeuripreview',
    'embedly', 'quora link preview', 'pinterest', 'redditbot', 'slackbot',
  ].join('|'),
  'i',
)

/** Cabecalhos de privacidade em toda resposta que sai do Worker. */
const CABECALHOS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
}

app.use('*', async (c, next) => {
  const ua = c.req.header('User-Agent') || ''
  if (ROBOS.test(ua)) {
    return c.text('Aplicativo particular. Sem acesso automatizado.', 403, {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    })
  }
  await next()
  for (const nome in CABECALHOS) c.header(nome, (CABECALHOS as any)[nome])
})

/* ------------------------------------------------------------------ */
/* Tratamento de erro                                                  */
/* ------------------------------------------------------------------ */

app.onError((err, c) => {
  if (err instanceof ApiError)
    return c.json({ error: err.message }, err.status as any)
  console.error(err)
  return c.json({ error: 'Erro inesperado no servidor.' }, 500)
})

/* ------------------------------------------------------------------ */
/* Sessao                                                              */
/* ------------------------------------------------------------------ */

async function currentMember(c: any): Promise<Member | null> {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  const row = (await c.env.DB.prepare(
    `SELECT m.id, m.name, m.photo, m.is_admin
       FROM sessions s
       JOIN members m ON m.id = s.member_id
      WHERE s.token = ? AND s.expires_at > ? AND m.active = 1`,
  )
    .bind(token, now())
    .first()) as Member | null
  return row ?? null
}

const api = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Unicas rotas que dispensam sessao.
const PUBLIC = /^\/(api\/)?(status|setup|login|logout)$|^\/api\/diag\//

// Middleware de sessao aplicado a tudo que nao esta na lista publica.
api.use('*', async (c, next) => {
  if (PUBLIC.test(c.req.path)) return next()
  const member = await currentMember(c)
  if (!member) throw new ApiError(401, 'Sessao expirada. Entre novamente.')
  c.set('member', member)
  await next()
})

const requireAdmin = async (c: any, next: any) => {
  const member = c.get('member') as Member
  if (!member.is_admin)
    throw new ApiError(403, 'Apenas o administrador pode fazer isso.')
  await next()
}

/* ------------------------------------------------------------------ */
/* Rotas publicas: setup, login                                        */
/* ------------------------------------------------------------------ */

// Espelha o CATEGORIAS_PADRAO do public/catalogo.js. A chave liga a categoria
// a lista de produtos sugeridos que o app mostra na tela de adicionar.
const CATEGORIAS_INICIAIS: Array<[string, string, string]> = [
  ['Mercearia', 'carrinho', 'mercearia'],
  ['Hortifrúti', 'fruta', 'hortifruti'],
  ['Carnes e Frios', 'carne', 'carnes'],
  ['Laticínios e Ovos', 'leite', 'laticinios'],
  ['Padaria', 'pao', 'padaria'],
  ['Bebidas', 'bebida', 'bebidas'],
  ['Congelados', 'gelo', 'congelados'],
  ['Limpeza', 'limpeza', 'limpeza'],
  ['Higiene Pessoal', 'higiene', 'higiene'],
  ['Farmácia', 'remedio', 'farmacia'],
  ['Pet', 'pet', 'pet'],
  ['Casa e Utilidades', 'casa', 'casa'],
  ['Viagem', 'viagem', 'viagem'],
]

api.get('/status', async (c) => {
  const done = await c.env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'setup_done'`,
  ).first<{ value: string }>()

  if (!done) return c.json({ needs_setup: true, members: [] })

  const { results } = await c.env.DB.prepare(
    `SELECT id, name, photo FROM members WHERE active = 1 ORDER BY created_at`,
  ).all()

  const me = await currentMember(c)
  return c.json({ needs_setup: false, members: results, logged_in: !!me })
})

/**
 * Marcador de diagnostico. Cada etapa do carregamento avisa o servidor que
 * chegou ate ali, para descobrir onde o navegador do usuario para.
 * Instrumentacao temporaria, pode ser removida depois.
 */
api.get('/diag/:marca', async (c) => {
  try {
    await c.env.DB.prepare(
      `INSERT INTO diag (marca, ua, ip, at) VALUES (?, ?, ?, ?)`,
    )
      .bind(
        (c.req.param('marca') + (c.req.query('m') ? ': ' + c.req.query('m') : '')).slice(
          0,
          300,
        ),
        (c.req.header('User-Agent') || '').slice(0, 200),
        clientIp(c),
        now(),
      )
      .run()
  } catch (e) {
    /* diagnostico nunca pode quebrar o app */
  }
  return c.body(null, 204)
})

api.post('/setup', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = reqText(body.name, 'nome', 40)
  const pin = reqPin(body.pin)

  // Guarda atomica: quem conseguir inserir a chave primaria faz o setup.
  try {
    await c.env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES ('setup_done', ?)`,
    )
      .bind(now())
      .run()
  } catch {
    throw new ApiError(409, 'O aplicativo ja foi configurado.')
  }

  const ts = now()
  const memberId = uuid()
  const stmts = [
    c.env.DB.prepare(
      `INSERT INTO members (id, name, pin_hash, is_admin, active, created_at, updated_at)
       VALUES (?, ?, ?, 1, 1, ?, ?)`,
    ).bind(memberId, name, await hashPin(pin), ts, ts),
    ...CATEGORIAS_INICIAIS.map(([nome, ic, chave], i) =>
      c.env.DB.prepare(
        `INSERT INTO categories (id, name, icon, catalog, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).bind(uuid(), nome, ic, chave, i + 1, ts, ts),
    ),
  ]
  await c.env.DB.batch(stmts)

  await openSession(c, memberId)
  return c.json({ ok: true })
})

async function openSession(c: any, memberId: string) {
  const token = uuid()
  await c.env.DB.prepare(
    `INSERT INTO sessions (token, member_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(token, memberId, now(), daysFromNow(SESSION_DAYS))
    .run()

  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  })
}

api.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const memberId = reqId(body.member_id, 'membro')
  const pin = reqPin(body.pin)
  const ip = clientIp(c)

  // Limite por par membro + IP, para que um membro que erra o PIN
  // nao bloqueie o restante da familia atras do mesmo IP.
  const fails = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_attempts
      WHERE member_id = ? AND ip = ? AND attempted_at > ?`,
  )
    .bind(memberId, ip, minutesAgo(ATTEMPT_WINDOW_MIN))
    .first<{ n: number }>()

  if ((fails?.n ?? 0) >= MAX_ATTEMPTS)
    throw new ApiError(
      429,
      `Muitas tentativas. Espere ${ATTEMPT_WINDOW_MIN} minutos e tente de novo.`,
    )

  const member = await c.env.DB.prepare(
    `SELECT id, pin_hash FROM members WHERE id = ? AND active = 1`,
  )
    .bind(memberId)
    .first<{ id: string; pin_hash: string }>()

  const ok = member ? await verifyPin(pin, member.pin_hash) : false

  if (!ok) {
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT INTO login_attempts (member_id, ip, attempted_at) VALUES (?, ?, ?)`,
      ).bind(memberId, ip, now()),
      // Tentativas fora da janela nao servem para mais nada.
      c.env.DB.prepare(`DELETE FROM login_attempts WHERE attempted_at < ?`).bind(
        minutesAgo(ATTEMPT_WINDOW_MIN),
      ),
    ])
    throw new ApiError(401, 'Senha incorreta.')
  }

  // Limpezas oportunistas, baratas e sem cron.
  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM login_attempts WHERE member_id = ? AND ip = ?`).bind(
      memberId,
      ip,
    ),
    c.env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now()),
    c.env.DB.prepare(`DELETE FROM items WHERE deleted_at < ?`).bind(
      daysAgo(PURGE_DELETED_DAYS),
    ),
    c.env.DB.prepare(`DELETE FROM tasks WHERE deleted_at < ?`).bind(
      daysAgo(PURGE_DELETED_DAYS),
    ),
  ])

  await openSession(c, member!.id)
  return c.json({ ok: true })
})

api.post('/logout', async (c) => {
  const token = getCookie(c, COOKIE)
  if (token)
    await c.env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run()
  deleteCookie(c, COOKIE, { path: '/' })
  return c.json({ ok: true })
})

/* ------------------------------------------------------------------ */
/* Daqui para baixo tudo exige sessao                                  */
/* ------------------------------------------------------------------ */

api.get('/me', (c) => c.json(c.get('member')))

/* ---------------------------- sync -------------------------------- */

/**
 * Endpoint unico de sincronizacao.
 * Sem "since" devolve o estado completo (carga inicial).
 * Com "since" devolve apenas o que mudou depois daquele instante,
 * incluindo linhas apagadas (deleted_at preenchido) para que o
 * cliente consiga remove-las da tela.
 */
api.get('/sync', async (c) => {
  const since = c.req.query('since')
  const ts = now()

  const filter = since ? `updated_at > ?` : `deleted_at IS NULL`
  const bind = since ? [since] : []

  const [categories, items, tasks, members, frequents] = await c.env.DB.batch([
    c.env.DB.prepare(
      `SELECT id, name, icon, catalog, sort_order, deleted_at, updated_at
         FROM categories WHERE ${filter} ORDER BY sort_order`,
    ).bind(...bind),
    c.env.DB.prepare(
      `SELECT id, category_id, name, quantity, note, done, added_by, done_by,
              done_at, deleted_at, created_at, updated_at
         FROM items WHERE ${filter}`,
    ).bind(...bind),
    c.env.DB.prepare(
      `SELECT id, title, note, assignee_id, due_date, done, added_by, done_by,
              done_at, deleted_at, created_at, updated_at
         FROM tasks WHERE ${filter}`,
    ).bind(...bind),
    c.env.DB.prepare(
      since
        ? `SELECT id, name, photo, is_admin, active, updated_at FROM members WHERE updated_at > ?`
        : `SELECT id, name, photo, is_admin, active, updated_at FROM members WHERE active = 1`,
    ).bind(...bind),
    c.env.DB.prepare(
      `SELECT id, category_id, name, times_used, deleted_at, updated_at
         FROM frequent_items WHERE ${filter}`,
    ).bind(...bind),
  ])

  return c.json({
    now: ts,
    full: !since,
    categories: categories.results,
    items: items.results,
    tasks: tasks.results,
    members: members.results,
    frequents: frequents.results,
  })
})

/* ---------------------------- itens ------------------------------- */

async function categoryExists(c: any, id: string) {
  const row = await c.env.DB.prepare(
    `SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL`,
  )
    .bind(id)
    .first()
  if (!row) throw bad('Categoria nao encontrada.')
}

/** Registra o item na lista de frequentes da categoria. */
function touchFrequent(c: any, categoryId: string, name: string, ts: string) {
  return c.env.DB.prepare(
    `INSERT INTO frequent_items (id, category_id, name, times_used, deleted_at, updated_at)
     VALUES (?, ?, ?, 1, NULL, ?)
     ON CONFLICT(category_id, name) DO UPDATE SET
       times_used = times_used + 1,
       deleted_at = NULL,
       updated_at = excluded.updated_at`,
  ).bind(uuid(), categoryId, name, ts)
}

api.post('/items', async (c) => {
  const me = c.get('member')
  const body = await c.req.json().catch(() => ({}))
  const id = idOrNew(body.id)
  const categoryId = reqId(body.category_id, 'categoria')
  const name = reqText(body.name, 'nome', 120)
  const quantity = optText(body.quantity, 'quantidade', 40)
  const note = optText(body.note, 'observacao', 400)
  const ts = now()

  await categoryExists(c, categoryId)

  // Trava de duplicidade no servidor. A verificacao no aparelho nao basta:
  // se duas pessoas incluem o mesmo item antes de sincronizar, cada aparelho
  // acha que e o primeiro e nascem dois. Aqui devolvemos o item que ja existe
  // em vez de criar outro, e o aparelho troca o registro dele pelo devolvido.
  const jaExiste = (await c.env.DB.prepare(
    `SELECT * FROM items
      WHERE category_id = ? AND done = 0 AND deleted_at IS NULL
        AND lower(trim(name)) = lower(trim(?))
      LIMIT 1`,
  )
    .bind(categoryId, name)
    .first()) as any

  if (jaExiste) {
    const freq = await c.env.DB.prepare(
      `SELECT id, category_id, name, times_used, deleted_at, updated_at
         FROM frequent_items WHERE category_id = ? AND name = ?`,
    )
      .bind(categoryId, name)
      .first()
    return c.json({ ...jaExiste, frequent: freq ?? null, ja_existia: true })
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO items (id, category_id, name, quantity, note, done, added_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
       ON CONFLICT(id) DO NOTHING`,
    ).bind(id, categoryId, name, quantity, note, me.id, ts, ts),
    touchFrequent(c, categoryId, name, ts),
  ])

  // O frequente atualizado volta junto para que o chip apareca na hora,
  // sem esperar o proximo ciclo de sincronizacao.
  const [row, frequent] = await c.env.DB.batch([
    c.env.DB.prepare(`SELECT * FROM items WHERE id = ?`).bind(id),
    c.env.DB.prepare(
      `SELECT id, category_id, name, times_used, deleted_at, updated_at
         FROM frequent_items WHERE category_id = ? AND name = ?`,
    ).bind(categoryId, name),
  ])
  return c.json({ ...(row.results[0] as object), frequent: frequent.results[0] ?? null })
})

api.patch('/items/:id', async (c) => {
  const me = c.get('member')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const ts = now()

  const current = await c.env.DB.prepare(
    `SELECT * FROM items WHERE id = ? AND deleted_at IS NULL`,
  )
    .bind(id)
    .first<any>()
  if (!current) throw new ApiError(404, 'Item nao encontrado.')

  const sets: string[] = []
  const vals: any[] = []

  if (body.name !== undefined) {
    sets.push('name = ?')
    vals.push(reqText(body.name, 'nome', 120))
  }
  if (body.quantity !== undefined) {
    sets.push('quantity = ?')
    vals.push(optText(body.quantity, 'quantidade', 40))
  }
  if (body.note !== undefined) {
    sets.push('note = ?')
    vals.push(optText(body.note, 'observacao', 400))
  }
  if (body.category_id !== undefined) {
    const cid = reqId(body.category_id, 'categoria')
    await categoryExists(c, cid)
    sets.push('category_id = ?')
    vals.push(cid)
  }
  if (body.done !== undefined) {
    const done = toBool(body.done, 'done')
    sets.push('done = ?', 'done_by = ?', 'done_at = ?')
    vals.push(done, done ? me.id : null, done ? ts : null)
  }
  if (!sets.length) throw bad('Nada para atualizar.')

  sets.push('updated_at = ?')
  vals.push(ts, id)

  await c.env.DB.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  const row = await c.env.DB.prepare(`SELECT * FROM items WHERE id = ?`)
    .bind(id)
    .first()
  return c.json(row)
})

api.delete('/items/:id', async (c) => {
  const ts = now()
  await c.env.DB.prepare(
    `UPDATE items SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
  )
    .bind(ts, ts, c.req.param('id'))
    .run()
  return c.json({ ok: true })
})

api.post('/items/clear-done', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const categoryId = reqId(body.category_id, 'categoria')
  const ts = now()

  // O cliente manda os ids que estavam riscados na tela dele. Isso evita a
  // corrida de marcar um item e limpar a lista antes de o PATCH chegar,
  // e garante que so sai da lista aquilo que a pessoa realmente viu marcado.
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((v: unknown) => typeof v === 'string').slice(0, 300)
    : null

  const res = ids?.length
    ? await c.env.DB.prepare(
        `UPDATE items SET deleted_at = ?, updated_at = ?
          WHERE category_id = ? AND deleted_at IS NULL
            AND id IN (${ids.map(() => '?').join(',')})`,
      )
        .bind(ts, ts, categoryId, ...ids)
        .run()
    : await c.env.DB.prepare(
        `UPDATE items SET deleted_at = ?, updated_at = ?
          WHERE category_id = ? AND done = 1 AND deleted_at IS NULL`,
      )
        .bind(ts, ts, categoryId)
        .run()

  return c.json({ ok: true, removed: res.meta.changes ?? 0 })
})

/* ---------------------------- tarefas ----------------------------- */

api.post('/tasks', async (c) => {
  const me = c.get('member')
  const body = await c.req.json().catch(() => ({}))
  const id = idOrNew(body.id)
  const title = reqText(body.title, 'titulo', 120)
  const note = optText(body.note, 'observacao', 400)
  const assignee = optId(body.assignee_id, 'responsavel')
  const due = optDate(body.due_date, 'data')
  const ts = now()

  if (assignee) {
    const row = await c.env.DB.prepare(
      `SELECT id FROM members WHERE id = ? AND active = 1`,
    )
      .bind(assignee)
      .first()
    if (!row) throw bad('Responsavel nao encontrado.')
  }

  await c.env.DB.prepare(
    `INSERT INTO tasks (id, title, note, assignee_id, due_date, done, added_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
     ON CONFLICT(id) DO NOTHING`,
  )
    .bind(id, title, note, assignee, due, me.id, ts, ts)
    .run()

  const row = await c.env.DB.prepare(`SELECT * FROM tasks WHERE id = ?`)
    .bind(id)
    .first()
  return c.json(row)
})

api.patch('/tasks/:id', async (c) => {
  const me = c.get('member')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const ts = now()

  const current = await c.env.DB.prepare(
    `SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL`,
  )
    .bind(id)
    .first()
  if (!current) throw new ApiError(404, 'Tarefa nao encontrada.')

  const sets: string[] = []
  const vals: any[] = []

  if (body.title !== undefined) {
    sets.push('title = ?')
    vals.push(reqText(body.title, 'titulo', 120))
  }
  if (body.note !== undefined) {
    sets.push('note = ?')
    vals.push(optText(body.note, 'observacao', 400))
  }
  if (body.assignee_id !== undefined) {
    const assignee = optId(body.assignee_id, 'responsavel')
    if (assignee) {
      const row = await c.env.DB.prepare(
        `SELECT id FROM members WHERE id = ? AND active = 1`,
      )
        .bind(assignee)
        .first()
      if (!row) throw bad('Responsavel nao encontrado.')
    }
    sets.push('assignee_id = ?')
    vals.push(assignee)
  }
  if (body.due_date !== undefined) {
    sets.push('due_date = ?')
    vals.push(optDate(body.due_date, 'data'))
  }
  if (body.done !== undefined) {
    const done = toBool(body.done, 'done')
    sets.push('done = ?', 'done_by = ?', 'done_at = ?')
    vals.push(done, done ? me.id : null, done ? ts : null)
  }
  if (!sets.length) throw bad('Nada para atualizar.')

  sets.push('updated_at = ?')
  vals.push(ts, id)

  await c.env.DB.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  const row = await c.env.DB.prepare(`SELECT * FROM tasks WHERE id = ?`)
    .bind(id)
    .first()
  return c.json(row)
})

api.delete('/tasks/:id', async (c) => {
  const ts = now()
  await c.env.DB.prepare(
    `UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
  )
    .bind(ts, ts, c.req.param('id'))
    .run()
  return c.json({ ok: true })
})

/* --------------------------- frequentes --------------------------- */

api.delete('/frequents/:id', async (c) => {
  const ts = now()
  await c.env.DB.prepare(
    `UPDATE frequent_items SET deleted_at = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(ts, ts, c.req.param('id'))
    .run()
  return c.json({ ok: true })
})

/* --------------------------- categorias --------------------------- */

api.post('/categories', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const id = idOrNew(body.id)
  const name = reqText(body.name, 'nome', 40)
  const icon = optText(body.icon, 'icone', 20) ?? 'caixa'
  const ts = now()

  const max = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS m FROM categories`,
  ).first<{ m: number }>()

  await c.env.DB.prepare(
    `INSERT INTO categories (id, name, icon, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
  )
    .bind(id, name, icon, (max?.m ?? 0) + 1, ts, ts)
    .run()

  const row = await c.env.DB.prepare(`SELECT * FROM categories WHERE id = ?`)
    .bind(id)
    .first()
  return c.json(row)
})

api.patch('/categories/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const ts = now()

  const sets: string[] = []
  const vals: any[] = []
  if (body.name !== undefined) {
    sets.push('name = ?')
    vals.push(reqText(body.name, 'nome', 40))
  }
  if (body.icon !== undefined) {
    sets.push('icon = ?')
    vals.push(optText(body.icon, 'icone', 20) ?? 'caixa')
  }
  if (body.sort_order !== undefined) {
    const n = Number(body.sort_order)
    if (!Number.isInteger(n)) throw bad('Ordem invalida.')
    sets.push('sort_order = ?')
    vals.push(n)
  }
  if (!sets.length) throw bad('Nada para atualizar.')

  sets.push('updated_at = ?')
  vals.push(ts, id)

  await c.env.DB.prepare(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  const row = await c.env.DB.prepare(`SELECT * FROM categories WHERE id = ?`)
    .bind(id)
    .first()
  return c.json(row)
})

api.delete('/categories/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const ts = now()

  const total = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM categories WHERE deleted_at IS NULL`,
  ).first<{ n: number }>()
  if ((total?.n ?? 0) <= 1) throw bad('E preciso manter pelo menos uma categoria.')

  // Apaga a categoria junto com os itens e frequentes dela,
  // sempre em soft delete para que os outros aparelhos sincronizem a remocao.
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE categories SET deleted_at = ?, updated_at = ? WHERE id = ?`,
    ).bind(ts, ts, id),
    c.env.DB.prepare(
      `UPDATE items SET deleted_at = ?, updated_at = ? WHERE category_id = ? AND deleted_at IS NULL`,
    ).bind(ts, ts, id),
    c.env.DB.prepare(
      `UPDATE frequent_items SET deleted_at = ?, updated_at = ? WHERE category_id = ? AND deleted_at IS NULL`,
    ).bind(ts, ts, id),
  ])
  return c.json({ ok: true })
})

/* --------------------------- membros ------------------------------ */

api.post('/members', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = reqText(body.name, 'nome', 40)
  const pin = reqPin(body.pin)
  const ts = now()
  const id = uuid()

  await c.env.DB.prepare(
    `INSERT INTO members (id, name, pin_hash, is_admin, active, created_at, updated_at)
     VALUES (?, ?, ?, 0, 1, ?, ?)`,
  )
    .bind(id, name, await hashPin(pin), ts, ts)
    .run()

  return c.json({ id, name, photo: null, is_admin: 0, active: 1 })
})

api.patch('/members/:id', async (c) => {
  const me = c.get('member')
  const id = c.req.param('id')
  if (!me.is_admin && me.id !== id)
    throw new ApiError(403, 'Voce so pode alterar o seu proprio perfil.')

  const body = await c.req.json().catch(() => ({}))
  const ts = now()
  const sets: string[] = []
  const vals: any[] = []

  if (body.name !== undefined) {
    sets.push('name = ?')
    vals.push(reqText(body.name, 'nome', 40))
  }
  if (body.photo !== undefined) {
    sets.push('photo = ?')
    vals.push(optFoto(body.photo))
  }
  if (body.pin !== undefined) {
    // Trocar o PIN de outra pessoa fica restrito ao administrador.
    if (me.id !== id && !me.is_admin)
      throw new ApiError(403, 'Sem permissao para trocar esta senha.')
    if (me.id === id) {
      const row = await c.env.DB.prepare(`SELECT pin_hash FROM members WHERE id = ?`)
        .bind(id)
        .first<{ pin_hash: string }>()
      const currentPin = reqPin(body.current_pin)
      if (!row || !(await verifyPin(currentPin, row.pin_hash)))
        throw new ApiError(401, 'A senha atual esta incorreta.')
    }
    sets.push('pin_hash = ?')
    vals.push(await hashPin(reqPin(body.pin)))
  }
  if (!sets.length) throw bad('Nada para atualizar.')

  sets.push('updated_at = ?')
  vals.push(ts, id)

  await c.env.DB.prepare(`UPDATE members SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()
  return c.json({ ok: true })
})

api.delete('/members/:id', requireAdmin, async (c) => {
  const me = c.get('member')
  const id = c.req.param('id')
  if (id === me.id) throw bad('Voce nao pode remover o seu proprio acesso.')

  const ts = now()
  // Desativar em vez de apagar preserva o historico de quem adicionou cada item.
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE members SET active = 0, updated_at = ? WHERE id = ?`,
    ).bind(ts, id),
    c.env.DB.prepare(`DELETE FROM sessions WHERE member_id = ?`).bind(id),
  ])
  return c.json({ ok: true })
})

/* ------------------------------------------------------------------ */
/* Montagem                                                            */
/* ------------------------------------------------------------------ */

app.route('/api', api)

/**
 * Pagina de diagnostico. E montada aqui no Worker, sem depender de nenhum
 * arquivo estatico e sem depender de JavaScript para mostrar o basico.
 * Serve para descobrir, do lado do usuario, o que nao esta chegando.
 */
app.get('/diagnostico', (c) => {
  const cf = (c.req.raw as any).cf || {}
  const linha = (k: string, v: string) =>
    `<tr><td>${k}</td><td><b>${v}</b></td></tr>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Diagnóstico</title>
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:16px;background:#0f1512;color:#e8efe9;font-size:15px}
  h1{font-size:1.2rem;margin:0 0 4px}
  h2{font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:#93a29a;margin:22px 0 6px}
  table{width:100%;border-collapse:collapse;table-layout:fixed}
  td{padding:7px 4px;border-bottom:1px solid #2a352d;vertical-align:top;overflow-wrap:anywhere;font-size:.9rem}
  td:first-child{color:#93a29a;width:40%}
  p{overflow-wrap:anywhere}
  .ok{color:#22c55e}.bad{color:#f87171}
  .box{background:#171f1a;border:1px solid #2a352d;border-radius:12px;padding:12px;margin-top:10px}
  button{width:100%;min-height:48px;margin-top:12px;border-radius:12px;border:0;background:#16a34a;color:#fff;font-weight:600;font-size:1rem}
</style></head><body>

<h1>Diagnóstico da Lista da Família</h1>
<p class="ok">Esta parte apareceu, então o servidor respondeu e o HTML chegou até você.</p>

<h2>1. Servidor</h2>
<table>
${linha('Hora em Brasília', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}
${linha('Seu IP', c.req.header('CF-Connecting-IP') || 'desconhecido')}
${linha('País / região', String(cf.country || '?') + ' / ' + String(cf.colo || '?'))}
${linha('Navegador informado', (c.req.header('User-Agent') || '').slice(0, 90))}
</table>

<h2>2. JavaScript</h2>
<noscript><p class="bad">O JavaScript está DESLIGADO ou bloqueado neste navegador. É por isso que o aplicativo não sai da tela de carregamento.</p></noscript>
<div class="box" id="js"><span class="bad">Se esta frase não mudar em alguns segundos, o JavaScript não executou.</span></div>

<h2>3. Arquivos do aplicativo</h2>
<div class="box"><table id="rec"><tr><td>testando...</td><td></td></tr></table></div>

<button onclick="limpar()">Limpar cache e service worker</button>

<script>
try{new Image().src='/api/diag/diagnostico-js-executou?t='+Date.now()}catch(e){}
var el=document.getElementById('js');
el.innerHTML='<span class="ok">JavaScript executou normalmente.</span>';
var t=document.getElementById('rec');
function add(k,v,bom){t.innerHTML+='<tr><td>'+k+'</td><td class="'+(bom?'ok':'bad')+'"><b>'+v+'</b></td></tr>'}
t.innerHTML='';
add('Navegador', navigator.userAgent.slice(0,60), true);
add('Online', String(navigator.onLine), navigator.onLine);
try{localStorage.setItem('t','1');localStorage.removeItem('t');add('Armazenamento local','funciona',true)}catch(e){add('Armazenamento local','BLOQUEADO: '+e.message,false)}
add('Cookies', navigator.cookieEnabled?'habilitados':'BLOQUEADOS', navigator.cookieEnabled);
var arquivos=['/app.js?v=2','/style.css?v=2','/api/status','/manifest.json'];
arquivos.forEach(function(u){
  var t0=Date.now();
  fetch(u,{cache:'no-store'}).then(function(r){
    return r.text().then(function(b){
      add(u, r.status+' | '+b.length+' bytes | '+(Date.now()-t0)+'ms', r.status===200&&b.length>0)
    })
  }).catch(function(e){ add(u,'FALHOU: '+e.message,false) })
});
if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(r){add('Service workers', r.length+' registrado(s)', true)})}
function limpar(){
  try{localStorage.clear()}catch(e){}
  var p=[];
  if(window.caches)p.push(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}));
  if(navigator.serviceWorker)p.push(navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}));
  Promise.all(p).then(function(){location.href='/'})
}
</script>
</body></html>`

  return c.html(html, 200, {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  })
})

// Qualquer rota que nao seja da API e nao case com um arquivo estatico
// devolve o app (o front e uma pagina unica).
app.all('*', async (c) => {
  if (c.req.path.startsWith('/api'))
    return c.json({ error: 'Rota nao encontrada.' }, 404)
  const url = new URL(c.req.url)
  url.pathname = '/index.html'
  return c.env.ASSETS.fetch(new Request(url.toString(), { headers: c.req.raw.headers }))
})

export default app
