# -*- coding: utf-8 -*-
import json, io, re

ROTULOS = ["Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o tema", "Continue lendo",
           "Leia também", "Leia mais", "Veja também", "Relacionadas"]

INTERNOS = {
 "01": [("https://jornalbahia.com.br/saude/qual-o-primeiro-sintoma-de-problema-na-coluna/", "primeiro sintoma de problema na coluna"),
        ("https://jornalbahia.com.br/saude/exercicios-em-casa-para-perder-pochete/", "exercícios em casa para perder pochete")],
 "02": [("https://alagoasdiario.com.br/saude/tipos-de-hernia-de-disco/", "tipos de hérnia de disco"),
        ("https://alagoasdiario.com.br/saude/fratura-no-tornozelo/", "fratura no tornozelo")],
 "03": [("https://noticiasdefloriano.com.br/saude/coluna-formigando/", "coluna formigando, causas musculares e neurológicas"),
        ("https://noticiasdefloriano.com.br/saude/como-saber-se-a-dor-e-no-musculo-ou-na-articulacao/", "saber se a dor é no músculo ou na articulação")],
 "04": [("https://apucarananoticias.com.br/saude/cirurgia-de-adenoide-e-amigdalas-infantil/", "cirurgia de adenoide e amígdalas infantil")],
 "05": [("https://saopauloaberta.com.br/financas/como-adotar-um-bom-planejamento-financeiro-na-terceira-idade/", "planejamento financeiro na terceira idade"),
        ("https://saopauloaberta.com.br/direitos/idosos-podem-pedir-para-parar-de-pagar-estas-contas-no-cras/", "idosos podem pedir para parar de pagar estas contas no CRAS")],
 "06": [("https://sp2040.net.br/saude/tratamento-para-hernia-de-disco/", "tratamento para hérnia de disco"),
        ("https://sp2040.net.br/saude/elasticos-de-resistencia-no-treino/", "elásticos de resistência no treino em casa")],
 "07": [("https://webcitizen.com.br/coluna-travada-o-que-fazer/", "coluna travada, o que fazer"),
        ("https://webcitizen.com.br/tipos-de-contracao-muscular/", "tipos de contração muscular")],
 "08": [("https://portoenoticias.com.br/saude/dificuldade-para-estender-a-perna/", "dificuldade para estender a perna"),
        ("https://portoenoticias.com.br/saude/dor-ao-levantar/", "dor ao levantar")],
 "09": [("https://jornalnoticiaonline.com.br/saude/vale-a-pena-comecar-a-se-exercitar-na-terceira-idade/", "exercitar-se na terceira idade"),
        ("https://jornalnoticiaonline.com.br/saude/quais-doencas-podem-ser-manifestadas-nos-idosos/", "doenças que podem se manifestar nos idosos")],
 "10": [("https://brasilnovonoticias.com.br/saude/como-aliviar-dor-nas-costas-em-5-minutos/", "aliviar dor nas costas em 5 minutos"),
        ("https://brasilnovonoticias.com.br/saude/cuidados-na-academia-para-evitar-lesoes-durante-os-treinos/", "cuidados na academia para evitar lesões")],
}

def montar_paragrafo(rotulo, links):
    partes = [f'<a href="{u}">{a}</a>' for u, a in links]
    juncao = partes[0] if len(partes) == 1 else f"{partes[0]} e {partes[1]}"
    return f"<p><strong>{rotulo}:</strong> {juncao}.</p>"

def inserir_antes_do_ultimo_paragrafo(html, paragrafo):
    matches = list(re.finditer(r"<p>[\s\S]*?</p>", html))
    if not matches:
        raise ValueError("nenhum paragrafo encontrado")
    idx = matches[-1].start()
    return html[:idx] + paragrafo + "\n\n" + html[idx:]

registro = []
for i, n in enumerate(["01","02","03","04","05","06","07","08","09","10"]):
    html = io.open(f"n{n}.html", encoding="utf-8").read().rstrip()
    rotulo = ROTULOS[i]
    links = INTERNOS[n]
    paragrafo = montar_paragrafo(rotulo, links)
    novo_html = inserir_antes_do_ultimo_paragrafo(html, paragrafo) + "\n"
    io.open(f"n{n}.final.html", "w", encoding="utf-8").write(novo_html)
    registro.append({"n": n, "rotulo": rotulo, "links": links})
    print(n, rotulo, len(links), "links")

io.open("internos_registro.json", "w", encoding="utf-8").write(json.dumps(registro, ensure_ascii=False, indent=1))
