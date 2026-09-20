---
name: aumentar-da-dr
description: Planeja e executa links da rede de portais parceiros da QMIX para subir DA (Moz), DR (Ahrefs) e AS (Semrush) de qualquer site atendido, cliente ou diretorio proprio, sem criar footprint. Use quando o Anderson disser "aumentar DA DR", "subir DA", "subir DR", "subir AS", "autoridade do dominio", pedir onde apontar links da rede para um site, decidir entre insercao em post antigo e guest post novo, montar a fila mensal de links de um site, ou perguntar por que o DR de um site nao sobe.
---

# Aumentar DA e DR

Skill operacional para subir as metricas de autoridade (DA da Moz, DR do Ahrefs, AS do Semrush) de um **site atendido**, que pode ser cliente da QMIX ou diretorio proprio, usando a rede de portais parceiros. A skill e universal: nada aqui e de um site especifico. O que muda de um site para outro fica nos arquivos de registro, nunca no texto da skill.

## Premissas fixas do ambiente

- Cada dominio (atendido e parceiro) roda em uma conta Cloudflare separada, entao nao ha footprint de IP compartilhado.
- A meta desta skill e metrica, nao trafego. Ranking de URL especifica e assunto da skill guest-post-rede.
- A rede de parceiros e finita. Cada dominio parceiro gasto e um dominio referente que nao volta para aquele site. Trate como estoque.
- Os portais ficam em tres hosts: `opengravity`, `clinicas-vps` e `hostinger-vps-srv1166087`, em `/srv/portais/<portal>/data/<slug>.json`. A lista de dominios esta em `/opt/portal-engine/sites.json` (chave `sites`, campos `slug`, `domain`, `baseUrl`).

## Regra de ouro

Um link por dominio referente por site atendido. O segundo link do mesmo dominio nao aumenta DR nem AS, e quase nada no DA. Se sobrar orcamento, abra dominio novo, nunca repita.

Excecao unica: segundo link no mesmo parceiro so quando o objetivo declarado for ranking de uma URL especifica, nunca metrica. Registre no ledger como `motivo=ranking`.

## Onde esta o registro

| Arquivo | O que tem |
|---|---|
| `D:\PORTAIS\BACKLINKS\ledger.csv` | Ledger desta skill: um link EXECUTADO por linha, todos os sites atendidos. `scripts/inserir_link.py` grava sozinho. So entra o que esta no ar; fila planejada nao entra. |
| `D:\PORTAIS\BACKLINKS\<dominio>.xlsx` | Planilha por site com os guest posts (skill guest-post-rede). E a fonte da verdade de "ja fizemos link do portal X para este site"; tambem conta como dominio gasto. |
| `D:\PORTAIS\BACKLINKS\portais-bloqueados.txt` | Portais fora de qualquer fila (em desativacao, desindexados). Um dominio ou slug por linha. Quem descobrir portal morto acrescenta aqui na hora. |
| `D:\PORTAIS\BACKLINKS\metricas.csv` | Snapshot mensal por site: `data,site,dr,da,as,dominios_referentes,obs`. O Anderson informa DR/DA/AS; a skill grava uma linha por mes. Nunca inventar. |
| `D:\PORTAIS\BACKLINKS\<dominio>-FILA-<AAAA-MM>.md` | A fila planejada do mes. So aqui ficam as linhas ainda nao executadas. |

Colunas do ledger: `data,site,destino,ancora,tipo_ancora,formato,host,portal,dominio_portal,url_hospedeira,motivo,dr,da,as,obs,rel`. Valores permitidos: `tipo_ancora` = marca, url, generica, parcial, exata; `formato` = insercao, guest-post; `motivo` = metrica, ranking; `rel` = dofollow, nofollow.

Se o ledger nao tiver nenhuma linha do site, importar as URLs de hospedeiro da planilha `.xlsx` dele antes de propor qualquer coisa (data, destino, ancora, dominio do portal, `formato=guest-post`, `motivo=ranking`, `obs=importado da planilha`). Sem planilha e sem ledger, o site esta no zero e a fila comeca do zero.

## Fluxo de trabalho

