# QMIX Invest

Sistema de inteligência financeira pessoal para monitorar smart money em ações brasileiras (B3).

Spec: [docs/superpowers/specs/2026-05-04-qmix-invest-design.md](docs/superpowers/specs/2026-05-04-qmix-invest-design.md)

## Quick start (desenvolvimento local)

```bash
cp .env.example .env
npm install
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
npm run db:migrate
npm run dev:app
```

App responde em http://localhost:3000.

## Estrutura

- `app/` — Next.js 15 (dashboard + API + webhook Telegram)
- `worker/` — Worker Node consumindo fila pg-boss
- `db/` — Schema Drizzle compartilhado entre app e worker
- `nginx/` — Vhost para Nginx do host
- `scripts/` — deploy, rollback, setup VPS

## Comandos úteis

- `npm test` — roda testes unitários e integração
- `npm run typecheck` — checa types em todos os workspaces
- `npm run db:generate` — gera nova migration Drizzle
- `npm run compose:logs` — tail de logs de todos os containers

## Deploy em produção

Veja `scripts/deploy.sh` e `nginx/README.md`.

## Status

- ✅ Fase 0: Infraestrutura — concluída em 2026-05-04
- ⏳ Fase 1: Scrapers + bootstrap histórico — pendente
- ⏳ Fase 2: Motor de sinais — pendente
- ⏳ Fase 3: Camada de IA — pendente
- ⏳ Fase 4: Bot Telegram — pendente
- ⏳ Fase 5: Dashboard admin — pendente
- ⏳ Fase 7: Deploy + dry-run + go-live — pendente

## Como adicionar uma nova migration

```bash
# 1. Edite db/src/schema.ts adicionando/alterando tabelas
# 2. Gere a SQL
DATABASE_URL=<your_db> npm run db:generate
# 3. Revise db/migrations/<NNNN>_<name>.sql antes de commit
# 4. Aplique
docker compose exec worker node worker/dist/migrate.js
```

## Como rodar testes

```bash
npm test                # tudo (delega para workspaces)
npm --workspace app run test    # só app (7 testes)
npm --workspace worker run test # só worker (3 testes)
```
