# Sistema Antônio (QMIX Digital Marketplace)

> Plataforma própria de criação e distribuição de conteúdo da rede QMIX.
> Levantamento feito direto no servidor em **17/08/2026**.

Esta pasta reúne tudo que é preciso para trabalhar no sistema em outro chat:
onde ele mora, como está organizado, como o conteúdo é gerado, e o contrato
exato de envio para cada família de destino (WordPress, portal-engine e Next).

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Este arquivo: acesso, stack, estrutura e visão geral |
| `ENVIO-DE-CONTEUDO.md` | Contrato de envio para cada tipo de destino, payload e respostas |
| `DESTINOS.md` | Inventário dos destinos e onde ficam as chaves |
| `ARMADILHAS.md` | O que já quebrou e como diagnosticar rápido |

---

## 1. Acesso

| Item | Valor |
|---|---|
| Painel | <https://acesso.qmix.com.br/dashboard> (redireciona para `index.php` se não logado) |
| Título da aplicação | QMIX Digital Marketplace |
| Domínio espelho | `acesso2.qmix.com.br` (mesmo IP, mesma zona) |
| Servidor | Hostinger VPS **srv1166087** · IP de origem `31.97.173.40` |
| Acesso SSH | `ssh hostinger-vps-srv1166087` |
| Docroot | `/home/boot/web/acesso.qmix.com.br/public_html` |
| Usuário do sistema | `boot` (painel HestiaCP) |
| Tamanho em disco | **4,3 GB** |
| Stack | PHP **8.3.28**, MySQL, jQuery, CKEditor |
| Cloudflare | zona `qmix.com.br` na **conta23** do `contas.json`, registro `acesso` proxied |

O mesmo servidor hospeda o **portal-engine** (`/opt/portal-engine`, 13 portais em
`/srv/portais`) e alguns blogs de cliente. Ou seja: plataforma e parte dos
destinos convivem na mesma máquina.

⚠️ O arquivo de conexão com o banco é
`public_html/includes/dbh.inc.php`. Ele contém as credenciais e **não foi aberto
neste levantamento**: leia diretamente no servidor quando precisar.

---

## 2. O que o sistema faz

Ele é um pipeline completo de conteúdo, do insumo à publicação:

1. **Captura de notícias.** `cron-fetch-news.php` busca fontes cadastradas
   (tabela `news_sources`, itens em `news_items`), com cache em `logs/news-cache`.
2. **Geração de texto por IA.** `cron-qmix-generate-articles.php` e
   `cron-article.php` produzem o artigo a partir de prompts cadastrados
   (`prompts`, `prompt_domains`).
3. **Geração de imagem.** `cron-img-article.php` e `add-prompt-img.php`
   (`prompts_img`), com crédito de imagem registrado.
4. **Transferência para o destino.** `article-transfer-qmix-news.php` envia o
   artigo pronto para o site de destino via REST, usando a tabela `wp_sites`.
5. **Agendamento e repetição.** `article-transfer-scheduled.php`,
   `article-transfer-retry.php`, `cron-publish-scheduler.php`.

Há ainda um módulo comercial acoplado: pedidos (`orders`, `order_items`),
faturamento (`faturamento_clientes`, `faturamento_faturas`), webhooks de
pagamento (`webhook/asaas.php`) e de mensagem (`webhook/zapi.php`), além de um
editor de redação (`article-redactor.php`, `seo_articles_redactor`) e um
chat de escrita (`chatwriting`).

---

## 3. Estrutura de pastas

```
public_html/
├── api/                 endpoints internos do painel
├── assets/              css, js, imagens do painel
├── ckeditor/            editor de texto
├── config/              configuração da aplicação
├── database/            scripts e dumps
├── googleApiClient/     integração Google
├── includes/            núcleo: conexão, helpers, login
│   ├── dbh.inc.php          conexão MySQL (CREDENCIAIS)
│   ├── api-key-helper.php   cifra e decifra a X-API-KEY dos destinos
│   ├── cripto-dominio.php   criptografia de domínio
│   ├── deepseek-helper.php  integração com IA
│   ├── gemini-helper.php    integração com IA
│   └── cron-logger.php      grava em cron_logs
├── logs/                mysql-errors.txt, transfer-debug.log, news-cache/
├── parsedown/           markdown para HTML
├── uploads/             imagens geradas
├── vendor/              dependências
├── vendor-open-ai/      SDK de IA
└── webhook/             asaas.php, asaas-webhook.php, zapi.php
```

---

## 4. Tabelas principais

Levantadas pela frequência de uso no código:

| Tabela | Papel |
|---|---|
| `wp_sites` | **Destinos.** domínio, `endpoint_url`, `api_key` cifrada, autor padrão, status |
| `wp_categories` | Mapa de categorias por destino |
| `wp_authors` | Autores disponíveis por destino |
| `news_sources` / `news_items` | Fontes de notícia e itens capturados |
| `prompts` / `prompt_domains` / `prompts_img` | Prompts de texto e de imagem, por domínio |
| `categories` | Categorias internas da plataforma |
| `cron_logs` | Execução de cada cron, com status e mensagem |
| `admin_settings` | Configuração geral do painel |
| `user_logs` | Auditoria de ações de usuário |
| `orders` / `order_items` | Pedidos comerciais |
| `faturamento_clientes` / `faturamento_faturas` | Faturamento |
| `lc_articles` / `lc_config` / `lc_users` / `lc_user_domains` | Módulo de link building |
| `seo_articles_redactor` | Artigos do editor de redação |
| `chatwriting` | Histórico do chat de escrita |

Colunas de controle de transferência, na tabela de artigos:
`wp_transfer` (2 = enviado), `wp_tentativa`, `wp_post_id`, `wp_transferred_at`,
`status` (`used` após envio bem-sucedido).

---

## 5. Crons

Todos rodam **a cada minuto**, pelo usuário `boot`, através do wrapper
`/usr/local/bin/qmix-cron-runner`, que evita execução concorrente. Vários são
duplicados com `sleep` e com o argumento `DESC` para processar a fila pelas
duas pontas ao mesmo tempo.

```
* * * * * qmix-cron-runner php cron-fetch-news.php
* * * * * qmix-cron-runner php cron-qmix-generate-articles.php        (+ variante DESC)
* * * * * qmix-cron-runner php cron-article.php                       (+ DESC, + sleeps 15/25/35/45)
* * * * * qmix-cron-runner php cron-img-article.php                   (+ DESC, + sleeps 15/35/36/45)
* * * * * qmix-cron-runner php cron-pedidos-article.php
* * * * * qmix-cron-runner php cron-pedidos-img-article.php
* * * * * sleep 8 && qmix-cron-runner php cron-publish-scheduler.php
```

Para ver a saída, consulte a tabela `cron_logs` e o arquivo
`logs/transfer-debug.log`, que registra artigo, destino, endpoint e chave
mascarada de cada transferência.

---

## 6. Onde continuar

O detalhe do que a plataforma envia, e do que cada destino espera receber,
está em `ENVIO-DE-CONTEUDO.md`. A lista de destinos e onde ficam as chaves está
em `DESTINOS.md`. Antes de mexer em qualquer coisa, leia `ARMADILHAS.md`: quase
todo problema já visto nesse pipeline se repete pelos mesmos motivos.
