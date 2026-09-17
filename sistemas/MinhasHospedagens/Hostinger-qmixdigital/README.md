# Hostinger — qmixdigital

**Usuário SSH:** `u463007860`
**Host:** `82.112.247.158`
**Porta:** `65002`
**Conexão:** `ssh -p 65002 u463007860@82.112.247.158`
**Senha:** `<<REMOVIDO>>`
**API Token:** ver `.vscode/mcp.json`

---

## Domínios nesta conta (13 sites)

barranews.com.br, belemduartealmeida.com.br, darkcyan-narwhal-224012.hostingersite.com, darkgrey-whale-919749.hostingersite.com, desassossegada.com.br, dominios-registrobr.qmix.com.br, firebrick-buffalo-895691.hostingersite.com, folhadonoroeste.com.br, folhar.com.br, itacaiugo.com.br, notebookx.com.br, oiempreendedores.com.br, steelblue-turkey-830737.hostingersite.com

---

## Inventário de domínios

> **Legenda:** ✅ barra ativa e visível | ⚠️ código inserido, limpar cache pelo hPanel | — sem barra

| # | Domínio | Tema pai | Child theme | Barra |
|---|---------|----------|-------------|-------|
| 1 | barranews.com.br | jannah | — | — |
| 2 | belemduartealmeida.com.br | hello-elementor | — | — |
| 3 | desassossegada.com.br | smart-mag | smart-mag-child | ✅ |
| 4 | folhadonoroeste.com.br | evte-news | — | ✅ |
| 5 | folhar.com.br | jannah | — | ✅ |
| 6 | itacaiugo.com.br | smart-mag | smart-mag-child | — |
| 7 | notebookx.com.br | smart-mag | smart-mag-child | — |
| 8 | oiempreendedores.com.br | smart-mag | — | ✅ |
| — | darkcyan-narwhal-224012.hostingersite.com | twentytwentyfive | — | staging |
| — | darkgrey-whale-919749.hostingersite.com | (não-WP) | — | staging |
| — | dominios-registrobr.qmix.com.br | (não-WP) | — | interno |
| — | firebrick-buffalo-895691.hostingersite.com | (não-WP) | — | staging |
| — | steelblue-turkey-830737.hostingersite.com | evte-news-standalone | — | staging |

> Subdomínios/staging da Hostinger e sites não-WordPress — não aplicar barra.

---

## Barra de Links no Rodapé

Procedimento idêntico às contas **Hostinger-VPS1** e **Hostinger-anderson.gna**.
Consultar [Hostinger-VPS1/README.md](../Hostinger-VPS1/README.md) para referência completa.

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

---

## ATIVAR — Passo a passo

### 1. Conectar e identificar tema ativo

```bash
ssh -p 65002 u463007860@82.112.247.158

cd ~/domains/DOMINIO.com/public_html
wp option get stylesheet --allow-root   # tema ativo (child se houver)
wp option get template --allow-root     # tema pai
```

- Sempre editar o `functions.php` apontado por `stylesheet`.

### 2. Verificar duplicata

```bash
grep -c "evte_footer_links_bar" wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
# 0 = pode inserir | > 0 = já existe
```

### 3. Inserir bloco

```bash
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
nano wp-content/themes/$THEME/functions.php
# Adicionar o bloco antes do ?> final ou ao fim do arquivo
```

### 4. Verificar sintaxe

```bash
php -l wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
```

### 5. Limpar cache

```bash
# Tentativa 1
wp eval 'do_action("litespeed_purge_all"); echo "ok";' --allow-root

# Tentativa 2
wp plugin deactivate litespeed-cache --allow-root
wp plugin activate litespeed-cache --allow-root
```

> Se persistir: **hPanel → Hospedagem → Gerenciar → LiteSpeed Cache → Limpar Tudo**

---

## DESATIVAR

```bash
ssh -p 65002 u463007860@82.112.247.158
cd ~/domains/DOMINIO.com/public_html
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
nano wp-content/themes/$THEME/functions.php
```

Remover o bloco inteiro de `// Barra de links no rodape` até `add_action(...)`.
Ou comentar apenas o `add_action` para suspender sem apagar:

```php
// add_action('wp_footer', 'evte_footer_links_bar', 100);
```

---

## Scripts Python — Operações em lote

### Ativar em lote

```python
import paramiko

HOST = '82.112.247.158'
PORT = 65002
USER = 'u463007860'
PASS = input('Senha SSH: ')

DOMAINS = [
    'folhadonoroeste.com.br',
    'desassossegada.com.br',
    # adicionar domínios conforme necessário
]

LINKS = [
    ('https://url1.com/', 'Texto Ancora 1'),
    ('https://url2.com/', 'Texto Ancora 2'),
    ('https://url3.com/', 'Texto Ancora 3'),
    ('https://url4.com/', 'Texto Ancora 4'),
]

def build_block(links):
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

BLOCK = build_block(LINKS)

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
import paramiko

HOST = '82.112.247.158'
PORT = 65002
USER = 'u463007860'
PASS = input('Senha SSH: ')

DOMAINS = [
    'folhadonoroeste.com.br',
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

### Trocar campanha em lote

```python
import paramiko

HOST = '82.112.247.158'
PORT = 65002
USER = 'u463007860'
PASS = input('Senha SSH: ')

DOMAINS = [
    'folhadonoroeste.com.br',
]

NOVOS_LINKS = [
    ('https://novo-url1.com/', 'Novo Texto 1'),
    ('https://novo-url2.com/', 'Novo Texto 2'),
    ('https://novo-url3.com/', 'Novo Texto 3'),
    ('https://novo-url4.com/', 'Novo Texto 4'),
]

def build_block(links):
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

    new_lines, skip = [], False
    for line in lines:
        if 'Barra de links no rodap' in line:
            skip = True
        if skip:
            if "add_action('wp_footer', 'evte_footer_links_bar'" in line:
                skip = False
            continue
        new_lines.append(line)

    content = ''.join(new_lines).rstrip()
    BLOCK = build_block(NOVOS_LINKS)
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

## Histórico de campanhas

| Data | Links | Âncora | Sites |
|------|-------|--------|-------|
| 2026-03-24 | skipark.com.br, agendatarsila.com.br, abhorticultura.com.br, aesbrasil.com.br | Teste IPTV | desassossegada.com.br, folhadonoroeste.com.br, folhar.com.br, oiempreendedores.com.br |

## folhar.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversao parcial
com backlinks. O DNS ja aponta para la. O WordPress continua neste servidor, em
`/home/u463007860/domains/folhar.com.br/public_html`, com o acervo podado de
4.657 para 206 posts, ocupando **1,4 GB**, aguardando decisao do Anderson sobre
apagar.

Arquitetura **AT**, "MANCHETE". Namespace da plataforma: `db8d-api`. **AdSense
herdado**, `pub-3880875536722698`. Documentacao em
[`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\FOLHAR\CONVERSAO.md`.

🔴 **Antes de apagar o diretorio, salvar a credencial do banco** do
`wp-config.php`. O `rm -rf` leva o arquivo junto e o banco fica orfao nesta conta.

🔴 **O `--skip-plugins` NAO pula mu-plugin.** Este site tem o
`qmix-ocultar-cat-en.php`, que filtra a categoria em ingles em `pre_get_posts`: a
`WP_Query` do export devolveu 4.506 de 4.658, e os 152 que faltavam eram quase
todos da categoria `life`. Vale para qualquer varredura feita aqui: conferir a
contagem contra SQL direto.

⚠️ **Cadastrar o dominio no painel do AdSense.** O publisher id sozinho nao cobre
dominio que a conta ainda nao conhece.
