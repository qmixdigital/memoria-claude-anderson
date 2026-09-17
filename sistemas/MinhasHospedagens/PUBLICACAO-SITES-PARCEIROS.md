# Publicação nos sites de PARCEIROS (rede do Jean)

Rede **de terceiros**, separada dos portais próprios da QMIX. São **38 sites** onde
temos usuário e senha de aplicativo, publicáveis pela REST API do WordPress.

Montado em 03 e 04/09/2026. Documento vale para qualquer chat ou pessoa que vá publicar
nesses sites.

> **Não confundir com a rede própria.** Os 111 portais da QMIX publicam pelo
> portal-engine, com endpoint `wp-json/XXXX-api/v1/artigos` e chave por domínio
> (ver `qmix_endpoints_atual.csv`). Os sites de parceiro **não têm esse plugin**:
> publicam pela **REST API nativa** com senha de aplicativo. São mecanismos diferentes.

---

## 1. As duas formas de publicar

| | **A. Conector MCP** (recomendado) | **B. REST direto** |
|---|---|---|
| Como | ferramentas no chat | curl / script |
| Onde funciona | claude.ai e Claude Code | qualquer lugar com terminal |
| Precisa de credencial na mão | não, ficam no cofre | sim |
| Aviso no Telegram | **automático** | só se o script mandar |
| Log de auditoria e trava por hora | sim | não |

Para um chat que já publica na rede própria e vai passar a publicar aqui também,
o caminho é o **A**.

---

## 2. Forma A: conector MCP

### 2.1 Ligar o conector no chat

No claude.ai: **Configurações > Conectores > Adicionar conector personalizado**

| Campo | Valor |
|---|---|
| Nome | à escolha (ex.: `Sites parceiros`) |
| URL | `https://mcp.qmix.com.br/mcp` |
| Autenticação | **Sempre obrigatório** |
| Cliente OAuth | **Sem ID de cliente, registrar automaticamente (DCR)** |
| Cabeçalhos extras | vazio |

Ao conectar abre a tela de login. Usuários: `anderson` e `katia` (senhas no `.env`
do servidor, em `/opt/wp-mcp/.env`). O login dura 30 dias.

Depois de conectar, **ative o conector dentro do projeto/conversa** (ícone de
ferramentas na barra de digitação).

No Claude Code: `claude mcp add --transport http parceiros https://mcp.qmix.com.br/mcp`

### 2.2 Ferramentas disponíveis

| Ferramenta | Para que serve |
|---|---|
| `listar_sites` | lista os 38 sites com slug, nome e se permite publicar |
| `listar_categorias` | categorias (e tags) de um site: `{site}` |
| `subir_imagem` | `{site, url_imagem, nome_arquivo, alt, legenda}` → devolve `media_id` |
| `criar_post` | cria e publica, ver campos abaixo |
| `atualizar_post` | `{site, post_id, ...}` para corrigir ou trocar status |
| `verificar_post` | `{site, post_id}` confere se continua no ar |

**Campos do `criar_post`:**

```
site                 slug vindo de listar_sites
titulo               máximo 70 caracteres
conteudo_html        o artigo em HTML, âncoras como <a href="...">
resumo               opcional
slug                 opcional, slug da URL
categorias           array de IDs (pegar em listar_categorias)
tags                 array de NOMES (o servidor cria as que faltarem)
imagem_destaque_id   media_id vindo de subir_imagem
status               draft | pending | publish   (padrão: publish)
agendar_para         ISO, ex. 2026-09-10T09:00:00 (vira status future)
```

Retorna `post_id`, `link`, `status` e `link_edicao`.

### 2.3 Ordem correta

1. `listar_sites` e confirmar o slug
2. `listar_categorias` e escolher a categoria
3. `subir_imagem` com a URL pública da imagem
4. `criar_post` com o `media_id` no `imagem_destaque_id`

> `subir_imagem` aceita **URL**, não arquivo local. Imagem gerada pela Runware já vem
> com URL pública, serve direto.

### 2.4 Proteções embutidas

