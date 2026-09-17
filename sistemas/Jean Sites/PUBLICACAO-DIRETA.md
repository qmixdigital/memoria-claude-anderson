# Publicação direta nos sites (sem MCP) + aviso no bot do Telegram

Este documento explica como publicar artigos com imagem **direto** nos sites via
API nativa do WordPress (REST API + senha de aplicativo), **sem** passar pelo
servidor MCP, e como fazer cada publicação **sair no bot do Telegram** com a
identificação **"Anderson publicou"**.

> Quando usar isto: publicação feita aqui do computador (VS Code / Claude Code),
> onde há terminal. O MCP (`mcp.qmix.com.br`) é só para a Kátia, que publica pelo
> navegador. Aqui não precisa dele.

---

## 1. Visão geral do fluxo

```
Artigo pronto (HTML) + imagem (URL)
        |
        v
1. subir imagem   -> POST /wp-json/wp/v2/media
2. criar post     -> POST /wp-json/wp/v2/posts   (status: publish)
3. avisar no bot  -> sendMessage do Telegram  ("Anderson publicou em ...")
```

Tudo com **Basic Auth** usando a **senha de aplicativo** de cada site.

---

## 2. Pré-requisitos por site

Cada site precisa de um usuário WordPress (papel Autor ou Editor) com uma
**senha de aplicativo** gerada em *Usuários > Perfil > Senhas de aplicativo*.

A lista de sites com login e senha fica no arquivo **`sites.json`** (você preenche
depois; há um modelo em `sites.exemplo.json`). Formato de cada entrada:

```json
{
  "slug": "nomecurto",
  "nome": "Nome do Site",
  "url": "https://exemplo.com.br",
  "usuario": "login_wp",
  "senha_app": "<<REMOVIDO>>"
}
```

> `sites.json` contém segredos: manter fora de qualquer repositório (já está no
> `.gitignore`).

---

## 3. Autenticação

Todas as chamadas levam o header:

```
Authorization: Basic base64("usuario:senha de aplicativo")
```

Em `curl` isso é `-u "usuario:senha de aplicativo"`.

**Cuidado com Cloudflare:** vários sites ficam atrás do Cloudflare e desafiam
requisições sem cara de navegador. **Sempre enviar um User-Agent de navegador**,
senão volta um HTML de "Just a moment..." em vez de JSON:

```
-A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
```

---

## 4. Passo a passo com curl

Substitua `USER`, `SENHA` e o domínio. O `-A` é o User-Agent acima.

### 4.1 Validar credencial (opcional)

```bash
curl -s -A "$UA" -u "USER:SENHA" "https://SITE/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug"
```

Se voltar a lista de categorias em JSON, está tudo certo. Se voltar 401, a senha
está errada ou um plugin de segurança bloqueia a API. Se voltar HTML de
Cloudflare, faltou o User-Agent.

### 4.2 Subir a imagem destacada

```bash
curl -s -A "$UA" -u "USER:SENHA" -X POST "https://SITE/wp-json/wp/v2/media" \
  -H "Content-Type: image/webp" \
  -H 'Content-Disposition: attachment; filename="palavra-chave.webp"' \
  --data-binary @imagem.webp
```

Anote o `id` retornado (é o `featured_media`). Defina alt e legenda:

```bash
curl -s -A "$UA" -u "USER:SENHA" -X POST "https://SITE/wp-json/wp/v2/media/ID" \
  -H "Content-Type: application/json" \
  -d '{"alt_text":"descricao em pt-BR","caption":"legenda"}'
```

> O nome do arquivo deve conter a palavra-chave (bom para SEO). Formato WebP de
> preferência.

### 4.3 Criar o post publicado

```bash
curl -s -A "$UA" -u "USER:SENHA" -X POST "https://SITE/wp-json/wp/v2/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título com até 70 caracteres",
    "content": "<p>Conteúdo em HTML, com os links como <a href=\"...\">âncora</a>.</p>",
    "excerpt": "Resumo opcional",
    "slug": "slug-com-keyword",
    "status": "publish",
    "categories": [1],
    "tags": [12, 34],
    "featured_media": ID_DA_IMAGEM
  }'
```

Retorna `id`, `link` e `status`. O `link` é a URL pública que vai para o bot.

**Campos úteis:**

