---
name: next-not-found-route-group
description: No Next 16 um not-found.tsx dentro de route group nao gera boundary e o 404 sai sem conteudo; precisa de app/not-found.tsx na raiz
metadata: 
  node_type: memory
  type: reference
  originSessionId: 63176e52-9a9d-4e57-aac7-20bb14f54992
  modified: 2026-08-11T14:21:45.640Z
---

No Next.js 16 (App Router), `not-found.tsx` colocado **dentro de um route group** (ex.: `app/(public)/not-found.tsx`) **não é compilado como boundary**. O build não gera artefato para ele, e o `notFound()` das rotas daquele grupo cai no fallback interno do Next: status 404 correto, corpo do documento **vazio**.

Sintoma exato no HTML servido:

```html
<body><div hidden=""><!--$--><!--/$--></div><script>...</script></body>
```

Título do documento vira o default do layout, não o da 404, e não há um único link de navegação. Passa desapercebido porque o status HTTP está certo e o navegador renderiza a página normalmente a partir do payload RSC — só `curl` e crawler sem JS veem branco.

**Correção:** criar `app/not-found.tsx` na **raiz** de `app/` e remover o do route group. Confirmar no build que aparece o artefato `.next/server/app/_not-found.html` com conteúdo real:

```bash
python3 -c "import re,io; h=io.open('.next/server/app/_not-found.html').read(); \
print(len(re.sub(r'<[^>]*>',' ',h).split()))"
```

**Limitação que permanece:** mesmo com o arquivo na raiz, o HTML **servido em requisição** continua com shell vazio para `notFound()` disparado em rota dinâmica — o conteúdo vai só no payload RSC. Tentei tornar o layout raiz não-async (trocando `await import()` por import estático) e não resolveu. Consertar por nginx exigiria substituir o corpo de respostas 404, o que quebra navegação client-side (o router espera payload RSC, não HTML) e o corpo de erro das rotas de API. Numa página `noindex` não compensa o risco.

O not-found da raiz não deve depender do banco: se ele puxar o layout que consulta Postgres, o site passa a precisar do banco para conseguir mostrar erro.
