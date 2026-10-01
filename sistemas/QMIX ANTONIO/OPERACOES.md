# Operações no painel: cadastrar, ativar, desativar, excluir

> Levantado direto no código em 17/08/2026, servidor `hostinger-vps-srv1166087`,
> docroot `/home/boot/web/acesso.qmix.com.br/public_html`.
> Cada procedimento abaixo cita o arquivo que executa a operação, para conferência.

Quem pode: quase tudo exige `role` **admin** ou **equipe** na tabela `users`.
Exclusão de campanha exige **admin** puro (`delete-news-source.php:22`).

---

## 1. Campanhas de notícia (`news_sources`)

Tela: `/news-sources`. É a origem de todo o fluxo QMIX News.

| Operação | Onde | Observação |
|---|---|---|
| Incluir | `add-news-source.php` | Detecta se a coluna `rss_category_filter` existe e monta o INSERT conforme |
| Editar | `edit-news-source.php` | |
| Duplicar | `duplicate-news-source.php` | A cópia nasce **sempre inativa** e com sufixo " (Cópia)" no nome |
| Ativar / desativar em massa | `ajax-bulk-edit-news-sources.php` | Aceita `status` entre os campos editáveis em lote |
| Excluir | `delete-news-source.php` | 🔴 **Apaga junto todas as `news_items` da campanha** |

### Campos que importam ao cadastrar

- `name` — **é o domínio de destino**, não um rótulo. É por ele que o
  `article-transfer-qmix-news.php` faz o JOIN com `wp_sites`. Errar aqui é o
  motivo mais comum de campanha que gera artigo e nunca publica.
- `campaign_name` — rótulo livre, aparece na listagem.
- `type` — `rss`, `google_news`, `google_trends`, `google_alerts`.
- `url` — aceita **várias URLs, uma por linha**.
- `category` — ID numérico da categoria **no destino**, o mesmo que vai no payload.
- `wp_author_id` — ID numérico do autor no destino.
- `wp_status` — `publish`, `draft`, `pending`, `private`, `future`.
- `image_option` — `create`, `use_source`, `recreate_from_thumbnail`, `none`.
- `fetch_interval` (minutos) e `items_per_fetch`.
- `prompt_article_id`, `prompt_title_id`, `prompt_img_create_id`, `prompt_img_recreate_id`
  — `-1` significa "resolver por domínio" (ver `includes/prompt-resolver.php`).

### Desativar todas de uma vez

```sql
-- salvar a lista ANTES, senão não há como saber quais reativar depois
SELECT GROUP_CONCAT(id) FROM news_sources WHERE status = 'active';
UPDATE news_sources SET status = 'inactive' WHERE status = 'active';
```

Feito em 17/08/2026: 197 campanhas desativadas. A lista de IDs para reverter
está em `campanhas-ativas-em-2026-08-17.txt`, nesta pasta.

```sql
-- reverter exatamente aquelas
UPDATE news_sources SET status = 'active' WHERE id IN (<conteúdo do arquivo>);
```

### Pausar sem mexer em campanha

`admin_settings.qmix_cron_enabled = 0` (botão "Pausar Crons QMIX").

⚠️ Só o `cron-fetch-news.php` e o `cron-qmix-generate-articles.php` consultam
essa chave. O `article-transfer-qmix-news.php` **não consulta**, então o que já
foi gerado continua sendo entregue até a fila esvaziar.

---

## 2. Destinos (`wp_sites`)

Tela: `/wp-sites`. É a tabela que guarda endpoint e chave de cada site.

| Operação | Onde |
|---|---|
| Cadastrar / editar | `wp-sites.php`, `action=save` |
| Excluir | `wp-sites.php`, `action=delete` |
| Ativar / desativar | campo `status` do próprio formulário |
| Importar em lote | `import-wp-sites.php` |

Campos: `domain` (obrigatório), `endpoint_url`, `api_key` (obrigatória no
cadastro novo), `label`, `default_author`, `status`.

### 🔴 A chave é gravada criptografada

O formulário cifra com `encryptApiKey()` antes de gravar
(`wp-sites.php:47`, `<<REMOVIDO>>`). Quem escrever direto no
banco **precisa cifrar também**, senão o `decryptApiKey()` devolve lixo e o
destino responde 401.

```php
require_once '<<REMOVIDO>>';
$cifrada = encryptApiKey('chave-em-texto-plano');
```

Ao editar, se o campo vier mascarado (`***`), a chave **não** é sobrescrita
(`isKeyMasked()`). Isso é proposital.

### Desativar um destino corta tudo

`status = 'inactive'` bloqueia os quatro caminhos de publicação de uma vez,
porque todos filtram por site ativo:

- `article-transfer.php`, `article-transfer-qmix-news.php` e
  `article-transfer-scheduled.php` fazem `INNER JOIN wp_sites ... AND ws.status = 'active'`
- `lc-article-transfer.php` busca a chave por `getWpApiKey()`, que também filtra `status = 'active'`

É a forma mais limpa de tirar um site do ar sem perder endpoint, chave e histórico.
Preferir isso a `DELETE`.

---

## 3. Autores e categorias (`wp_authors`, `wp_categories`)

Alimentam o módulo Editor Externo. **Não** são usados pelas campanhas de
notícia (que mandam `wp_author_id` e `category` direto da própria campanha).

| Operação | Onde |
|---|---|
| Cadastro manual (domínio + categorias + autores + liberação, tudo numa tela) | `/wp-dominios`, aba "Cadastro Manual" |
| Importar CSV | `/wp-dominios`, aba "Importar CSV" |
| Editar / excluir categoria | `/wp-categories` |
| Editar / excluir autor | `/wp-authors` |

Chaves únicas: `(dominio, id_categoria)` e `(dominio, id_autor)`.
O `dominio` grava-se **sem** `https://` e **sem** barra final.

### O que é o `id` interno versus o `id_autor`

- `id_autor` / `id_categoria` = ID **no site de destino**, é o que vai no payload.
- `id` = chave primária local. É **este** que entra em `lc_user_domains.wp_author_id`.

Trocar um pelo outro é o erro clássico do módulo. O `lc-article-transfer.php`
faz `JOIN wp_authors wpa ON wpa.id = lud.wp_author_id` e envia `wpa.id_autor`.

### Para o domínio aparecer para um editor, precisa de três coisas

1. pelo menos **1 autor** em `wp_authors` (sem isso o JOIN derruba a linha e o
   domínio não aparece na tela de seleção);
2. pelo menos **1 categoria** em `wp_categories` (o formulário de artigo tem o
   campo categoria como obrigatório, `editor.qmix.com.br/create-article.php:311`);
3. registro **ativo** em `wp_sites` (senão o artigo é escrito mas a transferência falha).

Em 17/08/2026: 107 domínios cumpriam os três requisitos.

---

## 4. Editores externos (`lc_users`) e liberação (`lc_user_domains`)

| Operação | Onde |
|---|---|
| Cadastrar / editar / excluir editor | `/liberacao-usuarios` |
| Liberar domínios em lote | `/wp-dominios`, aba "Liberar em Lote" |
| Liberar por usuário | `/liberacao-usuarios-dominios` |

Senha do editor: `password_hash($senha, PASSWORD_BCRYPT)`
(`liberacao-usuarios.php:53`). Tabela separada de `users`; o editor acessa por
`editor.qmix.com.br`, não pelo painel.

Liberar via SQL (upsert, chave única `lc_user_id` + `dominio`):

```sql
INSERT INTO lc_user_domains (lc_user_id, dominio, wp_author_id, status)
VALUES (?, ?, ?, 'active')
ON DUPLICATE KEY UPDATE wp_author_id = VALUES(wp_author_id), status = 'active';
```

Revogar: `UPDATE lc_user_domains SET status = 'inactive' WHERE ...`
Preferir isso a `DELETE`, porque preserva qual autor aquele editor usava.

---

## 5. Prompts