### 1. Inventario antes de qualquer coisa

Leia o ledger e a planilha `.xlsx` do site e levante:

- Quais dominios parceiros ja apontam para este site (excluir da fila).
- Quantos dominios referentes unicos o site tem hoje. Todo dominio no ledger conta, inclusive os importados da planilha e os de `motivo=ranking`. E essa contagem que decide a fase e o "30o dominio" do passo 5.
- DR, DA e AS atuais: ultima linha do site em `metricas.csv`. Se nao houver linha do mes, pedir ao Anderson e gravar.

Nunca proponha um parceiro que ja consta no ledger ou na planilha para o mesmo site, nem que esteja em `portais-bloqueados.txt`.

### 2. Segmentacao da rede por site

Cada site atendido recebe um subconjunto diferente de parceiros. O overlap entre dois sites nao passa de 30%, medido sobre o site que tem MENOS dominios referentes (dominios em comum dividido pelo total do menor).

Para nao puxar sempre dos mesmos portais virgens: ao montar a fila, calcular o overlap do site com cada um dos outros (todos estao no mesmo `ledger.csv` e nas planilhas) e preferir portais que nenhum site usou. Se os virgens acabarem, escolher os que so um outro site usou, nunca os ja compartilhados por dois ou mais.

Motivo: o Semrush penaliza a existencia de outro dominio com perfil de backlinks identico. Se todos os sites atendidos receberem a mesma rede, o AS trava em todos ao mesmo tempo.

Nunca linkar sites atendidos entre si. Rede fechada limita o teto de todos e derruba o conjunto junto.

Nunca usar portal que outra sessao esteja publicando naquele momento. `scripts/inventario.py` marca "portal com JSON gravado nos ultimos 90 min" e reprova sozinho; se a fila for executada horas depois do inventario, rodar o inventario de novo antes de inserir.

### 3. Escolha da pagina de destino

Distribuicao por site, por trimestre:

| Destino | Fatia | Quando usar |
|---|---|---|
| Home | 30% | Ancora de marca ou URL nua. Reforca DR do dominio. |
| Categoria ou artigo com impressao no GSC | 50% | Paginas que ja aparecem na busca. Sobe UR e converte link em trafego. |
| Paginas internas variadas | 20% | Quebra o padrao. Paginas de cidade, servico, listagem, institucional. |

Para a metrica pura, a pagina de destino e indiferente, porque DR e DA sao calculados no nivel do dominio. A distribuicao existe para (a) nao gerar padrao artificial de so home e (b) transformar link em trafego, que e o que o comprador de guest post checa.

Selecao da pagina de conteudo: `python scripts/gsc_paginas.py DOMINIO` lista as paginas com posicao entre 8 e 25 e mais de 100 impressoes nos ultimos 28 dias, pelas service accounts da QMIX. Em site novo, onde nenhuma pagina chega a 100 impressoes, o script cai para as de maior impressao na faixa e avisa; repetir o aviso na entrega. Site de cliente sem acesso no GSC: pedir a exportacao ao Anderson.

Arredondamento das fatias para a fila do mes (n de 8 a 12): arredondar cada fatia para o inteiro mais proximo e jogar a sobra ou a falta na linha "categoria ou artigo com impressao". A fatia de destino e por trimestre; a de ancora, abaixo, e por mes. A execucao dos guest posts que entram na fila e da skill guest-post-rede; na fila entram portal, destino, ancora e um eixo de pauta sugerido, e a URL hospedeira fica em aberto ate a publicacao.

### 4. Ancoras

| Tipo | Fatia |
|---|---|
| Marca ou nome do site | 40% |
| URL nua | 20% |
| Generica (veja aqui, neste site, consulte a lista) | 20% |
| Parcial com keyword | 15% |
| Exata | 5% |

Nunca repetir a mesma ancora exata em dois parceiros do mesmo site. Antes de fechar a fila, listar as ancoras ja usadas no ledger e na planilha do site e conferir uma a uma.

