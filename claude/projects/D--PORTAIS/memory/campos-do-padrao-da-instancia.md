---
name: campos-do-padrao-da-instancia
description: "Os campos do sites.json que faltam calados em portal recém-convertido: ns sem /v1, categoryMap vazio, indexnowKey ausente"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-21T18:47:11.472Z
---

Conversão nova sai torta em silêncio nestes campos. Nenhum dá erro; todos custam
alguma coisa:

| campo | padrão da instância | o que quebra se faltar |
|---|---|---|
| `ns` | termina em `/v1` | nada funcional, porque o receptor casa por `/artigos$`; mas o campo passa a mentir sobre o contrato e o próximo a ler monta a rota errada |
| `apikey` | 64 caracteres | tem que ser **a mesma** que está gravada na plataforma |
| `categoryMap` | preenchido | a plataforma manda a categoria como **número**; sem o mapa, todo conteúdo novo cai na editoria padrão e a editoria certa fica vazia por semanas |
| `indexnowKey` | presente | o motor não avisa Bing, Yandex e Seznam ao publicar, e não escreve o `.txt` de verificação no rebuild |

Os IDs do `categoryMap` saem da tabela da própria plataforma, nunca de numeração
inventada:

```sql
SELECT id_categoria, nome_categoria FROM boot_qmixmarketplac.wp_categories
WHERE dominio LIKE '%DOMINIO%' ORDER BY id_categoria;
```

A chave de IndexNow é derivada do slug, `sha256("indexnow:"+slug)[:32]`, e não
sorteada: sorteio faria um rebuild futuro gerar outra e invalidar o `.txt` que o
Bing já tinha verificado.

Descoberto em 21/08/2026: ao viajenodetalhe faltavam os três, e o `qmixdigital`,
convertido antes, estava sem a chave de IndexNow pelo mesmo descuido.

Ver [[wp-json-com-til-engole-o-receptor]] e [[plataforma-antonio-acesso]].