| Tabela | Incluir | Editar | Excluir |
|---|---|---|---|
| `prompts` | `cad-prompt.php`, `cad-prompt-seo.php` | `edit-prompt.php`, `edit-prompt-seo.php` | `del-prompt.php` |
| `prompts_img` | `add-prompt-img.php` | `edit-prompt-img.php` | `del-prompt-img.php` |

`prompt_domains` liga prompt a domínio e é gravada pelas mesmas telas.
Categorias que o resolver entende: `qmix_news`, `qmix_news_por_dominio`,
`qmix_news_titulo`, `qmix_news_criar`, `qmix_news_recriar`, `artigos`,
`artigos_por_dominio`. O prompt SEO **ID 1** é o padrão fixo de fallback.

---

## 6. Armadilhas ao mexer direto no banco

1. **Collation divergente.** `wp_authors.dominio` é `utf8mb4_0900_ai_ci`;
   `wp_categories.dominio` e `lc_user_domains.dominio` são `utf8mb4_unicode_ci`.
   JOIN ou UNION entre elas pelo domínio quebra com "Illegal mix of collations".
   Use `COLLATE utf8mb4_unicode_ci` explícito, como as crons de transferência já fazem.

2. **Excluir campanha apaga notícia.** `delete-news-source.php` roda
   `DELETE FROM news_items WHERE source_id = ?` antes de apagar a campanha.
   Para só parar a campanha, desative.

3. **Desativar é quase sempre melhor que excluir.** Preserva chave, endpoint,
   histórico e permite reverter com um UPDATE.

4. **Domínio com e sem `www`.** As crons já tentam as duas formas no JOIN, mas
   ao cadastrar mantenha a mesma grafia em `news_sources.name`, `wp_sites.domain`,
   `wp_authors.dominio` e `lc_user_domains.dominio`.

5. **Assinatura em portal do engine depende de `author_name`.** Em 17/08/2026 o
   `lc-article-transfer.php` passou a enviar `author_name` (nome do autor) junto
   com o `author` numérico, e o `render.js` do engine passou a preferir esse
   campo. Motivo: o `qmix-receiver.php` do WordPress lê só `author` e faz
   `intval()`, então mandar nome nesse campo quebraria a assinatura em mais de
   100 destinos. Com os dois campos, cada família usa o que entende.

   ⚠️ O patch do `render.js` está aplicado **somente no srv1166087**. Nos outros
   dois servidores do engine (clinicas-vps e opengravity) a versão é a antiga:
   publica normal, mas assina com o nome do site. Replicar só quando precisar, um
   servidor de cada vez e com backup, porque as três versões do `render.js` diferem.

6. **Sites de cliente não entram como destino.** Site de cliente recebe link,
   não recebe publicação. Em 17/08/2026 foram removidos da lista de publicação:
   belemduartealmeida, carretaspresidente, comprarsites, comprarvisualizacoes,
   energiaeficiente, itacaiugo, pael, qmiximoveis, tratamentodor, qmix.digital
   e peritodicas (este virou diretório e teve campanha e `wp_sites` desativados).

---

## Faturamento dos editores (cobrança por post)

Editor marcado como **pagante** vê o menu **Pagamentos** no editor.qmix.com.br,
com os posts publicados ainda não cobrados, o total e um botão que gera a
cobrança PIX no Asaas. A baixa é automática pelo webhook.

### Onde fica cada coisa

| Peça | Caminho (host `hostinger-vps-srv1166087`) |
|---|---|
| Credenciais | `/home/boot/.qmix-asaas.env` (chmod 600, dono boot) |
| Cliente do Asaas | `editor.../public_html/includes/asaas.php` |
| Tela do editor | `editor.../public_html/pagamentos.php` |
| Webhook | `editor.../public_html/webhook-asaas.php` |
| Log do webhook | `editor.../public_html/logs/asaas-webhook.log` |
| Painel do Anderson | `acesso.../public_html/cobrancas-editores.php` |

Banco: `lc_users.tipo_cobranca` ('parceiro' ou 'pagante'), `lc_users.valor_post`,
tabela `lc_cobrancas` e a coluna `lc_articles.cobranca_id` (nula = post em aberto).

### Definir quem paga

Painel **Cobranças dos Editores** (menu do acesso, restrito aos ids 8 e 23):
escolher "Pagante", informar o valor por post e salvar. Marcar como "Parceiro"
zera o valor e some com o menu Pagamentos para aquele editor.

### Registrar o webhook no Asaas

Painel do Asaas → Integrações → Webhooks:

- URL: `https://editor.qmix.com.br/webhook-asaas.php`
- Token de autenticação: o valor de `ASAAS_WEBHOOK_TOKEN` do arquivo de credenciais
- Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_REFUNDED`, `PAYMENT_DELETED`

O endpoint responde 200 em tudo que não reconhece, de propósito: o Asaas
interrompe a fila de eventos da conta inteira quando o endpoint devolve erro.

### Se o webhook falhar

A própria tela de Pagamentos consulta o status da cobrança pendente no Asaas a
cada carregamento, então o editor consegue confirmar sozinho pelo botão
"Já paguei, conferir". O painel do Anderson também tem baixa manual e
cancelamento (que devolve os posts para em aberto).

### Trocar a chave da API

Editar a linha `ASAAS_API_KEY=` do arquivo de credenciais. **Não usar heredoc
sem aspas nem `echo` sem aspas**: a chave começa com `$` e o shell come o valor.
Conferir depois com um GET em `/v3/myAccount`, que deve responder 200.

---

## Categorias reservadas: editorias "black" (atualizado em 17/09/2026)

Conteúdo sensível (apostas, IPTV, cassino, massagem, vape) entra nos portais em
**editorias ocultas**: a página da editoria e os artigos ficam no ar, mas fora
do menu, da home e do rodapé (`hideCategories` no `sites.json` do
portal-engine). No Antônio essas categorias só aparecem no seletor de quem está
em `EDITORES_BLACK`: **Anderson (2), Kátia (4), Dayane (10) e Diego (11)**.
Para os outros editores elas não existem, e o salvamento recusa o id por fora.

Arquivo: `editor.../public_html/includes/categorias-restritas.php`

```php
const EDITORES_BLACK = [2, 4, 10, 11];
const CATEGORIAS_RESERVADAS = [
    'apostas' => EDITORES_BLACK, 'iptv' => EDITORES_BLACK, 'cassino' => EDITORES_BLACK,
    'massagem' => EDITORES_BLACK, 'vape' => EDITORES_BLACK,
];
```

**Onde as editorias existem (32 dos 42 domínios do lote do Jean):** os 30
portal-engine da opengravity e os 2 da clinicas-vps (ortopediacoluna,
ortopedistadeombro). Ids no `categoryMap`: **9001 Apostas, 9002 IPTV, 9003
Cassino, 9004 Massagem, 9005 Vape**, exceto onde `iptv` já existia com outro id
(26 portais, por exemplo wtw19 = 616, blogse = 32), que foi reaproveitado. As
mesmas 160 linhas estão em `wp_categories`. Script:
`/opt/portal-engine/scripts/black_cats.py dominio...` nas duas máquinas (faz
backup `sites.json.bak-black-<data>` e imprime os ids para o cadastro).

**Ficaram de fora os 10 apps Next** (cirurgiacoracao, cirurgiadacatarata,
cirurgiadecancer, geladeirastop, institutoortopedico, medicinageriatrica,
medicodasmaos, notebookx, planomedicosaude, saudevitalidade): neles a lista de
categorias é código (`siteConfig.categories`, id = posição + 1), então cada um
precisa de alteração no fonte e deploy. Os quatro editores veem esses sites, mas
só com as categorias normais.

**Para incluir outro editor:** acrescentar o id em `EDITORES_BLACK`. **Para
outra editoria:** acrescentar a tupla em `EDITORIAS` no `black_cats.py`, rodar
nas duas máquinas, gravar em `wp_categories` e acrescentar o termo em
`CATEGORIAS_RESERVADAS`.

A regra casa pelo **nome** da categoria, não pelo id: uma categoria IPTV criada
amanhã em outro domínio já entra na restrição sozinha. Para reservar outra
categoria, basta acrescentar uma linha no array.

O filtro é aplicado em `create-article.php` em dois pontos, e os dois são
necessários: um esconde a opção do seletor, o outro recusa o salvamento se
alguém enviar o id por fora do formulário.

---

## Todos os crons falhando ao mesmo tempo

Se chegarem dezenas de alertas juntos, o primeiro sinal a olhar é a **saída** no
log de `/var/log/antonio/<nome>.log`:

- **Saída vazia com `exit=1`** → o problema é o wrapper, não o script. O
  `qmix-cron-runner` chama `mktemp` antes de rodar o PHP; se `/tmp` não estiver
  gravável, o redirecionamento quebra e o bash sai com 1 sem executar nada.

```bash
stat -c "%a %U:%G" /tmp     # tem que ser 1777 root:root
sudo -u boot mktemp         # tem que criar o arquivo
chown root:root /tmp && chmod 1777 /tmp   # correção
```

- **Saída com erro de PHP** → aí sim é o script ou o banco.

Aconteceu em 29/08/2026: uma cópia de arquivos vinda de máquina Windows levou
junto o dono e a permissão do `/tmp`, e derrubou os 16 crons por 17 minutos.
O alerta de `MySQL server has gone away` que veio antes era de outro ciclo e
despistou o diagnóstico: o banco estava intacto.

**Blindagem (29/08/2026):** o `qmix-cron-runner` deixou de depender do `/tmp`.
Ele tenta `/tmp`, cai para `/var/tmp` e, no pior caso, descarta a saída, mas
sempre executa o PHP. O carimbo do throttle do Telegram e o `_resend-last.json`
também saíram do `/tmp` para o `/var/log/antonio`, que é o motivo de terem
chegado 60 alertas de uma vez: o throttle não conseguia gravar.
Backup: `/usr/local/bin/qmix-cron-runner.bak-tmpfallback-20260829`.

**Para não repetir:** quem copiar arquivos da máquina Windows para o servidor
não deve usar `rsync -a <pasta>/ host:/tmp/`, porque o `-a` aplica dono e
permissão da pasta de origem no próprio `/tmp`. Usar uma subpasta
(`/tmp/qmix-r4/`) ou `rsync -rt --no-perms --no-owner --no-group --omit-dir-times`.

---

## Reconexão ao MySQL nas crons

O `wait_timeout` do MySQL está em **10 segundos** (`/etc/mysql/my.cnf`). Qualquer
cron que segure a conexão parada por mais que isso, enquanto chama a API do
WordPress ou gera imagem, leva `MySQL server has gone away` na consulta seguinte.

O sistema já tem `isMysqlAlive()` e `reconnectDb()` em `includes/db-helper.php`.
O padrão é chamar os dois antes de qualquer escrita que venha depois de trabalho
demorado:

```php
if (!isMysqlAlive($conn)) {
    $conn = reconnectDb('nome-da-cron: o que estava fazendo');
}
```

Pontos já protegidos:

| Arquivo | Onde | Quando |
|---|---|---|
| `article-transfer.php` | antes do endpoint e depois do cURL | antes de 28/07/2026 |
| `article-transfer-qmix-news.php` | idem | 15/08/2026 |
| `lc-article-transfer.php` | idem | antes de 23/07/2026 |
| `includes/cron-logger.php` | antes do INSERT em `cron_logs` | 30/08/2026 |
| `cron-pedidos-img-article.php` | antes de buscar o pendente | 30/08/2026 |
| `cron-fetch-news.php` | na verificação inicial | 30/08/2026 |

O caso do `cron-logger.php` era o mais silencioso: a cron terminava em exit 0,
o trabalho era feito, mas o registro em `cron_logs` se perdia. Eram **1411**
registros perdidos até 30/08/2026, o que fazia o painel de logs mentir sobre o
que tinha rodado.

Backups: `*.bak-reconexao-20260830`.

---

## Sistema de notícias desativado (01/09/2026)

O módulo de notícias (tabelas `news_items` e `news_sources`) foi desligado a
pedido do Anderson. As 6 linhas do crontab do `boot` foram **comentadas**, não
removidas, com o prefixo `#DESLIGADO-NOTICIAS `:

| Cron | Frequência |
|---|---|
| `cron-fetch-news.php` | a cada minuto |
| `cron-qmix-generate-articles.php` (normal e DESC) | a cada minuto |
| `article-transfer-qmix-news.php` (2 entradas) | a cada minuto |
| `cron-qmix-fontes-mudas.php` | diária, 9h |

**Para religar:** `crontab -u boot -e` e apagar o prefixo `#DESLIGADO-NOTICIAS `
das linhas. Backup do crontab original em
`/root/crontab-boot.bak-noticias-20260901`.

Continuam ativos e intocados: módulo SEO (`seo_articles`: `cron-article`,
`cron-img-article`, `article-transfer`, `article-transfer-scheduled`), pedidos
(`order_items`: `cron-pedidos-*`) e editores (`lc_articles`: `lc-*`).

---

## Atualização automática do Ubuntu derruba o MySQL

Em 01/09/2026, às 06:20, o `unattended-upgrades` atualizou o `mysql-server-8.0`
de `8.0.46-0ubuntu0.24.04.3` para `.4`. O serviço parou e voltou duas vezes,
somando cerca de 30 segundos fora do ar. As crons que dispararam nessa janela
morreram com `exit 255` em `dbh.inc.php:9`, no próprio `new mysqli()`.

**Como reconhecer:** o erro é no construtor do mysqli, e não um
`MySQL server has gone away`. Confirmar com:

```bash
systemctl status mysql | grep Active     # uptime baixo demais
grep mysql-server /var/log/dpkg.log      # atualização no mesmo horário
```

É esperado e se resolve sozinho no ciclo seguinte. A reconexão de
`includes/db-helper.php` não cobre esse caso, porque o script morre antes de
existir uma conexão para reconectar.

---

## Enum estreito derruba a cron (armadilha recorrente)

Já aconteceu duas vezes: uma coluna ENUM não tinha o valor que o código passava,
o MySQL lançou `Data truncated for column ...` e o cron morreu com `exit 255`.

| Data | Coluna | Valor faltando | Efeito |
|---|---|---|---|
| antes | `cron_logs.cron_type` | `reset` | log da cron sumia em silêncio |
| 01/09/2026 | `wp_transfer_errors.article_type` | `lc` | derrubava `lc-article-transfer` |

O caso de 01/09: os dois crons de editor (`lc-article-transfer.php:251` e
`lc-article-transfer-scheduled.php:215`) chamam `logWpTransferError()` com o tipo
`'lc'`, mas a coluna aceitava apenas `enum('seo','news')`. Toda vez que um envio
de artigo de editor falhava, a tentativa de **registrar** essa falha matava a
cron. O artigo em si não se perdia: era reenviado no ciclo seguinte.

Corrigido com `ALTER TABLE wp_transfer_errors MODIFY article_type
ENUM('seo','news','lc') NOT NULL DEFAULT 'seo'` e, principalmente, envolvendo o
corpo de `logWpTransferError()` num `try/catch`, como já era feito em
`cron-logger.php`.

**Regra:** registrar um erro nunca pode derrubar o processo que estava tratando
esse erro. Todo helper de log deve ter `try/catch` e devolver `false` em vez de
lançar. Ao acrescentar um valor novo em código que grava numa coluna ENUM,
conferir a coluna antes com `SHOW COLUMNS FROM tabela LIKE 'coluna'`.

Backup: `includes/wp-transfer-error-helper.php.bak-blindagem-20260901`.

---

## Dashboard do editor: título curto e lupa de indexação

`editor.qmix.com.br/dashboard.php` (01/09/2026):

- **Título** cortado em 60 caracteres com reticências. O texto completo continua
  disponível ao passar o mouse (atributo `title`), porque o editor não precisa
  ler o título inteiro na listagem.
- **Coluna "Indexação"**, entre Endereço e Ação. A lupa abre
  `google.com/search?q=site:<url exata>` numa aba nova: se o Google devolve o
  resultado, a página está indexada. Aparece apenas em artigo já publicado; nos
  demais mostra um travessão.

