# Análise de domínios em liberação: outubro de 2026

Memória completa da análise feita entre 09/10 e 18/10/2026. Serve de registro do que foi feito, do que
funcionou e do que não funcionou, e de roteiro para repetir no mês que vem.

- **Objetivo:** achar, entre os domínios que o Registro.br libera, os que têm backlinks de governo, educação,
  associações, cooperativas, portais de notícia fortes (Globo, Terra, UOL) e Wikipedia, principalmente do Brasil.
- **Janela de liberação analisada:** de 14/10/2026 às 15h até 21/10/2026 às 15h.
- **Quem pediu:** Anderson (QMIX). Ele não tem pressa, valoriza economizar cota e quer repetir todo mês.

## 1. O que está em cada pasta

| Pasta ou arquivo | Conteúdo |
|---|---|
| `TODOS-OS-DOMINIOS-2026-10.csv` | **Documento mestre.** Os 157.550 domínios da liberação mais os 152 em competição, com o destino de cada um no funil e todas as métricas disponíveis. Abre no Excel. |
| `05-relatorio/relatorio-dominios-2026-10.html` | Relatório visual para escolher e comprar. Abas: minha lista, lista curta, competição, todos os analisados. Ver seção 7. |
| `01-listas-registrobr/` | As duas listas originais baixadas do Registro.br em 18/10/2026. |
| `02-analise-previa-200-dominios/` | Análise de 200 domínios expirados enviados em 09/10/2026 (Moz, fase 1 e fase 2). |
| `03-resultados/` | Todos os arquivos intermediários e finais da análise de 14 a 21/10, numerados na ordem do funil. |
| `04-scripts/` | Todos os scripts, já parametrizados para rodar de novo. |
| `06-guia/COMO-CONFERIR-DOMINIOS-NA-MOZ.md` | Guia da conta Moz da QMIX (credenciais só na VPS, cota, armadilhas). |

Os arquivos de 2,5 GB do Common Crawl (`cc-ranks.txt.gz` e a pasta `partes`) **não** foram guardados. Dá para
baixar de novo em poucos minutos. Ficou o extrato dos `.br` (`03-resultados/cc-ranks-br.tsv`, 97 MB).

## 2. O funil e os números

| Etapa | Domínios | O que corta |
|---|---|---|
| Lista de liberação | 157.550 | |
| Sufixos de autoridade falsa | 2.820 | app.br, dev.br, tec.br, ia.br e outros que herdam o DA do sufixo |
| Categorias restritas | 1.814 | org.br, adv.br, eng.br, med.br e outras que exigem documento |
| Nome gerado ao acaso | 5.050 | detector `ehSpam` |
| Nome com 25 letras ou mais | 1.700 | quase nunca têm histórico de links |
| **Depois dos filtros de nome** | **146.165** | |
| **Presentes no ranking de domínios do Common Crawl** | **6.616** | quem nunca recebeu link de outro site |
| Medidos na Moz (6.616 mais 1.000 de controle) | 7.615 | |
| Com DA 5 ou mais, spam abaixo de 60, 3 ou mais domínios linkando | 3.888 | entram na coleta de links de origem |
| **Lista curta** (2 ou mais links gov ou edu do Brasil, spam até 30, pouco diretório) | **236** | |

Nota: reexecutar o filtro de nome hoje dá 146.166, não 146.165. O primeiro cálculo descartava um domínio de
formato inválido.

### Resultado da análise dos 3.888

- 752 têm ao menos um link de governo ou educação do Brasil.
- 518 têm link de associação ou cooperativa.
- 1.012 têm link de portal de notícia forte.
- 414 têm link da Wikipedia (sempre nofollow).
- 2.151 não têm nada de interessante e ficam no CSV só como registro.

### Validação do filtro do Common Crawl

Foi o ponto mais importante da análise. Para saber se cortar de 146 mil para 6,6 mil perdia domínios bons, a
Moz mediu 1.000 domínios aleatórios que ficaram fora do ranking.