Esta tabela vale para a meta de metrica e e diferente da regra de ancora com keyword do CLAUDE.md, que vale para link interno e para guest post de ranking. Quando o pedido misturar as duas metas, dizer qual tabela esta sendo usada em cada link. Site que chegou a esta skill com o perfil todo em ancora parcial (caso comum de quem so fez guest post de ranking) corrige o desvio ao longo das filas seguintes, nunca de uma vez.

### 5. Insercao ou guest post novo

Padrao: insercao em post antigo. Motivo: a pagina ja esta publicada e indexada, o link costuma ser descoberto e computado em 7 a 14 dias, contra semanas de um post novo que precisa ser indexado do zero.

Mas alterne. A partir do 30o dominio de cada site, use 60% insercao e 40% guest post novo, para o perfil nao ficar 100% de um formato so.

Nao trate insercao como formato mais seguro. Para o Google, link feito para manipular PageRank e link spam, esteja em conteudo novo ou antigo. A consequencia hoje e desvalorizacao silenciosa, sem aviso no Search Console. Insercao e mais rapida, nao mais segura.

Guest post novo segue a skill guest-post-rede do comeco ao fim (pauta pelo GSC do portal, val2, auditar.py duas vezes, imagem de banco, links de entrada). Esta skill so decide onde e para onde; nao substitui aquela.

### 6. Vetting da pagina hospedeira (obrigatorio antes de inserir)

`python scripts/inventario.py HOST "regex-do-tema" --excluir-dominios <dominios do ledger e da planilha>` lista os artigos candidatos de um host e ja reprova: dominio usado ou bloqueado, portal com gravacao recente, artigo que consta como hospedeiro em qualquer planilha `.xlsx` (guest post de outro site), link para cliente (inclui qualquer perfil de Instagram, que na rede e tier de cliente), mais de 3 externos e texto curto. So americanas, fonte de noticia, orgao publico, periodico cientifico e rede social do proprio portal contam como neutros. Rodar uma vez por host (`opengravity`, `clinicas-vps`, `hostinger-vps-srv1166087`).

O que o script nao faz e e conferido a mao, artigo por artigo:

- `python scripts/gsc_paginas.py DOMINIO_DO_PORTAL --url URL_DO_ARTIGO`: sem impressao nos ultimos 90 dias, reprovar.
- Ler o artigo: o tema precisa ter ligacao plausivel com o site atendido, e a insercao precisa caber sem reescrever o paragrafo.

A regex de tema sai do nicho do site atendido; montar na hora a partir do que o site oferece (servicos, produtos, cidades, termos do GSC dele). Exemplos: fitness `treino|treinar|muscula|academia|personal|exerc|emagrec|corrida|hiit|alongamento`; obra e reforma `vidro|vidra|box|espelho|marmore|granito|bancada|reforma|obra|arquitet|decora`; saude mental e dependencia `dependencia|alcool|drogas|internacao|reabilita|vicio|abstinencia`; leiloes e imoveis `leilao|arremat|imovel|financiamento|patio|caixa economica`; juridico `advogado|processo|direito|indeniza|trabalhista|inss|aposentadoria`; medico `consulta|cirurgia|tratamento|sintoma|especialista|clinica`.

Aprovada a pagina, a insercao entra em paragrafo que ja fala do assunto, com uma frase de contexto real antes do link. Nunca coloque o link no primeiro nem no ultimo paragrafo, nem dentro do `<aside>` de leituras.

### 7. Cadencia

- 8 a 12 dominios novos por mes por site.
- Distribuir ao longo do mes, nunca tudo no mesmo dia.
- Nunca mais de 3 insercoes no mesmo dia para o mesmo site.

### 8. Execucao e registro

`scripts/inserir_link.py` faz o ciclo inteiro a partir de um plano JSON: baixa o JSON do artigo no host, insere o paragrafo depois do paragrafo indicado, aplica a guarda (lista de links antes + o novo = lista depois, senao aborta), atualiza `modified`, envia, roda `rebuild_site.js` no portal, reinicia o `portal-engine.service`, confere a URL no ar com `?nc=` e grava a linha no `ledger.csv`. Rodar `--help` para o formato do plano; `--site DOMINIO` identifica o site atendido quando o destino nao deixa claro.