A coluna foi posicionada pensando na próxima, de envio a indexador, que ficará
ao lado. Backup: `dashboard.php.bak-lupa-20260901`.

---

## Créditos de indexação (venda ao editor)

Vendido a **R$ 1,00 por URL**, pagamento **só por PIX** via Asaas, liberação
automática pelo webhook. Por dentro cada URL consome 3 créditos do fornecedor no
modo prioritário, o que dá cerca de R$ 0,70 de custo. **O nome do fornecedor não
aparece em nenhuma tela do editor**, apenas em
`/home/boot/.qmix-indexador.env` e em `includes/indexador.php`.

### Peças (todas em `editor.qmix.com.br/public_html`)

| Arquivo | Papel |
|---|---|
| `includes/indexador.php` | cliente da API do fornecedor |
| `includes/creditos.php` | saldo, extrato, crédito e consumo |
| `indexacao.php` | tela do editor: saldo, compra, prazos, envios, extrato |
| `indexar.php` | ação do botão de enviar, consome 1 crédito |
| `cron-indexacao-status.php` | de hora em hora, confirma e devolve crédito |

Banco: `lc_users.creditos_indexacao` (saldo), `lc_creditos_mov` (extrato),
`lc_indexacoes` (URLs enviadas), mais `lc_cobrancas.tipo` e `.qtd_creditos`,
que reaproveitam o encanamento de PIX já existente.

Administração: painel **Cobranças dos Editores** mostra o saldo de cada um e
permite ajuste manual (positivo credita, negativo retira).

### Decisões que não são óbvias

**O extrato é a fonte de verdade**, não a coluna de saldo. Toda mudança grava uma
linha em `lc_creditos_mov` com o saldo resultante, na mesma transação. Para
conferir: `SELECT SUM(quantidade) FROM lc_creditos_mov WHERE lc_user_id=?` tem
que bater com `lc_users.creditos_indexacao`.

**O consumo é condicional no próprio UPDATE**
(`WHERE creditos_indexacao >= ?`), então dois cliques simultâneos não gastam o
mesmo crédito duas vezes.

**Crédito é debitado antes de chamar o fornecedor** e devolvido se o envio
falhar. O contrário permitiria enviar sem cobrar.

**A liberação por webhook é idempotente pela referência** `cobranca_N`: o Asaas
reenvia o evento quando não recebe 200, e sem isso o editor ganharia créditos em
dobro.

**Mínimo de 50 URLs por compra.** A tarifa do PIX no Asaas é por transação e
inviabiliza venda avulsa de R$ 1,00.

**A confirmação demora.** O fornecedor só publica o resultado por URL a partir do
4º dia e encerra no 14º. Até lá a URL fica como "enviada", e a tela explica isso
para o editor não achar que travou.

---

## Duas armadilhas do ambiente (custaram tempo em 01/09/2026)

**1. `open_basedir` isola cada site.** O PHP servido pela web só enxerga o
diretório do próprio site, `/tmp` e `/opt`. Credencial guardada em `/home/boot`
funciona pela linha de comando e **é invisível pela web**, sem erro visível:
o webhook passa a rejeitar até o token correto, e o `include` de um arquivo do
outro app dá erro fatal. Por isso:

- credenciais em `/opt/qmix/env/` (`asaas.env`, `indexador.env`)
- código compartilhado pelos dois painéis em `/opt/qmix/lib/`
  (`creditos.php`, `documento.php`)

Nenhum dos dois é servido pela web. Ao criar credencial nova, **testar pela web**,
não só por CLI.

**2. O Asaas em produção exige CPF ou CNPJ do cliente.** Sem isso a cobrança é
recusada com "Para criar esta cobrança é necessário preencher o CPF ou CNPJ do
cliente". A tela de Indexação pede o documento antes da primeira compra e valida
os dígitos. Cliente criado antes disso fica sem documento no Asaas: o
`asaasClienteDoEditor()` completa o cadastro na primeira cobrança seguinte.

### Tarifas reais do contrato (lidas em `/v3/myAccount/fees`)

| Meio | Tarifa |
|---|---|
| PIX | R$ 1,99, com **100 recebimentos/mês sem tarifa** |
| Boleto | R$ 1,99 |
| Cartão à vista | 2,99% + R$ 0,49 |
| Transferência PIX (saída) | R$ 2,00, 30 grátis/mês |

O desconto promocional de R$ 0,99 no PIX venceu em 19/05/2026.

**Limite de 10 webhooks por conta.** A conta já tinha 9; o do editor é o décimo
(id `1e407157-6647-461a-acc9-9efda0932dac`). Não há espaço para mais nenhum.

---

## A tarifa do PIX é cobrada por fora (decisão de 01/09/2026)

Medido numa cobrança real: R$ 50,00 pagos entraram como **R$ 48,01**. A tarifa de
R$ 1,99 foi cobrada **mesmo com 100 recebimentos gratuitos disponíveis e zero
usados no mês**. Isso encerra a dúvida entre as duas páginas do Asaas: a isenção
vale só para PIX por chave ou QR estático, e **cobrança com QR dinâmico**, que é
o que este sistema gera, **paga tarifa cheia sempre**.

Por isso a tarifa entra por fora do preço, na constante `TARIFA_PIX` de
`indexacao.php`:

| Pacote | Créditos | Tarifa | Cliente paga |
|---|---|---|---|
| 50 URLs | R$ 50,00 | R$ 1,99 | **R$ 51,99** |
| 100 URLs | R$ 100,00 | R$ 1,99 | R$ 101,99 |
| 250 URLs | R$ 250,00 | R$ 1,99 | R$ 251,99 |
| 500 URLs | R$ 500,00 | R$ 1,99 | R$ 501,99 |

A tela mostra a conta aberta ("R$ 50,00 + R$ 1,99 tarifa"), porque tarifa
embutida sem explicação vira reclamação. Como é valor fixo por transação, o
pacote maior dilui: R$ 1,99 é 4% na compra de 50 e 0,4% na de 500.

**Se o Asaas mudar a tarifa**, alterar só a constante `TARIFA_PIX`. Para conferir
o valor vigente do contrato: `GET /v3/myAccount/fees`, campo
`payment.pix.fixedFeeValue`. Para conferir o que foi realmente cobrado numa
venda: `GET /v3/payments/{id}`, e a diferença entre `value` e `netValue`.

---

## Redesenho da área do editor (01/09/2026)

Toda a aparência de `editor.qmix.com.br` passou a vir de uma folha única,
`assets/css/editor-2026.css`, carregada **por último** no `includes/header.php`.
Os arquivos antigos (`style.css`, `dashboard*.css`) continuam lá e não foram
tocados: se algo der errado, basta remover a linha da folha nova que o visual
anterior volta inteiro.

**Direção:** sala de controle editorial. Fundo profundo com grão em SVG, filete
de 1px no lugar de caixa, número tabular como protagonista e o verde da marca
usado só como sinal (item ativo, publicado, ação principal), nunca como enfeite.

**Tipografia:** Bricolage Grotesque nos títulos e números, Public Sans no texto,
IBM Plex Mono em endereços e dados. Trocadas as Montserrat.

**Correções de conteúdo, não só de estilo:**

- O botão "Ver todos" esticava por toda a largura, porque o tema antigo dava
  largura total aos filhos do `.card-header`. Resolvido com `flex: 0 0 auto`.
- A URL completa ocupava três linhas por artigo. Agora aparece só o caminho,
  cortado, em uma linha e em fonte mono, com o endereço inteiro no `title`.
- Os quatro quadrados de contagem viraram uma faixa única com divisórias de 1px,
  e o ícone virou um ponto de cor: quem precisa de peso é o número.

**Celular:** abaixo de 640px cada linha de tabela vira um cartão, com o nome da
coluna acima do valor (`data-label`). Nada sai da tela e não há gesto a
descobrir. O `thead` sai da tela mas continua no DOM, para leitor de tela.
Aplicado em `dashboard.php`, `my-articles.php` e `indexacao.php`.

