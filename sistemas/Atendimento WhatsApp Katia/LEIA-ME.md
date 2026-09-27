# Projeto "Atendimento WhatsApp, Kátia" no Claude

## Como montar, em 3 minutos

1. Em claude.ai, crie um projeto novo e chame de **Atendimento WhatsApp, Kátia**.
2. Abra o arquivo `00-INSTRUCOES-DO-PROJETO.md`, copie o conteúdo inteiro e cole no campo
   **"Instruções do projeto"** (o botão de configurar instruções, dentro do projeto).
3. Suba os outros arquivos no **conhecimento do projeto**:
   - `01-a-qmix-em-fatos.md`
   - `02-respostas-prontas.md`
   - `03-fluxo-de-atendimento.md`
   - `04-objecoes.md`
   - `05-o-que-nao-dizer.md`
   - `06-modelos-de-proposta.md`
4. Pronto. Toda conversa aberta dentro do projeto já sai com esse contexto.

## Como a Kátia usa no dia a dia

Cola a mensagem do visitante e pede a resposta. Exemplos do que funciona:

> Chegou agora: "oi, vi o site de vocês, quanto custa um backlink?"

> Cliente perguntou se garante primeira página do Google. Responde pra mim.

> Ele disse que achou caro e que consegue por R$ 50 em outro lugar.

> Monta uma seleção de portais pra clínica odontológica em Curitiba, orçamento de R$ 1.200.

> Ele sumiu faz 2 dias. Escreve um follow-up leve.

Se a resposta vier boa, é copiar e colar. Se vier fora do tom, é só dizer "mais curta",
"mais informal", "tira a pergunta do final" que ele refaz.

## O que atualizar, e quando

O único arquivo com números é o `01-a-qmix-em-fatos.md`. Mexa nele quando mudar:

- quantidade de portais, faixa de preço ou de DA;
- preço de pacote ou de GEO;
- prazo, forma de pagamento ou garantia.

Depois de editar, suba o arquivo de novo no projeto (substituindo o antigo). Os outros
arquivos não repetem número justamente para não ficarem desatualizados.

## Cuidados

- A regra de **não citar nome de portal** está no `05-o-que-nao-dizer.md`. É a que mais
  importa: vale para mensagem, print e proposta.
- Desconto, contrato mensal, agência e reclamação séria são do Anderson. O Claude foi
  instruído a escrever a mensagem que segura o cliente e avisar a Kátia.
- O Claude não sabe o que aconteceu em conversas anteriores do WhatsApp. Quando o contexto
  importar, cole o trecho junto com o pedido.

Criado em 22/09/2026, com os dados do catálogo e da plataforma daquela data.
