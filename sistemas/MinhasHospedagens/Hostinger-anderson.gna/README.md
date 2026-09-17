# Hostinger — anderson.gna

## Credenciais

**API Token:** *(inserir em `.vscode/mcp.json` → campo `API_TOKEN`)*
**Usuário SSH:** `u400588174`
**Host:** `147.79.91.52`
**Porta:** `65002`
**Conexão:** `ssh -p 65002 u400588174@147.79.91.52`
**Senha:** `<<REMOVIDO>>`

---

---

## ⚠️ Sites que SAÍRAM desta conta (migrados)

Estes domínios **não estão mais aqui**. Foram convertidos de WordPress para o
**portal-engine** (HTML estático em Node) e hoje rodam na VPS **clinicas-vps**.
Os diretórios foram apagados desta hospedagem.

| Domínio | Saiu em | Está agora em | Documentação |
|---------|---------|---------------|--------------|
| agencianacionaldenoticias.com | 15/08/2026 | clinicas-vps `31.97.162.199` | [`clinicas-vps/agencianacionaldenoticias.com.md`](../clinicas-vps/agencianacionaldenoticias.com.md) |
| boxnoticias.net | 15/08/2026 | clinicas-vps `31.97.162.199` | [`clinicas-vps/boxnoticias.net.md`](../clinicas-vps/boxnoticias.net.md) |

**Não procure wp-admin, wp-cli nem banco nesses dois.** Não existem mais: o
conteúdo virou arquivo JSON e o site é HTML pronto. Ver
[`clinicas-vps/portal-engine.md`](../clinicas-vps/portal-engine.md).

**Pendência:** os bancos **`u400588174_4ho6i`** (agencianacional) e
**`u400588174_awyvb`** (boxnoticias) ficaram órfãos nesta conta e precisam ser
removidos pelo hPanel. As senhas se perderam junto com o `wp-config.php`.

## Domínios nesta conta (39 sites)

adonline.com.br, advivo.com.br, azulmagazine.com.br, blog.aplusplatform.com, blogse.com.br, cameracotidiana.com.br, curiosododia.com.br, diariopernambucano.com.br, divirto.com.br, ebookcult.com.br, editaldeconcurso.net, gazetaalerta.com, gazetadoconsumidor.com, gazetaretina.com, girodasnoticias.com, incast.com.br, jornaldabahia.net, jornaldebarcelos.com, jornaldobairroalto.com.br, jornalistanofato.com, jornalsaosimao.com, manacultura.com, nerddahora.com, noticiasagoras.com, noticiasubuntu.com, olharmoderno.com, opopularjornal.com.br, pneusemgoiania.com.br, professortic.com, publisherbrasil.com.br, qmixdigital.com.br, revistarumo.com.br, saberdefato.com.br, semtedio.com, tempusnoticias.com, tribunainformativa.com, tribunalpopular.org, umjornal.com, universoneo.com.br
---

## Como obter as credenciais via API

Após inserir o token em `.vscode/mcp.json`, executar:

```bash
# Listar websites e obter usuário/diretório
curl -s -H "Authorization: Bearer SEU_TOKEN" \
  "https://developers.hostinger.com/api/hosting/v1/websites" | python -m json.tool

# Listar plano/assinatura
curl -s -H "Authorization: Bearer SEU_TOKEN" \
  "https://developers.hostinger.com/api/billing/v1/subscriptions" | python -m json.tool
```

O campo `username` nos websites retorna o usuário SSH (ex: `u123456789`).
O host SSH pode ser obtido no **hPanel → Hospedagem → Gerenciar → Acesso SSH**.

---

## Barra de Links no Rodapé

O procedimento é idêntico ao realizado na conta **Hostinger-VPS1**. Consultar o [README da VPS1](../Hostinger-VPS1/README.md) para referência completa. Abaixo o resumo operacional.

---

## ATIVAR — Passo a passo

### 1. Conectar e identificar tema ativo

```bash
ssh -p PORTA USUARIO@HOST

cd ~/domains/DOMINIO.com/public_html
wp option get stylesheet --allow-root   # tema ativo (child, se houver)
wp option get template --allow-root     # tema pai
```

- Sempre editar o `functions.php` apontado por `stylesheet`.

