---
name: qmix-pagina-sites-pequenas-empresas
description: "Página de serviço /sites-para-pequenas-empresas (16/10/2026): por que é serviço e não artigo, o que promete e o que ficou sem preço"
metadata:
  type: project
---

Criada em 16/10/2026 a pedido do Anderson ("acho que página de serviço fica melhor"), em
`src/app/(frontend)/sites-para-pequenas-empresas/page.tsx`, linkada no card "Desenvolvimento de
Sites" de `/servicos` e no sitemap (0.8). SERP do termo medida no Serper: guias (Stripe, Mailchimp),
criadores de site (Site123, Squarespace, GoDaddy) e listas; nenhuma agência brasileira no top 10.
Por isso a página responde à dúvida antes de vender: checklist do que o site precisa ter, tabela
criador x freelancer x agência, processo em 4 etapas, seção "quanto custa" sem tabela de preço.

**Pacotes definidos pelo Anderson em 16/10/2026 (pagamento único, SEO incluído, hospedagem grátis no Cloudflare Pages quando em HTML; domínio e e-mail personalizado NÃO incluídos):** Landing Page R$ 498 (1 página, cliente fornece textos de base, fotos e logo); Site Completo R$ 990 (até 10 páginas, quem somos, contato, formulário WhatsApp/e-mail), o destacado; Site com Blog R$ 1.490 (tudo + blog + 10 artigos com linkagem interna e externa). Nomes dos pacotes foram escolha minha. Schema Service.offers com os três preços. CTA de cada pacote abre WhatsApp com o nome do pacote.

Promessas que a página faz e precisam continuar verdadeiras: orçamento à parte em 1 dia útil para o que foge dos pacotes;
domínio e acessos no nome do cliente; PageSpeed como meta (já prometido em /servicos); LGPD e SSL
incluídos; Search Console, GA4 e Perfil da Empresa configurados; pagamento por etapa. NÃO há prazo em dias nem nome de cliente (não expor portfólio sem ordem). Schema: Service + OfferCatalog,
FAQPage (6), BreadcrumbList. 1º link do corpo é o WhatsApp de orçamento; depois
/blog/especialista-em-otimizacao-de-sites, /comprar-backlinks, /geo, /servicos.

**Why:** o produto de sites existia só como card em /servicos apontando para /contato; não havia
página indexável para o termo.
**How to apply:** preço muda só na constante `pacotes` do page.tsx (o schema lê dela). Re-medir no GSC em 30 e 60 dias; ver [[qmix-regra-primeiro-link]].
