# Editor Rápido de Vídeos

Abra com **Editor de Videos.bat** ou rode `python editor_videos.py`.

## Baixar por link

Cole um ou mais links (um por linha) no campo **"Ou baixe por link"** e clique em
**Baixar e pôr na fila**. O arquivo é baixado e entra direto na lista de edição, sem
passar pelo explorador de arquivos.

- **Qualidade**: melhor disponível, até 1080p ou até 720p. A preferência é sempre por
  H.264 (`avc1`), que é o codec que o resto da ferramenta trata sem conversão extra.
- **Cookies**: se o site pedir confirmação de que você não é robô, ou o vídeo tiver
  restrição de idade, escolha o seu navegador nesse campo. O yt-dlp reaproveita a
  sessão já aberta nele. É isso que resolve esse tipo de bloqueio, não proxy.
- **Playlist inteira**: desmarcado, um link de playlist baixa só o vídeo apontado.
  Marcado, baixa a playlist toda.
- **Salvar em**: padrão `Desktop\baixados`.

Vídeo e áudio são baixados separados e juntados em MP4 pelo próprio ffmpeg.
Falhas comuns saem traduzidas no log (vídeo indisponível, privado, com restrição de
idade, bloqueado por região) em vez do erro cru do yt-dlp.

### Quando o YouTube diz que o vídeo não existe

O yt-dlp conversa com o YouTube fingindo ser um aparelho (o "player client"), e o
cliente padrão às vezes responde **"This video is not available"** para vídeo que
existe e baixa sem problema por outro cliente.

Aconteceu de verdade com um link de teste: o cliente padrão recusou, o `web` disse
que não havia formato, e o `android` baixou normalmente. Por isso a ferramenta passa
uma lista (`default,android,tv,web`) e o yt-dlp tenta todos, juntando os formatos que
cada um enxerga.

Se mesmo assim falhar, o log manda escolher o navegador no campo **Cookies**, que é o
passo seguinte para vídeo com restrição de idade ou região.

### Instalação do yt-dlp

Se o yt-dlp faltar, a ferramenta pergunta se quer instalar e resolve sozinha, no
Python em que ela própria está rodando. Não precisa abrir terminal.

Essa é a parte que engana: **esta máquina tem dois Pythons instalados**, e pacote
instalado num não aparece no outro.

| Python | Como é chamado |
|--------|----------------|
| `AppData\Local\Microsoft\WindowsApps\python.exe` | `python` no PATH, e o `Editor de Videos.bat` |
| `AppData\Local\Programs\Python\Python313\python.exe` | o comando `py`, e o duplo clique no `.py` |

Os dois já estão com o yt-dlp instalado. Se um dia aparecer "yt-dlp não está
instalado neste Python", a mensagem agora **diz o caminho exato do interpretador**,
e a instalação automática cuida do resto.

Sobre direitos: baixar do YouTube contraria os termos de uso do serviço, e
redistribuir vídeo de terceiros é questão de direito autoral. A ferramenta não
verifica nada disso, a responsabilidade sobre o que é baixado e republicado é de
quem usa.

## O link basta: não precisa pôr na lista antes

Colar o link e clicar direto em **Processar** ou **Analisar** funciona. A ferramenta
baixa o que estiver no campo de links, põe na fila e emenda no processamento, sem
passo intermediário. O botão **Baixar e pôr na fila** continua existindo para quando
você só quer baixar.

Depois do download o campo de links é esvaziado, mas os links que **falharam**
continuam lá, para tentar de novo sem redigitar.

## As opções ativas aparecem no log

Antes de processar, o log escreve uma linha começando por `Opções ativas:` com tudo
que está ligado, e `REMOVER O SOM` sai em maiúscula. Como as preferências ficam
salvas entre sessões, dá para começar um trabalho com o som desligado ou um recorte
9:16 ligados de dias atrás sem perceber, e culpar a ferramenta pelo resultado.

Exemplo real do log:

```
Opções ativas: dividir em partes de 8s, espelhar na horizontal,
recortar em vertical 9:16, REMOVER O SOM, limpar metadados, qualidade CRF 17
```

## O vídeo baixado é apagado no fim

A caixa **"Apagar o vídeo baixado depois de gerar os arquivos finais"** vem marcada.
Vídeo de YouTube em 1080p passa fácil de 300 MB, e sem isso a pasta `baixados` vira
um depósito.

Três regras protegem contra apagar o que não deve:

1. **Só apaga o que a própria ferramenta baixou naquela rodada.** Arquivo que você
   pôs na lista pelo botão "Adicionar vídeos" nunca é tocado.
2. **Só apaga depois do processamento dar certo.** Se falhar, o download fica no
   disco para você tentar de novo sem baixar tudo outra vez.
3. **Só apaga ao processar.** O botão "Baixar e pôr na fila" sozinho, e o
   "Analisar sem processar", não apagam nada.

