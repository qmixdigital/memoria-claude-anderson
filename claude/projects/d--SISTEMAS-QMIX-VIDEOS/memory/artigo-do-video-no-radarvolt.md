---
name: artigo-do-video-no-radarvolt
description: "Rotina fixa: vídeo entregue e publicado por ele vira artigo no radarvolt.com.br, com o vídeo embutido antes do primeiro H2"
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-30T23:18:58.079Z
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
---

**Rotina permanente, pedida em 30/08/2026:** sempre que eu entregar um vídeo,
ele publicar no YouTube e me mandar o link, eu publico o artigo no
`radarvolt.com.br` **com o vídeo embutido logo antes do primeiro H2**.

Onde fica tudo:

- **VPS `clinicas-vps`** (Hostinger/HestiaCP, `ssh clinicas-vps`), ficha em
  `D:\SISTEMAS\MinhasHospedagens\clinicas-vps\ACESSO.md`.
- App Next.js em `/home/user/web/radarvolt.dominioprovisorio.net.br/app`,
  PM2 `radarvolt-web` e `radarvolt-web-b` nas portas 3080/3081.
- Postgres local, modelo `Post` com `type` (`video` | `news` | `article`),
  `youtubeId`, `metaTitle`, `metaDescription`, `tags`, `publishedAt`.
- Rota do artigo: `/blog/<slug>`. `/videos` lista `video`, `/noticias` lista
  `news`, `/blog` é o hub e lista tudo.

**A CAPA DO ARTIGO É A MINIATURA DO YOUTUBE.** Ordem dele em 30/08/2026: "a
imagem poderia ser a mesma imagem de thumb do YouTube e não a que você criou".
Eu tinha montado uma capa a partir de uma foto do material, e ele preferiu a
miniatura do próprio vídeo. Então `coverImage` = `/thumbs/<youtubeId>.jpg`, com
o arquivo re-hospedado em `app-shared/thumbs/`, igual aos posts de vídeo. Não
inventar capa nova.

**O BOTÃO DE VÍDEO PRECISA DA PALAVRA, não só do triângulo.** Ele: "o vídeo não
tem um botão escrito play. Muitas pessoas não vão entender que aquilo ali é um
vídeo". O `YouTubeFacade` agora traz uma pílula com o triângulo E a palavra
**ASSISTIR**, mais um selo "Vídeo do canal" no topo da imagem. Triângulo
sozinho é convenção de quem já sabe; quem não sabe vê um enfeite.

Detalhe que quase passou: a imagem da fachada precisa ser `absolute inset-0`.
Dentro do fluxo do flex ela ocupa a largura toda e **empurra o botão para fora
do quadro**. Com a pílula pequena quase não se via; com a pílula escrita, se vê.

**A DATA É A DO VÍDEO, NÃO A DE HOJE.** Ordem dele em 30/08/2026, ao mandar
publicar o Galaxy TT: "coloque antes do conteúdo de motos, porque ele é anterior
ao conteúdo de motos". A listagem ordena por `publishedAt` decrescente, então
publicar um vídeo antigo com a data de hoje o joga para o topo e bagunça a linha
do tempo do canal. O `inserir_artigo.js` gravava `new Date()` fixo e agora
respeita o campo do JSON.

**A miniatura é servida do próprio domínio.** `youtubeThumb` e `coverImage`
apontam os dois para `/thumbs/<id>.jpg`, com o arquivo em `app-shared/thumbs/`.
O script montava a URL do `i.ytimg.com` sozinho, e o Galaxy TT ficou sendo o
único dos nove posts a depender de terceiro para desenhar a fachada.

**A posição do vídeo é estrutural, não manual.** O `PostBody` recebe
`youtubeId` e insere o player antes do primeiro `## `. Nenhum artigo futuro
depende de eu lembrar da posição, e o corpo não leva marcador nenhum.

**Why:** ele quer o artigo puxando o vídeo, e antes do primeiro H2 é onde o
leitor já sabe do que se trata mas ainda não entrou no corpo.

**How to apply:** escrever o corpo na sintaxe leve do `PostBody` (parágrafos
separados por linha em branco, `## ` para H2, `[texto](/rota)` para link
interno, `**negrito**`), com o SEO do CLAUDE.md global: keyword no início do
title, meta de 150 a 160, linha fina no `excerpt` com 10 a 20 palavras, âncora
descritiva variada e cada destino uma vez só, e **nunca travessão**.

**DUAS ARMADILHAS DO DEPLOY, as duas já pagas caro** (ver o bloco vermelho no
`ACESSO.md`): `pm2 restart` por SSH não-interativo **não reinicia e não avisa**,
e conferir pela porta não prova nada porque o processo velho responde. Prove
pelo **PID mudar**. E **não construa dentro de `app/`**: use o `deploy.sh` do
projeto, que constrói em `app-build` e troca por `mv`. Ignorar isso deixou o
site servindo HTML de um build antigo com os chunks já apagados, e o visitante
via "Application error: a client-side exception has occurred". Ver
[[defeito-silencioso-conferir-artefato]].
