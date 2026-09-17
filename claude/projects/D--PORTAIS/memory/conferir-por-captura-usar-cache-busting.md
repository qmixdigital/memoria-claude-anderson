---
name: conferir-por-captura-usar-cache-busting
description: Captura de tela do Chrome headless serve página velha mesmo com perfil novo; só query de cache-busting resolve
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-19T17:52:16.963Z
---

Ao conferir um ajuste por captura de tela, acrescentar uma query à URL
(`?v=agora`). Sem ela o Chrome headless devolve a versão anterior mesmo com
`--user-data-dir` novo a cada chamada, e mesmo com o `--host-resolver-rules`
apontando direto para o IP de origem, que já pula a Cloudflare. O vhost responde
`Cache-Control: no-cache` e ainda assim a página velha aparece.

**Why:** já custou tempo duas vezes no mesmo dia. A conclusão errada é "o patch
não pegou", e o reflexo é mexer no código que estava certo. O jeito de separar
uma coisa da outra é conferir o HTML no disco do servidor antes de acreditar na
captura.

**How to apply:** conferir com `grep` no arquivo em `/srv/portais/<slug>/public/`
primeiro, e só então tirar a captura, sempre com a query. Ver
[[qa-mobile-chrome-headless]] e [[reiniciar-motor-depois-de-editar]].

O `?v=` não basta sozinho: a purga da Cloudflare é **assíncrona** e responde
`success` antes de a borda esquecer a página. No euvo, três capturas seguidas
depois da purga mostraram o layout antigo, e por pouco não mexi no CSS de novo
atrás de um defeito que já estava corrigido. Antes de tocar em CSS por causa de
uma captura, baixar o HTML e conferir se a regra nova saiu nele.

## A captura também precisa rolar a página antes do print

Imagem com `loading="lazy"` abaixo da dobra **não carrega** no Chrome headless,
nem com `captureBeyondViewport`. O print sai com a caixa cinza do placeholder e
o QA acusa "cartão sem foto" onde a foto existe. Aconteceu em 30/08/2026 no
rumourisnews: conclui que era artefato da captura, e era mesmo, mas o defeito
real estava ao lado e a captura suja atrapalhou os dois diagnósticos.

Antes do print, rolar até o fim e voltar:

```js
(function(){var y=0,h=document.documentElement.scrollHeight;
var t=setInterval(function(){y+=600;window.scrollTo(0,y);
if(y>h){clearInterval(t);window.scrollTo(0,0);}},60);})()
```

e esperar uns 5 segundos depois disso. Está embutido no `captura_inteira.py`.

**E conferir a contagem no HTML servido, não só na tela.** `curl` da página e
`grep -c "<img"` decide a questão em um segundo, enquanto o print ainda pode
estar velho. No mesmo dia um print desatualizado me fez achar que o patch não
tinha aplicado, quando o disco e a CDN já serviam a versão nova.

⚠️ E o `/tmp` do Git Bash é compartilhado com outros processos: baixar para
`/tmp/home.html` me devolveu o HTML de **outro site** e quase virou um relatório
de bug que não existia. Baixar sempre para o scratchpad da sessão.
