# -*- coding: utf-8 -*-
import json, io, re

ROTULOS = ["Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o tema", "Continue lendo",
           "Leia também", "Leia mais", "Veja também"]

INTERNOS = {
 "01": [("https://jornalbahia.com.br/saude/desinformacao-e-duvidas-sobre-vacinas-ainda-desafiam-o-acesso-a-informacao-em-saude/", "desinformação e dúvidas sobre vacinas")],
 "02": [("https://noticiasdetimon.com.br/pets/timon-atingiu-100-a-vacinacao-em-caes-e-gatos-contra-a-raiva-foram-mais-de-51-000-vacinados/", "campanha de vacinação antirrábica em Timon")],
 "03": [("https://apucarananoticias.com.br/saude/conheca-alguns-alimentos-que-ajudam-a-fortalecer-a-imunidade/", "alimentos que ajudam a fortalecer a imunidade"),
        ("https://apucarananoticias.com.br/saude/falta-de-vitamina-d-em-idosos-perigos-e-como-evitar/", "falta de vitamina D em idosos")],
 "04": [("https://alagoasdiario.com.br/saude/debate-sobre-acesso-a-informacoes-confiaveis-em-saude-reforca-importancia-de-esclarecer-duvidas-sobre-vacinacao/", "esclarecer dúvidas sobre vacinação"),
        ("https://alagoasdiario.com.br/saude/exercicio-de-forca-depois-dos-50/", "exercício de força depois dos 50")],
 "05": [("https://webcitizen.com.br/qual-cha-gravida-pode-tomar/", "qual chá grávida pode tomar"),
        ("https://webcitizen.com.br/gravida-pode-comer-azeitona/", "grávida pode comer azeitona durante a gestação")],
 "07": [("https://jornalnoticiaonline.com.br/negocios/certificado-digital-vencido-o-que-fazer/", "certificado digital vencido, o que fazer"),
        ("https://jornalnoticiaonline.com.br/autos-e-motos/licenciamento-atrasado-quais-as-consequencias/", "licenciamento atrasado, quais as consequências")],
 "08": [("https://brasilnovonoticias.com.br/viagem/documentos-para-viajar-para-a-europa-saiba-o-que-e-necessario/", "documentos para viajar para a Europa"),
        ("https://brasilnovonoticias.com.br/geral/governo-bate-o-martelo-e-confirma-que-11-estados-e-o-df-ja-emitem-novo-rg/", "11 estados e o DF já emitem novo RG")],
 "09": [("https://saopauloaberta.com.br/saude/importancia-de-continuar-adotando-medidas-sanitarias-contra-a-covid-19-mesmo-depois-da-vacina/", "medidas sanitárias contra a covid-19")],
 "10": [("https://sp2040.net.br/cursos/como-organizar-afastamentos-e-atestados-medicos-na-empresa/", "organizar afastamentos e atestados médicos na empresa")],
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

ORDEM = ["01","02","03","04","05","07","08","09","10"]
registro = []
for i, n in enumerate(ORDEM):
    html = io.open(f"n{n}.html", encoding="utf-8").read().rstrip()
    rotulo = ROTULOS[i]
    links = INTERNOS[n]
    paragrafo = montar_paragrafo(rotulo, links)
    novo_html = inserir_antes_do_ultimo_paragrafo(html, paragrafo) + "\n"
    io.open(f"n{n}.final.html", "w", encoding="utf-8").write(novo_html)
    registro.append({"n": n, "rotulo": rotulo, "links": links})
    print(n, rotulo, len(links), "links")

# item 06: sem candidato genuino, final = original (so o link do cliente)
html06 = io.open("n06.html", encoding="utf-8").read()
io.open("n06.final.html", "w", encoding="utf-8").write(html06)
print("06 SEM link interno (nenhum candidato genuino no acervo do portal)")

io.open("internos_registro.json", "w", encoding="utf-8").write(json.dumps(registro, ensure_ascii=False, indent=1))
