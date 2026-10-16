# Briefing do lote "melhores clínicas" — odontolinea.com.br (16/10/2026)

Publicação nos **portais próprios da rede QMIX** (não é Jean/MCP desta vez). Leia
`plano-listas.json` para o item designado (campo `n`, formato "L01".."L10"). Cada item
já tem: portal, destino_url, ancora (texto exato do link), pauta e kw_post. **Não mude a
pauta nem o destino.**

## Formato: lista de "melhores clínicas" (VERSÃO 2, corrigida em 16/10/2026)

**Isto é uma reescrita.** O lote anterior saiu parecido demais entre os 10 artigos —
mesma estrutura genérica, parágrafo de competidor raso, seções finais clonadas ("Como
escolher entre as clínicas", "Perguntas para levar à consulta") repetidas quase
literalmente em vários. O operador reprovou e pediu mais profundidade e variação. Leia
o artigo antigo (mesmo arquivo, você vai sobrescrever) só para saber o que NÃO repetir.

Estrutura obrigatória:

1. Abertura (1-2 parágrafos, como antes).
2. H2 com a keyword exata, seguido da **`<ol>`** com os 5 nomes na ordem — isso continua
   como resumo extraível rápido (exceção de ranking da skill).
3. **NOVO, o ponto que faltou:** depois da `<ol>`, uma sequência de **5 subtítulos
   numerados** (`<h2>` ou `<h3>`, à sua escolha, mas sempre no formato "1. Nome da
   Clínica", "2. Nome da Clínica"...), um para cada posição da lista, na mesma ordem.
   **OdontoLinea é sempre "1."**. Cada subtítulo numerado vem com 2 a 4 parágrafos
   próprios e REALMENTE diferentes dos outros 9 artigos: não repita a mesma frase-modelo
   ("tem presença consolidada no bairro", "funciona na Sala X do Edifício Y") em todos.
   Varie o ângulo de cada clínica: uma pelo prédio onde fica, outra pela especialidade
   declarada, outra pelo tipo de paciente que atende, outra pela proximidade com outro
   serviço do bairro. Dê a cada clínica um motivo de destaque DIFERENTE, não o mesmo
   molde preenchido com nome trocado.
4. Depois dos 5 subtítulos numerados, 2-3 seções finais **com ângulo próprio deste
   artigo específico** (ligado à pauta: siso, canal, implante etc.), não um bloco
   genérico de "como escolher" que poderia estar em qualquer um dos 10. Se usar uma
   seção do tipo "como escolher", amarre ela ao tema específico do artigo (ex.: no
   artigo de clareamento, fale de sensibilidade pós-clareamento; no de prótese, fale de
   adaptação da prótese; não escreva um texto genérico que serviria para qualquer um).

**A OdontoLinea é SEMPRE o item #1 da lista e sempre o "1." dos subtítulos**, com link na
âncora exata do plano.json, o mais cedo possível no texto (na própria introdução ou já
na primeira menção dela na lista).

**Mantenha exatamente o mesmo título, slug e keyword do plano.json** (o artigo já está
publicado nessa URL; você está reescrevendo o conteúdo, não criando um artigo novo).
Pode reaproveitar a mesma imagem já baixada (não precisa gerar outra, a menos que
realmente não sirva).

**TÍTULO: tudo é Taguatinga, NADA de "Brasília" ou "DF" genérico.** A clínica fica em
Taguatinga Centro; o título e o corpo do texto devem se referir sempre a Taguatinga
especificamente, nunca a "Brasília" ou "Distrito Federal" como termo genérico de
localização. Cada um dos 10 títulos já veio pronto no plano.json — use exatamente esse
título (≤70 caracteres, já checado).

## Concorrentes reais (pesquisados, confirmados em Taguatinga Centro — NÃO INVENTAR outros)

Use estes 4 nomes para completar as posições 2 a 5 da lista, variando a ordem e a
combinação entre os 10 artigos (não repita a mesma ordem exata em dois artigos):

- **Sarkis Odontologia Especializada** — clínica de implantes no centro de Taguatinga
- **Priorize Odontologia** — C 01, Lotes 01/12, Taguatinga Centro
- **Implantec Odontologia** — Edifício Taguatinga Trade Center (mesmo prédio da OdontoLinea)
- **Maldi Odontologia** — sala 926 do Taguatinga Trade Center, endodontia
- **WA Odontologia Integrada** — Taguatinga Centro

**NÃO invente nota do Google, número de avaliações ou qualquer dado estatístico sobre essas
clínicas.** Descreva apenas o que é verificável (nome, especialidade/diferencial, bairro
dentro de Taguatinga). Se quiser comentar reputação, use algo genérico e verdadeiro como
"tem presença consolidada no bairro" ou não comente nota nenhuma.

## Sobre o cliente (OdontoLinea)

Clínica odontológica real em Taguatinga Centro, Brasília-DF. Responsável técnico: Dr.
Irvington Duarte, cirurgião-dentista, CRO 9224 (DF). Pode citá-lo como responsável
técnico/fonte da OdontoLinea especificamente. **NUNCA** "revisado por" ou "avaliado por"
ele. Endereço real: Edifício Taguatinga Trade Center, C1 Lote 1/12, Sala 339. WhatsApp
(61) 99888-5212. Horário: segunda a sexta 8h-19h, sábado 8h-12h. Nota Google 4,9/167
avaliações (este dado É real e pode ser citado, mas só para a OdontoLinea, nunca para as
concorrentes).

## Regras YMYL (saúde, obrigatórias)

- Nada de remédio, antibiótico, dosagem, automedicação, receita caseira ou "cura rápida"
- Sem promessa de resultado
- Sem preço inventado (orçamento "sob avaliação")
- Zero travessão
- Português do Brasil com acentuação correta

## Estrutura e SEO

Título já definido (não altere). Linha fina 10-20 palavras com a keyword exata. Abertura
de 1-2 parágrafos, depois H2 com a keyword, `<ol>` dos 5 nomes, desenvolvimento de cada
um, fechamento prático sem CTA. 1200-1800 palavras. Keyword exata (kw_post) no
título/100 primeiras palavras/no H2 da lista/corpo 3-6x/linha fina/slug/alt. Zero
travessão, vocabulário proibido evitado (abordagem, alavanc, ecossistema, soluç, robusto,
insights, "cada vez mais", "é fundamental", "vale ressaltar", descubra, "saiba mais",
"clique aqui" etc).

Validar com `python "C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py" nXX.html --links 1 --titulo "TITULO" --kw "KW_POST" --resumo "LINHA FINA"` até RESULTADO: APROVADO (0 bloqueios, humanização >=70). **A `<ol>` é permitida nesta skill só por causa do formato de ranking — não é bloqueio.**

## Links internos

Não pesquisar nem inserir. Só o link da OdontoLinea na âncora do plano.json.

## Imagem

Banco de fotos grátis (Pexels/Pixabay), termo em inglês, tema odontológico genérico
(dental clinic exterior, dental office waiting room, dentist tools) SEM rosto
reconhecível, SEM logo de clínica real (nem da OdontoLinea nem das concorrentes), sem
texto em outro idioma visível.

## Entrega

Salvar em `D:\SISTEMAS\GUEST POSTs\clientes\odontolinea\materias\`: `nXX.html` (XX = L01
etc, use só os dois dígitos finais tipo n_L01.html), `nXX.meta.json` (titulo, resumo,
slug, kw) e a imagem `.webp`. NÃO publicar — a publicação é feita por mim depois,
com script próprio por mecanismo (portal-engine / API custom / Payload).