---
name: cirurgiacoracao-onde-fica
description: cirurgiacoracao.com.br não é mais WordPress e não está mais na Hostverge; roda como Next.js na VPS srv1166087
metadata: 
  node_type: memory
  type: project
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-08-19T10:24:53.146Z
---

**cirurgiacoracao.com.br** foi transformado de blog WordPress em **diretório Next.js de cardiologia**, com cutover em **08/08/2026**. O WordPress da Hostverge foi apagado no mesmo dia; lá restam só `~/bkp-cirurgiacoracao-arquivos.tgz` e `~/bkp-cirurgiacoracao-db.sql.gz`.

Hoje roda em `/var/www/cirurgiacoracao` na VPS **`hostinger-vps-srv1166087`** (31.97.173.40), com PM2 nas portas 3032 e 3033 e Postgres local. O projeto **não está sob git** e **não tem cópia local do código** — só existe nessa VPS.

A documentação que levantei está em `D:\SITES\cirurgiacoracao.com.br\` (README + `docs/ACESSO.md`, `ARQUITETURA.md`, `OPERACAO.md`, `PENDENCIAS.md` e o relatório de auditoria). Comece por ali antes de reinvestigar o servidor.

Ver [[cloudflare-conta-cirurgiacoracao]].
