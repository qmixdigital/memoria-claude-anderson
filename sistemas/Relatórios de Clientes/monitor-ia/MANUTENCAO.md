# Manutenção dos relatórios

Este arquivo existe por causa de um erro específico: um texto escrito para o
Dr. Ulbiramar ficou fixo no modelo e vazou para os nove relatórios. Uma loja de
malas passou a afirmar que Goiânia é polo de cirurgia de joelho. O código estava
correto, os testes passavam, e o defeito só apareceu quando alguém leu.

## A regra que resolve

**No modelo só entra texto que descreve a medição. Texto que interpreta o
negócio do cliente vive no `config.json` daquele cliente.**

| Tipo | Onde vive | Exemplo |
|---|---|---|
| Descreve a medição | modelo, em `relatorio.py` | "Estados de onde partiram as visitas ao site no período." |
| Interpreta o negócio | `config.json` do cliente | "Goiânia é polo de cirurgia de joelho e recebe paciente de todo o país." |

Teste rápido antes de escrever qualquer frase no modelo: **essa frase continua
verdadeira para uma loja de e-commerce e para um cirurgião?** Se não continua,
ela não pertence ao modelo.

## Antes de enviar qualquer relatório

```bash
python auditar.py
```

Sai com código 1 se achar problema, então serve em automação. O que ele verifica:

1. **Dado de outro cliente** no relatório, por nome e por domínio
2. **O próprio cliente aparece**, nome e domínio, para não gerar relatório trocado
3. **Código técnico do Google visível**: `(not set)`, `(none)`, `State of`, `vertexaisearch`
4. **Canal do GA4 em inglês**, sinal de tradução faltando
5. **Glifo quebrado no CSS**, que já aconteceu quatro vezes
6. **Travessão em texto próprio**, ignorando citação da IA, que é fala dela
7. **Placeholder de f-string não substituído**, do tipo `{nome}`
8. **Blocos vazios em excesso**, que dão cara de relatório quebrado

Duas exceções que o auditor entende:

- **Citação da IA**: se a IA menciona outro cliente dentro da resposta, é fala
  dela, não texto nosso. O Portal das Malas cita a Travelux assim.
- **Clientes do mesmo grupo**: declarar `"grupo": ["outro-id"]` no config. É o
  caso do Portal das Malas e da Travelux, em que a menção é intencional.

## Campos do config que controlam o relatório

| Campo | Padrão | Para que serve |
|---|---|---|
| `texto_geografia` | descrição neutra | leitura própria do alcance geográfico |
| `mostrar_contatos` | `false` | liga o bloco de cliques de contato |
| `rastreio_completo` | `false` | com `false`, some a taxa e entra a ressalva de medição parcial |
| `mostrar_video` | `false` | mostra o bloco de vídeo mesmo zerado, para servir de base de comparação |
| `video` | ausente | incorpora o vídeo relatório no fim |
| `recomendacoes` | ausente | seção de diagnóstico, usada em cliente novo |
| `pauta` | ausente | seção de sugestões de conteúdo para portais |
| `termos_acompanhados` | ausente | palavras-chave do bloco de posição, lidas do Search Console |
| `aviso_ga4` | ausente | alerta no topo da seção do Analytics (medição trocada no meio do mês); também esconde a taxa de contatos |
| `grupo` | ausente | clientes irmãos, para o auditor não acusar vazamento |
| `dominio` | do Search Console | necessário quando não há Search Console |
| `agencia` | ausente | `true` no cliente que é a própria agência; o auditor ignora a assinatura dela nos outros relatórios |

Todos são opcionais. Sem o campo, a seção não aparece.

## Armadilhas que já custaram retrabalho

**Ler a URL pública sem furar o cache.** Concluí que um script não estava
instalado lendo uma cópia de borda com 1.652 segundos de idade. Sempre usar
`?nc=` ou comparar borda contra origem antes de afirmar que algo falta.

**Não seguir redirecionamento.** Concluí que um site não tinha sitemap porque
consultei `/sitemap.xml` sem `-L` e li o corpo vazio de um 301. O sitemap
existia em `/sitemaps.xml`.

**Ler evento do GA4 sem cruzar com `hostName`.** Uma propriedade costuma cobrir
site e blog no mesmo fluxo. Sem separar, o maior valor de um host esconde o
outro. No Dr. Tredicci a leitura agregada mostrava 28 contatos quando eram 49.
A regra correta: **dentro do host, o maior; entre hosts, a soma.**

**Escape de CSS dentro de string Python não-raw.** `content:"\2192"` vira
escape octal e produz caractere de controle. Usar o glifo literal: `content:"→"`.

**Nome do cliente com nome do meio.** As IAs escrevem "Dr. Thiago Miranda
Tredicci", e o casador exige as partes em sequência. Sem cadastrar a forma
completa, a detecção falha e o número sai pela metade. Conferir sempre os nomes
que aparecem nas respostas antes de fechar o percentual.

**Gerar CSS por script.** Duas vezes uma substituição não pegou e o defeito só
apareceu no navegador. Editar CSS direto no arquivo.

