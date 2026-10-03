---
name: qmix-conteudos-proibidos
description: Temas que a QMIX não publica em nenhum portal (diploma sem cursar, rateio de cursos, documentos falsos...) e onde o aviso aparece no site
metadata:
  type: project
---

Desde 02/10/2026 o site separa duas listas em `src/lib/conteudos-restritos.ts`:

- `CONTEUDOS_PROIBIDOS`: não publicamos em nenhum portal, nem pela rede de nichos especiais. Venda ou "facilitação" de diplomas/certificados sem cursar, rateio de cursos e material de concurso sem licença, documentos falsos, drogas, hacking, listas de dados pessoais, reviews falsos, discurso de ódio.
- `CONTEUDOS_RESTRITOS`: nichos especiais (apostas, armas, vapes, álcool, IPTV, trader etc.), fora do preço de tabela, atendidos por rede separada com orçamento pelo WhatsApp.

O aviso `<AvisoConteudoProibido />` (`src/components/common/`) fica SEMPRE visível, sem botão de contato: ficha do portal (versão curta, acima do botão de compra), checkout (lista inteira, antes da caixa de confirmação), envio de dados do pedido e dentro da janela "Ver lista completa".

**Why:** chegaram dois pedidos pagos de venda de diploma (o 130, brunoaprovaconcursos.com.br, "nós assumimos 100% da sua jornada acadêmica, sem necessidade de cumprir aulas") e de rateio de cursos. A lista antiga ficava atrás de um link e o texto ao lado dizia "Calma, não é o fim do caminho", convidando a pedir orçamento. O Anderson quer que essas pessoas não comprem nem entrem em contato.

**How to apply:** tema novo que não se publica entra em `CONTEUDOS_PROIBIDOS`, nunca na lista de nichos especiais. Não escrever matéria para site desses temas mesmo com pedido pago: avisar o Anderson. A caixa do checkout diz que não há reembolso para conteúdo restrito; estorno é decisão dele. Ver [[qmix-apostas-precos]].
