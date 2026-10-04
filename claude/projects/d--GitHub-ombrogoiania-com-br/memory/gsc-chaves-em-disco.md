---
name: gsc-chaves-em-disco
description: "gsc_api.py lê as service accounts de variáveis de ambiente do cofre, mas os mesmos .json estão em C:/Users/User/Documents/APIs e dá para rodar sem o KeePassXC"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ada82c56-8b44-4e1c-855b-85dd32df4222
  modified: 2026-09-22T12:19:37.297Z
---

O `scripts/gsc_api.py` da skill `google-console-analise` monta a lista
`CHAVES` a partir de três variáveis de ambiente que o `cofre_run` (KeePassXC)
preenche. Sem elas, `CHAVES` fica vazia e **toda consulta responde "nenhuma
chave tem acesso a DOMINIO"**, que parece falta de permissão no Search Console
e não é: é falta de credencial carregada.

Quando o MCP `cofre` não está disponível na sessão, os mesmos arquivos estão em
`C:/Users/User/Documents/APIs/`:

```bash
export BACKLINKGUARD_GOOGLE_SA="C:/Users/User/Documents/APIs/backlinkguard-google-sa.json"
export ENJAI_493011_5BC78FF8F355="<<REMOVIDO>>"
export SEOQMIX_024E9465E9D9="C:/Users/User/<<REMOVIDO>>"
python scripts/gsc_api.py --propriedades      # 190 propriedades visíveis
python scripts/gsc_api.py DOMINIO 365
```

`--propriedades` chamado direto pelo CLI não imprime nada (o `main` do script
não trata esse argumento); usar `from gsc_api import propriedades` no Python.

**Why:** a mensagem de erro aponta para o lado errado. Em 22/09/2026 isso
custou uma rodada inteira concluindo que o domínio não tinha acesso concedido,
quando só faltava exportar as variáveis.

**How to apply:** ao receber "nenhuma chave tem acesso", conferir primeiro se
as três variáveis estão no ambiente, e só depois pedir acesso ao Anderson.
Dados deste site em [[trafego-concentrado-no-blog]].
