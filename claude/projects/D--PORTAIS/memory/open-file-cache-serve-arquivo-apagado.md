---
name: open-file-cache-serve-arquivo-apagado
description: "O nginx das máquinas tem open_file_cache de 60s: página apagada continua respondendo 200 e parece que não morreu"
metadata:
  node_type: memory
  type: reference
---

O `nginx.conf` das máquinas da rede tem:

```nginx
open_file_cache max=10000 inactive=30s;
open_file_cache_valid 60s;
```

O nginx guarda o descritor do arquivo. Apagar o `index.html` do disco **não**
tira a página do ar na hora: por até 60 segundos ela continua respondendo **200**,
com `Last-Modified` da versão antiga, mesmo com `find` provando que o arquivo
não existe mais.

Isso soma ao defeito já conhecido de o motor servir da memória pelo proxy de
reserva, e juntos dão a impressão de que a página apagada "não morre". A ordem
que resolve, e o teste que engana em cada etapa:

1. apagar o JSON em `data/` e o diretório em `public/`
2. `systemctl restart portal-engine` (tira da memória do motor)
3. **`nginx -s reload`** (esvazia o cache de descritores) ou esperar 60s
4. só então testar

Ver [[motor-serve-da-memoria]] e [[reiniciar-motor-depois-de-editar]].
