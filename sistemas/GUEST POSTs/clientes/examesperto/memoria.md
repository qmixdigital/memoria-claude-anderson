# examesperto.com: diretório de laboratórios e clínicas de exames diagnósticos (nacional)

Memória do cliente para matérias em portais de terceiros. Criada em 14/10/2026, primeiro
lote no modo MCP sites do Jean.

- **Site:** examesperto.com (diretório próprio da QMIX, não é cliente externo)
- **Segmento:** diretório de laboratórios/clínicas de exames diagnósticos (sangue, imagem,
  endoscopia, ressonância), por UF/cidade/tipo de exame, com conteúdo de preparo e
  cobertura (SUS, convênio)
- **Localização:** nacional
- **Credenciais verificadas:** n/a (diretório, não é laboratório específico)
- **Regras editoriais específicas:** tema de saúde (YMYL), nunca diagnosticar, nunca
  prometer resultado, ressalva de que a interpretação cabe ao médico solicitante. Jejum de
  exame de sangue varia por exame/laboratório, nunca afirmar número único como regra
  universal.
- **Lição herdada dos lotes anteriores (14/10/2026), aplicada aqui desde o início:**
  páginas /laboratorio/{nome}-{cnpj}/ são instáveis (entidades saem do diretório, risco de
  404) — usar sempre /laboratorios/{uf}/{cidade}/[{tipo}/], /cobertura/, /preparo/ ou
  /conteudo/ como destino. Checar contaminação de links de saída (acompanhantes/IPTV) em
  qualquer página generalista usada como link interno.
- **Portais deste lote reusados do lote medicoespecialistas (mesma editoria de Saúde,
  encaixe temático direto para exames)**: jornalnoticiaonline, portoenoticias,
  alagoasdiario, abadianoticia, astralassessoria, agenciadivulgar, jornalpreliminar,
  itapecurunoticias, noticiasdefloriano, achixclip. alagoasdiario=Alagoas,
  abadianoticia=Abadiânia/GO, itapecurunoticias=Itapecuru-Mirim/MA,
  noticiasdefloriano=Floriano/PI; os demais sem praça fixa confirmada.
- **Instrução do operador para este lote (14/10/2026): maximizar links internos**,
  priorizando artigos recentes do próprio portal, só pular se genuinamente não houver
  candidato temático após busca ampla.
- **Ângulos ainda não usados:** exame de urina, exame pré-operatório, diferença entre
  convênio e particular, exame ocupacional/admissional, telemedicina para laudo

## Âncoras já usadas (lote Jean novo, 14/10/2026)

| âncora | URL de destino | portal | praça real do portal | data |
|---|---|---|---|---|
| laboratórios de endoscopia em Florianópolis | .../laboratorios/sc/florianopolis/endoscopia/ | jornalnoticiaonline.com.br | sem praça fixa | 14/10/2026 |
| laboratórios clínicos em Salvador | .../laboratorios/ba/salvador/laboratorio-clinico/ | portoenoticias.com.br | sem praça fixa | 14/10/2026 |
| quanto tempo demora um exame pelo SUS | .../cobertura/quanto-tempo-demora-exame-pelo-sus/ | alagoasdiario.com.br | Alagoas | 14/10/2026 |
| laboratórios em Goiânia | .../laboratorios/go/goiania/ | abadianoticia.com.br | Abadiânia, GO | 14/10/2026 |
| por que o laboratório pede para repetir um exame de sangue | .../conteudo/por-que-o-laboratorio-pede-para-repetir-exame-de-sangue/ | astralassessoria.com.br | sem praça fixa | 14/10/2026 |
| se pode beber álcool antes do exame de sangue | .../preparo/pode-beber-alcool-antes-do-exame-de-sangue/ | agenciadivulgar.com.br | sem praça fixa | 14/10/2026 |
| laboratórios em Salvador | .../laboratorios/ba/salvador/ | jornalpreliminar.com.br | sem praça fixa | 14/10/2026 |
| laboratórios em Campo Grande | .../laboratorios/ms/campo-grande/ | itapecurunoticias.com.br | Itapecuru-Mirim, MA | 14/10/2026 |
| ressonância magnética em Feira de Santana | .../laboratorios/ba/feira-de-santana/ressonancia-magnetica/ | noticiasdefloriano.com.br | Floriano, PI | 14/10/2026 |
| laboratórios em Pelotas | .../laboratorios/rs/pelotas/ | achixclip.com.br | sem praça fixa | 14/10/2026 |

## Temas e ângulos já cobertos (lote Jean novo, 14/10/2026)

