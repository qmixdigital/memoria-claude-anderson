---
name: 404-do-motor-e-404-html-na-raiz
description: O motor grava 404.html na raiz, nao 404/index.html; errar no vhost entrega o 404 cru do nginx
metadata:
  type: project
---

O motor escreve a pagina de erro em **`public/404.html`**, na raiz, e nao em
`public/404/index.html`. Vhost com `error_page 404 /404/index.html;` aponta para
arquivo que nao existe, e o visitante recebe o **404 cru do nginx**: sem marca,
sem `noindex`, sem banner de LGPD e sem `pauseAdRequests`.

Nada acusa isso. O site funciona, a auditoria sobre o HTML publicado passa (a 404
esta la, gerada, so nao e servida), e so aparece pedindo uma URL inexistente e
olhando o corpo da resposta, e nao so o codigo.

```nginx
error_page 404 /404.html;
```

Conferir sempre com o corpo, nao com o status:

```bash
curl -s SITE/nao-existe-xyz/ | grep -c noindex
```

Ver [[body-nao-abre-nas-archs-novas]]: a 404 era o quarto caminho de renderizacao
que terminava no rodape sem chamar `H.bodyEnd()`, depois de `pageHtml`, do mapa
do site e da busca.
