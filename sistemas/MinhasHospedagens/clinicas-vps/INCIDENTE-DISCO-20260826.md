# Incidente: disco 100% na clinicas-vps (26/08/2026)

## O que aconteceu

A Hostinger enviou alerta de "Disk limit" para srv984283. Quando fui olhar, o
disco ja estava em **100%, com zero bytes livres**, e os **7 sites estavam
fora do ar com 502**:

    vidracariaperto.com.br      marmorariasperto.com.br
    institutoortopedico.com.br  planomedicosaude.com.br
    desentupidora.pro           calistenia.ia.br
    recibosonline.ia.br

Causa imediata do 502: `/root/.pm2/pm2.log` cheio de
`Error: ENOSPC: no space left on device, write`. Sem disco o PM2 nao consegue
escrever e morre, e nenhum app Next sobe.

## Diagnostico

    /home/user/web  78 GB de 96 GB

Dois consumidores:

1. **`app-prev`** em cada site, a copia de rollback do deploy anterior.
   Somavam **44 GB**. Nenhum processo serve dela: todo app roda de `app/`
   (confirmado no `/root/.pm2/dump.pm2`).

2. **Cache ISR das fichas**, o consumidor de verdade. O vidracarias tinha
   **170.955 fichas, 17 GB, 390 mil arquivos numa pasta so**. Cada ficha sao
   tres arquivos irmaos, `.html` + `.rsc` + `.meta`, uns 110 KB no total.
   Nao e lixo: e o Googlebot rastreando o diretorio inteiro. Como
   `generateStaticParams` devolve `[]` e `dynamicParams` e `true`, nada nasce
   no build, tudo nasce sob demanda e fica no disco.

## Por que o prune que ja existia nao segurou

Existia `/root/prune-isr-cache.sh` no cron semanal desde 21/08. O log dele
mostrava:

    podadas 0 entradas
    podadas 0 entradas

Ele apagava entradas com `mtime` maior que 14 dias. Com `revalidate = 7 dias`
e trafego constante, **nenhum arquivo chega aos 14 dias**. Podar cache ISR por
idade nao funciona neste cenario, e o script rodou tres domingos sem apagar
nada enquanto o disco enchia.

## O que foi feito

1. Removidos os oito `app-prev`. Disco 100% -> 58%.
2. `pm2 resurrect` (com `PATH=$PATH:/root/.nvm/versions/node/v20.20.2/bin`,
   senao `pm2` responde "command not found"). Os 22 processos voltaram.
3. Reescrito o `prune-isr-cache.sh` para podar **por tamanho**, nao por idade:
   teto por rota, remove as fichas mais antigas ate voltar ao alvo, sempre o
   trio junto, e aperta os tetos pela metade se o disco passar de 70%.
4. Cron de semanal para **diario** (`0 4 * * *`).
5. Rodado na mao: disco **41%**, com 149 mil fichas podadas.

Backups: `/root/prune-isr-cache.sh.bak-20260826` e `/root/crontab.bak-20260826`.

## Duas armadilhas de quem for mexer no script

**`du -k` por arquivo trava.** A primeira versao chamava `du` tres vezes por
ficha. Com 110 mil fichas sao 300 mil forks: rodou dois minutos sem terminar e
precisou ser morta. A versao boa faz uma passada de
`find -printf '%T@	%s	%p'` e deixa o awk somar.

**As rotas tem estruturas diferentes.** `vidracaria` e `marmoraria` guardam
tudo plano no topo do diretorio; `ortopedista` aninha em `uf/cidade/slug.html`.
Um `find -maxdepth 1` acha zero na segunda, e foi por isso que a primeira
rodada podou so 27 fichas do institutoortopedico. A busca precisa ser
recursiva, com `grep -v '['` para nunca tocar no diretorio de codigo `[uf]`.

## Verificacao

- Os 7 sites em HTTP 200.
- Uma ficha podada testada direto:
  `https://institutoortopedico.com.br/ortopedista/ac/rio-branco/aldo-damian-chambi-garrido-ac1566`
  responde **200** com o title correto, ou seja, o ISR regerou sob demanda e
  nao ha 404 nem perda de indexacao.

## O que ainda merece decisao

O disco de 96 GB fica apertado para o volume de fichas que os diretorios geram.
A poda diaria resolve o sintoma, mas o crescimento e estrutural: quanto mais o
Google rastreia, mais fichas ficam no disco. As opcoes sao aumentar o disco,
baixar os tetos do prune (custa mais regeneracao sob demanda, ou seja, TTFB
maior na primeira visita) ou mover os diretorios maiores para outra VPS.
