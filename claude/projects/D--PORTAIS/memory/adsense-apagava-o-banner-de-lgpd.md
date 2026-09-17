---
name: adsense-apagava-o-banner-de-lgpd
description: o guard do motor procurava "cookie_consent", que o próprio Consent Mode do AdSense escreve, e o banner sumia em todo portal com anúncio
metadata:
  node_type: memory
  type: project
---

O motor injeta o banner de LGPD assim:

```js
if (html.indexOf('cookie_consent') < 0 && html.indexOf('</body>') > 0) {
```

A intenção era não injetar duas vezes. Só que o **Consent Mode do AdSense**, que
o próprio motor escreve no `<head>` quando o portal tem `adsense`, também cita a
palavra:

```js
var _ok=document.cookie.indexOf("cookie_consent=todos")>=0;
```

Resultado: **todo portal com AdSense ficava sem banner**. Eram **10 dos 20** da
opengravity, incluindo os cinco recém-convertidos.

**Why:** o estrago é duplo e nenhum aparece numa conferência de HTTP. Falta o
aviso que a LGPD exige, e sem banner ninguém aceita nada: o consentimento fica
`denied` para sempre e o anúncio serve despersonalizado, que rende menos.

**How to apply:** a marca é o **id do próprio banner**, `lgpd-<slug>`, que só
existe depois de ele ter sido injetado:

```js
const _marcaLgpd = 'id="lgpd-' + String((site && site.slug) || 'p') + '"';
if (html.indexOf(_marcaLgpd) < 0 && html.indexOf('</body>') > 0) {
```

⚠️ A clinicas-vps tem outra implementação, mais antiga, que sempre emite o
banner: o guard nem existe lá. Conferir sempre com `curl | grep "Aceitar todos"`
**pelo domínio real**, e nunca por `--resolve` no IP, que nos portais atrás da
Cloudflare devolve vazio e faz parecer que o banner sumiu. Ver
[[banner-lgpd-e-og-image]] e [[adsense-na-migracao]].
