# -*- coding: utf-8 -*-
import json, io, re

ROTULOS = ["Leia também", "Leia mais", "Veja também", "Relacionadas", "Mais sobre o tema", "Continue lendo",
           "Leia também", "Leia mais", "Veja também", "Relacionadas"]

INTERNOS = {
 "01": [("https://jornalbahia.com.br/financas/esocial-para-mei-simplificacoes-e-prazos-importantes/", "simplificações do eSocial para MEI"),
        ("https://jornalbahia.com.br/financas/carteira-de-trabalho-digital-vantagens-e-como-ativar/", "carteira de trabalho digital")],
 "02": [("https://alagoas200.com.br/negocios/como-funciona-o-sistema-de-assinatura-digital/", "como funciona o sistema de assinatura digital"),
        ("https://alagoas200.com.br/geral/quem-deve-emitir-nota-fiscal-eletronica/", "quem deve emitir nota fiscal eletrônica")],
 "03": [("https://noticiasdefloriano.com.br/negocios/contabilidade-empresarial-melhore-sua-gestao-financeira/", "contabilidade empresarial e gestão financeira"),
        ("https://noticiasdefloriano.com.br/negocios/ferramentas-digitais-para-negocios-individuais-novos/", "ferramentas digitais para negócios individuais novos")],
 "04": [("https://apucarananoticias.com.br/direitos/o-que-todo-empreendedor-precisa-saber-sobre-direito-digital/", "o que todo empreendedor precisa saber sobre direito digital"),
        ("https://apucarananoticias.com.br/negocios/softwares-de-gestao-para-lojas-fisicas-bem-organizadas-guia/", "softwares de gestão para lojas físicas")],
 "05": [("https://canaljustica.jor.br/os-impactos-da-digitalizacao-na-atuacao-juridica-e-os-novos-caminhos-profissionais/", "impactos da digitalização na atuação jurídica"),
        ("https://canaljustica.jor.br/direito-digital-o-que-empresas-precisam-entender-alem-da-lgpd/", "direito digital além da LGPD")],
 "06": [("https://ciberlex.adv.br/como-evitar-a-perda-de-prazos-com-um-software-juridico/", "perda de prazos com um software jurídico")],
 "07": [("https://professortrabalhista.adv.br/calculo-de-acao-trabalhista-fundamentos-juridicos-e-metodologia-pratica/", "cálculo de ação trabalhista"),
        ("https://professortrabalhista.adv.br/presenca-digital-no-trabalhista-seu-escritorio-em-um-site/", "presença digital no trabalhista")],
 "08": [("https://webcitizen.com.br/como-evitar-que-o-notebook-quebre-antes-da-hora/", "evitar que o notebook quebre antes da hora"),
        ("https://webcitizen.com.br/cidadania-digital-dados-corretos-em-cadastros-online/", "cidadania digital em cadastros online")],
 "09": [("https://brasilnovonoticias.com.br/negocios/sistemas-de-faturamento-para-profissionais-mei-atuais/", "sistemas de faturamento para MEI"),
        ("https://brasilnovonoticias.com.br/geral/conquest-sistemas-completa-25-anos-oferecendo-erp-pratico-e-estrategico-para-empresas-em-todo-o-brasil/", "ERP para empresas em todo o Brasil")],
 "10": [("https://jornalnoticiaonline.com.br/autos-e-motos/cnh-vencida-a-mais-de-5-anos/", "CNH vencida há mais de 5 anos"),
        ("https://jornalnoticiaonline.com.br/autos-e-motos/vai-tirar-ferias-e-nao-pagou-o-ipva-saiba-como-resolver/", "prazo de licenciamento do veículo")],
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