**Texto médico no modelo.** A abertura da seção de IA dizia "o que um paciente
pergunta antes de escolher um médico" e foi para o relatório de uma loja de
toalhas. Hoje está neutra. O bloco de contatos ainda fala em "paciente" e só
pode ser ligado (`mostrar_contatos`) em cliente médico; para loja, generalizar
antes de ligar.

**Referral de loja virtual não é backlink.** No GA4 de e-commerce, o canal
"Referral" é dominado por gateway de pagamento (appmax, ethoca), WhatsApp
(l.wl.co), e-mail marketing (edrone), painel de anúncios e ferramentas nossas
(serprobot, acesso.qmix.com.br). A lista `FERRAMENTAS` em `google_dados.py`
tira isso dos blocos de links e de redes sociais. Se aparecer origem estranha
num relatório, é ali que se acrescenta.

**A IA lê o site sem escrever o nome.** O Gemini usou um artigo do blog da Casa
da Toalha como primeira fonte e não citou o nome na resposta. O bloco "De onde
a IA tirou a resposta" agora põe o domínio do cliente no topo com o selo "seu
site", para esse resultado não passar despercebido.

**Loja e blog do mesmo cliente são dois clientes no config**, cada um com o seu
Search Console (URL-prefix) e a sua propriedade GA4, ligados por `grupo`.
Prompts diferentes: a loja recebe pergunta de compra, o blog recebe pergunta de
cuidado, que é a que faz a IA ler artigo.

**Posição de palavra-chave pelo Search Console, inclusive 24 horas.**
`gsc_termos.py` lê a lista de `termos_acompanhados` do cliente e devolve a
posição nas últimas 24 horas e no mês. A janela de 24 horas usa
`"dataState": "HOURLY_ALL"`, que a API só aceita com a dimensão `HOUR`: para
ter posição por termo é preciso pedir `HOUR + query` e somar depois,
ponderando a posição pelas impressões. Média simples de hora daria o mesmo
peso a uma hora com 300 aparições e a outra com 2.

Duas diferenças que precisam estar claras para o cliente, e já estão no texto
do bloco: a posição do Search Console é a que gente real viu, média entre
lugares e aparelhos, então não bate com a do rastreador fixado numa cidade; e
termo ausente não é posição ruim, é o site não ter aparecido para aquela busca
exata.

**A coluna principal do bloco de posição é a da semana, não a de 24 horas.**
Num único dia a maioria dos termos não recebe busca nenhuma (31 de 46 no
primeiro teste), e os que recebem poucas oscilam: "Laser CO2" marcou 14,8º no
dia com 5 aparições e 2,9º no mês. A janela de 24 horas fica como complemento,
para mostrar movimento recente onde existe volume.

**Movimento com menos de 5 aparições no mês não é exibido.** Dois meses com 2
e 3 buscas produzem "caiu 8 posições" sem nada ter mudado no Google. Abaixo
desse piso a tabela diz "amostra pequena" e o termo fica fora do saldo.

**Evento de contato duplicado: marcar só um como evento-chave.** O clique no
WhatsApp é registrado pelo nosso `generate_lead` e pela medição automática do
Google (`click`), e às vezes também por um `clique_whatsapp` antigo do site.
Marcar mais de um faz o GA4 contar a mesma pessoa duas vezes. Fica marcado o
`generate_lead`, com contagem "uma vez por evento" para bater com o número do
relatório; os outros aparecem como "medição paralela". O evento `purchase` é
evento-chave fixo do GA4 e não aceita remoção, mas como nunca dispara não
polui número nenhum.

**Palavra acompanhada raramente é a frase que o paciente digita.** A lista
vem do rastreador e costuma ser título de página ("Tratamentos para Rizartrose
em Goiânia"). No Search Console essa frase exata quase nunca existe, e a tabela
saía inteira "não apareceu" num site com 3 mil cliques. A leitura tem três
degraus, e a linha diz qual valeu: frase exata; buscas parecidas (todas as
palavras do termo, sem artigo, plural nem a palavra "tratamento"); e tema, sem
a cidade, quando ninguém buscou com ela. Linha de tema fica fora dos contadores
de top 3 e primeira página: é autoridade no assunto, não busca local.

**Numeração das seções sai de `numerar_secoes`**, no fim da montagem. Numerar
na chamada de cada bloco já produziu duas seções "03" no mesmo relatório
quando entrou um bloco opcional novo. Marcador de símbolo (◆ ✎ ▶) fica fora da
contagem de propósito.

## Rotina mensal

```bash
python monitor.py                      # consulta as IAs de todos os clientes
python monitor.py --provedor anthropic # completa uma IA que falhou, sem repetir as outras
python reanalisar.py                   # recalcula sobre respostas salvas, custo zero
python relatorio.py                    # gera todos
python auditar.py                      # confere antes de enviar
```

Para o bloco de posições, baixar o full data export de cada projeto no SERPRobot
e jogar os CSV em `serprobot/`. O domínio vem no cabeçalho do arquivo, então não
precisa renomear nem configurar.

## Ferramentas auxiliares

```bash
python gsc_termos.py --cliente id     # posição das palavras acompanhadas, 24h e mês
python google_dados.py --listar        # o que cada conta de serviço enxerga
python ga4_admin.py --diagnostico      # eventos-chave faltando em toda a rede
python ga4_admin.py --auto --aplicar   # marca o evento certo em cada propriedade
```
