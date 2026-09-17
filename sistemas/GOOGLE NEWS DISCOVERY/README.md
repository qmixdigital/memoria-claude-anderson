# Motor de Pautas (Google News Discovery)

Pipeline alternativo e redundante à plataforma de conteúdo. Coleta notícia
factual no Google News, agrupa por fato, escreve matéria original com a voz de
cada portal e publica no mesmo receptor `/artigos` que a plataforma já usa.

Roda em `gnd-motor` (62.238.112.87), `systemd` unit `motor-pautas`.

## Escala definida

| | |
|---|---|
| Cadência | 3 matérias por semana por portal |
| Portais | 150 (rampa: 15 → 50 → 150) |
| Volume | 450/semana, 1.950/mês, média de 65/dia |
| Modelo de produção | `claude-sonnet-5` via Batch API, 100% |
| Estágios mecânicos | `claude-haiku-4-5` |
| Teto | R$ 500/mês variável, alvo operacional ~US$ 61 |

## Custo projetado

| Componente | US$/mês | Como |
|---|---|---|
| Geração | 42,85 | Sonnet 5, batch (−50%), cache no bloco de regras |
| Mecânicos | 17,83 | Haiku 4.5, batch: 15.000 confirmações de cluster + 1.950 de categoria |
| Embeddings | 0,09 a 0,58 | 4,5M tokens |
| Imagens | 1,95 a 5,85 | 1.950 imagens Runware |
| **Total** | **62,72 a 67,12** | |

`thinking` fica **desligado** na geração em lote. Token de raciocínio é cobrado
como saída; ligar adaptativo levaria o total para ~US$ 83, acima do alvo. O
teste cego mede se compensa.

## Comandos

```bash
cd /opt/motor-pautas
V=/opt/motor-pautas/.venv/bin/python
E=$(grep -v '^#' config/motor-pautas.env | grep -v '^$' | xargs)
R="runuser -u motorpautas -- env $E $V"

$R -m motor_pautas status          # panorama em JSON
$R -m motor_pautas coletar         # coleta + decode + extração
$R -m motor_pautas agrupar         # dedupe por fato
$R -m motor_pautas grade           # grade da semana
$R -m motor_pautas gerar           # monta e envia o lote
$R -m motor_pautas colher          # colhe lotes prontos
$R -m motor_pautas publicar        # publica os slots vencidos
$R -m motor_pautas teste-cego 10   # roda o teste cego
$R -m motor_pautas revelar R20260820   # mapa código -> modelo + custo medido
$R -m motor_pautas retomar         # tira a pausa por orçamento
$R -m motor_pautas testar-email    # e-mail de teste
$R -m motor_pautas testar-chaves   # valida chaves e ids de modelo

systemctl status motor-pautas
journalctl -u motor-pautas -f
```

Painel: `ssh -L 3400:127.0.0.1:3400 gnd-motor` e abrir http://127.0.0.1:3400

## Decisões de arquitetura que não são óbvias

**Queries por assunto, não por portal.** Com 150 portais, uma query por portal
seria 150× o volume de requisições ao Google para colher em boa parte a mesma
notícia. As queries vivem num pool de assuntos em `geral.assuntos` e cada
portal assina os que quiser. São ~20 a 40 feeds no total.

**Cache de prompt no bloco de regras, não no perfil do portal.** Cache é
casamento de prefixo com TTL de 5 minutos. Com 3 matérias por semana por
portal, o perfil de um portal só reapareceria dias depois e nunca daria hit. Já
o bloco de regras é idêntico nas ~65 chamadas do lote diário e acerta o cache da
segunda em diante. Inverter a ordem jogaria fora a única economia real de cache
que este desenho permite.

**A peneira do dedupe não usa distância de SimHash.** Medido em manchetes
reais: a mesma notícia em dois veículos deu 27 bits de distância e duas
notícias sem relação deram 31, contra 32 de média aleatória. Quase nenhum
sinal, porque veículos diferentes descrevem o mesmo fato com palavras
diferentes, que é exatamente o caso que a peneira precisa deixar passar. A
peneira usa **sobreposição de fichas raras** (nome próprio, sigla, número).
SimHash continua gravado, mas só para pegar texto sindicalizado quase idêntico.

