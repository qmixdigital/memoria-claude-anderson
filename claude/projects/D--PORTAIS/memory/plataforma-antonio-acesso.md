---
name: plataforma-antonio-acesso
description: Onde fica e como se mexe na plataforma do Antônio (acesso.qmix.com.br) para trocar a chave de API de um portal
metadata: 
  node_type: memory
  type: reference
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T18:49:33.170Z
---

`acesso.qmix.com.br` é proxied na Cloudflare. A origem é **31.97.173.40**, que é o
alias `hostinger-vps-srv1166087`.

- App: `/home/boot/web/acesso.qmix.com.br/public_html`
- Banco: **MySQL `boot_qmixmarketplac`** (tabelas `wp_sites`, `wp_categories`,
  `publish_schedule`), acessível só como root
- Cripto da chave: `<<REMOVIDO>>`, AES-256-CBC, funções
  `encryptApiKey` e `decryptApiKey`

O PHP roda como `sudo -u boot`, mas o `mysql` só responde como root. Para conferir
a chave gravada, root escreve o valor num arquivo e o PHP do `boot` lê o arquivo;
encadear `shell_exec('mysql ...')` dentro do PHP falha com "Access denied".

Não é Laravel nem Postgres: `/var/www/qmix-next` é outro sistema (marketplace,
Next.js + Drizzle) e não tem `wp_sites`. Ver [[conversao-total]].
