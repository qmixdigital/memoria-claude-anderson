---
name: gsc-e-palavras-chave
description: "Como acessar o Search Console de 83 sites da rede por service account, e onde ficam os CSVs de palavras-chave com volume"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T20:13:46.199Z
---

**Search Console por API.** Duas service accounts no Desktop do Anderson:

- `C:\Users\User\Desktop\backlinkguard-google-sa.json` (backlinkguard@backlinkguard.iam.gserviceaccount.com)
  dá acesso a **83 propriedades** do Search Console, quase toda a rede: notebookx, geladeirastop,
  cirurgia*, medicodasmaos, df8, adonline, folhaum, institutoortopedico e por aí.
- `C:\Users\User\Desktop\enjai-493011-5bc78ff8f355.json` (enjai-ga4-reader@enjai-493011) é do GA4.

As bibliotecas `google-auth` e `google-api-python-client` já estão instaladas no Python local.
Escopo: `https://www.googleapis.com/auth/webmasters.readonly`. As propriedades são do tipo
`sc-domain:dominio.com.br`. Usar `PYTHONIOENCODING=utf-8` no Windows, senão os acentos saem quebrados.

**Palavras-chave com volume:** `D:\PORTAIS\palavras-chave\` tem cerca de 100 CSVs, um por tema
(`geladeira.csv`, `TV.csv`, `carro_broad-match_br_*.csv`) mais os consolidados `curadoria-*.csv`.
Colunas: `Palavra-chave, Volume, CPC, Paid Difficulty, SEO Difficulty`.

**Why:** o Anderson mandou memorizar em 17/08/2026 para eu usar em jobs futuros de conteúdo.

**How to apply:** para achar pauta nova, cruzar o CSV de palavras-chave com os artigos já
publicados do site (tabela `noticias` no banco do próprio app). **Sempre conferir o finalista
direto no banco antes de escrever**: heurística de similaridade de tokens gera falso positivo, e
em 17/08/2026 eu descartei três pautas por isso ("ferrugem na geladeira branca", "pintura de
geladeira" e "cedilha no notebook" já existiam). O GSC sozinho não revela lacuna, porque só mostra
o que o site já ranqueia. Ver [[operacoes-painel-antonio]].