- **10 publicações por site por hora**, para conter loop
- **Dedupe**: conteúdo idêntico no mesmo site em menos de 10 minutos não duplica,
  devolve o post que já existe
- **Trava de publicação**: site marcado com `permite_publicar = 0` cai para rascunho
  automaticamente, com aviso na resposta
- **Log de auditoria** na tabela `publicacoes` (data, usuário, site, post, status, link)

---

## 3. Forma B: REST direto

Autenticação Basic com a **senha de aplicativo** (não a senha da conta):

```
Authorization: Basic base64("usuario:senha de aplicativo")
```

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# imagem
curl -s -A "$UA" -u "USER:SENHA_APP" -X POST "https://SITE/wp-json/wp/v2/media" \
  -H "Content-Type: image/webp" \
  -H 'Content-Disposition: attachment; filename="keyword.webp"' \
  --data-binary @imagem.webp

# post
curl -s -A "$UA" -u "USER:SENHA_APP" -X POST "https://SITE/wp-json/wp/v2/posts" \
  -H "Content-Type: application/json" \
  -d '{"title":"...","content":"<p>...</p>","status":"publish","categories":[1],"featured_media":ID}'
```

Script pronto que já faz isso e ainda avisa no Telegram:
`d:\SISTEMAS\Jean Sites\publicar.py` (documentado em `PUBLICACAO-DIRETA.md` na mesma pasta).

---

## 4. Armadilhas que já custaram tempo

| Sintoma | Causa | Correção |
|---|---|---|
| Volta HTML "Just a moment..." em vez de JSON | Cloudflare desafia requisição sem cara de navegador | mandar **User-Agent de navegador** em toda chamada |
| 401 com senha certa | plugin de segurança ou host removendo o header `Authorization` | `CGIPassAuth On` no .htaccess, ou o site fica na lista manual |
| 400 `term_exists` ao criar tag | a tag já existe | o ID verdadeiro vem em `data.term_id` da resposta de **erro**; usar ele, não tratar como falha |
| Post agendado na hora errada | `date` usa o fuso do site, e cada site tem o seu | usar sempre **`date_gmt`** |
| `GET /wp/v2/users` bloqueado | Cloudflare protege esse endpoint específico | não usar para validar; validar por `/categories` |
| Acento vira erro no Telegram | `curl -d` no Windows não manda UTF-8 | enviar por Python com `json.dumps(...).encode("utf-8")` |

---

## 5. Avisos no Telegram

Bot **@qmixparceiros_bot**, chat do Anderson (`<<REMOVIDO>>`). Três identidades, para
saber a origem de bate-pronto:

| Prefixo | Origem |
|---|---|
| 🤖 **MCP** publicou em... | publicação pelo conector MCP (qualquer chat, Kátia ou Anderson) |
| ✍️ **Anderson** publicou em... | publicação direta pelo `publicar.py` |
| 📝 *Nome* publicou em... | sistema de acompanhamento antigo, da rede própria |

O aviso do MCP é automático e sai depois que o post confirma. Se o Telegram falhar,
a publicação não é afetada.

---

## 6. Regras editoriais

Quem escreve o conteúdo segue a skill
**`materias-jornalisticas-linkbuilding`**, em
`d:\SISTEMAS\Publicações em sites de parceiros WordPress\.claude\skills\`.

Resumo do que ela cobre:

- **Briefing obrigatório**: portal, URL do cliente, âncora exata, segmento
- **Pesquisa antes de escrever**: perfil do portal, dados verificáveis (OMS, IBGE, PNS,
  DATASUS, SciELO), credenciais do cliente
- **Ângulo inédito por portal**, consultando `angulos-por-segmento.md` e o histórico em
  `clientes-recorrentes.md` para não repetir tema nem âncora
- **Estrutura**: título ≤70 sem exclamação, linha fina, 1.200 a 2.500 palavras, 5 a 7 H2
- **Links**: âncora recebe o link (nunca a frase toda), fora do primeiro e do último
  parágrafo, mínimo 3 parágrafos entre dois links, inline e nunca em bloco "Leia também"
- **Zero travessões** e lista de termos proibidos (abordagem, alavanc, ecossistema,
  soluç, robusto, insights, stakeholders, "cada vez mais", "é fundamental",
  "vale ressaltar", "nesse contexto", descubra, "saiba mais", proporcion, potencializ...)
- **Validação por script** antes de publicar
- **Verificação factual** de cada número, nome, data e credencial
- **Imagem pela Runware no modelo barato**

### Scripts da skill

```bash
# valida o artigo: bloqueios + score de humanização (alvo 70)
python validador_materia.py artigo.html --links 1 --titulo "Título"

