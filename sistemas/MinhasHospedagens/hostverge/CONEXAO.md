# Conexão — Hostverge (StackCP Shared Hosting)

## Dados de acesso SSH

| Campo | Valor |
|-------|-------|
| **Host** | `ssh.us.stackcp.com` |
| **Porta** | `22` (padrão) |
| **Usuário** | `qmix.com.br` |
| **Autenticação** | Chave SSH (não usa senha) |
| **Chave privada** | `/root/.ssh/id_hostverge` (no VPS OpenGravity) |

## Conexão (via jump pelo OpenGravity)

A chave SSH está armazenada no VPS OpenGravity. Conecte primeiro nele, depois salte pro hostverge:

```bash
# 1. Conectar no OpenGravity
ssh opengravity

# 2. Do OpenGravity, conectar na Hostverge
ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com
```

## Conexão direta (se tiver a chave localmente)

Se copiar a chave `id_hostverge` para seu PC local em `~/.ssh/id_hostverge`:

```bash
ssh -i ~/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com
```

## Painel web

**StackCP:** https://cp.hostverge.com/

## Diretório dos sites

```bash
cd ~/public_html
ls
```

Cada site fica em: `~/public_html/<pasta>/` (WordPress Multisite com subdiretórios)

## WP-CLI (dentro de cada site)

```bash
cd ~/public_html/PASTA_DO_SITE
wp option get siteurl --allow-root
wp user list --role=administrator --allow-root
wp plugin list --allow-root
```

## Sites nesta conta (28)

agoranoticias.net, arlaproducao.com, cirurgiacoracao.com.br, cirurgiadacatarata.com.br, cirurgiadecancer.com.br, comprarsites, df8.com.br, exquisito, institutoortopedico.com.br, jornalcanalaberto.com.br, jornalconceito.com, medicinageriatrica, medicodasmaos.com.br, ocontraditorio.com, ortopediacoluna, ortopedistadeombro, planomedicosaude.com.br, pontonaturalbrasil, qmixdigital, revistadeducao, revistatopsaude.com.br, sabedoriaglobal, saudeacessivel.com.br, saudeemalta, saudevitalidade, saudicas.com.br, tendasbarbantech, viajenodetalhe, wtw19
