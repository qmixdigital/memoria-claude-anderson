# Lista da Família

Lista de compras e tarefas compartilhada, para uso doméstico. Roda inteira no plano
gratuito da Cloudflare (Workers + D1), abre como aplicativo no celular (PWA) e
sincroniza entre os aparelhos da casa.

## No ar

**https://lista-familia.anderson-gna.workers.dev**

Conta Cloudflare: Anderson Alves (`9ecbf885a61a34c6ac4d73033fa0f497`).
Banco D1: `lista-familia` (`384cc516-fda8-4b7b-8008-d35243b8101f`).
Publicar de novo depois de qualquer alteração: `npm run deploy`.

## Como funciona

- Cada pessoa entra tocando no próprio nome e digitando um PIN de 4 a 8 dígitos.
  Não há emoji em lugar nenhum: os membros aparecem por inicial e o resto da
  interface usa ícones em SVG desenhados para o app.
- **Compras** é o painel: mostra tudo que falta comprar, agrupado por categoria.
  No mercado, um toque marca o item como pego e ele sai da lista.
- **Adicionar** traz 430 produtos comuns em 13 categorias. Basta marcar, sem
  digitar. Há busca com e sem acento, tanto dentro da categoria quanto no
  catálogo inteiro. O que não estiver no catálogo pode ser digitado.
- Cada linha do catálogo diz o que o toque faz, com **Incluir** ou **Na lista**,
  e toda inclusão confirma por mensagem na tela. Marcador que muda de cor em
  silêncio faz a pessoa tocar de novo para conferir, e o segundo toque desfaz.
- Itens usados com frequência viram atalho de um toque na tela da categoria.
- Cada pessoa pode colocar uma foto de perfil em Ajustes. A imagem é recortada
  e reduzida no próprio celular antes de subir.
- **Tarefas** guarda lembretes com responsável e data, destacando o que venceu.
- Tudo aparece nos outros aparelhos em poucos segundos, sem precisar recarregar.

## Colocar no ar

```bash
cd lista-familia
npm install

# 1. cria o banco e copia o database_id para o wrangler.toml
npx wrangler d1 create lista-familia

# 2. cria as tabelas no banco de produção
npm run db:remote

# 3. publica
npm run deploy
```

Abra o endereço que o deploy mostrar. Na primeira visita o app pede o nome e o PIN
do administrador. Não existe senha em arquivo de configuração: o primeiro acesso
define o administrador e nenhum segundo cadastro é aceito depois disso.

Para usar um endereço próprio (por exemplo `lista.seudominio.com.br`), vá no painel da
Cloudflare em Workers e Pages, abra o worker `lista-familia`, aba Settings, seção
Domains e Routes, e adicione o domínio.

## Uso diário

**Adicionar membro:** Ajustes, Adicionar membro. Informe nome e um PIN de 4 a 8
dígitos. Avise a pessoa qual é o PIN dela, ela pode trocar depois.

**Trocar o próprio PIN:** Ajustes, Trocar meu PIN. Pede o PIN atual antes.

**Criar ou apagar categoria:** Ajustes, seção Categorias, disponível para o
administrador. Apagar uma categoria apaga os itens dela junto.

**Instalar no celular:** abra o site no Chrome ou Safari e escolha adicionar à tela
inicial. Ele passa a abrir em tela cheia, com ícone próprio.

**Esqueci o PIN de alguém:** o administrador remove o membro em Ajustes e cadastra de
novo com um PIN novo. O histórico de quem adicionou cada item é preservado.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o app local em `http://127.0.0.1:8787` com banco local |
| `npm run db:local` | Recria as tabelas do banco local, apagando os dados de teste |
| `npm run db:remote` | Aplica o schema no banco de produção (apaga tudo, use só na primeira vez) |
| `npm run deploy` | Publica na Cloudflare |
| `npm run icons` | Regera os ícones do PWA |
| `npm run typecheck` | Confere os tipos do Worker |
| `npm run test:api` | Testa a API contra o servidor local |
| `npm run test:ui` | Testa a interface num DOM simulado, contra o servidor local |
| `npm run test:navegador` | Testa o que a tela realmente desenha, num Chrome de verdade |

Os três testes exigem o `npm run dev` rodando em outro terminal e recriam os dados,
então rode `npm run db:local` antes de cada um. O `test:navegador` também aceita
apontar para produção: `ALVO=https://seu-endereco npm run test:navegador`.

O teste de navegador não é redundante com o de interface. O jsdom não avalia CSS,
e foi justamente por isso que passou despercebido um bug em que todas as telas
ficavam desenhadas ao mesmo tempo: o atributo `hidden` estava correto, mas uma
regra `.center{display:flex}` vencia o `[hidden]{display:none}` do navegador.

