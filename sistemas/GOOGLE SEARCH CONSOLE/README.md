# GSC Âncoras — Extrator de texto âncora + URL

Lê um relatório de **Performance** do Google Search Console e gera uma planilha
(CSV pronto para abrir no Google Sheets) com **duas colunas**:

| Coluna A | Coluna B |
|----------|----------|
| Texto âncora | URL |

O texto âncora é gerado **por projeto** (regra definida em `projetos.json`), e os
acentos de cidades são restaurados automaticamente pela base oficial do **IBGE**
(`municipios.json`, 5.571 municípios).

---

## MÉTODO PADRÃO — como TODO projeto de backlink deve ser entregue

> **Princípio central:** os textos âncora são para **backlinks**. O Google penaliza
> tentativas exatas de manipulação (over-optimization / anchor footprint). Portanto o
> objetivo é sempre **âncoras naturais e VARIADAS**, nunca repetição de padrão exato.
> Todo projeto novo segue este método por padrão — não é específico de nenhum cliente.

**Regras que valem para todos os projetos (não negociáveis):**

1. **Base = consultas reais do Console.** O âncora nasce dos termos que as pessoas de
   fato pesquisam (relatório de Consultas), nunca de títulos/temas de artigo inventados.
2. **Naturalização obrigatória** (`naturalizar_ancora: true`). Pergunta vira frase
   declarativa: "quem tem prótese pode agachar" → "agachar com prótese"; "o que causa
   bursite" → "causas de bursite". Nunca entregar consulta crua em forma de pergunta.
3. **Nada de fragmentos** (`min_palavras_ancora: 2`). "amazonas", "grátis", "moto" não
   são âncoras — viram frases: "consulta de placa no Amazonas".
