---
name: no-text-nao-impede-texto-na-imagem
description: O FLUX escreve garatuja mesmo com "no text" no prompt, quando a cena pede objeto que carrega texto no mundo real
metadata:
  type: reference
---

`no text, no words, no letters, no watermark` no prompt **não basta**. Quando a
cena pede um objeto que no mundo real carrega texto (rótulo de frasco, tela
ligada, caderno aberto, jornal, lombada de livro, placa), o FLUX desenha garatuja
legível de longe e ilegível de perto. No desassossegada foram para o ar frascos
escritos "POWELE", "PONETET" e "SAMEGASE", na home.

**Why:** contraria a regra de nunca inserir texto em imagem gerada por IA, e o
defeito só aparece na captura de tela, nunca em auditoria de HTTP.

**How to apply:** a correção não é repetir a proibição, é **tirar o objeto que
pede texto** — frasco sem rótulo (`plain unlabelled bottles`), caderno fechado,
tela apagada (`blank dark screen`), livro de capa fechada, lombadas desfocadas.
Das 95 cenas do gerador do desassossegada, 36 tinham esse risco.

⚠️ Para refazer só as certas é preciso separar a imagem gerada da imagem da
origem, e **o nome do arquivo não serve**: 38 imagens vindas da origem também
tinham o nome igual ao slug. O que separa é a data do arquivo.
