# Meta Ads Manager

Gestao de trafego pago Meta (Instagram e Facebook) por cliente, via Marketing API.
Stack: Bun, TypeScript strict, Prisma, PostgreSQL.

Importante: nao existe API separada do Instagram. Anuncio no IG roda pela
Marketing API da Meta. O Instagram e um placement definido no nivel do ad set.

## Estrutura

```
src/
  config/
    clientes.ts     registro de clientes (ad account, pagina, IG, defaults)
    types.ts        tipos do dominio
  lib/
    meta-client.ts  wrapper base da Graph API (versao, token, erro)
    campaigns.ts    criar, pausar, ativar campanha
    adsets.ts       criar ad set com placement de Instagram
    creatives.ts    criar ad creative (pagina FB + perfil IG)
    ads.ts          ligar ad set ao creative
    insights.ts     leitura de metricas
  db/
    client.ts       instancia do Prisma
scripts/
  criar-campanha.ts   cria estrutura completa e salva no banco
  puxar-insights.ts   coleta metricas e salva snapshot
  listar-contas.ts    descobre os adAccountId acessiveis pelo token
prisma/
  schema.prisma       clientes, campanhas, ad sets, ads, insights
```

## Setup

1. Pre-requisitos na Meta
   - Conta de desenvolvedor em developers.facebook.com
   - App do tipo Business com o produto Marketing API
   - App vinculado ao Business Manager
   - System User com permissao nas contas de anuncio dos clientes
   - Token long-lived do System User

2. Instalar e configurar

```bash
bun install
cp .env.example .env   # preencha TOKEN, versao e DATABASE_URL
bun run db:generate
bun run db:push
```

3. Descobrir os IDs das contas

```bash
bun run listar-contas
```

Use o resultado para preencher adAccountId, pageId e instagramId em
src/config/clientes.ts.

## Uso

Criar estrutura de campanha (nasce PAUSED):

```bash
bun run criar-campanha ebookcult "Quiz Lideranca - Maio"
```

Puxar metricas:

```bash
bun run puxar-insights ebookcult last_7d
```

## Gestao por projeto

Cada cliente vive como um registro em src/config/clientes.ts e como linha na
tabela clientes do banco. Toda campanha, ad set e ad fica vinculado ao cliente,
entao voce filtra, audita e compara por projeto direto no Postgres.

## Avisos

- Tudo nasce com status PAUSED de proposito. Ativacao e passo manual.
- Erro em loop cria campanhas de verdade e gasta dinheiro real. Teste com
  budget minimo e uma conta de teste primeiro.
- A Meta lanca nova versao da API a cada ~3 meses. A versao fica no .env.
  Para campanhas Advantage+ Shopping e App, a criacao via API legada foi
  descontinuada em 2026. Use a estrutura nova de Advantage+ se for esse o caso.