**GUID do fato é UUID atribuído na criação do cluster.** Se fosse derivado das
URLs, mudaria toda vez que uma fonte nova entrasse no cluster, e o registro de
"já publiquei este fato aqui" perderia a referência.

**`status: "skipped"` é tratado como falha, não como entrega.** A guarda de
exclusividade do Portal Engine responde HTTP 201 quando recusa por slug já
pertencente a outro portal. É um caminho de erro disfarçado de sucesso: o motor
tenta uma vez com slug diferenciado e, se ainda for pulado, registra `skipped`
(métrica de rampa), nunca `publicado`.

**Matéria sem imagem não sai do motor.** O receptor grava como rascunho todo
artigo sem `image_base64`, e rascunho nunca vai ao ar. A geração de imagem é
caminho crítico, não enfeite.

## Provedor secundário: `gpt-5.6-luna`

Confirmado pelo Anderson em 20/08/2026: **US$ 0,20/M de entrada e US$ 1,20/M de
saída**, Batch a 50% e cached input a 10%, iguais aos da Anthropic. Já está em
`precos.py`, e o gasto desse modelo passou a contar normalmente (não é mais
`preco_conhecido = false`).

O id continua em `MP_MODELO_OPENAI`, trocável sem deploy, e
`openai_p.validar_modelo()` confere contra o endpoint de modelos **na primeira
chamada real**, uma vez por processo. Se divergir, manda alerta com a lista dos
`gpt-5*` disponíveis na conta em vez de falhar em silêncio: sem isso o teste
cego registraria "erro" em todos os códigos daquele modelo e ninguém entenderia
por quê.

**A Anthropic não tem endpoint de embeddings.** O padrão é
`text-embedding-3-small` da OpenAI, o que torna a chave da OpenAI **dependência
de produção**, não só do teste cego. `MP_PROVEDOR_EMBEDDING=voyage` troca para a
Voyage AI. Comportamento sem a chave: ver o runbook.

## Corte automático de orçamento

A cada registro de gasto, o motor projeta o mês pelo ritmo até aqui. Se a
projeção passar do teto, **pausa a geração** e alerta (log, `motor_estado` e
e-mail). A publicação do que já foi gerado continua: o que para é gastar mais.

`cambio_usd_brl = 5.50` e teto de R$ 500 dão **US$ 90,91/mês**. O corte está
**ligado**. O câmbio é atualizado à mão todo mês, em `config/sites.json`, a
quente. Detalhes e demais gatilhos de alerta no runbook, no fim deste arquivo.

## Checklist por portal, o que depende de decisão editorial

Para cada portal que entra na rampa:

1. **Credencial** — `endpoint` (`https://<domínio>/wp-json/<ns>/artigos`) e
   `api_key` de 64 hex. Tirar do `sites.json` da instância do portal-engine,
   **não** do `qmix_endpoints_atual.csv`, que já está desatualizado para os
   portais migrados.
2. **Instância** — `clinicas-vps`, `opengravity`, `srv1166087` ou `wp-<host>`.
   É o que agrupa o throttle de publicação.
3. **Categorias válidas** — a lista **literal** do `categoryMap` daquele
   portal. Categoria fora da lista cria categoria nova e suja o menu.
4. **Perfil de redação** — a voz do portal em uma frase densa, mais pessoa
   gramatical, tamanho e estrutura. Precisa ser **diferente** das vozes que a
   plataforma de conteúdo já usa no mesmo portal.
5. **Assinaturas novas** — nome, slug e afinidade de categoria de cada uma.
6. **Avatar de cada assinatura** — `/img/autores/<slug>.webp` no portal, e a
   mesma `equipe` cadastrada no `sites.json` do portal-engine. Sem isso o artigo
   sai sem `rel="author"` e quebra a auditoria do `audita_editorial.py`.
