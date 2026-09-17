---
name: skill-materias-linkbuilding
description: Skill que produz e publica materias de link building nos sites parceiros via MCP
metadata: 
  node_type: memory
  type: project
  originSessionId: a20d65b9-1e1c-49dd-9ef0-a951a3488527
  modified: 2026-09-04T15:36:00.547Z
---

Skill do projeto em `.claude/skills/materias-jornalisticas-linkbuilding/`, criada em
04/09/2026 a partir dos arquivos de regras do Anderson (`skill.md`,
`validacao-e-factual.md`, `angulos-por-segmento.md`, `clientes-recorrentes.md`,
`portais-mapeados.md`, que ficam na raiz do projeto e sao a fonte da verdade).

Fluxo: briefing (portal + ancora + URL cliente + segmento) > historico >
pesquisa > angulo inedito > redacao HTML > validacao por script > verificacao
factual > imagem > aprovacao do Anderson > publicacao pelo conector MCP >
atualizar os registros.

**Decisao importante:** NAO foi fundida com a skill `guest-post-rede`. Aquela e da
rede PROPRIA (111 portais, portal-engine, `auditar.py`, destino escolhido pelo
Search Console). Esta e de sites de PARCEIRO, publicados pelo conector MCP. Fundir
quebraria as duas. Um aviso cruzado foi posto no topo da `guest-post-rede`.

**Scripts que eu escrevi** (os originais apontavam para `/mnt/...`, caminho que so
existe no sandbox do claude.ai e nao funciona aqui):
- `scripts/validador_materia.py` — Camada A (bloqueios: titulo <=70, sem exclamacao,
  zero travessao, termos proibidos, >=1200 palavras, contagem de links, link fora do
  primeiro/ultimo paragrafo, minimo 3 paragrafos entre links, sem bullets) e Camada B
  (score de humanizacao 0-100, alvo >=70, 10 metricas; as 4 estruturais sao as do
  `validacao-e-factual.md`). Testado. Faz `sys.stdout.reconfigure(utf-8)` porque o
  console do Windows quebra acento.
- `scripts/gerar_imagem.py` — Runware. **Padrao e o modelo BARATO `runware:100@1`**
  (US$ 0,0006). O premium `google:4@2` so com autorizacao explicita do Anderson.
  Devolve URL publica, que entra direto no `subir_imagem` do MCP (a ferramenta so
  aceita URL, nao arquivo local). FLUX usa multiplo de 64: 1344x768.

Diferenca da versao do claude.ai: aqui a entrega e a **publicacao em HTML**, nao o
DOCX, e eu CONSIGO escrever em `clientes-recorrentes.md` e `portais-mapeados.md`
(no claude.ai nao dava), entao atualizar os registros virou passo 10 do fluxo.

Relacionado: [[wp-mcp-conector]]
