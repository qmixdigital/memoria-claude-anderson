---
name: checklist-do-pacote-editorial
description: "Os cinco pontos do pacote editorial que o checklist automático não pegava, e como conferir"
metadata:
  type: feedback
---

Antes de dar um portal por pronto, conferir estes cinco itens. Nenhum deles
aparecia no checklist de SEO, e os cinco estavam falhando na rede em 19/08/2026:

1. **`og:image` na home e nas páginas de lista.** O motor tinha `image: null` em
   `homeMeta` e `listMeta`, então a home compartilhada saía sem miniatura.
2. **`ProfilePage` + `Person` + `worksFor` na página de autor.** Sem isso a
   assinatura é enfeite: não vira sinal de E-E-A-T.
3. **Avatar ilustrado** em `/img/autores/<slug>.webp`, que é o caminho que a rede
   já usava, e a página de equipe em cartão (`.eq-area` / `.eq-card`).
4. **Toda assinatura de `equipe` precisa da `extraPage` `autor/<slug>`.** Sem ela
   o `rel="author"` do artigo aponta para 404.
5. **Nenhum artigo pode estar assinado com o nome do portal.** Conteúdo legado
   vinha assim e ficava sem `rel="author"`, sem página e sem `Person`.
6. **Equipe e política editorial precisam de link no rodapé.** As páginas tinham
   `inFooter: true` no `sites.json` e dois dos três motores não liam a marca, então
   34 portais publicavam o pacote sem nenhum link apontando para ele.

**Como conferir:** o script `audita_editorial.py` do scratchpad roda no servidor e
imprime uma linha por portal com estes itens mais banner LGPD e travessão na
página de contato. Rodar antes de entregar.

**O padrão do defeito:** nos seis itens, o recurso existia e não estava ligado. Conferir o caminho inteiro, do dado até o HTML, e não só se a página responde 200.

**Por quê:** o Anderson percebeu de olho que faltava detalhe na equipe editorial e
mandou consultar as regras do início do projeto e verificar os outros portais. A
auditoria confirmou os cinco pontos. Ver [[pacote-editorial-eeat]],
[[banner-lgpd-e-og-image]] e [[criar-categoria-quando-faltar]].
