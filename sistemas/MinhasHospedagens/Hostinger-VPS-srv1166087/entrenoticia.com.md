# entrenoticia.com

Portal em **portal-engine**, convertido antes da rodada de agosto de 2026.
Roda numa instancia mais antiga do motor, e por isso nao tem varias das
correcoes que os 30 portais da clinicas-vps ja receberam. A comparacao item a
item esta no fim desta ficha.

## Onde vive

| | |
|---|---|
| Servidor | Hostinger VPS srv1166087 (KVM 8 + HestiaCP) |
| IP de origem | `31.97.173.40` |
| Acesso | `ssh hostinger-vps-srv1166087` |
| Raiz do site | `/srv/portais/entrenoticia` |
| Motor | `/opt/portal-engine` |
| URL | https://entrenoticia.com |
| Frente | Cloudflare, proxied |
| Namespace da API | `entrenoticia-api/v1` |

## Identidade

| | |
|---|---|
| Nome | Entre Notícia |
| Nome curto | nao definido |
| Arquitetura | **H** (`d:\PORTAIS\ENTRENOTICIA\infra\arch-H.js`) |
| Cor primaria | `#ff3d7f` |
| Fonte de display | "Big Shoulders Display", system-ui, sans-serif |
| Fonte de texto | "Spline Sans", system-ui, -apple-system, sans-serif |
| Contato entrega em | fatimawatanabe36@gmail.com |

## Acervo

| | |
|---|---|
| Artigos | **1848** |
| Paginas publicadas | 1848 |
| Editorias | noticias (1032), entretenimento (412), insights (290), saude (50), marketing (37), casa (21), empreendedorismo (6) |
| Vitrine da home | nao configurada |
| Assinaturas | Entre Notícia (1848) |
| Equipe cadastrada | **nenhuma** |

## O que a conferencia mediu

| Item | Neste portal | Padrao da rede nova |
|---|---|---|
| Banner de LGPD | **0 (0%)** | em todas as paginas |
| `rel="author"` no artigo | **0 (0%)** | 100% |
| Artigos sem imagem | **600 (32%)** | 0, a regra apaga |
| Travessao no conteudo | **32 artigos** | 0 |
| Title acima de 60 caracteres | **1574 (85%)** | 0 |
| `metaTitle` proprio | 0 (0%) | onde o title passaria de 60 |
| Linkagem interna automatica | **desligada** | ligada nos 30 |
| Nome de classe CSS | **literal, compartilhado** | hasheado por portal |
| Vocabulario de ancora | compartilhado | 12 frases exclusivas por portal |
| `exigeImagem` | **desligado** | ligado |
| `titleMax` | nao definido | 60 |
| Pagina `/equipe/` | **404** | existe nos 30 |
| Pagina `/politica-editorial/` | **404** | existe nos 30 |
| Contato entregue a | `fatimawatanabe36@gmail.com` | `gisellewagnerofc@gmail.com` |

## O que falta para ficar igual aos 30

1. **Banner de LGPD**: nao existe em nenhuma pagina. E obrigatorio na casa e a instancia antiga do motor nem tem a funcao (`cookieBanner` ausente do render.js).
2. **Assinatura de autor**: nenhum artigo aponta para uma pagina de autor. Sem isso nao ha sinal de E-E-A-T e as paginas de autor, se existissem, ficariam sem link.
3. **600 artigos sem imagem** (32% do acervo). Na conversao total esses artigos sao apagados, com 410 na URL antiga.
4. **Travessao em 32 artigos**. Denuncia texto de IA e e proibido em conteudo.
5. **1574 titles acima de 60 caracteres** (85%). O Google corta em 60, entao a ultima parte do titulo nao aparece na busca.
6. **Linkagem interna desligada**. O motor tem o recurso, mas ele nasce desligado.
7. **Nomes de classe literais**: esta instancia nao tem o hash por portal, entao os portais dela compartilham o vocabulario de classes. E o sinal mais forte de rede.
8. **Vocabulario de ancora compartilhado**: mesmo problema que eu corrigi nos 30, onde a mesma frase saia em ate 22 dominios.
9. **Pacote editorial ausente**: `/equipe/` e `/politica-editorial/` respondem 404. Sem redacao declarada nao ha a quem atribuir a assinatura, entao o item anterior depende deste.
10. **Contato vai para `fatimawatanabe36@gmail.com`**, e nao para `gisellewagnerofc@gmail.com`, que e o destino unico da rede. No caso do `qmixdigital@gmail.com` ha um agravante: o endereco carrega o nome da agencia, e portal de backlink nao pode ter nenhuma assinatura dela.

Nada disso e defeito de conversao: e a distancia entre a versao do motor que roda aqui e a
que roda na clinicas-vps. Atualizar exige levar o `render.js` novo para este servidor e
depois rodar a esteira de correcao, na mesma ordem que foi usada nos 30.

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
