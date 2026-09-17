---
name: cloudflare-sobrescreve-headers-de-seguranca
description: "Regra de zona na Cloudflare da rede QMIX SOBRESCREVE Content-Security-Policy, X-Frame-Options e Permissions-Policy que a origem manda"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5e6eff87-4b52-445e-b9e9-51cd22065df2
  modified: 2026-07-30T00:55:43.937Z
---

Cada zona da rede tem uma Transform Rule de resposta chamada **"Security headers
(CSP/XFO/Permissions)"**, com expressão `true`, que usa `set` (não `add`) em três
cabeçalhos:

- `Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()`
- `X-Frame-Options: SAMEORIGIN`

Confirmado em 29/07/2026 nas zonas `dominioprovisorio.net.br` (conta4) e
`qmiximoveis.com.br` (conta23) — as duas idênticas, o que indica que é padrão da
rede, não exceção.

**Why:** `set` DESCARTA o valor da origem. Um CSP forte emitido pelo app (nginx,
middleware do Next, PHP) nunca chega ao visitante nessas zonas: a origem responde
com a política completa e a borda a troca pela curta. Isso não aparece em teste
nenhum e não gera erro em log — só a comparação entre `curl` na origem e `curl` no
domínio público revela.

**How to apply:** ao endurecer CSP em qualquer site da rede, verificar a borda
depois de subir: `curl -sI https://dominio/` contra `curl -sI` na origem. Para o
CSP do app valer, ou excluir o hostname da regra
(`and http.host != "..."` na expressão) ou trocar `set` por `add` — `add` faz o
navegador aplicar as DUAS políticas, que é o comportamento desejado, mas muda o
efeito para todos os hosts da zona. As credenciais das contas ficam em
`D:/SISTEMAS/Cloudflare/contas.json` (ver `scripts/cutover/cloudflare.ts` do
qmiximoveis para o padrão de leitura sem vazar token).