| Medida | Dentro do ranking | Controle fora do ranking |
|---|---|---|
| Domínios com DA 20 ou mais | 1.214 | 0 |
| Domínios com DA entre 10 e 19 | 1.327 | 11 |
| Domínios com DA 5 ou mais e link gov ou edu do Brasil | 752 | 0 em 42 |

Conclusão: o filtro é seguro para o objetivo. Em um teste anterior com os 200 domínios da lista de 09/10, 5 de 26
com link gov/edu ficariam de fora, mas aquela lista já era uma seleção feita à mão, então a perda real é menor.

## 3. Melhores domínios da lista curta

Ordenados pela nota de compra (seção 7). "Passam autoridade" conta as fontes de governo e educação do Brasil que não
são nofollow e cujo link não sumiu. "Sinal" vem do Wayback: ativo até 2025 ou 2026 significa que o site existia há
pouco e o dono pode renovar.

| Domínio | Nota | DA | Gov BR | Edu BR | Passam autoridade | Sinal |
|---|---|---|---|---|---|---|
| educacaoonline.pro.br | 8,0 | 43 | 2 | 6 | 7 | histórico longo |
| bienalbrasildolivro.com.br | 7,9 | 46 | 2 | 2 | 4 | histórico longo |
| rafrom.com.br | 7,8 | 36 | 0 | 11 | 11 | ativo até 2025/26 |
| mulheresnaciencia.com.br | 7,6 | 33 | 0 | 7 | 7 | histórico longo |
| redesindical.com.br | 7,5 | 34 | 2 | 6 | 7 | histórico longo |
| abeneventos.com.br | 7,4 | 43 | 1 | 3 | 4 | histórico longo, 8 páginas indexadas |
| fbjc.com.br | 7,3 | 39 | 1 | 9 | 9 | ativo até 2025/26 |
| fenaju.com.br | 7,3 | 27 | 7 | 1 | 7 | histórico longo |
| isnportal.com.br | 7,3 | 28 | 0 | 6 | 6 | histórico longo |
| gamehunikuin.com.br | 7,3 | 37 | 0 | 5 | 5 | histórico longo |

A lista completa com 236 domínios está em `03-resultados/LISTA-CURTA-com-historico.csv` e no relatório.

## 4. Domínios em competição

A lista `lista-processo-competitivo.txt` tinha **152 domínios**, todos presentes também na lista de liberação.
Quatro foram barrados pelos filtros de nome (sufixos ia.br e app.br) e só 39 estavam no ranking do Common
Crawl. Como a lista é pequena e de alta autoridade, os 152 foram analisados por inteiro, sem usar o ranking
como corte.

- 23 têm DA 30 ou mais e 48 têm DA 10 ou mais.
- 15 têm ao menos um link de governo ou educação.
- Só 2 têm páginas indexadas no Google.
- **DA falso:** data.app.br (DA 80), ajuda.ia.br, rafael.ia.br e solar.ia.br (DA 49) herdam a autoridade do
  sufixo. No relatório aparecem marcados com "DA FALSO".

| Domínio em competição | DA | Gov BR | Edu BR | Notícias |
|---|---|---|---|---|
| saudebrasilportal.com.br | 37 | 4 | 3 | 4 |
| saudeweb.com.br | 41 | 1 | 4 | 1 |
| cinemarias.com.br | 38 | 2 | 1 | 5 |
| rea.net.br | 43 | 1 | 1 | 5 |
| btmais.com.br | 27 | 1 | 3 | 1 |
| resellerweb.com.br | 32 | 0 | 3 | 1 |
| webbusca.com.br | 32 | 1 | 1 | 0 |
| revistaetcetera.com.br | 36 | 0 | 2 | 1 |

Competição é disputa por lance, não por ordem de chegada. A decisão de quanto pagar por cada um é do Anderson.
No relatório, o filtro "Competição" separa esses domínios e a etiqueta roxa os marca em todas as abas.