**Ao mexer:** subir o `?v=` da folha no `header.php` para furar o cache.

Backups: `*.bak-visual-20260901` e `*.bak-rotulos-20260901`.

**Indicadores do painel (01/09/2026):** os quatro contadores de status viraram
números que o editor usa de fato.

| Antes | Agora |
|---|---|
| Rascunhos | Publicados (`pw_transfer = 2`) |
| Aguardando revisão | Aguardando revisão |
| Aprovados | Rascunhos |
| Reprovados | Créditos de indexação |

"Aprovados" saiu porque artigo aprovado vira publicado em minutos: o número só
repetia "Publicados" com atraso, e ainda por cima menor (12 contra 13 reais).
"Reprovados" passou a aparecer **só quando existe pelo menos um**, porque cartão
zerado permanente vira ruído, mas esconder um problema real seria pior.

Cada indicador virou link para a lista já filtrada, e os créditos levam à tela de
Indexação, mostrando zero quando não há saldo.

**Paleta e tipografia da marca (01/09/2026):** o painel passou a usar exatamente
os valores do site principal, lidos de
`D:\SITES\qmix-next\qmix-next\src\app\(frontend)\globals.css`:

| Papel | Valor | Nome no site |
|---|---|---|
| Fundo | `#050a0f` | `--qmix-bg` |
| Superfície | `#0a111c` | `--qmix-bg-alt` |
| Texto | `#e7f1ff` | `--qmix-text` |
| Texto secundário | `#c7d5e5` | `--qmix-text-secondary` |
| Texto apagado | `#8899aa` | `--qmix-text-muted` |
| Sinal | `#00ff66` | `--qmix-green` |
| Sinal (hover) | `#00dd55` | `--qmix-green-hover` |
| Tinta sobre verde | `#03101e` | `--qmix-green-dark` |
| Atenção | `#ffaa00` | âmbar do site |
| Erro | `#ff6b6b` | vermelho do site |

Tipografia: **Montserrat** nos títulos e **Open Sans** no texto, como o site.
IBM Plex Mono entra só em endereço e dado tabular, que o site não precisa ter.

**O site não tem azul.** Os azuis do tema antigo viraram o cinza-azulado do texto
secundário, e o verde ficou reservado ao que é sinal. Foram 211 cores soltas
trocadas nos arquivos PHP, e o HTML gerado hoje não tem nenhuma cor fora da
paleta.

Dois tons existem só no painel e não no site: `#03070c` na barra lateral, para
dar profundidade, e `#0d1520` no hover.

---

## Avisos no Telegram (@qmixparceiros_bot)

Notificador compartilhado em `/opt/qmix/lib/telegram.php`, credenciais em
`/opt/qmix/env/telegram.env`. O arquivo antigo `/home/boot/.qmix-parceiros.env`
foi **copiado, não movido**, porque o `cron-alert-publicacoes-editores.php` ainda
lê de lá. Se um dia mudar o token, mudar nos dois.

| Evento | Onde dispara | Ícone |
|---|---|---|
| Compra de créditos paga | `webhook-asaas.php` | 💰 |
| Fatura de posts paga | `webhook-asaas.php` | 💰 |
| URL enviada para indexação | `indexar.php` | 🔎 |
| Falha ao enviar para indexação | `indexar.php` | ⚠️ |
| Artigo aguardando revisão | `create-article.php` | 📝 |
| Resultado da indexação | `cron-indexacao-status.php` | 📊 |
| Créditos do indexador acabando | `cron-indexacao-status.php` | 🔋 |

**Regra de projeto: avisar nunca pode derrubar a ação que gerou o aviso.** Tudo
em `try/catch`, com 8 segundos de espera no máximo. Se o Telegram estiver fora, a
compra continua valendo e o envio continua indo.

**O aviso de compra só sai na primeira vez.** O Asaas reenvia o evento quando não
recebe 200, e sem a checagem de `affected_rows` você receberia a mesma mensagem
várias vezes.

**Estoque baixo:** avisa uma vez por dia enquanto o saldo do fornecedor estiver
abaixo de 90 créditos (cerca de 30 URLs). O carimbo fica em
`editor.../public_html/logs/.saldo-avisado` e é apagado sozinho quando o saldo é
reposto. Sem isso o serviço pararia sem avisar.

**Resultado da indexação:** só manda mensagem quando houve desfecho. Rodada de
hora em hora sem novidade não vira notificação.

---

## Chamados dos editores (suporte)

Editor abre em **Suporte** (`editor.../suporte.php`), você responde em **Chamados
dos Editores** (`acesso.../tickets-editores.php`, restrito aos ids 8 e 23).

**Três tipos:** 💡 Sugestão, 🔧 Ajuste, 📣 Reclamação.

**É conversa, não formulário de mão única.** Tabelas `lc_tickets` (o chamado) e
`lc_ticket_mensagens` (a troca). Guardar só o texto inicial obrigaria a continuar
o assunto por fora do sistema, que é onde as coisas se perdem.

**A situação diz de quem é a vez:**

| Situação | Significado |
|---|---|
| `aberto` | esperando você |
| `respondido` | você respondeu, a bola é do editor |
| `fechado` | encerrado; o editor abre um novo se voltar |

A troca é automática: quando o editor responde num chamado já respondido, ele
volta para `aberto`. Assim a lista ordenada por situação mostra primeiro o que
depende de você.

**Telegram:** avisa na abertura (com tipo, autor, assunto e os primeiros 400
caracteres) e a cada resposta do editor. Resposta sua não avisa, porque você já
sabe.

**Validação na entrada:** assunto com 5 caracteres no mínimo e descrição com 15.
Sem isso chegam chamados com "não funciona" e nada mais, e a primeira resposta
vira sempre um pedido de detalhe.

---

## Dashboard e Meus Artigos viraram uma tela só (01/09/2026)

Eram duas tabelas dos **mesmos dados**, com colunas e ações diferentes em cada
uma, o que obrigava o editor a decorar onde estava cada coisa:

| | Dashboard (antes) | Meus Artigos (antes) |
|---|---|---|
| Quantidade | 5 mais recentes | todos |
| Endereço publicado | sim | não |
| Indexação | sim | não |
| Filtro por situação | não | sim |
| Abrir no site | não | sim |
| Editar / excluir | editar | editar e excluir |

Agora o **Painel** (antigo Dashboard) tem tudo: indicadores, abas de filtro,
lista completa (limite de 300) e as quatro ações na mesma linha — abrir no site,
enviar para indexação, editar e excluir rascunho.

**`my-articles.php` continua existindo como encaminhamento 301** para o painel,
preservando o filtro na URL. Isso não é apego: o `includes/mailer.php` manda esse
endereço por e-mail aos editores, e há favoritos por aí.

**Editar, excluir e enviar para indexação só aparecem no próprio painel.** Quando
você abre o painel de outro editor, a tela é somente leitura — conferido: zero
botões de envio ao visualizar o editor 6.

O item "Meus Artigos" saiu do menu e "Dashboard" virou "Painel".

**Destinatários do bot (01/09/2026):** `TG_CHAT` em `/opt/qmix/env/telegram.env`
aceita **vários ids separados por vírgula**. Hoje são dois:

| Id | Quem |
|---|---|
| <<REMOVIDO>> | Anderson (@qmixdigital) |
| 8800186283 | Kátia, confirmada por código em 01/09/2026 |

**Um bot não consegue iniciar conversa.** Para incluir alguém, a pessoa precisa
abrir @qmixparceiros_bot e mandar qualquer mensagem; só então o id dela existe.
Depois disso, conferir quem é antes de adicionar: `getUpdates` mostra o id, mas o
nome de exibição pode não identificar ninguém (o da Kátia aparecia como "93735").
O jeito seguro é mandar um código para o chat e pedir que a pessoa devolva.

O `cron-alert-publicacoes-editores.php` também passou a usar o notificador
compartilhado, então **todos os avisos vão para a mesma lista**. Se um
destinatário falhar, os outros continuam recebendo.