### 2. Verificar se já existe

```bash
grep -c "evte_footer_links_bar" wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
# 0 = pode inserir | > 0 = já existe, não inserir novamente
```

### 3. Inserir o bloco

Substituir `URL_N` e `TEXTO_ANCORA_N` pelos valores da campanha:

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

### 4. Verificar sintaxe

```bash
php -l wp-content/themes/$(wp option get stylesheet --allow-root)/functions.php
# Esperado: No syntax errors detected
```

### 5. Limpar cache

```bash
# Tentativa 1
wp eval 'do_action("litespeed_purge_all"); echo "ok";' --allow-root

# Tentativa 2 (se 403)
wp plugin deactivate litespeed-cache --allow-root
wp plugin activate litespeed-cache --allow-root
```

> Se persistir: **hPanel → Hospedagem → Gerenciar → LiteSpeed Cache → Limpar Tudo**

---

## DESATIVAR

```bash
ssh -p PORTA USUARIO@HOST
cd ~/domains/DOMINIO.com/public_html
THEME=$(wp option get stylesheet --allow-root 2>/dev/null)
nano wp-content/themes/$THEME/functions.php
```

Remover o bloco inteiro do comentário `// Barra de links no rodape` até `add_action(...)` inclusive.
Ou apenas comentar `add_action` para suspender sem apagar:

```php
// add_action('wp_footer', 'evte_footer_links_bar', 100);
```

---

## ATUALIZAR LINKS (trocar campanha)

Editar o `functions.php` do tema ativo, localizar o bloco `evte_footer_links_bar` e substituir os valores de `href` e texto âncora. Limpar cache após salvar.

---

## Scripts Python — Operações em lote

> Atualizar `HOST`, `PORT`, `USER` e `PASS` assim que as credenciais SSH forem confirmadas.

### Ativar em lote

```python
import paramiko

HOST = 'INSERIR_HOST'
PORT = 65002              # confirmar
USER = 'INSERIR_USUARIO'
PASS = input('Senha SSH: ')

DOMAINS = [
    'exemplo1.com',
    'exemplo2.com',
]

LINKS = [
    ('https://url1.com/', 'Texto Ancora 1'),
    ('https://url2.com/', 'Texto Ancora 2'),
    ('https://url3.com/', 'Texto Ancora 3'),
    ('https://url4.com/', 'Texto Ancora 4'),
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
import paramiko

HOST = 'INSERIR_HOST'
PORT = 65002
USER = 'INSERIR_USUARIO'
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

### Trocar campanha em lote

```python
import paramiko

HOST = 'INSERIR_HOST'
PORT = 65002
USER = 'INSERIR_USUARIO'
PASS = input('Senha SSH: ')

DOMAINS = [
    'exemplo1.com',
    'exemplo2.com',
]

