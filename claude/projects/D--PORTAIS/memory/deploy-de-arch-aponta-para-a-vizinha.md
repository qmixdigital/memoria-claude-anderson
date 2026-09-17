---
name: deploy-de-arch-aponta-para-a-vizinha
description: o script de deploy troca a chave da tabela ARCHS mas não as funções, e o portal novo sobe com a cara do vizinho
metadata:
  node_type: memory
  type: feedback
---

O `deploy_<letra>.py` nasce de uma cópia do anterior. Ele faz duas coisas:
insere o bloco de funções e acrescenta a linha na tabela `ARCHS`. A linha vem de
uma constante `LINHA` que se troca por `str.replace` — e **quando o texto de
origem já foi mutado numa cópia anterior, o replace não casa e passa em silêncio**.

Resultado em 22/08/2026, na letra AG:

```js
AG: { letter: 'AG', css: afCss, header: afHeader, ... }
```

As funções `ag*` foram para o arquivo e **ninguém as chamava**. O portal inteiro
subiu com a cara do vizinho: mesmo cabeçalho, mesma paleta, mesma seção.

**Why:** não dá erro em lugar nenhum. O `archs.js` carrega, o motor sobe, o site
responde 200, o `fp.arch` no `sites.json` diz `AG`. Só aparece **na captura de
tela**, que é onde o Anderson confere.

**How to apply**, logo depois de todo deploy de arquitetura:

```bash
grep -n "<LETRA>: {" /opt/portal-engine/src/archs.js
```

A linha tem que citar as funções da própria letra. Melhor ainda: fazer o próprio
script conferir isso antes de reiniciar o motor. Ver
[[deploy-arch-nao-cortar-vizinha]] e [[arch-local-e-fonte-unica]].