- O que não comer antes de uma endoscopia (jornalnoticiaonline.com.br)
- O que significa jejum de 8 horas para exame de sangue (portoenoticias.com.br)
- Fila de exame pelo SUS: o que fazer enquanto espera (alagoasdiario.com.br)
- Exames de rotina que o clínico geral pode pedir (abadianoticia.com.br)
- Direito do paciente a entender o resultado do exame (astralassessoria.com.br)
- O que evitar na véspera de um exame de sangue (agenciadivulgar.com.br)
- Exame de imagem: quando o médico pede e por quê (jornalpreliminar.com.br)
- Exame de sangue em jejum: por quanto tempo realmente (itapecurunoticias.com.br)
- O que saber antes de fazer uma ressonância magnética (noticiasdefloriano.com.br)
- Diferença entre exame de rotina e exame por suspeita clínica (achixclip.com.br)

---

## Matérias publicadas via MCP (sites do Jean, lote novo)

Nota: o conector MCP "Sites Jean" do claude.ai esteve com erro 502 durante a redação, mas
a publicação real não depende dele — foi feita via o vault/scripts do `wp-mcp` no servidor
`gnd-motor` (SSH + bun), o mecanismo de sempre. Todos os 10 itens publicados e confirmados
no ar (HTTP 200) em 14/10/2026. **Lote 100% com links internos, nenhum item pulado.**

**Nota técnica sobre abadianoticia.com.br (item 04):** o subagente que escreveu o artigo não
conseguiu acessar o site da sua sandbox (timeout de DNS/conexão), igual já tinha acontecido
no lote garopaba.ia.br — o domínio resolve normalmente do servidor gnd-motor. Por isso os
links internos do item 04 foram pesquisados e inseridos depois, direto via gnd-motor
(candidatos "ferritina alta" e "estresse e açúcar no sangue", ambos artigos de exame de
sangue do próprio abadianoticia, outbound links conferidos e limpos).

| data | portal | âncora (cliente) | rótulo do link interno | links internos | URL publicada |
|---|---|---|---|---|---|
| 14/10/2026 | jornalnoticiaonline.com.br | laboratórios de endoscopia em Florianópolis | Leia também | doenças digestivas silenciosas; quem fez cirurgia de vesícula | https://jornalnoticiaonline.com.br/saude/o-que-nao-comer-antes-de-uma-endoscopia/ |
| 14/10/2026 | portoenoticias.com.br | laboratórios clínicos em Salvador | Mais sobre o tema | fígado gorduroso e resistência à insulina; úlcera no estômago | https://portoenoticias.com.br/saude/jejum-de-8-horas-para-exame-de-sangue/ |
| 14/10/2026 | alagoasdiario.com.br | quanto tempo demora um exame pelo SUS | Leia também | calendário vacinal do idoso; fisioterapia na recuperação pós-cirúrgica | https://alagoasdiario.com.br/saude/fila-exame-sus/ |
| 14/10/2026 | abadianoticia.com.br | laboratórios em Goiânia | Leia também | ferritina alta, o que o exame diz; estresse e açúcar no sangue | https://abadianoticia.com.br/saude/exames-rotina-clinico-geral-pedir/ |
| 14/10/2026 | astralassessoria.com.br | por que o laboratório pede para repetir um exame de sangue | Leia também | confirmar se o médico é especialista; cisto articular | https://astralassessoria.com.br/saude/direito-paciente-entender-resultado-exame/ |
| 14/10/2026 | agenciadivulgar.com.br | se pode beber álcool antes do exame de sangue | Veja também | abstinência de álcool; metabolismo na menopausa | https://agenciadivulgar.com.br/saude/evitar-vespera-exame-sangue/ |
| 14/10/2026 | jornalpreliminar.com.br | laboratórios em Salvador | Leia também | exames ginecológicos de rotina; duração do acompanhamento nutricional | https://jornalpreliminar.com.br/saude/exame-imagem-quando-medico-pede/ |
| 14/10/2026 | itapecurunoticias.com.br | laboratórios em Campo Grande | Veja também | pedra na vesícula; quando levar a criança ao pediatra | https://itapecurunoticias.com.br/saude/exame-sangue-jejum-quanto-tempo/ |
| 14/10/2026 | noticiasdefloriano.com.br | ressonância magnética em Feira de Santana | Leia também | nódulos ao redor do joelho; encaminhamento para especialista pelo SUS | https://noticiasdefloriano.com.br/saude/o-que-saber-antes-de-fazer-uma-ressonancia-magnetica/ |
| 14/10/2026 | achixclip.com.br | laboratórios em Pelotas | Veja também | sintomas de vista que não devem esperar; quando investigar dor no joelho | https://achixclip.com.br/saude/diferenca-entre-exame-de-rotina-e-exame-por-suspeita/ |

Categoria usada em todos os 10: Saúde.

Cópias em `materias/n01.html` a `n10.html`, `materias/n01.final.html` a `n10.final.html`,
`materias/n01.meta.json` a `n10.meta.json`, `materias/manifest.json` e
`materias/resultado.json`.

Registrado também em `D:/PORTAIS/BACKLINKS/examesperto.com.xlsx` (aba Backlinks, 10
linhas, arquivo novo) e em `D:/PORTAIS/BACKLINKS/ledger.csv` (formato guest-post, host
jean-mcp).
