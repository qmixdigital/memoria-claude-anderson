---
name: rebuild-exit-code-antes-de-comparar
description: Comparar md5 da saida depois de mexer no motor nao prova nada se o rebuild falhou e o arquivo velho ficou
metadata:
  type: feedback
---

Troquei 59 links de editoria por `H.curl(slug)` na srv1166087, reconstrui os 28
portais e comparei o md5 das homes antes e depois. Deu igual nos 28, e eu tratei
isso como prova de que a mudanca era inerte.

**Deu igual porque o rebuild falhava.** Aquele motor nao tem `H.curl`, cada
reconstrucao morria com `TypeError: H.curl is not a function`, e o HTML antigo
continuava no disco. Comparar saida que nao foi regerada nao prova coisa nenhuma:
prova so que ela nao foi regerada.

**Why:** o laco de rebuild rodava com `>/dev/null 2>&1`, entao o erro nao
aparecia, e a comparacao de md5 parecia confirmar a hipotese que eu queria.

**How to apply:** depois de qualquer mudanca no `render.js` ou no `archs.js`,
conferir o **exit code** do rebuild portal por portal **antes** de olhar a saida:

```bash
for s in $(ls /srv/portais | grep -vE "_dedup|_shared"); do
  sudo -u portais node /tmp/reb.js $s >/dev/null 2>&1 || echo "FALHOU: $s"
done
```

Vale a mesma logica de [[conferir-por-captura-usar-cache-busting]]: a evidencia
que confirma o que voce espera e a que mais precisa ser questionada.

Ver tambem [[tres-instancias-do-motor]]: os tres motores estao em versoes
diferentes e um helper que existe num nao existe no outro.
