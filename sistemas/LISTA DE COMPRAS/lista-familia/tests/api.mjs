/* Teste ponta a ponta da API local do Worker. */
const B = 'http://127.0.0.1:8787/api'
let cookie = ''
let falhas = 0

async function call(path, { method = 'GET', body, noCookie } = {}) {
  const res = await fetch(B + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie && !noCookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  for (const c of sc) if (c.startsWith('sid=')) cookie = c.split(';')[0]
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

function ok(cond, label, extra) {
  console.log((cond ? '  ok   ' : '  FALHA') + '  ' + label + (extra !== undefined && !cond ? '  ' + JSON.stringify(extra) : ''))
  if (!cond) falhas++
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('\n[1] setup e sessao')
let r = await call('/setup', { method: 'POST', body: { name: 'Anderson', pin: '1234' } })
ok(r.data.ok === true, 'setup cria admin', r.data)
r = await call('/setup', { method: 'POST', body: { name: 'Outro', pin: '1111' } })
ok(r.status === 409, 'segundo setup e recusado', r)
r = await call('/me')
ok(r.data.name === 'Anderson', 'nome gravado', r.data)
ok(r.data.is_admin === 1, 'admin marcado')
const admin = r.data
r = await call('/me', { noCookie: true })
ok(r.status === 401, 'sem cookie devolve 401')

console.log('\n[2] carga inicial')
r = await call('/sync')
const cats = r.data.categories
ok(r.data.full === true, 'sync sem since e completo')
ok(cats.length === 13, 'treze categorias iniciais', cats.length)
ok(cats[0].name === 'Mercearia', 'ordenadas por sort_order', cats[0])
ok(cats[0].icon === 'carrinho' && cats[0].catalog === 'mercearia', 'categoria traz icone e chave de catalogo', cats[0])
ok(cats.some((c) => c.name === 'Farmácia'), 'acentuacao preservada')
const CAT = cats[0].id
let marca = r.data.now

console.log('\n[3] itens')
r = await call('/items', { method: 'POST', body: { category_id: CAT, name: 'Leite', quantity: '2 caixas' } })
const leite = r.data
ok(leite.name === 'Leite' && leite.done === 0, 'item criado', r.data)
ok(leite.added_by === admin.id, 'guarda quem adicionou')

const idCliente = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
r = await call('/items', { method: 'POST', body: { id: idCliente, category_id: CAT, name: 'Pão' } })
ok(r.data.id === idCliente, 'aceita id gerado no cliente')
r = await call('/items', { method: 'POST', body: { id: idCliente, category_id: CAT, name: 'Pão' } })
ok(r.data.id === idCliente, 'repetir o mesmo id nao duplica')
r = await call('/sync')
ok(r.data.items.length === 2, 'total de dois itens', r.data.items.length)

r = await call('/items', { method: 'POST', body: { category_id: CAT, name: '   ' } })
ok(r.status === 400, 'nome vazio recusado', r)
r = await call('/items', { method: 'POST', body: { category_id: 'nao-existe', name: 'X' } })
ok(r.status === 400, 'categoria inexistente recusada', r)

console.log('\n[4] sync incremental')
await espera(1100)
r = await call('/sync?since=' + encodeURIComponent(marca))
ok(r.data.full === false, 'sync com since e parcial')
ok(r.data.items.length === 2, 'traz apenas o que mudou', r.data.items.length)
ok(r.data.categories.length === 0, 'categorias sem mudanca nao voltam', r.data.categories.length)
marca = r.data.now

r = await call('/items/' + leite.id, { method: 'PATCH', body: { done: true } })
ok(r.data.done === 1 && r.data.done_by === admin.id, 'marcar comprado', r.data)
r = await call('/sync?since=' + encodeURIComponent(marca))
ok(r.data.items.length === 1 && r.data.items[0].done === 1, 'edicao aparece no incremental', r.data.items)
marca = r.data.now

r = await call('/items/' + leite.id, { method: 'PATCH', body: { name: 'Leite integral' } })
ok(r.data.name === 'Leite integral', 'renomear item')
r = await call('/sync?since=' + encodeURIComponent(marca))
ok(r.data.items.length === 1 && r.data.items[0].name === 'Leite integral', 'renomear propaga no sync', r.data.items)
marca = r.data.now

r = await call('/items/' + idCliente, { method: 'DELETE' })
ok(r.data.ok === true, 'excluir item')
r = await call('/sync?since=' + encodeURIComponent(marca))
ok(r.data.items.length === 1 && !!r.data.items[0].deleted_at, 'exclusao chega no sync incremental', r.data.items)
marca = r.data.now
r = await call('/sync')
ok(r.data.items.length === 1, 'carga completa ignora excluidos', r.data.items.length)

console.log('\n[5] frequentes')
r = await call('/sync')
const freq = r.data.frequents
ok(freq.length === 2, 'dois frequentes registrados', freq.length)
const pao = freq.find((f) => f.name === 'Pão')
ok(pao && pao.times_used === 1, 'repetir item ainda pendente nao infla o contador', pao)
r = await call('/frequents/' + pao.id, { method: 'DELETE' })
r = await call('/sync')
ok(r.data.frequents.length === 1, 'frequente removido some da carga', r.data.frequents.length)

console.log('\n[6] limpar comprados')
await call('/items', { method: 'POST', body: { category_id: CAT, name: 'Arroz' } })
r = await call('/items/clear-done', { method: 'POST', body: { category_id: CAT } })
ok(r.data.removed === 1, 'limpou apenas o comprado', r.data)
r = await call('/sync')
ok(r.data.items.length === 1 && r.data.items[0].name === 'Arroz', 'sobrou o pendente', r.data.items.map((i) => i.name))

console.log('\n[7] tarefas')
r = await call('/tasks', { method: 'POST', body: { title: 'Marcar consulta', due_date: '2026-08-20', assignee_id: admin.id } })
const tarefa = r.data
ok(tarefa.title === 'Marcar consulta' && tarefa.due_date === '2026-08-20', 'tarefa criada', r.data)
r = await call('/tasks', { method: 'POST', body: { title: 'X', due_date: '20/08/2026' } })
ok(r.status === 400, 'data em formato errado recusada', r)
r = await call('/tasks', { method: 'POST', body: { title: 'Y', assignee_id: 'fantasma' } })
ok(r.status === 400, 'responsavel inexistente recusado', r)
r = await call('/tasks/' + tarefa.id, { method: 'PATCH', body: { done: true } })
ok(r.data.done === 1, 'concluir tarefa')
r = await call('/tasks/' + tarefa.id, { method: 'DELETE' })
r = await call('/sync')
ok(r.data.tasks.length === 0, 'tarefa excluida some', r.data.tasks.length)

console.log('\n[8] categorias')
r = await call('/categories', { method: 'POST', body: { name: 'Padaria caseira', icon: 'pao' } })
const padaria = r.data
ok(padaria.name === 'Padaria caseira' && padaria.sort_order === 14, 'categoria criada no fim da ordem', r.data)
ok(padaria.icon === 'pao', 'categoria guarda o icone escolhido', r.data)
await call('/items', { method: 'POST', body: { category_id: padaria.id, name: 'Sonho' } })
r = await call('/categories/' + padaria.id, { method: 'PATCH', body: { name: 'Padaria da esquina' } })
ok(r.data.name === 'Padaria da esquina', 'categoria renomeada')
r = await call('/categories/' + padaria.id, { method: 'DELETE' })
ok(r.data.ok === true, 'categoria excluida')
r = await call('/sync')
ok(!r.data.categories.some((c) => c.id === padaria.id), 'categoria some da carga')
ok(!r.data.items.some((i) => i.category_id === padaria.id), 'itens da categoria excluida somem junto')

console.log('\n[9] membros e permissoes')
r = await call('/members', { method: 'POST', body: { name: 'Maria', pin: '4321' } })
const maria = r.data
ok(maria.name === 'Maria' && maria.is_admin === 0, 'membro criado sem admin', r.data)
r = await call('/members', { method: 'POST', body: { name: 'Zé', pin: '12' } })
ok(r.status === 400, 'PIN de dois digitos recusado', r)
r = await call('/members', { method: 'POST', body: { name: 'Divina', pin: '199899' } })
ok(r.data.name === 'Divina', 'PIN de seis digitos aceito', r)
r = await call('/members/' + r.data.id, { method: 'DELETE' })

const cookieAdmin = cookie
console.log('\n[9b] foto de perfil')
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
r = await call('/members/' + admin.id, { method: 'PATCH', body: { photo: PNG } })
ok(r.data.ok === true, 'aceita foto em data URI', r)
r = await call('/status')
ok(r.data.members.find((m) => m.id === admin.id).photo === PNG, 'foto aparece na tela de login', r.data.members[0])
r = await call('/sync')
ok(r.data.members.find((m) => m.id === admin.id).photo === PNG, 'foto vem na sincronizacao')
r = await call('/members/' + admin.id, { method: 'PATCH', body: { photo: 'javascript:alert(1)' } })
ok(r.status === 400, 'recusa conteudo que nao e imagem', r)
r = await call('/members/' + admin.id, { method: 'PATCH', body: { photo: 'data:image/png;base64,' + 'A'.repeat(210000) } })
ok(r.status === 400, 'recusa imagem grande demais', r.status)
r = await call('/members/' + admin.id, { method: 'PATCH', body: { photo: '' } })
ok(r.data.ok === true, 'apaga a foto')
r = await call('/status')
ok(!r.data.members.find((m) => m.id === admin.id).photo, 'foto some depois de apagada')

console.log('\n[10] login, PIN errado e limite de tentativas')
cookie = ''
r = await call('/login', { method: 'POST', body: { member_id: maria.id, pin: '0000' } })
ok(r.status === 401, 'PIN errado nao entra')
for (let i = 0; i < 4; i++) await call('/login', { method: 'POST', body: { member_id: maria.id, pin: '0000' } })
r = await call('/login', { method: 'POST', body: { member_id: maria.id, pin: '4321' } })
ok(r.status === 429, 'bloqueia depois de cinco erros', r)
r = await call('/login', { method: 'POST', body: { member_id: admin.id, pin: '1234' } })
ok(r.data.ok === true, 'o bloqueio de um membro nao afeta os outros', r)
const cookieAdmin2 = cookie

console.log('\n[11] regras de admin')
// entra como Maria usando o proprio token do admin para criar sessao dela
cookie = cookieAdmin2
r = await call('/members/' + maria.id, { method: 'PATCH', body: { name: 'Maria Clara' } })
ok(r.data.ok === true, 'admin edita outro membro')
r = await call('/members/' + admin.id, { method: 'DELETE' })
ok(r.status === 400, 'admin nao remove o proprio acesso', r)
r = await call('/members/' + admin.id, { method: 'PATCH', body: { current_pin: '9999', pin: '5555' } })
ok(r.status === 401, 'troca de PIN exige o PIN atual', r)
r = await call('/members/' + admin.id, { method: 'PATCH', body: { current_pin: '1234', pin: '5555' } })
ok(r.data.ok === true, 'troca de PIN com o PIN atual correto')
cookie = ''
r = await call('/login', { method: 'POST', body: { member_id: admin.id, pin: '5555' } })
ok(r.data.ok === true, 'entra com o PIN novo')
r = await call('/login', { method: 'POST', body: { member_id: admin.id, pin: '1234' } })
ok(r.status === 401, 'PIN antigo deixa de valer')

console.log('\n[12] logout')
cookie = cookieAdmin2
r = await call('/logout', { method: 'POST' })
ok(r.data.ok === true, 'logout responde ok')
cookie = cookieAdmin2
r = await call('/me')
ok(r.status === 401, 'token invalidado apos logout', r)

console.log('\n[12b] item repetido nao duplica, mesmo vindo de outro aparelho')
cookie = cookieAdmin2
r = await call('/login', { method: 'POST', body: { member_id: admin.id, pin: '5555' } })
r = await call('/categories', { method: 'POST', body: { name: 'Teste duplicidade', icon: 'caixa' } })
const catDup = r.data.id
r = await call('/items', { method: 'POST', body: { category_id: catDup, name: 'Sabonete' } })
const idSabonete = r.data.id
ok(!r.data.ja_existia, 'primeiro sabonete e criado normalmente')

// Segundo aparelho: id proprio, sem saber do primeiro, e caixa diferente.
r = await call('/items', { method: 'POST', body: { id: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff', category_id: catDup, name: '  sabonete  ' } })
ok(r.data.id === idSabonete, 'devolve o item que ja existia em vez de criar outro', r.data)
ok(r.data.ja_existia === true, 'marca que o item ja estava la')

r = await call('/sync')
ok(r.data.items.filter((i) => i.category_id === catDup && !i.deleted_at).length === 1,
  'so existe um sabonete na categoria', r.data.items.filter((i) => i.category_id === catDup).map((i) => i.name))

// Depois de comprado, incluir de novo cria item novo e soma no contador.
await call('/items/' + idSabonete, { method: 'PATCH', body: { done: true } })
r = await call('/items', { method: 'POST', body: { category_id: catDup, name: 'Sabonete' } })
ok(r.data.id !== idSabonete && !r.data.ja_existia, 'item ja comprado pode ser incluido de novo', r.data)
r = await call('/sync')
const freqDup = r.data.frequents.find((f) => f.category_id === catDup && f.name === 'Sabonete')
ok(freqDup && freqDup.times_used === 2, 'ai sim o contador de frequentes soma', freqDup)
await call('/categories/' + catDup, { method: 'DELETE' })

console.log('\n[12c] portaria contra robo')
const comoRobo = async (caminho, ua) => {
  const r = await fetch(B.replace('/api', '') + caminho, { headers: { 'User-Agent': ua } })
  return r.status
}
ok(await comoRobo('/', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)') === 403,
  'Googlebot leva 403 na pagina')
ok(await comoRobo('/', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1') === 403,
  'GPTBot leva 403')
ok(await comoRobo('/', 'Mozilla/5.0 (compatible; ClaudeBot/1.0)') === 403, 'ClaudeBot leva 403')
ok(await comoRobo('/api/status', 'Mozilla/5.0 (compatible; PerplexityBot/1.0)') === 403, 'robo nem chega na API')
ok(await comoRobo('/', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1') === 200,
  'iPhone de verdade entra normalmente')
ok(await comoRobo('/', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36') === 200,
  'Android de verdade entra normalmente')

const rob = await fetch(B.replace('/api', '') + '/robots.txt')
const robTxt = await rob.text()
ok(rob.status === 200 && /User-agent: \*\s*\nDisallow: \//.test(robTxt), 'robots.txt proibe tudo', robTxt.slice(0, 60))
ok(/GPTBot/.test(robTxt) && /ClaudeBot/.test(robTxt) && /Google-Extended/.test(robTxt),
  'robots.txt nomeia os coletores de inteligencia artificial')

const pag = await fetch(B.replace('/api', '') + '/')
ok((pag.headers.get('x-robots-tag') || '').includes('noindex'), 'pagina sai com X-Robots-Tag',
  pag.headers.get('x-robots-tag'))

console.log('\n[13] rotas e assets')
cookie = ''
const raiz = await fetch('http://127.0.0.1:8787/')
ok(raiz.status === 200 && (await raiz.text()).includes('Lista da Família'), 'index.html servido')
const inexistente = await fetch('http://127.0.0.1:8787/api/nao-existe')
ok(inexistente.status === 401 || inexistente.status === 404, 'rota de api desconhecida nao vaza dado', inexistente.status)
const spa = await fetch('http://127.0.0.1:8787/qualquer-coisa')
ok(spa.status === 200, 'rota desconhecida cai no app')

console.log('\n' + (falhas ? falhas + ' FALHA(S)' : 'todos os testes passaram'))
process.exit(falhas ? 1 : 0)
