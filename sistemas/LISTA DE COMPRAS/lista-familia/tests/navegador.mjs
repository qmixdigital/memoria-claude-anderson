/* Teste em navegador de verdade, via Chrome DevTools Protocol.
   Existe por um motivo concreto: o jsdom não avalia CSS, então ele aprova
   uma tela marcada como oculta que continua sendo desenhada. Foi assim que
   passou despercebido o bug em que .center{display:flex} vencia a regra
   [hidden]{display:none} do navegador e todas as telas ficavam empilhadas.

   Requer o "npm run dev" rodando. Uso: npm run test:navegador */

import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ALVO = process.env.ALVO || 'http://127.0.0.1:8787'
const PORTA_CDP = 9333
let falhas = 0

function ok(cond, label, extra) {
  console.log((cond ? '  ok   ' : '  FALHA') + '  ' + label + (!cond && extra !== undefined ? '  ' + JSON.stringify(extra) : ''))
  if (!cond) falhas++
}

const CAMINHOS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
const navegador = CAMINHOS.find((p) => existsSync(p))
if (!navegador) {
  console.log('nenhum Chrome ou Edge encontrado, teste ignorado')
  process.exit(0)
}

const perfil = join(tmpdir(), 'lista-familia-teste-' + Date.now())
// O app recusa navegador automatizado, e o teste tem que se apresentar como
// aparelho de verdade. Sem isto, a portaria contra robô devolve 403 aqui.
const UA_REAL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'

const proc = spawn(navegador, [
  '--headless=new',
  '--user-agent=' + UA_REAL,
  '--disable-gpu',
  '--no-first-run',
  '--no-sandbox',
  '--remote-debugging-port=' + PORTA_CDP,
  '--user-data-dir=' + perfil,
  ALVO,
])

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function alvoDaPagina() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json`)).json()
      const pagina = lista.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (pagina) return pagina
    } catch (e) {}
    await espera(250)
  }
  throw new Error('o navegador não abriu a porta de depuração')
}

const pagina = await alvoDaPagina()
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))

let seq = 0
const pendentes = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (pendentes.has(msg.id)) {
    pendentes.get(msg.id)(msg)
    pendentes.delete(msg.id)
  }
}
function cdp(method, params) {
  const id = ++seq
  return new Promise((resolve) => {
    pendentes.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

/** Roda a expressão na página, tolerando a troca de contexto que acontece
    quando a página ainda está navegando ou acabou de recarregar. */
async function naPagina(expr, tentativas = 15) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await avaliar(expr)
    } catch (e) {
      // O contexto some enquanto a página navega, e ainda não existe antes de
      // ela carregar. As duas situações são só questão de esperar mais um
      // pouco, e as mensagens do protocolo variam.
      if (!/context/i.test(e.message)) throw e
      await espera(400)
    }
  }
  throw new Error('a página não parou de navegar')
}

async function avaliar(expr) {
  const r = await cdp('Runtime.evaluate', {
    expression: `(async () => { ${expr} })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.error) throw new Error('CDP: ' + JSON.stringify(r.error))
  if (r.result && r.result.exceptionDetails)
    throw new Error(
      'erro dentro da página: ' +
        (r.result.exceptionDetails.exception?.description ||
          r.result.exceptionDetails.text),
    )
  return r.result.result.value
}

console.log('\nnavegador: ' + navegador.split(/[\\/]/).pop() + '  |  alvo: ' + ALVO)

// Espera o carregamento terminar de verdade, olhando o que está desenhado.
const estado = await naPagina(`
  const desenhadas = () => [...document.querySelectorAll('.screen')]
    .filter(s => getComputedStyle(s).display !== 'none')
    .map(s => s.id);
  for (let i = 0; i < 100; i++) {
    const d = desenhadas();
    if (d.length === 1 && d[0] !== 'screen-loading') break;
    await new Promise(r => setTimeout(r, 200));
  }
  return {
    desenhadas: desenhadas(),
    alturaPagina: document.documentElement.scrollHeight,
    alturaJanela: window.innerHeight,
    textoVisivel: (document.body.innerText || '').trim().slice(0, 60),
    erros: window.__erros || [],
  };
`)

console.log('\n[1] apenas uma tela desenhada por vez')
ok(estado.desenhadas.length === 1, 'exatamente uma tela na tela', estado.desenhadas)
ok(
  !estado.desenhadas.includes('screen-loading'),
  'a tela de carregamento sai depois do boot',
  estado.desenhadas,
)

console.log('\n[2] a página não fica mais alta que a janela por telas empilhadas')
ok(
  estado.alturaPagina <= estado.alturaJanela * 1.5,
  'sem rolagem causada por telas sobrepostas',
  { pagina: estado.alturaPagina, janela: estado.alturaJanela },
)

console.log('\n[3] o conteúdo certo aparece')
ok(
  /Quem está usando|Primeiro acesso|Listas/.test(estado.textoVisivel),
  'texto de uma tela real está visível',
  estado.textoVisivel,
)

ws.close()
proc.kill()
try {
  rmSync(perfil, { recursive: true, force: true })
} catch (e) {}

console.log('\n' + (falhas ? falhas + ' FALHA(S)' : 'navegador real aprovou'))
process.exit(falhas ? 1 : 0)
