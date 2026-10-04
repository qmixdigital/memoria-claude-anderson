---
name: gsc-chaves-por-variavel
description: O gsc_api.py passou a ler as service accounts por variável de ambiente; sem exportá-las ele falha com NoneType e parece falta de acesso
metadata:
  type: reference
---

Desde 20/09/2026 o `gsc_api.py` da skill google-console-analise não tem mais caminho fixo: lê `BACKLINKGUARD_GOOGLE_SA`, `ENJAI_493011_5BC78FF8F355` e `SEOQMIX_024E9465E9D9` (cada uma com o caminho de um JSON). Sem elas, `CHAVES` fica vazia, `--propriedades` não imprime nada e `sessao_para` devolve `(None, None)`, o que estoura como `AttributeError: 'NoneType' object has no attribute 'replace'`.

Em 03/10/2026 os três JSON ainda estavam em `C:/Users/User/Documents/APIs/`, então bastou exportar as três variáveis apontando para eles antes de rodar qualquer script (o mesmo vale para `gsc_paginas.py` e `inventario.py` da skill aumentar-da-dr). A propriedade deste site é `sc-domain:nutricionista.digital`, na chave enjai.
