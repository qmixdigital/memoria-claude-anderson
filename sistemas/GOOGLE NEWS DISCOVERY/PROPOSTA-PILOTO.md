# Proposta consolidada — piloto do motor de pautas (17 portais)

Levantamento de 20/08/2026. Search Console: janela **2026-05-19 a 2026-08-17** (90 dias).
Dados brutos completos em `gsc_piloto.json` (15 queries por impressão + 10 por clique, por site).

**Nada foi configurado no `sites.json`.** Isto é proposta para o seu aval.

## Resumo executivo

| | |
|---|---|
| Skip rule aplicada | 17 de 17, **0 bloqueios da Cloudflare** |
| Receptores devolvendo 401 (correto) | **11 de 17** |
| Receptores bloqueados pelo **plugin**, não pela borda | **6** — depende da plataforma |
| Portais com nicho legível no Search Console | 12 de 17 |
| Portais **sem dados suficientes** para inferir nicho | **5** |
| Portais com autor já existente | **17 de 17** — nenhuma assinatura nova é necessária |

## Três achados que mudam premissas

**1. Cinco portais não têm nicho para levantar.** `clickinfohub.com` (17 impressões em 90 dias),
`jornalconceito.com` (16), `ocontraditorio.com` (37), `gpnoticias.com` (127) e
`barranews.com.br` (389, sendo 161 da própria marca). O Google não reconhece nicho
nenhum porque praticamente não há tráfego. A premissa "as queries nascem do
levantamento" **não se aplica a eles**: não há o que ler. Proposta abaixo: entrar com
pauta factual genérica de Brasil e economia, e deixar o nicho emergir da medição
depois de 4 a 6 semanas publicando.

**2. Quatro portais têm nicho oposto ao que o nome sugere.**

| Portal | O nome sugere | O Google reconhece |
|---|---|---|
| `viajenodetalhe.com.br` | turismo | **jogo do bicho** (4.045 cliques, milhar da cobra/jacaré/galo) |
| `oiempreendedores.com.br` | empreendedorismo | **IPTV / TV online** (tv online hd, teste xciptv) |
| `qmixdigital.com.br` | revista eletrônica | **ferramenta de símbolos e letras** (198k impressões) |
| `adonline.com.br` | portal de notícia | **curtidas grátis de TikTok** |

Isso confirma sua decisão de não deduzir nicho do domínio, e vai além: em três casos
o nicho real **não comporta notícia factual**.

**3. `viajenodetalhe.com.br` é o melhor portal do piloto e o pior candidato.**
Sozinho tem 4.045 cliques em 90 dias, mais que todos os outros 16 somados. Mas o
tráfego é jogo do bicho, onde não existe notícia factual para o motor cobrir. Publicar
matéria de Brasil e economia ali não conversa com a audiência que já chega. **Sugiro
tirá-lo do piloto** e tratá-lo à parte.

Mesmo raciocínio, com menos força, para `qmixdigital.com.br` (audiência de ferramenta,
não de leitura) e `oiempreendedores.com.br` (audiência de IPTV, que a regra da rede
manda podar fora do wtw19).

## Validação da skip rule e dos receptores

**A skip rule funciona: zero bloqueios da Cloudflare nos 17.**

Dois defeitos apareceram na validação e um deles era meu:

**O motor saía por IPv6.** A regra que apliquei casava `ip.src eq 62.238.112.87`, mas
`curl` sem forçar família usava `2a01:4f9:c015:4a7a::1`. A regra nunca casaria. Corrigi
dos dois lados: `precedence ::ffff:0:0/96 100` no `/etc/gai.conf` do motor (saída
determinística por IPv4) **e** a expressão da regra passou a
`ip.src in {62.238.112.87 2a01:4f9:c015:4a7a::/64}` nas 17 zonas, como rede de
segurança caso o `gai.conf` seja revertido por atualização de pacote.

**Seis receptores bloqueiam por allowlist do próprio plugin.** Não é a Cloudflare:
o cabeçalho traz `x-powered-by: PHP` e o corpo é
`{"code":"forbidden_origin","message":"Origem não autorizada. IP: ..."}`. É código da
plataforma, camada acima da borda. Forçar IPv4 não resolve — o IP do motor não está
cadastrado em nenhuma das duas famílias.

| Portal | Validação |
|---|---|
| qmixdigital, ebookcult, adonline, barranews, jornaldobairroalto, advivo, oiempreendedores, clickinfohub, gpnoticias, jornalconceito, ocontraditorio | **401 OK** |
| viajenodetalhe, sabedoriaglobal, exquisito, pontonaturalbrasil, desassossegada, folhadonoroeste | **403 do plugin** |

**Ação necessária:** cadastrar `62.238.112.87` na allowlist do receptor desses 6.
É trabalho na plataforma do Antônio, não no motor. Enquanto não for feito, esses 6
não recebem publicação — o motor registraria erro a cada tentativa.

Isto também acrescenta uma quarta linha ao checklist de rampa, que só tinha três:

| Resposta | Origem | Significado |
|---|---|---|
| 401 | receptor | correto, chegou e a chave foi recusada |
| 403 `forbidden_origin` | **plugin** | allowlist da plataforma, cadastrar o IP |
| 403 sem JSON | Cloudflare | skip rule ausente ou abaixo de uma genérica |
| 503/522 | origem | portal fora do ar |

## Autores: nenhuma assinatura nova é necessária

Os 17 já têm autor cadastrado. Os 6 do portal-engine têm `equipe` completa com
afinidade de categoria e **avatar já no disco**; os 11 WordPress têm autores em
`wp_authors` na plataforma.

