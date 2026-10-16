# Briefing do lote odontolinea.com.br (15/10/2026, sites do Jean via MCP)

Leia `plano.json` para o item que lhe foi designado (campo `n`). Cada item tem: portal,
destino_url (URL real do cliente a linkar), ancora (texto exato do link), tipo_ancora,
pauta (já definida, não escolher outra) e kw_post (palavra-chave do SEU artigo).

## Sobre o cliente

OdontoLinea é uma clínica odontológica REAL em Taguatinga Centro, Brasília-DF (não é
diretório da QMIX). Responsável técnico: Dr. Irvington Duarte, cirurgião-dentista, CRO 9224
(DF). Pode citá-lo como fonte/responsável técnico da clínica. **NUNCA escreva "revisado
por" ou "avaliado por" o Dr. Irvington** — isso implicaria que ele revisou o conteúdo, o
que não acontece. Citar nome + CRO como credencial é diferente e está correto.

Dados reais que podem ser citados se fizer sentido no texto: endereço (Edifício Taguatinga
Trade Center, C1 Lote 1/12, Sala 339), WhatsApp (61) 99888-5212, horário (segunda a sexta
8h-19h, sábado 8h-12h), nota no Google 4,9 com 167 avaliações.

## Regras editoriais (YMYL, obrigatórias)

- **Nada de remédio, antibiótico, dosagem, automedicação, receita caseira ou "cura
  rápida"**. Tema de saúde bucal pode descrever sintoma/procedimento, nunca prescrever.
- **Sem promessa de resultado** ("garante", "elimina de vez", "resolve para sempre").
- **Sem preço inventado.** Se mencionar custo, usar "varia conforme avaliação" ou
  equivalente, nunca número específico.
- Zero travessão (nem — nem –) em qualquer ponto do texto.
- Português do Brasil com acentuação correta.

## Âncora e golden rule

A âncora do item vai no primeiro parágrafo ou o mais perto possível disso, na primeira
menção à marca/termo. A keyword do SEU artigo (`kw_post`) é diferente do tema do destino
quando a pauta já aponta isso (ex.: item sobre siso linkando para a página de extração).
Quando a pauta E a âncora são sobre o mesmo tema (ex.: "dentista em Taguatinga"), a âncora
ainda assim só entra no primeiro parágrafo, nunca repetida à toa no resto do texto.

## Praça regional (ver `praca_portal` de cada item)

- **Item 05 (noticiasdetimon, praça real Timon/MA)** e **item 10 (jornalbahia, praça real
  Bahia)**: inclua uma menção local genuína da praça REAL do portal (não da Brasília/DF do
  cliente — são coisas independentes, o leitor do portal não mora em Brasília).
- **Itens 04 (alertasocial) e 08 (luiziananoticias)**: sem praça fixa confirmada, não
  inventar cidade/estado.

## Links internos

Não solicitados pelo operador neste lote. Não pesquisar nem inserir link interno do portal
hospedeiro — só o link do cliente (a âncora do plano.json).

## Estrutura, SEO on-page, validação

Seguir a skill normalmente: título ≤70 caracteres, linha fina 10-20 palavras com a keyword
exata, 5-7 H2 (ideal 1200-1800 palavras para este cliente, não precisa chegar a 2500),
keyword exata no título/100 primeiras palavras/1 H2/corpo 3-6x/resumo/slug, zero
travessão, vocabulário proibido evitado. Rodar `validador_materia.py --links 1 --titulo
--kw --resumo` até aprovar (0 bloqueios, humanização >=70).

## Imagem

Banco de fotos grátis (Pexels/Pixabay), termo de busca em inglês, tema odontológico
genérico (dental clinic, dental chair, dentist tools, teeth checkup) SEM rosto
reconhecível, SEM logo de clínica/marca real, sem texto em outro idioma visível.

## Exemplo já publicado (item 01, referência de tom)

https://noticiasdaserra.com.br/saude/como-escolher-clinica-odontologica-confianca/ —
use como referência de tom, extensão e como citar o Dr. Irvington (seção "Equipe
multidisciplinar e especialidades" daquele artigo).
