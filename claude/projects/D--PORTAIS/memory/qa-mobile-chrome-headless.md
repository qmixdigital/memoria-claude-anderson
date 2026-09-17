---
name: qa-mobile-chrome-headless
description: "Chrome headless tem largura mínima de 500px, então --window-size=390 mostra um estouro de layout que não existe"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T00:34:36.280Z
---

`--window-size=390,900` **não** produz viewport de 390. O Chrome aplica um
mínimo de janela e renderiza a **500**, e o `--screenshot` recorta em 390. O
print sai com texto cortado na lateral e parece um site quebrado no mobile.

Para QA de mobile de verdade, usar CDP:

```python
cmd('Emulation.setDeviceMetricsOverride',
    {'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
```

Subir o Chrome com `--remote-debugging-port` exige também
`--remote-allow-origins='*'`, senão o handshake do WebSocket volta **403**.

A prova objetiva de que não há estouro é pedir ao próprio navegador:

```js
document.documentElement.scrollWidth === window.innerWidth
```

**Medir cor de pixel na borda da captura não serve.** Cabeçalho e rodapé ocupam
a largura toda, então qualquer linha lida dá "conteúdo até a borda" e vira falso
positivo.

Perdi várias rodadas caçando um bug de CSS que não existia no agoranoticias.

**Em 19/08/2026 mordeu de novo, de outro jeito:** capturei o blogse a 430px e o
botão do menu sanfonado "não aparecia". Ele estava lá, no canto direito, e o
recorte de 430 sobre uma renderização de 500 cortou justamente ele. A pista é
essa: elemento alinhado à direita que some no print, com o resto do layout
inteiro parecendo normal. Repetir a 500 antes de mexer em qualquer CSS.

Relacionado: [[conversao-total]], [[layout-nada-centralizado]]
