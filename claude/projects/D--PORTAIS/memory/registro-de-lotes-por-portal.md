---
name: registro-de-lotes-por-portal
description: "Onde consultar quais portais já receberam lote de conteúdo SEO e qual cluster foi usado, e por que data não serve para descobrir isso"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-17T19:20:15.485Z
---

O registro de qual portal já recebeu lote de palavras-chave fica em
`D:\PORTAIS\REGISTRO-LOTES-SEO.md`. Levantado em 17/08/2026: 53 portais ativos,
38 já com lote, 15 ainda livres (6 na opengravity, 9 na hostinger-vps-srv1166087).

**Data e mtime não servem para descobrir isso.** A migração reescreveu `datePublished`
e o mtime de todos os arquivos da rede em 16 e 17/08/2026, então todo portal aparenta
ter sido alimentado ontem. O sinal confiável é a assinatura do nosso bloco de FAQ:
`grep -l '<h2>Perguntas frequentes' /srv/portais/*/data/*.json`.

Dois falsos positivos nessa varredura: parte do conteúdo migrado de cinema e novela
("resumo sem spoilers") também tem esse H2, e distingue-se pelo formato do slug
(lote nosso é slug de palavra-chave curto, migrado é manchete longa). E **autor não
distingue nada** — o pacote E-E-A-T atribuiu os autores fictícios também aos artigos
antigos, ver [[pacote-editorial-eeat]].

**Como aplicar:** consultar o arquivo antes de escolher o próximo portal e antes de
escolher o cluster, e acrescentar a linha do lote novo no mesmo momento em que publicar.
Só repetir portal ou cluster quando não houver mais nenhum livre. Quando o cluster
repetir, a checagem de originalidade em 8-gramas contra os artigos já publicados é
obrigatória: abaixo de 11% de sobreposição e zero frase idêntica.

Relacionado: [[conversao-total]], [[palavras-chave-e-entrega]],
[[registro-de-donos-de-slug]], [[iptv-legitimo-no-wtw19]].