| Campo | Observação |
|---|---|
| `status` | `publish` (ao vivo), `draft` (rascunho), `pending` (revisão) |
| `categories` | **ids** (pegue em `/categories`), não nomes |
| `tags` | **ids**. Para criar por nome, ver 4.4 |
| `featured_media` | id vindo do passo 4.2 |
| `date_gmt` | para agendar: data ISO **em GMT** (ex.: `2026-09-10T12:00:00`) + `status:"future"`. Sempre `date_gmt`, nunca `date`, para não errar o fuso do site |

### 4.4 Tags por nome (criar se não existir)

O WordPress recebe tag por **id**. Para usar nomes:

1. Procurar: `GET /wp-json/wp/v2/tags?search=NOME` e comparar nome exato.
2. Se não existir, criar: `POST /wp-json/wp/v2/tags` com `{"name":"NOME"}`.
3. Se der **400 `term_exists`**, o id verdadeiro vem em `data.term_id` da resposta
   de erro. Use esse id (não trate 400 como falha aqui).

---

## 5. Aviso no bot do Telegram ("Anderson publicou")

Depois que o post é criado com sucesso, mandar uma mensagem no bot
**@qmixparceiros_bot**.

- **Token do bot:** `<<REMOVIDO>>`
- **Chat de destino (Anderson):** `<<REMOVIDO>>`

> Segredo: o token controla o bot. Não versionar este arquivo em repositório
> público.

### Formato da mensagem

```
✍️ Anderson publicou em <site>
<título>
<link>
```

O prefixo **"✍️ Anderson publicou em"** diferencia estas mensagens tanto das do
outro sistema de acompanhamento quanto das do MCP (que saem como "🤖 MCP
publicou em").

### Como enviar

Endpoint: `POST https://api.telegram.org/bot<TOKEN>/sendMessage`
Corpo JSON: `chat_id`, `text`, `parse_mode: "HTML"`.

**Armadilha de encoding:** no Windows, mandar acento/emoji pelo `curl -d` costuma
dar `Bad Request: strings must be encoded in UTF-8`. **Envie por Python** (ou
grave o corpo num arquivo UTF-8 e use `--data-binary @arquivo`). Exemplo Python:

```python
import json, urllib.request

TOKEN = "<<REMOVIDO>>"
CHAT_ID = "<<REMOVIDO>>"

def avisar_telegram(site, titulo, link):
    def esc(s):  # HTML parse mode: escapar < > &
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    texto = "\n".join([
        f"✍️ <b>Anderson</b> publicou em <b>{esc(site)}</b>",
        esc(titulo),
        f"🔗 {esc(link)}",
    ])
    payload = json.dumps({
        "chat_id": CHAT_ID,
        "text": texto,
        "parse_mode": "HTML",
        "disable_web_page_preview": False,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        data=payload, headers={"Content-Type": "application/json"},
    )
    urllib.request.urlopen(req, timeout=15)
```

Regra: **só avisar após o post confirmar `publish`** (HTTP 201). Se a publicação
falhar, não mandar aviso. Se o Telegram falhar, **não** desfazer o post: o aviso é
independente.

---

## 6. Script pronto

O arquivo **`publicar.py`** nesta pasta junta tudo: lê o site em `sites.json`,
sobe a imagem, cria o post e avisa no bot. Uso:

```bash
python publicar.py \
  --site slug_do_site \
  --titulo "Título do artigo" \
  --html artigo.html \
  --imagem imagem.webp \
  --alt "descrição da imagem" \
  --categoria 1 \
  --tags "tag um, tag dois" \
  --status publish
```

`--imagem`, `--alt`, `--categoria`, `--tags` e `--status` são opcionais
(`--status` padrão é `publish`). Sem `--imagem`, o post sai sem destaque.

O script já cuida de: User-Agent de navegador (Cloudflare), tags por nome com
tratamento de `term_exists`, alt/legenda da imagem, e o aviso no Telegram em
UTF-8 no formato "Anderson publicou em".

---

## 7. Checklist antes de publicar

- [ ] Título com no máximo 70 caracteres, sem travessão
- [ ] Conteúdo em HTML, âncoras como `<a href>` inline, sem termos proibidos
- [ ] Imagem WebP com nome contendo a palavra-chave e alt em pt-BR
- [ ] Categoria correta (id certo do site)
- [ ] `status` conferido (publish vs rascunho)
- [ ] Após publicar: confirmar que o link abre (HTTP 200) e que o aviso chegou no bot
