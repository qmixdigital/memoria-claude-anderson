# -*- coding: utf-8 -*-
import json, io
H = "https://www.geracaoconsciente.com.br/"
R = {(x["site"], x["slug"]): x for x in json.load(io.open("internos-resolvidos.json", encoding="utf-8"))}
SUF = {"euvo": 12, "revistadeducao": 22, "desassossegada": 17, "oiempreendedores": 20, "qmixdigital": 15, "viajenodetalhe": 19, "adonline": 11}
DOM = {"euvo": "euvo.com.br", "revistadeducao": "revistadeducao.com.br", "desassossegada": "desassossegada.com.br", "oiempreendedores": "oiempreendedores.com.br", "qmixdigital": "qmixdigital.com.br", "viajenodetalhe": "viajenodetalhe.com.br", "adonline": "adonline.com.br"}
CAT = {"euvo": "101", "revistadeducao": "3364", "desassossegada": "123", "oiempreendedores": "101", "qmixdigital": "101", "viajenodetalhe": "101", "adonline": "2"}
P = [
 ("G01", "euvo", "teste-iptv-5-horas-como-usar-cada-hora-para-decidir", "teste IPTV 5 horas", "teste iptv 5 horas", "Teste IPTV 5 horas: como usar cada hora para decidir",
  "Plano hora a hora para um teste de 5 horas: primeira hora instalação e canais, meio do teste horário de pico, última hora decisão com ficha de notas. Portal com muito conteúdo técnico de IPTV (buffering, rede): ângulo de organização do tempo.",
  ["iptv-com-buffering-o-que-esta-por-tras", "iptv-por-cabo-ou-wifi"]),
 ("G02", "euvo", "teste-iptv-30-minutos-o-que-da-para-checar-logo-no-inicio", "teste IPTV 30 minutos", "teste iptv 30 minutos", "Teste IPTV 30 minutos: o que dá para checar logo no início",
  "O que 30 minutos mostram (abertura do app, troca de canal, imagem, som, retomada depois de queda) e o que NÃO mostram (estabilidade no pico, catálogo completo). Triagem rápida antes de gastar o tempo de um teste longo. Diferente do artigo de roteiro de 3 dias do mesmo portal.",
  ["mensagem-de-erro-no-player-de-iptv", "roteador-para-iptv-o-que-olhar"]),
 ("G03", "revistadeducao", "teste-iptv-10-horas-como-dividir-o-tempo-entre-dia-e-noite", "teste IPTV 10 horas", "teste iptv 10 horas", "Teste IPTV 10 horas: como dividir o tempo entre dia e noite",
  "Como repartir 10 horas de teste entre manhã/tarde e a noite de maior uso, o que medir em cada faixa, quando parar. Tom explicativo de portal educacional. O portal já tem 'Quanto tempo dura um teste IPTV' (interno): não repetir, complementar.",
  ["teste-iptv-quanto-tempo-dura", "aplicativo-iptv-para-tv-philips"]),
 ("G04", "revistadeducao", "teste-iptv-liberado-na-hora-o-que-e-e-o-que-checar-antes", "teste IPTV liberado na hora", "teste iptv liberado na hora", "Teste IPTV liberado na hora: o que é e o que checar antes",
  "O que significa acesso liberado na hora (liberação automática x atendimento humano), o que verificar antes de aceitar (quem fornece, prazo, telas, o que acontece no fim), por que rapidez não prova qualidade. Diferente do artigo 'gerador de teste IPTV' do mesmo portal (foco aqui é a promessa de rapidez).",
  ["como-escolher-o-aplicativo-de-iptv-para-tv-box", "iptv-de-filmes-e-series"]),
 ("G05", "desassossegada", "teste-iptv-20-horas-um-plano-em-tres-blocos-de-observacao", "teste IPTV 20 horas", "teste iptv 20 horas", "Teste IPTV 20 horas: um plano em três blocos de observação",
  "Plano de 20 horas em três blocos (abertura, pico, catálogo) com registro por bloco. Diferente dos artigos 'teste 48 horas' e 'teste no celular' do mesmo portal. Portal de bem-estar e cultura: tom calmo, organização do hábito de avaliar.",
  ["iptv-pode-voltar-a-funcionar", "renovar-o-iptv"]),
 ("G06", "desassossegada", "teste-iptv-36-horas-um-dia-e-meio-para-ver-o-que-muda", "teste IPTV 36 horas", "teste iptv 36 horas", "Teste IPTV 36 horas: um dia e meio para ver o que muda",
  "Um dia e meio de teste: comparar noite de dia útil com manhã de folga, o que muda quando a rede da casa está cheia, quando o servidor sobrecarrega. Foco em comparação entre dois momentos, não em ficha de blocos (outro artigo do portal).",
  ["servidor-trocado", "organizar-listas-de-iptv"]),
 ("G07", "oiempreendedores", "teste-iptv-sem-pagar-o-que-e-gratis-e-o-que-vira-cobranca", "teste IPTV sem pagar", "teste iptv sem pagar", "Teste IPTV sem pagar: o que é grátis e o que vira cobrança",
  "Teste grátis x cobrança escondida: renovação automática, cobrança por ativação, taxa de instalação, o que perguntar antes de aceitar, o que guardar de prova. Ângulo do pequeno empreendedor/consumidor. Diferente do artigo 'sem cartão' do mesmo portal (aquele trata de dados de pagamento; este trata do que pode virar cobrança depois).",
  ["revender-iptv-vale-a-pena", "iptv-para-empresas"]),
 ("G08", "qmixdigital", "teste-iptv-com-4k-como-confirmar-a-resolucao-de-verdade", "teste IPTV com 4K", "teste iptv com 4k", "Teste IPTV com 4K: como confirmar a resolução de verdade",
  "Como confirmar se a imagem é mesmo 4K durante um teste: requisitos de rede e aparelho, informações do aplicativo, diferença entre canal 4K e imagem ampliada, o que checar na TV. Sem números de banda que você não confirmou em fonte oficial.",
  ["iptv-no-4g", "suporte-iptv"]),
 ("G09", "viajenodetalhe", "teste-iptv-1-hora-o-que-checar-na-chegada-ao-hotel", "teste IPTV 1 hora", "teste iptv 1 hora", "Teste IPTV 1 hora: o que checar na chegada ao hotel",
  "Teste curto de 1 hora no destino (Wi-Fi do hotel, TV do quarto, celular no 4G): o que dá para checar na primeira hora e o que fica para depois. Diferente do artigo 'teste 72 horas antes de viajar' do mesmo portal (este é o teste CURTO NO DESTINO).",
  ["assistir-iptv-viajando-o-que-muda", "iptv-no-onibus-de-viagem"]),
 ("G10", "adonline", "teste-iptv-futebol-como-medir-atraso-e-travamento-no-jogo", "Teste Consciente", "teste iptv futebol", "Teste IPTV futebol: como medir atraso e travamento no jogo",
  "Como usar um jogo de futebol como teste: atraso em relação à TV aberta (marcar um lance), travamento nos momentos de pico, queda de resolução, áudio fora de sincronia. A âncora é a marca 'Teste Consciente' (como a página se apresenta); a keyword do texto é 'teste iptv futebol'.",
  ["atraso-na-transmissao-iptv", "jitter-no-iptv"]),
]
out = []
for n, site, slug, anc, kw, tit, ang, ints in P:
    assert kw.lower() in tit.lower(), n
    out.append(dict(n=n, site=site, domain=DOM[site], cat_id=CAT[site], sufixo=SUF[site], meta_title_max=60 - SUF[site], slug=slug, destino=H, ancora=anc, kw=kw, titulo=tit, angulo=ang,
                    internos=[dict(href=R[(site, i)]["href"], titulo=R[(site, i)]["titulo"]) for i in ints]))