# gera a imagem (modelo barato, ~US$ 0,0006) e devolve a URL pública
python gerar_imagem.py --prompt "... , candid documentary photograph, no text" --slug keyword
```

O validador reprova com `XX` em: título acima de 70, exclamação no título, travessão,
termo proibido, menos de 1.200 palavras, número de links diferente do briefing, link no
primeiro ou no último parágrafo, links a menos de 3 parágrafos de distância, bullets no
corpo, âncora do tamanho da frase.

**Imagem:** o padrão é `runware:100@1` (US$ 0,0006). O Nano Banana Pro (`google:4@2`,
US$ 0,138) só com autorização explícita do Anderson, pedida antes.

---

## 7. Os 38 sites

| Slug | Domínio | Autor da conta |
|---|---|---|
| abadianoticia | abadianoticia.com.br | Alice Carvalho |
| achixclip | achixclip.com.br | Alice Carvalho |
| afnewss | afnewss.com.br | Alice Carvalho |
| agenciadivulgar | agenciadivulgar.com.br | Alice Carvalho |
| aguabrancaemfoco | aguabrancaemfoco.com.br | Alice Carvalho |
| alagoas200 | alagoas200.com.br | Miguel Pereira |
| alagoasdiario | alagoasdiario.com.br | Miguel Pereira |
| alertasocial | alertasocial.com.br | Miguel Pereira |
| amadahipertrofia | amadahipertrofia.com | Miguel Pereira |
| apucarananoticias | apucarananoticias.com.br | Miguel Pereira |
| astralassessoria | astralassessoria.com.br | Sofia Almeida |
| babyou | babyou.com.br | Sofia Almeida |
| brasilnovonoticias | brasilnovonoticias.com.br | Sofia Almeida |
| canaljustica | canaljustica.jor.br | Sofia Almeida |
| chambre-hote-douarnenez | chambre-hote-douarnenez.net | (sem persona) |
| ciberlex | ciberlex.adv.br | Sofia Almeida |
| cocaisnoticias | cocaisnoticias.com.br | Lucas Souza |
| egea-immobilier | egea-immobilier.com | (sem persona) |
| itapecurunoticias | itapecurunoticias.com.br | Lucas Souza |
| itapenoticias | itapenoticias.com.br | Lucas Souza |
| jornal | jornal.seg.br | Beatriz Oliveira |
| jornalbahia | jornalbahia.com.br | Lucas Souza |
| jornalnoticiaonline | jornalnoticiaonline.com.br | Julia Ribeiro |
| jornalpreliminar | jornalpreliminar.com.br | Julia Ribeiro |
| luiziananoticias | luiziananoticias.com.br | Julia Ribeiro |
| noticiasdaserra | noticiasdaserra.com.br | Pedro Oliveira |
| noticiasdefloriano | noticiasdefloriano.com.br | Pedro Oliveira |
| noticiasdetimon | noticiasdetimon.com.br | Pedro Oliveira |
| portalgc | portalgc.com.br | Pedro Oliveira |
| portoenoticias | portoenoticias.com.br | Pedro Oliveira |
| professortrabalhista | professortrabalhista.adv.br | Ana Costa |
| saopauloaberta | saopauloaberta.com.br | Ana Costa |
| sp2040 | sp2040.net.br | Ana Costa |
| tcfoco | tcfoco.com.br | Ana Costa |
| teixeiraemfoco | teixeiraemfoco.com.br | Ana Costa |
| vivofutebol | vivofutebol.com.br | Gabriel Santos |
| webcitizen | webcitizen.com.br | Gabriel Santos |
| xthor | xthor.com.br | Gabriel Santos |

Todos validados em 04/09/2026 (as 38 credenciais responderam). Três não são portal de
notícia brasileiro: `amadahipertrofia.com`, `chambre-hote-douarnenez.net` e
`egea-immobilier.com` (os dois últimos, franceses).

**A lista viva é sempre o `listar_sites`**, não esta tabela.

---

## 8. Infraestrutura do conector

| Item | Valor |
|---|---|
| Endereço | `https://mcp.qmix.com.br/mcp` |
| Servidor | Hetzner `gnd-motor` (62.238.112.87), `ssh gnd-motor` |
| Diretório | `/opt/wp-mcp` |
| Stack | Bun + Express + MCP SDK 1.30 + SQLite |
| Processo | **systemd** (`systemctl status wp-mcp`), NÃO PM2 (não há Node no servidor) |
| Log | `/var/log/wp-mcp.log` |
| Porta interna | 3100, atrás do Nginx |
| SSL | Let's Encrypt, renovação automática |
| Cloudflare | zona qmix.com.br, registro `mcp` **proxied** |

