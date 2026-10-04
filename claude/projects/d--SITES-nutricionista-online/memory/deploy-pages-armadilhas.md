---
name: deploy-pages-armadilhas
description: "Armadilhas do deploy no Cloudflare Pages deste site (dist vazia publicada, cache immutable sem hash, edge cache preso) e como o pipeline evita cada uma"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9f625e33-a68c-489f-959d-2a2042c2a2d5
  modified: 2026-09-10T15:18:28.445Z
---

Deploy do nutricionista.digital: `python tools/preparar-dist.py && npx wrangler pages deploy dist --project-name=nutricionista-digital --branch=main`, depois purge_everything na zona `35864400965d655bbc4fe802cb2e4aa1`. Subdomínio: `build-cardapios.py` + `build-clusters.py`, deploy de `cardapios-site/` no projeto `cardapios-nutricionista`.

**Why:** Em 10/09/2026 deixei um `python -m http.server` rodando dentro de `dist/`; o `rmtree` falhou pela metade, eu encadeei o deploy com `;` e o wrangler publicou uma pasta vazia: dois minutos de 404 no site inteiro. O `preparar-dist.py` agora aborta se faltar arquivo obrigatório ou tiver menos de 100 arquivos.

**How to apply:** Nunca servir `dist/` localmente durante o deploy (servir uma cópia). Sempre `&&` entre preparar e publicar. Se o site der 404 depois de um deploy, republicar imediatamente e purgar; o alias pages.dev demora alguns segundos a virar. Para conferir, `curl -o /dev/null -w "%{http_code}" "URL?nc=$RANDOM"`.

Terceira armadilha (10/09/2026): testar URL nova com curl logo depois do `wrangler deploy` devolve 404 enquanto o domínio ainda aponta para o deployment anterior, e esse 404 fica no edge. Ordem certa: deploy, esperar uns 10 s, purge, só então conferir; se já conferiu cedo demais, purge de novo resolve.

Outras duas armadilhas já vistas: (1) `_headers` cacheia `/assets/*` por um ano como immutable, por isso o build gera `site-<hash>.css` e `<nome>-<hash>.js` via `tools/otimizar-saida.py`; nunca linkar CSS/JS sem hash na saída. (2) Caminho removido do Pages pode continuar servindo 200 velho do edge, imune a purge; a saída é uma regra em `_redirects` para o Pages produzir resposta nova. Ver também [[heredoc-escapes-quebram]].

Quarta (18/09/2026): `npx wrangler pages deploy` em sessão não interativa exige `CLOUDFLARE_API_TOKEN`; usar o token `master` de `D:/SISTEMAS/Cloudflare/contas.json` (ler por Python, nunca imprimir) com `CLOUDFLARE_ACCOUNT_ID=2ff4c5d06407622c756c5b57c46924a5` (conta QMIX, dona do projeto). Purge da zona pela API com o mesmo token.

Ruído do `build-nav.py`: cada rodada acrescenta uma linha em branco antes do botão flutuante em todas as 116 páginas. Antes de commitar, restaurar os arquivos cujo diff é só espaço (`git diff -w --ignore-blank-lines --numstat`), senão o commit leva 30 arquivos sem mudança real.

Quinta (03/10/2026): o token de `C:/Users/User/Documents/APIs/cloudflare-pages.txt` serve para o `wrangler pages deploy` dos dois projetos e também para o purge da zona; prefira-o ao `master` do `contas.json`. O deploy do subdomínio é `npx wrangler pages deploy cardapios-site --project-name=cardapios-nutricionista --branch=main`, sempre depois de `build-cardapios.py && build-clusters.py` (a primeira apaga a pasta; os PDFs moram em `tools/pdf/` por causa disso).

Sexta (03/10/2026): `_headers` cacheia `/icones/*` (e `/imagem/*`) por um ano como immutable, e esses arquivos NÃO têm hash no nome. Redesenhar um ícone mantendo o nome faz o visitante antigo continuar vendo o desenho velho. Saída usada no redesenho: todas as referências viraram `icones/nome.svg?v=2` (HTML, components.js, build-nav.py, build-blog.py, style.css). Ao mexer de novo num ícone, subir o número com `sed -E 's#(icones/[a-z0-9-]+\.svg)(\?v=[0-9]+)?#\1?v=3#g'` nesses arquivos. Os ícones saem de `tools/gerar-icones.py`, não se edita o SVG à mão. Ver [[visual-moderno-sem-arco]].
