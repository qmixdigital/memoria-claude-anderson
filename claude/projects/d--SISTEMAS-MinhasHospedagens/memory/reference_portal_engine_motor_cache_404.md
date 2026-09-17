---
name: reference-portal-engine-motor-cache-404
description: Apagar artigo do portal-engine nao basta; o motor na porta 8791 continua servindo pelo fallback @motor do nginx
metadata:
  type: reference
---

No opengravity o nginx de cada portal termina com
`try_files $uri $uri/ $uri/index.html @motor` e `@motor` faz proxy para
`http://127.0.0.1:8791` (servico systemd `portal-engine.service`).

Consequencia: depois de `remover_artigo.js <site> <slug> --aplicar`, mesmo com
o JSON em `data/` apagado, a URL pode continuar respondendo **200 com o conteudo
antigo**, porque o motor guarda o artigo em memoria. O cabecalho denuncia:
`cf-cache-status: DYNAMIC` significa que **nao e cache do Cloudflare**, e purgar
CF nao resolve nada.

**Receita completa para apagar de verdade:**

1. `node remover_artigo.js <site> <slug> --aplicar`
2. Conferir se sobrou a pasta publica e apagar: `rm -rf /srv/portais/<site>/public/<categoria>/<slug>` (o remover nem sempre limpa em portal com categoria na URL; em portal `flatUrl` costuma limpar)
3. `systemctl restart portal-engine.service`
4. `python cf_purge.py <dominio>`
5. Conferir 404 e conferir que **outro** artigo do mesmo portal ainda responde 200

Diagnostico rapido: `curl -H "Host: dominio" http://127.0.0.1:8791/<caminho>/`
direto na origem. Se der 404 ali e 200 pelo dominio, ai sim e cache de borda.

Relacionado: [[reference-portal-engine-html]], [[reference-portal-engine-migration-recipe]],
[[reference-portal-engine-cf-purge-token]].

**Vale também para EDIÇÃO, não só para exclusão (01/09/2026).** Editei o `content`
de um artigo no JSON e rodei `rebuildIndexes`. O arquivo estático em
`/srv/portais/<slug>/public/.../index.html` já estava com o texto novo, mas a
página servida continuava com o texto velho, com `cf-cache-status: DYNAMIC`
provando que não era cache do Cloudflare.

O que resolve é reiniciar o motor:

```bash
systemctl restart portal-engine.service   # no opengravity, user portais, porta 8791
```

Não é PM2: o processo é `node /opt/portal-engine/src/receiver.js` sob o systemd,
e por isso não aparece no `pm2 list`.

Sintoma que identifica o caso: **arquivo em disco certo + página servida errada
+ cf-cache-status DYNAMIC**. Se o arquivo em disco também estiver errado, o
problema é outro (o rebuild não rodou). Nem toda edição cai nisso: mudanças em
`dek` e remoção de link apareceram na hora nas mesmas horas; foi a edição de um
`<h2>` dentro do `content` que ficou presa.
