# Plano de Desenvolvimento: Painel Rotador de Links

Documento de planejamento para desenvolvimento com Claude Code no VS Code.
Importe este arquivo na raiz do projeto e use como referência de execução.

## Visão geral

Painel administrativo + endpoint de redirecionamento que distribui cliques de um botão de acesso entre múltiplos links de destino (fornecedores parceiros), em rodízio sequencial (round-robin global).

O site do cliente fica fora deste escopo. Aqui construímos apenas o painel e o redirecionador. O botão do site do cliente vai apontar para o endpoint de redirect deste sistema.

### Conceito central

Rotador round-robin com ponderação por repetição:

- Lista ordenada de links cadastrada manualmente.
- Destinos podem se repetir na lista. Repetir um destino faz ele receber proporcionalmente mais cliques (a lista é a configuração de peso).
- Repetições devem ser intercaladas, não agrupadas, para espalhar melhor a distribuição.
- Um contador global único define a posição atual da sequência.
- O contador avança no clique (não na exibição), garantindo distribuição de tráfego real.
- O contador opera em módulo do tamanho da lista para circular indefinidamente.
- Ao chegar no fim da lista, volta ao primeiro.

### Decisões de arquitetura já tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Hospedagem | VPS dedicada, separada das demais | Isolar o raio de explosão de um cliente de alto tráfego, sem afetar outros projetos |
| Tipo de sequência | Global (contador único compartilhado) | Distribuição justa entre todos os destinos |
| Quando incrementa | No clique | Distribui tráfego real, não exposição |
| Ponderação | Por repetição na lista | Simples e transparente, sem campo de peso |
| Tipo de redirect | Temporário (302) | Redirect permanente (301) seria cacheado pelo navegador e quebraria o rodízio |
| Armazenamento | PostgreSQL na própria VPS | Tudo num lugar, volume baixo dispensa qualquer coisa exótica |
| Incremento | Atômico (UPDATE ... RETURNING) | Correção sob concorrência, não por carga |
| Relatórios | Agregação por hora no Postgres | Tabela pequena, consultas instantâneas, sem inchar |
| Alertas | Telegram via cron do Linux | Sem serviço extra, roda na mesma máquina |
| Edição da lista | Ponteiro continua de onde estava | Módulo reposiciona sozinho, sem tratamento especial |

## Dados de volume (dimensionamento)

- Pico raro: até 10.000 cliques/hora (menos de 3 cliques/segundo).
- Média esperada: 500 cliques/hora (menos de 1 clique a cada 7 segundos).
- Oscilação: de quase zero até o pico.

Conclusão de infraestrutura: volume baixo. Uma VPS pequena (1 a 2 vCPU, 1 a 2 GB de RAM, custo na casa de R$ 25 a R$ 40 por mês) resolve com folga, inclusive no pico. Sem Redis, sem fila, sem cache especial. A única regra inegociável é a atomicidade do incremento, por correção lógica e não por carga.

## Stack

- VPS dedicada e separada das demais (motivo: isolamento)
- Next.js (App Router)
- TypeScript em modo strict
- Prisma ORM
- PostgreSQL (na mesma VPS)
- Bun como runtime e gerenciador de pacotes (não usar npm)
- PM2 para gerenciar o processo
- Nginx como proxy reverso
- Cron do Linux para os jobs de relatório e alerta
- GitHub sob a organização qmixdigital

## Modelo de dados

### Tabela: links

Cada linha representa uma entrada na lista ordenada. O mesmo destino pode ter várias linhas (repetição = peso).

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid / serial | Identificador único da entrada |
| url | text | URL de destino do fornecedor |
| label | text | Nome do fornecedor para identificação no painel |
| posicao | integer | Ordem na sequência (explícita e editável) |
| ativo | boolean | Liga/desliga o destino sem removê-lo da lista |
| cliques_total | bigint | Total acumulado de cliques recebidos por esta entrada |
| criado_em | timestamp | Data de cadastro |

### Tabela: rotador_estado

Guarda o contador global. Tabela de linha única.

| Campo | Tipo | Descrição |
|---|---|---|
| id | integer | Sempre 1 (linha única) |
| ponteiro | bigint | Posição atual da sequência, sempre crescente |

O índice do destino é calculado como `ponteiro % total_de_links_ativos`.

### Tabela: cliques_hora (relatórios por agregação)

Agrega cliques por destino e por faixa de hora. Em vez de uma linha por clique, uma linha por destino por hora, incrementada conforme os cliques chegam. Mantém a tabela pequena e os relatórios instantâneos.

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid / serial | Identificador |
| link_id | fk | Referência ao link |
| hora | timestamp | Faixa de hora (truncada na hora cheia) |
| cliques | integer | Cliques recebidos por aquele link naquela hora |

Chave única em (link_id, hora) para permitir upsert: a cada clique, incrementa a linha da hora atual ou cria se não existir.

## Componentes a construir

### 1. Endpoint de redirect (prioridade máxima, construir primeiro)

Rota pública que o botão do site do cliente vai chamar. É o caminho crítico, onde o usuário espera.

Fluxo:

