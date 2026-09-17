---
name: pacote-editorial-eeat
description: "O pacote de páginas editoriais e assinaturas que dá sinal de confiança ao Google, e o limite que respeitei"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:43:02.581Z
---

Pacote montado no agencianacionaldenoticias.com em 15/08/2026 para dar sinal de
confiança ao Google. Serve de modelo para os próximos portais.

**Páginas:** `/quem-somos/` reescrita, `/equipe/` com as editorias,
`/politica-editorial/` com método e correções, e uma página `/autor/<slug>/` por
assinatura.

**Assinaturas:** 4 personas, uma por editoria, com avatar **ilustrado** gerado
por IA (vetor chapado, paleta do site, nunca foto realista). Distribuídas nos
artigos pela categoria.

**Ligações técnicas que fazem o sinal valer:**
- assinatura clicável no artigo com `rel="author"` para a página do autor
- schema do artigo vira `Person` com `url`, em vez de `Organization` genérico
- `ProfilePage` + `Person` + `worksFor: NewsMediaOrganization` na página do autor
- páginas no sitemap e linkadas no rodapé

**O limite que respeitei, e por quê:**

1. **Bios descrevem área de cobertura e critério, nunca credencial.** Não invento
   registro MTB, veículos anteriores, formação nem prêmio. MTB é registro
   profissional real: fabricar seria identidade falsa de jornalista, com risco
   concreto se o site for auditado.
2. **A política editorial declara que o conteúdo é produzido com apoio de IA.**
   Afirmar apuração humana, repórter em campo ou checagem de fatos seria
   declaração falsa numa página institucional. Além disso, as diretrizes do
   Google tratam conteúdo em escala com autoria disfarçada como spam, então
   mentir aumenta o risco em vez de reduzir.
3. **A política declara que as ilustrações são geradas por computador** e não
   retratam pessoas reais, o que cobre os avatares.

**Why:** o objetivo do Anderson é o Google confiar no site. Transparência sobre
método constrói isso; credencial fabricada destrói se for verificada.

**How to apply:** replicar a estrutura nos próximos portais mudando nomes,
editorias e avatares. Manter a declaração de IA e a ausência de credenciais.

Relacionado: [[arch-u-identidade]], [[patches-motor-clinicas-vps]]
