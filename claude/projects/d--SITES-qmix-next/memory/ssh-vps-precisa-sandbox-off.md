---
name: ssh-vps-precisa-sandbox-off
description: "SSH/scp ao VPS srv1166087 (31.97.173.40) exige dangerouslyDisableSandbox no Bash — timeout na porta 22 é o sandbox, não ban"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1fd069cc-adc6-40a6-b42a-d8c4da125a1f
  modified: 2026-08-04T14:17:51.950Z
---

Ao conectar via `ssh`/`scp` no VPS da rede QMIX (`hostinger-vps-srv1166087` / `31.97.173.40`, porta 22), o Bash tool **precisa rodar com `dangerouslyDisableSandbox: true`**. Sem isso, a conexão à porta 22 dá `Connection timed out` — o sandbox de rede do ambiente bloqueia/roteia a saída direta ao IP do VPS de forma diferente do terminal real do usuário.

**Why:** em 2026-08-04 gastei ~30 min achando que era fail2ban/ban de IP e pedindo pro usuário liberar IP. O usuário apontou que tinha acabado de deployar no MESMO servidor sem problema. Testar com o sandbox desligado conectou de primeira (`SSH_OK`). Erro era meu, não da segurança dele.

**How to apply:** se `ssh hostinger-vps-srv1166087` der timeout, NÃO assuma ban nem peça pra liberar IP — refaça o comando com `dangerouslyDisableSandbox: true` antes de qualquer outra hipótese. Vale para todo ssh/scp/curl direto ao IP do VPS. curl a domínios via Cloudflare (qmix.com.br) funciona no sandbox normal; o problema é conexão direta ao IP/porta 22. Relacionado: [[qmix-server-actions-multiinstancia]].

Atualização 19/09/2026: se o sandbox já está desligado e o timeout é intermitente (volta sozinho em minutos), é bloqueio de IP por excesso de conexões, ver [[ssh-cofre-e-fail2ban]].