O log diz quanto espaço foi liberado em cada arquivo, e o item sai da fila junto.
Desmarcando a caixa, nada é apagado e os originais ficam em `Desktop\baixados`.

### Restos de download interrompido

Ao fim de cada rodada de download, a pasta é varrida. São apagados os arquivos
comprovadamente transitórios do yt-dlp:

| Resto | O que é |
|-------|---------|
| `*.part` | download que ficou pela metade |
| `*.ytdl` | índice de retomada do download |
| `*.part-Frag*` | pedaço de fragmento interrompido |

Pedaços de faixa separados (`.f399.mp4`, `.f251.m4a`) **não são apagados**, só
reportados no log. Eles só sobram quando a junção de vídeo e áudio falha, e nesse
caso ainda pode dar para aproveitá-los. Apagar por conta própria seria jogar fora
um download inteiro sem avisar.

## Dividir em vídeos menores

A função principal. Marque **"Dividir cada vídeo em vários arquivos separados"** e
informe a duração de cada parte em minutos. Um vídeo de 20 minutos com partes de
1,5 min vira 13 arquivos; com partes de 1 min, 20 arquivos.

Cada ponto de divisão é empurrado para a **pausa de fala mais próxima**, dentro de
uma janela de tolerância de 40% da duração alvo. É isso que faz o corte cair entre
frases em vez de no meio de uma palavra. Se não houver pausa nenhuma por perto, corta
no tempo exato mesmo.

As partes saem numeradas: `nome_parte01.mp4`, `nome_parte02.mp4` e assim por diante.
Nenhum segundo é perdido: as partes são contíguas e somadas dão o vídeo inteiro.
A última parte nunca fica menor que metade da duração alvo, ela é absorvida pela
anterior quando sobraria um pedaço curto.

**Dividir sempre recodifica o vídeo.** Com `-c copy` o ffmpeg recua o corte até o
keyframe anterior, o que joga a divisão para o meio da fala. Como o objetivo é
justamente o corte limpo, a divisão usa CRF 17.

## Demais funções

| Opção | Efeito | Recomprime? |
|-------|--------|-------------|
| Espelhar na horizontal | Inverte a tela (`hflip`) | Vídeo sim, áudio não |
| Espelhar na vertical | Vira de cabeça para baixo (`vflip`) | Vídeo sim, áudio não |
| Girar | 90 graus horário, anti-horário ou 180 | Vídeo sim, áudio não |
| Formato | Recorte central para 9:16, 1:1 ou 16:9 | Vídeo sim, áudio não |
| Encurtar trechos sem fala | Reduz as pausas dentro do vídeo | Vídeo e áudio sim |
| Normalizar o volume | Loudness padrão de streaming (-16 LUFS) | Só o áudio |
| Remover o som | Arquivo final fica mudo | Não se aplica |
| Limpar o arquivo | Apaga metadados e capítulos | **Não**, cópia bit a bit |

Atenção à diferença: **dividir** gera vários arquivos; **encurtar trechos sem fala**
gera um arquivo só, mais curto. As duas se combinam.

A saída vai para a pasta escolhida (padrão: `editados`, ao lado do primeiro vídeo).
Os originais nunca são alterados. O botão **Abrir pasta** leva direto até lá e o
duplo clique na lista abre o vídeo no player.

## Botão "Analisar sem processar"

Mostra, sem gravar nada em disco: resolução, duração, fps, bitrates, tamanho do
recorte de formato, limiar de silêncio medido, quantas pausas foram achadas e **a
lista completa das partes com início, fim e duração de cada uma**. Serve para acertar
a duração alvo antes de gastar tempo codificando.

## Regras de qualidade

- **"Limpar" sozinho não recomprime nada.** O vídeo sai idêntico ao original.
- **O áudio só é recomprimido quando há divisão, corte ou normalização.**
- **O vídeo só é recomprimido quando a imagem muda ou quando o vídeo é dividido.**
  O padrão é CRF 17, visualmente indistinguível do original (PSNR ~48 dB medido em
  fonte já comprimida de 640x360, contra 44,5 dB em CRF 23).
- **Nada é ampliado.** O recorte de formato só corta: um 640x360 vira 202x360 no
  9:16, não um 1080x1920 borrado.
- Todo arquivo gerado é conferido no fim (faixas presentes e duração coerente).

## Detecção de pausas

A detecção automática vem ligada. Ela mede o volume do próprio vídeo (percentil 25
das janelas de RMS) e define o limiar a partir dele. Isso resolve o caso de vídeo
com música ou ruído de fundo, em que o piso de silêncio fica bem acima dos -30 dB
de praxe e um limiar fixo não acha pausa nenhuma.

As pausas encontradas servem para duas coisas: escolher onde dividir e, se a opção
estiver marcada, encurtar os trechos sem fala.

