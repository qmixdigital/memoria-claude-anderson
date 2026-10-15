# garopaba.ia.br: guia de cidade/diretório turístico (Garopaba, SC)

Memória do cliente para matérias em portais de terceiros. Criada em 14/10/2026, primeiro
lote no modo MCP sites do Jean.

- **Site:** garopaba.ia.br (diretório/guia próprio da QMIX, não é cliente externo)
- **Segmento:** guia turístico de Garopaba, SC: praias (Praia do Rosa, Siriú, Ferrugem),
  surfe, observação de baleias-francas, dunas, lagoas costeiras, hospedagem, clima,
  história, como chegar, diretório de empresas locais
- **Localização:** Garopaba, SC (destino do cliente); portais hospedeiros sem praça fixa
  ligada a SC
- **Credenciais verificadas:** n/a (diretório/guia, não é pousada/agência específica)
- **Regras editoriais específicas:** rigor factual em dado de temporada/distância/preço;
  sem nome de pousada/hotel/agência específica como recomendação; sem promessa de
  "garantia de avistamento" de baleias ou afirmação absoluta sobre natureza.
- **Lição herdada dos lotes anteriores (14/10/2026), aplicada aqui desde o início:**
  páginas /empresa/{nome}-{cnpj}/, /restaurantes/{nome}-{cnpj}/ e
  /hospedagem/{nome}-{cnpj}/ são instáveis (entidades saem do diretório, risco de 404) —
  usar sempre hubs como /hoteis/, /hospedagem/, /praias/{praia}/, /o-que-fazer/{atracao}/,
  /clima/, /historia/, /como-chegar/, /campings/.
- **Portais deste lote escolhidos pela editoria de Turismo/Viagem**: alagoas200,
  teixeiraemfoco, xthor, sp2040, jornal (jornal.seg.br), afnewss, webcitizen, portalgc,
  jornalbahia, agenciadivulgar. alagoas200=Alagoas, teixeiraemfoco=Teixeira de
  Freitas/BA, afnewss=Americana/SP, portalgc=Guanambi/BA, jornalbahia=Bahia; os demais
  (xthor, sp2040, jornal, webcitizen, agenciadivulgar) sem praça fixa confirmada.
- **Instrução do operador para este lote (14/10/2026): maximizar links internos**,
  priorizando artigos recentes do próprio portal, só pular se genuinamente não houver
  candidato temático após busca ampla.
- **Ângulos ainda não usados:** surfe em Garopaba (nível de onda, época), trilhas
  ecológicas, gastronomia local (frutos do mar), vida noturna, Praia da Ferrugem,
  mirante/pôr do sol, viagem em família vs. viagem de mochilão

## Âncoras já usadas (lote Jean novo, 14/10/2026)

| âncora | URL de destino | portal | praça real do portal | data |
|---|---|---|---|---|
| hotéis em Garopaba no diretório | .../hoteis/ | alagoas200.com.br | Alagoas | 14/10/2026 |
| onde ficar em Garopaba | .../hospedagem/ | teixeiraemfoco.com.br | Teixeira de Freitas, BA | 14/10/2026 |
| guia da Praia do Rosa | .../praias/praia-do-rosa/ | xthor.com.br | sem praça fixa | 14/10/2026 |
| dunas do Siriú em Garopaba | .../o-que-fazer/dunas-do-siriu/ | sp2040.net.br | sem praça fixa | 14/10/2026 |
| campings em Garopaba | .../campings/ | jornal.seg.br | sem praça fixa | 14/10/2026 |
| observação de baleias-francas em Garopaba | .../o-que-fazer/baleias/ | afnewss.com.br | Americana, SP | 14/10/2026 |
| clima de Garopaba mês a mês | .../clima/ | webcitizen.com.br | sem praça fixa | 14/10/2026 |
| história de Garopaba | .../historia/ | portalgc.com.br | Guanambi, BA | 14/10/2026 |
| como chegar a Garopaba | .../como-chegar/ | jornalbahia.com.br | Bahia | 14/10/2026 |
| Lagoa de Garopaba | .../o-que-fazer/lagoa-de-garopaba/ | agenciadivulgar.com.br | sem praça fixa | 14/10/2026 |

## Temas e ângulos já cobertos (lote Jean novo, 14/10/2026)

- Dicas para escolher hospedagem em praia badalada (alagoas200.com.br)
- Hostel ou pousada: qual escolher perto da praia (teixeiraemfoco.com.br)
- Melhor época para visitar praias badaladas do litoral sul (xthor.com.br)
- Passeio de bugre em dunas: o que saber antes de ir (sp2040.net.br)
- Itens essenciais para acampar perto da praia (jornal.seg.br)
- Observação de baleias no litoral sul: quando e onde ver (afnewss.com.br)
- Melhor época do ano para viajar ao litoral de Santa Catarina (webcitizen.com.br)
- De vila de pescadores a destino turístico: a história por trás (portalgc.com.br)
- Roteiro de viagem de carro para o litoral sul de SC (jornalbahia.com.br)
- Lagoas costeiras: passeio de stand up paddle e caiaque (agenciadivulgar.com.br)

