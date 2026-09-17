---
name: script-copiado-carrega-o-portal-anterior
description: "Adaptar script da conversão anterior por substituição de nome deixa passar prefixo de arquivo, classe hasheada e regex mutilado"
metadata:
  node_type: memory
  type: feedback
---

Cada conversão reaproveita os scripts da anterior trocando o nome do portal. Três
coisas atravessam essa troca e não aparecem em erro nenhum:

**1. Prefixo do nome de arquivo de imagem.** As 468 imagens geradas do
curiosododia nasceram como `cct-...webp`, prefixo do cameracotidiana. Não quebra
nada, e é a mesma impressão digital que classe CSS repetida.
🔴 Ao renomear, mexer no **`image.file` do artigo**, e não só no `content`: ver
[[apagar-artigo-checar-links]]. Provar depois que nenhuma referência aponta para
arquivo inexistente.

**2. Classe hasheada cravada no auditor.** O auditor de linkagem tem o nome de
classe do portal anterior escrito no código. No portal novo ele classifica
**toda** página como "outra", e os itens de máximo de links e de teto de âncora
saem com **zero artigos**, o que parece aprovação. Descobrir as classes reais
antes de rodar, lendo o HTML publicado.

**3. Contrabarra de regex virando caractere de controle.** Gerar o script novo
com `s.replace(...)` dentro de string não-raw transforma `\b` em BACKSPACE
(0x08). A expressão deixa de casar e o contador diz zero. Montar com
`chr(92) + 'b'`, e conferir que o arquivo gravado não tem caractere de controle:

```python
maus = [i for i, l in enumerate(s.split(chr(10))) if any(ord(c) < 32 and c != chr(9) for c in l)]
assert not maus
```

Ver [[heredoc-come-contrabarra]] e [[classes-css-nao-podem-repetir]].