io.open("plano-gc.json", "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
print([(o["n"], len(o["titulo"]), o["meta_title_max"]) for o in out])

# briefing derivado do lote anterior
t = io.open("D:/SISTEMAS/GUEST POSTs/clientes/empilhando/materias/BRIEF-EMP.md", encoding="utf-8").read()
t = t.replace("empilhando", "geracaoconsciente").replace("Empilhando", "Teste Consciente").replace("plano-emp.json", "plano-gc.json")
a = "e abra a home do cliente https://www.geracaoconsciente.com.br/ para saber o que ela oferece (teste grátis de IPTV por tempo limitado). Descreva o cliente só com o que a home mostra; sem preço, sem promessa de canal, qualidade ou resultado."
assert a in t
t = t.replace(a, "e abra a home do cliente https://www.geracaoconsciente.com.br/ e descreva o cliente SÓ com o que a home mostra: ela se apresenta como \"Teste Consciente\" (título \"Ranking Transparente | Consciente\"), é um ranking de 25 plataformas de teste IPTV, traz seis perguntas que todo teste deveria responder, uma seção de sinais de transparência e de cautela, onde o teste funciona (aparelhos) e a indicação de teste sem cartão. NÃO é um provedor de IPTV. Chame-a de \"o Teste Consciente\" ou \"a página do Teste Consciente\", nunca de \"Empilhando\". PROIBIDO escrever que ela oferece teste 'por tempo limitado', 'sem cadastro' ou com duração definida: a home não diz isso. Sem preço, sem promessa de canal, qualidade ou resultado.")
t = t.replace("H2 de FAQ com 6 `<h3>`", "H2 de FAQ chamado EXATAMENTE \"Perguntas frequentes sobre ...\" (o motor só gera o schema FAQPage com esse prefixo) com 6 `<h3>`")
t = t.replace("(18/10/2026)", "(18/10/2026, lote Geração Consciente)")
t += ("\n## Lições do lote anterior (Empilhando, 18/10)\n"
      "- O corpo precisa ficar entre 1.250 e 1.390 palavras: o val2 exige >= 1.200 só de parágrafos e o auditar aceita no máximo 1.400 no total.\n"
      "- O motor injeta links extras depois de publicar; eu limpo. Você entrega só o link do cliente e os 2 internos.\n"
      "- Cada portal já tem artigos do lote anterior (Empilhando) com outras keywords (euvo: 'teste iptv 3 dias' e 'sem cadastro'; revistadeducao: '16 horas' e 'gerador'; desassossegada: 'celular' e '48 horas'; oiempreendedores: 'sem cartão'; qmixdigital: 'agora'; viajenodetalhe: '72 horas'; adonline: 'confiável'). NÃO repita esses ângulos nem linke para eles.\n"
      "- Fotos: não use sala de estar com TV, cadeado, relógio de parede, ampulheta, mala, controle remoto no sofá, lupa, cabo HDMI, celular com fone, carteira nem mãos digitando (já usados); escolha outra cena.\n")
io.open("BRIEF-GC.md", "w", encoding="utf-8").write(t)
print("brief ok", "Empilhando" in t)
