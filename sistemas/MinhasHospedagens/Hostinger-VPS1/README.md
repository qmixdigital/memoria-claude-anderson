# Hostinger — Cloud Professional (VPS1)

**Usuário SSH:** `u651115354`
**Host:** `92.113.35.186`
**Porta:** `65002`
**Conexão:** `ssh -p 65002 u651115354@92.113.35.186`
**Senha:** `<<REMOVIDO>>`
**API Token:** ver `.vscode/mcp.json`

---

## Domínios nesta conta (47 sites)

advdobrasil.com.br, blog.advdobrasil.com.br, carretaspresidente.com.br, clickinfohub.com, comprarvisualizacoes.com, dataroomus.com, desentupidora.pro, diariodatv.com, diariodegoiania.com, diariodobrejo.com, edenoticias.com, energiaeficiente.com.br, entrenoticia.com, euvo.com.br, ferronoticias.net, filmeseseriesnovas.com, folhaum.com, gdsnoticias.com, gpnoticias.com, jornalacapital.com, jornaldinamico.com, jornalexpresso.net, jornalimigrantes.com, jrnoticias.com, maragoginoticias.com, matogrossosaude.com.br, mgnoticias.net, mundodasnoticias.net, nodiario.com, noticias9.com, noticiasdasemana.com, noticiasdiarios.com, noticiasdodia.net, noticiasdojogo.com, noticiasgoias.com, osertaoenoticia.com, pael.com.br, portalnoticiasbh.com, portalr5.com, qmiximoveis.com.br, r10noticias.com, riachonoticias.net, rsnoticias.net, rumourisnews.com, sejanoticia.com, topsulnoticias.com, tratamentodor.com.br

---

## Barra de Links no Rodapé

### O que é

Uma barra fina inserida **abaixo do footer** em todos os artigos e páginas do site, via hook `wp_footer` no `functions.php` do tema ativo. Aparece automaticamente em qualquer template — home, posts, páginas, categorias, etc.

### Como funciona tecnicamente

- O bloco PHP é adicionado ao final do `functions.php` do **tema ativo** — se houver child theme, editar o do child theme (WordPress carrega ambos, mas a função deve existir em apenas um deles para evitar conflito de declaração duplicada).
- O hook `add_action('wp_footer', 'evte_footer_links_bar', 100)` executa a função em toda requisição de front-end, após o `</footer>` e antes do `</body>`.
- O nome da função `evte_footer_links_bar` é o identificador usado para localizar, ativar e remover o bloco via script ou manualmente.

### Estrutura do bloco PHP

```php
// Barra de links no rodape
function evte_footer_links_bar() {
    echo '<div style="background:#111;padding:6px 0;text-align:center;font-size:12px;border-top:1px solid #333;">';
    echo '<a href="URL_1" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_1</a>';
    echo ' | ';
    echo '<a href="URL_2" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_2</a>';
    echo ' | ';
    echo '<a href="URL_3" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_3</a>';
    echo ' | ';
    echo '<a href="URL_4" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_4</a>';
    echo '</div>';
}
add_action('wp_footer', 'evte_footer_links_bar', 100);
```

**Campos a personalizar em cada campanha:**

| Campo | Descrição | Exemplo atual |
|-------|-----------|---------------|
| `URL_N` | Endereço completo do link | `https://www.skipark.com.br/` |
| `TEXTO_ANCORA_N` | Texto visível clicável | `Teste IPTV` |
| `rel="dofollow"` | Tipo de link (dofollow passa autoridade SEO) | manter como está |
| `target="_blank"` | Abre em nova aba | manter como está |

**Configuração atual (campanha ativa em 2026-03-24):**

| # | URL | Texto âncora |
|---|-----|-------------|
| 1 | `https://www.skipark.com.br/` | Teste IPTV |
| 2 | `https://agendatarsila.com.br/` | Teste IPTV |
| 3 | `https://www.abhorticultura.com.br/` | Teste IPTV |
| 4 | `https://www.aesbrasil.com.br/` | Teste IPTV |

---

## ATIVAR — Passo a passo

### Passo 1 — Conectar e identificar o tema ativo

