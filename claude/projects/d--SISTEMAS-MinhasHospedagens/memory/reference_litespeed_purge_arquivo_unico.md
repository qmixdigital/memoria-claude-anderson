---
name: reference_litespeed_purge_arquivo_unico
description: O arquivo PHP que dispara X-LiteSpeed-Purge precisa de nome NOVO a cada uso; reaproveitar o nome faz o LiteSpeed servir o 404 cacheado e o purge nunca roda
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-10T01:15:52.318Z
---

O jeito confiável de purgar LSCache na rede é criar um PHP no docroot que emite `header('X-LiteSpeed-Purge: *')`, requisitar por HTTP e apagar (`wp litespeed-purge` dá 403, e `wp eval do_action('litespeed_purge_all')` é no-op em CLI, ver [[reference_mariana_cache_apo_lsws]]).

**A armadilha, descoberta em 09/08/2026 no azulmagazine:** se o arquivo já foi requisitado antes com esse nome quando ainda não existia, **o LiteSpeed cacheou o 404** daquela URL. Na tentativa seguinte o arquivo existe no disco, mas a requisição nunca chega ao PHP: o servidor devolve o 404 em cache, o cabeçalho de purge nunca é emitido e o purge silenciosamente não acontece. O sintoma engana: `curl` com `?nc=aleatorio` mostra a correção aplicada (bypassa o cache), enquanto a URL limpa continua servindo a página velha por horas.

Regra: **nome aleatório a cada purge**, e conferir a resposta.

```bash
N="purge-$RANDOM$RANDOM.php"
ssh HOST "printf '%s' '<?php header(\"X-LiteSpeed-Purge: *\"); echo \"PURGED\";' > \$P/$N"
curl -s https://SITE/$N     # tem que responder PURGED, nao a pagina de 404 do site
ssh HOST "rm -f \$P/$N"
```

Se voltar o HTML do site em vez de `PURGED`, o purge não rodou. Sinal extra: o rodapé do HTML traz `<!-- Page cached by LiteSpeed Cache ... -->` com a data e hora.

Diagnóstico correto de "a correção não apareceu": comparar sempre `SITE/` com `SITE/?nc=$RANDOM`. Iguais = problema no código; diferentes = problema de cache.
