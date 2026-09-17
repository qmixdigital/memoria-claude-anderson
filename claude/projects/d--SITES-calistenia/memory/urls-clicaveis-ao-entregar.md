---
name: urls-clicaveis-ao-entregar
description: "Ao terminar qualquer entrega que publique ou altere páginas, listar as URLs completas e clicáveis para conferência"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f9f887f3-9d16-4799-a2d7-aabad975902e
  modified: 2026-08-27T11:30:48.725Z
---

Sempre que uma entrega publicar, alterar ou tirar do ar alguma página, terminar
a resposta com a lista das URLs completas (`https://...`), clicáveis, para ele
conferir o conteúdo no navegador.

**Why:** ele confere o resultado olhando a página, não lendo o resumo. Sem o
link ele precisa montar a URL na mão a partir do slug que eu citei no texto, o
que é atrito em toda entrega. Ele já disse que os resumos longos não são lidos;
o link é o que ele de fato usa.

**How to apply:** listar as URLs de tudo que mudou, não só do que foi criado, e
incluir também as páginas que passaram a linkar para as novas quando a malha
interna fizer parte da entrega. URL completa com domínio, nunca só o slug nem
caminho relativo. Vale para o site publicado e para artefatos publicados
([[artefatos-em-vez-de-scrollback]]).
