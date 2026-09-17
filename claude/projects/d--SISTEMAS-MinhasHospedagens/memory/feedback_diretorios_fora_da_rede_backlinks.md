---
name: feedback_diretorios_fora_da_rede_backlinks
description: "REVISADO 24/08/2026: diretório de SAÚDE que não é de cliente PODE receber guest post. O resto dos diretórios segue fora de operação de link."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ff073d04-b42e-4ad5-9015-d0ea634575dc
  modified: 2026-08-14T09:11:13.713Z
---

Ordem do Anderson em 14/08/2026: **os diretórios não fazem parte, e nunca
fizeram, do sistema de backlinks.**

São os apps **Next.js de diretório**, entre eles: `bitcao.com.br`,
`cirurgiadacatarata.com.br`, `cirurgiadecancer.com.br`, `cirurgiacoracao.com.br`,
`medicinageriatrica.com.br`, `desentupidora.pro`, `setorenergetico.com.br`,
`masterjuris.com.br`, `clinicasrecuperacaosaopaulo.com`,
`casasderecuperacao.com.br`, `encontreleiloes.com.br`, `arcondicionadotop.com`,
`geladeirastop.com`, `distribuidorasdealimentos.com.br` — e **qualquer outro
diretório**, atual ou futuro.

**Why:** diretório é produto próprio (fichas de empresa, base pública, receita de
anúncio/assinatura), não veículo de publicação. Backlink de cliente, inserção de
âncora, campanha de link e varredura de link externo pertencem à **rede de
portais de conteúdo** — os WordPress e os portal-engine.

**How to apply:** ao montar qualquer operação de backlink (inserir link/âncora,
injetar vídeo em artigo de SEO, varrer ou remover link externo, montar lista de
domínios), a lista de alvos sai da allowlist de portais
(`scripts/qmix-video-backlinks-sites.txt` e equivalentes) — **nunca** de um loop
que varre todos os apps ou todas as pastas de WordPress do servidor. Se um script
de backlink der match num diretório, é sinal de erro de escopo, não de sucesso.
Vale também para o WordPress fantasma que sobrou no disco depois da conversão
para Next: ver [[reference_dominios_saude_viraram_diretorio_next]].

Distinto de [[feedback_sites_clientes_rede]] (sites de clientes) e de
[[feedback_adsense_somente_lista_autorizada]] (AdSense): são três listas
diferentes, com escopos diferentes.

---

## REVISÃO DE 24/08/2026 — o operador afinou a regra

Palavras dele: *"os sites em Next eram de clientes, mas eu converti alguns sites de
saúde em diretório, e eles estão dando tráfego. Então, os sites de saúde que não são
de clientes podem entrar também no sistema de guest post."*

**Passa a valer:**

- **Diretório de saúde que NÃO é de cliente → pode receber guest post.** Confirmados
  nesta categoria: `medicinageriatrica.com.br`, `cirurgiadecancer.com.br`,
  `cirurgiacoracao.com.br`, `cirurgiadacatarata.com.br`, `casasderecuperacao.com.br`.
  Eles nasceram de sites de saúde da rede convertidos em diretório e **já dão tráfego
  orgânico** — medido em 24/08: cirurgiacoracao 203 cliques/92.891 impressões em 90d,
  casasderecuperacao 1.407/158.527, medicinageriatrica 29/13.944 na posição média 42.
- **Continua fora:** diretório que é produto de cliente, e os diretórios de nicho não
  relacionado (`bitcao`, `desentupidora.pro`, `setorenergetico`, `masterjuris`,
  `encontreleiloes`, `geladeirastop`, `arcondicionadotop`, `palpitemestre`,
  `personalverificado`, `distribuidorasdealimentos`).
- **Na dúvida entre cliente e diretório, perguntar** — mas o operador espera que dê
  para distinguir sozinho: site de cliente tem marca de um profissional ou clínica
  (`blog.cirurgiadojoelho`, `ortopediacoluna`, `ortopedistadeombro`,
  `blog.drthiagotredicci`), diretório tem nome genérico do nicho e lista/ficha de
  vários prestadores.

**Por que isso importa para pauta:** diretório de saúde é o melhor destino temático
que a rede tem para conteúdo médico. `medicinageriatrica` em especial: geriatria
cobre queda em idoso, fratura do rádio distal, artrose, osteófito e edema ósseo,
e o site está na posição 42 — o Google já mostra, só não bem o suficiente.
