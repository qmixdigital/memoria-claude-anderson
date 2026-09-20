# -*- coding: utf-8 -*-
# Roda NA VPS: o gancho pagesDeploy avisa no Telegram quando o deploy falha, e
# conserta o dono dos arquivos antes de chamar o pages_pack (via sudo restrito).
import io, re, sys, shutil, time
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()
if "require('./alerta_telegram')" in s:
    print('ja aplicado'); sys.exit(0)
a = "const V = require('./variacoes');\n"
assert a in s
s = s.replace(a, a + "const { alerta: _alerta } = require('./alerta_telegram');\n", 1)
old = "        try { process.stdout.write(`[${slug}] pages deploy ${ok ? 'ok' : 'FALHOU (' + code + ')'}${ok ? '' : ': ' + out.slice(-300).replace(/\\n/g, ' ')}\\n`); } catch (_) {}\n"
assert old in s, 'linha do log nao achada'
s = s.replace(old, old + "        if (!ok) _alerta('deploy no Pages FALHOU: ' + slug + ' (' + code + ')\\n' + out.slice(-500));\n", 1)
# dono dos arquivos: antes do spawn, chama o script via sudo (permitido no sudoers)
old2 = "      const ch = spawn(process.execPath, ['/opt/portal-engine/pages_pack.js', slug]"
assert old2 in s, 'spawn nao achado'
s = s.replace(old2, "      try { require('child_process').execSync('sudo -n /opt/portal-engine/conserta_dono.sh ' + slug, { stdio: 'ignore', timeout: 20000 }); } catch (_) {}\n" + old2, 1)
shutil.copy(P, P + '.bak-alerta-' + time.strftime('%Y%m%d%H%M'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok: alerta + conserta_dono')
