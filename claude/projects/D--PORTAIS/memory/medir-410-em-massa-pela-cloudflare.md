---
name: medir-410-em-massa-pela-cloudflare
description: Testar milhares de URLs podadas pelo domínio devolve 000 em bloco, e o relatório diz que o 410 falhou quando ele está certo
metadata:
  type: reference
---

O `confere_poda.py` testa as URLs podadas pelo domínio. Com a Cloudflare na
frente, **3.599 pedidos em rajada viram `000` em bloco**: não é o 410 que
falhou, é a conexão que foi cortada. O relatório sai como "3.599 fora do 410",
com as mesmas URLs respondendo 410 quando pedidas uma a uma.

**Why:** o falso negativo é total, não parcial, então parece defeito grave de
vhost e leva a mexer numa regra que está correta.

**How to apply:** o pedido vai com `--resolve` para o IP da máquina, que é onde
a regra do 410 mora:

```
curl -sk --resolve dominio:443:77.37.69.175 https://dominio/<slug>/
```

⚠️ O contrário também engana: [[conferir-por-captura-usar-cache-busting]] e a
regra de que `--resolve` no IP devolve vazio para o que a Cloudflare serve de
cache. Para HTML medido depois da virada, medir pelo domínio; para 410 em massa,
medir na origem.

Serve também para saber que `pgrep -f <script>` **casa com o próprio laço de
espera** que o invoca: o `until ! pgrep -f x; do sleep; done` nunca termina, e
parece que o trabalho ainda está rodando quando ele nem começou.