### Conflito operacional: baixo, e por um motivo concreto

Você perguntou se o mesmo autor assinando os dois pipelines cria problema. Verifiquei
o `last_published_at` de cada um na tabela `wp_sites`: **todos os 17 estão parados em
2026-03-06**, e `barranews`, `jornalconceito` e `viajenodetalhe` nunca publicaram.
A plataforma não publica nesses portais há cerca de cinco meses e meio. Na prática não
há concorrência de assinatura, porque não há dois pipelines ativos ao mesmo tempo.

O que **não** encontrei: nenhuma regra no `render.js` nem no `audita_editorial.py`
que assuma um autor por pipeline. A auditoria checa se o artigo tem `rel="author"` e
se o autor tem página, não de onde veio. Reaproveitar o autor existente é seguro e é o
que mantém a consistência editorial.

**Ressalva honesta:** a `equipe` do portal-engine é a fonte da verdade para os 6; para
os 11 WordPress, a lista de `wp_authors` é o que a plataforma usa ao publicar, mas eu
não auditei o plugin receptor para confirmar que ele respeita o campo `author` do
payload. Vale um teste de publicação real em um deles antes de assumir os 11.

## Proposta por portal

Ordem: os que recomendo manter no piloto primeiro.

### Com nicho legível e compatível com notícia factual

| Portal | Nicho real (Search Console) | Autor a reaproveitar | Queries sugeridas |
|---|---|---|---|
| `jornaldobairroalto.com.br` | serviço e marca própria: INSS, assinatura digital, Mega-Sena | **Redação** (id 12) | `INSS benefícios regras`, `serviços públicos cidadão`, `Mega-Sena resultado` |
| `desassossegada.com.br` | casa e serviços + novela turca | **Notícias do Dia** (id 6) | `casa reforma serviços`, `televisão novelas estreia` |
| `advivo.com.br` | celebridades e entretenimento | **Redação Diária** (id 18) | `celebridades entretenimento notícias`, `televisão audiência` |
| `exquisito.com.br` | curiosidades, espiritualidade, gramática | **Marcelo Costa** (id 4, já é o padrão) | `curiosidades ciência descoberta`, `comportamento pesquisa estudo` |
| `sabedoriaglobal.com.br` | espiritualidade e comportamento | **Jornalismo e Conteúdo** (id 13) | `espiritualidade religião notícias`, `comportamento bem-estar` |
| `ebookcult.com.br` | livros, educação, referência | **Redação** (id 11) | `livros literatura lançamentos`, `educação ensino superior` |
| `pontonaturalbrasil.com.br` | how-to de casa e imposto (**não** é saúde, confirmado) | **Tribuna Editorial** (id 5) | `imposto de renda prazo regras`, `casa construção reforma` |
| `folhadonoroeste.com.br` | jornal local, base fraca | **Editorial Folha do Noroeste** (id 2) | `notícias Brasil geral`, `entretenimento celebridades` |

### Sem dados: nicho a descobrir pela medição

Entrar com pauta factual ampla e reavaliar em 4 a 6 semanas.

| Portal | Volume em 90 dias | Autor a reaproveitar | Queries sugeridas |
|---|---|---|---|
| `barranews.com.br` | 389 impr, 16 cliques | **Renata Vilar** · `renata-vilar` (avatar OK) | `notícias Brasil geral`, `economia Brasil`, `política Congresso` |
| `gpnoticias.com` | 127 impr, 1 clique | **Adriana Mesquita** · `adriana-mesquita` (avatar OK) | `notícias Brasil geral`, `esporte futebol` |
| `ocontraditorio.com` | 37 impr, 0 cliques | **Heitor Vasconcellos** · `heitor-vasconcellos` (avatar OK) | `notícias Brasil geral`, `política Congresso` |
| `clickinfohub.com` | 17 impr, 0 cliques | **Lívia Peçanha** · `livia-pecanha` (avatar OK) | `notícias Brasil geral`, `tecnologia novidades` |
| `jornalconceito.com` | 16 impr, 0 cliques | **Eduardo Caldeira** · `eduardo-caldeira` (avatar OK) | `notícias Brasil geral`, `economia Brasil` |

Estes cinco são justamente os do portal-engine com receptor validado em 401 e autor
com avatar pronto. São os candidatos **operacionalmente** mais limpos do piloto, mesmo
sem histórico de nicho.

### Recomendo tirar do piloto

| Portal | Motivo |
|---|---|
| `viajenodetalhe.com.br` | audiência de jogo do bicho; notícia factual não conversa. Além disso o receptor está em 403 do plugin |
| `qmixdigital.com.br` | audiência de ferramenta de símbolos, não de leitura |
| `oiempreendedores.com.br` | audiência de IPTV, que a regra da rede manda podar fora do wtw19 |
| `adonline.com.br` | audiência de SMM (curtidas de TikTok) |

Se saírem os quatro, o piloto fica com **13**, todos com receptor ou nicho coerente.

## O que depende de você

1. **Aprovar ou corrigir a leitura de nicho** de cada portal
2. **Decidir sobre os 4 que sugiro tirar** — é leitura de negócio, não técnica
3. **Cadastrar `62.238.112.87` na allowlist do receptor** dos 6 em 403 (plataforma do Antônio)
4. **Confirmar os autores** da tabela, ou apontar outro entre os já cadastrados
5. Depois disso eu preencho o `sites.json` e o serviço sobe com o seu ok