```bash
ssh -p 65002 u651115354@92.113.35.186

cd ~/domains/DOMINIO.com/public_html
wp option get stylesheet --allow-root   # retorna o tema ativo (child, se existir)
wp option get template --allow-root     # retorna o tema pai
```

- Se `stylesheet != template` → há child theme → editar `wp-content/themes/VALOR_DO_STYLESHEET/functions.php`
- Se forem iguais → sem child theme → editar `wp-content/themes/VALOR_DO_STYLESHEET/functions.php`

Em ambos os casos, **sempre editar o arquivo apontado por `stylesheet`**.

### Passo 2 — Verificar se já existe (evitar duplicata)

```bash
grep -c "evte_footer_links_bar" wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
```

- Retornou `0` → ainda não inserido, pode prosseguir
- Retornou `> 0` → já existe, **não inserir novamente**

### Passo 3 — Inserir o bloco

Substituir `URL_1..4` e `TEXTO_ANCORA_1..4` pelos valores da campanha:

```bash
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
FILE="wp-content/themes/$THEME/functions.php"

# Verificar se termina com ?>
tail -1 "$FILE"
```

**Se termina com `?>`:** inserir o bloco antes do `?>` final via editor:

```bash
nano "$FILE"
# posicionar antes do ?> e colar o bloco
```

**Se não termina com `?>`:** adicionar ao final:

```bash
cat >> "$FILE" << 'PHPBLOCK'

// Barra de links no rodape
function evte_footer_links_bar() {
    echo '<div style="background:#111;padding:6px 0;text-align:center;font-size:12px;border-top:1px solid #333;">';
    echo '<a href="URL_1" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_1</a>';
    echo ' | ';
    echo '<a href="URL_2" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_2</a>';
    echo ' | ';
    echo '<a href="URL_3" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_3</a>';
    echo ' | ';
    echo '<a href="URL_4" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">TEXTO_ANCORA_4</a>';
    echo '</div>';
}
add_action('wp_footer', 'evte_footer_links_bar', 100);
PHPBLOCK
```

### Passo 4 — Verificar sintaxe PHP

```bash
php -l wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
# Resultado esperado: No syntax errors detected
```

### Passo 5 — Limpar o cache

```bash
# Tentativa 1: via action do LiteSpeed
wp eval 'do_action("litespeed_purge_all"); echo "ok";' --allow-root

# Tentativa 2: se retornar 403, desativar e reativar o plugin
wp plugin deactivate litespeed-cache --allow-root
wp plugin activate litespeed-cache --allow-root
```

> Se mesmo assim o cache persistir, acessar o **hPanel da Hostinger → Hospedagem → Gerenciar → LiteSpeed Cache → Limpar Tudo**.

### Passo 6 — Confirmar

Acessar `https://DOMINIO.com/` e `https://DOMINIO.com/qualquer-post/` e verificar se a barra aparece no final da página.

---

## DESATIVAR — Passo a passo

### Opção A — Remover completamente

Conectar via SSH e editar o `functions.php` do tema ativo:

```bash
ssh -p 65002 u651115354@92.113.35.186
cd ~/domains/DOMINIO.com/public_html
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
nano wp-content/themes/$THEME/functions.php
```

Localizar e apagar o bloco inteiro — do comentário `// Barra de links no rodape` até a linha `add_action('wp_footer', 'evte_footer_links_bar', 100);` (inclusive).

Verificar sintaxe e limpar cache (ver Passos 4 e 5 acima).

### Opção B — Suspender sem apagar (recomendada)

Comentar apenas a linha do `add_action`, mantendo o código para reativar depois:

**Desativar:**
```php
// add_action('wp_footer', 'evte_footer_links_bar', 100);
```

**Reativar:**
```php
add_action('wp_footer', 'evte_footer_links_bar', 100);
```

---

## ATUALIZAR LINKS — Trocar campanha ativa

Quando receber novos URLs, âncoras ou textos para substituir:

```bash
ssh -p 65002 u651115354@92.113.35.186
cd ~/domains/DOMINIO.com/public_html
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
nano wp-content/themes/$THEME/functions.php
```

Localizar o bloco `evte_footer_links_bar` e editar diretamente os valores de `href` e o texto âncora. Salvar, verificar sintaxe e limpar cache.

