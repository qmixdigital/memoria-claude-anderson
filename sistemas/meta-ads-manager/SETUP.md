# Guia de Setup — para leigos

Este guia tem duas partes:

- **Parte 1 — Conectar a Meta (você faz UMA vez, com ajuda).** É a única parte que
  exige cliques seus no navegador, com a sua identidade. Sem isso nada vai ao ar.
- **Parte 2 — Subir campanhas (o dia a dia).** Depois da Parte 1, é um comando só.

---

## Parte 1 — Conectar a Meta (uma vez)

> Pode pedir ajuda ao assistente do VS Code em cada passo. Faça na ordem.

### 1. Página do Facebook + Instagram
- A casa/cliente precisa de uma **Página no Facebook** (não é perfil pessoal).
- O **Instagram** da casa precisa estar **conectado** a essa Página.
  (No Instagram: Configurações → Conta profissional → conectar à Página.)

### 2. Conta Business da Meta
- Acesse **business.facebook.com** e crie/abra o **Gerenciador de Negócios**.
- Em **Configurações do negócio → Contas → Páginas**, adicione a Página da casa.

### 3. Conta de anúncios + cartão
- Em **Contas → Contas de anúncio**, crie ou adicione uma conta de anúncios.
- Adicione uma **forma de pagamento (cartão)**. É o que paga os anúncios.

### 4. App de desenvolvedor + Marketing API
- Acesse **developers.facebook.com → Meus apps → Criar app → tipo "Empresa"**.
- Dentro do app, adicione o produto **Marketing API**.

### 5. Token de acesso (a "chave")
- Em **business.facebook.com → Configurações → Usuários → Usuários do sistema**,
  crie um **Usuário do sistema**.
- Dê a ele acesso à **conta de anúncios** e à **Página** (controle total).
- Clique em **Gerar token**, escolha o app, e marque as permissões:
  `ads_management`, `ads_read`, `pages_read_engagement`, `pages_manage_ads`,
  `instagram_basic`, `business_management`.
- Copie o token (escolha **token de longa duração / sem expiração** se aparecer).

### 6. Colar o token e descobrir os números
- Abra o arquivo **`.env`** (já criado) e cole o token:
  ```
  META_ACCESS_TOKEN=cole_aqui_o_token
  ```
- No terminal do VS Code, rode:
  ```
  bun run listar-contas
  ```
  Isso mostra os números das contas de anúncio que o token enxerga.

### 7. Preencher o cliente
- Abra **`src/config/clientes.ts`** e preencha, no cliente `casa-itacaiu`:
  - `adAccountId` → o número `act_...` que apareceu no passo 6
  - `pageId` → ID da Página do Facebook
  - `instagramId` → ID da conta do Instagram (peça ajuda ao assistente para achar)

> **Pronto. A Parte 1 nunca mais precisa ser refeita para esse cliente.**

---

## Parte 2 — Subir campanhas (o dia a dia)

### Jeito fácil: o assistente em português
```
bun run nova-campanha
```
Ele pergunta tudo em português (nome, orçamento, link, foto) e cria a campanha.
**Tudo nasce PAUSADO** de propósito — nada gasta dinheiro até você ativar.

### Depois de criar
1. Abra o **Gerenciador de Anúncios** da Meta.
2. Revise o anúncio (texto, imagem, público).
3. Se gostar, **ative**. A Meta revisa e aprova antes de rodar.

### Ver resultados (opcional)
```
bun run puxar-insights casa-itacaiu last_7d
```

---

## Avisos importantes (honestos)

- **Tudo nasce PAUSADO.** Ativar é decisão sua, no painel da Meta. Isso evita gasto acidental.
- Este sistema **agiliza criar** campanhas; ele **não substitui** o Gerenciador de Anúncios
  para acompanhar e ativar.
- O **banco de dados é opcional**. Sem ele, as campanhas são criadas normalmente;
  só não fica histórico salvo no seu PC.
- Anúncio só roda depois da **aprovação da Meta** e com **cartão cadastrado**.
