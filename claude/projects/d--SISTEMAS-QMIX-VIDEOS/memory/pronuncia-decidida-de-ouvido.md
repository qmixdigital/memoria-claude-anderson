---
name: pronuncia-decidida-de-ouvido
description: Toda pronúncia vive no dicionário em D:\SISTEMAS\QMIX-VIDEOS; marca e sigla que soam errado se resolvem gravando candidatas e deixando o Anderson escolher de ouvido
metadata:
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-28T19:39:46.408Z
---

**Toda pronúncia decidida entra no dicionário do repositório, sempre.** Ele fica
em `D:\SISTEMAS\QMIX-VIDEOS\tools\pronuncia.json`, com o motivo escrito junto, e
serve aos dois canais. Pedido explícito do Anderson em 23/08/2026: nada de
resolver caso a caso no roteiro ou no campo `tts` de uma linha.

Quando uma marca ou sigla sai errada na locução, **não escolha a grafia falada
sozinho**: grave as candidatas numa frase real, junte num mp3 numerado e
pergunte. Ele decide de ouvido, rápido, e a escolha é final mesmo quando
contraria a forma "correta". Quando ele reprovar uma grafia, **mande quatro de
uma vez** em vez de tentar uma por rodada; ele responde o carimbo de tempo.

Decisões já tomadas:

- **BYD** se fala **"Bil Ai Di"**. Reafirmado depois de ouvir "Bi Uai Di" e
  "Bê I Dê" lado a lado. Não trocar por conta própria, **nem quando ele
  reclamar do som**: em 28/08/2026 ele disse "você inseriu o áudio de BYD
  errado" e a regra estava intacta desde o vídeo 01. Quem tinha mentido era o
  meu teste (ver abaixo).
- **Camaçari** se fala **"Camassarí"** (ç vira ss, acento no i final).
- **QMIX** se fala **"Quêmix"** (ver [[qmix-marca-completa]]).
- **WLTP** se fala **"Dáblio Éle Tê Pê"**, quatro letras.
- **SW** (Tempra SW, Escort SW, 206 SW) se fala **"esse dáblio"**.
- **Volt** se fala **"vout"**, sem o i de apoio, na marca falada e dentro de
  `radarvolt.com.br`. Isso **substitui** o "vouti" que tinha sido dado como
  definitivo em 23/08: ele corrigiu em 28/08/2026 com "volt = vout". A unidade
  segue a marca, é a mesma palavra ("oitocentos vouts").
- **Galaxy** (Geely Galaxy TT) se fala **"gálacsi"**. Ele reprovou "Gálaxi" e
  "galaxi" antes, e escolheu entre galáxi, guélaxi, galécsi e gálacsi.
- **EX5** se fala **"é xis cinco"**, em caixa baixa. Grafia dele.
- **REEV** é palavra, **"reevi"**; **EREV** é soletrada, **"É Érre É Vê"**. São
  coisas diferentes e ele corrigiu isso de viva voz.

**Why:** eu não escuto o áudio. A medição de duração só pega o caso grosseiro
(sigla lida como palavra, tipo "BYD" saindo em 0,26s); tônica errada e fonema
trocado passam batido, porque a duração fica dentro do normal. Camaçari media
0,673s, plausível para quatro sílabas, e estava errado.

**How to apply:** meça primeiro (duração da palavra contra a mediana e contra
palavras do mesmo tamanho). Depois monte a sonda com 4 ou 5 grafias numa frase
completa. Duas armadilhas que já custaram rodada, as duas do vídeo 08:

1. **A frase da sonda sai do `beats.json`, inteira.** Não resuma para caber. Eu
   espremi a linha dos rivais, cortei a oração do meio, e sobraram cinco grafias
   inventadas coladas ("Ecs Peng Pê sete plus, Zíquer sete Gê Tê e Bil Ai Di
   Seal"). O locutor se perdeu na última e eu quase troquei uma regra boa.
2. **Toda regra nasce com `"palavra": true`.** Sem a fronteira o replace casa no
   meio de outra palavra e o defeito **sai mudo**: `volt` mordia dentro de
   `volta` e a locução dizia "vouta completa ao maior lago". Depois de mexer no
   dicionário, rode `fala()` sobre todas as linhas de `radar-volt/*/beats.json`
   antes e depois e compare: só pode mudar o que você quis mudar. Essa checagem
   pegou 18 linhas estragadas em 4 projetos, de graça. Ver
   [[defeito-silencioso-conferir-artefato]].

O dicionário só afeta o texto enviado à ElevenLabs: legenda e texto em tela
mantêm a grafia correta, que é o que o YouTube indexa.

Mexer no dicionário de um vídeo já pronto custa **só as linhas que mudaram**, e
o resto sai do cache de graça, desde que a voz seja a do projeto. Ver
[[voz-do-projeto-nao-e-a-do-env]].

**15/09/2026, qmix-24:** ChatGPT = "chat gpt" (ele reprovou a soletrada "Chat Gê Pê Tê" que eu tinha posto); GEO = "G E O", as três letras em PORTUGUÊS (ele reprovou "ji ê ou", em inglês, na segunda rodada). As duas no dicionário.
