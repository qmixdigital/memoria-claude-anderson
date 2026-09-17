---
name: feedback-urls-completas-clicaveis
description: Sempre entregar URL completa e clicavel (https://dominio/caminho), nunca caminho relativo nem so o slug
metadata:
  type: feedback
---

Sempre que o operador pedir uma URL, entregar a **URL absoluta completa e clicavel**:
`https://dominio.com.br/caminho/` inteiro, nunca `/caminho/`, nunca so o slug,
nunca o dominio separado do caminho em colunas quando ele pediu "a URL".

**Why:** ele confere duas coisas de uma vez, o formato do URL (categoria, slug,
barra final) e o conteudo, clicando direto para abrir no navegador. Caminho
relativo obriga ele a montar o endereco na mao.

**NUNCA dentro de bloco de codigo.** Cobrado de novo em 04/09/2026: entreguei o
resumo de publicacao dentro de ``` e o link virou texto morto, sem poder clicar.
Bloco de codigo, tabela em fonte fixa e trecho entre crases matam o link, mesmo
com a URL completa e correta. Se o resumo tiver formato de bloco, o link sai
fora dele, em linha propria.

**How to apply:** em listagens de auditoria, relatorios de backlink, resultado de
varredura na rede e planilha, montar `https://` + dominio + caminho + barra final
quando o site usa barra. Em terminal a URL solta ja fica clicavel; em artifact,
usar `<a href>`. Vale tambem para os links guest e links do cliente registrados em
[[feedback-registro-backlinks-por-dominio]] e para o resumo de entrega da skill
[[reference-skill-materias-jornalisticas]].

**Vale para ARQUIVO LOCAL também.** Cobrado em 11/09/2026: entreguei um relatório
como `[nome.md](D:/PORTAIS/...)` e o link não abria em lugar nenhum, porque o
arquivo está fora do workspace do editor. "Eu odeio quando você me envia alguma
coisa que eu não consigo clicar e abrir". Regra: arquivo fora do workspace sai
como `file:///D:/PORTAIS/BACKLINKS/arquivo.md` (barras normais, sem espaço sem
escapar) em linha própria, fora de bloco de código, e além do link **abrir o
arquivo no aplicativo padrão dele** com `cmd //c start "" "D:\caminho"` quando
for um relatório que ele precisa ler. Link relativo só para arquivo dentro do
workspace atual.

