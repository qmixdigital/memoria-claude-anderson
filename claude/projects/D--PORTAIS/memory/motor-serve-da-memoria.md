---
name: motor-serve-da-memoria
description: Apagar o JSON e o HTML não tira o artigo do ar; o motor serve da memória pelo proxy de reserva do nginx
metadata:
  type: project
---

Apaguei o `data/*.json` e o diretório renderizado de um artigo de teste no
qmixdigital, reconstruí o portal, purguei a Cloudflare, e ele **continuou
respondendo 200 na origem**, com título e corpo corretos.

**Why:** o vhost termina em `try_files $uri $uri/ $uri/index.html @oldredir`, e
`@oldredir` manda para o motor na 8791. O motor tem os artigos em memória e
renderiza sob demanda, então o arquivo sumir do disco não muda nada para ele.

**How to apply:**
- Depois de apagar artigo, `systemctl restart portal-engine` **antes** de conferir.
  Sem isso o teste dá 200 e parece que a exclusão falhou.
- A ordem certa é: apagar o JSON, apagar o diretório de `public/`, liberar o slug
  em `/srv/portais/_dedup/owners.json`, reiniciar o serviço, reconstruir, purgar.
- Vale também para a conferência de poda: ver [[poda-por-backlink-conferir-antes]].
- Não confundir com cache de borda. Se a **origem** já responde certo e o domínio
  não, aí sim é Cloudflare, e purga dirigida por URL resolve mais rápido que
  `purge_everything`.
