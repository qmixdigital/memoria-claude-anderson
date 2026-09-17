---
name: linkagem-interna-portal-novo
description: Portal recém-convertido nasce sem malha interna; são duas frentes, o acervo e o autoLink
metadata:
  type: project
---

Portal convertido do WordPress **nasce sem linkagem interna nenhuma**: os links
que existiam na origem apontavam para URLs que mudaram ou sumiram na poda. Em
20/08/2026, blogse, qmixdigital e euvo tinham 1.123 dos 1.137 artigos com backlink
de cliente sem receber um único link interno. No qmixdigital eram 100%.

**Why:** página com backlink de cliente que não recebe link interno não acumula
autoridade, e um link que sai de página fraca entrega menos ao cliente. O backlink
é o produto: órfão é produto entregue pela metade.

**How to apply:** são **duas frentes**, e fazer só uma deixa metade do problema.

1. **A malha do acervo**, que é retroativa. Empareia por editoria e termos em
   comum, teto de 10 links por página, um por destino, média de 2 links recebidos
   por artigo. Script `malha_interna.py`.
2. **O `autoLink` do motor**, que é para o futuro. Vem desligado, roda na
   publicação, e sem ele todo artigo novo da plataforma do Antônio nasce órfão de
   novo. Ver [[linkagem-interna-automatica]].

Cuidados que já custaram retrabalho:

- **Linkagem só dentro do domínio.** Link entre portais da rede é rastro de
  conjunto. Ordem explícita do Anderson.
- **Conferir os destinos do mapa antes de ligar.** Quatro dos meus deram 404 por
  slug tirado de relatório com coluna truncada. Destino quebrado gera link para
  404 em cada artigo novo, todo dia, sem ninguém notar.
- **Termo do mapa é frase natural**, não amontoado de palavra-chave. `escassez
  memória contratos` nunca casa em texto corrido, e aí o fallback dispara em todo
  artigo e repete o mesmo parágrafo pelo portal.
- **IPTV nunca entra como destino** fora do wtw19, mesmo sendo a página de mais
  clique: ver [[iptv-legitimo-no-wtw19]].
- **Não prefixar o título para variar a âncora.** Quebra em caixa alta de título e
  duplica palavra em título que começa com pergunta. A variação vai no texto de
  chamada em volta do link.
