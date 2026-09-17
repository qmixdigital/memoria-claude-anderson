---
name: feedback-link-interno-nunca-antes-do-cliente
description: Em guest post, nenhum link interno pode aparecer antes do link do cliente, e a secao Leia tambem vai sempre no fim
metadata:
  type: feedback
---

Em guest post, **nenhum link interno pode aparecer antes do link do cliente**, e
**sempre existe uma secao "Leia tambem" no fim** do artigo.

**Why:** o cliente paga pelo link e nao aceita concorrencia de links antes dele
na pagina. Alem do argumento comercial, o primeiro link do conteudo e o que
concentra atencao e passagem de autoridade.

**How to apply:**

1. No texto que eu escrevo, o link do cliente vem primeiro. Isso e a parte
   facil e eu ja fazia.
2. **O motor tambem insere links, e e ai que escapa.** O portal-engine injeta um
   bloco de relacionados logo depois da assinatura do autor, ANTES do corpo. Em
   01/09/2026 os tres posts da Dra. Mariana sairam com tres links internos cada
   antes do link do cliente por causa disso.
3. **Conferir com regex que pegue link RELATIVO tambem.** Minha primeira
   auditoria procurou so `href="https://dominio/..."` e concluiu, errado, que
   estava tudo certo. O bloco do motor usa `href="/slug/"`. O operador viu na
   pagina o que a minha checagem nao viu.

Verificacao correta, recortando o corpo entre `<h1` e `<footer>`:

```python
pos_cli = corpo.find("dominio-do-cliente")
for m in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', corpo, re.S):
    if m.start() < pos_cli and not href.startswith("#"):
        print("LINK ANTES DO CLIENTE:", href)   # inclui relativo
```

**Uma unica secao de links internos, com DOIS links, no fim.** O portal-engine
monta ate tres blocos por conta propria e o guest post acaba com secao demais.

Como ficar com uma so: a funcao `_leiaTambemNoMeio` do motor comeca com
`if (c.indexOf("pe-leia-meio") >= 0) return c;`. Entao **a minha secao do fim
leva `class="pe-leia-meio"`** e o motor desiste de injetar a dele no meio do
texto. Vale por artigo, sem mexer na configuracao do portal:

```html
<aside class="pe-leia-meio"><p><strong>Leia também</strong></p><ul>
  <li><a href="...">Titulo do primeiro</a></li>
  <li><a href="...">Titulo do segundo</a></li>
</ul></aside>
```

**Duas coisas que NAO da para forcar, e nao sao defeito:**

- **O rotulo muda por portal.** O motor sorteia entre "Leia também", "Veja
  também", "Relacionado", "Vale ler" e outros. E o sistema anti-footprint da
  rede: forcar a mesma palavra em todos os portais e justamente o que a
  diversificacao existe para evitar.
- **Alguns portais tem um bloco estrutural de categoria** ("Veja também em
  Doenças" no seuguiadesaude), que aparece em TODO artigo do site. Tirar so no
  guest post exigiria mexer no tema e deixaria o post diferente dos demais.

Sobra antes do link do cliente apenas a **assinatura do autor** (`/autor/...`),
que e linha de credito e sustenta o sinal de autoria. Nao e link editorial
concorrendo.

Ver tambem [[feedback_padrao_links_guest_post]] e
[[reference_runbook_backlinks_clientes]].
