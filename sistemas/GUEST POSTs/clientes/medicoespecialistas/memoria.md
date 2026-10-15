# medicoespecialistas.com: diretório de médicos e clínicas por especialidade (nacional)

Memória do cliente para matérias em portais de terceiros. Criada em 14/10/2026, primeiro
lote no modo MCP sites do Jean.

- **Site:** medicoespecialistas.com (diretório próprio da QMIX, não é cliente externo)
- **Segmento:** diretório de médicos e clínicas, por especialidade/UF/cidade, com páginas
  de conteúdo e verificação (CRM, RQE, encaminhamento SUS)
- **Localização:** nacional
- **Credenciais verificadas:** n/a (diretório). Sem nome de médico/clínica/hospital
  específico como recomendação.
- **Regras editoriais específicas:** tema de saúde (YMYL), rigor factual obrigatório,
  siglas por extenso (CRM, RQE, SUS), nunca diagnosticar nem prometer cura, sempre com
  ressalva de que o diagnóstico cabe ao médico.
- **Lição herdada dos lotes anteriores (14/10/2026), aplicada aqui desde o início:**
  páginas /clinica/{nome}-{cnpj}/ e /estabelecimento/{nome}-{cnpj}/ são instáveis
  (entidades saem do diretório, risco de 404) — usar sempre /especialidades/,
  /verificacao/, /conteudo/ ou /medicos/{uf}/{cidade}/ como destino. Antes de afirmar a
  praça de um portal, confirmar em `portais-mapeados.md`.
- **Portais deste lote escolhidos pela editoria de Saúde**, diferentes dos 10 portais
  "padrão" já usados em contadoria/consultarimovel, para variar o perfil de link do
  diretório: jornalnoticiaonline, portoenoticias, alagoasdiario, abadianoticia,
  astralassessoria, agenciadivulgar, jornalpreliminar, itapecurunoticias,
  noticiasdefloriano, achixclip. alagoasdiario=Alagoas, abadianoticia=Abadiânia/GO,
  itapecurunoticias=Itapecuru-Mirim/MA, noticiasdefloriano=Floriano/PI; os demais sem
  praça fixa confirmada.
- **Instrução do operador para este lote (14/10/2026): maximizar links internos**,
  priorizando artigos recentes do próprio portal, só pular se genuinamente não houver
  candidato temático após busca ampla.
- **Ângulos ainda não usados:** endocrinologia (diabetes/tireoide), urologia, otorrino,
  gastroenterologia, geriatria, oncologia clínica, diferença entre clínico geral e
  especialista, telemedicina para especialista

## Âncoras já usadas (lote Jean novo, 14/10/2026)

| âncora | URL de destino | portal | praça real do portal | data |
|---|---|---|---|---|
| um cardiologista no diretório de especialistas | .../especialidades/cardiologia/ | jornalnoticiaonline.com.br | sem praça fixa | 14/10/2026 |
| dermatologistas cadastrados no diretório | .../especialidades/dermatologia/ | portoenoticias.com.br | sem praça fixa | 14/10/2026 |
| ortopedistas no diretório de especialistas | .../especialidades/ortopedia-e-traumatologia/ | alagoasdiario.com.br | Alagoas | 14/10/2026 |
| neurologistas cadastrados no diretório | .../especialidades/neurologia/ | abadianoticia.com.br | Abadiânia, GO | 14/10/2026 |
| verificar se o médico é especialista pelo CRM e RQE | .../verificacao/como-saber-se-o-medico-e-especialista/ | astralassessoria.com.br | sem praça fixa | 14/10/2026 |
| psiquiatras no diretório de especialistas | .../especialidades/psiquiatria/ | agenciadivulgar.com.br | sem praça fixa | 14/10/2026 |
| ginecologistas e obstetras cadastrados no diretório | .../especialidades/ginecologia-e-obstetricia/ | jornalpreliminar.com.br | sem praça fixa | 14/10/2026 |
| pediatras no diretório de especialistas | .../especialidades/pediatria/ | itapecurunoticias.com.br | Itapecuru-Mirim, MA | 14/10/2026 |
| como funciona o encaminhamento para especialista no SUS | .../conteudo/encaminhamento-para-especialista-no-sus/ | noticiasdefloriano.com.br | Floriano, PI | 14/10/2026 |
| oftalmologistas no diretório de especialistas | .../especialidades/oftalmologia/ | achixclip.com.br | sem praça fixa | 14/10/2026 |

## Temas e ângulos já cobertos (lote Jean novo, 14/10/2026)