## 5. Custos desta rodada

| Serviço | Gasto | Saldo ou limite |
|---|---|---|
| Moz (linhas) | cerca de 93.300 | 120.000 por mês, reset em 31/10. Overage ligado a US$ 20 por 10.000 linhas. |
| Serper.dev (consultas) | cerca de 4.050 | tinha 44.855 de saldo antes |
| SerpApi | 0 | 5.000 por mês, não usada |
| Open PageRank | 0 | ver seção 6 |
| Common Crawl, Wayback, RDAP do Registro.br | 0 | grátis |

Detalhe da Moz: 7.615 linhas na fase de métricas, cerca de 74.200 na coleta de links de origem (3.888 domínios,
até 20 fontes cada), 152 mais 2.029 na competição, 3.911 na análise prévia dos 200 domínios de 09/10, e 4.950 na coleta das páginas exatas de origem para 49 domínios.

## 6. O que não funcionou e por quê (evitar repetir)

1. **Open PageRank.** O serviço foi transferido para a Keywords Everywhere. A chave antiga dá "Invalid API key".
   A chave nova precisa de login com a chave da Keywords Everywhere e o limite grátis é 30.000 domínios por mês,
   o que cobre só 20% da lista. Foi substituído pelo ranking do Common Crawl. O script `opr.mjs` fica guardado.
2. **Wayback em lote.** Acima de cerca de 1 pedido por segundo o archive.org bloqueia por algum tempo (HTTP 429).
   Mesmo no ritmo seguro ele pede pausas. Serve para algumas centenas de domínios, não para a lista inteira.
3. **Download do Common Crawl com `curl -C -`.** O servidor encerra a conexão antes e o curl não acusa erro,
   gerando arquivo cortado ou corrompido. Funciona baixar em partes de 100 MB com cabeçalho Range e conferir o
   tamanho de cada parte. O script `baixar-commoncrawl.sh` já faz isso.
4. **Estimativa de custo da coleta de links.** Eu disse que custaria "algumas centenas" de linhas e custou
   74 mil. Cada domínio de origem devolvido gasta 1 linha, até 20 por domínio. Sempre calcular e avisar antes.
5. **Chave exposta.** Ao consultar o saldo da SerpApi, a chave dela apareceu na saída do terminal por uma falha
   no mascaramento. Se quiser, gere uma nova no painel da SerpApi e atualize o `.env` da VPS.
6. **Ranking inicial enganoso.** Fontes com DA 60 ou mais que apontam para dezenas de domínios da mesma lista são
   diretórios de spam (99sitedirectory, seohelperdirectory, kingranks, articlement e outros). O ranking final
   desconta toda origem que aponta para 15 ou mais domínios da lista, além de diretórios, encurtadores e hospedagens.
7. **Nota saturada na primeira versão.** Com a curva `6 * (1 - e^(-pontos/6))`, 147 dos 236 da lista curta tiravam 6
   ou mais. Com `pontos/12` a nota se espalha de 1 a 8 e diferencia melhor. Está em `classificar.mjs`.
8. **Link de governo que já sumiu.** A lista de domínios que linkam (`linking_root_domains`) inclui links que não existem
   mais. Nas páginas coletadas, 195 de 862 links tinham data de desaparecimento e 21 dos 49 domínios tinham pelo menos
   uma fonte de governo ou educação sumida. Só a coleta das páginas de origem (`paginas-origem.mjs`) mostra isso.
9. **Fonte não encontrada não é fonte sumida.** A coleta lê no máximo 150 links por domínio, em ordem de DA da
   origem. Quando uma origem aparece com muitas páginas (ex.: poupatempo.sp.gov.br), outras fontes ficam de fora e
   aparecem sem marca de "ativo" ou "sumiu". Elas continuam contando na nota.

## 7. O relatório e como usar no dia da compra

