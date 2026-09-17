---
name: portal-engine-footprint
description: Auditoria e redução de footprint da rede de portais do portal-engine (HTML estático no Cloudflare Pages, motor nas 3 VPS). Use quando pedirem para conferir se os portais escondem que são uma rede, quando mudar o render.js/archs.js/pages_pack.js, ao converter um portal novo, ou quando um sinal novo aparecer igual em muitos sites. Substitui, para os portais do motor, a parte de anti-fingerprint da skill wp-news-portal-fullsetup, que é só para WordPress.
---

# Footprint da rede no portal-engine

A rede vende backlinks editoriais. Ferramenta de detecção (Ahrefs, Semrush, Spamzilla,
SpyOnWeb, analista manual) não olha um site: baixa a mesma meia dúzia de páginas em
vários sites e conta o que é IGUAL. O que ela compara não depende de layout: texto
fixo, cabeçalhos HTTP, forma do JSON-LD, robots.txt, página de erro, IDs de anúncio e
de analytics, fontes, scripts externos, nomes de classe e de variável CSS, sequência
de tags do DOM. A regra é uma só: **nada pode sair igual em muitos portais**. As
diretrizes do WordPress continuam valendo (é o mesmo detector), mas o mecanismo é
outro: no motor a variação é gerada pelo código, por portal, a partir do slug.

Sem travessão em nenhum texto. Sem citar a agência. Texto em pt-BR com acento.

## Como o motor já varia (não reinventar)

| camada | onde | mecanismo |
|---|---|---|
| classes CSS | `render.js` `_renomClasses` / `_CLS_LIT` | nome derivado do hash do slug; a auditoria confirma: só `adsbygoogle` se repete |
| rótulos de interface, ids, placeholders, botão do banner LGPD | `render.js` `_VOC_OPC`, `_ROT_OPC`, `_CK_FRASES` | listas de 8 a 14 opções, escolha estável por `hash(slug + marca)` |
| ordem do `<head>` | `render.js` `_embaralha` | até 720 arranjos |
| páginas institucionais (quem somos, contato, privacidade, termos), 404, 410, robots.txt, ordem das chaves do JSON-LD | `src/variacoes.js` (17/09/2026) | abertura, blocos (ordem, título, parágrafo), numeração e fechamento sorteados por portal; 6 a 7 redações por trecho |
| arquitetura (DOM, CSS) | `archs.js`, letra por portal | a letra só é única dentro de cada VPS; a mesma arch aparece em até 3 servidores |
| 410 no Pages | `pages_pack.js` `gone()` | serve `public/410.html` do portal com status 410; o HTML cru só se o arquivo faltar |
| cabeçalhos de segurança | `pages_pack.js` `cabecalhosSeguranca(slug)` | Referrer-Policy sempre (o Pages põe um padrão), CSP/XFO/Permissions/HSTS sorteados e embaralhados; a regra igual da zona foi apagada (`cf_zonas_footprint.py`) |
| fontes | `fontes_locais.js <slug>` + `V.fontes` | woff2 em `public/<pasta por portal>/`, CSS local, sem fonts.googleapis; sem manifesto cai no Google |