- Sinais de que é hora de consultar um cardiologista (jornalnoticiaonline.com.br)
- Quando uma mancha ou pinta na pele precisa de avaliação médica (portoenoticias.com.br)
- Dor persistente na articulação: quando procurar um ortopedista (alagoasdiario.com.br)
- Dor de cabeça frequente: quando é hora do neurologista (abadianoticia.com.br)
- Como confirmar se o médico tem título de especialista (astralassessoria.com.br)
- Sinais de que é hora de buscar um psiquiatra (agenciadivulgar.com.br)
- Exames ginecológicos de rotina que não devem ser pulados (jornalpreliminar.com.br)
- Quando levar a criança ao pediatra fora da rotina (itapecurunoticias.com.br)
- Como funciona o encaminhamento para especialista no SUS (noticiasdefloriano.com.br)
- Sintomas de vista que não devem esperar a consulta de rotina (achixclip.com.br)

---

## Matérias publicadas via MCP (sites do Jean, lote novo)

Nota: o conector MCP "Sites Jean" do claude.ai esteve com erro 502 durante a redação, mas
a publicação real não depende dele — foi feita via o vault/scripts do `wp-mcp` no servidor
`gnd-motor` (SSH + bun), o mecanismo de sempre. Todos os 10 itens publicados e confirmados
no ar (HTTP 200) em 14/10/2026. **Lote 100% com links internos, nenhum item pulado.**
abadianoticia.com.br não resolve DNS no ambiente local da sessão (falha conhecida, não
afeta o site: confirmado 200 direto do servidor gnd-motor).

| data | portal | âncora (cliente) | rótulo do link interno | links internos | URL publicada |
|---|---|---|---|---|---|
| 14/10/2026 | jornalnoticiaonline.com.br | um cardiologista no diretório de especialistas | Leia também | inchaço e alteração de cor nos pés; alterações vasculares nas mãos | https://jornalnoticiaonline.com.br/saude/sinais-de-que-e-hora-de-consultar-um-cardiologista/ |
| 14/10/2026 | portoenoticias.com.br | dermatologistas cadastrados no diretório | Veja também | cotovelo escuro é normal; calor e exposição ao sol podem causar doenças | https://portoenoticias.com.br/saude/quando-uma-mancha-ou-pinta-na-pele-precisa-de-avaliacao-medica/ |
| 14/10/2026 | alagoasdiario.com.br | ortopedistas no diretório de especialistas | Leia também | dor externa no joelho em atletas; cãibras e desconfortos noturnos | https://alagoasdiario.com.br/saude/dor-persistente-articulacao-ortopedista/ |
| 14/10/2026 | abadianoticia.com.br | neurologistas cadastrados no diretório | Veja também | coluna cervical desgastada; estresse e açúcar no sangue | https://abadianoticia.com.br/saude/dor-de-cabeca-frequente-neurologista/ |
| 14/10/2026 | astralassessoria.com.br | verificar se o médico é especialista pelo CRM e RQE | Leia também | sintomas que não devem ser ignorados (compressão nervosa); cisto articular | https://astralassessoria.com.br/saude/confirmar-medico-especialista/ |
| 14/10/2026 | agenciadivulgar.com.br | psiquiatras no diretório de especialistas | Veja também | abstinência de álcool; ortopedista pelo convênio | https://agenciadivulgar.com.br/saude/sinais-buscar-psiquiatra/ |
| 14/10/2026 | jornalpreliminar.com.br | ginecologistas e obstetras cadastrados no diretório | Leia também | mancha no colo do útero; se o Primosiston corta a menstruação | https://jornalpreliminar.com.br/saude/exames-ginecologicos-rotina/ |
| 14/10/2026 | itapecurunoticias.com.br | pediatras no diretório de especialistas | Relacionadas | desenvolvimento infantil; vestir o bebê conforme a temperatura | https://itapecurunoticias.com.br/saude/quando-levar-crianca-pediatra/ |
| 14/10/2026 | noticiasdefloriano.com.br | como funciona o encaminhamento para especialista no SUS | Leia também | fisioterapia para dor lombar crônica; quando procurar especialista em joelho | https://noticiasdefloriano.com.br/saude/como-funciona-encaminhamento-para-especialista-pelo-sus/ |
| 14/10/2026 | achixclip.com.br | oftalmologistas no diretório de especialistas | Veja também | quando investigar dor no joelho (consulta por convênio); alterações na pele dos pés | https://achixclip.com.br/saude/sintomas-de-vista-que-nao-devem-esperar/ |

Categoria usada em todos os 10: Saúde (todos os portais deste lote têm essa categoria).

Cópias em `materias/n01.html` a `n10.html` (corpo validado, sem links internos),
`materias/n01.final.html` a `n10.final.html` (versão publicada), `materias/n01.meta.json`
a `n10.meta.json`, `materias/manifest.json` e `materias/resultado.json`.

Registrado também em `D:/PORTAIS/BACKLINKS/medicoespecialistas.com.xlsx` (aba Backlinks,
10 linhas, arquivo novo) e em `D:/PORTAIS/BACKLINKS/ledger.csv` (formato guest-post, host
jean-mcp).