Arquivo único (`05-relatorio/relatorio-dominios-AAAA-MM.html`), funciona sem internet, exceto os botões que consultam
sites. Tema claro ou escuro conforme o sistema.

- **Nota de compra (0 a 10)** em todas as abas, ordenação padrão. Clicar na linha mostra como a nota foi montada.
- **Minha lista de compra.** A estrela ★ põe o domínio na aba "Minha lista". No detalhe da linha ficam prioridade
  (alta, média, baixa), lance máximo em reais e anotação. Tudo salvo no navegador (localStorage, chave `compra_v1`).
- **Exportar minha lista para Excel**: CSV com nota, prioridade, lance, anotação, métricas, fontes de governo e
  educação com a marca de cada uma e as páginas que linkam.
- **Salvar backup e Restaurar backup**: arquivo JSON com a lista de compra e as checagens do Registro.br. Serve para
  levar a lista para outro computador ou para o relatório do mês seguinte. Domínios que não existem no relatório novo
  ficam guardados no backup.
- **Passam autoridade**: coluna e filtro. Conta fontes de governo e educação do Brasil sem nofollow e sem link sumido.
  Quando todas as fontes de gov ou edu de um domínio são nofollow, o número aparece em amarelo.
- **Fontes de link** no detalhe, por categoria, com DA e as marcas "passa autoridade", "nofollow", "link ativo" e
  "link sumiu".
- **Páginas que linkam**: endereço exato da página de origem, âncora, data em que a Moz viu o link pela última vez e
  data em que ele sumiu. Coletado este mês para 49 domínios: os 40 de maior nota da lista curta e os da competição com
  gov ou edu. Para outros, exportar a minha lista e rodar a coleta (seção 8, passo 11).
- **Registro.br**: o Anderson confere manualmente pelo link "Registro.br" no detalhe. Não automatizar. Os botões
  "Checar no Registro.br" e "Checar visíveis" continuam lá, mas são opcionais.

### Fórmula da nota (em `04-scripts/classificar.mjs`)

| Componente | Pontos |
|---|---|
| Fonte de governo do Brasil | 3 se passa autoridade, 1 se nofollow |
| Fonte de educação do Brasil (inclui ufXX.br, embrapa.br, fapesp.br) | 2,5 ou 0,8 |
| Associação (org.br) ou cooperativa (coop.br) | 1 ou 0,3 |
| Portal de notícia forte (lista em `classificar.mjs`) | 1,2 ou 0,4 |
| Wikipedia | 0,6 |
| Governo do exterior / educação do exterior | 0,6 ou 0,2 / 0,4 ou 0,1 |
| Soma das fontes vira "Links de valor" | `6 * (1 - e^(-soma/12))`, no máximo 6 |
| DA | até 2 (DA dividido por 20). Sufixo de DA falso vale 0 |
| Wayback | histórico longo +1, curto +0,3, sem histórico -1 |
| Páginas indexadas no Google | +0,5 |
| Spam | acima de 30: -2. 60 ou mais: -4 |
| 10 ou mais diretórios entre as 20 fontes principais | -1 |
| Fonte cujo link sumiu (quando as páginas foram coletadas) | não conta |

## 8. Como repetir no mês que vem

Pré-requisitos: acesso SSH `hostinger-vps-srv1166087` (com o sandbox de rede desligado no Claude Code), Node 22 na
máquina, a chave Serper em `C:\Users\User\Documents\APIs\serper.dev.txt`. Os tokens da Moz ficam só no `.env` da VPS.
Peça autorização ao Anderson antes de gastar mais de poucos milhares de linhas da Moz.

Crie a pasta do mês (ex.: `2026-11`) copiando `04-scripts` e a estrutura de subpastas. Rode de dentro dela:

