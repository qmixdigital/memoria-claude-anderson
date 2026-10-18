# -*- coding: utf-8 -*-
import json, io
H = "https://teste-iptv.top/"
R = {(x["site"], x["slug"]): x for x in json.load(io.open("internos-resolvidos.json", encoding="utf-8"))}
SUF = {"euvo": 12, "revistadeducao": 22, "desassossegada": 17, "oiempreendedores": 20, "qmixdigital": 15, "viajenodetalhe": 19, "adonline": 11}
DOM = {"euvo": "euvo.com.br", "revistadeducao": "revistadeducao.com.br", "desassossegada": "desassossegada.com.br", "oiempreendedores": "oiempreendedores.com.br", "qmixdigital": "qmixdigital.com.br", "viajenodetalhe": "viajenodetalhe.com.br", "adonline": "adonline.com.br"}
CAT = {"euvo": "101", "revistadeducao": "3364", "desassossegada": "123", "oiempreendedores": "101", "qmixdigital": "101", "viajenodetalhe": "101", "adonline": "2"}
P = [
 ("T01", "euvo", "teste-iptv-por-whatsapp-como-pedir-e-o-que-conferir", "IPTV TOP", "teste iptv por whatsapp", "Teste IPTV por WhatsApp: como pedir e o que conferir",
  "Como funciona pedir um teste de IPTV por WhatsApp: o que enviar (modelo do aparelho), o que o atendente deve informar (app, formato de acesso, prazo, número de telas), como guardar os dados, sinais de alerta (pedido de senha de outros serviços, pagamento adiantado). A âncora é a marca 'IPTV TOP', citada como exemplo de página que, segundo ela mesma, atende por WhatsApp.",
  ["iptv-para-idosos-como-deixar-simples", "anuncios-no-player-de-iptv"]),
 ("T02", "euvo", "teste-iptv-no-fire-stick-instalacao-e-checagem-passo-a-passo", "teste IPTV no Fire Stick", "teste iptv no fire stick", "Teste IPTV no Fire Stick: instalação e checagem passo a passo",
  "Como testar IPTV no Fire TV Stick: aplicativo compatível, instalar apenas de fontes oficiais da loja do aparelho (não prometa passos de menu que você não confirmou em fonte oficial da Amazon), rede, controle remoto, o que checar nos primeiros minutos.",
  ["iptv-na-tv-box-android", "guia-de-canais-vazio"]),
 ("T03", "revistadeducao", "teste-iptv-no-iphone-como-configurar-e-o-que-avaliar", "IPTV Teste TOP", "teste iptv no iphone", "Teste IPTV no iPhone: como configurar e o que avaliar",
  "Teste de IPTV no iPhone/iPad: app compatível da App Store, dados móveis x Wi-Fi, bateria, orientação de tela, o que observar (abertura, troca de canal). Tom explicativo de portal educacional. A âncora é o nome da página, 'IPTV Teste TOP'.",
  ["iptv-para-criancas", "iptv-no-pc-e-notebook"]),
 ("T04", "revistadeducao", "teste-iptv-em-duas-telas-como-verificar-o-limite-de-aparelhos", "teste IPTV em duas telas", "teste iptv em duas telas", "Teste IPTV em duas telas: como verificar o limite de aparelhos",
  "Como testar o uso simultâneo em duas telas (a página do cliente informa uso em até 2 aparelhos ao mesmo tempo): como montar o teste (dois aparelhos, canais diferentes, mesma rede), o que muda na estabilidade, o que perguntar sobre o limite antes de aceitar.",
  ["iptv-tem-espn", "iptv-travando-na-tv-box"]),
 ("T05", "desassossegada", "teste-iptv-24-horas-um-dia-inteiro-para-avaliar-o-servico", "teste IPTV 24 horas", "teste iptv 24 horas", "Teste IPTV 24 horas: um dia inteiro para avaliar o serviço",
  "Um dia inteiro de teste: manhã, tarde, noite e madrugada, o que mudar de horário para horário, ficha de registro simples. Diferente dos artigos de 20 e 36 horas do mesmo portal (outros lotes): aqui o eixo é cobrir as 24 horas do dia em quatro janelas.",
  ["lista-iptv-m3u-o-que-e", "iptv-travando-na-smart-tv"]),
 ("T06", "desassossegada", "teste-iptv-com-suporte-como-avaliar-o-atendimento-no-teste", "IPTV TOP", "teste iptv com suporte", "Teste IPTV com suporte: como avaliar o atendimento no teste",
  "Como avaliar o suporte DURANTE o teste: canal de atendimento, tempo de resposta, clareza da orientação de configuração, se há pressão para assinar (a página do cliente diz oferecer suporte 24 horas; atribua isso a ela, sem confirmar). A âncora é a marca 'IPTV TOP'.",
  ["lista-iptv-gratis-definitiva", "lista-iptv-paga-ou-gratis"]),
 ("T07", "oiempreendedores", "teste-iptv-com-ativacao-imediata-o-que-conferir-antes", "teste IPTV com ativação imediata", "teste iptv com ativação imediata", "Teste IPTV com ativação imediata: o que conferir antes",
  "O que significa ativação imediata (acesso enviado em minutos), por que rapidez não prova qualidade, o que conferir antes de aceitar (quem fornece, prazo, telas, fim do teste). Ângulo do pequeno empreendedor/consumidor. Diferente do artigo 'liberado na hora' (revistadeducao) e dos artigos de pagamento do mesmo portal.",
  ["iptv-na-loja", "iptv-no-escritorio"]),
 ("T08", "qmixdigital", "teste-iptv-na-tv-box-como-instalar-e-checar-a-estabilidade", "teste IPTV na TV Box", "teste iptv na tv box", "Teste IPTV na TV Box: como instalar e checar a estabilidade",
  "Teste de IPTV na TV Box: aplicativo, memória e rede da caixa, cabo ou Wi-Fi, o que observar na estabilidade, como reconhecer sobrecarga do aparelho. O portal já tem 'TV Box: como testar antes de comprar' (interno): este artigo trata de testar o IPTV na caixa.",
  ["oferta-de-iptv-por-mensagem", "tv-box-como-testar-antes-de-comprar"]),
 ("T09", "viajenodetalhe", "teste-iptv-no-chromecast-como-usar-na-tv-do-hotel", "teste IPTV no Chromecast", "teste iptv no chromecast", "Teste IPTV no Chromecast: como usar na TV do hotel",
  "Levar o Chromecast na mala e testar IPTV na TV do hotel: rede do hotel (portal de login, compartilhamento de tela), celular como controle, limites, o que fazer se a rede bloquear. Diferente dos artigos '72 horas' e '1 hora' do mesmo portal (foco no aparelho).",
  ["iptv-no-tablet", "quanto-de-internet-o-iptv-consome"]),
 ("T10", "adonline", "teste-iptv-filmes-e-series-como-avaliar-o-catalogo-no-teste", "teste IPTV grátis", "teste iptv filmes e séries", "Teste IPTV filmes e séries: como avaliar o catálogo no teste",
  "Como avaliar o catálogo de filmes e séries durante um teste: procurar três lançamentos e três títulos antigos, ver se carregam, se há dublagem, se a organização ajuda a achar. O catálogo do teste pode diferir do contratado: perguntar. A âncora 'teste IPTV grátis' aponta para a home.",
  ["iptv-e-gratuito", "iptv-sem-som-o-que-fazer"]),
]
out = []
for n, site, slug, anc, kw, tit, ang, ints in P:
    assert kw.lower() in tit.lower() and len(tit) <= 70, n
    out.append(dict(n=n, site=site, domain=DOM[site], cat_id=CAT[site], sufixo=SUF[site], meta_title_max=60 - SUF[site], slug=slug, destino=H, ancora=anc, kw=kw, titulo=tit, angulo=ang,
                    internos=[dict(href=R[(site, i)]["href"], titulo=R[(site, i)]["titulo"]) for i in ints]))
