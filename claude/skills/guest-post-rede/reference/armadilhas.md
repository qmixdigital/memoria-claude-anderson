# Armadilhas do portal-engine e da operação

O que já quebrou de verdade, e o sintoma pelo qual você reconhece.

## Publicação

**O motor precisa reiniciar depois de editar JSON armazenado.** Editar
`/srv/portais/<dir>/data/<slug>.json` não muda a página: o fallback `@motor` na
porta 8791 continua servindo o conteúdo antigo, inclusive artigo já apagado.
Sintoma: `cf-cache-status: DYNAMIC` e o conteúdo velho na tela, o que prova que
não é cache do Cloudflare. Depois de gravar: `rebuildIndexes` e reiniciar o
serviço.

**Publicação one-shot não gera sitemap.** `rebuildIndexes` tem debounce com
`timer.unref()`, e o processo do script sai antes de o timer disparar. O artigo
responde 200 mas fica fora do sitemap, da home e da categoria. Chamar
`rebuildIndexes` explicitamente e conferir o sitemap sempre com `?nc=`.

**Arquivos root em `public/` bloqueiam o rebuild.** Erro `EACCES`. Resolver com
`chown -R portais:portais` no diretório do portal. Reaparece.

**A dedup é por host.** `_dedup/owners.json` não cobre a rede: o srv1166087 não
tem dedup nenhuma. Conferir o slug nos três hosts antes de fechar a pauta.

**`categoryMap` é indexado por ID numérico**, não por slug. Categoria errada
manda o artigo para uma seção que ninguém visita.

## Conteúdo

**O autoLink injeta.** `autoLinkContent` acrescenta links inline e um parágrafo
final que você não escreveu. Depois de publicar, conferir e limpar: são links
internos extras que estouram a contagem de 2 e podem cair antes do link do
cliente.

**O bloco `pe-leia-meio` suprime a injeção no meio.** Um só por artigo, sempre
no fim. Dois blocos, ou nenhum, mudam o comportamento do motor.

**Inserir conteúdo "antes do H2 de leituras vizinhas" cai dentro do aside.** O
`<aside>` abre antes daquele H2. Ponto de inserção correto: antes da abertura do
aside. Depois de inserir, mover o aside para o fim.

**Regex `<aside.*?</aside>` ao contar palavras.** Com `re.S` e um aside no meio,
ele engole conteúdo real e a contagem mente para baixo.

**O dek cai para o começo do artigo** se não for informado, e a página passa a
repetir o primeiro parágrafo.

**Rodar de novo o script de expansão com um arquivo de patch parcial reverte os
deks** para o original. Todo lote de patch tem que carregar os deks completos.

## Cache

Duas camadas: Cloudflare e LiteSpeed. Comparar `SITE/` com `SITE/?nc=aleatorio`
separa cache de bug. No LiteSpeed, purge por arquivo PHP exige **nome novo a
cada vez**: reusar o nome faz o LSCache servir o 404 já cacheado, e o purge não
roda. A resposta tem que dizer `PURGED`.

## Ferramentas

**Runware devolve base64 truncado** acima de ~2,5 megapixels, e o `json.loads`
estoura com "Unterminated string", que parece erro de rede. Usar
`outputType: "URL"`.

**`ssh` dentro de `while read` come o stdin** e o laço para no primeiro item.
Usar `ssh -n`.

**Heredoc mangueia apóstrofo e regex.** Para script com aspas, escrever local e
mandar por `scp`.

**`grep -r` não segue symlink**, e boa parte dos diretórios da rede é link.

**SerpApi com `site:URL` completa é pouco confiável** para indexação. Preferir a
URL Inspection API do Search Console; onde não houver propriedade, usar
`site:dominio palavra`.

## Entrega

**Uma planilha .xlsx por cliente**, em `D:/PORTAIS/BACKLINKS/<cliente>.xlsx`,
aba única. Planilha de cliente antigo pode ter esquema próprio de colunas:
abrir e conferir os cabeçalhos antes de acrescentar linha, senão os dados caem
na coluna errada.

**Não reenviar ao Apex** URL que já foi enviada: são 3 créditos pagos por URL.

**URL sempre completa e clicável** na entrega, nunca só o slug.

**Levantar o acervo da rede exige `find -L`.** Boa parte dos diretórios em
`/srv/portais` é symlink, e o glob `/srv/portais/*/data/*.json` devolve zero
linha para eles sem erro nenhum. O sintoma é um portal grande aparecendo com
acervo vazio, o que faz toda consulta parecer livre. O comando correto é
`find -L /srv/portais -mindepth 3 -maxdepth 3 -path '*/data/*.json'`, que na
rede inteira devolve mais de 42 mil artigos.

**Os portais de IPTV da rede estão saturados.** A consulta de topo de cada um
quase sempre já tem artigo próprio, às vezes dois. Antes de fechar a pauta,
cruze a lista de consultas do Search Console do portal com o acervo dele e fique
só com o que nenhum artigo cobre. Portal sem nenhuma consulta livre sai da
rodada em vez de receber um post que canibaliza o que já existe.
