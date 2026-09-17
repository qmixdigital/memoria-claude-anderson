# Conexão — Hostinger qmixdigital

## Dados de acesso SSH

| Campo | Valor |
|-------|-------|
| **Host** | `82.112.247.158` |
| **Porta** | `65002` |
| **Usuário** | `u463007860` |
| **Senha** | `<<REMOVIDO>>` |

## Comando de conexão

```bash
ssh -p 65002 u463007860@82.112.247.158
```

## Diretório dos sites

```bash
cd ~/domains
ls
```

Cada site fica em: `~/domains/<dominio>/public_html/`

## WP-CLI (dentro de cada site)

```bash
cd ~/domains/DOMINIO.COM/public_html
wp option get siteurl --allow-root
wp user list --role=administrator --allow-root
wp plugin list --allow-root
```

## Sites nesta conta (8 WordPress + staging)

barranews.com.br, belemduartealmeida.com.br, desassossegada.com.br, folhadonoroeste.com.br, folhar.com.br, itacaiugo.com.br, notebookx.com.br, oiempreendedores.com.br
