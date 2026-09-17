---
name: artigo-de-teste-deixa-rastro-nas-vizinhas
description: "Publicar teste pela API reescreve o bloco de relacionados de dezenas de páginas; apagar o teste depois não as limpa"
metadata:
  node_type: memory
  type: feedback
---

Publicar um artigo de teste pela rota do Antônio faz o motor **reescrever o bloco
"Leia também" das páginas vizinhas da mesma editoria**. Apagar o JSON e o
diretório do teste em seguida remove a página, mas **não** os links que as
vizinhas ganharam para ela.

No curiosododia foram **133 páginas** apontando para um teste apagado, todas
respondendo 200 e todas com um link para 404 dentro. Só a auditoria da Fase 9
pegou, como "link interno para página inexistente".

**How to apply:** depois de apagar um artigo de teste, **reconstruir o portal**,
e não só reiniciar o motor:

```bash
rm -rf data/<slug>.json public/<editoria>/<slug>
systemctl restart portal-engine
runuser -u portais -- node /tmp/reb.js <slug-do-portal>
nginx -s reload
grep -rl "<slug-do-teste>" public --include=index.html | wc -l   # tem que dar 0
```

É o irmão de [[motor-serve-da-memoria]] e de [[apagar-artigo-checar-links]]:
apagar o arquivo nunca basta.

Vale a varredura genérica nos portais da máquina, que acha qualquer destino
interno morto e não só rastro de teste. ⚠️ Ela dá **falso positivo** onde o
caminho é servido por outro aplicativo atrás do nginx: `/agenda/` no euvo e
`/ferramentas/` no qmixdigital respondem 200 e não estão no disco do motor.
Confirmar por HTTP antes de chamar de defeito.