4. **VARIAR o padrão (anti-footprint).** Nunca 20 âncoras com a mesma estrutura. Quando
   usar `phrase_rules`, forneça **5–7 variações** por regra — o tool **rotaciona** os
   templates entre as URLs automaticamente, então cada página sai com uma estrutura
   diferente ("consulta de placa em X", "verificar placa de carro em X", "consultar
   placa do Detran em X"…). Idem para páginas de cidade: use vários `anchor_templates`.
5. **Gramática/acento corretos.** Preposição por estado ("em São Paulo", "na Bahia",
   "no Pará" — ver mapa `ESTADOS`), acentos restaurados, siglas em caixa (IPVA, CRLV).
6. **Múltiplas âncoras por página** (`multiplas_ancoras: true`) para dar um banco rico,
   espalhadas entre as URLs (round-robin) — variedade de destino também importa.
7. **Só conteúdo vivo.** Artigos deletados e páginas fora via `manter_wp_posts`
   (REST do WP), host, sitemap ou `excluir_slugs`.
8. **Nunca repetir o que o cliente já usou.** Passar o CSV existente em
   `--excluir-ancoras`; o tool exclui por texto exato **e por conjunto de palavras**
   (mata quase-duplicatas tipo "vender meu carro" × "vender um carro").

**Receita de config para um projeto novo (copiar e adaptar):**

```json
"exemplo.com.br": {
  "url_regex": "^blog/[^/]+$",
  "anchor_source": "search_query",
  "multiplas_ancoras": true,
  "naturalizar_ancora": true,
  "min_palavras_ancora": 2,
  "casing": "sentence",
  "query_min_score": 0.34,
  "manter_wp_posts": "https://exemplo.com.br/wp-json/wp/v2/posts",
  "phrase_rules": [
    ["^regex-da-pagina-de-servico$", ["variação natural 1", "variação natural 2", "variação natural 3", "variação natural 4", "variação natural 5"]]
  ]
}
```

Rodar com `--excluir-ancoras <csv-do-cliente>` e `--max N` quando o cliente pedir um
número. Conferir sempre a distribuição de padrões antes de entregar (nenhum padrão de
2 palavras deve dominar a lista).

---

## Uso

```bash
# direto do ZIP exportado pelo Search Console
python gsc_anchors.py "C:\Users\User\Desktop\geladeirastop.com-Performance-on-Search-2026-06-30.zip"

# saída em arquivo específico
python gsc_anchors.py relatorio.zip -o ancoras.csv

# também aceita uma pasta com CSVs ou um único CSV (Páginas)
python gsc_anchors.py "Páginas.csv" --projeto geladeirastop.com
```

Saída padrão: `ancoras_<dominio>.csv` (UTF-8 com BOM, acentos corretos no Sheets/Excel).
URLs fora do padrão do projeto e duplicadas (ex.: `?page=2`) são ignoradas/limpas.

## Adicionar um novo projeto

Edite `projetos.json`. Cada chave é o domínio (sem `www.`):

```json
{
  "geladeirastop.com": {
    "url_regex": "^conserto-geladeira-(?P<cidade>.+)-(?P<uf>[a-z]{2})$",
    "anchor_template": "conserto de geladeira em {cidade}",
    "restaurar_acentos_cidade": true
  }
}
```

- **`url_regex`** — casado contra o *slug* da URL (caminho sem domínio, query e barras).
  Use grupos nomeados `(?P<nome>...)`. Os grupos `cidade` e `uf` têm tratamento especial.
- **`anchor_template`** — texto âncora; `{cidade}`, `{uf}` e qualquer outro grupo são
  substituídos. `{uf}` sai em maiúsculo. Mantenha o template **começando em minúsculo**
  (regra de âncora: maiúscula só em nome próprio).
- **`anchor_templates`** (alternativa a `anchor_template`) — lista de variações do texto
  âncora. O script **rotaciona** entre elas página a página, distribuindo as variações
  para evitar over-optimization (regra de variação de âncora do CLAUDE.md). Mantenha a
  keyword-raiz reconhecível em todas. Ex.: `["clínica de recuperação em {cidade}",
  "centro de recuperação em {cidade}", ...]`.
- **`restaurar_acentos_cidade`** — se `true`, busca `cidade`+`uf` no IBGE e devolve o
  nome acentuado (ex.: `araxa`+`mg` → `Araxá`). Sem correspondência, faz title-case
  mantendo conectores (de, do, da…) em minúsculo.

### Âncora vinda do título real da página (`anchor_source: page_title`)

Para sites de **blog/conteúdo** (onde o âncora ideal é o próprio título do post, não
uma keyword de cidade), use:

```json
{
  "cirurgiadecolunagoiania.com.br": {
    "url_regex": "^blog/[^/]+$",
    "anchor_source": "page_title",
    "casing": "sentence",
    "titulo_cortar_dois_pontos": true
  }
}
```

- Baixa cada página (concorrente, 16 threads) e extrai o `<title>`, removendo marca
  (`| Dr. Fulano`), subtítulo (` - `), reticências e filler após `:` — mantendo a
  pergunta quando há `?`. Assim a **acentuação vem correta** do próprio site.
- **`casing`** — `"sentence"` (padrão): converte Title Case em frase (tudo minúsculo,
  exceto códigos técnicos como `L5-S1`, `C4 C5` e epônimos/nomes próprios da lista
  `EPONIMOS` no script, ex.: Ferguson, Schmorl). `"lower_first"`: só abaixa a inicial.
  `"none"`: mantém como veio.
- **Cache** — os títulos ficam em `.cache_titulos_<dominio>.json`; re-rodar (ou ajustar
  a limpeza) é instantâneo, sem baixar de novo. Apague o cache para forçar refetch.
- Páginas sem `<title>` acessível caem em fallback (deslugify do slug, sem acento) e são
  contabilizadas no aviso final. Imagens, paginação e páginas de autor/categoria são
  naturalmente excluídas pelo `url_regex`.

### Âncora vinda das consultas reais do Search Console (`anchor_source: search_query`)

O **melhor modo para backlinks**: usa os termos que as pessoas realmente pesquisam
(relatório de **Consultas** do GSC) como texto âncora — naturais por definição.

```json
{
  "cirurgiadecolunagoiania.com.br": {
    "url_regex": "^blog/[^/]+$",
    "anchor_source": "search_query",
    "casing": "sentence",
    "query_min_score": 0.34
  }
}
```

Como funciona:
1. Casa cada página com a consulta real mais parecida (Jaccard dos tokens de conteúdo
   do slug × tokens da consulta), com **atribuição global única** — cada consulta é
   usada uma só vez, evitando o mesmo âncora apontar para URLs diferentes. A consulta
   **precisa conter o termo principal do slug** (1º token de conteúdo), senão é rejeitada
   — assim o âncora não troca o tema do artigo (ex.: um artigo de *acupuntura* nunca
   recebe âncora de *fisioterapia*).
2. Restaura a **acentuação correta** da consulta (que vem minúscula/sem acento) usando
   o `<title>` real da página, palavra a palavra; depois aplica `casing: sentence`
   (códigos técnicos como L5-S1/C5 C6 viram maiúsculo, epônimos preservados).
3. Páginas sem consulta boa o suficiente (< `query_min_score`) caem no `<title>` limpo.

- **`query_min_score`** — Jaccard mínimo p/ aceitar a consulta (padrão `0.34`). Menor =
  casa mais páginas, porém com menos precisão.
- Páginas sem consulta boa caem no **slug deslugificado** (único e descritivo) com
  acentos restaurados do `<title>` — evita truncamento e âncoras genéricos repetidos.
- **Unicidade garantida**: nenhum texto âncora se repete apontando para URLs diferentes
  (crítico p/ backlink). Duplicata é reescrita com o slug próprio da página.
- **`multiplas_ancoras`** (padrão `false`): em vez de 1 âncora por página, entrega
  **TODAS as consultas** que cada página rankeia no Console — um banco rico de textos
  âncora por URL (várias linhas com a mesma URL), ideal para variar backlinks. Cada
  consulta é atribuída à sua melhor página (usada 1x), acentuada, naturalizada e
  deduplicada (variantes com/sem acento colapsam). Páginas sem consulta no relatório
  recebem 1 âncora do próprio tema (slug).
- **Naturalização** (`naturalizar_ancora`, padrão `true`): consultas em forma de
  pergunta viram frases-chave declarativas, mais naturais como texto âncora. Ex.:
  "quem tem prótese no quadril pode agachar" → "agachar com prótese no quadril";
  "quanto custa uma infiltração" → "valor de uma infiltração"; "o que causa bursite" →
  "causas de bursite". Frases que já são declarativas passam intactas.
- Usa o mesmo cache de títulos (`.cache_titulos_<dominio>.json`) do modo `page_title`.

### Separar artigos de páginas (filtro de host, sitemap e denylist)

Quando o relatório é de uma **propriedade de domínio**, ele mistura subdomínios. O tool
**filtra automaticamente pelo host do projeto** (a chave em `projetos.json`). Ex.: se os
artigos ficam em `blog.exemplo.com.br` e as páginas em `exemplo.com.br`, use a chave
`blog.exemplo.com.br` e as páginas do host raiz são descartadas sozinhas.

Para sites num host só, dá para excluir páginas de outras formas:
- **`excluir_sitemap`** — URL de um sitemap cujo conteúdo são só PÁGINAS; tudo que
  estiver nele é removido (o que sobra são os artigos).
- **`excluir_slugs`** — lista de slugs a remover explicitamente (ex.: `["pagina-exemplo"]`).
- **`manter_wp_posts`** — URL da REST API de posts do WordPress
  (`https://site/wp-json/wp/v2/posts`). Mantém só os **artigos publicados vivos**,
  excluindo páginas E artigos deletados de uma vez (ideal quando muitos posts sem
  tráfego foram removidos). Requer a REST API acessível.

### Filtro por cliques (`--min-cliques N`)

Argumento de linha de comando (não fica no `projetos.json`): mantém só URLs com pelo
menos N cliques no relatório. Ex.: `--min-cliques 11` = mais de 10 cliques. Útil para
entregar só os artigos de maior tráfego:

```bash
python gsc_anchors.py relatorio.zip --min-cliques 11 -o ancoras_top.csv
```

### Âncoras da homepage / domínio (`anchor_source: query_list`)

Para **site de página única / backlinks para o domínio**: transforma as consultas
reais do relatório num banco de textos âncora (únicos, acentuados), **todos apontando
para uma só URL**.

```json
{
  "totalcambio.com.br": {
    "anchor_source": "query_list",
    "target_url": "https://totalcambio.com.br/",
    "proper_nouns": ["Goiânia", "Total Câmbio", "Total"],
    "excluir_consultas": ["goiânia", "so cambio goiania"],
    "min_impressoes": 2,
    "max_anchors": 50
  }
}
```

- **Acentuação automática pelo corpus**: a grafia certa de cada palavra é inferida das
  próprias consultas (a variante acentuada e mais frequente vence). Ex.: `cambio` →
  `câmbio`, `oleo` → `óleo`, `goiania` → `goiânia`.
- **`proper_nouns`** — nomes próprios mantidos com inicial maiúscula. Aceita nomes
  **compostos** (ex.: `"Total Câmbio"` capitaliza as duas palavras); o resto fica em
  minúsculo (regra de âncora).
- **`excluir_consultas`** — consultas a descartar (concorrentes, termos genéricos como
  a cidade sozinha). Também exige ≥ `min_tokens_conteudo` (padrão 2) palavras de conteúdo.
- **`target_url`** — URL de destino (padrão: `https://<dominio>/`).
- **`min_impressoes`** / **`max_anchors`** — filtro e limite (padrão 2 e 50). As
  consultas entram por ordem de cliques (relevância) e são deduplicadas.

## Atualizar a base de municípios (raramente necessário)

```bash
curl -s "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome" -o ibge.json
python build_municipios.py ibge.json municipios.json
```

## Arquivos

- `gsc_anchors.py` — script principal.
- `projetos.json` — regras de âncora por projeto.
- `municipios.json` — lookup `uf|slug → Nome Acentuado` (gerado do IBGE).
- `build_municipios.py` — regenera `municipios.json`.
