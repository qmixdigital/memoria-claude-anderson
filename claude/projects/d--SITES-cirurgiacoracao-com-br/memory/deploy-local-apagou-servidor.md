---
name: deploy-local-apagou-servidor
description: Em 24/08/2026 um deploy feito de uma máquina com cópia antiga apagou toda a rodada de 19/08 do cirurgiacoracao; como conferir e restaurar
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 34f8fcac-98ef-4542-b226-fe9ed8bc2d91
  modified: 2026-09-19T19:50:54.752Z
---

**O `scripts/deploy.sh` do cirurgiacoracao empacota o código da máquina LOCAL e substitui a release inteira.** Em 24/08/2026 alguém rodou esse deploy de uma máquina cuja cópia era anterior a 19/08, para adicionar o `BotaoFontePreferida` na rede toda. Resultado: canonical dos artigos voltou para `/blog/`, títulos do diretório voltaram para "Estabelecimentos de", bairros voltaram a `index`, AdSense sumiu por 26 dias, `/api/deploy` voltou, paginação do blog voltou a `?page=`. Só sobreviveu o que era **dado** (descrições das fichas, capas, títulos no banco). Descoberto em 19/09/2026, restaurado a partir do `-prev`, fundindo o botão de 24/08 por cima.

**Por quê:** o código-fonte vive só no servidor, sem git, e a máquina que deploya tem uma cópia que ninguém sincroniza. Cada deploy de lá é um rollback silencioso de tudo que foi feito no servidor depois da última vez que aquela cópia foi atualizada.

**Como aplicar:**
- Antes de qualquer trabalho no cirurgiacoracao, conferir se os arquivos de 19/08 ainda existem: `ls src/lib/faq-cidade.ts src/lib/adsense.ts "src/app/(public)/blog/page/[n]/page.tsx"`. Se faltarem, houve deploy de cópia velha: o `-prev` e os tarballs em `-shared/_backup/src-*.tar.gz` são o ponto de restauro.
- Deploy feito no servidor é por `bash scripts/deploy-servidor.sh` (instância B efêmera, B sobe e testa antes de tocar a A). Não usar `npm run build` no diretório que serve.
- A cópia local atual do código está em `D:\SITES\cirurgiacoracao.com.br\app\` desde 19/09/2026. **Quem for deployar de qualquer máquina precisa antes baixar o servidor** (`rsync` de `/var/www/cirurgiacoracao/src`), ou vai repetir o estrago.
- A mesma armadilha vale para o cirurgiadacatarata, que usa o mesmo `deploy.sh`. Ver [[catarata-onde-fica]] e [[cirurgiacoracao-onde-fica]].
