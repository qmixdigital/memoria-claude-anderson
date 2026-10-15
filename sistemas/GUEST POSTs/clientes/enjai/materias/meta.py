# -*- coding: utf-8 -*-
"""Metadados das 10 matérias do enjai.social (lote 1, 14/10/2026) e rodador do validador."""
import io, json, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8")
V = r"C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py"
E = "https://enjai.social"
M = [
 dict(slug="seguidores-por-1-real", portal="jornalbahia.com.br", titulo="Seguidores por 1 real: o que o preço baixo entrega e o que não",
      kw="seguidores por 1 real", anc="seguidores por 1 real", url=E+"/comprar-seguidores-por-1-real",
      resumo="Seguidores por 1 real chamam atenção pelo preço, mas entrega, reposição e regras das plataformas decidem se o pacote compensa.",
      alt="Celular com o perfil de uma rede social aberto sobre uma mesa, ilustrando seguidores por 1 real", img="smartphone social media profile"),
 dict(slug="compra-de-seguidores-como-funciona", portal="brasilnovonoticias.com.br", titulo="Como funciona a compra de seguidores: pedido, entrega e prazos",
      kw="compra de seguidores", anc="comprar seguidores", url=E+"/comprar-seguidores-por-1-real",
      resumo="A compra de seguidores segue um roteiro curto de pedido, pagamento e entrega gradual, com cuidados que evitam os erros mais comuns.",
      alt="Pessoa usando o celular com notificações de uma rede social, ilustrando a compra de seguidores", img="hand holding smartphone notification"),
 dict(slug="curtidas-no-instagram-e-alcance", portal="portoenoticias.com.br", titulo="Curtidas no Instagram e alcance: o que muda no feed",
      kw="curtidas no Instagram", anc="comprar curtidas no Instagram", url=E+"/comprar-curtidas-instagram",
      resumo="As curtidas no Instagram são um dos sinais que o feed considera, mas pesam menos do que o tempo de exibição e os envios.",
      alt="Mão tocando um coração na tela de um celular, ilustrando as curtidas no Instagram", img="heart icon phone screen"),
 dict(slug="taxa-de-engajamento-no-instagram", portal="noticiasdaserra.com.br", titulo="Taxa de engajamento no Instagram: quantas curtidas bastam",
      kw="taxa de engajamento no Instagram", anc="curtidas no Instagram", url=E+"/comprar-curtidas-instagram",
      resumo="A taxa de engajamento no Instagram compara interações com seguidores ou alcance e mostra se o conteúdo realmente prende a audiência.",
      alt="Gráfico de barras crescendo em uma tela de computador, ilustrando a taxa de engajamento no Instagram", img="analytics chart laptop"),
 dict(slug="algoritmo-do-tiktok", portal="jornalnoticiaonline.com.br", titulo="Como o algoritmo do TikTok escolhe vídeos para o seu feed",
      kw="algoritmo do TikTok", anc="curtidas no TikTok barato", url=E+"/comprar-curtidas-tiktok-barato",
      resumo="O algoritmo do TikTok combina interações, informações do vídeo e ajustes da conta para decidir o que aparece no feed.",
      alt="Pessoa gravando um vídeo vertical com o celular apoiado em um tripé, ilustrando o algoritmo do TikTok", img="phone tripod video recording"),
 dict(slug="visualizacao-no-tiktok", portal="alagoasdiario.com.br", titulo="O que conta como visualização no TikTok e o que fica de fora",
      kw="visualização no TikTok", anc="visualizações no TikTok", url=E+"/visualizacoes-tiktok-gratis",
      resumo="Uma visualização no TikTok começa a valer logo no início da reprodução, mas o programa de recompensas usa critérios mais rígidos.",
      alt="Tela de celular com um vídeo vertical em reprodução, ilustrando a visualização no TikTok", img="smartphone vertical video screen"),
 dict(slug="curtidas-na-pagina-do-facebook", portal="saopauloaberta.com.br", titulo="Curtidas na página do Facebook: o que mudou para pequenos negócios",
      kw="curtidas na página do Facebook", anc="curtidas no Facebook", url=E+"/comprar-curtidas-facebook",
      resumo="As curtidas na página do Facebook perderam espaço para os seguidores, e pequenos negócios precisam olhar outros números.",
      alt="Vitrine de uma loja de bairro com placa de aberto, ilustrando as curtidas na página do Facebook de pequenos negócios", img="small shop storefront open sign"),
 dict(slug="reposicao-de-seguidores", portal="jornalpreliminar.com.br", titulo="Reposição de seguidores: o que significa e como funciona",
      kw="reposição de seguidores", anc="seguidores permanentes", url=E+"/comprar-seguidores-permanentes",
      resumo="A reposição de seguidores compensa quedas por um prazo definido, e entender as condições evita expectativas erradas.",
      alt="Pilha de blocos de madeira sendo reorganizada sobre uma mesa, ilustrando a reposição de seguidores", img="wooden blocks stack table"),
 dict(slug="quanto-custa-um-seguidor", portal="webcitizen.com.br", titulo="Quanto custa um seguidor em 2026 e por que o preço varia",
      kw="quanto custa um seguidor", anc="seguidores por 50 centavos", url=E+"/comprar-seguidores-por-50-centavos",
      resumo="Saber quanto custa um seguidor exige olhar origem, garantia, ritmo de entrega e formato do pacote, e não só a etiqueta.",
      alt="Calculadora e moedas sobre uma mesa de madeira, ilustrando quanto custa um seguidor", img="calculator coins desk"),
 dict(slug="crescer-no-instagram-com-pouco-dinheiro", portal="teixeiraemfoco.com.br", titulo="Como crescer no Instagram com pouco dinheiro em 2026",
      kw="crescer no Instagram", anc="Instagram barato", url=E+"/insta-barato",
      resumo="Dá para crescer no Instagram com orçamento pequeno, combinando conteúdo consistente, parcerias e investimentos pontuais bem escolhidos.",
      alt="Cofrinho dourado ao lado de um celular sobre uma mesa clara, ilustrando como crescer no Instagram com pouco dinheiro", img="piggy bank smartphone"),
]
if __name__ == "__main__":
    so = sys.argv[1:]
    for m in M:
        if so and m["slug"] not in so: continue
        try: open(m["slug"] + ".html", encoding="utf-8")
        except FileNotFoundError: continue
        r = subprocess.run(["python", V, m["slug"] + ".html", "--links", "1", "--titulo", m["titulo"], "--kw", m["kw"], "--resumo", m["resumo"]],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        out = [l for l in r.stdout.splitlines() if ("PALAVRAS" in l or "XX" in l or "RESULTADO" in l or "ocorrencias" in l or "humaniz" in l or "  !  " in l)]
        print("##", m["slug"], len(m["titulo"]), "chars"); print("\n".join(out))
