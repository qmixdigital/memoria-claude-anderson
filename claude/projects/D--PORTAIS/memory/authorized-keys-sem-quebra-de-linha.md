---
name: authorized-keys-sem-quebra-de-linha
description: appendar chave em authorized_keys sem \n final solda duas chaves e derruba a que já funcionava
metadata:
  type: feedback
---

`echo "..." >> ~/.ssh/authorized_keys` **não** garante que a chave nova comece em
linha própria. Se o arquivo não terminava em `\n`, a chave nova gruda no fim da
última linha e as duas param de funcionar: a nova nunca autentica, e a antiga,
**que funcionava**, some junto.

Foi o que aconteceu ao liberar o backup da opengravity para a hostinger: a linha
virou `...cortes-ia-deployfrom="77.37.69.175",no-agent-forwarding,...`. O sshd
não acusa nada: responde `Permission denied (publickey)` e o log só diz
`Connection closed by authenticating user root ... [preauth]`.

**Why:** a mesma tentativa na clinicas-vps funcionou de primeira, porque foi a
segunda a ser appendada, depois de o arquivo já ter ganho o `\n`. Um lado
funcionando e o outro não parece problema de `from=`, de IP de saída ou de
`IdentitiesOnly`, e é onde se perde tempo.

**How to apply:** appendar com `printf '\n%s\n'`, ou ler e reescrever o arquivo
em Python garantindo o `\n` final. E, ao investigar chave recusada, **olhar o
`authorized_keys` inteiro** antes de mexer em restrição ou em opção de cliente:
`grep -n 'nome-da-chave' ~/.ssh/authorized_keys | cut -c1-140` mostra a solda na
hora. Relacionado: [[backup-do-motor-e-o-cofre]].
