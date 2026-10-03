---
name: qmix-sessao-cliente-cache
description: Sessão do cliente no qmix-next — API e áreas logadas precisam de Cache-Control private no-store; rotas de login/logout; checkout só confia na sessão, nunca no id do navegador
metadata:
  type: project
---

Correções de 02/10/2026, a partir do cliente 283 (entra pelo Google; o checkout pedia senha e respondia "senha incorreta").

- **Cache:** a regra geral de `headers()` em `next.config.ts` marca tudo como `public, s-maxage=300, stale-while-revalidate=86400` (criada para o HTML não congelar na borda). Ela pegava também `/api/*` e áreas logadas. O `stale-while-revalidate` fazia o NAVEGADOR devolver a resposta antiga de `/api/clientes/me` ("sem sessão") logo depois do login pelo Google: `isFullyAuthenticated` ficava falso e o checkout pedia senha. Agora há uma lista de rotas com `private, no-store` no fim do array (API, admin, publisher, webhooks, minha-conta, checkout, carrinho, enviar-dados, lista-de-backlinks etc.), e os `fetch` de `/api/clientes/me` usam `cache: 'no-store'`.
- **Rotas que não existiam:** `/api/clientes/login` e `/api/clientes/logout` eram chamadas pelo `AuthProvider` (sobra do Payload) e davam 404: login por senha no checkout falhava para todos e o "Sair" não apagava o cookie. Criadas em `src/app/api/clientes/`.
- **Aba antiga:** `AuthProvider` revalida a sessão ao voltar o foco (máx. 1x/30 s, só se não autenticado) e o checkout chama `refreshCliente()` ao abrir. Há link "Continuar com Google" nos dois blocos de senha do checkout.
- **Segurança:** `checkout/actions.ts` e `api/paypal/create-order` aceitavam `clienteId` vindo do navegador (localStorage) e, com senha, gravavam o hash novo e abriam a sessão daquela conta (tomada de conta). Agora o cliente é identificado só pelo cookie; sem sessão, a conta é achada pelo e-mail e a senha nunca é sobrescrita (exceção: conta sem senha e sem Google ganha a primeira). Em 02/10 nenhum dos 89 pedidos com conta tinha e-mail diferente do da conta.

**Why:** resposta de uma pessoa nunca pode ser cacheável; e o que vem do navegador não prova identidade.

**How to apply:** rota nova privada ou de API entra na lista `private, no-store` do `next.config.ts` se o caminho não estiver coberto. Nunca usar `dados.clienteId` do formulário como identidade no servidor. Para testar sessão, gerar token com jose no Node 20 (`/root/.nvm/versions/node/v20.20.2`), não com `npx tsx` no Node 18 (falha e grava "Node.js v18" no lugar do token). Ver [[qmix-server-actions-multiinstancia]].
