# Procedimentos Operacionais — Hospedagens

## 1. Buscar e Remover Links Externos

### Métodos de busca

Existem 2 formas de buscar links para um domínio externo nos artigos WordPress. A **Método B** é mais confiável.

#### Método A — SQL direto (rápido, pode falhar)
```bash
wp db query "SELECT ID, post_title FROM wp_posts WHERE post_content LIKE '%dominio.com.br%' AND post_type IN ('post','page') AND post_status IN ('publish','draft','pending')" --path=/caminho/public_html
```
**Problema:** pode não retornar resultados em alguns sites mesmo havendo links. Usar apenas para verificação rápida.

#### Método B — COUNT primeiro, depois IDs (confiável)
```bash
# Passo 1: Verificar se existe (COUNT é mais confiável que SELECT direto)
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_content LIKE '%dominio.com.br%' AND post_type IN ('post','page')" --path=/caminho/public_html

# Passo 2: Se count > 0, buscar os IDs
wp db query "SELECT ID FROM wp_posts WHERE post_content LIKE '%dominio.com.br%' AND post_type IN ('post','page')" --path=/caminho/public_html
```

#### Método C — wp db search (busca em TODAS as tabelas)
```bash
wp db search 'dominio.com.br' --path=/caminho/public_html --all-tables-with-prefix
```
**Vantagem:** busca em posts, postmeta, options, widgets — tudo. Mais lento.

### Como remover links (mantendo texto âncora)

Processo via Python + paramiko + regex:

```python
import re

# Regex para remover <a> mantendo o texto
new_content = re.sub(
    r'<a[^>]*href=["\'][^"\']*dominio\.com\.br[^"\']*["\'][^>]*>(.*?)</a>',
    r'\1', content, flags=re.IGNORECASE | re.DOTALL
)

# Salvar via SFTP + wp post update
```

**IMPORTANTE:** Não usar `wp eval` com regex via SSH — aspas conflitam. Usar SFTP para upload do conteúdo limpo + `wp post update`.

### Buscar em múltiplos domínios de uma vez (SQL)
```sql
SELECT COUNT(*) FROM wp_posts 
WHERE (post_content LIKE '%dominio1.com.br%' OR post_content LIKE '%dominio2.com.br%') 
AND post_type IN ('post','page')
```

---

## 2. Segurança — Proteções Aplicadas

### open_basedir (isolamento entre sites)
Adicionado no `.htaccess` de cada site:
```apache
# Isolamento de seguranca - open_basedir
php_value open_basedir "/caminho/completo/public_html:/tmp:/caminho/completo/dominio"
```
Impede que um site leia/escreva arquivos de outro site na mesma conta.

### XML-RPC bloqueado
```apache
<Files xmlrpc.php>
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
</Files>
```

### Varredura de segurança — O que verificar
1. `/tmp/.maou*` e `/tmp/alfacgiapi/` — webshells
2. `wp-content/nuvo77/` — conteúdo de invasor
3. `wp-content/*.php` (fora de index.php, object-cache.php, advanced-cache.php) — backdoors
4. `google*.html` na raiz dos sites — verificação falsa do Search Console
5. Pastas `image/alfacgiapi` dentro de plugins/themes — alfa shell

---

## 3. Atualização de Plugins

### Comando por site
```bash
wp plugin update --all --path=/caminho/public_html
```

### Plugins que NÃO atualizam via WP-CLI (precisam de licença)
- `elementor-pro`
- `elementskit` (versão pro)
- `all-in-one-wp-migration-gdrive-extension`
- `independent-analytics-pro`

---

## 4. Trocar Senha de Administrador

```bash
wp user update USUARIO --user_pass='NOVA_SENHA' --path=/caminho/public_html
```

### Invalidar sessões e cookies
```bash
wp db query "UPDATE wp_usermeta SET meta_value = '' WHERE meta_key = 'session_tokens'" --path=/caminho/public_html
wp config shuffle-salts --path=/caminho/public_html
wp cache flush --path=/caminho/public_html
```

---

## 5. Inserir/Remover Barra de Links no Rodapé

### Inserir (via heredoc no functions.php do tema ativo)
```bash
TEMA=$(wp option get stylesheet --path=/caminho/public_html)
cat >> /caminho/public_html/wp-content/themes/$TEMA/functions.php << 'PHPEOF'
// Barra de links no rodape
function evte_footer_links_bar() {
    echo '<div style="background:#111;padding:6px 0;text-align:center;font-size:12px;border-top:1px solid #333;">';
    echo '<a href="URL" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO</a>';
    echo '</div>';
}
add_action('wp_footer', 'evte_footer_links_bar', 100);
PHPEOF
```

---

## 6. Conexões SSH

| Hospedagem | Comando |
|------------|---------|
| VPS1 | `ssh -p 65002 u651115354@92.113.35.186` |
| anderson.gna | `ssh -p 65002 u400588174@147.79.91.52` |
| qmixdigital | `ssh -p 65002 u463007860@82.112.247.158` |
| OpenGravity | `ssh opengravity` (alias) |
| Hostverge | Via jump: `ssh opengravity` → `ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com` |