---

## Script Python — Operações em lote

Use este script para **ativar, desativar ou trocar links em múltiplos sites de uma vez**.

### Ativar em lote

```python
import paramiko

HOST = '92.113.35.186'
PORT = 65002
USER = 'u651115354'
PASS = input('Senha SSH: ')

# --- CONFIGURAR AQUI ---
DOMAINS = [
    'exemplo1.com',
    'exemplo2.com',
]

LINKS = [
    ('https://www.skipark.com.br/',        'Teste IPTV'),
    ('https://agendatarsila.com.br/',      'Teste IPTV'),
    ('https://www.abhorticultura.com.br/', 'Teste IPTV'),
    ('https://www.aesbrasil.com.br/',      'Teste IPTV'),
]
# -----------------------

def build_php_block(links):
    lines = [
        '\n\n// Barra de links no rodape',
        'function evte_footer_links_bar() {',
        '    echo \'<div style="background:#111;padding:6px 0;text-align:center;font-size:12px;border-top:1px solid #333;">\';',
    ]
    for i, (url, anchor) in enumerate(links):
        lines.append(f'    echo \'<a href="{url}" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">{anchor}</a>\';')
        if i < len(links) - 1:
            lines.append("    echo ' | ';")
    lines.append("    echo '</div>';")
    lines.append('}')
    lines.append("add_action('wp_footer', 'evte_footer_links_bar', 100);")
    return '\n'.join(lines) + '\n'

BLOCK = build_php_block(LINKS)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)

for domain in DOMAINS:
    base = f'/home/{USER}/domains/{domain}/public_html'

    stdin, stdout, _ = client.exec_command(f'cd {base} && wp option get stylesheet --allow-root 2>/dev/null')
    theme = stdout.read().decode().strip()
    func_path = f'{base}/wp-content/themes/{theme}/functions.php'

    sftp = client.open_sftp()
    try:
        with sftp.open(func_path, 'r') as f:
            content = f.read().decode('utf-8', errors='replace')
    except FileNotFoundError:
        print(f'{domain}: ERRO — functions.php não encontrado em {theme}')
        sftp.close()
        continue

    if 'evte_footer_links_bar' in content:
        print(f'{domain}: já inserido — pulando')
        sftp.close()
        continue

    content = content.rstrip()
    content = (content[:-2].rstrip() + BLOCK + '\n?>') if content.endswith('?>') else (content + BLOCK)

    with sftp.open(func_path, 'w') as f:
        f.write(content)
    sftp.close()

    stdin, stdout, _ = client.exec_command(f'php -l {func_path} 2>&1')
    syntax = stdout.read().decode().strip()

    stdin, stdout, _ = client.exec_command(
        f'cd {base} && wp eval \'do_action("litespeed_purge_all"); echo "ok";\' --allow-root 2>&1 | tail -1'
    )
    cache = stdout.read().decode().strip()

    status = 'OK' if 'No syntax errors' in syntax else f'ERRO: {syntax}'
    print(f'{domain}: {status} | cache: {cache} | tema: {theme}')

client.close()
```

### Desativar em lote

```python
import paramiko, re

HOST = '92.113.35.186'
PORT = 65002
USER = 'u651115354'
PASS = input('Senha SSH: ')

DOMAINS = [
    'exemplo1.com',
    'exemplo2.com',
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)

for domain in DOMAINS:
    base = f'/home/{USER}/domains/{domain}/public_html'
    stdin, stdout, _ = client.exec_command(f'cd {base} && wp option get stylesheet --allow-root 2>/dev/null')
    theme = stdout.read().decode().strip()
    func_path = f'{base}/wp-content/themes/{theme}/functions.php'

    sftp = client.open_sftp()
    with sftp.open(func_path, 'rb') as f:
        lines = f.read().decode('utf-8', errors='replace').splitlines(keepends=True)

    new_lines, skip = [], False
    for line in lines:
        if 'Barra de links no rodap' in line:
            skip = True
        if skip:
            if "add_action('wp_footer', 'evte_footer_links_bar'" in line:
                skip = False
            continue
        new_lines.append(line)

    with sftp.open(func_path, 'w') as f:
        f.write(''.join(new_lines))
    sftp.close()

    stdin, stdout, _ = client.exec_command(f'php -l {func_path} 2>&1')
    syntax = stdout.read().decode().strip()
    stdin, stdout, _ = client.exec_command(
        f'cd {base} && wp plugin deactivate litespeed-cache --allow-root 2>&1 | tail -1 && wp plugin activate litespeed-cache --allow-root 2>&1 | tail -1'
    )
    cache = stdout.read().decode().strip()

    status = 'REMOVIDO' if 'No syntax errors' in syntax else f'ERRO: {syntax}'
    print(f'{domain}: {status} | cache: {cache}')

client.close()
```

