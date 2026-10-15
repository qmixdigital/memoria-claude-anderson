# -*- coding: utf-8 -*-
import json, io

ROTULOS = ["Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o tema", "Continue lendo",
           "Leia também", "Leia mais", "Veja também", "Relacionadas"]

INTERNOS = {
 "01": [("https://jornalbahia.com.br/saude/como-fica-o-olho-de-quem-cheira-po/", "como fica o olho de quem cheira pó"),
        ("https://jornalbahia.com.br/saude/como-suportar-a-abstinencia/", "como suportar a abstinência")],
 "02": [("https://alagoas200.com.br/dicas/tipos-de-dependencia-quimica/", "tipos de dependência química"),
        ("https://alagoas200.com.br/saude/consequencia-da-droga-na-familia/", "consequência da droga na família")],
 "03": [("https://noticiasdetimon.com.br/saude/sinais-de-aviso-de-recaida/", "sinais de aviso de recaída"),
        ("https://noticiasdetimon.com.br/saude/atividade-fisica-pode-ajudar-no-tratamento-da-dependencia/", "atividade física no tratamento da dependência")],
 "04": [("https://teixeiraemfoco.com.br/saude/pedido-de-internacao-compulsoria-dependente-quimico/", "pedido de internação compulsória"),
        ("https://teixeiraemfoco.com.br/saude/automedicacao-pode-levar-a-dependencia-quimica/", "automedicação pode levar à dependência química")],
 "05": [("https://webcitizen.com.br/como-ajudar-um-dependente-quimico-que-recaiu-estrategias-eficazes-para-apoio-imediato/", "como ajudar um dependente químico que recaiu"),
        ("https://webcitizen.com.br/alteracoes-de-comportamento-de-quem-esta-usando-drogas/", "alterações de comportamento de quem está usando drogas")],
 "06": [("https://brasilnovonoticias.com.br/saude/como-lidar-com-filho-viciado-em-droga/", "como lidar com filho viciado em droga"),
        ("https://brasilnovonoticias.com.br/saude/depressao-pos-droga/", "depressão pós droga")],
 "07": [("https://portoenoticias.com.br/saude/como-funciona-uma-clinica-de-recuperacao-para-dependentes-quimicos/", "como funciona uma clínica de recuperação")],
 "08": [("https://jornalnoticiaonline.com.br/saude/impacto-do-alcoolismo-na-vida-social-e-familiar/", "impacto do alcoolismo na vida social e familiar"),
        ("https://jornalnoticiaonline.com.br/saude/descubra-o-melhor-remedio-para-parar-de-beber/", "o melhor remédio para parar de beber")],
 "09": [("https://alagoasdiario.com.br/saude/o-que-fazer-depois-de-uma-recaida/", "o que fazer depois de uma recaída"),
        ("https://alagoasdiario.com.br/saude/o-que-a-droga-faz-na-vida-de-uma-pessoa/", "o que a droga faz na vida de uma pessoa")],
 "10": [("https://cocaisnoticias.com.br/saude/quando-internar-um-dependente-quimico-sinais-e-opcoes-de-tratamento/", "quando internar um dependente químico"),
        ("https://cocaisnoticias.com.br/saude/como-tratar-um-dependente-quimico-em-casa/", "como tratar um dependente químico em casa")],
}

def montar_paragrafo(rotulo, links):
    partes = [f'<a href="{u}">{a}</a>' for u, a in links]
    juncao = partes[0] if len(partes) == 1 else f"{partes[0]} e {partes[1]}"
    return f"<p><strong>{rotulo}:</strong> {juncao}.</p>"

import re

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
    print(n, rotulo, [l[0] for l in links])

io.open("internos_registro.json", "w", encoding="utf-8").write(json.dumps(registro, ensure_ascii=False, indent=1))