1. Recebe o clique.
2. Incrementa o ponteiro de forma atômica e recupera o novo valor numa única operação.
3. Busca a lista de links ativos ordenada por posição.
4. Calcula o índice: `ponteiro % quantidade_de_ativos`.
5. Redireciona com status 302 (temporário) para a URL escolhida.
6. Registra o clique (incremento em cliques_total e upsert em cliques_hora) sem bloquear o redirect.

Regras:

- Manter o caminho o mais curto possível.
- Nunca usar redirect 301.
- O incremento do ponteiro deve ser uma única instrução atômica: `UPDATE rotador_estado SET ponteiro = ponteiro + 1 WHERE id = 1 RETURNING ponteiro`.
- O registro de clique (cliques_total e cliques_hora) não deve segurar o redirect. Disparar o usuário primeiro e gravar depois, ou gravar de forma que não bloqueie a resposta.
- Fallback: se não houver links ativos, definir comportamento (redirecionar para uma URL padrão ou retornar erro tratado).

### 2. CRUD da lista de links

Painel administrativo para gerenciar a lista.

Funcionalidades:

- Listar todos os links na ordem da sequência.
- Adicionar link (url + label + posição).
- Editar link existente.
- Remover link.
- Reordenar (arrastar e soltar ou campo de posição).
- Ligar/desligar (campo ativo) sem remover.
- Permitir repetição de destinos com clareza visual de que o mesmo fornecedor aparece N vezes.

Cuidado na reordenação: reindexar as posições ao mover, inserir ou remover, sem deixar buracos na sequência.

### 3. Relatórios no painel

Tela de leitura que mostra a distribuição de cliques, alimentada pela tabela cliques_hora e pelos totais em cliques_total.

Relatórios sugeridos:

- Distribuição total por fornecedor (prova de que cada um recebeu sua parte).
- Cliques por hora ao longo do dia (gráfico que mostra as ondas de tráfego, dos vales de quase zero aos picos).
- Comparativo por período (hoje, ontem, últimos 7 dias).
- Percentual de participação de cada destino no total.

Como os dados já vêm agregados por hora, todas essas telas são consultas SQL simples e rápidas, sem processar clique a clique.

### 4. Alertas via Telegram (cron do Linux)

Jobs agendados pelo cron do próprio Linux, rodando na mesma VPS, que consultam o Postgres e disparam mensagens para um bot do Telegram. Nunca ficam no caminho do clique.

Setup do bot: criar um bot no Telegram (via BotFather), guardar o token e o chat id de destino. O job faz uma chamada HTTP simples para a API do Telegram com a mensagem.

Alertas sugeridos:

- Resumo diário: quanto cada fornecedor recebeu no dia anterior (o relatório de distribuição entregue automaticamente).
- Pico anormal: tráfego acima de um limite numa janela de tempo.
- Queda a quase zero: tráfego próximo de zero em horário que normalmente tem movimento, sinal de que algo pode ter quebrado no site do cliente ou no botão.

Cada alerta é um script que roda em intervalo definido no crontab, consulta o Postgres, avalia a condição e, se for o caso, envia a mensagem.

### 5. Autenticação do painel

O painel admin precisa de proteção por login. O endpoint de redirect é público. Definir um método simples de autenticação para a área administrativa.

## Ordem de execução sugerida

1. Contratar e preparar a VPS (separada das demais): sistema, Node/Bun, PostgreSQL, Nginx, PM2.
2. Setup do projeto (Next.js + TypeScript strict + Prisma + Bun).
3. Schema do Prisma (links, rotador_estado, cliques_hora) + migração.
4. Seed inicial da tabela rotador_estado com ponteiro = 0.
5. Endpoint de redirect com incremento atômico e 302.
6. Teste de concorrência do incremento (garantir que dois cliques simultâneos não pegam o mesmo índice).
7. Registro de cliques não bloqueante (cliques_total + cliques_hora).
8. CRUD da lista de links.
9. Telas de relatório.
10. Bot do Telegram + scripts de alerta no crontab.
11. Autenticação do painel.
12. Deploy com PM2 + Nginx, domínio e HTTPS.

## Pontos de atenção para a implementação

- Atomicidade: jamais fazer ler-depois-escrever em duas etapas no contador. Usar uma instrução única.
- Redirect 302, nunca 301.
- O registro de clique e os alertas nunca bloqueiam o caminho do redirect.
- Repetição na lista deve ser intercalada para espalhar a distribuição.
- Reindexação de posições na edição da lista para não criar buracos.
- A VPS deve ser separada dos outros projetos, para isolamento.
- Relatórios por agregação (cliques_hora), não por log cru de cada clique.
- Telegram via cron do Linux, fora do caminho do clique.
- Modo strict do TypeScript ativado desde o início.
- Usar Bun, não npm.

## Regras de conteúdo e padrão

- Sem em dashes em qualquer texto do projeto.
- Valores em reais quando aplicável.
- Repositório sob a organização qmixdigital no GitHub.

## Fora de escopo

- O site do cliente e o botão de acesso (o cliente resolve).
- Round-robin ponderado por campo de peso (substituído por repetição na lista).
- Redis, filas, cache especial (volume não justifica).
- Log cru de cada clique (substituído por agregação por hora).
- Cap/teto por fornecedor e agendamento automático de pausa (pode ser evolução futura, não está no MVP).
