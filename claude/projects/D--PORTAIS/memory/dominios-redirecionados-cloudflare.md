---
name: dominios-redirecionados-cloudflare
description: "Artigo que linka para domínio da lista de redirecionamentos da Cloudflare pode ser apagado, desde que não tenha tráfego"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T08:51:46.732Z
---

**Regra permanente, dada em 16/08/2026.** A lista fica em
`D:\SISTEMAS\Cloudflare\lista de domínios para redirecionamentos.txt`, com 219
domínios. Artigo que aponte para qualquer um deles **pode ser apagado por
completo, desde que não tenha tráfego no Search Console**.

**Why:** esses domínios hoje redirecionam para outro lugar. Backlink apontando
para eles não entrega autoridade a ninguém, então o artigo perde a única razão
de existir se também não trouxer visita. É a mesma lógica da poda por backlink,
só que aqui o link existe e está morto.

**How to apply:** na poda de cada portal, somar este teste aos outros. A ordem
que funciona é: (1) tem backlink para site limpo e vivo? (2) tem tráfego?
Se o único link externo aponta para a lista e não há tráfego, o artigo sai, com
410 como sempre.

Cuidado com o `www.`: normalizar os dois lados antes de comparar, senão metade
não casa.

⚠️ Não confundir com os outros arquivos da mesma pasta:
`sites_mortos_*.txt` é diagnóstico de site fora do ar, e `contas.json` é o
inventário de contas da Cloudflare. A lista que vale para esta regra é a de
**redirecionamentos**.

Ao aplicar em 16/08/2026 nos cinco portais convertidos, o resultado foi **zero
artigos**: as podas anteriores já tinham levado todos, porque boa parte desses
domínios é também funil de IPTV e os links foram desfeitos ali.

Relacionado: [[poda-por-backlink-conferir-antes]], [[iptv-tres-vetores]],
[[conversao-total]]
