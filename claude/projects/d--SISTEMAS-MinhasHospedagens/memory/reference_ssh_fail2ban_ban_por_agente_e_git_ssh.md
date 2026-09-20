---
name: ssh-fail2ban-ban-por-agente-e-git-ssh
description: "fail2ban do opengravity e do srv1166087 bane o IP do operador quando o ssh oferece chaves demais (agente cheio) ou quando o python usa o ssh do Git, que cai em senha; IdentitiesOnly + caminho absoluto do OpenSSH do Windows; desban via -J clinicas-vps"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-19T23:24:38.460Z
---

Em 19/09/2026, no meio da rodada de insercoes do seuguiadesaude, opengravity e
hostinger-vps-srv1166087 fecharam a porta 22 para o IP do operador (177.223.38.9).
Nao era queda de host: `Test-NetConnection` mostrava ping OK e TCP 22 fechado, e
de dentro da clinicas-vps as duas portas abriam. Era o fail2ban (jail sshd,
maxretry 5, findtime 10m, bantime 1h, mais jail recidive).

Duas causas, as duas do lado do cliente:

1. **Agente com chaves demais.** O `~/.ssh/config` do opengravity so tinha
   `IdentityFile ~/.ssh/id_ed25519_vps` e nao tinha `IdentitiesOnly yes`; as
   chaves privadas nao existem em disco (so .pub), estao no agente do Windows
   (KeePassXC). Sem IdentitiesOnly o ssh oferece TODAS as chaves do agente; ao
   entrar a decima chave (id_ed25519_railway_renato, 18:43 daquele dia) o sshd
   passou a logar "maximum authentication attempts exceeded" a cada conexao e o
   fail2ban baniu. Corrigido: `IdentitiesOnly yes` em todo Host que nomeia chave
   (opengravity, renato-novo, hostinger-mariana ganharam a linha; os outros ja
   tinham).
2. **Python resolve `ssh` para o do Git.** No bash, `ssh` e um wrapper em
   `~/bin/ssh` que chama `C:/Windows/System32/OpenSSH/ssh.exe` (o unico que
   enxerga o agente do Windows). `subprocess.run(["ssh",...])` em python resolve
   `C:\Program Files\Git\usr\bin\ssh.EXE`, que nao tem a chave, cai em
   `password` e gera "Failed password for root" em serie, que e exatamente o que
   o fail2ban conta. Por isso o `inserir_final.py` (casasderecuperacao) e o
   `inserir_link.py` da skill aumentar-da-dr agora chamam
   `C:/Windows/System32/OpenSSH/ssh.exe` e `.../scp.exe` pelo caminho absoluto.

**Como desbanir sem esperar 1h:** `ssh -J clinicas-vps opengravity
'fail2ban-client set sshd unbanip IP; fail2ban-client set recidive unbanip IP'`
(idem para hostinger-vps-srv1166087). O ProxyJump autentica com as chaves
locais, entao nao precisa de chave na clinicas-vps. `ignoreip` do jail.local do
opengravity ainda lista so o IP antigo 177.200.37.63.

**How to apply:** todo script novo que chame ssh/scp de dentro do python usa o
caminho absoluto do OpenSSH do Windows; antes de rodar lote com dezenas de
conexoes, `ssh -v host echo ok 2>&1 | grep Offering` tem que mostrar UMA chave.
Se um lote comecar a dar `[host] ` vazio no log e `Connection timed out`, e ban,
nao rede: desbanir pelo jump e conferir o auth.log do alvo.
