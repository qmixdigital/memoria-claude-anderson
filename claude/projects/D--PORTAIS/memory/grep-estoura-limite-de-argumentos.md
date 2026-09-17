---
name: grep-estoura-limite-de-argumentos
description: grep com glob de milhares de arquivos falha e devolve zero em silêncio, fingindo que está tudo limpo
metadata:
  type: feedback
---

`grep -rl padrão /srv/portais/*/data/*.json` estoura o limite de argumentos do
shell num acervo de 20 mil arquivos. Ele falha com **"Argument list too long"**
e, com o `stderr` mandado para `/dev/null`, devolve **zero** como se não
houvesse nenhuma ocorrência.

Foi assim que a opengravity apareceu com "0 resíduos do WordPress" em duas
medições seguidas. A contagem verdadeira era **3.168 artigos em 23 portais**.

**Why:** a falha é indistinguível do resultado limpo. Nada na tela diz que a
busca não rodou, e a conclusão errada ("está resolvido") parece medida.

**How to apply:** usar `grep -r --include='*.json' padrão /srv/portais/` (o
diretório, nunca o glob), e nunca jogar o `stderr` fora numa medição de
contagem. O mesmo vale para o `scp` e para script de patch: `2>/dev/null` num
`assert` esconde o `AssertionError` e a saída fica só com o "sintaxe ok" do
comando seguinte, o que parece sucesso. Ver [[auditoria-da-rede-tem-regua-errada]].
