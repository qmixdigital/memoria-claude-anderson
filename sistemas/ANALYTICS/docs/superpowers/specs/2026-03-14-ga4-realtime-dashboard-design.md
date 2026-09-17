# GA4 Realtime Dashboard — Design Spec

## Overview

Dashboard HTML estático que exibe até 30 cards simultâneos com dados em tempo real do Google Analytics 4 via Realtime API. Sem framework, sem backend, sem logo. Paleta de cores QMIX (fundo escuro + verde neon).

## Stack

- HTML + CSS + JS puro (3 arquivos: `index.html`, `style.css`, `script.js`)
- Chart.js v4.4.x via CDN (mini gráficos de barras)
- Google Identity Services (GIS) via CDN (autenticação OAuth2 no browser)
- Sem build, sem dependências locais

## Paleta de Cores (QMIX)

| Elemento            | Cor                          |
|---------------------|------------------------------|
| Fundo da página     | `#030810`                    |
| Fundo dos cards     | `#0a111c`                    |
| Borda dos cards     | `rgba(0,255,102,0.15)`       |
| Cor de destaque     | `#00ff66`                    |
| Texto principal     | `#e7f1ff`                    |
| Texto secundário    | `#8899aa`                    |
| Barras do gráfico   | `rgba(0,255,102,0.6)`        |

## Layout

### Header

- Texto "GA4 Realtime" à esquerda (sem logo)
- Contador total de usuários ativos (soma de todos os sites, últimos 30min) — atualiza a cada polling
- Relógio com horário atual (atualiza a cada segundo, formato HH:MM:SS)
- Botão de login Google à direita — após login, mostra email do usuário e botão de logout

### Grid de Cards

- CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Gap de 12px
- Até 30 cards

### Estrutura de Cada Card

1. **Label do site** — nome configurável (ex: "Portal Goiânia")
2. **Usuários ativos 30min** — número grande em destaque (`#00ff66`)
3. **Usuários ativos 5min** — número menor abaixo
4. **Mini gráfico de barras** — 30 colunas (uma por minuto), Chart.js tipo `bar`, sem animação (`animation: false`), sem labels de eixo, altura fixa ~60px

### Efeito Visual

- Card com borda que brilha mais intensamente em verde quando há pico de tráfego (>50 usuários ativos em 30min): `box-shadow: 0 0 12px rgba(0,255,102,0.3)`

## Dados e Polling

### Configuração dos Sites

Array `SITES` hardcoded no topo de `script.js`:

```js
const SITES = [
  { label: 'Portal Goiânia', propertyId: '123456789' },
  { label: 'Portal Brasília', propertyId: '987654321' },
  // ... até 30
];
```

### Polling

- Intervalo: 30 segundos via `setInterval`
- Disparo em lotes de 10 (para respeitar limite de concorrência da API), com 200ms de delay entre lotes
- Primeiro fetch imediato após login
- Cards mantêm a ordem do array `SITES` (sem reordenação dinâmica)

### API

- Endpoint: `POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runRealtimeReport`
- Headers: `Authorization: Bearer {accessToken}`
- Body:
  ```json
  {
    "dimensions": [{ "name": "minutesAgo" }],
    "metrics": [{ "name": "activeUsers" }],
    "minuteRanges": [{ "startMinutesAgo": 29, "endMinutesAgo": 0 }]
  }
  ```

### Processamento dos Dados

- A API retorna apenas rows para minutos com atividade (dados esparsos)
- Inicializar array de 30 posições com zeros
- Preencher valores usando `dimensionValues[0].value` (minutesAgo) como índice e `metricValues[0].value` (usuários) como valor
- **Usuários 30min**: soma de todas as posições (nota: é a soma por minuto, não usuários únicos deduplificados — aceito para este dashboard)
- **Usuários 5min**: soma das posições 0-4
- **Gráfico**: array invertido (minuto mais antigo à esquerda)

## Autenticação

- Google Identity Services (GIS) via CDN: `https://accounts.google.com/gsi/client`
- Usar **Token Model** (implicit grant) via `google.accounts.oauth2.initTokenClient` — não requer backend
- Escopo: `https://www.googleapis.com/auth/analytics.readonly`
- Client ID configurável no topo de `script.js`
- Fluxo:
  1. Usuário clica "Login com Google"
  2. Popup de consentimento Google via `tokenClient.requestAccessToken()`
  3. Token retornado no callback com `expires_in`
  4. Polling inicia automaticamente
  5. Timer proativo de renovação: agendar `setTimeout` para renovar o token aos 55 minutos (antes dos 60min de expiração)
  6. Fallback: se uma requisição retornar 401, pausar polling, renovar token via `requestAccessToken()`, retomar polling
- **Logout**: para polling, limpa token, revoga via `google.accounts.oauth2.revoke()`, cards voltam ao estado de loading

## Tratamento de Erros

- Se um fetch falhar para uma propriedade, o card mostra "--" nos números e mantém o último gráfico
- Se o token expirar, tenta renovar automaticamente; se falhar, mostra botão de login novamente
- Se todas as requisições falharem, mostra mensagem no header

## Estrutura de Arquivos

```
d:\SISTEMAS\ANALYTICS\
├── index.html    (estrutura HTML + CDNs)
├── style.css     (estilos + paleta QMIX)
└── script.js     (lógica: auth, polling, charts)
```

## Estados da Interface

### Antes do login
- Header mostra botão "Login com Google"
- Cards exibem esqueleto/placeholder com "--" nos números e gráfico vazio
- Mensagem centralizada: "Faça login para visualizar os dados"

### Carregando (após login, antes do primeiro fetch)
- Cards mostram indicador de loading (spinner ou pulso na borda)

### Dados carregados
- Cards exibem dados normalmente, atualizando a cada 30s

### Erro parcial
- Card com erro mostra "--" nos números, mantém último gráfico válido

### Erro total / token expirado
- Header mostra mensagem de erro e botão de re-login

## Pré-requisitos do Usuário

1. Criar projeto no Google Cloud Console
2. Ativar a Google Analytics Data API v1
3. Criar credencial OAuth2 (tipo "Web Application")
4. Adicionar origens autorizadas (localhost + domínio de produção)
5. Copiar o Client ID para `script.js`
6. Preencher o array `SITES` com os Property IDs das propriedades GA4
