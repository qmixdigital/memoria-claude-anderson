---
name: poda-na-origem-pode-nao-ter-rodado
description: "A Fase 4 apaga milhares de posts no WordPress e pode não ter rodado sem nada acusar; contar os posts na origem antes de desligar"
metadata:
  node_type: memory
  type: feedback
---

Na conversão do cameracotidiana, em 22/08/2026, a poda da Fase 4 **não chegou a
rodar**. Só apareceu na hora de desligar a origem: 3.179 posts publicados ainda
lá, quando deviam ser 1.117. Slugs que já respondiam 410 no motor continuavam
existindo no WordPress.

**Why:** nada acusa. O destino sai correto de qualquer jeito, porque a importação
é seletiva e leva só os preservados, e os podados já respondem 410 pelo
`gone.conf`. O site novo passa em toda auditoria com a origem intacta atrás.

**How to apply:** depois da Fase 4, contar na origem e comparar com o esperado,
antes de seguir:

```bash
wp post list --post_type=post --post_status=any --format=count --skip-plugins --skip-themes
for s in publish draft trash pending private future auto-draft; do
  echo "$s $(wp post list --post_type=post --post_status=$s --format=count --skip-plugins --skip-themes)"
done
```

E provar por amostra que um slug que devia sair de fato saiu:
`wp post list --post_type=post --post_status=any --name=<slug-podado> --format=count`
tem que devolver 0.

Vale também na ordem inversa: se o WordPress vai ser removido inteiro no fim, a
poda na origem perde o sentido, mas aí a **cópia de segurança antes de remover
passa a ser obrigatória** — dump do banco mais `wp-content/uploads`, porque o
inventário guarda o texto e não os arquivos de imagem dos apagados.

Ver [[apagar-artigo-checar-links]] e [[conversao-exige-redirects]].
