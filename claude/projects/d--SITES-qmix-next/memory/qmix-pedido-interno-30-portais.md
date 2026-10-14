---
name: qmix-pedido-interno-30-portais
description: Método dos pedidos internos de 30 matérias em portais parceiros (Lucas/Gustavo/Rodrigo) para projetos da QMIX; pedidos 146 a 150 feitos 13/10/2026; próximo lote semana de 19/10
metadata:
  type: project
---

Pedido interno = cliente QMIX Digital (cliente_id 3), total zero, em-producao, 30 entregas (1 por portal
parceiro: Lucas 10, Gustavo 13, Rodrigo 7), cada uma com domínio, âncora, URL de destino e tema;
observação "Parceiro X | destino: ... | pedido interno, Apex manual" + "Matéria pronta: <link painel>".
Criação por insert direto em pedidos, pedidos_itens (id "<pedido>_<n>", produto_id null) e entregas
(script de modelo em D:\tmp\cartorio\criar_pedido.mjs). A Kátia lança a URL publicada e usa o botão
"Marcar como enviado ao portal"; Apex só manual (ver [[feedback-indexacao-so-com-ordem]]).

**Feitos em 13/10/2026:**
- Pedido 146 (cartorio.srv.br): 28 matérias minhas (Anderson já tinha gerado gazetadasemana e
  acontecenors). Cliente em D:\SISTEMAS\GUEST POSTs\clientes\cartorio-srv-br.
- Pedido 147 QMIX-20261013-DFCB66F6 (ferramentas.qmix.com.br): 30 matérias nos MESMOS 30 parceiros,
  destinos escolhidos pelo GSC. Cliente em ...\clientes\ferramentas-qmix.

- Pedido 148 QMIX-20261013-B6DB62B4 (psicologosperto.com): 30 matérias nos MESMOS 30 parceiros, destinos
  escolhidos no site (guias /acesso, cidades, abordagens, fichas de CAPS). Conteúdo de saúde: só fatos do
  site e fontes oficiais, CVV 188/SAMU 192, sem eficácia; o validador veta "abordagem". Cliente em
  ...\clientes\psicologosperto.

- Pedido 149 QMIX-20261013-BE588FFA (seuguiadesaude.com.br): 30 matérias; 25 portais do 146 mais 5 de saúde no lugar de estimativa, investornegocios, noticiasmundotech, temadigital e velozesecuriosos. Destinos do GSC (bulas de remédios + artigos novos). Páginas antigas de bula têm erro factual; texto foi escrito com fontes oficiais, não copiado. Cliente em ...\clientes\seuguiadesaude.

- Pedido 150 (revistamsaude.com.br): 30 matérias nos MESMOS 30 portais do 149 (velozesecuriosos fora). Destinos do GSC, sem as páginas promocionais (bioplasma, bioressonância, haloterapia, carbox). Saúde com CVV 188/SAMU 192, sem preço de remédio. Cliente em ...\clientesevistamsaude (memoria.md criada).

**Previsto:** na semana de 19/10/2026 o Anderson quer mais 30, em OUTROS domínios da lista de parceiros.

**Como produzir em lote (aprendizado):** meu texto sai ~35% menor do que parece; escrever base + seção
extra até o validador marcar 1.200+ palavras (em ~28 parágrafos de 40 palavras sai ~900); keyword exata
(substring do título) no título, na 1ª centena de palavras, num H2, na linha fina e 3 a 8 vezes no corpo;
palavras vetadas: solução, descubra, proporcional/proporcionais (em CLT usar "dos meses trabalhados" /
"período incompleto"), "é fundamental", "clique aqui"; no máximo 2 perguntas; evitar repetir nome composto
3 vezes (trigramas) e frases seguidas com a mesma abertura. Scripts em D:\tmp\cartorio (build.py com
MAIS=<arquivo>, imagens.py, sheet.py para folha de miniaturas, empacotar2.py, vincular2.*): recriar se
sumirem. Trigrama repetido: XX só a partir de 6 trigramas distintos (5 ou menos é aviso). Palavra-chave curta (ex. CAPS AD) estoura 8 ocorrências: usar `reduz` no build. Fotos: banco_img.py (conferir em folha de miniaturas; trocar as com texto/logotipo). Conferir
fatos antes (CPF/CNPJ/EAN com cálculo próprio, leis citadas), nunca citar apresentador de transcrição.
