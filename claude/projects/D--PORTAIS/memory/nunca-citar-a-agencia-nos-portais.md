---
name: nunca-citar-a-agencia-nos-portais
description: "Portais da rede jamais podem citar a QMIX, linkar para o site dela ou repetir qualquer assinatura comum"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T15:22:25.891Z
---

**Nenhum portal da rede pode conter menção à QMIX, link para o site dela, ou
qualquer assinatura que se repita entre os sites.** Nada de "Publicado por",
"Desenvolvido por", crédito de agência, e-mail institucional visível ou selo no
rodapé.

Anderson foi explícito em 15/08/2026, depois que eu coloquei
`Publicado por QMIX Digital` com link para `qmix.com.br` no rodapé do
agencianacionaldenoticias.com ao refazer o layout.

**Why:** é uma **rede de backlinks**. Assinatura repetida no rodapé é o rastro
mais fácil de seguir que existe: basta buscar a frase entre aspas no Google para
listar a rede inteira. Isso anula todo o trabalho anti-fingerprint do motor
(classes com hash por site, arquiteturas distintas, paletas próprias), porque
nenhum daqueles cuidados importa se o rodapé entrega o conjunto.

**How to apply:**

- Ao escrever ou editar qualquer arch, rodapé, página institucional ou texto
  gerado pelo motor, **não invente crédito de autoria**. Se o rodapé precisar de
  um segundo elemento além do copyright, use algo próprio do portal, como o
  domínio.
- Antes de dar um portal por pronto: `grep -ri 'qmix' public/` deve retornar
  **apenas** artigos com backlink editorial no corpo do texto.
- **Backlink dentro de artigo é diferente e não se toca.** Ex.: um link para
  `qmiximoveis.com.br` no meio de uma matéria é o produto vendido. Apagar
  destruiria o que o cliente pagou. O que é proibido é a assinatura de rodapé,
  repetida em todos os sites.
- Vale para qualquer marca comum, não só a QMIX: se o texto se repetiria igual
  em dois portais e identifica o dono, não entra.

**Pendência conhecida:** `resendFrom` no `sites.json` é `marketing@qmix.com.br`,
então o formulário de contato de **todos** os portais envia com esse remetente.
Não sai no HTML, mas quem preencher o formulário em dois portais vê o mesmo
domínio. Resolver exige domínio de envio verificado no Resend.

Relacionado: [[contato-portais-destino]]
