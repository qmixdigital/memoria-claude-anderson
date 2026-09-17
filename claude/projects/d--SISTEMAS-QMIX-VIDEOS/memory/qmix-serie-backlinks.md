---
name: qmix-serie-backlinks
description: "Serie de videos longos sobre backlinks no canal da QMIX Digital, ordem e temas"
metadata: 
  node_type: memory
  type: project
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-07T20:34:46.218Z
---

O Anderson mantem uma serie de videos horizontais (1920x1080, 4 a 5 minutos) no canal da
QMIX Digital, cada um mirando uma palavra-chave comercial de cauda longa. Um vem depois do
outro, e cada video novo linka os anteriores na descricao.

Ordem ate 07/08/2026 (a lista canonica e viva fica em `demandas qmix/PUBLICADOS.md`):

1. qmix-1, vertical, "o que e um backlink" (piloto)
2. qmix-2, "comprar backlinks vale a pena" — https://youtu.be/S-NDuJXnCuQ
3. qmix-3, "conteudo de qualidade com IA" — https://youtu.be/zYJYAwabyDg
4. qmix-4, "backlinks de nicho ou portal de noticias" — https://youtu.be/FRGetVYgIiQ
5. qmix-5, "comprar backlinks brasileiro" — https://youtu.be/VFslxv0xwGM
6. qmix-6, "comprar backlinks baratos" — https://youtu.be/4iu-hEJ838E
7. qmix-7, "onde comprar backlinks" — https://youtu.be/KeAFoto-QW0
8. qmix-8, "como subir posicoes no Google" (topo de funil) — https://youtu.be/wzdkApKPvYU
9. qmix-9, video INSTITUCIONAL — https://youtu.be/VxTa3vnPxBk
   Nao e da serie: e o video-vitrine, para fixar no canal, embutir na home e o
   comercial mandar para lead. Saiu com a 2a opcao de titulo, e a licao vale:
   titulo institucional abre pelo BENEFICIO, nao pelo nome da empresa, porque quem
   nao conhece a marca nao clica em nome de empresa.
10. qmix-10, "quem e a QMIX Digital" (historia da empresa) — https://youtu.be/YSK8ZI0t70s
    Nasceu com narracao mista (voz clonada do Anderson + narrador), ele nao gostou de
    ouvir a propria voz e o video virou narracao unica em terceira pessoa.
11. qmix-11, "criacao de sites otimizados para SEO" — https://youtu.be/sZDoXw7ZLP8
    Abre a frente comercial de CRIACAO DE SITES, o terceiro servico da casa ao lado de
    backlinks e conteudo. Saiu com a 3a opcao, que era o titulo de trabalho do proprio
    briefing ([[qmix-titulo-de-trabalho]]).
12. qmix-12, "o que sao backlinks" — https://youtu.be/RQevDiUOJz0
    Topo de funil para LEIGO, publico que nunca ouviu a palavra. E a porta de entrada da
    serie inteira e o candidato natural a video mais assistido do canal no longo prazo.
13. qmix-13, "cuidado ao comprar backlinks" — PRONTO, ainda nao publicado
14. qmix-14, "como comprar backlinks" — https://youtu.be/XZqMyAZojfU
    TUTORIAL da plataforma, o unico da serie que reproduz a interface do site com
    fidelidade. O kit da loja esta em remotion/src/lib/loja.tsx, recriado a partir de
    prints; o cabecalho do arquivo lista o que foi omitido de proposito (garantia em
    quatro lugares, o selo Permanente, precos e nomes reais de portais).

15. qmix-15, "o que e a QMIX Digital" — https://youtu.be/mUSil36E_BQ
    Estreia o FORMATO "5 perguntas, 5 respostas": barra de busca digitando cada pergunta
    e contador de cinco no canto, corte seco entre blocos, 2m19. Formato reaproveitavel
    para qualquer tema, se performar bem.

16. qmix-16, "o que e texto ancora" — https://youtu.be/h4XhwpeSxN8
    Aula curta para leigo, 3m50. Existe para resolver dor de atendimento: o cliente trava
    no campo "texto ancora" do formulario da plataforma. O painel real do checkout ja
    linkava "Nao sabe o que e texto ancora? Veja em 1 minuto", e este video e a resposta.

O fluxo de producao que se firmou: briefing em markdown do Anderson -> beats.json com
estimativa -> gen_voice -> retimar.py (a estimativa linear erra em linha curta, porque a voz
tem custo fixo por linha) -> gen_voice --emit-ts -> composicao TSX contra os tempos REAIS ->
QA em frame -> render -> mux -> mix_sfx -> entrega.py.

**How to apply:** quando o briefing pedir aprovacao do roteiro antes de renderizar, pare
depois do beats.json e do script.md, porque a voz custa por caractere. Cada video novo
precisa de motivo de thumbnail proprio ([[qmix-thumb-motivo-unico]]) e da marca escrita por
inteiro ([[qmix-marca-completa]]). O briefing costuma trazer uma "Nota para o Anderson"
oferecendo um artigo de blog com o video incorporado; ele ainda nao pediu nenhum.

- `qmix-18-site-html` (Site em HTML puro + hospedagem gratuita na Cloudflare Pages, 4m30): fecha a trinca do servico de criacao de sites com o qmix-11 e o qmix-17. Entregue, aguardando publicacao.
- `qmix-19-artigos-seo` (Artigos otimizados para SEO, a arma secreta do blog, 5m04): vídeo do serviço de produção de conteúdo. https://youtu.be/yHqaNZekglY

- `qmix-20-tipos-backlinks` (Tipos de backlinks, o tour pelos sete com semáforo, 5m09): https://youtu.be/ShgzYPu-o4Y
- `qmix-21-agencia-backlinks` (Agência de backlinks, o que é e os resultados, 4m57): https://youtu.be/WFZ9Sss2h-U
- `qmix-22-pacote-backlinks` (Comprar pacote de backlinks, 4m52): https://youtu.be/YXHKvkB5lQY
- `qmix-23-quantos-backlinks` (Quantos backlinks eu preciso, a resposta honesta, 4m51): https://youtu.be/T_IZ2-_GRfE

Aguardando publicação: `qmix-13-cuidado-comprar-backlinks` e `qmix-18-site-html`, os dois
anteriores à regra de pronúncia `Quêmix`.