7. **Assuntos** — quais do pool esse portal assina, mais filtros de inclusão e
   exclusão.

Fluxo industrializado:

```bash
python scripts/onboard_portal.py --slug X --dominio Y --nome "Z" \
  --instancia clinicas-vps --ns abcd-api/v1 --chave <64hex> \
  --categorias "Notícias,Saúde,Geral" --assuntos brasil,economia
# preencher voz e equipe em config/sites.json
python scripts/validar_portal.py X            # sonda não destrutiva
python scripts/validar_portal.py --profundo X # testa a categoria de verdade
# virar "ativo": true
```

`validar_portal.py` manda um corpo vazio: o receptor confere a chave antes de
olhar o conteúdo, então 401 é chave errada e 400 "title e content obrigatorios"
é chave boa. **Nada é criado no portal.** O `--profundo` publica um rascunho de
teste e imprime o caminho para apagar.

## Critérios de rampa

Antes de cada avanço (15 → 50 → 150), no painel e em `publish.metricas()`:

| Critério | Alvo |
|---|---|
| **Validação da skip rule (obrigatória, antes da 1ª publicação)** | POST com chave inválida devolve **401** do receptor, nunca **403** da borda |
| Taxa de `skipped` | abaixo de 5% |
| Falhas de publicação | abaixo de 2% |
| Qualidade amostrada | leitura de 10 matérias por estágio |
| Indexação | matérias indexadas no Search Console em até 72 h |
| Gasto projetado | dentro do teto, com folga de 20% |

---

# Runbook operacional (decisões de 20/08/2026)

## Alertas por Telegram

Canal ativo: **Telegram**, via `sendMessage` da Bot API. O SMTP continua no
código, funcional, mas só é usado com `MP_CANAL_ALERTA=smtp` ou `=ambos`.

| Gatilho | Quando dispara | Repete? |
|---|---|---|
| **Degrau de US$ 5** | a cada ~US$ 5 acumulados no mês **por provedor** | um por degrau, nunca repete |
| **Corte do teto** | quando a projeção passa de R$ 500 e o motor pausa | uma vez por pausa |
| **Crédito ou auth** | falha por crédito insuficiente ou chave inválida | no máximo 1 por provedor por hora |

A janela de 1 hora existe porque, quando o crédito acaba, **toda** chamada
falha: sem ela seria uma mensagem por chamada, no exato momento em que o
alerta mais importa.

A mensagem vai em **texto puro, sem `parse_mode`**, de propósito: o corpo tem
cifrão, underline, parêntese e barra, e qualquer um deles quebra o parser do
Telegram com 400 "can't parse entities".

### Bot configurado (20/08/2026)

| | |
|---|---|
| Bot | **@googlend_bot** — "Google News Discovery", id `8823687048` |
| Destino | `TELEGRAM_CHAT_ID=<<REMOVIDO>>` (Anderson Alves QMIX, @qmixdigital) |
| Token | `TELEGRAM_BOT_TOKEN` no `config/motor-pautas.env`, modo 600 |

Os três gatilhos foram testados de ponta a ponta e chegaram: teste, alerta
urgente no formato do corte de teto, e degrau de US$ 5 por provedor.

### Descobrir o `chat_id` (passo obrigatório na primeira vez)

O Telegram só entrega o `chat_id` depois que alguém inicia a conversa. Não há
como descobrir antes.

1. criar o bot no **@BotFather**, copiar o token
2. pôr em `TELEGRAM_BOT_TOKEN` no `config/motor-pautas.env`
3. **mandar qualquer mensagem para o bot** no Telegram
4. `python -m motor_pautas chat-id` → lista os chats que já falaram com o bot
5. pôr o número em `TELEGRAM_CHAT_ID`
6. `python -m motor_pautas testar-telegram`

Cuidado: o `getUpdates` é uma fila que se esvazia. Se o motor já estiver
rodando e consumindo updates, mande a mensagem de novo antes do passo 4.

