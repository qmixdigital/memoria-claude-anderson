---
name: dayane-editora-pagante-indexacao-auto
description: Dayane (lc_users 10) e Diego Augusto (lc_users 11) sao editores pagantes com indexacao automatica Apex; como a flag indexacao_auto funciona
metadata:
  type: project
---

Em 17/09/2026 o Anderson pediu a conta da **Dayane de Souza**
(`daianedesouza.ads@gmail.com`, lc_users 10): mesmos 42 dominios do Jean,
`tipo_cobranca = pagante` a R$ 50,00 por post (valor copiado do Felipe, ele
nao definiu), e **toda publicacao dela vai sozinha para indexacao Apex**, sem
aba de Indexacao e sem consumir credito. Isso virou a flag
`lc_users.indexacao_auto`, generica, ligada por UPDATE (nao tem tela).

**Why:** ele quer que ela so escreva e pague; a indexacao e cortesia/embutida,
por isso o fornecedor cobra 3 creditos por URL mas o sistema nao debita nada
dela.

**How to apply:** detalhes, arquivos e teste em `OPERACOES.md`, secao
"Indexacao automatica ao publicar". Modulo em `/opt/qmix/lib/indexacao-auto.php`,
gancho nas duas crons `lc-article-transfer*.php`, `lc_indexacoes.origem='auto'`
impede o `cron-indexacao-status.php` de devolver credito. **Diego Augusto**
(`contato@diegoaugusto.com`, lc_users 11) foi criado em 17/09/2026 no mesmo
molde: pagante R$ 50, 42 dominios do Jean, indexacao_auto = 1. Ela **nao** tem chave
da API nem usuario no MCP (so o Jean tem, ver [[api-editor-mcp-jean]]).
Ver [[faturamento-editores-asaas]] e [[indexacao-rapid-url-indexer]].

**Armadilha que a flag criou (28/09/2026):** o campo de CPF/CNPJ, exigido pelo
Asaas, morava so em `indexacao.php`. Esconder a area de Indexacao tirou dos dois
o unico caminho para informar o documento, e a cobranca falhava sem explicacao.
Corrigido levando o bloco para `pagamentos.php`. Licao geral: ao esconder uma
tela de um editor, conferir se nao existe passo obrigatorio so dentro dela.