### Trocar links em lote (atualizar campanha)

```python
import paramiko

HOST = '92.113.35.186'
PORT = 65002
USER = 'u651115354'
PASS = input('Senha SSH: ')

DOMAINS = [
    'exemplo1.com',
    'exemplo2.com',
]

# Novos links da campanha
NOVOS_LINKS = [
    ('https://novo-site1.com/', 'Texto Ancora 1'),
    ('https://novo-site2.com/', 'Texto Ancora 2'),
    ('https://novo-site3.com/', 'Texto Ancora 3'),
    ('https://novo-site4.com/', 'Texto Ancora 4'),
]

def build_php_block(links):
    lines = [
        '\n\n// Barra de links no rodape',
        'function evte_footer_links_bar() {',
        '    echo \'<div style="background:#111;padding:6px 0;text-align:center;font-size:12px;border-top:1px solid #333;">\';',
    ]
    for i, (url, anchor) in enumerate(links):
        lines.append(f'    echo \'<a href="{url}" target="_blank" rel="dofollow" style="color:#aaa;text-decoration:none;margin:0 6px;">{anchor}</a>\';')
        if i < len(links) - 1:
            lines.append("    echo ' | ';")
    lines.append("    echo '</div>';")
    lines.append('}')
    lines.append("add_action('wp_footer', 'evte_footer_links_bar', 100);")
    return '\n'.join(lines) + '\n'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)

for domain in DOMAINS:
    base = f'/home/{USER}/domains/{domain}/public_html'
    stdin, stdout, _ = client.exec_command(f'cd {base} && wp option get stylesheet --allow-root 2>/dev/null')
    theme = stdout.read().decode().strip()
    func_path = f'{base}/wp-content/themes/{theme}/functions.php'

    sftp = client.open_sftp()
    with sftp.open(func_path, 'rb') as f:
        lines = f.read().decode('utf-8', errors='replace').splitlines(keepends=True)

    # Remover bloco antigo
    new_lines, skip = [], False
    for line in lines:
        if 'Barra de links no rodap' in line:
            skip = True
        if skip:
            if "add_action('wp_footer', 'evte_footer_links_bar'" in line:
                skip = False
            continue
        new_lines.append(line)

    # Inserir novo bloco
    content = ''.join(new_lines).rstrip()
    BLOCK = build_php_block(NOVOS_LINKS)
    content = (content[:-2].rstrip() + BLOCK + '\n?>') if content.endswith('?>') else (content + BLOCK)

    with sftp.open(func_path, 'w') as f:
        f.write(content)
    sftp.close()

    stdin, stdout, _ = client.exec_command(f'php -l {func_path} 2>&1')
    syntax = stdout.read().decode().strip()
    stdin, stdout, _ = client.exec_command(
        f'cd {base} && wp eval \'do_action("litespeed_purge_all"); echo "ok";\' --allow-root 2>&1 | tail -1'
    )
    cache = stdout.read().decode().strip()

    status = 'ATUALIZADO' if 'No syntax errors' in syntax else f'ERRO: {syntax}'
    print(f'{domain}: {status} | cache: {cache}')

client.close()
```

---

## Sobre o cache LiteSpeed

Esta hospedagem usa **LiteSpeed Cache** em nível de servidor. O comportamento esperado:

| Comando | Resultado |
|---------|-----------|
| `wp eval 'do_action("litespeed_purge_all");'` | Funciona na maioria dos sites |
| `wp plugin deactivate/activate litespeed-cache` | Limpa cache de objeto (alternativa) |
| `wp litespeed-purge all` | Pode retornar 403 em alguns sites |
| hPanel → LiteSpeed Cache → Limpar Tudo | **Sempre funciona** — usar quando os anteriores falharem |

