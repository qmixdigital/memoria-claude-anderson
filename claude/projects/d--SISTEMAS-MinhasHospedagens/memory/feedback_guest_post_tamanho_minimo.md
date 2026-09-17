---
name: feedback-guest-post-tamanho-minimo
description: Guest post da rede tem que passar de 1.000 palavras; meu padrão de ~640 foi reprovado pelo operador em 01/09/2026
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-02T00:31:56.779Z
---

Guest post de cliente na rede QMIX precisa ter **no mínimo 1.000 palavras de corpo**,
com alvo entre **1.100 e 1.300**. Em 01/09/2026 entreguei 65 artigos de 13 clientes com
mediana de 644 palavras e o operador respondeu: "me parece que há alguns erros. O
principal deles me pareceu a quantidade de textos". Ele estava certo, e a skill
`seo-optimizer` já pedia conteúdo bem mais longo para pauta informativa.

**Why:** o artigo curto cobre a keyword e não cobre as perguntas seguintes, então perde
para o concorrente que aprofunda. Além disso, guest post curto entrega pouco ao portal
hospedeiro, que é quem sustenta o link.

**How to apply:** a estrutura que passou na reauditoria tem **9 H2 e 6 H3**: os 6 H2
originais (incluindo FAQ e Resumo) mais **3 seções novas de 3 parágrafos cada** inseridas
antes do H2 de perguntas frequentes, mais **2 itens de FAQ** antes do H2 de Resumo. Cada
seção nova vale ~160 palavras. Não acrescentar link nenhum nas seções novas: o link do
cliente continua sendo o primeiro e o bloco "Leia também" continua com exatamente 2
internos, como manda [[feedback-padrao-links-guest-post]].

**Armadilha da linha fina:** ao expandir, a linha fina que estava abaixo de 60% de eco
pode passar do limite, porque o texto novo repete a ideia dela. Medir de novo depois de
expandir, nunca antes. Ver [[reference-portal-engine-dek-copia-meta]].

Ferramentas prontas em `scratchpad/exp/` da sessão: `baixar.py` (puxa o content gravado),
`aplicar.py` (insere seções e escolhe a linha fina de menor eco), `enviar.py` (grava,
rebuild, restart). Auditor genérico em `scratchpad/audit65.py`.