Na configuração deste bot o `getUpdates` voltou **vazio mesmo com o `/start`
já dado** (`pending_update_count: 0`, sem webhook), então o `/start` não chegou
a gerar update. O caminho que resolveu foi mais direto: o `chat_id` numérico
veio da própria conta. Se acontecer de novo, não insista no `chat-id`: peça o
número, ou abra `t.me/userinfobot`.

## Câmbio e teto

`cambio_usd_brl = 5.50`, teto R$ 500 → **US$ 90,91/mês**. O corte automático
está **ligado**.

**Atualizar o câmbio manualmente todo mês**, em `config/sites.json`. É edição a
quente, não precisa reiniciar. Com o valor em 0 o motor acumula e mostra o gasto
em dólar mas **não pausa sozinho**.

Com o custo projetado de US$ 62 a 67, a folga contra o teto é de ~26%.

## Dependência de produção da chave OpenAI

Os embeddings do dedupe usam a mesma chave do teste cego. **Sem ela o motor não
para**, mas agrupa só pela peneira de fichas raras.

Comportamento degradado observado no teste real de 20/08: o fato do genérico de
semaglutida **se dividiu em dois clusters** ("Brasil terá seu primeiro genérico
de caneta emagrecedora" e "JP1: Anvisa aprova primeira caneta emagrecedora
genérica"), porque a peneira sozinha não junta manchetes que descrevem o mesmo
fato com palavras diferentes. O efeito prático é fato que não atinge o mínimo de
2 domínios e não vira pauta, ou duas matérias sobre o mesmo assunto.

O fallback fica como está: degradar é melhor que parar.

## Fase 2: otimizar o custo dos mecânicos

Os mecânicos custam US$ 17,83/mês por rodarem em ~15.000 candidatos, não nos
1.950 publicados. **Não mexer agora.** Medir na rampa, pelo painel ou por
`dedupe.metricas_arbitro()`:

- se a **taxa de confirmação do árbitro passar de 90%** com pelo menos 50
  chamadas, ele está só referendando o que a peneira já tinha decidido
- nesse caso dá para subir `MIN_JACCARD` ou baixar `FAIXA_CINZA[0]` e deixar a
  peneira decidir sozinha em mais casos

O contador já está instrumentado e aparece no painel.

## Modelos: id datado contra alias

`models.list` devolve `claude-haiku-4-5-20251001`, o id datado, enquanto o alias
`claude-haiku-4-5` continua válido na chamada. Comparar literalmente dá alarme
falso. `testar-chaves` casa por prefixo e, na dúvida, confirma com uma chamada
real de 4 tokens.

Confirmado por chamada real em 20/08: `claude-sonnet-5` e `claude-haiku-4-5`
respondem normalmente.

## Thinking por portal

`thinking_geracao` fica em `geral` mas é lido por portal, então o cenário
híbrido (thinking só nos premium) é uma linha no `sites.json` do portal, sem
mexer em código.

---

# Medições de 20/08/2026 (com as chaves reais)

## Calibração do limiar de cosseno

79 fontes reais, 45 pares do mesmo fato e 412 pares de fatos diferentes:

| | min | p50 | p90 | p99 | max |
|---|---|---|---|---|---|
| mesmo fato | 0,5603 | 0,8053 | 0,8790 | 0,9133 | 0,9187 |
| fatos diferentes | 0,1400 | 0,2742 | 0,5321 | 0,7009 | 0,8006 |

As distribuições **se sobrepõem** entre 0,56 e 0,80: nenhum limiar único
separa. O `limiar_cosseno = 0.82` está bem posicionado por acidente feliz, fica
logo acima do maior cosseno observado entre fatos diferentes (0,8006).

**Contrafactual do piso da faixa cinza.** A distribuição sugeria baixar de 0,72
para 0,62 e recuperar pares legítimos da semaglutida (0,6714, 0,7136, 0,7267).
Testei nos mesmos dados:

| piso | fatos prontos | maior cluster semaglutida | chamadas ao árbitro | confirmações |
|---|---|---|---|---|
| 0,72 | 6 | 4 domínios | 37 | 2 |
| 0,62 | 6 | 4 domínios | **52** | 2 |

Resultado **idêntico** com 40% mais chamadas pagas. Mantido em **0,72**. A razão
é que o agrupamento usa o **centroide** do fato, não pares soltos: conforme
fontes entram, o centroide se desloca e puxa as demais acima de 0,82 sozinho.
Não baixar sem novo contrafactual.

## Custo real dos mecânicos: bem abaixo da estimativa

Medido: **US$ 0,00045 por chamada** ao árbitro, **0,47 chamada por fonte
coletada**.

| | estimativa inicial | medido |
|---|---|---|
| chamadas/mês em 15.000 fontes | 15.000 | ~7.050 |
| custo do árbitro | US$ 11,25 | **US$ 3,17** |
| mecânicos no total | US$ 17,83 | **~US$ 9,75** |
| **total do motor** | 62,72 a 67,12 | **~US$ 55 a 59** |

A estimativa supunha uma chamada por fonte. Na prática a peneira de fichas
raras resolve mais da metade sozinha.

## Taxa de confirmação do árbitro: 5,4%, não acima de 90%

37 chamadas, 2 confirmações. A hipótese de que o árbitro estaria só
referendando a peneira **não se sustentou**: ele filtra de verdade. A leitura
do alvo de fase 2 tem os dois lados:

- **acima de 90%** — o árbitro só carimba: subir `MIN_JACCARD` ou baixar
  `FAIXA_CINZA[0]`
- **abaixo de 10%** — a faixa cinza está larga demais e quase toda chamada é
  gasto para dizer "não": **subir** `FAIXA_CINZA[0]`

Estamos no segundo caso, mas o contrafactual acima mostra que 0,72 já é o ponto
certo. Remedir na rampa, com volume maior.

## Não determinismo do agrupamento

A formação de cluster depende de uma decisão do árbitro (um LLM) na faixa
cinza, então **rodar o agrupamento duas vezes nos mesmos dados pode dar 5 ou 6
fatos prontos**. Observado. Não é bug: é a consequência de ter um juiz
probabilístico no laço. Importa na hora de comparar métricas de rampa entre
janelas: comparar tendência, não número exato.

## Skip rule da Cloudflare: script pronto, NÃO executado

`scripts/cloudflare_skip_motor.py`, roda na máquina local (os tokens das 34
contas estão em `D:\SISTEMAS\Cloudflare\contas.json`). Simula por padrão.

**Dois achados da simulação, ambos precisam de decisão antes do piloto:**

1. **Ordem da regra.** A instrução foi "skip depois das genéricas", mas a lição
   registrada em `vps-security-hardening/SKILL.md` põe o skip **em primeiro**, e
   para o motor isso é a diferença entre publicar e tomar 403 em tudo: a
   primeira genérica do WAF de site estático da rede é
   `block (not http.request.method in {"GET" "HEAD" "OPTIONS"})`, e o
   publicador manda **POST**. Com o skip abaixo dela, o POST casa com o block
   primeiro, a avaliação para e o skip nunca é alcançado. O script põe o skip
   no topo; `--depois` inverte, mas confira o que há acima na zona.
2. **Metade dos portais não está nas 34 contas.** Amostra de 8:
   `barranews.com.br`, `clickinfohub.com`, `gpnoticias.com` e
   `jornalconceito.com` foram encontrados; `agencianacionaldenoticias.com`,
   `boxnoticias.net`, `agoranoticias.net` e `noticias9.com` **não**. Eles estão
   atrás da Cloudflare (resolvem para IP da CF), então as zonas existem em
   contas cujo token não está no `contas.json`, ou com token sem `Zone:Read`.
   Antes de fechar os 15 do piloto: ou completar o `contas.json`, ou escolher
   entre os cobertos.

Nas zonas encontradas, todas já estão com as **5 regras do plano Free**, e a
primeira é o skip de verified bot do Google. O script então **estende essa
regra** (`or (ip.src eq 62.238.112.87)` mais a união de `phases` e `products`)
em vez de tentar criar uma sexta, que o Free recusaria.

## Validação obrigatória da skip rule

Passo de checklist antes da primeira publicação real em cada portal que entra
na rampa. Roda de dentro do motor, porque o que importa é o IP de origem:

```bash
ssh gnd-motor "curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  https://DOMINIO/wp-json/NS/artigos -H 'X-API-KEY: teste-invalido' -d '{}'"
```

| Resposta | Significado |
|---|---|
| **401** | correto: a requisição chegou ao receptor, que recusou a chave |
| **403** | a Cloudflare barrou na borda antes do receptor: skip rule ausente ou abaixo de uma genérica |
| **503/522** | origem fora do ar, problema do portal e não da regra |

Um 403 aqui é o modo de falha que o motor **não** distingue sozinho: ele
registraria como erro de publicação sem dizer que a causa foi a borda.

Contexto medido em 20/08/2026: **Bot Fight Mode está desligado** nas 18 zonas
candidatas onde o token consegue ler, e `security_level` está em `medium` em 17
delas. A skip rule é precaução para quando isso mudar, não correção de bloqueio
atual, então não é pré-requisito para a rampa começar.

---

# Auditoria do receptor WordPress (20/08/2026)

Antes de ativar qualquer portal WordPress, li o mu-plugin. Ele tem **três
variantes na rede** (`engine-<hash>.php`, `core-<hash>.php`,
`kernel-<hash>.php`), todas com a mesma lógica. Achei três diferenças que
mudam o payload, e duas eram defeito na minha configuração.

## As diferenças entre os dois receptores

| | Portal Engine | WordPress |
|---|---|---|
| Campo `slug` do payload | respeitado | **ignorado** (o WP deriva do título) |
| Colisão de slug entre portais | guarda de exclusividade, devolve `skipped` | não existe; o WP resolve com sufixo `-2` |
| Categoria fora da lista | cria categoria nova | **cria categoria nova** (`wp_insert_term`) |
| Sem imagem | grava como rascunho | publica assim mesmo |
| Campo `author` | string com o nome | **ID numérico do usuário** |
| Allowlist de IP de origem | não tem (escuta em 127.0.0.1) | **tem**, opção `<hash>_origins` |

## O defeito mais perigoso: autor errado em silêncio

```php
$author_id = ! empty($params['author']) ? intval($params['author']) : null;
if (empty($author_id)) {
    $authors = get_users(array('role__in' => array('author','administrator','editor'), 'number' => 1, ...));
    $author  = ! empty($authors) ? $authors[0] : 1;
}
```

`intval("Redação Diária")` é **0**, que é falsy. O plugin **não devolve erro**:
ele escolhe sozinho o primeiro administrador do site. Ou seja, mandar o nome
num receptor WordPress não falha, **assina errado sem avisar** — e pode cair
justamente num autor bloqueado.

Tratado em `publish._autor_para_receptor()`: nome para Portal Engine, `wp_id`
numérico para WordPress, e **aborta a publicação** se o autor não tiver `wp_id`
num site WordPress, em vez de deixar o plugin escolher.

## O segundo defeito: categoria inexistente

A primeira versão da config deu `categorias_validas: ["Notícias"]` a todos os
11 WordPress, por falta de dado. Só que **6 deles não têm categoria "Notícias"**
(desassossegada, ebookcult, oiempreendedores, pontonaturalbrasil,
sabedoriaglobal, viajenodetalhe). Como o plugin cria a categoria que não existe,
a primeira publicação teria poluído o menu de seis portais.

Corrigido com as categorias reais da tabela `wp_categories` da plataforma, e a
padrão de cada um escolhida por preferência (`Notícias` → `Geral` → `Insights`).

## Estágio 1 do piloto

Os defeitos acima estavam todos no caminho WordPress. Isso é evidência de que
esse caminho é menos provado, não mais. Por isso o piloto começa com os **6 do
portal-engine**, cujo receptor eu li linha a linha, e os 11 WordPress ficam com
`ativo: false` até as primeiras publicações reais confirmarem o padrão.

Ativos no estágio 1: `barranews.com.br`, `clickinfohub.com`, `gpnoticias.com`,
`jornalconceito.com`, `ocontraditorio.com`, `qmixdigital.com.br`.

## Nota sobre o rótulo do validar_portal.py

O script classifica o receptor pela mensagem de erro e hoje rotula todos como
"Portal Engine". O rótulo está errado para os WordPress; o que a linha prova é
o que importa: **a chave foi aceita e o corpo vazio foi recusado**, sem nada
criado no portal. Corrigir o rótulo é cosmético e está na fila.

---

# Estágio 1 = piloto COMPLETO de 17 portais

**Decisão do Anderson, 20/08/2026. O termo fica reservado para isto.**

Houve uma ambiguidade que vale registrar para não se repetir: eu usei "estágio
1" para nomear um recorte de 6 portais que eu mesmo tinha proposto, enquanto
"estágio 1" no vocabulário do projeto já significava o piloto de 17. Os dois
lados falaram de coisas diferentes por duas mensagens. **Termo criado no meio
do caminho é armadilha; estágio 1 agora tem uma definição só.**

Nenhum dos 11 WordPress tinha falha: estavam todos no `sites.json`, com
credencial, categorias reais e autor. Estavam apenas com `ativo: false`, por
decisão minha e critério declarado. O recorte caiu porque os três defeitos do
caminho WordPress foram corrigidos, e o risco residual é tratado pela
salvaguarda abaixo, não por adiamento.

## Salvaguarda: conferência da primeira publicação WordPress

`verificacao.conferir_se_primeira()` roda depois da **primeira** publicação
bem-sucedida de cada portal WordPress. Lê o post de volta pela API do próprio
WordPress e compara três coisas com o que foi enviado:

| O que confere | Por que |
|---|---|
| **Autor** | o plugin faz `intval()`; nome vira 0 e ele escolhe um admin sozinho |
| **Categoria** | o plugin **cria** a categoria que não existe, poluindo o menu |
| **Slug** | sufixo `-2`, `-3` indica colisão com post já existente |

Divergiu: o portal é **pausado** e o alerta vai no Telegram com as
divergências listadas. **Os outros seguem publicando.** Conferiu: chega um
aviso de "1ª publicação conferida OK" e o portal segue normal.

A pausa fica em `motor_estado`, **não** no `sites.json`: a conferência tira um
portal do ar sem reescrever o arquivo que o operador edita à mão, e retomar é
um comando.

```bash
python -m motor_pautas portais-pausados      # lista
python -m motor_pautas retomar-portal <slug> # retoma
```

Falha de leitura da API **não** pausa o portal: derrubar publicação por
indisponibilidade momentânea seria pior que o problema que a conferência
procura. Nesse caso o log registra e a publicação segue.

## Um dado que a conferência já revelou, antes da primeira publicação

Lendo posts **já existentes** nesses sites, antes de o motor publicar qualquer
coisa: `desassossegada.com.br` e `viajenodetalhe.com.br` têm posts com
`author: 0`. Ou seja, **o problema de autor que a auditoria previu já acontece
hoje**, com a plataforma atual, nesses portais. Não é um risco que o motor
introduz: é um defeito existente que o motor foi ensinado a não repetir.

Vale investigar à parte quantos posts da rede estão com autor zerado.

## Relatório automático

`motor-relatorio.timer`, no próprio servidor, a cada 48 h, via Telegram com
prefixo `[MOTOR]`. Roda independente de sessão de qualquer pessoa.

Descartei o agendamento pelo lado do Claude: vive só enquanto a sessão existir
e expira em 7 dias, o que não atende "o dado tem que chegar sozinho".
