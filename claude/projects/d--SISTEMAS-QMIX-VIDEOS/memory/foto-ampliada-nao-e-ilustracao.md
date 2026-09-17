---
name: foto-ampliada-nao-e-ilustracao
description: Foto de arquivo real ampliada por IA entra sem tarja; imagem gerada por IA entra com tarja de ilustração
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T10:59:21.788Z
---

**Ampliar foto real por IA não é criar imagem.** Ela entra como foto de
arquivo, **sem** tarja. Imagem **gerada** por IA entra com a tarja
"Ilustração" no ar durante o plano inteiro.

Decidido no vídeo 05, em 24/08/2026. O Anderson mandou seis imagens de uma vez:
quatro geradas no ChatGPT (bomba de álcool dos anos 80, carro elétrico
carregando no Rio, milho ligado a um carro pela tomada) e uma que era a foto
real dele, de 380px, ampliada para 1501px. Conferi a ampliada contra o
original e é a mesma cena, o mesmo enquadramento: é a foto dele, maior.

**Why:** a tarja existe para o espectador saber que aquilo não aconteceu. Numa
foto real ampliada, aquilo aconteceu; o que mudou foi a resolução. Marcar como
ilustração seria mentir na direção contrária, e ainda jogaria fora a
credibilidade do único registro de arquivo daquele momento.

**How to apply:** antes de decidir a tarja, comparar a ampliada com o original
que ele mandou antes. Mesma cena = foto, sem tarja. Cena que não existe = com
tarja. No `montar_planos.py` do projeto isso é o nome da pool: quem começa com
`ilustra` ganha a tarja sozinho, pelo id do plano, sem cravar segundo nenhum.

Ele mandou a regra da tarja assim: "As ilustrações por IA você deve usar e
colocar que é ilustração feita por IA."

Relacionado: [[commons-por-objeto-nao-conceito]], [[procedencia-de-imagem-decidida]].
