---
name: cache-longo-sem-versionar-asset
description: "No Cloudflare Pages, max-age longo em CSS/JS sem ?v= no link trava a atualizacao na borda e o deploy parece nao ter subido"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a1e770fd-c076-4e4e-a360-b1c613a7adfc
  modified: 2026-09-06T16:03:58.334Z
---

Em 06/09/2026, no rinoplastiagoiania.com.br, coloquei `Cache-Control: public,
max-age=2592000` para `/style.css` e `/script.js` no arquivo `_headers`, mas o
HTML continuava chamando `style.css` sem nenhum parametro. O deploy subiu, o
HTML novo propagou na hora, e o CSS antigo ficou preso na borda
(`cf-cache-status: HIT`, `age` crescendo). O Anderson viu o layout velho no
celular e perguntou se era cache. Era, e a causa tinha sido minha.

**Why:** o cache da borda e do navegador e indexado pela URL. Se a URL do
asset nunca muda, `max-age` longo significa literalmente "nao me atualize por
30 dias", inclusive para todos os visitantes do site, nao so para quem esta
testando. Conferir com `curl` a URL do CSS **com** cache-buster (`?nc=`) da
falso positivo: o arquivo novo esta la, mas nao e o que a pagina carrega.

**How to apply:** em site estatico servido por Cloudflare Pages, so use
`max-age` longo em asset cuja URL muda quando o conteudo muda. Para CSS e JS
sem build system, referencie como `style.css?v=<md5 curto do arquivo>` e
recalcule o hash a cada alteracao (`hashlib.md5(open(f,'rb').read())
.hexdigest()[:8]`), com `max-age` curto mais `stale-while-revalidate` como
rede de seguranca. Imagem pode manter um ano, desde que trocar a imagem
signifique trocar o nome do arquivo. HTML sempre com
`max-age=0, must-revalidate`.

Ao validar um deploy, teste o comportamento renderizado da pagina real (estilo
computado via navegador), nunca so o conteudo do arquivo de asset. Ver
[[rinoplastia-goiania-hospedagem]].