`variacoes.js` é o mesmo arquivo nas 3 máquinas (`/opt/portal-engine/src/`). Cópia de
referência em `scripts/variacoes.js` desta skill e em `D:\PORTAIS\pages\motor\`. Para
acrescentar um trecho novo: criar a lista de redações, escolher com `_um(site, marca,
lista)` ou `_mistura`, e nunca usar aleatoriedade (o mesmo portal tem de sair sempre
igual, senão cada rebuild muda o site e o Google vê página instável).

## Auditoria: rodar depois de qualquer mudança no motor

```bash
python ~/.claude/skills/portal-engine-footprint/scripts/footprint_audit.py D:\PORTAIS\pages\dominios-pages.txt --min 5 --md D:\PORTAIS\pages\FOOTPRINT-PAGES-<data>.md
```

Baixa home, um artigo, robots, 404, 410 e as institucionais linkadas no rodapé de cada
portal (104 em ~3 min) e lista todo valor igual em pelo menos `--min` portais: cabeçalhos
extras, comentários HTML, generator, scripts e domínios externos, `ca-pub-`, `G-`/`GTM-`,
tipos e forma do JSON-LD, fontes, hash do CSS inline, forma do DOM, frases do rodapé, das
institucionais, do 404 e do 410, placeholders, botões, favicon. Também conta classes CSS
presentes em muitos portais. O JSON bruto fica ao lado do `.md`.

Ler o relatório de cima para baixo (ordenado por quantidade). O que aparece em 100+
portais é o que a ferramenta de detecção usa primeiro. Atenção: `jsonld_forma` é o
conjunto de chaves (sem ordem); WebSite/Organization/BreadcrumbList saem iguais em
todo site do mundo, então esse item em 104 não é achado. `404:status`/`410:status` idem.

Rodada final (17/09): `FOOTPRINT-PAGES-20260917-final.md` e o resumo em
`RELATORIO-FOOTPRINT-20260917.md`. Sobraram só os grupos de DOM por arch (27/25),
CSP mais comum em 26 e `ca-pub` nos 14 monetizados.

## O que a auditoria de 17/09/2026 achou e o que foi feito

Corrigido (em `variacoes.js` + `pages_pack.js`, rebuild dos 104):
- texto do 404 e do 410 idêntico em 104 → 8 títulos × 7 frases × 7 links por código
- privacidade, termos, contato e quem-somos (o padrão do motor) idênticos em ~100 →
  blocos e redações por portal; contato mantém `name=` dos campos (o receptor lê)
- robots.txt em 2 formatos → 6 formatos × 2 ordens
- forma do JSON-LD (chaves e ordem) igual em 104 → ordem das chaves por portal

Pendente, por ordem de peso (decidir com o Anderson):
1. **AdSense `ca-pub-3880875536722698`**: só nos 14 liberados no AdSense (lista do Anderson,
   17/09). Portal fora da lista NÃO leva o código: `tira_adsense.py` guarda o valor em
   `_adsenseRemovido` no sites.json para voltar se ele for aprovado.
2. ~~Cabeçalhos de segurança iguais em 102 zonas~~ feito 17/09: regra da zona apagada,
   `_headers` por portal.
3. ~~Cloudflare Web Analytics em 103~~ feito 17/09 com `cf_rum_off.py` (token do Pages
   com "Configurações da conta: Editar"). Zona nova ou projeto novo no Pages pode
   religar o RUM: rodar o script de novo depois de cada conversão.
4. ~~Google Fonts em 104~~ feito 17/09: `fontes_locais.js` + `V.fontes`. Portal novo ou
   troca de arch: rodar `node fontes_locais.js <slug>` antes do rebuild.
5. ~~Nomes de variável CSS~~ feito 17/09: `V.passadaFinal` (chamada no fim do
   `_renomClasses`) renomeia as custom properties definidas nos `<style>` com palavras de
   CSS por portal, e troca "Todos os direitos reservados" por 13 redações.
6. **Sequência de tags do `<article>`** igual em grupos de 25 a 27 portais: mesma
   arquitetura em VPS diferentes. Só arquitetura nova resolve; registrar em
   `D:\PORTAIS\pages\FOOTPRINT-PAGES-<data>.md` quais grupos existem antes de escolher
   a arch de um portal novo.

## Regras ao mexer no motor ou converter portal

- Texto fixo novo (rótulo, frase de erro, aviso, rodapé) entra em `_VOC_OPC`, `_ROT_OPC`
  ou `variacoes.js` com pelo menos 6 redações. Nunca uma string só.
- Página institucional escrita à mão (`site.about`, `extraPages`) ganha do padrão, e é
  o melhor caso: quanto mais portais com texto próprio, menos peso tem o padrão.
- Depois de patch no `render.js`: `systemctl restart portal-engine`, rebuild dos portais
  da máquina (`rebuild_site.js <slug>`, que dispara o deploy no Pages), e a auditoria.
  Os três `render.js` são diferentes (2450 / 2003 / 2284 linhas); patch por âncora
  (`scripts/patch_variacoes.py` é o modelo), nunca copiar o arquivo inteiro.
- Provar sempre sem `?nc=`: a query pula o cache da zona e o de assets do Pages.
- `--min 5` é o limiar de trabalho; `--min 20` mostra só o que é grave.
