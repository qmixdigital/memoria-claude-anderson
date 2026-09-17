---
name: archs-local-desatualizado
description: O archs.js em D:\SISTEMAS\portal-engine estava parado em 5 arquiteturas enquanto o servidor tinha 54
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T22:23:37.531Z
---

Em 16/08/2026 o `D:\SISTEMAS\portal-engine\src\archs.js` local tinha **apenas as
arquiteturas A a E**, de 9 de junho, enquanto a clinicas-vps rodava **54** (A até
BB, 1,5 MB). O mesmo valia para o `render.js`. Sincronizei os dois a partir do
servidor, com backup `.bak-local-desatualizado-20260816` ao lado.

**Por quê:** isso inverte a regra de [[arch-local-e-fonte-unica]]. Enquanto o
local estava assim, um deploy a partir dele teria apagado 49 arquiteturas. A
fonte real das arquiteturas passou a ser o servidor em algum momento, e o local
ficou para trás sem ninguém notar.

**Como aplicar:** antes de qualquer deploy de arquitetura, comparar a contagem
dos dois lados com `grep -o "^  [A-Z]\+:" archs.js | wc -l`. Se o local tiver
menos, puxar do servidor primeiro. E depois de patch feito no servidor, trazer o
arquivo de volta para o local na mesma sessão, para os dois não divergirem de
novo.
