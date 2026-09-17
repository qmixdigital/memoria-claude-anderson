---
name: copia-de-script-traz-o-portal-anterior
description: Cada script de conversão nasce de cópia e carrega dados do portal anterior que a troca de slug não alcança
metadata:
  type: feedback
---

Trocar o nome do portal no script copiado **não** troca o que está dentro dele.
Casos já vistos, todos numa conversão só:

- **`malha_<portal>.py`**: montava `/<editoria>/<slug>/` num portal de URL plana,
  e criou 1.728 links internos para 404 de uma vez
- **`avatar_<portal>.py`**: uma das assinaturas sairia com o gênero trocado
  (`man in his sixties` para uma mulher), e os três retratos na paleta do portal
  anterior
- **`imgs_<portal>.py`**: o rodízio de cenas trazia as editorias do vizinho, e as
  do portal novo cairiam todas na cena de reserva
- **`deploy_<letra>.py`**: a linha da tabela `ARCHS` com as funções da vizinha
- **`audita_links_<portal>.py`**: a classe hasheada do corpo do vizinho, o que
  devolve zero e parece aprovação

**Why:** nenhum desses erra em voz alta. O script roda, reporta números
plausíveis, e o defeito só aparece na captura de tela ou numa auditoria feita
depois do rebuild.

**How to apply:** ao copiar, ler o corpo inteiro procurando **dado**, e não só
nome: formato de URL (que sai do `sites.json`, ver
[[malha-copiada-usa-url-do-portal-anterior]]), lista de editorias, nomes e gênero
das assinaturas, paleta, classe hasheada e a linha da tabela de arquiteturas
([[deploy-de-arch-aponta-para-a-vizinha]]).
