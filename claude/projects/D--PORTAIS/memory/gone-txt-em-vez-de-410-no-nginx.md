---
name: gone-txt-em-vez-de-410-no-nginx
description: "Nos servidores antigos o 410 sai de um gone.txt lido pelo receptor, não de blocos location no nginx"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-16T18:22:38.235Z
---

Na clinicas-vps os 410 das URLs podadas são blocos `location` no vhost. Isso
funciona para 5.509 slugs. Nos servidores antigos a poda gerou **18.711**, e
escrever isso como regex de nginx dobraria o tamanho de 19 vhosts e faria cada
requisição varrer milhares de padrões.

Lá o mecanismo é outro: cada portal tem `/srv/portais/<slug>/gone.txt`, um slug
por linha, e o **receptor** responde 410 para o que estiver na lista. É O(1) por
requisição e a lista dá para conferir a olho.

Duas coisas que fazem isso funcionar e que não são óbvias:

1. O vhost precisa terminar em `try_files ... @oldredir`, e não `=404`. Cinco
   dos treze vhosts do srv1166087 usavam `=404` e nunca chegavam no receptor.
2. O bloco `@oldredir` **não** pode ter `proxy_intercept_errors on`: com ele
   ligado o nginx troca a resposta do receptor pela página de erro dele, e o 410
   volta a ser 404.

Conferência que prova que está certo: URL apagada dá **410**, URL que nunca
existiu dá **404**, home dá **200**.

Ver [[tres-instancias-do-motor]] e [[apagar-artigo-checar-links]].