io.open("plano-top.json", "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
print([(o["n"], len(o["titulo"]), o["meta_title_max"]) for o in out])

t = io.open("D:/SISTEMAS/GUEST POSTs/clientes/geracaoconsciente/materias/BRIEF-GC.md", encoding="utf-8").read()
t = t.replace("geracaoconsciente.com.br", "teste-iptv.top").replace("https://www.geracaoconsciente.com.br/", "https://teste-iptv.top/").replace("plano-gc.json", "plano-top.json").replace("geracaoconsciente", "testeiptvtop")
i = t.index("e abra a home do cliente")
j = t.index("Sem preço, sem promessa de canal, qualidade ou resultado.", i) + len("Sem preço, sem promessa de canal, qualidade ou resultado.")
novo = ("e abra a home do cliente https://teste-iptv.top/ e descreva o cliente SÓ com o que ela mostra e sempre atribuindo à própria página: ela se apresenta como \"IPTV TOP\" (título \"IPTV Teste TOP\"), é um SERVIÇO de IPTV que, segundo a própria página, permite pedir um teste grátis pelo WhatsApp, sem cartão de crédito, com ativação em minutos e suporte; informa compatibilidade com Smart TV, Android, iPhone/iPad, PC/Mac, TV Box, Fire TV Stick, Chromecast e Roku e uso em até 2 aparelhos ao mesmo tempo. "
         "NÃO repita números de marketing da página (quantidade de canais, filmes, clientes, 99,9% de sinal), NÃO escreva 'melhor IPTV', 'garantido' nem 'qualidade superior' e NÃO afirme que o serviço é legal ou licenciado: diga que o conteúdo disponível depende de licença e do provedor e que o leitor deve confirmar. Sem preço, sem promessa de canal, qualidade ou resultado. Use as expressões 'segundo a própria página' ou 'a página informa' sempre que citar uma característica do cliente.")
t = t[:i] + novo + t[j:]
t = t.replace("Teste Consciente", "IPTV TOP")
t += ("\n## Lotes anteriores nos mesmos portais (não repita ângulos nem linke para eles)\n"
      "- euvo: 3 dias, sem cadastro, 5 horas, 30 minutos. revistadeducao: 16 horas, gerador, 10 horas, liberado na hora. desassossegada: celular, 48 horas, 20 horas, 36 horas. oiempreendedores: sem cartão, sem pagar. qmixdigital: agora, 4K. viajenodetalhe: 72 horas, 1 hora. adonline: confiável, futebol.\n"
      "- Fotos já usadas na rede (não repita a cena): sala de estar com TV, cadeado, relógio, ampulheta, mala, controle remoto no sofá, lupa, cabo HDMI, celular com fone, carteira, mãos digitando, caderno e caneta, caneca, vista de cidade pela janela, corredor, cortina, recibos, switch de rede, goleira, xícara e caderno, tela de login, bola.\n")
io.open("BRIEF-TOP.md", "w", encoding="utf-8").write(t)
print("brief ok; 'Consciente' ainda aparece:", "Consciente" in t)
