---
name: apagar-pasta-pelo-caminho-do-motor
description: apagar a pasta publicada pelo caminho da URL de origem deixa o index.html no disco, e a auditoria de link passa a mentir
metadata:
  node_type: memory
  type: feedback
---

Ao apagar artigo do motor são duas coisas: o JSON em `data/` e a pasta em
`public/`. A pasta tem que ser localizada pelo **caminho que o motor serve**, e
não pelo caminho da URL de origem. Onde os dois diferem, o JSON sai e o
`index.html` fica.

O visitante não vê nada errado, porque o `return 410` do vhost é avaliado antes
do `try_files`. O estrago é indireto e pior:

- **a auditoria de linkagem passa a mentir.** Um link do corpo apontando para a
  página apagada parece válido, porque o arquivo existe no disco; só a medida ao
  vivo denuncia o 410. Foi assim que 4 links quebrados no advivo e no
  azulmagazine sobreviveram a uma varredura que disse "zero"
- se a regra de 410 for reescrita um dia, a página volta ao ar sozinha

**Why:** o `apaga_referencia.py` usava `urlsplit(a['url']).path`, que é a URL do
WordPress, e não `/<editoria>/<slug>/` do motor.

**How to apply:** montar o caminho a partir do dado do próprio motor
(`category.slug` mais `slug`, respeitando `flatUrl`), e depois varrer o `public`
procurando pasta de artigo sem JSON correspondente.

⚠️ **Ausência de JSON não basta para remover a pasta.** O mapa do site que o motor
gera tem slug tirado de um hash do nome do portal, não aparece em `extraPages` e
não tem JSON nenhum: numa primeira versão o `/indice-geral/` do cameracotidiana
entrou na lista de órfãos. Exigir **duas condições**: sem JSON **e** condenado
por uma decisão explícita, seja a lista de poda, seja o 410 do vhost. Ver
[[editoria-vazia-deixa-listagem-velha]] e [[motor-serve-da-memoria]].