```bash
M="D:/SISTEMAS/DOMINIOS ANALISE/2026-11"; mkdir -p "$M"/{01-listas-registrobr,03-resultados,04-scripts,05-relatorio}
cp "D:/SISTEMAS/DOMINIOS ANALISE/2026-10/04-scripts/"* "$M/04-scripts/"

# 1. Baixar as duas listas (guardar em 01-listas-registrobr com a data do processo)
curl -s -A "Mozilla/5.0" -o "$M/01-listas-registrobr/lista-processo-liberacao-AAAA-MM-DD.txt"  https://registro.br/dominio/lista-processo-liberacao.txt
curl -s -A "Mozilla/5.0" -o "$M/01-listas-registrobr/lista-processo-competitivo-AAAA-MM-DD.txt" https://registro.br/dominio/lista-processo-competitivo.txt

# 2. Filtro de nome e sufixo
node "$M/04-scripts/funil-filtros.mjs" "$M/01-listas-registrobr/lista-processo-liberacao-AAAA-MM-DD.txt" "$M/03-resultados/01-apos-filtros.txt"

# 3. Ranking de domínios do Common Crawl (release mais recente em https://commoncrawl.org/web-graphs)
bash "$M/04-scripts/baixar-commoncrawl.sh" cc-main-AAAA-xxx-yyy-zzz "$M/03-resultados"
node "$M/04-scripts/cruzar-cc.mjs" "$M/03-resultados"            # gera 02-no-commoncrawl.txt/.tsv
```

Depois, na ordem:

4. **Moz, métricas (fase 1).** `node preparar-moz.mjs entrada 03-resultados` gera `05-moz-entrada.txt` (os do ranking
   mais 1.000 de controle, com semente fixa). Copiar essa lista e `analisar-lista-moz.mjs` para `/tmp` na VPS e rodar
   com `--so-metricas` (seção 8 do guia em `06-guia`). Baixar o resultado como `03-resultados/moz-lote.json`.
5. **Escolher o corte e calcular o custo.** `node preparar-moz.mjs fase2 03-resultados 5 59 3` gera
   `06-moz-fase1.tsv` e `07-fase2-entrada.txt` e imprime o custo máximo. Este mês: DA 5 ou mais, spam até 59, 3 ou mais
   domínios linkando, custo estimado de 71.482 linhas (gastou 74.215 no total). Avisar o Anderson, depois rodar a fase 2
   na VPS sem `--so-metricas`, em segundo plano, com `--min-da 5 --max-ss 59 --limite 20`.
6. **Ranking final.** `node ranquear-fase2.mjs moz-lote.json 06-moz-fase1.tsv ranking-final-gov-edu-AAAA-MM-DD.csv`
   (o nome precisa começar com `ranking-final-gov-edu`). 
7. **Lista curta.** `node montar-lista-curta.mjs 03-resultados`, depois `wayback.mjs` sobre `08-lista-curta.txt`
   com 1 pedido por segundo, e `montar-lista-curta.mjs` de novo para juntar o histórico.
8. **Indexação.** `SERPER_KEY=... node indexacao-serper.mjs entrada.txt 09-indexacao.jsonl 5`. Cerca de 4 consultas
   por segundo.
9. **Competição.** Salvar a lista em `10-competicao.txt`, rodar Moz fase 1 e 2 sem corte de DA (`--min-da 0 --max-ss 100`),
   indexação e Wayback. Gerar `ranking-competicao.csv` com `ranquear-fase2.mjs`.
10. **Relatório.** `node gerar-relatorio-html.mjs "$M" AAAA-MM "DD/MM/AAAA" "DD/MM a DD/MM/AAAA às 15h"`
    (data de geração e período de liberação). Ele também grava `03-resultados/nota-compra.tsv`.
    `moz-comp.json` e `10-competicao.txt` precisam existir.
