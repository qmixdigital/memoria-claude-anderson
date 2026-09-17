---
name: blog-wordpress-hospedagem
description: "Onde fica o WordPress do blog.coegoiania.com.br (mesma VPS do site Next, mas sob HestiaCP)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a670a00-268d-4459-8229-64d391a54505
  modified: 2026-08-13T10:32:45.687Z
---

O `blog.coegoiania.com.br` (WordPress) roda na **mesma VPS** do site Next (`hostinger-vps-srv1166087` / 31.97.173.40), mas **fora do nginx `/etc/nginx/conf.d/`** — é um vhost do **HestiaCP**:

- Docroot: `/home/boot/web/blog.coegoiania.com.br/public_html`
- Vhost: `/home/boot/conf/web/blog.coegoiania.com.br/{nginx,apache2}.conf`
- wp-cli: `sudo -u boot php <docroot>/wp-cli.phar --path=<docroot>`
- Prefixo das tabelas: `wp_lFw7A_` (NÃO é `wp_`) — usar `wp db prefix` antes de qualquer SQL
- Mesma zona Cloudflare do site principal (purge da zona atinge os dois)
- `pngquant` e `optipng` instalados nessa VPS (jul/2026) para otimizar imagens no lugar
- **Arquivos de autor (`/author/*`) são desativados de propósito** pelo mu-plugin `author-privacy.php` (anti-enumeração de usuário): fazem 301 para a home. NÃO é bug. O `author-link-perfil.php` reaponta os links de autor para o campo "Site" do usuário (a página do médico em coegoiania.com.br).
- Editar PHP na VPS **por base64**, nunca por heredoc dentro de `ssh '...'`: o aninhamento de aspas come as aspas simples do PHP e derruba o site com fatal error (aconteceu em ago/2026).

**Por que:** grepar `/etc/nginx` por "blog.coegoiania" não retorna nada e `/var/www/` não tem a pasta — dá a falsa impressão de que o blog está em outra hospedagem.

**Como aplicar:** para mexer no blog, entrar por `ssh hostinger-vps-srv1166087` e trabalhar no docroot do HestiaCP acima. Relacionado: [[favicon-webp-quebrado-blog]]
