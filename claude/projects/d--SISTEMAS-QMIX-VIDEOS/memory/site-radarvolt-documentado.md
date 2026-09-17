---
name: site-radarvolt-documentado
description: A documentação de acesso e publicação do site radarvolt.com.br vive em D:\SITES\radarvolt.com.br, fora do repo de vídeos
metadata:
  type: project
---

**Pedido dele em 30/08/2026:** "insira a documentação de acesso ao servidor
desse site na pasta desse projeto, pois vou abrir em outro chat".

O site `radarvolt.com.br` é operado a partir de **`D:\SITES\radarvolt.com.br`**,
que contém só documentação e scripts. O código roda no servidor, em
`/home/user/web/radarvolt.dominioprovisorio.net.br/app` (VPS `clinicas-vps`).

- `ACESSO.md`: SSH, estrutura, stack, deploy e as três armadilhas (PM2 que não
  reinicia por SSH não-interativo, conferir por porta que não prova nada,
  build no lugar).
- `PUBLICAR-ARTIGO.md`: o procedimento completo de publicar um artigo de vídeo.
- `scripts/`: `modelo_artigo.py`, `inserir_artigo.js`, `ligar_links.js`,
  `listar_posts.js`, `conferir_artigo.py`, `deploy.sh`.

**Why:** ele abre sessões separadas para o site e para a fábrica de vídeos, e a
sessão do site não tem o histórico desta. Sem a pasta documentada, a sessão nova
redescobre tudo do zero e repete os incidentes.

**How to apply:** trabalho no SITE começa lendo essa pasta. Trabalho no VÍDEO
continua em `d:\SISTEMAS\QMIX-VIDEOS`. A rotina que liga os dois está em
[[artigo-do-video-no-radarvolt]].