11. **Páginas exatas de origem** (opcional, custa cota). `node alvos-paginas-origem.mjs 03-resultados auto 40` escolhe os
    40 de maior nota da lista curta mais os da competição com gov ou edu. Ou passe um arquivo com os domínios, por exemplo
    a "minha lista" exportada: `node alvos-paginas-origem.mjs 03-resultados minha-lista.csv`. Ele imprime o custo
    (até 150 linhas por domínio, típico 100). Copiar `paginas-origem.mjs` e `03-resultados/alvos.json` para `/tmp` na
    VPS e rodar `node /tmp/paginas-origem.mjs --alvos /tmp/alvos.json --saida /tmp/12-paginas-origem.jsonl --reserva 15000`.
    Baixar `12-paginas-origem.jsonl` para `03-resultados` e gerar o relatório de novo. Este mês: 49 domínios, 4.950 linhas.
12. **Documento mestre.** `node montar-documento-mestre.mjs "$M" AAAA-MM AAAA-MM-DD` (depois do relatório, porque usa
    `nota-compra.tsv`).
13. **Lista de compra do mês anterior.** No relatório novo, "Restaurar backup" com o JSON salvo no mês anterior.

## 9. Referência rápida das APIs e limites

- **Moz Data API v3** (`api.moz.com/jsonrpc`, métricas de 50 em 50) e **Links API v2** (`lsapi.seomoz.com/v2`,
  `linking_root_domains` e `links`). Cada domínio medido, fonte ou link devolvido gasta 1 linha. O método `links`
  devolve a página de origem, a âncora, `nofollow`, `date_last_seen` e `date_disappeared`, 50 por página com `next_token`.
- **Registro.br RDAP** (`rdap.registro.br/domain/<dominio>`): responde 404 se o domínio está livre, 200 se existe,
  e `status: pending create` quando há pedido de registro pendente. Aceita consulta direta do navegador (CORS aberto).
  Não informa titular nem vencimento. Os botões do relatório usam esse endereço. O atalho de busca é
  `https://registro.br/busca-dominio/?fqdn=<dominio>`.
- **Serper.dev** (`google.serper.dev/search`, cabeçalho `X-API-KEY`, corpo `{"q":"site:dominio","gl":"br","hl":"pt-br"}`).
  Não devolve o total de resultados, só até 10 orgânicos, por isso a coluna mostra "10+".
- **Wayback CDX** (`web.archive.org/cdx/search/cdx`), grátis, limite de ritmo.
- **Common Crawl Web Graph**: `data.commoncrawl.org/projects/hyperlinkgraph/<release>/domain/<release>-domain-ranks.txt.gz`.
  Colunas: posição e valor de centralidade harmônica, posição e valor de PageRank, domínio invertido
  (`br.com.uol`), número de hosts.

## 10. Decisões tomadas pelo Anderson nesta análise

- DA 5 ou mais já é suficiente, porque ele teve bons resultados com DA 8.
- Interesse principal: governo, educação, associações, cooperativas, portais fortes (Globo, Terra) e Wikipedia,
  mesmo nofollow.
- Domínio sem backlink de governo ou educação não interessa.
- No relatório, "Sinal" é uma coluna importante e fica ao lado de "Indexação". O botão de checar Registro.br fica
  dentro das opções do domínio, não numa coluna.
- Competição deve aparecer escrito "Competição" no relatório.
- Registro.br: ele confere manualmente clicando no link do domínio. Não precisa automatizar.
- O relatório deve ajudar a comprar: lista de compra com prioridade, lance e anotação, nota única e links que passam autoridade.

## 11. Pendente ao final desta análise

- Decidir antes de 21/10 às 15h quais domínios registrar e quanto pagar pelos que estão em competição.
- Antes de registrar: conferir `site:dominio` no Google, abrir o Wayback e usar o botão de checagem do Registro.br
  para ver se está livre. Os 150 domínios da lista curta marcados "ativo até 2025/26" ainda podem ser renovados.
- Marcar os favoritos com a estrela, definir prioridade e lance, e salvar um backup.
- Para favoritos fora dos 49 que já têm páginas de origem, exportar a lista e rodar o passo 11 da seção 8.
- Depois de 21/10 às 15h, conferir no Registro.br quais ficaram livres.