**Ainda melhor seria um grupo:** com o bot dentro de um grupo, incluir ou remover
gente deixa de exigir mudança de configuração.

**Quem pode ver o painel dos outros editores:** lista `$PODE_VER_OUTROS` na linha
22 de `editor.../dashboard.php`. Hoje `[2, 4]` — Anderson e Kátia (01/09/2026).

A restrição é **por id, não por papel**: vários editores têm `role = 'admin'` em
`lc_users` e não devem ver o painel dos colegas. Trocar isso por uma checagem de
papel liberaria o painel de todos para todos.

Ver o painel de outro é **somente leitura**: sem editar, sem excluir e sem
enviar para indexação, que gastaria crédito alheio.

---

## Fim da revisão prévia (01/09/2026)

Todo editor passou a publicar **direto**, sem passar pela liberação da Kátia.
Antes o gatilho era o papel: `role = 'admin'` publicava direto (Anderson, Kátia,
Thayna, Marcos Jean, Antonio Dev) e `role = 'editor'` ia para a fila
(Lucas, Gustavo, Rodrigo, Felipe). Agora `$newStatus = 'approved'` para todos em
`create-article.php`.

**A conferência mudou de lugar, não deixou de existir:** cada envio avisa no
Telegram com autor, domínio, título e a data quando for agendado, e a publicação
efetiva avisa de novo pelo `cron-alert-publicacoes-editores.php`.

**O e-mail de "novo artigo aguardando revisão" foi desligado** (a chamada a
`notifyNewArticle` saiu). Ele ia para katiaalvesph@gmail.com pedindo revisão de
algo que já teria sido publicado.

A tela `liberacao-conteudo.php` continua funcionando, apenas não recebe mais
artigos novos. O e-mail de artigo **reprovado** segue ativo, para o caso de você
reprovar algo de lá.

**Cuidado ao editar mensagens do Telegram nesses arquivos:** escapes com barra
invertida (`\n`, `\xf0...`) se perdem quando o patch passa por heredoc e viram
bytes literais, quebrando o emoji. Nesses trechos o emoji é montado com `chr()`
e a quebra de linha com `chr(10)`, de propósito.

---

## Backups e logs fora da pasta servida (01/09/2026)

**Achado:** havia **106 arquivos `.bak`** dentro de `public_html`, e o servidor os
entregava como **texto puro**, porque o Apache só interpreta `.php`. Qualquer um
que adivinhasse o nome lia o código-fonte inteiro, com caminhos internos, lógica
do webhook e a localização dos arquivos de credencial. Nenhuma chave literal
vazou (elas ficam em `/opt/qmix/env`), mas era material de reconhecimento.
O log do webhook, com ids de pagamento, também estava público.

**Corrigido:**

- os 106 backups foram para `/home/boot/backups-web/AAAAMMDD/`, fora da web
- o log do webhook e o carimbo do saldo foram para `/home/boot/logs-editor/`
- o `.htaccess` dos dois sites passou a **negar** `.bak`, `.log`, `.sql`, `.env`,
  `.ini`, `.sh`, `.old`, arquivos terminados em `~` e qualquer nome iniciado por
  ponto. Testado: um `.bak` novo responde 403.

**Regra:** backup nunca fica na pasta servida. Ao editar em produção, salvar a
cópia em `/home/boot/backups-web/`.

---

## Faxina e endurecimento (01/09/2026)

**Banco: de 345 MB para 111 MB.** A tabela `cron_logs` sozinha ocupava 269 MB
(78% do total) com 130 mil linhas e nenhuma política de descarte. Passou a manter
**30 dias**, com limpeza diária às 4h30 (`cron-limpa-logs.php`, no crontab do
boot). O DELETE é feito em lotes de 5.000 com pausa entre eles: um DELETE único
de 100 mil linhas travaria a tabela que as crons escrevem a cada minuto.
O `OPTIMIZE TABLE` levou 22 segundos e devolveu o espaço ao disco; as crons
seguiram rodando porque o gravador de log tem `try/catch`.

**Cookie de sessão** dos dois painéis agora tem `httponly`, `secure`,
`samesite=Lax` e `use_strict_mode`. Feito por **`.user.ini`** em cada
`public_html`, e não em `.htaccess`: com PHP-FPM o `php_value` do htaccess é
ignorado. A vantagem do `.user.ini` é valer para todo ponto de entrada sem
precisar editar cada `session_start()`.

**Login do editor** ganhou três proteções:

- limite de tentativas: 12 por IP e 6 por e-mail em 15 minutos, na tabela
  `lc_login_tentativas`. Durante o bloqueio nem a senha correta entra.
- mensagem única, `E-mail ou senha incorretos.` Antes o sistema respondia
  "E-mail não encontrado", o que permitia descobrir quais endereços existem.
- `session_regenerate_id(true)` após autenticar, contra fixação de sessão.

Entrar com sucesso limpa o histórico daquele e-mail e IP. As tentativas com mais
de 2 dias são descartadas na limpeza diária.

**Usuário "Antonio Dev" (lc_users 1) removido.** Não tinha domínio, artigo,
cobrança, crédito, indexação nem chamado. O registro foi salvo em
`/home/boot/backups-web/lc_user_1_removido_20260901.json` caso precise voltar.

---

## Módulo de notícias desativado (01/09/2026)

Desligado a pedido do Anderson, que passou a usar outro sistema. **Feito de forma
reversível:** nada foi apagado sem cópia, e a configuração continua no banco.

### Como está agora

| Camada | Estado |
|---|---|
| Crons no crontab do `boot` | comentadas com `#DESLIGADO-NOTICIAS ` |
| `admin_settings.qmix_cron_enabled` | `0` |
| `news_items` (notícias coletadas) | vazia, era 40 MB |
| `news_sources` | **mantida**, 230 fontes |
| `news_source_negative_keywords` | **mantida**, 52 termos |

O interruptor `qmix_cron_enabled` é lido apenas por `cron-fetch-news.php`,
`cron-qmix-generate-articles.php` e `news-items.php`. Não afeta o módulo SEO, o
de pedidos nem o dos editores.

### Como reativar

1. `crontab -u boot -e` e apagar o prefixo `#DESLIGADO-NOTICIAS ` das 6 linhas
2. `UPDATE admin_settings SET qmix_cron_enabled = 1 WHERE id = 1`
3. Ativar as fontes desejadas em `/news-sources` (hoje 1 ativa, 229 inativas)

As notícias antigas voltam, se quiser, com
`zcat /home/boot/backups-web/modulo-noticias-20260901/noticias-completo.sql.gz | mysql ...`.
O arquivo tem 854 KB e guarda as 4 tabelas com estrutura e dados. Há também um
`noticias-configuracao.sql.gz` de 11 KB só com as fontes e as palavras negativas.

As telas do módulo continuam no painel, apenas sem dados. Não foram removidas
justamente para a reativação ser trivial.

### Espaço recuperado no caminho

`seo_articles` ocupava **685 MB no disco para guardar 0,1 MB de dados** — sobra
das exclusões em massa, que o InnoDB não devolve sozinho. Com `OPTIMIZE TABLE`
foi para 1 MB. Somando as outras tabelas reconstruídas, a pasta do banco caiu de
**888 MB para 207 MB**, com as crons rodando durante todo o processo.

**Vale repetir de tempos em tempos:** exclusão em massa no MySQL não devolve
disco. Para ver onde há desperdício:

```sql
SELECT table_name, ROUND(data_free/1024/1024,1) AS mb_livres
FROM information_schema.TABLES
WHERE table_schema = DATABASE() AND data_free > 20*1024*1024
ORDER BY data_free DESC;
```

---

## Tráfego dos sites no painel do editor (01/09/2026)

Item **Tráfego** no menu do editor: ranking de cliques dos domínios liberados
para ele, com variação contra os 28 dias anteriores, impressões e posição média.

**A fonte é o app de indexação, não uma coleta nova.** A tela lê
`https://indexation.qmix.com.br/gsc.json`, que o `gsc-fetcher.js` publica na
opengravity. **Não duplicamos o coletor nem as credenciais do Google:** existe um
lugar só que fala com a API do Search Console.