**Cloudflare, atenção:** existe uma regra WAF custom chamada `ALLOW conector MCP`
(`http.host eq "mcp.qmix.com.br"`, ação Skip). **Sem ela o WAF da zona derruba o
conector com 403.** Se o conector parar de responder, é o primeiro lugar a olhar.

### Comandos de operação

```bash
# estado e log
ssh gnd-motor 'systemctl status wp-mcp; tail -30 /var/log/wp-mcp.log'

# reiniciar
ssh gnd-motor 'systemctl restart wp-mcp'

# saúde
curl -s https://mcp.qmix.com.br/health

# listar sites do cofre
ssh gnd-motor 'cd /opt/wp-mcp && ~/.bun/bin/bun run scripts/list-sites.ts'

# cadastrar um site novo
ssh gnd-motor 'cd /opt/wp-mcp && echo "SENHA DE APP" | ~/.bun/bin/bun run scripts/add-site.ts \
  --slug X --nome "Nome" --url https://dominio --usuario LOGIN'
# use --nao-publicar para parceiro que só aceita rascunho

# cadastro em lote (JSON com slug,nome,url,usuario,senha)
ssh gnd-motor 'cd /opt/wp-mcp && ~/.bun/bin/bun run scripts/add-sites-batch.ts /tmp/sites.json'

# testar credencial de um site
ssh gnd-motor 'cd /opt/wp-mcp && ~/.bun/bin/bun run scripts/test-site.ts --slug X'
```

### Onde ficam os segredos

| O quê | Onde |
|---|---|
| Senhas de aplicativo dos 38 sites | cifradas (AES-256-GCM) em `/opt/wp-mcp/data/vault.db` |
| Chave mestra do cofre, senhas OAuth, token do Telegram | `/opt/wp-mcp/.env` (chmod 600) |
| Planilha original do parceiro | `d:\SISTEMAS\Publicações em sites de parceiros WordPress\sites_jean.csv` (texto puro) |

Código-fonte do conector: `d:\SISTEMAS\Publicações em sites de parceiros WordPress\wp-mcp\`.
Deploy: editar local, `scp` para `/opt/wp-mcp`, `systemctl restart wp-mcp`.

---

## 9. Pendências conhecidas

- Firewall Hetzner `gnd-fw` (id 11493524) está com 80/443 abertos a `0.0.0.0/0`.
  Dá para restringir aos IPs do Cloudflare e esconder a origem.
- Não existe página de upload de imagem: `subir_imagem` só aceita URL pública. Se
  alguém precisar publicar imagem do próprio computador, falta construir isso.
- `skill.md` (na pasta do projeto) está truncado na seção 8.
- `portais-mapeados.md` e `clientes-recorrentes.md` estão com markdown escapado
  (`\#`, `&#x20;`), o que atrapalha a leitura automática.
