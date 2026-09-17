---
name: feedback-registro-backlinks-por-dominio
description: Cada cliente tem UMA planilha .xlsx em D:/PORTAIS/BACKLINKS, nao mais varios .txt
metadata:
  type: feedback
---

Toda campanha de backlink vai para **uma unica planilha por cliente**, em
`D:\PORTAIS\BACKLINKS\<dominio-cliente>.xlsx`. Nao criar `.txt` novo, nem
arquivo separado de URLs por lote.

**Why:** os registros em texto acumulavam comentario e prosa junto do dado, e o
mesmo cliente chegava a ter 6 arquivos (o rblc tinha 1 registro + 5 listas de
URL). Ficava impossivel filtrar, contar ou cruzar.

**How to apply:**

1. Antes de escrever qualquer artigo, **abrir a planilha do cliente**. Ela e a
   fonte de verdade do que ja foi feito: filtrar a coluna `Ancora` para nao
   repetir texto ancora, e a coluna `Portal` para nao repetir portal.
2. Terminada a campanha, **acrescentar as linhas na aba `Backlinks` da planilha
   que ja existe**. Nunca criar arquivo novo, nem `.txt`, nem uma segunda
   planilha, nem lista separada de URLs.
3. **Cliente novo: criar a planilha** `<dominio-cliente>.xlsx` com o mesmo
   layout de abas e colunas.
4. O que for contexto (criterio de portal, indexacao enviada, verificacao) vai
   para a aba `Notas`, nunca misturado com o dado.

Anexar linhas com openpyxl, preservando o que ja existe:

```python
from openpyxl import load_workbook
wb = load_workbook(caminho)          # abre a existente, nao cria outra
ws = wb["Backlinks"]
ws.append([cliente, portal, url, ancora, destino, keyword, titulo])
ws.auto_filter.ref = ws.dimensions   # o filtro precisa cobrir as linhas novas
wb.save(caminho)
```

Aba **Backlinks**, uma linha por guest post:
`Cliente | Portal | URL do guest post | Ancora | Destino no cliente |
Palavra-chave / pauta | Titulo ou tema`

Aba **Notas**: o contexto que antes ficava solto no txt (criterio de escolha de
portal, indexacao enviada, verificacoes, historico).

Convertido em 01/09/2026: 13 clientes, 223 guest posts. Os .txt e .tsv originais
ficaram em `_originais-txt/`, nada foi apagado. Conversores em
`D:\PORTAIS\BACKLINKS\scripts\conv_geral.py` e `gerar_todas.py`.

**Armadilhas da conversao, se precisar refazer:**

- Os txt tinham TRES formatos: bloco `chave: valor`, TSV e lista pura de URL.
- **A URL do registro nem sempre era a que estava no ar.** No rblc, 7 posts
  foram refeitos por duplicar conteudo da rede e o txt guardou a URL antiga; o
  canonical da pagina aponta para a do arquivo de lote, e duas ja davam 404.
  Ao consolidar, conferir HTTP e canonical, nao confiar no texto.
- **O tsjoias tem 18 guest posts proprios e 1.812 links migrados** de campanhas
  antigas (rblc, leilopora, cadernoseletronicos, repontados em 25/08/2026).
  Sao coisas diferentes e ficam em abas separadas.

**Uma aba só para links (01/09/2026).** Nunca dividir os backlinks de um cliente
em duas abas, nem para separar "guest post" de "acervo migrado". Quando o
operador pedir para encerrar um cliente e apagar os links, uma segunda aba vira
link esquecido. Tudo numa aba `Backlinks`, e a diferença de origem vai numa
**coluna** (`Lote`), não numa aba nova. A aba `Notas` continua existindo, porque
guarda contexto e não links.

Quando os links de um cliente migram para outro, o registro migra junto: as
linhas passam para a planilha do cliente novo, o contexto exclusivo das `Notas`
antigas é copiado para lá, e **só então a planilha antiga é apagada**. Antes de
apagar, conferir que nenhuma URL ficou só na planilha velha. Foi assim com o
tsjoias → rblc.

**A planilha é só para cliente do operador.** Guest post que chega de outra plataforma (pedido de marketplace, cliente de terceiro) **não entra em planilha nenhuma**, e não se cria arquivo novo para ele. Caso registrado em 09/09/2026: `pedrohenriquecunha.com.br`, cujo post de DBS foi reescrito nos dois portais, é cliente de outra plataforma. Não perguntar de novo em trabalho desse tipo: reescreveu, conferiu no ar, acabou.

**"Já fizemos backlink para o cliente X?" se responde SÓ pela planilha.** A pasta `D:\PORTAIS\BACKLINKS` é a fonte da verdade: existe `<dominio>.xlsx` = já fizemos, não existe (e o domínio não aparece em nenhuma outra planilha) = nunca fizemos. **Não varrer a rede** (portal-engine, wp-cli, REST) para confirmar: em 10/09/2026 eu conferi a planilha, achei nada, e mesmo assim gastei vários minutos varrendo cinco hospedagens. O operador corrigiu: a planilha já tinha respondido. Varredura de conteúdo só quando a pergunta for outra, tipo "onde está o link" ou "o link ainda existe".
