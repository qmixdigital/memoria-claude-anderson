# GUEST POSTs: matérias para portais de terceiros

Pasta de trabalho dos artigos que o Anderson encaminha a portais de notícias (fora da
rede QMIX e fora do marketplace). Fluxo completo na skill global
`materias-jornalisticas-linkbuilding`, modo **painel**: a entrega é o link em
`conteudo.qmix.com.br/<token>`, gravado por `scripts/criar-materia.mjs` do qmix-next.

## Briefing esperado

Portal (domínio), URL(s) do cliente com a âncora exata de cada uma, e o segmento. Sem um
desses, perguntar antes de escrever. Pauta sempre aprovada antes da redação (2 ou 3 opções,
três linhas cada), salvo quando o briefing já traz o tema.

## Uma pasta por cliente (regra fixa)

```
clientes/
├── MODELO-memoria.md          modelo para cliente novo
└── <slug-do-cliente>/
    ├── memoria.md             dados, credenciais, regras, âncoras usadas, temas cobertos, entregas
    └── materias/
        ├── <slug-da-materia>.json   o que foi enviado ao criar-materia.mjs
        ├── <slug-da-materia>.html   corpo validado
        └── <slug-da-materia>.webp   foto entregue
```

- **Antes de escrever:** ler `clientes/<slug>/memoria.md`. É a fonte principal de âncoras
  já usadas, regras e temas cobertos do cliente. Se o cliente não tiver pasta, **criar na
  hora** a partir de `MODELO-memoria.md` (slug curto e reconhecível: `dr-fulano-tal`,
  `nome-da-empresa`), preenchendo o que o briefing e a pesquisa de credenciais derem.
- **Ao entregar:** salvar as três cópias em `materias/` e acrescentar a linha na tabela
  "Matérias entregues" da `memoria.md`, mais a âncora na tabela de âncoras e o tema na lista.
- **Quando o Anderson colar a URL publicada:** preencher a coluna "URL publicada".
- Slug da matéria: keyword principal em 3 a 5 palavras (`hernia-disco-cirurgia-goiania`).

Registros antigos: `memoria/` (export da memória do claude.ai de 14/09/2026) e
`clientes-recorrentes.md` em `D:\SISTEMAS\Publicações em sites de parceiros WordPress\`.
Já foram consolidados nas pastas dos clientes; consultar só em dúvida.

## Regras que valem sempre

- Sem travessão em nada. Título ≤ 70. Linha fina de 10 a 20 palavras, sem repetir o título.
- Foto de banco gratuito (`banco_img.py`), nunca IA sem ordem expressa.
- Cada âncora aparece uma vez, na primeira menção da marca ou do termo, o mais cedo
  possível, inclusive no primeiro parágrafo. Nunca no último (salvo a linha "Fonte:").
- Validador com 0 bloqueios e humanização ≥ 70 antes de gravar.
- Resposta ao Anderson em 3 linhas: link, portal, âncoras.
