---
name: news-sitemap-vazio-da-erro
description: "Enviar o news-sitemap ao Search Console quando o acervo não tem artigo recente devolve 1 erro permanente"
metadata:
  node_type: memory
  type: project
---

O motor sempre grava `news-sitemap.xml`, mas ele só inclui artigo dentro da
janela do Google News, de cerca de dois dias. Em portal **recém-convertido** o
artigo mais recente do acervo preservado costuma ser mais velho que isso, e o
arquivo sai assim:

```xml
<urlset xmlns=...>
</urlset>
```

Sem nenhuma `<url>`. O Search Console baixa, não encontra entrada e registra
**1 erro**, que fica lá até alguém reenviar.

**Regra:** na virada, enviar só o `sitemap.xml`. O `news-sitemap.xml` entra
depois que a plataforma do Antônio publicar o primeiro conteúdo novo, o que
acontece sozinho em portal ativo. Conferir antes:

```bash
curl -s SITE/news-sitemap.xml | grep -c '<url>'
```

Aconteceu no azulmagazine em 21/08/2026 (artigo mais novo de 19/08). No advivo
não aconteceu porque lá o mais recente era do dia anterior.

⚠️ E, sempre, **ler o campo `errors` do `sitemaps().get()` depois de enviar**, e
não só conferir se o envio deu certo: ver [[data-do-wordpress-nao-e-iso]].