- **Silêncio abaixo de (dB)**: só no modo manual. Perto de `-20` acha mais pausas.
- **Pausa mínima (s)**: ignora pausas menores que isso. Padrão `0.30`.
- **Pausa que sobra (s)**: só para o encurtamento. Quanto de cada pausa continua no
  vídeo. Padrão `0.20`. Em `0` o corte fica seco e a fala soa atropelada.

## Limite de cortes do ffmpeg

O parser de expressões do ffmpeg aceita no máximo **100 somas seguidas**. Com 101
trechos ele aborta com "Cannot allocate memory" e nenhum arquivo é gerado. Um par de
parênteses zera essa contagem, então os termos são agrupados de 50 em 50, e o
agrupamento se repete sobre os próprios grupos. Testado: 2500 e 5000 cortes passam.

Acima de 4000 trechos a ferramenta junta automaticamente os pares separados pelas
menores pausas, até caber. O log avisa quando isso acontece.

## Preferências

Todas as opções são salvas em `config.json`, ao lado do script, e voltam na próxima
abertura. Arquivo corrompido é ignorado sem derrubar o programa.

## Por que não tem aceleração por placa de vídeo

Medido nesta máquina (Radeon RX 580, 20 núcleos lógicos): o `h264_amf` foi **4x mais
lento** que o `libx264` em 1080p (24,4s contra 6,0s) e ainda gerou arquivo **27%
maior**. Ligar a GPU aqui seria pior nos dois eixos.

## Requisitos

- Python 3 com Tkinter (já vem no instalador oficial do Windows)
- ffmpeg e ffprobe: `winget install Gyan.FFmpeg`
- yt-dlp, só para a seção de download. A própria janela oferece instalar,
  ou rode `python -m pip install yt-dlp` **no mesmo Python que abre a ferramenta**

## Verificações feitas

- Link que falhava com "This video is not available" conferido ponta a ponta depois
  da lista de clientes: baixou, dividiu em 4 partes, espelhou, recortou em 16:9,
  tirou o som e apagou o original, deixando a pasta de downloads vazia

- Varredura de restos conferida com pasta montada à mão: apagou `.part`, `.ytdl` e
  `.part-Frag`, preservou o vídeo bom e apenas reportou os pedaços de faixa órfãos

- Limpeza do baixado conferida nos três casos: arquivo baixado e processado com
  sucesso é apagado; arquivo posto na lista à mão sobrevive; download cujo
  processamento falhou sobrevive. E com a caixa desmarcada, nada é apagado

- Fluxo completo validado nos **dois Pythons** da máquina: colar link, baixar,
  dividir em partes, espelhar e limpar, tudo sem tocar na lista de arquivos
- Oferta de instalação do yt-dlp conferida com o pacote presente (não pergunta nada)
  e ausente (pergunta, cita o interpretador e respeita a recusa)

- **Qualidade das partes conferida quadro a quadro** contra o trecho correspondente
  do original: PSNR médio 47,4 dB e SSIM médio 0,9944 nas 8 partes, pior caso
  46,4 dB. Acima de 45 dB e 0,99 a diferença é imperceptível a olho
- Download conferido ponta a ponta: baixa, junta vídeo e áudio em MP4, entra na fila
  e sai dividido, espelhado e recortado em 9:16 sem intervenção
- Link inválido no download: erro traduzido no log, sem derrubar a ferramenta

- Divisão de vídeo real de 11m51s em partes de 1,5 min: 8 arquivos, **7 de 7 cortes
  caíram em pausa de fala**, soma das partes 711,2s contra 710,9s do original
- Divisão conferida na matemática: partes contíguas, cobrindo o vídeo inteiro, sem
  parte curta no fim, e vídeo mais curto que o alvo não é dividido
- Corte por `-ss/-to` conferido: com re-encode é exato, com `-c copy` desvia 0,17s
- Ao medir PSNR de uma parte contra a fonte, **normalize os PTS dos dois lados**
  (`setpts=PTS-STARTPTS`). Sem isso o comparador pareia cada quadro com o vizinho
  e o resultado despenca de 49 dB para 30 dB, fingindo perda de qualidade que não existe
- Espelhamento conferido por SSIM: 0,99 ao desespelhar contra o original, 0,33 sem
- Qualidade conferida por PSNR: 48,3 dB em CRF 17 contra 44,5 dB em CRF 23
- "Só limpar" conferido por ffprobe: bitrates de vídeo e áudio idênticos ao original
- Recortes conferidos: 640x360 vira 202x360 (9:16), 360x360 (1:1) e 360x640 (giro 90)
- Preferências conferidas em ida e volta, inclusive com `config.json` corrompido
- Vídeo sem faixa de áudio, vídeo 100% silencioso e vídeo curto demais para dividir:
  todos avisam e seguem sem quebrar
