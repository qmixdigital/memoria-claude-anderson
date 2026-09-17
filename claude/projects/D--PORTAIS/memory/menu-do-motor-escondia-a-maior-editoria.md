---
name: menu-do-motor-escondia-a-maior-editoria
description: "O buildMenu pegava as 8 editorias com artigo mais recente, então a maior podia não aparecer em lugar nenhum"
metadata:
  node_type: memory
  type: project
---

O `buildMenu` percorria os artigos em ordem de data e ficava com as **8 primeiras
editorias que aparecessem**. Ou seja, o menu era "as 8 com o artigo mais
recente". Num portal de acervo isso esconde justamente a maior: no curiosododia,
**Games tinha 298 dos 898 artigos e não aparecia nem no menu nem no rodapé**. A
página respondia 200 e não havia um link para ela em lugar nenhum do site.

**Corrigido em 22/08/2026 nas três máquinas**: ordena por quantidade de artigos e
só então corta em 8.

⚠️ **O desempate precisa da posição guardada ANTES do `sort`.** A primeira versão
usava `ordem.indexOf(a)` dentro do comparador, lendo o array que o próprio `sort`
está reordenando: o comparador fica inconsistente e a ordem sai embaralhada, não
só o empate. O sintoma foi Casa (52) atrás de Negócios (38). O certo é
`const pos = new Map(ordem.map((k, i) => [k, i]))` antes de ordenar.

**Duas formas na rede:** a hostinger não tem o parâmetro `hide`.

⚠️ Só aparece depois de reconstruir. Ver [[reiniciar-motor-depois-de-editar]] e
[[tres-instancias-do-motor]].
