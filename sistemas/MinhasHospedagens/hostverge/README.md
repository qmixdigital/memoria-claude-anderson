# Hostverge — qmix.com.br (Shared Hosting)

**Painel:** [StackCP](https://cp.hostverge.com/)
**Plano:** Shared Hosting
**Usuário SSH:** `qmix.com.br`
**Host SSH:** `ssh.us.stackcp.com`
**Chave SSH:** `/root/.ssh/id_hostverge` (no VPS OpenGravity)
**Conexão:** via jump pelo OpenGravity:
```bash
ssh opengravity
ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com
```
**DB Name (raiz):** `wordpress-353036313759`

---

## Acesso SSH

A conexão SSH é feita **via jump** pelo VPS OpenGravity (`77.37.69.175`), pois a chave `id_hostverge` está armazenada lá.

```bash
# 1. Conectar no OpenGravity
ssh opengravity

# 2. Do OpenGravity, conectar na Hostverge
ssh -i /root/.ssh/id_hostverge qmix.com.br@ssh.us.stackcp.com
```

Os sites ficam em `public_html/` dentro do home do usuário.

---

## Domínios nesta conta (30 sites)

agoranoticias.net, arlaproducao.com, cirurgiacoracao.com.br, cirurgiadacatarata.com.br, cirurgiadecancer.com.br, comprarsites, df8.com.br, exquisito, institutoortopedico.com.br, jornalcanalaberto.com.br, jornalconceito.com, medicinageriatrica, medicodasmaos.com.br, ocontraditorio.com, ortopediacoluna, ortopedistadeombro, planomedicosaude.com.br, pontonaturalbrasil, qmixdigital, revistadeducao, revistatopsaude.com.br, sabedoriaglobal, saudeacessivel.com.br, saudeemalta, saudevitalidade, saudicas.com.br, tendasbarbantech, viajenodetalhe, wtw19

---

## revistadeducao, sabedoriaglobal e exquisito: convertidos em 22/08/2026

Os tres **sairam desta hospedagem**: foram convertidos para o portal-engine da
opengravity (`77.37.69.175`) em 22/08/2026, e o DNS dos dois ja aponta para la.
Runbooks em `D:\PORTAIS\REVISTADEDUCAO\CONVERSAO.md`,
`D:\PORTAIS\SABEDORIAGLOBAL\CONVERSAO.md` e `D:\PORTAIS\EXQUISITO\CONVERSAO.md`.

- o acervo dos tres foi podado aqui **antes** de exportar. No revistadeducao, de
  3.551 posts sobraram 722; no sabedoriaglobal, de 2.533 sobraram 631; no
  exquisito, de 4.000 sobraram 388. Ficam os que carregam backlink de cliente no
  corpo ou tiveram clique em 90 dias
- as pastas `~/public_html/revistadeducao`, `~/public_html/sabedoriaglobal` e
  `~/public_html/exquisito` **ainda estao de pe**, de 1,2 a 1,3 GB cada, com o WordPress ja podado, servindo de rede
  de seguranca
- ⚠️ o `cd` para dentro dessas pastas falha aqui com "too many arguments" quando o
  comando vem de um `ssh` com aspas: usar `wp --path=<caminho>`
- ⚠️ **antes de apagar a pasta, salvar a credencial do banco.** O `rm -rf` leva o
  `wp-config.php` junto, e o banco fica orfao so removivel pelo painel. Ja
  aconteceu com o `u400588174_N3L85` na hostinger-anderson-gna
- os outros 27 sites desta conta seguem intactos

## Detalhes dos sites

| # | Pasta | Última modificação |
|---|-------|--------------------|
| 1 | agoranoticias.net | 2026-03-25 |
| 2 | arlaproducao.com | 2026-03-08 |
| 3 | cirurgiacoracao.com.br | 2026-03-19 |
| 4 | cirurgiadacatarata.com.br | 2026-01-22 |
| 5 | cirurgiadecancer.com.br | 2026-03-20 |
| 6 | comprarsites | 2026-01-22 |
| 7 | df8.com.br | 2026-03-25 |
| 8 | exquisito | 2026-03-30 |
| 9 | institutoortopedico.com.br | 2026-03-20 |
| 10 | jornalcanalaberto.com.br | 2026-01-22 |
| 12 | jornalconceito.com | 2026-03-25 |
| 13 | medicinageriatrica | 2026-03-30 |
| 14 | medicodasmaos.com.br | 2026-03-08 |
| 15 | ocontraditorio.com | 2026-03-11 |
| 16 | ortopediacoluna | 2026-03-30 |
| 17 | ortopedistadeombro | 2026-03-30 |
| 18 | planomedicosaude.com.br | 2026-03-20 |
| 19 | pontonaturalbrasil | 2026-03-27 |
| 20 | qmixdigital | 2026-01-22 |
| 21 | revistadeducao | 2026-03-25 |
| 22 | revistatopsaude.com.br | 2026-01-22 |
| 23 | sabedoriaglobal | 2026-03-30 |
| 24 | saudeacessivel.com.br | 2026-03-28 |
| 25 | saudeemalta | 2026-03-08 |
| 26 | saudevitalidade | 2026-03-30 |
| 27 | saudicas.com.br | 2026-03-20 |
| 28 | tendasbarbantech | 2026-03-22 |
| 29 | viajenodetalhe | 2026-03-30 |
| 30 | wtw19 | 2026-03-30 |

---

## Auditoria de segurança

O bot OpenGravity (Telegram) tem comando `/hostverge` que executa auditoria automática:
- Malware em pastas de assets
- Backdoors (eval+base64)
- Proteção de uploads (.htaccess)
- xmlrpc.php bloqueado
- wp-config.php protegido
- Arquivos PHP modificados nas últimas 24h
- Permissões de wp-config.php
- Espaço em disco

Código fonte: `C:\Users\User\Documents\OpenGravity\src\monitor\hostverge.ts`

---

## Notas

- Hospedagem compartilhada (shared) — sem acesso root
- Estrutura WordPress Multisite na raiz com subdiretórios por site em `public_html/`
- Algumas pastas não têm domínio associado (ex: `comprarsites`, `exquisito`, `medicinageriatrica`, `pontonaturalbrasil`, `qmixdigital`, `revistadeducao`, `sabedoriaglobal`, `saudeemalta`, `saudevitalidade`, `tendasbarbantech`, `viajenodetalhe`, `wtw19`)

## df8.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversão parcial
com backlinks. O DNS já aponta para lá. O WordPress continua neste servidor, em
`/home/sites/18a/7/7672b9147f/public_html/df8.com.br`, com o acervo podado de
2.294 para 414 posts, ocupando **1,2 GB**, aguardando decisão do Anderson sobre
apagar.

Arquitetura **AM**, "BANCA". Namespace da plataforma: `wkfd-api`. Documentação em
[`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\DF8\CONVERSAO.md`.

🔴 **Antes de apagar o diretório, salvar a credencial do banco** do
`wp-config.php`. O `rm -rf` leva o arquivo junto e o banco fica órfão nesta conta.

⚠️ O prefixo de tabela aqui é **`89_`**, e não `wp_`: consulta SQL escrita com
`wp_posts` devolve "table doesn't exist" e parece que o site não existe.

## pontonaturalbrasil.com.br saiu daqui em 23/08/2026

Migrado para o portal-engine da opengravity (77.37.69.175) por conversao parcial
com backlinks. O DNS ja aponta para la. O WordPress continua neste servidor, em
`/home/sites/18a/7/7672b9147f/public_html/pontonaturalbrasil`, com o acervo
podado de 2.096 para 261 registros, ocupando **1,1 GB**, aguardando decisao do
Anderson sobre apagar.

Arquitetura **AS**, "SINAL". Namespace da plataforma: `f4ef-api`. **Sem AdSense**,
igual a origem. Documentacao em
[`../Opengravity/README.md`](../Opengravity/README.md) e em
`D:\PORTAIS\PONTONATURALBRASIL\CONVERSAO.md`.

🔴 **Antes de apagar o diretorio, salvar a credencial do banco** do
`wp-config.php`. O `rm -rf` leva o arquivo junto e o banco fica orfao nesta conta.

⚠️ O prefixo de tabela aqui e **`86_`**, e nao `wp_`.

⚠️ A pasta era uma das listadas acima como "sem dominio associado": ela **tem**
dominio, e o `pontonaturalbrasil.com.br`. A lista de dominios da conta nao o
mostrava.