NOVOS_LINKS = [
    ('https://novo-url1.com/', 'Novo Texto 1'),
    ('https://novo-url2.com/', 'Novo Texto 2'),
    ('https://novo-url3.com/', 'Novo Texto 3'),
    ('https://novo-url4.com/', 'Novo Texto 4'),
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

## Inventário de domínios

> **Legenda:** ✅ barra ativa e visível | ⚠️ código inserido, limpar cache pelo hPanel | — sem barra

### Lote 1 — Ativado em 2026-03-24

| Domínio | Tema pai | Child theme | Barra |
|---------|----------|-------------|-------|
| adonline.com.br | smart-mag | — | ✅ |
| advivo.com.br | smart-mag | smart-mag-child | ✅ |
| ~~agencianacionaldenoticias.com~~ | **MIGRADO** | ver aviso no topo | — |
| azulmagazine.com.br | smart-mag | — | ✅ |
| blogse.com.br | smart-mag | — | ✅ |
| ~~boxnoticias.net~~ | **MIGRADO** | ver aviso no topo | — |
| cameracotidiana.com.br | smart-mag | smart-mag-child | ✅ |
| curiosododia.com.br | smart-mag | — | ✅ |
| diariopernambucano.com.br | evte-news | — | ✅ |
| divirto.com.br | smart-mag | smart-mag-child | ⚠️ cache |
| ebookcult.com.br | smart-mag | smart-mag-child | ✅ |
| editaldeconcurso.net | evte-news | — | ⚠️ cache |
| gazetaalerta.com | evte-news | — | ✅ |
| gazetadoconsumidor.com | evte-news | — | ✅ |
| gazetaretina.com | evte-news | — | ✅ |
| girodasnoticias.com | evte-news | — | ⚠️ cache |
| incast.com.br | smart-mag | — | ✅ |
| jornaldabahia.net | evte-news | — | ✅ |
| jornaldebarcelos.com | evte-news | — | ✅ |
| jornaldobairroalto.com.br | smart-mag | smart-mag-child | ✅ |
| jornalistanofato.com | evte-news | — | ⚠️ cache |
| jornalsaosimao.com | evte-news | — | ✅ |
| manacultura.com | evte-news | — | ✅ |
| nerddahora.com | evte-news | — | ⚠️ cache |
| noticiasagoras.com | evte-news | — | ✅ |
| noticiasubuntu.com | evte-news | — | ⚠️ cache |
| olharmoderno.com | evte-news | — | ⚠️ cache |
| opopularjornal.com.br | smart-mag | smart-mag-child | ✅ |
| professortic.com | evte-news | — | ⚠️ cache |
| publisherbrasil.com.br | smart-mag | smart-mag-child | ✅ |
| qmixdigital.com.br | smart-mag | smart-mag-child | ✅ |
| revistarumo.com.br | evte-news | — | ✅ |
| saberdefato.com.br | smart-mag | smart-mag-child | ✅ |
| semtedio.com | evte-news | — | ⚠️ cache |
| setorenergetico.com.br | evte-news | — | ✅ |
| tempusnoticias.com | evte-news | evte-news-child | ✅ |
| tribunainformativa.com | evte-news | — | ✅ |
| tribunalpopular.org | evte-news | — | ⚠️ cache |
| umjornal.com | evte-news | — | ⚠️ cache |
| universoneo.com.br | smart-mag | smart-mag-child | ✅ |

### Domínios na conta sem barra ativa

| Domínio | Observação |
|---------|------------|
| arcondicionadotop.com | tema: monetiza |
| blog.aplusplatform.com | tema: blocksy-child |
| creatinadicas.com | tema: smart-mag-child |
| geladeirastop.com | tema: smart-mag-child |
| linen-fly-185149.hostingersite.com | subdomínio Hostinger |
| pneusemgoiania.com.br | tema: evte-news |
| universoneo.com.br | — |

---

## Histórico de campanhas

| Data | Links | Âncora | Sites |
|------|-------|--------|-------|
| 2026-03-24 | skipark.com.br, agendatarsila.com.br, abhorticultura.com.br, aesbrasil.com.br | Teste IPTV | 40 sites (lote 1) |

## blogse.com.br saiu daqui em 19/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, com o
acervo podado de 2.766 para 588 posts, aguardando decisão do Anderson sobre apagar.

## jornaldobairroalto.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, com o
acervo podado de 3.471 para 566 posts, ocupando **1,5 GB**, aguardando decisão do
Anderson sobre apagar.

Arquitetura **AJ**, "GAZETA". Namespace da plataforma: `b2d2-api`. Documentação em
[`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\JORNALDOBAIRROALTO\CONVERSAO.md`.

⚠️ Aqui o `category_base` estava **vazio** no `wp_options`, o que no WordPress
significa `category` em inglês, e não "sem base". Cravar `categoria` por analogia
com os vizinhos poria a editoria inteira em 404.

## diariopernambucano.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/u400588174/domains/diariopernambucano.com.br/public_html`, com o acervo
podado de 4.501 para 598 posts, ocupando **2,9 GB**, aguardando decisão do
Anderson sobre apagar.

Arquitetura **AL**, "ALMANAQUE". Namespace da plataforma: `a500-api`. Documentação
em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\DIARIOPERNAMBUCANO\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** que está no
`wp-config.php`. O `rm -rf` leva o arquivo junto e o banco fica órfão nesta conta,
como já aconteceu com os dois do aviso do topo.

## divirto.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/u400588174/domains/divirto.com.br/public_html`, com o acervo podado de
5.273 para 719 posts, ocupando **2,3 GB**, aguardando decisão do Anderson sobre
apagar.

Arquitetura **AN**, "MOSAICO". Namespace da plataforma: `d852-api`. Documentação
em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\DIVIRTO\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** do
`wp-config.php`.

⚠️ Este era o portal com mais lixeira da rede: **1.999 posts em `trash`**, quase
40% do acervo. `post_status => 'any'` não os traz.

## incast.com.br: construído no motor em 23/08/2026, DNS ainda AQUI

🔴 **A virada não aconteceu**: a zona da Cloudflare do `incast.com.br` não está em
nenhuma das 35 contas do `contas.json`, e as duas candidatas (`conta11` e
`conta25`) respondem `401 Invalid API Token`. O domínio **continua servido por
este WordPress**.

O acervo **já foi podado** de 6.677 para 843 posts, e o portal já está montado e
conferido na opengravity, esperando só o DNS. Ocupa **3,3 GB**.

⚠️ **Não apagar este WordPress antes da virada**: ele é quem responde o domínio
hoje.

Arquitetura **AO**, "PAUTA". Namespace: `b6f1-api`. AdSense herdado. Documentação
em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\INCAST\CONVERSAO.md`.

⚠️ O `category_base` daqui está **vazio**, o que no WordPress significa
`category`, em inglês.

## opopularjornal.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/u400588174/domains/opopularjornal.com.br/public_html`, com o acervo podado
de 3.727 para 1.066 posts, ocupando **2,0 GB**, aguardando decisão do Anderson
sobre apagar.

Arquitetura **AP**, "TELA". Namespace: `mrpp-api`. AdSense herdado. Documentação
em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\OPOPULARJORNAL\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** do
`wp-config.php`.

⚠️ O `category_base` daqui estava **vazio**, o que no WordPress significa
`category`, em inglês. O permalink é plano, `/%postname%/`.

## revistarumo.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/u400588174/domains/revistarumo.com.br/public_html`, com o acervo podado de
2.996 para 532 posts, ocupando **4,8 GB**, a maior origem desta leva, aguardando
decisão do Anderson sobre apagar.

Arquitetura **AQ**, "REVISTA". Namespace: `a628-api`. AdSense herdado.
Documentação em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\REVISTARUMO\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** do
`wp-config.php`.

## universoneo.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/u400588174/domains/universoneo.com.br/public_html`, com o acervo podado de
**42.576 para 514 posts**, ocupando **2,0 GB**, aguardando decisão do Anderson
sobre apagar.

🔴 **Este era o campeão de lixeira da rede: 37.185 posts em `trash`**, sete vezes
o acervo publicado. Todos apagados em definitivo na poda.

Arquitetura **AR**, "MÓDULO". Namespace: `unvn-api`. AdSense herdado. Documentação
em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\UNIVERSONEO\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** do
`wp-config.php`.

## publisherbrasil.com.br e saberdefato.com.br sairam daqui em 23/08/2026

Os dois migrados para o portal-engine da opengravity (77.37.69.175) por conversao
parcial com backlinks. O DNS ja aponta para la. Os WordPress continuam neste
servidor:

| dominio | caminho | acervo podado | tamanho |
|---|---|---|---|
| publisherbrasil.com.br | `/home/u400588174/domains/publisherbrasil.com.br/public_html` | 2.993 -> 314 | **1,9 GB** |
| saberdefato.com.br | `/home/u400588174/domains/saberdefato.com.br/public_html` | 3.385 -> 503 | **1,3 GB** |

Arquiteturas **AU** ("ANEL") e **AV** ("SELO"). Namespaces da plataforma:
`ntfd-api` e `qzfd-api`. **Nenhum dos dois tem AdSense**, igual as origens.
Documentacao em [`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\PUBLISHERBRASIL\CONVERSAO.md` e `D:\PORTAIS\SABERDEFATO\CONVERSAO.md`.

🔴 **Antes de apagar os diretorios, salvar a credencial do banco** de cada
`wp-config.php`. O `rm -rf` leva o arquivo junto e o banco fica orfao.

🔴 **O `category_base` do saberdefato estava VAZIO**, e vazio significa
`category`, em ingles. Vale para qualquer varredura feita aqui: nao supor
"categoria" sem ler o campo.