Se após inserir o código a barra não aparecer, o cache antigo ainda está sendo servido. O código **já está correto** — basta limpar o cache pelo hPanel.

---

## Inventário de domínios

> **Legenda:** ✅ barra ativa e visível | ⚠️ código inserido, limpar cache pelo hPanel | — sem barra

### Lote 1 — Ativado em 2026-03-24

| Domínio | Tema pai | Child theme | Barra |
|---------|----------|-------------|-------|
| noticiasdiarios.com | evte-news | evte-news-child | ✅ |
| gpnoticias.com | evte-news | evte-news-child | ⚠️ cache |
| ferronoticias.net | evte-news | evte-news-child | ✅ |
| rsnoticias.net | evte-news | — | ✅ |
| riachonoticias.net | evte-news | evte-news-child | ✅ |

### Lote 2 — Ativado em 2026-03-24

| Domínio | Tema pai | Child theme | Barra |
|---------|----------|-------------|-------|
| noticiasdojogo.com | evte-news | evte-news-child | ✅ |
| mgnoticias.net | evte-news | evte-news-child | ⚠️ cache |
| r10noticias.com | evte-news | evte-news-child | ✅ |
| noticias9.com | evte-news | evte-news-child | ✅ |
| noticiasdodia.net | evte-news | evte-news-child | ✅ |
| edenoticias.com | evte-news | evte-news-child | ✅ |
| dataroomus.com | evte-news | evte-news-child | ✅ |
| clickinfohub.com | evte-news | evte-news-child | ⚠️ cache |
| rumourisnews.com | evte-news | evte-news-child | ✅ |
| portalr5.com | evte-news | evte-news-child | ✅ |
| jrnoticias.com | evte-news | evte-news-child | ✅ |
| jornaldinamico.com | evte-news | evte-news-child | ✅ |
| jornalacapital.com | evte-news | evte-news-child | ⚠️ cache |
| maragoginoticias.com | evte-news | evte-news-child | ✅ |
| jornalimigrantes.com | evte-news | evte-news-child | ✅ |
| noticiasdasemana.com | evte-news | evte-news-child | ✅ |
| entrenoticia.com | evte-news | evte-news-child | ✅ |
| nodiario.com | evte-news | evte-news-child | ✅ |
| euvo.com.br | jannah | jannah-child | ⛔ migrado em 20/08/2026 para a opengravity, motor Portal Engine. O WordPress segue aqui, parado, aguardando ordem de apagar |
| topsulnoticias.com | evte-news | evte-news-child | ✅ |
| diariodatv.com | evte-news | evte-news-child | ✅ |
| filmeseseriesnovas.com | evte-news | — | ✅ |
| diariodegoiania.com | evte-news | — | ✅ |
| portalnoticiasbh.com | evte-news | — | ✅ |
| noticiasgoias.com | evte-news | — | ✅ |
| osertaoenoticia.com | evte-news | — | ✅ |
| gdsnoticias.com | evte-news | — | ✅ |
| mundodasnoticias.net | evte-news | — | ⚠️ cache |
| sejanoticia.com | evte-news | — | ⚠️ cache |
| jornalexpresso.net | evte-news | — | ⚠️ cache |
| folhaum.com | evte-news | — | ⚠️ cache |
| diariodobrejo.com | evte-news | — | ✅ |

### Outros domínios na conta (sem barra ativa)

| Domínio | Observação |
|---------|------------|
| lp.suvautopartes.com.br | — |
| advdobrasil.com.br | — |
| blog.advdobrasil.com.br | — |
| carretaspresidente.com.br | — |
| comprarvisualizacoes.com | — |
| desentupidora.pro | — |
| diariodobrejo.com | — |
| energiaeficiente.com.br | — |
| filmeseseriesnovas.com | — |
| matogrossosaude.com.br | — |
| pael.com.br | — |
| qmixmoveis.com.br | — |
| revistamsaude.com.br | — |
| suvautopartes.com.br | — |
| tratamentodor.com.br | — |