## Catálogo de produtos

Os 430 produtos ficam em `public/catalogo.js`, como dado do aplicativo e não do
banco. Isso mantém o catálogo fora da cota do D1 e fora da sincronização. Cada
categoria carrega uma chave (`catalog`) que liga à lista de sugestões, e um nome
de ícone (`icon`) que aponta para `public/icones.js`.

Para incluir produtos, basta editar o array da categoria em `catalogo.js` e
publicar. Nada muda no banco.

## Migrações

Bancos criados antes da versão com ícones precisam rodar, uma única vez:

```bash
npx wrangler d1 execute lista-familia --remote --file=./migracoes/001-categorias-com-icone.sql
```

Bancos novos já nascem certos pelo `schema.sql`.

## Decisões que valem conhecer

**Sincronização por marca de tempo.** Um único endereço, `/api/sync`, devolve tudo que
mudou depois do último acerto de relógio, inclusive o que foi apagado. O intervalo é
adaptativo: 5 segundos enquanto há movimento, 15 e depois 30 segundos quando nada muda,
e o app para de perguntar depois de 5 minutos sem ninguém tocar na tela, voltando ao
ritmo rápido no primeiro toque. Com quatro pessoas isso fica na casa de 2 a 3 mil
requisições por dia, contra o limite gratuito de 100 mil.

**Interface otimista com fila por registro.** O toque aparece na tela antes da resposta
do servidor e é desfeito se der erro. As chamadas do mesmo registro entram em fila, para
que marcar como comprado um item recém-adicionado nunca ultrapasse a criação dele.
Registros apagados ficam marcados na sessão, para que uma resposta atrasada não traga de
volta algo que já saiu da lista.

**Exclusão em duas etapas.** Nada é apagado na hora: as linhas ganham `deleted_at` para
que os outros aparelhos consigam remover o item da tela deles. A limpeza definitiva
acontece 30 dias depois, no próximo login.

**PIN.** De 4 a 8 dígitos, guardado como PBKDF2 com sal, nunca em texto puro, com
15 mil iterações. Esse número foi medido para caber no limite de 10ms de CPU por
requisição do plano gratuito, lembrando que trocar o PIN faz duas derivações na
mesma chamada. O número fica gravado dentro do próprio hash, então dá para
aumentar depois sem invalidar os PINs existentes. Vale ser honesto: um PIN curto
tem poucas combinações, e a proteção real vem do limite de tentativas, não da
conta matemática. O limite é de 5 erros por membro a cada 10 minutos, contado por
par de membro e endereço, para que um erro do filho não tranque a casa inteira
atrás do mesmo IP.

**Versão casada entre HTML e script.** O `index.html` carrega `data-app` e o
`app.js` confere se bate com a própria versão. Quando não bate, o app limpa
cache e service worker e recarrega uma vez. Isso existe porque a borda da
Cloudflare leva um ou dois minutos para propagar arquivos novos, e nesse
intervalo o navegador consegue montar um par de versões diferentes.

**Interface sem emoji.** Ícones em SVG traçado, gerados por `public/icones.js`,
e membros identificados por inicial. Emoji varia de desenho entre aparelhos e
sistemas, e some quando a fonte não tem o caractere.

**Fuso horário.** O banco grava tudo em UTC e a tela mostra sempre em horário de
Brasília, inclusive as horas nas linhas dos itens e o cálculo de vencida, hoje e
amanhã. Não usa o relógio do aparelho: quem estiver viajando vê a mesma hora que
o resto da família. Sem isso, entre 21h e meia-noite as datas apareceriam com um
dia de diferença.

**Foto de perfil.** Guardada como data URI na própria tabela de membros. O
aplicativo recorta no centro, reduz para 192px e converte para WebP antes de
enviar, o que dá perto de 10KB. Isso dispensa bucket de objetos, permissão nova
no token e requisição extra: a foto viaja na sincronização que já existe. O
servidor recusa qualquer coisa que não seja imagem e corta acima de 200KB.

## Backup

O D1 tem Time Travel: dá para voltar o banco a qualquer ponto dos últimos 30 dias.

```bash
npx wrangler d1 time-travel info lista-familia
npx wrangler d1 time-travel restore lista-familia --timestamp=2026-08-12T10:00:00Z
```

Para uma cópia em arquivo:

```bash
npx wrangler d1 export lista-familia --remote --output=backup.sql
```

## O que ficou de fora

Notificações push, escrita sem internet com fila de sincronização, compartilhamento com
gente de fora da família e controle de preços. Sem rede o app mostra a última versão
salva e bloqueia alterações, em vez de fingir que gravou.
