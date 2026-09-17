# -*- coding: utf-8 -*-
# Roda NA VPS: aplica as variacoes anti-footprint no render.js (backup .bak-variacoes).
# Idempotente: se ja tem `require('./variacoes')`, sai sem mexer.
import io, re, sys, shutil, time
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()
if "require('./variacoes')" in s:
    print('ja aplicado'); sys.exit(0)
orig = s
def troca(rx, novo, nome, flags=0, n=1):
    global s
    f = novo if callable(novo) else (lambda m: novo)
    s2, k = re.subn(rx, f, s, count=n, flags=flags)
    if k != n: print('FALHOU:', nome, '(%d casamentos)' % k); sys.exit(1)
    s = s2; print('ok:', nome)

# 1) require
troca(r"(const \{ getArch \} = require\('\./archs'\);\n)", lambda m: m.group(1) + "const V = require('./variacoes');\n", 'require')
# 2) JSON-LD com ordem de chaves por portal
troca(r"JSON\.stringify\(o\)\}</script>`\)\.join\('\\n'\);", "JSON.stringify(V.ordenaLd(ctx.site, o))}</script>`).join('\\n');", 'jsonld')
# 3) 404/410
troca(r"function _raw_notFoundPage\(site, menu\) \{", "function _raw_notFoundPage(site, menu, codigo) {", 'nf assinatura')
troca(r"const meta = \{ title: `Página não encontrada - \$\{site\.name\}`, desc: 'A página que você procura não existe ou foi removida\.',",
      "const nf = V.naoEncontrado(site, { n: esc(site.name), de: (typeof _artigoDe === 'function' ? _artigoDe(site) : 'do ' + esc(site.shortName || site.name)) }, codigo || 404); const meta = { title: `${nf.title} - ${site.name}`, desc: nf.desc,", 'nf meta')
troca(r'<div class="nf-code">404</div>\n<h1>Página não encontrada</h1>\n<p>A página que você procura pode ter sido movida ou não existe mais\.</p>\n<p><a class="nf-home" href="/">Ir para a home [^<]*</a></p>',
      '<div class="nf-code">${codigo || 404}</div>\n<h1>${nf.title}</h1>\n<p>${nf.p}</p>\n<p><a class="nf-home" href="/">${nf.link}</a></p>', 'nf corpo')
troca(r"function notFoundPage\(site, menu\) \{ return _renomClasses\(site, _raw_notFoundPage\(site, menu\)\); \}",
      "function notFoundPage(site, menu, codigo) { return _renomClasses(site, _raw_notFoundPage(site, menu, codigo)); }", 'nf wrapper')
troca(r"(  writeAtomic\(pub\(cfg, site, '404\.html'\), notFoundPage\(site, menu\)\);\n)",
      lambda m: m.group(1) + "  writeAtomic(pub(cfg, site, '410.html'), notFoundPage(site, menu, 410));\n", '410.html')
# 4) robots.txt (as tres maquinas montam a string de um jeito; tudo vira V.robots)
m = re.search(r"  writeAtomic\(pub\(cfg, site, 'robots\.txt'\), `User-agent: \*\\nAllow: /\\nSitemap: \$\{site\.baseUrl\}/sitemap\.xml\\n(.*)\);\n", s)
if not m: print('FALHOU: robots'); sys.exit(1)
resto = m.group(1)
if '${extras}' in resto:
    novo = "  writeAtomic(pub(cfg, site, 'robots.txt'), V.robots(site, extras.split('\\n').filter(Boolean)));\n"
elif '_temNews' in resto:
    novo = "  writeAtomic(pub(cfg, site, 'robots.txt'), V.robots(site, (_temNews ? [] : ['SEM_NEWS']).concat(_extra.split('\\n').filter(Boolean))));\n"
else:
    novo = "  writeAtomic(pub(cfg, site, 'robots.txt'), V.robots(site, []));\n"
s = s[:m.start()] + novo + s[m.end():]; print('ok: robots (%s)' % ('extras' if '${extras}' in resto else 'temNews' if '_temNews' in resto else 'simples'))
# 5) institucionais
V = "{ n, de: (typeof _artigoDe === 'function' ? _artigoDe(site) : 'do ' + esc(site.shortName || site.name)) }"
troca(r"content: site\.about \|\| `<p>O <strong>\$\{n\}</strong> é um portal[\s\S]*?` \},", "content: site.about || V.quemSomos(site, %s) }," % V, 'quem-somos')
troca(r"content: `<p>Quer falar com a redação[\s\S]*?</script>` \},", "content: V.contato(site, %s) }," % V, 'contato')
troca(r"content: `<p>O \$\{n\} respeita a sua privacidade[\s\S]*?termos de uso do \$\{n\}</a>\.</p>` \},",
      "content: V.privacidade(site, %s, (typeof _secaoDiretorio === 'function' ? _secaoDiretorio(site).replace('<h2>5. ', '<h2>') : '')) }," % V, 'privacidade')
troca(r"content: `<p>Ao acessar e utilizar o \$\{n\}[\s\S]*?política de privacidade do \$\{n\}</a>\.</p>` \},", "content: V.termos(site, %s) }," % V, 'termos')

shutil.copy(P, P + '.bak-variacoes-' + time.strftime('%Y%m%d%H%M'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('gravado; linhas', orig.count('\n'), '->', s.count('\n'))
