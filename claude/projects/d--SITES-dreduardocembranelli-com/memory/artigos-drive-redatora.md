---
name: artigos-drive-redatora
description: "Pasta do Google Drive de onde saem os artigos do site do Dr. Eduardo e as regras para publicá-los (texto da redatora quase intacto, imagem de banco, crosslinking, links externos, GEO, marcar como publicado)"
metadata:
  node_type: memory
  type: project
  originSessionId: cc85d4da-b1bc-47c9-9cb6-b2d7b30c00b7
  modified: 2026-10-03T09:25:52.008Z
---

Os artigos do blog de `dreduardocembranelli.com.br` chegam por esta pasta do Google Drive, sempre a mesma:
https://drive.google.com/drive/u/0/folders/<<REMOVIDO>> (id `<<REMOVIDO>>`).

Ordem do Anderson em 03/10/2026, vale para todo artigo deste site:

- **Publicar como a redatora enviou.** O texto é humanizado de propósito. Permitido: pequenos ajustes de título, meta description, alguns parágrafos e criar algumas perguntas de FAQ. **Proibido: alteração drástica do texto**, reescrever, encurtar ou "melhorar" o artigo.
- **Imagem**: os textos vêm sem imagem. Escolher foto de banco gratuito pela API da pasta `Documents/APIs` (Pexels/Pixabay, via `~/.claude/skills/guest-post-rede/scripts/banco_img.py`, termo em inglês, sem crédito, olhar a foto antes). Nunca IA sem ordem expressa.
- **Linkagem interna**: os textos vêm sem links. Fazer o crosslinking seguindo a seção "Linkagem Cruzada" do CLAUDE.md global (âncora com keyword do destino, variada, um link por destino por página, máximo 10, nada de âncora genérica) e as regras de âncora do CLAUDE.md do projeto (keyword → home, nome → `/dr-eduardo-cembranelli`).
- **Links externos de autoridade**: inserir fontes confiáveis que sustentem o que o texto afirma (sociedades médicas, PubMed, órgãos oficiais).
- **Conferir todo link, interno e externo**: abrir o destino e confirmar que o texto âncora condiz com o que a página realmente mostra. Âncora e destino têm de estar em consonância.
- **GEO/AEO**: otimizar também para respostas de IA (resposta direta no início da seção, FAQ, schema), sem descaracterizar o texto.
- **Marcar como publicado** no arquivo do Drive, com a data da publicação, para a redatora saber que já está no ar.

**Acesso (testado em 03/10/2026):** a service account `seoqmix@seoqmix.iam.gserviceaccount.com` (chave `<<REMOVIDO>>`, escopo `https://www.googleapis.com/auth/drive`) lê e **edita** a pasta, que se chama "PE E TORNOZELO". As outras três service accounts não têm a Drive API ligada. Os artigos são Google Docs: exportar com `GET /drive/v3/files/<id>/export?mimeType=text/html` (ou `text/plain`).

**Why:** o Google penaliza conteúdo 100% de IA; o valor do artigo é a redação humana. A redatora acompanha o andamento pela própria pasta.

**How to apply:** o caminho está pronto no repositório (ver seção "Blog" do CLAUDE.md do projeto): rodar `python scripts/blog_importar.py --txt <pasta>` (importa só os documentos sem o prefixo e numera), ler os `.txt`, acrescentar a entrada de cada artigo em `scripts/blog_config.py` (mais `ORDEM`, `PILARES` e `BLOG_ANCORAS`), rodar `python scripts/blog_build.py`, depois `static_site_fix.py . 8768 --mobile-full`, `bash scripts/deploy.sh`, IndexNow + sitemap no GSC e no Bing, e renomear o documento no Drive com o prefixo `[PUBLICADO dd/mm/aaaa] ` (padrão aprovado pelo Anderson em 03/10/2026; pegar só os documentos sem esse prefixo).

Decisões do Anderson em 03/10/2026: o **link mais importante de cada artigo é a home**, com âncora de especialidade variada (fica como primeiro link, no breadcrumb); blog com a mesma estrutura do site do Dr. Henrique, mas layout diferente. A redatora indica uma foto do Pexels em cada documento: usar essa foto, baixada pela API. Na entrega, listar os links na ordem em que aparecem, com o primeiro marcado. Ver [[conta-cloudflare-medicos-bh]] e [[css-critico-mobile-full-e-portas]].

Lotes publicados: 7 artigos em 03/10/2026 e mais 4 no mesmo dia (total 11). A redatora indica foto do Pexels **ou do Pixabay** (API `?key=&id=`, baixar sempre).
