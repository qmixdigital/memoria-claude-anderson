---
name: reference_titulos_vazamento_prompt
description: "75 artigos da rede tinham o raciocínio da IA publicado como título (\"Hmm, o usuário pede um título jornalístico...\") - varridos e reescritos em 06/08/2026; inclui a armadilha de regex que pegava manchete legítima"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-06T09:48:03.197Z
---

A plataforma que gera os artigos às vezes devolve o **raciocínio do modelo** em vez do título, e isso foi salvo e publicado. Varredura de 06/08/2026 achou **75 casos em 47 sites** da rede (clientes fora).

**Correção aplicada:** 74 títulos reescritos à mão, um por um, e 1 despublicado (portalr5 #248, cujo *corpo* também estava quebrado: "Não foi possível processar o conteúdo fornecido para reescrita"). Scripts em `D:\SISTEMAS\MinhasHospedagens\scripts\`: `qmix-scan-titulos-vazados.php` e `qmix-aplicar-titulos.php`; mapa do que foi trocado em `qmix-titulos-corrigidos-20260806.tsv`.

**ARMADILHA da detecção:** a primeira regex incluía palavras soltas de início de frase (`primeiro|preciso|analisando|bem|certo`) e pegou **manchete legítima** — "Primeiro panda-gigante da Indonésia é apresentado", "Preciso de contabilidade na minha empresa?". Deu 90 falsos-positivos misturados. Só valem sinais fortes: `hmm` no início, `usuário pede/pediu/solicita`, `título jornalístico`, `com base nas informações fornecidas`, `o título deve/original`, `limite de N caracteres`. Com o critério estrito caiu para 75, todos verdadeiros.

**Regras seguidas na troca:**
- **Slug intocado.** Só o `post_title` muda; a URL indexada e os backlinks apontam para ela.
- **`post_modified` preservado** (gravação via `$wpdb->update`), porque dezenas de portais com o mesmo timestamp é rastro de rede. Mesma regra do [[reference_link_removal_system]].
- Título antigo salvo em post meta `oie_titulo_original` (reversível).
- `rank_math_title` / `_seopress_titles_title` apagados quando também traziam o texto vazado.
- **Uma manchete distinta por registro.** Os artigos são sindicados (o mesmo texto sobre Lula aparece em 39 portais), então título repetido seria conteúdo duplicado e footprint. Foram escritas 39 variações para o tema Lula, 13 para BTS, 6 Dumont, 5 Xuxa, 5 eclipse, 3 Receita, 1 Anvisa, 2 Richard Gere.

**Vale revarrer periodicamente:** a origem do defeito é a plataforma de geração, que não foi corrigida. Enquanto ela publicar, novos casos aparecem.
