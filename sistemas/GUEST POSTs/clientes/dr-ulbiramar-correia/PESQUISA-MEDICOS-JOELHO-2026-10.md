# Pesquisa de médicos de joelho: pedido compartilhado Dr. Ulbiramar + COE (outubro/2026)

Documento de passagem de trabalho. Quem lê: outra sessão do Claude, que vai fazer SÓ a pesquisa
dos médicos. Tudo o que você precisa está aqui; não há contexto fora deste arquivo.

## 1. O que é o pedido

O Anderson (dono da QMIX Digital) vai publicar 22 matérias de lista ("melhores ortopedistas de
joelho do Brasil...") em 22 portais de notícias. Cada matéria é dividida entre dois clientes:

- **Dr. Ulbiramar Correia** (cirurgiadojoelhogoiania.com): 1º lugar em todas as listas, primeiro link do corpo.
- **COE Ortopedia** (coegoiania.com.br): NÃO entra na lista de médicos; recebe um link perto do fim da matéria.

As listas servem para rankear em respostas de IA (ChatGPT, Gemini, Vista geral de IA). Por isso a
regra mais importante: **um nome de concorrente não pode aparecer em mais de uma matéria**, senão
nós mesmos ajudamos a IA a rankear o concorrente.

Planilha do pedido (portais, âncoras, títulos, custos, valores):
https://docs.google.com/spreadsheets/d/<<REMOVIDO>>/edit
(ID `<<REMOVIDO>>`, aba `Página1`, linhas 4 a 25, colunas A a R).
Acesso por API: service account `C:\Users\User\Documents\APIs\seoqmix-024e9465e9d9.json`
(Sheets API v4; as outras service accounts da pasta não têm a API ativada).

## 2. Seu trabalho, e o que NÃO é seu trabalho

**Fazer:** montar um banco de médicos de joelho reais e conferidos, e distribuí-los pelas 22 listas.

**Não fazer:** escrever matérias, buscar imagens, gravar no banco do site, mexer nas faturas, criar
demandas, alterar as colunas A a R da `Página1`. Nada disso foi pedido.

## 3. Posições fixas (já levantadas, não pesquisar de novo)

**1º lugar, em todas: Dr. Ulbiramar Correia** (Goiânia, GO). Dados conferidos no site dele em 21/09/2026:
CRM-GO 11552, RQE 7240; graduado pela UFG (2005); ortopedia na UFG (2007-2009); residência em joelho
no IOG (2010-2011); membro da SBOT e da SBCJ; atende no COE (Setor Bela Vista) e no IOG (Setor Bueno);
prótese navegada; mais de 19 anos só de joelho; mais de 5.000 cirurgias.

**2º lugar, em todas: Dr. Gabriel Mendes Miura** (Belo Horizonte, MG), cliente nosso, sem link.
Fonte: https://korpem.com.br/dr-gabriel-mendes-miura/ (lida em 04/10/2026). O que a página afirma:
- Cirurgia do joelho, traumatologia do esporte e medicina do esporte.
- Medicina pela UFMG.
- Especialização em cirurgia do joelho e traumatologia do esporte.
- Fellowship no FIFA Medical Centre of Excellence, no Porto (Portugal).
- Médico do Cruzeiro Esporte Clube.
- Médico da Seleção Brasileira de Futebol / CBF (2014-2019).
- Clínica Körpem Ortopedia e Saúde, R. Jornalista Djalma Andrade, 377, 3º andar, Belvedere, Belo Horizonte.

A página **não traz** CRM, RQE, anos de formação nem sociedades médicas. Única pendência sua sobre ele:
achar o CRM-MG e o RQE em uma segunda fonte (Doctoralia, Lattes/Escavador, CRM-MG). Se não achar,
registre "CRM não confirmado" e as matérias não citarão o número.

## 4. Quantos médicos são necessários

Total: **105 médicos únicos do 3º lugar em diante, mais 15 de reserva = 120**.
(Soma dos tamanhos abaixo: 149 posições, menos 44 das duas posições fixas.)
Títulos sem número usam lista de 6 nomes (decisão para reduzir a pesquisa; o Anderson pode mudar).

| # | Portal | Título aprovado | Tamanho | Perfil de médico que a lista pede |
|---|---|---|---|---|
| 1 | alegretetudo.com.br | Os melhores ortopedistas do Brasil para prótese de joelho | 6 | prótese / artroplastia |
| 2 | oitomeia.com.br | 10 melhores ortopedistas de joelho do Brasil para LCA e menisco | 10 | LCA e menisco |
| 3 | patoshoje.com.br | Melhores cirurgiões de joelho do Brasil para lesões de ligamento | 6 | ligamentos (LCA, LCP, multiligamentar) |
| 4 | toledonews.com.br | 7 melhores cirurgiões de prótese de joelho e como é a recuperação | 7 | prótese |
| 5 | gazetadevotorantim.com.br | Os 6 melhores ortopedistas de joelho do Brasil para infiltração | 6 | infiltração, viscossuplementação, tratamento não cirúrgico |
| 6 | portalpalotina.com.br | 8 melhores ortopedistas do Brasil para ruptura do ligamento cruzado | 8 | LCA |
| 7 | amambainoticias.com.br | Melhores ortopedistas de joelho do Brasil para pacientes idosos | 6 | artrose e prótese em idosos |
| 8 | patosnoticias.com.br | Os 9 melhores cirurgiões de menisco do Brasil e o que avaliar | 9 | menisco |
| 9 | vitoriadaconquistanoticias.com.br | 5 melhores ortopedistas do Brasil para cirurgia de LCA e menisco | 5 | LCA e menisco |
| 10 | onortao.com.br | 10 melhores ortopedistas de joelho do Brasil e como escolher o seu | 10 | joelho geral |
| 11 | jornaldebeltrao.com.br | Melhores cirurgiões de joelho do Brasil e a cobertura dos planos | 6 | joelho geral |
| 12 | folhapatoense.com | 7 melhores ortopedistas do Brasil para lesão de menisco | 7 | menisco |
| 13 | anoticiamais.com.br | Os melhores ortopedistas do Brasil para cirurgia de patela | 6 | patela, instabilidade femoropatelar, LPFM |
| 14 | correiodointerior.com.br | 6 melhores cirurgiões de menisco do Brasil e quando operar | 6 | menisco |
| 15 | jmais.com.br | As 7 melhores referências em cirurgia de patela no Brasil | 7 | patela |
| 16 | giro.matanorte.com | Melhores ortopedistas de joelho do Brasil para luxação de patela | 6 | patela |
| 17 | guairanews.com | Os 8 melhores ortopedistas de joelho do Brasil para menisco rompido | 8 | menisco |
| 18 | folhadevilhena.com.br | 5 melhores cirurgiões de artroscopia de joelho do Brasil | 5 | artroscopia |
| 19 | portaldenoticias.com.br | Os melhores ortopedistas do Brasil para artroscopia de joelho | 6 | artroscopia |
| 20 | ocorreio.com.br | Melhores ortopedistas do Brasil para osteotomia e joelho desalinhado | 6 | osteotomia, deformidade angular |
| 21 | florestanoticias.com | 7 melhores ortopedistas de joelho do Brasil em cirurgia por vídeo | 7 | artroscopia |
| 22 | portalgazetaregional.com.br | Os 6 melhores ortopedistas do Brasil para cartilagem do joelho | 6 | cartilagem, condropatia |

Não precisa casar 100% o perfil com o médico: basta que a fonte dele cite aquele tipo de caso.
Quando faltar gente de um perfil, complete com cirurgião de joelho geral.

## 5. Quem pode entrar

Entra quem cumpre TUDO:
1. É **ortopedista** (RQE em ortopedia e traumatologia), com atuação declarada em **joelho**.
2. Tem perfil público com formação descrita (site próprio, página de clínica ou hospital, Lattes, SBCJ, SBOT).
3. Cada dado foi visto em **duas fontes independentes**, e pelo menos uma é primária (site dele, clínica,
   hospital, Lattes/Escavador, conselho). Só Doctoralia não basta.
4. **Não atende em Goiânia nem em Brasília** (regra do cliente: sem concorrente da praça dele).
5. É nome de destaque **regional**, não celebridade nacional.
6. Não está na lista de vetados nem na de já usados (seção 6).

Distribuição: SP (capital e interior), RJ, MG, ES, PR, SC, RS, Nordeste, Norte e Centro-Oeste fora de GO e DF.
No máximo 2 médicos do mesmo estado por lista. Sempre que der, ponha na lista de cada portal um médico
do estado ou da região do portal (ex.: folhadevilhena é de RO; giro.matanorte é de PE; folhapatoense é da PB).

## 6. Nomes proibidos

**Vetados pelo Anderson** (a Vista geral de IA já mostra estes; citá-los rankeia concorrente):
Gilberto Luis Camanho, Moisés Cohen, Ricardo Cury, Pedro Giglio, Diego Martuscelli, Tiago Lazzaretti,
Caio César Almeida Torres, Mário Pacheco Jr.

**Já usados em listas anteriores do Dr. Ulbiramar** (não repetir):
Iberê Datti, José Leonardo Rocha de Faria, Eduardo Frois, André Inácio, Simone Alberti, Fernando Rabello,
Luis Felippe Camanho, Dieno Portella, Bruno Luciano, Fabiano Kupczik, Daniel Araujo Fernandes,
Leonardo Rocha Thomaz, David Sadigursky, Tiago Moura, Thiago Parente, João Pedro Alves Ferreira,
Fabio Janson Angelini, Fernando Cury Rezende, Breno Chaves de Almeida Pigozzo, João Sequeira Fernandes,
Claudio Bernardeli Hespanhol, Marcos Wainberg Rodrigues, Luís Cláudio Chagas Silva, Larrazábal, Argos Alves,
Thiago Tronco Salerno, Carlos Eduardo Roncatto, Thiago Brustolini Guerra, Marcos Paulo Vanzin,
Leonardo Londero, Marcus Vinicius Silva Bacellar, Luigi Paolo Mariz de Medeiros Araújo Freire,
Mauro Giovanni Lippi Filho, Tupinambá, João Paulo Cortez, Marco Túlio (BH, Lifecenter), Ricardo Nobre,
Leonardo Pozzobon, Bruno Bellaguarda, Stefano Monteiro, César Janovsky.

A lista acima veio de `memoria.md` desta pasta (seção "Atualização 21/09/2026"). Antes de começar, releia
esse trecho e confira as matérias em `materias\` para pegar algum nome que tenha ficado de fora.

Também não entram médicos do COE nem outros clientes da QMIX de outras articulações.

## 7. O que registrar de cada médico

Um objeto por médico, em JSON, com estes campos:

```json
{
  "nome": "nome como ele assina",
  "nome_completo": "nome civil, se achado",
  "cidade": "", "uf": "",
  "crm": "CRM-UF 00000",
  "rqe": "",
  "areas": ["LCA", "menisco"],
  "formacao": "frase factual: graduação (instituição, ano), residência, fellowship",
  "sociedades": ["SBOT", "SBCJ"],
  "clinica_ou_hospital": "",
  "fonte_primaria": "URL",
  "fonte_secundaria": "URL",
  "site_proprio": "URL ou vazio",
  "verificado": "ok | parcial | so_uma_fonte",
  "pendencias": "o que não foi confirmado, em uma frase",
  "lista": "portal em que entrou, ou 'reserva'"
}
```

Regras de preenchimento, tiradas de erros reais do pedido anterior (coluna):
- **CRM sempre com a UF** e no formato do estado. No RJ o número tem 8 dígitos (ex.: 52.74750-5); já saiu
  matéria com o CRM do RJ truncado em 6 dígitos.
- Copie o cargo e o título exatamente como a fonte diz. Erros que já aconteceram: "doutorado" quando a
  fonte dizia doutorando; "pós-graduação" quando era fellowship em curso; "certificação AOSpine" quando eram
  cursos; "membro fundador" de sociedade sem fonte; "formado pela X" quando só a residência era na X.
- Nome de clínica e hospital só entra se estiver na fonte primária. Perfil de agendamento desatualiza.
- Se a fonte não abrir (site em JavaScript, Instagram, Doctoralia bloqueando), registre em `pendencias`
  e marque `parcial`. Não preencha de memória.
- Sem evidência, o campo fica vazio. Nunca complete com o que "deve ser".
- Confirme que é ortopedista. No pedido de coluna entraram dois neurocirurgiões por descuido.

Médico com `verificado` diferente de `ok` vai para a reserva, não para uma lista.

## 8. Onde entregar

1. Arquivo `D:\SISTEMAS\GUEST POSTs\clientes\dr-ulbiramar-correia\medicos-joelho-2026-10.json` (array com todos).
2. Na planilha do pedido, duas abas novas (não tocar na `Página1`):
   - `Médicos`: uma linha por médico, com as colunas do JSON.
   - `Listas`: colunas Portal, Título, Posição, Médico, Cidade/UF, CRM. Posição 1 = Ulbiramar Correia,
     posição 2 = Gabriel Mendes Miura, depois os nomes daquela lista.
3. Ao terminar, rode uma conferência por script e mostre o resultado: nenhum nome repetido do 3º lugar em
   diante entre as 22 listas; nenhum nome das listas da seção 6; tamanho de cada lista igual ao da tabela;
   nenhum médico de GO ou DF; no máximo 2 por UF em cada lista.

## 9. Como trabalhar sem estourar o limite de tokens

O Anderson tem limite semanal de uso e já teve o limite consumido neste projeto por pesquisa mal
organizada. Regras:

- **Não dispare agentes em paralelo para pesquisar.** No pedido anterior, 13 agentes de uma vez custaram
  mais de 1 milhão de tokens. Trabalhe em uma sessão só, em lotes por região.
- Descubra candidatos com poucas buscas amplas por região (corpo clínico de hospitais ortopédicos, listas de
  membros da SBCJ, equipes de clínicas de joelho). Uma página de corpo clínico rende vários nomes de uma vez.
- Confira os dados com **script que baixa as páginas** (requests/curl) e procura os termos, em vez de abrir
  página por página pela IA. Leia só o que não bateu.
- Salve o JSON a cada lote. Se a sessão cair, o trabalho feito não se perde.
- Avise o Anderson do andamento em mensagens curtas. Não narre cada busca.

## 10. Contexto que ajuda, mas não muda a tarefa

- Depois da pesquisa, outra sessão escreve as 22 matérias com a skill `materias-jornalisticas-linkbuilding`,
  cada uma com estrutura e tom diferentes, e o link do COE perto do fim
  (`https://coegoiania.com.br/ortopedista-especialista-em-joelho-em-goiania`, âncoras na coluna K da planilha).
- Seis âncoras do pedido são de preço. As matérias não vão citar valor de cirurgia (regra do CFM).
- Pedido irmão, já entregue: coluna, Dr. Aurélio Arantes + COE, 13 matérias. O histórico está em
  `D:\SISTEMAS\GUEST POSTs\clientes\dr-aurelio-arantes\memoria.md`.
