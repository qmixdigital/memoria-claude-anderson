# -*- coding: utf-8 -*-
import json, io
H = "https://www.empilhando.com.br/"
# n, site, domain, cat_id, sufixo, slug, ancora, kw, titulo(H1), angulo, internos[(href,titulo)]
P = [
 ("E01", "euvo", "euvo.com.br", "101", 12, "teste-iptv-3-dias-o-que-avaliar-em-cada-dia", "teste IPTV 3 dias", "teste iptv 3 dias",
  "Teste IPTV 3 dias: o que avaliar em cada dia de uso",
  "Roteiro dia a dia para um teste de 3 dias: dia 1 instalação e canais, dia 2 horário de pico e esportes, dia 3 estabilidade, travamentos e suporte. Portal com muito conteúdo de IPTV (xciptv, sinal, 4K): ângulo de método de avaliação, não de instalação.",
  [("/como-melhorar-a-qualidade-do-sinal-no-iptv-em-casa/", "Como melhorar a qualidade do sinal no IPTV em casa"), ("/qualidade-de-imagem-no-iptv-hd-full-hd-e-4k-explicados/", "Qualidade de imagem no IPTV: HD, Full HD e 4K explicados")]),
 ("E02", "euvo", "euvo.com.br", "101", 12, "teste-iptv-sem-cadastro-como-reconhecer-a-oferta-segura", "teste IPTV sem cadastro", "teste iptv sem cadastro",
  "Teste IPTV sem cadastro: como reconhecer a oferta segura",
  "O que significa teste sem cadastro, que dados são legítimos de pedir (e quais não são), sinais de oferta insegura (pedido de senha de outros serviços, pagamento adiantado, link encurtado), como se proteger. Ângulo de segurança do consumidor.",
  [("/iptv-gratis-existe-o-que-esta-por-tras-da-oferta/", "IPTV Grátis Existe? O Que Está por Trás da Oferta"), ("/como-funciona-a-lista-m3u-no-iptv-e-para-que-ela-serve/", "Como funciona a lista M3U no IPTV e para que ela serve")]),
 ("E03", "revistadeducao", "revistadeducao.com.br", "3364", 22, "iptv-teste-16-horas-o-tempo-basta-para-decidir", "IPTV teste 16 horas", "iptv teste 16 horas",
  "IPTV teste 16 horas: o tempo basta para decidir?",
  "O que cabe em 16 horas de teste (uma noite de jogo, um fim de semana de séries, horários de pico), o que não dá para medir nesse prazo, checklist de decisão. Portal de perfil educacional com bloco de tech: tom explicativo.",
  [("/tecnologia/quais-aplicativos-iptv-para-tv-samsung/", "Quais Aplicativos IPTV para TV Samsung?"), ("/entretenimento/o-que-e-iptv-hibrido-e-como-ele-combina-tecnologias-diferentes/", "O que é IPTV híbrido e como ele combina tecnologias diferentes")]),
 ("E04", "revistadeducao", "revistadeducao.com.br", "3364", 22, "gerador-de-teste-iptv-como-funciona-e-o-que-nao-garante", "gerador de teste IPTV", "gerador de teste iptv",
  "Gerador de teste IPTV: como funciona e o que ele não garante",
  "O que é um gerador de teste IPTV (liberação automática de acesso temporário), como o acesso é entregue, o que depende do provedor, limites e cuidados (o gerador não garante qualidade nem catálogo). Ângulo técnico-explicativo, sem prometer resultado.",
  [("/dica/melhor-aplicativo-de-iptv-para-tv-box/", "Melhor aplicativo de IPTV para TV box"), ("/dica/teste-iptv-via-email-7-dias-para-maratonar-series/", "Teste IPTV Via Email 7 Dias para Maratonar Séries")]),
 ("E05", "desassossegada", "desassossegada.com.br", "123", 17, "teste-de-iptv-no-celular-android-e-iphone-passo-a-passo", "teste de IPTV no celular", "teste de iptv no celular",
  "Teste de IPTV no celular: Android e iPhone, passo a passo",
  "Como testar IPTV no celular (app compatível, dados móveis x Wi-Fi, consumo de dados, bateria, orientação de tela), com diferenças reais entre Android e iPhone sem inventar detalhes de menu: conferir em fonte oficial. Portal de bem-estar e cultura.",
  [("/iptv-consumo-de-dados/", "Consumo de dados do IPTV: quanto gasta por hora e como economizar no celular"), ("/lista-iptv-atualizada/", "Lista IPTV atualizada: como saber se ela ainda funciona antes de depender dela")]),
 ("E06", "desassossegada", "desassossegada.com.br", "123", 17, "teste-iptv-48-horas-roteiro-para-avaliar-sinal-e-canais", "teste IPTV 48 horas", "teste iptv 48 horas",
  "Teste IPTV 48 horas: roteiro para avaliar sinal e canais",
  "Roteiro de 48 horas com planilha mental: canais que mais assiste, horário de pico, falhas, troca de canal, som. Diferença para o roteiro de 3 dias (outro artigo da rede): aqui o foco é ficha de avaliação e decisão sem pressa.",
  [("/iptv-travando-na-smart-tv/", "IPTV travando na smart TV: por que só nela"), ("/canais-no-iptv/", "Canais no IPTV: como saber quantos funcionam de verdade e montar sua lista")]),
 ("E07", "oiempreendedores", "oiempreendedores.com.br", "101", 20, "teste-iptv-sem-cartao-o-que-e-seguro-e-o-que-pede-cautela", "teste IPTV sem cartão", "teste iptv sem cartão",
  "Teste IPTV sem cartão: o que é seguro e o que pede cautela",
  "Ângulo do consumidor/empreendedor: por que um teste legítimo não precisa de cartão, riscos de cobrança recorrente escondida, como conferir termos, o que guardar de prova, direitos do consumidor (CDC) sem citar artigo que você não confirmou. Diferença para o artigo 'sem cadastro' (euvo): aqui é pagamento e cobrança.",
  [("/iptv/iptv-tem-todos-os-streamings/", "IPTV tem todos os streamings? O que o catálogo entrega de verdade"), ("/iptv/queixa-de-iptv/", "Queixa de IPTV: como reunir provas, onde reclamar e o que esperar da resposta")]),
 ("E08", "qmixdigital", "qmixdigital.com.br", "101", 15, "teste-iptv-agora-como-pedir-e-receber-o-acesso-na-hora", "teste IPTV agora", "teste iptv agora",
  "Teste IPTV agora: como pedir e receber o acesso na hora",
  "Fluxo de pedir um teste e receber o acesso rápido (formulário, WhatsApp, e-mail), o que informar (modelo de aparelho), o que esperar de tempo de resposta sem prometer prazo, o que fazer enquanto espera. Portal de marketing/tecnologia com muito IPTV.",
  [("/iptv/iptv-tem-globoplay/", "IPTV tem Globoplay? O que entra na grade e o que é só promessa"), ("/dicas/como-transformar-sua-smart-tv-com-teste-iptv-rapido-e-pratico/", "Como transformar sua Smart TV com teste IPTV rápido e prático")]),
 ("E09", "viajenodetalhe", "viajenodetalhe.com.br", "101", 19, "teste-iptv-72-horas-o-que-checar-antes-de-viajar", "teste IPTV 72 horas", "teste iptv 72 horas",
  "Teste IPTV 72 horas: o que checar antes de viajar",
  "Usar 72 horas de teste ANTES de uma viagem: testar no 4G e no Wi-Fi do hotel, outro dispositivo, o que levar, o que fazer se não funcionar fora de casa. O portal já tem 'IPTV em viagem' (interno): este artigo é o pré-teste, não repete o guia.",
  [("/iptv/iptv-em-viagem/", "IPTV em viagem: hotel, pousada, 4G e o que levar na mala para a TV"), ("/iptv/iptv-funciona-na-starlink/", "IPTV funciona na Starlink? O que muda na internet por satélite")]),
 ("E10", "adonline", "adonline.com.br", "2", 11, "teste-iptv-confiavel-sinais-que-separam-servico-serio-de-golpe", "Empilhando", "teste iptv confiável",
  "Teste IPTV confiável: sinais que separam serviço sério de golpe",
  "Checklist de confiabilidade (identificação do fornecedor, canal de suporte, termos claros, ausência de pedido de senha, pagamento rastreável). A âncora é a MARCA 'Empilhando' (link para a home) citada como exemplo de página que oferece teste, sem elogio exagerado. Keyword do texto: 'teste iptv confiável' (a âncora é a marca, não a keyword).",
  [("/iptv-precisa-de-tv-box/", "IPTV precisa de TV Box? A resposta está na televisão, não no vendedor"), ("/o-que-e-iptv-no-roteador/", "O que é IPTV no roteador: Guia completo e configuração")]),
]
out = []
for n, site, dom, cat, suf, slug, anc, kw, tit, ang, ints in P:
    assert kw.lower() in tit.lower(), n
    out.append(dict(n=n, site=site, domain=dom, cat_id=cat, sufixo=suf, meta_title_max=60 - suf, slug=slug, destino=H, ancora=anc, kw=kw, titulo=tit, angulo=ang,
                    internos=[dict(href=a, titulo=b) for a, b in ints]))
io.open("plano-emp.json", "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
print([(o["n"], len(o["titulo"]), o["meta_title_max"]) for o in out])
