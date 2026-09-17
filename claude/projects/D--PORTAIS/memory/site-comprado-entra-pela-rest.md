---
name: site-comprado-entra-pela-rest
description: Comprar site de terceiro: puxar pela REST pública, sem backup e sem risco de vírus, e tirar o AdSense e os backlinks do dono anterior
metadata:
  type: project
---

Site comprado de terceiro, WordPress ainda na hospedagem do vendedor: **não
precisa de backup**. `wp-json/wp/v2/{posts,pages,categories,users}` entrega o
acervo inteiro em HTTPS, e o que desce é **JSON de texto** mais arquivo de
imagem. Nunca PHP, tema, plugin ou dump de banco, que é onde mora malware de
WordPress invadido. Feito assim no seuguiadesaude, 386 artigos, 7,8 MB.

O Yoast expõe `yoast_head_json` com `description` e `og_image` por artigo: é a
meta description pronta e a URL da imagem destacada, sem precisar de `_embed`.

**Duas coisas do dono anterior têm que sair, e nenhuma dá erro:**

- **o AdSense dele.** O site novo sobe bonito e fatura para a conta do vendedor.
- **os backlinks que ele vendeu.** Viram texto simples, sem mexer na frase.
  Citação de referência (Wikipedia, órgão público, sociedade médica) fica: ela
  sustenta o que o artigo afirma.

**Duas armadilhas medidas:** metade dos links internos do corpo apontava para
artigo que o próprio vendedor já tinha apagado, e 51 imagens respondem **404 na
origem**, apagadas do `uploads` com a referência viva no post. Conferir os dois
antes de dar a importação por boa. Ver [[adsense-na-migracao]],
[[link-interno-quebrado-gravado-no-conteudo]] e
[[imagem-hospedada-por-terceiro-no-corpo]].

⚠️ A REST **não traz rascunho nem lixeira**. Se interessarem, pedir acesso ao
painel antes de o vendedor desligar o site.
