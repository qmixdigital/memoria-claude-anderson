---
name: autor-tipado-como-organization
description: "O schemaVariant sorteava o tipo do autor, e dois terços dos portais marcavam a pessoa que assina como Organization"
metadata:
  node_type: memory
  type: project
---

O `schemaVariant` do `fp` existe para a rede não sair com o mesmo dado
estruturado em todo portal. O problema é que ele sorteava também **o tipo do
autor**, e quem caía no variant 0 ou 2 publicava:

```json
"author":{"@type":"Organization","name":"Otávio Rangel"}
```

Uma pessoa marcada como editora. O Google lê a assinatura como a própria
publicação, a página do autor nunca se liga a uma entidade de pessoa, e o pacote
editorial fica só na fachada: as páginas existem, o `rel=author` aparece na
página, e o dado estruturado diz outra coisa. Eram **6 dos 15 portais** só na
opengravity.

**Corrigido em 22/08/2026** na opengravity e na hostinger (a clinicas-vps já
tinha equivalente): o tipo sai do fato e não do sorteio. Nome que consta do
`equipe` do `sites.json` vira `Person` e ganha `url` para a própria página de
autor; quem não consta segue `Organization`, que é o certo quando a assinatura é
a redação. A variação entre portais continua nos outros campos do variant.

⚠️ **A correção só aparece depois de reconstruir.** Os portais já convertidos
continuam servindo o HTML antigo até rodarem o rebuild. Ver
[[reiniciar-motor-depois-de-editar]], [[pacote-editorial-eeat]] e
[[conteudo-da-plataforma-nascia-sem-assinatura]], que é o defeito irmão: sem
assinatura de pessoa, este aqui nem chegava a importar.
