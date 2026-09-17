# QMIX Digital — Memória do Projeto

## Projeto
- **Stack**: Next.js 15 + Payload CMS v3 + PostgreSQL (Neon sa-east-1) + Asaas (pagamentos) + Resend (e-mails)
- **Hosting**: Vercel (região gru1 - São Paulo)
- **Tipo**: Marketplace de backlinks brasileiros (480+ portais)
- **Repo**: github.com/qmixdigital/qmix-digital-2026

## Credenciais de teste
- Cliente: id=3, email=qmixdigital@gmail.com, senha=<<REMOVIDO>>
- Asaas sandbox: chave começa com `$aact_hmlg_...`
- Webhook token: `<<REMOVIDO>>`
- GA4: G-ZE1KR55GKD

## Fluxo de simulação de pagamento (sandbox)
1. `POST /api/v3/payments/{id}/receiveInCash` (Asaas sandbox API)
2. Webhook manual: `POST https://qmix-digital-2026.vercel.app/webhooks/asaas` com header `asaas-access-token`

## Preferências do usuário
- Idioma: português brasileiro
- Respostas objetivas e práticas
- Prefere implementar e mostrar resultado, não ficar perguntando

## Arquivos-chave
- Layout principal: `src/app/(frontend)/layout.tsx`
- Checkout: `src/app/(frontend)/checkout/page.tsx`
- Webhook Asaas: `src/app/webhooks/asaas/route.ts`
- Entregas (hooks): `src/collections/Entregas.ts`
- Pedidos: `src/collections/Pedidos.ts`
- Minha Conta: `src/app/(frontend)/minha-conta/MinhaContaClient.tsx`
- Enviar Dados: `src/app/(frontend)/enviar-dados/actions.ts`

## Melhorias pendentes
Ver [melhorias-pendentes.md](melhorias-pendentes.md) para lista completa.
