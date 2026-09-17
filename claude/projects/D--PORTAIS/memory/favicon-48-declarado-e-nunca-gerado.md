---
name: favicon-48-declarado-e-nunca-gerado
description: "O head declarava favicon-48 e favicon-144 e o motor da opengravity só gerava 96 e 192: dois 404 em toda página"
metadata:
  node_type: memory
  type: project
---

O `<head>` de todo portal declara quatro tamanhos de ícone: 48, 96, 144 e 192.
O `render.js` **da opengravity** gerava só o de 96 e o de 192, então
`/favicon-48.png` e `/favicon-144.png` respondiam **404 dentro do head**, em toda
página de todo portal daquela máquina. A clinicas-vps e a hostinger geravam os
quatro: era falha de uma instância só, o que torna a conferência por amostra
inútil se a amostra for do servidor errado.

O de 48 é o tamanho que o Google lê para montar o favicon do resultado de busca,
ver [[favicon-para-o-google]].

**Não dava erro em lugar nenhum:** o navegador cai no próximo tamanho declarado e
a aba fica certa. Só aparece pedindo o arquivo na mão:

```bash
curl -s SITE/ | grep -o 'href="/[a-zA-Z0-9._-]*\.\(png\|svg\|ico\)"' | sort -u |
  while read -r u; do echo "$(curl -s -o /dev/null -w '%{http_code}' SITE${u#href=\"}) $u"; done
```

**Corrigido em 22/08/2026**: o `render.js` da opengravity passou a gerar os dois,
nos dois caminhos que ele tem (com logo enviada e sem), e os 8 arquivos que
faltavam nos 15 portais de lá foram gerados a partir do `icon-512.png`.

Ver [[tres-instancias-do-motor]]: correção de motor precisa ser conferida nas
três, e a mesma linha âncora costuma não existir nas outras.
