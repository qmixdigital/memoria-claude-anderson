---
name: vhost-le-tmp-do-portal-anterior
description: O script do vhost lê dois arquivos de /tmp cujo caminho não leva o slug no nome do script, e sobrevive à cópia
metadata:
  type: feedback
---

O `vhost_<pre>.py` lê duas listas:

```python
vivos = set(... io.open('/tmp/<pre>-publicos.txt'))
slugs = [... io.open('/tmp/<pre>-slugs410.txt')]
```

**Why:** trocar o slug do portal no `sed` **não** troca esses dois caminhos, porque
eles não aparecem no mesmo formato do resto. No universoneo o 410 saiu, na
primeira tentativa, com a lista do **diariopernambucano**: 2.457 URLs erradas em
410 e as 4.865 certas respondendo 404.

E nada acusa. O `nginx -t` passa, o vhost sobe, as rotas institucionais respondem
200. **Só a contagem denuncia**: o script imprime "slugs em 410: N", e N tem que
bater com o número da poda.

**How to apply:** depois de gerar o `vhost_<novo>.py`, conferir:

```bash
grep -n "/tmp/" vhost_<novo>.py
```

e testar **o primeiro slug da lista** contra o portal: tem que voltar 410, não 404.

Ver [[copia-de-script-traz-o-portal-anterior]] e
[[script-copiado-carrega-o-portal-anterior]], que são a mesma armadilha em outros
arquivos.