Consequência prática, que era a dúvida do Anderson: **quando ele clica em
atualizar no app de indexação, este painel reflete sozinho.** O botão "Atualizar"
da tela apenas força a releitura do arquivo, ignorando o cache.

| Peça | Onde |
|---|---|
| Leitor e cache | `/opt/qmix/lib/gsc.php` |
| Tela | `editor.../trafego.php` |
| Cache (30 min) | `/opt/qmix/cache/gsc.json` |

**Normalização de `www`:** o painel guarda `www.professortic.com` e o Search
Console tem `professortic.com`. Sem tratar isso, 7 dos 109 domínios apareceriam
zerados. Hoje só `pneusemgoiania.com.br` fica sem dados, por não ter propriedade
no GSC.

**Se a busca falhar, a tela serve o cache antigo com aviso**, em vez de mostrar
tela vazia: número desatualizado e identificado é melhor que nada.

**Sem histórico não vira zero.** Domínio sem janela anterior mostra "sem
histórico" em vez de "0", porque zero e "não dá para saber" são coisas
diferentes. É a mesma regra do app de indexação.

### Armadilha corrigida no caminho

Os logs tinham sido movidos para `/home/boot/logs-editor`, que está **fora do
`open_basedir`**: a gravação falhava em silêncio porque usa `@file_put_contents`.
Foram para `editor.../private/logs/`, que está dentro do `open_basedir` e não é
servida pela web. Ao escolher pasta para log ou cache, os caminhos liberados são
o diretório do próprio site, `/tmp` e `/opt`.

**Origem dita na tela (01/09/2026):** `trafego.php` abre com um cartão
identificando **Google Search Console** e explicando a diferença entre clique e
impressão, o título virou "Ranking de tráfego no Google" e o rodapé repete a
fonte. Sem isso o editor confunde com Analytics e acha que o número está errado.

**Cliques no card de cada domínio** em `select-domain.php`, para o editor
escolher onde publicar sabendo qual site tem audiência. Mostra o número, a
palavra "cliques" e a seta de variação quando houver. Lê do mesmo cache de 30
minutos, então não pesa: 109 dos 110 cards trazem o dado. Se o app de indexação
estiver fora do ar, o card apenas não mostra o número, sem quebrar a tela.

**Como o tráfego se atualiza:**

| Caminho | Quando |
|---|---|
| Você atualiza no app de indexação | o painel pega em até **30 minutos**, sozinho |
| Botão "Atualizar" na tela de Tráfego | **na hora** |
| Coleta automática do app | toda **segunda às 8h10** (cron na opengravity) |

O painel nunca dispara a coleta no Google: ele só lê o `gsc.json` publicado. Isso
evita que vários editores abrindo a tela gerem chamadas à API do Search Console.

**Cuidado com `fetched_at`:** o app de indexação grava esse campo em
**milissegundos** (ex: `1788523081806`), não em texto de data. Tratado com
`strtotime()` ele vira `31/12/1969`, o começo da era Unix. A conversão está em
`gscQuando()` no `/opt/qmix/lib/gsc.php`, que aceita milissegundos, segundos e
texto.

**Rede de segurança (04/09/2026):** `cron-trafego-cache.php` roda **todo dia às
5h** e busca o `gsc.json` sem esperar ninguém abrir a tela. Não é o que mantém o
painel atualizado, porque o cache de 30 minutos já faz isso: serve para deixar a
primeira visita da manhã instantânea e, principalmente, **para avisar quando algo
travou**. Ele manda mensagem no Telegram em dois casos:

- não conseguiu ler o `gsc.json` (app de indexação fora do ar)
- a última coleta tem mais de 10 dias (o coletor de lá parou)

Sem isso, uma queda no app de indexação apareceria apenas como número velho na
tela, sem ninguém perceber.

**Diário, e não semanal:** o Anderson atualiza quase todo dia na ferramenta dele.
E o horário não pode ser segunda às 5h, como se cogitou: o coletor da opengravity
roda **segunda às 8h10**, então às 5h o painel buscaria o dado de antes da coleta
da semana.

---

## Fatura em PDF redesenhada (08/09/2026)

`acesso.../faturamento-pdf.php`. O desenho foi aprovado antes em
https://claude.ai/code/artifact/3daaeaa0-dd67-46c3-883f-21a9d1ab3c57
(arquivos de trabalho em `design-fatura/`, re-editáveis).

**O que mudou na aparência:** cabeçalho com marca à esquerda e identidade do
documento à direita, faixa com cliente, emissão, vencimento, modalidade e número
de entregas, serviços agrupados por categoria com contagem e subtotal, total em
destaque, PIX em cartão próprio e **rodapé novo** com QMIX DIGITAL LTDA, CNPJ,
marketing@qmix.com.br, telefone e site.

Paleta: verde da marca fechado para papel (`#0db33f` / `#0d7a34`). O `#00ff66`
do site não serve para impressão, some no papel e não tem contraste sobre branco.

**Dois defeitos corrigidos junto:**

1. **O dinheiro saía errado.** `number_format($v, 2, '.', '.')` usava ponto como
   separador decimal, então R$ 3.600,00 imprimia como **"3.600.00"**. Agora passa
   pela função `moeda()`, com vírgula no decimal.
2. **O logo tinha 5px de margem transparente à esquerda**, o que o desencostava
   do texto abaixo. A cópia usada na fatura
   (`assets/images/logo-qmix-fatura.png`) foi recortada. O
   `logo-qmix.png` original **não foi tocado**, para não mexer nas outras telas.

**A regra de papel foi preservada:** administrador vê valores, subtotais e
totais; `equipe` vê só as entregas. Conferido nos dois papéis.

**Endereço entregue** aparece sem `https://` e sem `www.`, o que encurta muito a
linha: a URL crua ocupava três linhas por item.

Backup: `/home/boot/backups-web/faturamento-pdf.php.bak-antes-redesign-20260908`.

**QR do PIX e botão de baixar (08/09/2026):**

O arquivo antigo `forma-pagamento.png` trazia o título **"QMIX Digital LTDA" em
rosa embutido na imagem**, que brigava com a paleta e não dava para editar sem
refazer o PNG. Decodifiquei o QR: é um **PIX estático, sem valor fixo**, com a
chave `marketing@qmix.com.br`, beneficiário QMIX DIGITAL LTDA, cidade GOIANIA,
txid `4r5LUUdnK0iGUszhdnZZyi`. Serve para qualquer fatura.

Regerei o código a partir desse mesmo conteúdo em `assets/images/pix-qmix.png`,
**sem texto embutido** e na tinta escura do layout (`#10231c`). Conferido: o
código novo decodifica para a string idêntica à do original.

**Não usei o verde da marca nos módulos do QR de propósito.** Contraste baixo
derruba a leitura no aplicativo do banco, e um QR que não escaneia custa o
recebimento. A tinta escolhida fica em torno de 16:1 sobre branco.

O texto ao lado agora é HTML: título, instrução e a linha do beneficiário com o
CNPJ. Para o administrador, o texto lembra que **o valor não vem preenchido** e
mostra qual informar, porque o QR é estático.

**Botão "Baixar PDF"** no topo, com um "Fechar" ao lado. Ele chama
`window.print()`; quem baixa escolhe "Salvar como PDF" no destino. Não há
biblioteca de PDF no servidor, e o navegador já resolve isso com fidelidade
melhor. A barra tem `no-print`, então **não sai no documento**.

## API do editor e MCP do Jean (15/09/2026)

**Para que serve:** um parceiro manda artigo para a fila do sistema Antonio
direto do chat (Claude ou ChatGPT), sem abrir o painel. O artigo entra em
`lc_articles` como `approved` e a cron `lc-article-transfer.php` (a cada
minuto) publica no site, WordPress ou portal-engine, igual ao formulario.
Aparece em `dashboard.php?ver=<id>` e o bot do Telegram avisa
("Artigo recebido pela API").

**Onde esta:**

