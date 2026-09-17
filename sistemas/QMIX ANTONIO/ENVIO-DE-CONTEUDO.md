# Envio de conteúdo: contrato por tipo de destino

O Antônio fala com **três famílias de receptor**. O payload que ele monta é um
só, e cada família ignora os campos que não usa. Entender essa sobreposição
evita a maior parte dos erros.

---

## 1. O que a plataforma envia

Montado em `article-transfer-qmix-news.php` (336 linhas), enviado por `curl`
com `POST`, `Content-Type: application/json`, `X-API-KEY: <chave decifrada>`,
`User-Agent` de navegador, timeout de 60s, `FOLLOWLOCATION` ligado com no
máximo 3 redirecionamentos.

```json
{
  "title":          "Título do artigo",
  "content":        "<p>HTML do corpo</p>",
  "image_base64":   "data:image/webp;base64,...",
  "featured_image": "https://origem/imagem.webp",
  "imagem":         "nome-do-arquivo.webp",
  "image_alt":      "Título do artigo",
  "image_caption":  "Crédito da imagem ou título",
  "image_title":    "Título do artigo",
  "author":         "Nome do autor",
  "categories":     [12, 34],
  "tags":           [],
  "status":         "publish"
}
```

Detalhes que importam:

- **`image_base64` e `featured_image` vão juntos de propósito.** Receptores em
  Next baixam a imagem por URL; os de WordPress e portal-engine leem o base64.
  Mandar os dois cobre as duas famílias sem quebrar nenhuma.
- A imagem é convertida para **WebP** antes do envio.
- O `<h1>` duplicado do título é removido do conteúdo antes de enviar, inclusive
  na versão com entidades HTML escapadas.
- Links internos do conteúdo apontando para o domínio de destino são
  normalizados para `https://`.
- O endpoint vem de `getWpEndpointUrl($conn, $destination_link)`, que lê a
  tabela `wp_sites`. A chave é decifrada por `<<REMOVIDO>>`.

### Resposta esperada

```
HTTP 201 + {"success": true, "post_id": 12345}
```

O código aceita **`post_id` OU `id`**, porque destinos em Next respondem
`{"ok":true,"id":...}`. Em sucesso, grava `wp_transfer = 2`, zera
`wp_tentativa`, guarda `wp_post_id` e marca o artigo como `used`.

⚠️ Se o destino Next devolver **UUID** em vez de número, a coluna `wp_post_id`
é `int` e não armazena. O envio funciona, o registro do id não.

---

## 2. Destino WordPress (mu-plugin `qmix-receiver.php`)

É a família majoritária: **111 sites** cadastrados no `antonio_COMPLETO.csv`.

| Item | Valor |
|---|---|
| Rota | `POST https://<domínio>/wp-json/<ns>/v1/artigos` |
| Namespace | único por site, ex.: `qzms-api/v1`, `arfa-api/v1`, `emfc-api/v1` |
| Autenticação | header `X-API-KEY`, comparada com `hash_equals` |
| Arquivo | `wp-content/mu-plugins/qmix-receiver.php` |

Campos aceitos: `title`, `content`, `excerpt`, `image_base64`, `imagem`,
`image_alt`, `image_caption`, `image_title`, `categories`, `tags`, `status`,
`author`, `scheduled_date`. Desde 14/08/2026 as instalações também aceitam
`subtitle` e `meta_description`.

Comportamento:

- `categories` aceita **id numérico ou nome**; nome inexistente é criado.
- Imagem: base64 até 5 MB, tipos `webp/jpeg/png/gif`, vira imagem destacada.
- `status` aceito: `publish`, `draft`, `pending`, `private`, `future`.
  Com `future`, exige `scheduled_date`; data no passado vira `publish`.
- Sem `author` válido, escolhe o primeiro usuário com papel author/admin/editor.