---

## Matérias publicadas via MCP (sites do Jean, lote novo)

Nota: o conector MCP "Sites Jean" do claude.ai esteve com erro 502 durante a redação, mas
a publicação real não depende dele — foi feita via o vault/scripts do `wp-mcp` no servidor
`gnd-motor` (SSH + bun), o mecanismo de sempre. Todos os 10 itens publicados e confirmados
no ar (HTTP 200) em 14/10/2026. **Lote 100% com links internos, nenhum item pulado.**

**ACHADO IMPORTANTE deste lote, guardar para próximos lotes de turismo nos portais Jean:**
várias páginas de Turismo/Viagens destes portais generalistas têm link de saída escondido
para serviço de acompanhantes (Oklute, musaclass.com.br), não só para concorrentes de IPTV
como os lotes anteriores alertavam. Descoberto em alagoas200 e teixeiraemfoco (páginas
descartadas: "Descubra Maceió de um jeito diferente", "Maceió, sol, encontros e segredos à
beira-mar", "João Pessoa além das praias"). Em todos os itens deste lote, antes de usar um
link interno, abriu-se a página candidata e conferiu-se TODOS os links de saída do corpo
(não só o tema) — nenhum dos 20 links internos finais tem esse problema.

| data | portal | âncora (cliente) | rótulo do link interno | links internos | URL publicada |
|---|---|---|---|---|---|
| 14/10/2026 | alagoas200.com.br | hotéis em Garopaba no diretório | Leia também | Natal muda conforme o tipo de viagem; dicas para férias em família memoráveis | https://alagoas200.com.br/turismo/dicas-escolher-hospedagem-praia-badalada/ |
| 14/10/2026 | teixeiraemfoco.com.br | onde ficar em Garopaba | Veja também | Parque das Aves em Foz do Iguaçu; charme do vilarejo sem carros na Holanda | https://teixeiraemfoco.com.br/turismo/hostel-ou-pousada-qual-escolher/ |
| 14/10/2026 | xthor.com.br | guia da Praia do Rosa | Leia também | o que levar para a praia; aluguel de carros na Páscoa | https://xthor.com.br/melhor-epoca-visitar-praias-litoral-sul/ |
| 14/10/2026 | sp2040.net.br | dunas do Siriú em Garopaba | Veja também | esportes radicais no Brasil; passeios de lancha no Brasil | https://sp2040.net.br/turismo/passeio-bugre-dunas/ |
| 14/10/2026 | jornal.seg.br | campings em Garopaba | Leia também | hospedagem em Porto de Galinhas; hotéis com vista para o mar | https://jornal.seg.br/turismo/itens-essenciais-acampar-perto-praia/ |
| 14/10/2026 | afnewss.com.br | observação de baleias-francas em Garopaba | Veja também | resort all inclusive; o que fazer em Aruanã | https://afnewss.com.br/viagem/observacao-baleias-litoral-sul/ |
| 14/10/2026 | webcitizen.com.br | clima de Garopaba mês a mês | Mais sobre o tema | passeio volta ilha em Morro de São Paulo; resort em Porto de Galinhas | https://webcitizen.com.br/melhor-epoca-viajar-litoral-santa-catarina/ |
| 14/10/2026 | portalgc.com.br | história de Garopaba | Leia também | Lençóis Maranhenses; Copacabana, Ipanema ou Barra | https://portalgc.com.br/turismo/vila-pescadores-destino-turistico-garopaba/ |
| 14/10/2026 | jornalbahia.com.br | como chegar a Garopaba | Leia também | comprar passagem aérea barata; roteiro de ilhas da Bahia | https://jornalbahia.com.br/turismo/roteiro-viagem-carro-litoral/ |
| 14/10/2026 | agenciadivulgar.com.br | Lagoa de Garopaba | Veja também | seguro viagem Europa; praias para ver baleias no Brasil | https://agenciadivulgar.com.br/turismo/passeio-stand-up-paddle-lagoa-costeira/ |

Categorias usadas: Turismo (alagoas200, teixeiraemfoco, xthor, sp2040, jornal, portalgc,
jornalbahia, agenciadivulgar), Viagem (afnewss), Viagens e Turismo (webcitizen).

Cópias em `materias/n01.html` a `n10.html`, `materias/n01.final.html` a `n10.final.html`,
`materias/n01.meta.json` a `n10.meta.json`, `materias/manifest.json` e
`materias/resultado.json`.

Registrado também em `D:/PORTAIS/BACKLINKS/garopaba.ia.br.xlsx` (aba Backlinks, 10 linhas,
arquivo novo) e em `D:/PORTAIS/BACKLINKS/ledger.csv` (formato guest-post, host jean-mcp).
