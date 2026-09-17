---
name: reference_adsense_diretorios_cirurgia
description: "AdSense nos diretórios Next de cirurgia (coração/catarata/câncer) - ads.txt servido pelo nginx porque public/ é indexado no build, e loader no layout público"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-09T21:59:00.025Z
---

Feito em 09/08/2026 nos três diretórios Next do srv1166087 (`cirurgiacoracao.com.br`, `cirurgiadacatarata.com.br`, `cirurgiadecancer.com.br`) — ver [[reference_dominios_saude_viraram_diretorio_next]]. Publisher da rede: `3880875536722698`.

**ads.txt não pode ir em `public/`.** O Next indexa a pasta `public/` **durante o build**: subir o arquivo depois continua dando 404 até o próximo rebuild. Solução usada — snippet único `/etc/nginx/snippets/ads-txt.conf` com `location = /ads.txt { default_type text/plain; return 200 "google.com, pub-…, DIRECT, f08c47fec0942fa0\n"; }`, incluído nos vhosts de produção (`/etc/nginx/conf.d/cirurgia*.conf`, backups `.bak-adstxt-20260809`). Sobrevive a deploy, rollback e troca de release, e não depende de build. É diferente da engine de diretório do setorenergetico, que serve por rota `app/ads.txt/route.ts` ([[reference_next_engine_adsense_adstxt]]).

**Loader vai no layout `(public)`, nunca no layout raiz** — assim nunca alcança `/painel` e `/admin` (confirmado: painel responde 307 e sem o script). Tag JSX simples (`<script async src=… crossOrigin="anonymous" />`); React 19 iça para o `<head>` e ela **aparece no HTML servido**, que é o que a verificação por snippet do AdSense procura. Nenhum dos três usa Consent Mode com `gtag('consent','default')`, então o içamento não quebra ordem — em site que use, seguir o loader inline por `createElement` do CLAUDE.md.

Também foi posta a meta `google-adsense-account` (via `metadata.other` do layout raiz) como segunda via de verificação.

Armadilha de sempre, confirmada de novo: **ads.txt usa `pub-…` sem prefixo; script e meta usam `ca-pub-…`**.

Deploy: catarata tem `scripts/deploy.sh` que espera a release já montada em `-build`; câncer usa `scripts/remote-deploy.sh` alimentado por tarball; coração tem deploy que roda da máquina do dev (os passos servidor-side dele podem ser reproduzidos à mão: montar `-build`, symlink de `.env.production`/`uploads`/`_data`, `npm install`, `npm run build`, swap, restart em rolagem nas portas 3032/3033). Em todos, o build falha **antes** da troca — build quebrado não derruba o site.

**medicinageriatrica.com.br (13/08/2026):** mesmo padrão aplicado. Site é Next 16.2.1 no srv1166087 (`/var/www/medicinageriatrica`, PM2 3150/3151, deploy por `scripts/deploy.sh` que exige a release já montada em `-build`). ads.txt sai pelo nginx (`location = /ads.txt`, cache 5 min); loader novo em `src/components/adsense.tsx` chamado no layout de `(public)` (admin e 404 ficam fora); id lido da chave `adsense.cliente` da tabela `configuracoes` com normalização do prefixo `ca-`; meta `google-adsense-account` via `generateMetadata`. Carga em `requestIdleCallback` com teto de 2,5s e `requestNonPersonalizedAds=1` enquanto o banner não tiver 'aceito'. ARMADILHA VISTA NA PRÁTICA: `npm run build` no lugar quebra com `ENOTEMPTY` porque o processo em execução segura arquivos do `.next` — montar a release em `-build` e usar o deploy.sh. GAP que ficou: o admin tem CRUD de Anúncios por posição, mas **nenhum componente público renderiza** esses slots — só Auto Ads funciona hoje.
