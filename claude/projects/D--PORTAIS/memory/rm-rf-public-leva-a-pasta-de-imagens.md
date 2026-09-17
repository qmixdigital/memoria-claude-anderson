---
name: rm-rf-public-leva-a-pasta-de-imagens
description: "Limpar `public/*/` para reimportar apaga também img/, e a importação seguinte roda sem nenhuma imagem no disco"
metadata:
  node_type: memory
  type: feedback
---

Para refazer uma importação eu limpei o portal com:

```bash
rm -f data/*.json && rm -rf public/*/     # ← leva img/ junto
```

`public/*/` casa com **toda** subpasta, e `img/` é uma delas. A importação
seguinte rodou com o disco vazio de imagens, decidiu que nenhuma capa era
utilizável e removeu como "morta" toda imagem de corpo. O relatório mudou de
"468 sem imagem" para "898 sem imagem", e é só isso que denuncia.

**How to apply:** limpar só o que é gerado, preservando `img/`:

```bash
find public -mindepth 1 -maxdepth 1 -type d ! -name img -exec rm -rf {} +
```

E antes de aceitar o resultado da reimportação, comparar o número de artigos sem
imagem com o da passada anterior: se subiu, o disco foi limpo por engano.

Guardar o `tar` das imagens da origem até o fim da conversão, e não só até a
primeira importação: foi ele que permitiu restaurar em um minuto.
