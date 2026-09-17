---
name: zona-cloudflare-fora-das-contas
description: Domínio com nameserver da Cloudflare cuja zona não está em nenhuma das 35 contas do contas.json; duas contas têm token inválido
metadata:
  type: project
---

O `incast.com.br` responde pelos nameservers `daphne.ns.cloudflare.com` e
`everton.ns.cloudflare.com`, mas a zona **não aparece em nenhuma das 35 contas**
do `D:\SISTEMAS\Cloudflare\contas.json`.

**Why:** o token "master" é de usuário e cobre 350 zonas, o que dá a impressão de
cobrir tudo. Não cobre. E `?name=<dominio>` devolve **vazio**, não erro, quando a
zona está fora do alcance do token: parece que o domínio não está na Cloudflare.

**How to apply:** `acha_zona.py <dominio>` percorre as 35 contas e diz onde a zona
está, ou que não está em nenhuma. Rodar **antes** de começar a virada, e não no
meio dela.

⚠️ **`conta11` e `conta25` respondem `401 Invalid API Token`.** A zona
provavelmente é de uma das duas: `f554283e1bb09f7be42a2a26d41d1e71` e
`e1afd354b17fd5c336f44c6095f41081`. Enquanto o token não for renovado, não dá
para trocar registro A nem modo de SSL desses domínios.

Ver [[cloudflare-zone-id-por-dominio]] e [[cloudflare-purge-token-de-conta]], que
dizem que o token de conta cobre tudo: **cobre as contas que ele conhece**.
