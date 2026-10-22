---
name: cliquex-educacaoonline-lousa
description: educacaoonline.pro.br = 13º diretório Teste IPTV ("Lousa IPTV", neo-brutalista claro, tom mitos e verdades); LIVE desde 2026-10-21 (propagado, IndexNow OK); host canônico apex; fonte em D:/SITES/educacaoonline-lousa
metadata:
  type: project
---

13º diretório Teste IPTV, marca "Lousa IPTV", construído em 2026-10-21. Conta Cloudflare "Aluguel Sites BOL"
(37b5f07b227c4fd026187d2e86b32d0e, token master), projeto Pages `educacaoonline`, zona cd8ebb30e799605d25d35c8f42c8dec6.
**Host canônico: APEX educacaoonline.pro.br** (Wayback do site antigo no apex; www → apex 301), diferente dos últimos 3
sites (empilhando, geracaoconsciente, museudalampada usam www). Mesma estrutura dos anteriores ([[cliquex-geracaoconsciente-teste]],
[[cliquex-empilhando-ponto]]): ranking dos 25 clientes ([[cliquex-provedores-clientes]]), 111 silos → home, playbook ([[cliquex-seguranca-playbook]]).

**Status (atualizado):** LIVE em https://educacaoonline.pro.br (zona active, cert apex ativo, www→apex 301, IndexNow 114 URLs enviado). Histórico: zona estava `pending`: NS do registro.br ainda a.auto.dns.br. O usuário deve trocar
para dean.ns.cloudflare.com e sonia.ns.cloudflare.com. Depois: purge, testar 200/Googlebot, IndexNow (host apex). Segurança da zona já aplicada.

**Anti-footprint:** creme/preto/azul/amarelo, bordas pretas grossas + sombra dura, Archivo 900 + Public Sans, selo vermelho "Mito ou verdade?",
cards mito (rosa) x verdade (verde), painel "lousa" verde com moldura de madeira. Tom: mitos e verdades. Rating 4.8 / 6821.
Tons usados na rede: medição, erros e armadilhas, roteiro em etapas, consumidor consciente, mitos e verdades.

**Gotchas:** (1) o scratchpad do Claude pode ser LIMPO entre sessões (sumiram pro_batches, silo_pages.json e scripts): sempre restaurar de
D:/SITES/<site>/ (a cópia mais recente tem tudo). (2) silo_pages.json copiado do geracaoconsciente trazia 112 páginas (extra teste-iptv-xciptv):
removida para manter 111. (3) agentes retomados via SendMessage refazem a tarefa sem reenviar o prompt.

**SEO das páginas internas (2026-10-21, pedido do usuário: SEO agressivo):** o 1º link do corpo agora é o link para a home com âncora de keyword (home_anchor, 111 distintas), dentro do 1º parágrafo da intro, com 5 frases em rodízio. Breadcrumb visual sem link (o BreadcrumbList segue no schema). CTA cliquex vem depois da intro. Um único link para a home por página: o link do fecho foi removido. Também entraram schema Article por página e imagem com alt por keyword. Os builders dos outros diretórios (procrie, farol, emp, ger) ainda têm o padrão antigo: CTA externo como 1º link, link da home só no fim e breadcrumb "Início" linkado. Aplicar o mesmo patch (lousa_patch_block.txt, guardado em D:/SITES/educacaoonline-lousa).

