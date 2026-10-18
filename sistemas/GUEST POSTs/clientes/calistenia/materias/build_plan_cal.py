# -*- coding: utf-8 -*-
import json, io, re, subprocess
D = "https://calistenia.ia.br/"
def titulo_h1(u):
    h = subprocess.run(["curl", "-s", "-m", "25", "-A", "Mozilla/5.0 Chrome/131", u], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
    m = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else None
SUPL = "https://revistadeducao.com.br/dica/qual-o-melhor-suplemento-para-dar-energia-e-disposicao/"
SUPL_T = titulo_h1(SUPL) or "Qual o melhor suplemento para dar energia e disposição"

J = "jean"; R = "rede"
P = [
 # n, mec, site, domain, host, cat, slug, destino, ancora, kw, titulo, tema, rotulo/None, internos
 ("C01", R, "seuguiadesaude", "seuguiadesaude.com.br", "clinicas-vps", "3", "melhores-sites-para-aprender-dips-nas-paralelas", D + "exercicios/paralelas-dips", "dips nas barras paralelas", "sites para aprender dips", "Melhores sites para aprender dips nas paralelas",
  "Lista de sites e ferramentas para aprender dips nas paralelas (técnica, músculos, progressão, erros). Portal de saúde: ângulo de segurança articular (ombro/cotovelo) sem prometer resultado nem fazer afirmação médica.", None,
  [("/treino-funcional/", "As vantagens do treino funcional"), ("/melhor-exercicio-para-emagrecer-rapido/", "Melhor exercício para emagrecer rápido")]),
 ("C02", J, "vivofutebol", "vivofutebol.com.br", None, None, "melhores-apps-e-sites-de-treino-de-forca-para-quem-joga-futebol", D + "exercicios/paralelas-dips", "como fazer dips", "apps e sites de treino", "Melhores apps e sites de treino de força para quem joga futebol",
  "Apps e sites de treino de força com peso do corpo para quem joga futebol (empurrar: dips no item do Calistenia IA). Portal nacional de futebol. Sem prometer desempenho em campo.", "Leia também",
  [("https://vivofutebol.com.br/noticias-gerais/como-tratar-estiramento-na-panturrilha/", "estiramento na panturrilha"), ("https://vivofutebol.com.br/medicina-esportiva/hernia-do-esporte/", "hérnia do esporte")]),
 ("C03", R, "revistadeducao", "revistadeducao.com.br", "opengravity", "29", "melhores-sites-e-apps-para-aprender-front-lever-do-zero", D + "exercicios/front-lever", "progressão de front lever", "aprender front lever", "Melhores sites e apps para aprender front lever do zero",
  "Apps e sites para aprender front lever por progressões (aprendizagem de habilidade motora, pré-requisitos, tempo de prática realista). Portal com perfil educacional.", None,
  [("/saude/o-que-comer-antes-do-treino/", "O que comer antes do treino: por horário, tipo de treino e tempo até começar"), ("/dica/qual-o-melhor-suplemento-para-dar-energia-e-disposicao/", SUPL_T)]),
 ("C04", J, "portalgc", "portalgc.com.br", None, None, "melhores-apps-e-sites-de-calistenia-para-evoluir-nas-barras", D + "exercicios/front-lever", "front lever na barra", "apps e sites de calistenia", "Melhores apps e sites de calistenia para evoluir nas barras",
  "Apps e sites de calistenia para quem já treina na barra e quer evoluir (barra fixa, front lever no item do Calistenia IA). Portal generalista com bloco de saúde.", "Veja também",
  [("https://portalgc.com.br/saude/como-tirar-gordura-do-braco/", "gordura do braço com treino"), ("https://portalgc.com.br/saude/postura-ruim-da-hernia-de-disco/", "postura ruim dá hérnia")]),
 ("C05", R, "oiempreendedores", "oiempreendedores.com.br", "opengravity", "3", "melhores-apps-e-sites-de-treino-em-casa-para-quem-empreende", D + "exercicios/flexao-inclinada", "flexão inclinada para iniciantes", "sites de treino em casa", "Melhores apps e sites de treino em casa para quem empreende",
  "Apps e sites de treino em casa para quem tem agenda apertada de empreendedor (flexão inclinada no item do Calistenia IA). Portal de negócios e bem-estar. Sem prometer tempo ou resultado.", None,
  [("/saude/plano-de-treino-com-elasticos/", "Plano de treino com elásticos: a semana completa para treinar o corpo inteiro em casa"), ("/saude/exercicios-para-escapula-alada/", "Exercícios para escápula alada: o que fortalecer e o que evitar no treino")]),
 ("C06", J, "noticiasdaserra", "noticiasdaserra.com.br", None, None, "melhores-sites-de-treino-para-iniciantes-sem-academia", D + "exercicios/flexao-inclinada", "flexão com mãos elevadas", "sites de treino para iniciantes", "Melhores sites de treino para iniciantes sem academia",
  "Sites de treino para iniciante sem academia (flexão com mãos elevadas = flexão inclinada, no item do Calistenia IA). Portal generalista do ES.", "Mais sobre o tema",
  [("https://noticiasdaserra.com.br/geral/artrose-pode-fazer-caminhada/", "artrose pode fazer caminhada"), ("https://noticiasdaserra.com.br/saude/fratura-por-estresse-na-coluna-lombar/", "fratura por estresse na coluna")]),
 ("C07", R, "saudeacessivel", "saudeacessivel.com.br", "opengravity", "2", "melhores-apps-e-sites-de-exercicios-para-postura-e-costas-em-casa", D + "exercicios/remada-australiana", "remada australiana em casa", "exercícios para postura e costas", "Melhores apps e sites de exercícios para postura e costas em casa",
  "Apps e sites de exercícios para postura e costas em casa (remada australiana no item do Calistenia IA). Portal de saúde: cautela, sem diagnóstico, sem prometer alívio de dor, recomendar avaliação profissional se houver dor.", None,
  [("/dicas/treino-de-peso-corporal-para-iniciantes/", "Treino de peso corporal para iniciantes"), ("/dicas/qual-o-melhor-exercicio-para-quem-tem-desgaste-no-joelho/", "Qual o melhor exercício para quem tem desgaste no joelho?")]),
 ("C08", J, "portoenoticias", "portoenoticias.com.br", None, None, "melhores-sites-de-treino-de-costas-sem-equipamento-de-academia", D + "exercicios/remada-australiana", "remada invertida", "sites de treino de costas", "Melhores sites de treino de costas sem equipamento de academia",
  "Sites de treino de costas sem máquina (remada invertida = remada australiana, no item do Calistenia IA). Portal generalista.", "Continue lendo",
  [("https://portoenoticias.com.br/geral/o-que-comer-a-noite-para-emagrecer/", "comer à noite para emagrecer"), ("https://portoenoticias.com.br/geral/descubra-como-tomar-whey-protein-para-emagrecer-e-definir/", "tomar whey protein para emagrecer")]),
 ("C09", R, "viajenodetalhe", "viajenodetalhe.com.br", "opengravity", "6", "melhores-sites-de-exercicios-com-elastico-para-treinar-em-casa", D + "exercicios/agachamento-com-elastico", "agachamento com faixa elástica", "sites de exercícios com elástico", "Melhores sites de exercícios com elástico para treinar em casa",
  "Sites e apps de exercícios com faixa elástica (agachamento no item do Calistenia IA); elástico cabe na mala, treino em casa ou em hotel. Portal de viagens/saúde. Concorrentes sugeridos: Fitwill, Fitivity, Nike Training Club.", None,
  [("/saude/treino-em-viagem/", "Treino em viagem: o que dá para fazer no hotel, na praia e sem academia por perto"), ("/saude/corrida-na-areia/", "Corrida na areia: fofa ou molhada, descalço ou de tênis, e a transição segura")]),
 ("C10", J, "jornalbahia", "jornalbahia.com.br", None, None, "melhores-apps-e-sites-de-treino-para-quem-viaja-a-trabalho", D + "exercicios/agachamento-com-elastico", "agachamento com elástico em viagem", "apps e sites de treino", "Melhores apps e sites de treino para quem viaja a trabalho",
  "Apps e sites de treino para quem viaja a trabalho (agachamento com elástico em viagem, no item do Calistenia IA). Portal da Bahia: pode usar uma referência local de deslocamento, sem inventar dado.", "Relacionadas",
  [("https://jornalbahia.com.br/saude/desgaste-no-joelho-pode-fazer-caminhada/", "desgaste no joelho"), ("https://jornalbahia.com.br/geral/creatina-em-capsulas-ou-em-po/", "creatina em cápsulas")]),
 ("C11", R, "desassossegada", "desassossegada.com.br", "opengravity", "9", "melhores-sites-e-apps-para-encontrar-parques-de-calistenia", D + "blog/calistenia-em-parques", "treinar calistenia em parques", "encontrar parques de calistenia", "Melhores sites e apps para encontrar parques de calistenia",
  "Sites e apps para achar parques e barras de calistenia (Calisthenics Parks tem mapa; confirme se há spots no Brasil, não afirme sem ver). Portal de bem-estar e cultura. Calistenia IA entra com o guia sobre calistenia em parques.", None,
  [("/quanto-tempo-caminhar-para-emagrecer/", "Quanto tempo caminhar para emagrecer"), ("/caminhada-emagrece-em-quanto-tempo/", "Caminhada emagrece em quanto tempo: a conta das calorias, o ritmo e o que acelera")]),
 ("C12", J, "noticiasdetimon", "noticiasdetimon.com.br", None, None, "melhores-apps-e-sites-para-encontrar-barras-de-treino-ao-ar-livre", D + "blog/calistenia-em-parques", "parques para treinar calistenia", "encontrar barras de treino", "Melhores apps e sites para encontrar barras de treino ao ar livre",
  "Apps e sites para encontrar barras e academias ao ar livre (guia do Calistenia IA sobre calistenia em parques no item 1). Portal de Timon (MA), vizinha de Teresina: só cite local real se confirmar nome e equipamento; senão mantenha genérico.", "Leia mais",
  [("https://noticiasdetimon.com.br/saude/artrite-reumatoide-pode-fazer-musculacao/", "artrite reumatoide pode fazer musculação"), ("https://noticiasdetimon.com.br/saude/como-proteger-o-quadril-na-musculacao-e-reduzir-risco-de-lesoes/", "proteger o quadril na musculação")]),
 ("C13", R, "euvo", "euvo.com.br", "opengravity", "17", "melhores-sites-e-apps-para-aprender-street-workout", D + "blog/street-workout", "treino de street workout", "aprender street workout", "Melhores sites e apps para aprender street workout",
  "Sites e apps para aprender street workout (cultura de barras de rua, diferença para calistenia, como começar numa praça; o guia do Calistenia IA no item 1). Portal de saúde e eventos.", None,
  [("/o-que-comer-depois-do-treino/", "O que comer depois do treino: proteína, carboidrato e o prazo que importa de verdade"), ("/o-que-e-bom-para-dor-no-ombro/", "O que é bom para dor no ombro: gelo, calor, remédio e o que só piora")]),
 ("C14", J, "apucarananoticias", "apucarananoticias.com.br", None, None, "melhores-apps-e-sites-de-street-workout-para-iniciantes", D + "blog/street-workout", "street workout para iniciantes", "sites de street workout", "Melhores apps e sites de street workout para iniciantes",
  "Apps e sites de street workout para iniciante (guia do Calistenia IA no item 1). Portal de Apucarana (PR): sem inventar local; se citar praça com academia ao ar livre, confirmar.", "Veja também",
  [("https://apucarananoticias.com.br/saude/melhores-exercicios-para-fortalecer-o-joelho-sem-aumentar-a-dor/", "exercícios para fortalecer o joelho"), ("https://apucarananoticias.com.br/saude/dor-no-quadril-ao-sentar-por-muito-tempo/", "dor no quadril ao sentar")]),
]
out = []
for n, mec, site, dom, host, cat, slug, dest, anc, kw, tit, tema, rot, ints in P:
    assert len(tit) <= 70 and kw.lower() in tit.lower(), n
    it = dict(n=n, mecanismo=mec, site=site, domain=dom, host=host, cat_id=cat, slug=slug, destino=dest, ancora=anc, kw=kw, titulo=tit, tema=tema, rotulo=rot)
    if mec == J:
        it["internos"] = [dict(url=u, ancora=a) for u, a in ints]
    else:
        it["internos"] = [dict(href=u, titulo=a, url_completa="https://" + dom + u) for u, a in ints]
    out.append(it)
io.open("plano-cal.json", "w", encoding="utf-8").write(json.dumps(out, ensure_ascii=False, indent=1))
print("ok", len(out), "| supl titulo:", SUPL_T)
