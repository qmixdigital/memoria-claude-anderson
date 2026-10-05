---
name: padrao-imagens
description: Regras de imagem dos projetos do Anderson: banco de fotos gratis por API primeiro (Pixabay, Pexels, Wikimedia, modulo banco_img.py), geracao por IA na Runware so com ordem expressa (modelo barato por padrao, Nano Banana Pro so com autorizacao), dimensoes, recorte, WebP, alt e nomes SEO. Use sempre que precisar de imagem para artigo, guest post, pagina, capa, hero ou OG, ou quando ele pedir para gerar/criar imagem.
---

## Imagens

- Formato **WebP** obrigatorio
- Nomes descritivos com slug SEO: `rinoplastia-estetica-goiania.webp`
- ALT text descritivo em portugues com acentos
- Hero image: `fetchpriority="high"` + preload
- Demais imagens: `loading="lazy"`
- Usar `<picture>` com srcset para responsividade quando possivel

### Imagens: banco de fotos grátis PRIMEIRO, IA só com ordem expressa

**Ordem do Anderson em 10/09/2026, e vale para todos os projetos:** a imagem de
um artigo, guest post ou pagina vem de **banco de fotos gratis por API**, e
**nao** de geracao por inteligencia artificial. Foto real rende melhor no
Google, nao deixa a marca de "ilustracao sintetica" e nao custa credito.

| fonte | licenca | onde esta a chave |
|---|---|---|
| **Pixabay** | propria, sem credito; a API **proibe hotlink** e exige baixar | `C:/Users/User/Documents/APIs/pixabay.txt` |
| **Pexels** | propria, sem credito | `C:/Users/User/Documents/APIs/pexels.txt` |
| **Wikimedia Commons** | so **CC0 e dominio publico** (CC BY exige credito e sai) | sem chave |

O modulo pronto e `~/.claude/skills/guest-post-rede/scripts/banco_img.py`
(`buscar` e `pegar`): junta as tres fontes, sorteia a ordem por portal, baixa,
recorta em WebP e devolve a ficha. Serve para qualquer projeto, nao so guest post.

**Regras:**

- 🔴 **O termo de busca e em INGLES nas tres fontes.** O resultado e melhor em
  ingles em todas. Portugues fica so no alt, escrito olhando a foto.
- 🔴 **Nada de bloco de credito, legenda de fonte ou `caption` citando a fonte.**
  As tres fontes dispensam credito. Bloco de credito identico em varios portais
  ja entregou a rede inteira numa busca do Google (lote da grafotecnia,
  09/09/2026).
- **Pexels responde `403 error code: 1010`** ao User-Agent do Python: e a
  Cloudflare, nao a chave (chave errada da `401`). Mandar User-Agent de navegador.
- **Pixabay aceita upload gerado por IA** e nao filtra na API; o modulo filtra
  pela tag. **Olhar a foto antes de publicar**, sempre.
- Se as tres fontes nao devolverem nada apto, **trocar o termo, nao a fonte**.
- Geracao por IA (Runware, abaixo) so quando o Anderson pedir naquele caso, ou
  quando ele ja tiver dito que aquele projeto usa imagem gerada.

### Geracao de Imagens com IA (Runware API): SO COM ORDEM EXPRESSA

Quando eu pedir para gerar/criar imagens, usar a API da Runware. A chave esta em
`C:/Users/User/Documents/APIs/runware.txt` (ler com `tr -d '\r\n '`) e ela da
acesso a plataforma inteira, que revende BFL, Google, OpenAI e ByteDance. Nao existe "comprar outra IA": e so
trocar o `model`.

#### 🔴 O padrao e o modelo BARATO. Nano Banana Pro so com autorizacao

**Ordem do Anderson em 01/09/2026, que revoga a anterior:** o Nano Banana Pro
(`google:4@2`, US$ 0,138 por imagem) **nao se usa por iniciativa propria**. O
padrao e o modelo barato; o premium exige ele autorizar, caso a caso.

| situacao | modelo | custo |
|---|---|---|
| **padrao, sem perguntar** | `runware:100@1` (FLUX schnell) | US$ 0,0006 |
| **so com autorizacao dele** | `google:4@2` (Nano Banana Pro) | US$ 0,138 |

Pedir a autorizacao **antes** de gerar, dizendo quantas imagens e quanto custa.
Nao gerar no premium e avisar depois: a conta ja foi feita.

O que continua valendo do que se aprendeu antes, e que agora vira instrucao de
**prompt**, nao de modelo: o barato erra anatomia, de pessoa e de objeto
tecnico. Num teste de remada australiana ele gerou um homem flutuando de
barriga para baixo embaixo da mesa; no video 08 do Radar Volt entregou
cilindros azuis parecendo botijao de gas no lugar de celulas de bateria. Entao
com o modelo barato:

- **evitar cena que dependa de anatomia dificil** (pessoa executando movimento,
  peca tecnica reconhecivel). Preferir objeto simples, lugar, textura, cena
  ampla, foto de ambiente sem gente;
- quando a cena exigir pessoa em movimento ou peca tecnica exata, **e esse o
  caso de pedir autorizacao** para o premium, explicando por que;
- **olhar a imagem antes de publicar**, sempre, em qualquer modelo.

**Duas armadilhas do modelo premium**, as duas silenciosas:

- Ele **nao aceita `steps`**. Mandar o parametro devolve
  `unsupportedArchitectureSteps` em JSON com HTTP 200, e quem so olha o codigo
  de saida acha que funcionou.
- A resposta em **base64 chega truncada** em imagem grande, e o `json.loads`
  estoura com "Unterminated string", o que parece erro de rede e e so tamanho.
  Acima de ~2,5 megapixels, pedir `outputType: "URL"` e baixar depois.

#### Chamada

```bash
curl -s -X POST "https://api.runware.ai/v1"   -H "Content-Type: application/json"   -H "Authorization: Bearer $(tr -d '\r\n ' < /c/Users/User/Documents/APIs/runware.txt)"   -d '[{
    "taskType": "imageInference",
    "taskUUID": "'$(uuidgen || python3 -c "import uuid; print(uuid.uuid4())")'",
    "model": "runware:100@1",
    "positivePrompt": "DESCREVER A IMAGEM AQUI, candid documentary photograph, no text",
    "width": 1264,
    "height": 848,
    "numberResults": 1,
    "outputFormat": "WEBP",
    "includeCost": true
  }]'
```

⚠️ O `model` acima e o **barato**, que e o padrao. Para trocar por
`google:4@2` e preciso autorizacao do Anderson, e ai o `steps` sai da chamada.

**Dimensoes: cada familia aceita uma lista propria, e nao qualquer multiplo de 64.**

- FLUX (`runware:*`, `bfl:*`): multiplos de 64. `1216x640` sai pronto.
- Nano Banana Pro e Seedream: lista fechada. Para 19:10 use **`1264x848`** e
  **recorte depois** para o tamanho final. Mandar 1216x640 devolve
  `unsupportedDimensions`. **Para 16:9 use `2752x1536`** (ou `1376x768` em 1K),
  que e o que passa; 2048x1152 nao esta na lista.
  A propria API lista os aceitos dentro da mensagem de erro, entao na duvida
  mande qualquer coisa uma vez e leia a resposta, em vez de chutar.
- Modelo premium **nao aceita `steps`**: mandar o parametro devolve
  `unsupportedArchitectureSteps`. So os FLUX abertos aceitam.

O recorte de 1264x848 para 1216x640 sai com Pillow, cortando na proporcao e
puxando o enquadramento para cima, que e onde a pessoa costuma estar:

```python
from PIL import Image
im = Image.open(bruto).convert("RGB")
l, a = im.size
nova = round(l * 640 / 1216)
topo = max(0, int((a - nova) * 0.40))
im.crop((0, topo, l, topo + nova)).resize((1216, 640), Image.LANCZOS)   .save(saida, "WEBP", quality=82, method=6)
```

**Regras para geracao de imagens:**
- Sempre gerar em **WebP** (`outputFormat: "WEBP"`)
- Dimensoes finais padrao: **1216x640** (OG/hero), **832x576** (conteudo),
  **448x448** (thumbnails)
- Prompt sempre em **ingles**
- **Descrever a posicao do corpo membro a membro** quando houver alguem
  executando um movimento: onde estao os pes, para onde apontam as palmas,
  onde esta o queixo, se o corpo esta em linha. "inverted row" sozinho nao
  basta; "heels on the floor, body in one straight line, both hands gripping
  the edge" resolve. Escrever **BOTH hands** em maiuscula quando as duas maos
  precisam aparecer, senao aparece so uma.
- "candid documentary photograph" rende melhor que "professional, high
  quality", que puxa para o visual de banco de imagens
- Adicionar "no text" para evitar texto ilegivel
- **Conferir a imagem antes de publicar.** Abrir o arquivo e olhar. Erro de
  anatomia e de execucao passa fácil na pressa, e capa errada num site de
  treino e pior que capa feia.
- Habilidade dificil (front lever, muscle up, planche, bandeira humana) ainda
  erra em qualquer modelo. Nesses casos, foto real de banco de imagens ganha.
- Subir no WP: `wp media import ARQUIVO --post_id=ID --featured_image --title=... --alt=...`
- Salvar com nome SEO-friendly: `slug-descritivo.webp`
