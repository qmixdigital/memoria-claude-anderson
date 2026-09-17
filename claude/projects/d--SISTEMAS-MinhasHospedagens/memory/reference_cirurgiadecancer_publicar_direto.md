---
name: reference_cirurgiadecancer_publicar_direto
description: "Publicar e editar artigo no diretório Next cirurgiadecancer: campo image é URL (nunca base64), o template ignora seo_title/seo_description, ISR só cai com pm2 reload e a triagem YMYL pode deixar guest post noindex"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-08-25T13:35:40.911Z
---

Vale para os diretórios Next de saúde no `hostinger-vps-srv1166087`
(`cirurgiadecancer`, e por semelhança de código `cirurgiacoracao` e
`cirurgiadacatarata`). Quatro armadilhas que custaram tempo em 25/08/2026:

**1. Imagem: o campo é `image` e ele é URL, não base64.** O receptor
`/api/qmix/noticias/` grava `imagem_url: p.image ?? null` e **não tem upload de
binário** (diferente do medicinageriatrica, que tem `salvarImagem()`). Mandar
`featured_image` em base64 faz o artigo nascer sem foto e sem erro nenhum.
Fluxo certo: subir o WebP para
`/var/www/<app>-shared/storage/uploads/AAAA/MM/` e passar
`"image": "/wp-content/uploads/AAAA/MM/arquivo.webp"` (o `next.config` reescreve
esse caminho para `/api/media/`, que lê de `UPLOADS_DIR`). Rota exige **barra
final** no POST, senão 308.

**2. O template ignora `seo_title` e `seo_description`.** As colunas existem no
banco e não são lidas: `generateMetadata` usa `post.titulo` para o `<title>` e
`post.resumo` para a `description`. Quem quiser controlar o SEO edita **titulo e
resumo**. O `<title>` ainda recebe o sufixo " | Cirurgia de Câncer" do layout,
então o `titulo` precisa caber em ~40 caracteres para o conjunto ficar em 60.

**3. ISR de 1 hora, e apagar o prerender do disco não basta.** Depois de mexer
no banco, remover `.next/server/app/<cat>/<slug>.*` continua servindo a versão
velha: a instância mantém cache em memória. Só cai com `pm2 reload <app>-web` e
`pm2 reload <app>-web-b`, um de cada vez, e depois `cf_purge.py <dominio>`.
Não existe rota de revalidação nesses apps.

**4. Triagem YMYL pode deixar o guest post noindex.** `classificarPost()` marca
`indexavel = false` para qualquer artigo sem termo oncológico no título, no slug
ou no corpo (`câncer|tumor|metástase|quimioterap|sarcoma|biópsia|nódulo|...`).
Guest post de ortopedia pura entra publicado, responde 200 e **não indexa**, ou
seja, o backlink não vale nada. Conferir sempre:
`SELECT slug, indexavel, triagem_motivo FROM noticias WHERE slug='...'`.
A resposta do POST já devolve `indexavel` e `triagem`.

Banco: `DATABASE_URL` em `/var/www/<app>-shared/.env`. Ver também
[[reference_antonio_destino_next_contrato]] e
[[reference_dominios_saude_viraram_diretorio_next]].
