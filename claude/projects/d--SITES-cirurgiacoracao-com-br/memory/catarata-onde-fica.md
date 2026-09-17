---
name: catarata-onde-fica
description: Onde vive o cirurgiadacatarata.com.br e o que ele tem de diferente do cirurgiacoracao
metadata: 
  node_type: memory
  type: project
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-09-02T08:47:31.226Z
---

O **cirurgiadacatarata.com.br** roda na mesma VPS do irmão, a `hostinger-vps-srv1166087`, em `/var/www/cirurgiadacatarata`, nas portas **3140 e 3141**. Next.js 16.2.1, Drizzle, Postgres local (usuário `catarata`). Documentação completa em `D:\SITES\cirurgiadacatarata.com.br\docs\`, levantada em 02/09/2026.

**Como o de coração: sem git e sem cópia local.** O código-fonte só existe no servidor; editar é por SSH e o deploy roda de lá (`bash scripts/deploy.sh`, que já é a versão que monta em `-build`). Ver [[cirurgiacoracao-onde-fica]].

Diferenças que mudam a forma de trabalhar:

- **Zona Cloudflare fica na conta `master`** do `contas.json`, não numa conta própria, apesar de a conta se chamar "Cirurgia de catarata". Zone `2ed9aae1aac53a5b7cf700205620d8ac`.
- **Não tem regra de cache de HTML na borda** (`/` responde `DYNAMIC`), então o purge não é obrigatório em todo deploy, ao contrário do de coração.
- **Tem cobrança real**: Asaas em produção, com webhook ativo e quatro planos. É o único dos dois com dinheiro no caminho.
- **`max_fails=1 fail_timeout=3s`** no upstream do nginx, contra a regra da rede de `max_fails=0`. O deploy contorna com `sleep 6` entre os restarts. Mexer nisso pede teste.
- Os scripts npm usam `--env-file=.env.local`, que **não existe no servidor**. Rodar qualquer um na VPS exige `export $(grep -E "^DATABASE_URL" /var/www/cirurgiadacatarata-shared/.env | xargs)` antes.

A restrição mais dura do projeto é a preservação de URL do WordPress antigo: 276 URLs listadas em `referencia/URLS-PRESERVAR.csv`, e **99 delas nunca tiveram impressão no Search Console**, então validar migração pelo GSC dá falso verde. Validar pelo CSV, com `npm run verify:urls`.
