# KWs — Keyword Opportunity Finder

Analisa exports de SEO (Semrush, Google Search Console, Ahrefs ou **qualquer
arquivo com URL + palavra-chave**) e encontra oportunidades de artigos: termos
em que o site já ranqueia, mas **sem um artigo dedicado** àquela palavra-chave.

## Como usar

1. Jogue um ou mais arquivos na pasta **`input/`** (`.csv`, `.tsv`, `.xlsx`).
2. Rode:

   ```bash
   python find_opportunities.py
   ```

3. O arquivo é salvo no seu **Desktop** como
   **`{domínio} oportunidades de artigos.xlsx`** (o domínio é extraído
   automaticamente das URLs). Abre direto no Excel e no Google Sheets.

## O que sai

| Coluna | Conteúdo |
|--------|----------|
| **A — Palavra-chave** | a keyword-alvo/semente do artigo (maior volume do grupo) |
| **B — Título SEO** | título pronto, 50–65 caracteres, pt-BR com acentos |
| **C — Ação** | `Fazer artigo novo` **ou** `Melhorar o conteúdo` |
| **D — Link** | nos de *melhorar*, a URL atual (clicável) para atualizar; nos *novos*, fica em branco para o redator colar depois |
| **E — Palavras-chave do artigo** | todas as variações do cluster (semente + secundárias) a cobrir como H2/H3 e FAQ na MESMA página |
| **F — Concorrentes** | URLs dos primeiros colocados no Google (pesquisados na web) para a IA analisar e superar |
| **G — Orientação de escrita** | briefing completo por artigo (intenção, formato, estrutura, FAQ, tabela quando aplicável, linkagem interna, SEO on-page e regras anti-detecção do manual da rede) |

### Como a Ação é decidida (regra anti-canibalização)

A regra mais importante: **nunca sugerir um artigo novo que vá canibalizar uma
página já posicionada**. Se o tema já tem página na primeira página do Google,
criar outro artigo divide o sinal e enfraquece os dois. Nesse caso, o certo é
**melhorar** a página que já posiciona.

- **Fazer artigo novo** → a keyword ranqueia numa URL cujo *slug não fala dela*
  **e** não há nenhuma página posicionada (pos ≤ `POSITIONED_MAX`) para aquele
  tema. Ex.: *tempestades esparsas* aparece só no artigo de *pancadas de chuva*,
  em posição profunda → criar artigo dedicado é seguro.
- **Melhorar o conteúdo** → já existe artigo dedicado mal posicionado (pos 4–40),
  **ou** o tema já está posicionado na página 1 por alguma página (mesmo que de
  outro assunto) — aí criar artigo novo canibalizaria, então melhora-se o que há.
- **Descartado** → já ranqueia em #1–3 com artigo próprio (nada a fazer).

### Sugestões de keywords sem URL (Ubersuggest, Keyword Magic…)

Coloque listas de sugestões de palavras-chave (só keyword + volume +
dificuldade, **sem URL**) na subpasta **`input/sugestoes/`**. Elas viram
candidatas a **artigo novo**, mas só entram na planilha quando:

1. estão dentro dos limites de volume/dificuldade;
2. são do **tema que o site já cobre** (compartilham vocabulário com o site);
3. **não** há página já posicionada do site para aquela intenção (anti-canibal.);
4. não duplicam outra oportunidade nem outra sugestão (clusterização).

Assim, de 113 sugestões de "jogo do bicho", entram só as que o site ainda não
posiciona (ex.: *jogo do bicho gato*, *jogo do bicho tigre*) e ficam de fora as
que já ranqueiam (*jogo do bicho cobra*, *jogo do bicho tabela*).

> **Site de conteúdo geral.** Como o `viajenodetalhe.com.br` é um portal de
> conteúdo geral (utilidade, curiosidades, datas, frases, dúvidas), a planilha
> entrega tanto os *melhorar* quanto os *novos que não canibalizam*, abrangendo
> **todos os temas relacionados, inclusive tangenciais** (ex.: jogo do bicho
> como aposta **e** como série/filme/meme). O único corte real é a
> canibalização. Não estreitar para um único sub-nicho.

## Concorrentes (coluna F) — pesquisa na web

A coluna **Concorrentes** é preenchida a partir de um arquivo opcional
**`competidores.json`** na raiz do projeto, no formato `{ "keyword": ["url1",
"url2", ...] }`. Fluxo para (re)gerar:

1. Rode `python find_opportunities.py` uma vez. Além da planilha, ele exporta
   **`artigos_novos.json`** com os artigos novos (keyword + título).
2. Pesquise no Google os concorrentes orgânicos de cada keyword (excluindo o
   próprio domínio) e salve o resultado em `competidores.json`.
3. Rode de novo: a coluna **Concorrentes** sai preenchida.

Sem `competidores.json`, a planilha é gerada igual, só com a coluna F vazia.

## Como funciona (resumo)

1. **Ingestão genérica** — detecta encoding e delimitador, e auto-mapeia as
   colunas reconhecendo cabeçalhos de Semrush, GSC e Ahrefs.
2. **Filtro de faixa** — mantém só keywords dentro dos limites configuráveis.
3. **Classificação** — mede a sobreposição entre os termos da keyword e o slug
   da URL para decidir *novo* vs *melhorar*.
4. **Agrupamento de variações** — junta variações da mesma keyword (mesmo
   destino + termos parecidos) em **um único artigo**, escolhendo a de maior
   volume como alvo.
5. **Título SEO** — detecta a intenção (o-que-é, como, frases, quantidade,
   medida…) e aplica o molde adequado, limitando a 65 caracteres.

## Configuração

Edite o topo de [`find_opportunities.py`](find_opportunities.py):

| Parâmetro | Padrão | Significado |
|-----------|--------|-------------|
| `MIN_VOLUME` | `200` | volume de busca mínimo |
| `MAX_KD` | `35` | dificuldade máxima (ignora se a coluna faltar) |
| `POS_MIN` / `POS_MAX` | `4` / `40` | faixa de posição considerada |
| `POSITIONED_MAX` | `10` | pos ≤ isto = tema já posicionado (página 1) → não criar artigo novo (anti-canibalização) |
| `SLUG_MATCH` | `0.50` | % de match keyword↔slug para considerar artigo dedicado |
| `MIN_BIGRAM_FREQ` | `2` | sugestão só entra se compartilha um par de palavras recorrente no site (anti-ruído de broad-match) |
| `MAX_SUGGESTIONS` | `150` | teto de sugestões na planilha (top por score; `0` = sem teto) |
| `SUGGEST_BLOCKLIST` | lista | termos de broad-match com intenção errada a descartar (ex.: "sonho de valsa", "praia do sonho") |
| `TITLE_MAX` | `65` | tamanho máximo do título |
| `INCLUDE_CONTEXT` | `False` | `True` adiciona colunas Volume/Posição/KD/URL |

## Requisitos

- Python 3.8+
- `openpyxl` **só** se for ler `.xlsx` (`pip install openpyxl`). CSV/TSV
  funcionam sem nenhuma dependência.
