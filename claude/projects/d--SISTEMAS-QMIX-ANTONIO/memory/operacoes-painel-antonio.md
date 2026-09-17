---
name: operacoes-painel-antonio
description: "Onde está a documentação de como cadastrar, ativar, desativar e excluir campanhas, destinos, autores, categorias e editores no painel QMIX Antônio"
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-08-17T18:50:51.355Z
---

O procedimento completo de cadastro, ativação, desativação e exclusão no painel
QMIX Antônio (acesso.qmix.com.br) está documentado em
`d:\SISTEMAS\QMIX ANTONIO\OPERACOES.md`, escrito a partir da leitura do código em
17/08/2026. Cobre `news_sources`, `wp_sites`, `wp_authors`, `wp_categories`,
`lc_users`, `lc_user_domains` e prompts, com o arquivo PHP responsável por cada
operação.

**Why:** o Anderson pediu que eu memorizasse esses procedimentos porque vai me
enviar dados para cadastrar direto, sem passar pela tela.

**How to apply:** ler o OPERACOES.md antes de qualquer cadastro ou remoção nesse
sistema. Os três pontos que mais geram erro: a `api_key` de `wp_sites` é gravada
cifrada com `encryptApiKey()`; `lc_user_domains.wp_author_id` recebe o `id`
interno de `wp_authors` e não o `id_autor` do site; excluir campanha em
`delete-news-source.php` apaga junto todas as `news_items` dela.
Ver também [[campanhas-desativadas-agosto-2026]] e [[sites-cliente-fora-da-publicacao]].
