---
name: upstream-b-remoto-backup
description: Upstream nginx apontando para app em OUTRA VPS com instância -b parada pendura 3s por requisição; marcar -b como backup
metadata:
  node_type: memory
  type: reference
  originSessionId: 8aaa4eee-b148-459c-adf7-b5092b782928
  modified: 2026-10-18T16:16:46.635Z
---

Na opengravity, contadores.revistadeducao e diretorio.desassossegada são servidos pelo nginx local mas o app roda na srv1166087 (31.97.173.40:3210/3211 e 3180/3181). A instância `-b` fica parada fora do deploy, e a porta fechada lá NÃO recusa a conexão (pendura até o proxy_connect_timeout de 3s). Com as duas no rodízio, metade das requisições levava 3s+ e o error.log da opengravity chegou a 7,7 GB.

Correção (18/10/2026): `server ...:3211 max_fails=0 backup;` em revista-dir-upstream.conf e desassossegada-dir-upstream.conf. A home do contadores caiu de 5,1s para 0,08s. O deploy zero downtime continua funcionando: o `-b` só entra quando o principal falha.

**How to apply:** qualquer upstream novo apontando para outra VPS com par `-b` deve nascer com o `-b` como `backup`. Em upstream 127.0.0.1 o problema não aparece, porque lá a porta fechada recusa na hora.
