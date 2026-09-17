---
name: reference_rede_jean_sites_parceiros
description: "Rede do Jean (38 sites WP de parceiro) - todos publicáveis pelo conector MCP \"Sites Jean\"; quais são jurídicos; onde está o cadastro e o perfil editorial"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-11T07:07:53.565Z
---

**Conferido em 11/09/2026:** os 38 domínios de `jean.csv` (em
`D:\SISTEMAS\Publicações em sites de parceiros WordPress\`) estão **todos** no
cofre do conector MCP `Sites Jean` (`listar_sites`), com `ativo: true` e
`permite_publicar: true`. Dá para publicar em qualquer um sem tocar em senha:
o conector já tem a senha de aplicativo. O slug do conector é o domínio sem
TLD (`canaljustica`, `ciberlex`, `professortrabalhista`; `jornal.seg.br` vira
`jornal`).

**Fonte do cadastro:** `jean.csv` (persona autora, domínio, senha de
aplicativo, login, e-mail). Só serve para acesso manual ao wp-admin; a
publicação normal vai pelo conector, com a skill
`materias-jornalisticas-linkbuilding` ([[reference_skill_materias_jornalisticas]]).

**Sites jurídicos da rede** (o que faz ela valer para cliente de advocacia):

| slug | domínio | linha editorial | REST API |
|---|---|---|---|
| `canaljustica` | canaljustica.jor.br | "Portal Jurídico, fique informado de seus direitos" | aberta |
| `ciberlex` | ciberlex.adv.br | "Informações Jurídicas", blog de direito geral | aberta |
| `professortrabalhista` | professortrabalhista.adv.br | direito trabalhista, aceita pauta fora do tema | aberta |

`jornal.seg.br` não é jurídico (notícia corporativa genérica), apesar do TLD.

**Sem perfil em `portais-mapeados.md`** (criar o perfil na primeira
publicação, passo 10 da skill): os 3 jurídicos acima, `jornal.seg.br`,
`babyou.com.br`, `amadahipertrofia.com` e os dois franceses
`chambre-hote-douarnenez.net` e `egea-immobilier.com` (não recebem conteúdo
em português). Os outros 30 já têm perfil.

**Personas por site** vêm na coluna `observacoes` do `listar_sites` (Alice
Carvalho, Miguel Pereira, Sofia Almeida, Lucas Souza, Julia Ribeiro, Beatriz
Oliveira, Pedro Oliveira, Ana Costa, Gabriel Santos).

**Registro de backlink feito** continua sendo a planilha por cliente em
`D:/PORTAIS/BACKLINKS/<cliente>.xlsx` ([[feedback_registro_backlinks_por_dominio]]),
mesmo quando o destino é site do Jean. Primeira campanha feita: advdobrasil.com.br,
página `/alongamento-de-divida-rural/`, 5 matérias em 11/09/2026 (os 3 jurídicos
+ apucarananoticias + noticiasdaserra), registro em `advdobrasil.com.br.xlsx`.

**Perfil dos 3 jurídicos** (criado em `portais-mapeados.md` em 11/09): todos
publicam guest post de qualquer área; `professortrabalhista` aceita pauta fora
do trabalhista. Categoria certa: canaljustica "Direitos" (2), ciberlex "Direito
Bancário e Financeiro" (233), professortrabalhista "Direito Trabalhista" (2).

**Imagem para esses portais:** foto de banco via `banco_img.py`, hospedada
temporariamente em `opengravity:/srv/portais/wtw19/public/img/tmp-<x>/`
(sai em `https://wtw19.com.br/img/tmp-<x>/...`) para o `subir_imagem` do
conector puxar, e apagada depois. O conector só aceita URL pública.
