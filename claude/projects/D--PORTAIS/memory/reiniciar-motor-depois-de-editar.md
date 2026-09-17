---
name: reiniciar-motor-depois-de-editar
description: "Publicar pela API depois de editar render.js ou archs.js reescreve as páginas com o código antigo: reiniciar o serviço antes"
metadata:
  type: feedback
---

Depois de qualquer edição em `render.js` ou `archs.js`, **reiniciar o serviço
`portal-engine` antes de publicar qualquer artigo pela API**:

```bash
ssh <host> "systemctl restart portal-engine && sleep 2 && systemctl is-active portal-engine"
```

**Por quê:** o serviço carrega os módulos na memória quando sobe e não relê o
arquivo. Rodar `rebuildIndexes` por um `node` novo aplica o código atual, mas a
publicação pela API usa o processo antigo. Em 19/08/2026 eu redesenhei a
arquitetura V, reconstruí o portal, conferi o print e só então publiquei 10
artigos pela API. A publicação chama `rebuildIndexes` por dentro e **reescreveu a
home inteira com a arquitetura antiga**. O Anderson abriu o link e viu o layout
velho, com o print na mão provando que eu tinha acabado de dizer que estava
corrigido.

O sintoma é traiçoeiro: o print tirado pela origem logo depois do rebuild mostra
o layout novo, e a página só volta a ser a antiga depois da primeira publicação.

**Como aplicar:** a ordem segura é editar, reiniciar o serviço, publicar o que
for publicar e só então reconstruir e purgar. Conferir com
`systemctl show portal-engine -p ActiveEnterTimestamp` contra o `ls -la` do
arquivo editado: se o serviço subiu antes do arquivo, ele está com código velho.
Ver [[deploy-arch-nao-cortar-vizinha]] e [[arch-local-e-fonte-unica]].