Toda insercao entra no ledger na mesma sessao em que foi feita, E TAMBEM na planilha `D:\PORTAIS\BACKLINKS\<dominio>.xlsx` do site (uma linha por insercao, coluna "Palavra-chave / pauta" = "insercao em artigo existente (tipo, origem)"), porque a planilha e o que o Anderson abre para conferir. Ledger ou planilha desatualizados geram link repetido, que e desperdicio de dominio. Guest post publicado pela guest-post-rede tambem ganha linha no ledger (`formato=guest-post`), alem da planilha `.xlsx`.

Modo so planejamento (o Anderson pediu a fila, nao a execucao): nada vai para o ledger. A fila vai para `D:\PORTAIS\BACKLINKS\<dominio>-FILA-<AAAA-MM>.md` com as linhas do ledger prontas e a marca "planejado". Quando cada item for executado, a linha sai da fila e entra no ledger pelo script.

Sem envio ao Apex para insercao: a pagina ja esta indexada. Guest post novo segue a regra da guest-post-rede (perguntar antes de gastar credito).

## Metas realistas

A escala e logaritmica. De 0 a 20 sai com poucos links bons. De 40 para cima fica caro.

| Fase | Dominios referentes | DR esperado | Objetivo |
|---|---|---|---|
| 1 | 25 a 40 | 15 a 25 | Sair do zero |
| 2 | 60 a 90 | 28 a 35 | Ja vende guest post barato (diretorio) ou ja disputa a primeira pagina (cliente) |
| 3 | 120 a 180 | 35 a 45 | Preco cheio |

Acima de DR 45 o custo por ponto nao compensa para este modelo. Pare e invista em trafego.

## Checagem de saude (rodar por mes)

- AS do site abaixo de 10 com muitos links: sinal de que o site nao rankeia. Prioridade vira conteudo, nao link.
- Percentual de dofollow acima de 90% (coluna `rel` do ledger): incluir alguns nofollow e mencoes sem link.
- Dois sites atendidos com mais de 30% dos referentes em comum: parar e redistribuir.
- Queda de 1 ou 2 pontos de DR: recalibracao do indice, ignorar.

## Saida esperada da skill

Ao ser acionada, entregue:

1. Fila do mes: lista de parceiros escolhidos, pagina de destino, ancora e formato (insercao ou guest post).
2. Linhas prontas para colar no `ledger.csv` (ou ja gravadas, se a execucao foi autorizada).
3. Alertas de saude, se algum limiar acima foi cruzado.

Resposta curta e em tabela. Sem travessao em nenhum texto gerado.

## O que esta skill NAO faz

- Nao roda sozinha "para testar a instalacao" em nenhum site. So roda quando o Anderson pedir metrica de um site nomeado.
- Nao grava ledger, fila ou metricas de um site sem pedido. Registro de guest post de ranking continua na planilha `.xlsx` da guest-post-rede; o ledger recebe a linha so quando esta skill for acionada para aquele site.
- Nao escreve artigo. Guest post e da guest-post-rede.

## Erros que ja custaram dominio

| Erro | Consequencia |
|---|---|
| Propor parceiro sem abrir a planilha `.xlsx` do site | Segundo link no mesmo dominio, zero ganho de DR |
| Inserir em artigo com link de Instagram "neutro" | Era tier de outro cliente; diluiu o link pago |
| Editar o JSON sem `rebuild_site.js` e sem reiniciar o servico | Pagina no ar continua a antiga (`cf-cache-status: DYNAMIC`) |
| Inserir depois do `<aside>` | Link cai no bloco de leituras, fora do corpo |
| Conferir no ar sem `?nc=` | HIT da borda mostra a versao velha e a insercao parece perdida |
| Inserir em portal em desativacao por nao olhar a blocklist | Os links morrem junto com o portal |
| Todas as ancoras do mesmo tipo | Perfil 100% parcial com keyword; a tabela do passo 4 existe para isso nao acontecer |
| Rodar a skill num site sem pedido, "para testar" | Fila e ledger de um site que ninguem pediu, e insercoes reais gastando dominio |
