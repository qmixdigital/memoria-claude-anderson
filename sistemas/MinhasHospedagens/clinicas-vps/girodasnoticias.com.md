# girodasnoticias.com

Portal **ja convertido** para portal-engine, em instancia anterior a rodada de
agosto de 2026. Pasta criada para receber ajustes separados no futuro.

## Search Console

| | |
|---|---|
| Propriedade | `sc-domain:girodasnoticias.com` |
| Conta Google | **u/9** |
| Desempenho | https://search.google.com/u/9/search-console/performance/search-analytics?resource_id=sc-domain%3Agirodasnoticias.com |
| Usuarios | https://search.google.com/u/9/search-console/users?resource_id=sc-domain%3Agirodasnoticias.com |
| Leitura por API | a conta de servico `enjai-ga4-reader@enjai-493011.iam.gserviceaccount.com` ja tem acesso |

Entrar pela conta errada mostra a propriedade como inexistente. A lista veio com
duas contas misturadas, por isso o numero acima faz parte da ficha.

## Onde vive

| | |
|---|---|
| Servidor | VPS OpenGravity |
| IP de origem | `77.37.69.175` |
| Acesso | `ssh opengravity` |
| Raiz do site | `/srv/portais/girodasnoticias` |
| URL | https://girodasnoticias.com |
| Arquitetura | **M** |
| Cor primaria | `#1d3a5f` |
| Contato entrega em | qmixdigital@gmail.com |

## Acervo

| | |
|---|---|
| Artigos | **1969** |
| Editorias | insights (726), entretenimento (576), noticias (564), geral (68), saude (35) |

## Distancia para o padrao da rede nova

Medido no HTML publicado. Nao e defeito de conversao, e versao antiga do motor.

| Item | Aqui | Padrao |
|---|---|---|
| Banner de LGPD | 0 (0%) | todas as paginas |
| `rel="author"` | 0 (0%) | 100% |
| Artigos sem imagem | 552 (28%) | 0 |
| Travessao | 82 artigos | 0 |
| Title acima de 60 | 1828 (93%) | 0 |
| Linkagem interna | ligada | ligada |
| Classe CSS | literal, compartilhada | hasheada por portal |

O caminho para nivelar esta em `d:\PORTAIS\CONFERENCIA-10-DOMINIOS.md`, secao
"Para deixar igual aos 30". Vale para todos os portais destas duas instancias.

## Nivelamento aplicado

Feito na varredura das instancias antigas. O que esta marcado ja esta no ar.

- [x] **Nome de classe CSS proprio por portal.** O hash por portal foi portado
      para este motor. Antes, dois dominios do mesmo servidor chegavam a
      compartilhar 20 nomes de classe no artigo; agora sao **zero**.
- [x] **Banner de LGPD** em todas as paginas. O motor nao tinha a funcao.
- [x] **Title dentro de 60 caracteres**, cortando na ultima palavra cheia e
      usando `metaTitle` quando existe. Antes, 84% a 93% do acervo estourava o
      corte do Google.
- [x] **IPTV extirpado.** Foram encontrados enxertos de afiliado grafados no
      meio de materias legitimas ("faca um teste de IPTV automatico", sempre com
      link). A frase saiu e o artigo ficou; quem era IPTV de ponta a ponta foi
      apagado, com 410 na URL.
- [x] **Artigos sem imagem apagados**, conforme a regra da casa, com 410 na URL.
- [x] **Travessao zerado** em todas as paginas, inclusive o que vinha do proprio
      motor na pagina de contato e o que vinha do slogan no `sites.json`.
- [x] **Marca da agencia removida** do conteudo.
- [x] **Legenda invalida removida** (alt cru em ingles, nome de arquivo do
      WordPress, legenda igual ao alt).
- [x] **Linha fina repetida** no corpo do texto, corrigida.
- [x] **Contato passa a entregar em `gisellewagnerofc@gmail.com`**, que e o
      destino unico da rede.

## O que ainda falta

- [ ] **Assinatura de autor e pacote editorial.** Estes motores nao renderizam
      pagina de autor, entao nao adianta cadastrar a redacao: seria nome sem
      pagina para apontar. Fechar isso exige portar o suporte a `equipe`,
      `/autor/<slug>/`, `/equipe/` e `/politica-editorial/`, alem de escrever as
      personas e gerar os retratos. E o maior item restante para E-E-A-T.
- [ ] **Linkagem interna automatica** no servidor srv1166087, cujo motor nao tem
      a funcao (o da OpenGravity tem, e esta ligada).
- [ ] **Vocabulario de ancora exclusivo por portal**, como os 34 da clinicas-vps
      ja tem. Depende do item anterior.