🔴 **O conteúdo passa por `wp_kses_post()`.** Isso remove `<script>` e a
marcação de schema (`itemprop`, `itemscope`, `itemtype`) **em silêncio**: a
resposta continua 201 e o post fica publicado sem dado estruturado. Para
publicar artigo com FAQ marcada, use wp-cli com `--user=<ID de admin>` em vez
do endpoint.

---

## 3. Destino portal-engine (site estático em Node)

| Item | Valor |
|---|---|
| Rota | `POST https://<domínio>/<ns>/artigos` (qualquer caminho terminado em `/artigos`) |
| Autenticação | header `x-api-key`; o receptor identifica o site **pela chave**, não pelo domínio |
| Código | `/opt/portal-engine/src/receiver.js`, porta `127.0.0.1:8791` |
| Configuração | `/opt/portal-engine/sites.json` (domínio, `ns`, `apikey`, `categoryMap`, `indexnowKey`, `cf`) |
| Limite | 8 MB por requisição (por causa do base64) |
| Health | `GET /_health` → `{ok:true, sites:N}` |

Servidores com engine: **clinicas-vps** (34 portais), **srv1166087** (13),
**opengravity** (7).

Campos: `title` e `content` obrigatórios; `subtitle` ou `excerpt` viram o dek;
`meta_description`; `categories` (id do `categoryMap`, nome ou objeto);
`image_base64`; `author`; `status`; `scheduled_date`; `slug`; `dedupBypass`;
`import`.

Comportamento:

- O **slug é gerado a partir do título**, salvo se você mandar `slug` válido.
- Republicar sem `image_base64` **apaga a imagem** do artigo.
- Sem `scheduled_date`, a data vira "agora".
- `import: true` pula IndexNow e purge por artigo (usar em carga em lote).
- Resposta: `201 {success, post_id, id, slug, url, link, status}`, com
  `post_id` determinístico por slug (md5 do `slug do site + / + slug`).

🔴 **Guarda de deduplicação entre portais.** O primeiro portal a receber um slug
vira dono; os demais recebem **201 com `status: skipped`** e nada é publicado.
O registro fica em `/srv/portais/_dedup/owners.json`. Sempre confira o campo
`status` da resposta, não apenas o HTTP 201. Para forçar, use `dedupBypass: true`.

---

## 4. Destino Next (diretórios)

Aplicações Next.js de diretório (setorenergetico, cirurgia*, desentupidora,
geladeirastop, arcondicionadotop e afins).

| Item | Valor |
|---|---|
| Rota | varia por app, ex.: `POST /api/qmix/noticias` |
| Autenticação | `QMIX_API_KEY` do app, que precisa ser **a chave decifrada**, não o texto cifrado do banco |
| Imagem | esses destinos baixam por **URL** (`featured_image`), não leem base64 |
| Resposta | `{"ok":true,"id":...}` — por isso o código aceita `id` além de `post_id` |

Armadilhas próprias:

- **`trailingSlash` gera 308.** Se o endpoint cadastrado tiver barra final e o
  app redirecionar, o POST pode virar GET em clientes que não preservam método.
  O `article-transfer` usa `FOLLOWLOCATION`, o que ajuda, mas o correto é
  cadastrar a URL exata que o app expõe.
- Teste rápido de sanidade: `POST` com corpo `{}` deve responder **400**.
  401 significa chave errada; 404, rota errada; 301/308, redirecionamento.

---

## 5. Teste de sanidade, qualquer destino

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126 Safari/537.36"

# 1) chave errada -> 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" -H "x-api-key: errada" -A "$UA" -d '{}'

# 2) chave certa, corpo vazio -> 400  (isto é o resultado saudável)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" -H "x-api-key: $KEY" -A "$UA" -d '{}'
```

| Código | Significado |
|---|---|
| 400 | Saudável: autenticou e recusou o corpo vazio |
| 401 | Chave inválida ou ausente |
| 403 | Origem bloqueada no receptor, ou WAF da Cloudflare |
| 404 | Rota errada, namespace mudou |
| 301 / 308 | Redirecionamento (apex → www) engolindo o POST |
| 000 | Sem resposta: app parado, DNS ou firewall |
