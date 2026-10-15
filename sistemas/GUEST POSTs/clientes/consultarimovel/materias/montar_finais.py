# -*- coding: utf-8 -*-
import json, io, re

ROTULOS = ["Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o tema", "Continue lendo", "Leia também"]

INTERNOS = {
 "02": [("https://alagoas200.com.br/imoveis/investimento-em-propriedades-rurais/", "investimento em propriedades rurais, como escolher a melhor opção"),
        ("https://alagoas200.com.br/direitos/briga-por-heranca-milionaria-de-ex-prefeito-de-anadia-chega-ao-fim-com-manobra-juridica-de-bisneto-advogado/", "briga por herança milionária de ex-prefeito de Anadia")],
 "04": [("https://sp2040.net.br/imoveis/propriedades-rurais-para-criacao-de-animais/", "propriedades rurais para criação de animais"),
        ("https://sp2040.net.br/direitos/casos-em-que-a-usucapiao-e-negada-evite-erros-no-seu-processo/", "casos em que a usucapião é negada")],
 "05": [("https://canaljustica.jor.br/por-que-contratar-um-advogado-especialista-em-usucapiao-faz-toda-a-diferenca/", "contratar um advogado especialista em usucapião"),
        ("https://canaljustica.jor.br/prorrogacao-divida-rural-direito-produtor/", "prorrogação de dívida rural, direito do produtor")],
 "07": [("https://xthor.com.br/primeiro-imovel-o-que-ninguem-te-conta-sobre-os-custos-alem-da-compra/", "custos que ninguém conta sobre o primeiro imóvel"),
        ("https://xthor.com.br/assinatura-escaneada-tem-valor-legal/", "se assinatura escaneada tem valor legal")],
 "08": [("https://afnewss.com.br/imoveis/imoveis-rurais-como-fonte-de-renda-alternativa/", "imóveis rurais como fonte de renda alternativa")],
 "09": [("https://professortrabalhista.adv.br/divida-rural-vencida-empregador-campo/", "dívida rural vencida"),
        ("https://professortrabalhista.adv.br/como-funciona-a-aposentadoria-rural/", "como funciona a aposentadoria rural")],
 "10": [("https://jornal.seg.br/direitos/renegociacao-de-credito-rural/", "renegociação de crédito rural"),
        ("https://jornal.seg.br/geral/como-saber-se-tenho-firma-aberta/", "como saber se tenho firma aberta")],
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

ORDEM_COM_LINK = ["02","04","05","07","08","09","10"]
registro = []
for i, n in enumerate(ORDEM_COM_LINK):
    html = io.open(f"n{n}.html", encoding="utf-8").read().rstrip()
    rotulo = ROTULOS[i]
    links = INTERNOS[n]
    paragrafo = montar_paragrafo(rotulo, links)
    novo_html = inserir_antes_do_ultimo_paragrafo(html, paragrafo) + "\n"
    io.open(f"n{n}.final.html", "w", encoding="utf-8").write(novo_html)
    registro.append({"n": n, "rotulo": rotulo, "links": links})
    print(n, rotulo, len(links), "links")

for n in ["01","03","06"]:
    html = io.open(f"n{n}.html", encoding="utf-8").read()
    io.open(f"n{n}.final.html", "w", encoding="utf-8").write(html)
    print(n, "SEM link interno (nenhum candidato genuino no acervo do portal)")

io.open("internos_registro.json", "w", encoding="utf-8").write(json.dumps(registro, ensure_ascii=False, indent=1))