| peca | caminho |
|---|---|
| API (PHP) | `editor.qmix.com.br/public_html/api/index.php` + `.htaccess` + `openapi.json` |
| chaves | `/opt/qmix/env/api-editor.env` → `API_CHAVES=chave:lc_user_id,...` (Jean = 6) |
| log | `editor.qmix.com.br/private/logs/api-editor.log` |
| MCP | `gnd-motor:/opt/wp-mcp/src/editor/{client,tools}.ts`, `systemctl restart wp-mcp` |
| .env do MCP | `OAUTH_USERS=...,jean:senha` e `EDITOR_API_USERS=jean:chaveDaApi` |

**Rotas** (cabecalho `X-Api-Key`): `GET /api/eu`, `GET /api/dominios`,
`GET /api/categorias?dominio=`, `POST /api/imagens {url|base64,nome}`,
`POST /api/artigos {dominio,titulo,conteudo_html,linha_fina,meta_description,
categoria_id,imagem_url,agendar_para}`, `GET /api/artigos`, `GET /api/artigos/{id}`.
Spec em `https://editor.qmix.com.br/api/openapi.json` (serve para GPT Actions).

**Regras embutidas:** so os dominios ativos do editor em `lc_user_domains`;
categoria IPTV filtrada pelo mesmo `categorias-restritas.php`; travessao (U+2014)
recusado com 422; mesmo titulo no mesmo dominio em 10 min nao duplica;
imagem externa e baixada e convertida em WebP 1200x675 na hora (falha aqui,
nao na cron); agendamento futuro vira `publish_delay=2` + `scheduled_at` em UTC.

**No conector MCP:** quem esta em `EDITOR_API_USERS` ve SO as 6 ferramentas do
editor (`listar_sites`, `listar_categorias`, `subir_imagem`, `enviar_artigo`,
`situacao_artigo`, `meus_artigos`) e nunca o cofre WordPress. Anderson e Katia
continuam vendo as ferramentas WP de sempre.

**Novo parceiro pela API:** gerar chave (`openssl rand -hex 24`), acrescentar
`,chave:ID` em `API_CHAVES`; para o chat, acrescentar `usuario:senha` em
`OAUTH_USERS` e `usuario:chave` em `EDITOR_API_USERS` e reiniciar o `wp-mcp`.

**Cloudflare:** o Super Bot Fight Mode bloqueia chamada servidor-a-servidor em
`editor.qmix.com.br/api/*` ("manage definite bots"). Precisa de regra de skip
igual a "ALLOW conector MCP" (phases `http_request_sbfm`,
`http_request_firewall_managed`, `http_ratelimit`) com expressao
`http.host eq "editor.qmix.com.br" and starts_with(http.request.uri.path, "/api/")`.
Sem ela, a API so responde a chamada feita direto na origem (`--resolve
editor.qmix.com.br:443:31.97.173.40`).

**Teste rapido:** `python %TEMP%/mcp-e2e.py <senhaJean>` (faz DCR + PKCE +
login + tools/list + listar_sites). Para testar sem publicar de verdade, mande
`agendar_para` em 2027 e apague a linha de `lc_articles` depois.

---

## Indexação automática ao publicar (17/09/2026)

Editor com `lc_users.indexacao_auto = 1` tem **toda URL publicada enviada ao
serviço de indexação em modo prioritário (Apex)** assim que a cron grava
`pw_transfer = 2`, sem consumir crédito e sem ver a área de Indexação.
Criado para a **Dayane de Souza (lc_users 10)**, que é pagante por post.

| peça | caminho |
|---|---|
| módulo | `/opt/qmix/lib/indexacao-auto.php` (`indexacaoAutomatica()`) |
| gancho | `acesso.../lc-article-transfer.php` e `lc-article-transfer-scheduled.php`, logo após o `logCronExecution` de sucesso, dentro de try/catch |
| registro | `lc_indexacoes` com `origem = 'auto'` (coluna nova; envio pelo botão fica `manual`) |
| status | `cron-indexacao-status.php` marca `nao_indexado` mas **não devolve crédito** quando `origem = 'auto'` |
| telas | `includes/header.php` esconde a aba Indexação; `dashboard.php` esconde o indicador de créditos e o botão de enviar (mostra um relógio "enviada automaticamente"); `indexacao.php` redireciona para o painel; `indexar.php` recusa |

**Aviso no Telegram:** um só, "Fulana acabou de publicar um conteúdo / Enviado
para indexação automaticamente", com o título, o link e o link `site:URL` do
Google. O módulo grava o artigo em `lc_alert_enviado`, então o
`cron-alert-publicacoes-editores.php` **não** manda o "Nova publicação" de novo.
Se o envio falhar, a mesma mensagem sai com aviso de que precisa de envio manual.

**Ligar para outro editor:** `UPDATE lc_users SET indexacao_auto = 1 WHERE id = ?`.
Não existe tela para isso ainda. Desligar é zerar a coluna: as telas voltam na hora.

**Custo:** 3 créditos do fornecedor por URL (cerca de R$ 0,70). O editor não
paga nada por dentro do sistema; se for para embutir no valor do post, ajustar
`valor_post` em Cobranças dos Editores.

**URL `?p=ID`** (WordPress não devolve permalink): o módulo segue o
redirecionamento com HEAD antes de enviar e só usa a URL final se responder 200.

**Testar sem publicar:** rodar como `boot`
`php -r 'include "includes/dbh.inc.php"; require "/opt/qmix/lib/indexacao-auto.php"; echo indexacaoAutomatica($conn, ID_ART, ID_EDITOR, "URL", "titulo");'`
no diretório do acesso; consome 3 créditos do fornecedor. Apagar a linha de
`lc_indexacoes` depois. Feito em 17/09/2026 com o artigo 90: lote 1191011, saldo
do fornecedor de 4271 para 4268, créditos da Dayane em 0.

Backups dos arquivos alterados: `editor.../private/bak-20260917/` e
`acesso.../private/bak-20260917/`.

---

## Indicadores do painel do editor (28/09/2026)

Saíram **"Aguardando revisão"** e **"Rascunhos"**: desde o fim da revisão prévia
o artigo publica direto e os dois viviam zerados. Entrou **"A pagar · R$ X"**,
que conta os posts com `pw_transfer = 2` e `cobranca_id` nulo vezes o
`valor_post` do editor, a mesma regra do painel Cobranças dos Editores. O número
grande é a quantidade de posts, o valor vai no rótulo. Clicar leva a
`pagamentos.php`, onde ele gera o PIX.

O cartão sai do editor **visualizado**, não do logado: abrindo
`dashboard.php?ver=N` você enxerga quanto aquele editor deve. Só aparece para
`tipo_cobranca = 'pagante'`; para parceiro nem é calculado. Fora do próprio
painel o link não aponta para `pagamentos.php`, senão levaria o administrador
para a cobrança dele mesmo.

Arquivo: `editor.../public_html/dashboard.php`, backup em
`editor.../private/bak-20260928/dashboard.php.bak`.

---

## CPF/CNPJ na tela de Pagamentos (28/09/2026)

O campo de documento existia **só em `indexacao.php`**. Quem completou o
cadastro ali conseguia cobrar (caso do Felipe, que informou o CNPJ ao comprar
créditos em 01/09); quem nunca abriu aquela tela batia num erro ao clicar em
"Gerar pagamento", porque o Asaas exige CPF ou CNPJ e não havia onde informar.

Ficou pior para **Dayane (10) e Diego (11)**: com `indexacao_auto = 1` a área de
Indexação é escondida e redireciona, então eles não tinham **nenhum** caminho
para o campo. Beco sem saída criado pela própria indexação automática.

O bloco "Complete seu cadastro" foi portado de `indexacao.php` para
`pagamentos.php`, com o mesmo `documentoLimpo()` / `documentoValido()` de
`/opt/qmix/lib/documento.php`. Some sozinho depois de salvo. A geração passou a
recusar antes de falar com o Asaas, com mensagem que diz onde preencher, em vez
de devolver o erro cru do banco.

Backup: `editor.../private/bak-20260928/pagamentos.php.bak`.
