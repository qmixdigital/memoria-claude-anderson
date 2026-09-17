---
name: recolorir-logo-por-luminancia
description: A versão clara do logotipo separa por luminância, nunca por faixa de RGB, senão a borda suavizada vira mancha
metadata:
  type: feedback
---

Para fazer a versão clara de um logotipo de duas cores, a regra é **separar por
luminância**, e não por faixa de RGB.

**Why:** a borda suavizada das letras tem pixels no meio do caminho entre as duas
cores da marca. Uma condição do tipo `r < 170 and g < 90 and b < 80` pega parte
desses pixels e deixa o resto, e a palavra sai **salpicada**. Aconteceu no
"Blog" do Popular Blog: virou uma mancha de pontos brancos.

**How to apply:**

```python
luma = 0.2126*r + 0.7152*g + 0.0722*b
if luma < 60 and r < 130:          # o tom PROFUNDO vira branco
    px = (255, 255, 255, a)
elif r > 130 and g < 120:          # o tom colorido so CLAREIA, nao troca
    px = (min(255,int(r*1.25)), min(255,int(g*1.35)+40), min(255,int(b*1.35)+30), a)
```

⚠️ **Clarear é melhor do que trocar** no tom colorido: multiplicar preserva a
gradação da borda, e substituir por uma cor fixa cria degrau.

Sempre conferir o resultado colado sobre o fundo real do rodapé, e não sobre
cinza. Ver [[marca-tem-duas-cores]] e [[logo-da-origem-antes-de-inventar]].
