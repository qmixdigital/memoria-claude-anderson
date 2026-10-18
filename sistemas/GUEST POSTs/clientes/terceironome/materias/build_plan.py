# -*- coding: utf-8 -*-
import json, io
R = json.load(io.open('internos-resolvidos.json', encoding='utf-8'))
H = "https://www.terceironome.com.br/"
P = [
 ("T01", "reels-de-futebol-o-que-o-torcedor-assiste", "vivofutebol", "vivofutebol.com.br", H, "Terceiro Reels", "Reels de futebol",
  "Reels de futebol: o que o torcedor assiste até o fim do vídeo",
  "Reels de gol, bastidor e reação de torcida: duração, corte e gancho que mantêm o torcedor no vídeo (usar dados verificados sobre retenção e duração de vídeo curto; não inventar). Portal nacional de futebol.", "Leia também"),
 ("T02", "trailer-em-reels-como-filmes-e-series-medem-interesse", "tcfoco", "tcfoco.com.br", H + "ferramentas/calculadora-engajamento", "calculadora de engajamento do Terceiro Reels", "trailer em Reels",
  "Trailer em Reels: como filmes e séries medem o interesse do público",
  "Como estúdios e streamings usam trailer curto em Reels e que métricas (retenção, compartilhamentos, salvamentos, taxa de engajamento) mostram interesse; a calculadora de engajamento do Terceiro Reels entra como ferramenta para calcular a taxa. Portal de filmes e séries.", "Veja também"),
 ("T03", "o-que-e-reels-e-como-o-formato-mudou-o-video-curto", "sp2040", "sp2040.net.br", H + "o-que-e-reels", "guia do Terceiro Reels", "o que é Reels",
  "O que é Reels e como o formato mudou o vídeo curto do Instagram",
  "História e função do Reels (lançamento no Brasil em 2020; verificar), formatos, o que o Instagram diz sobre recomendação; o guia do Terceiro Reels (página /o-que-e-reels do cliente) entra como leitura complementar. Não copiar o texto da página do cliente.", "Mais sobre o tema"),
 ("T04", "musica-nos-reels-como-escolher-trilha-sem-bloqueio", "alagoas200", "alagoas200.com.br", H, "Terceiro Reels", "música nos Reels",
  "Música nos Reels: como escolher trilha sem bloqueio de direitos",
  "Biblioteca de músicas do Instagram para conta comercial x pessoal, por que o áudio some ou é silenciado, direitos autorais (verificar regras oficiais da Meta/Instagram). Portal generalista.", "Continue lendo"),
 ("T05", "visualizacoes-gratis-no-instagram-como-reconhecer-golpe", "afnewss", "afnewss.com.br", H + "visualizacoes-reels-gratis", "Terceiro Reels", "visualizações grátis no Instagram",
  "Visualizações grátis no Instagram: como reconhecer um golpe",
  "Sinais de golpe em oferta de visualização grátis (pedido de senha, login por terceiros, link suspeito, pagamento adiantado), o que fazer se entregou a senha (recuperação oficial da conta, Central de Ajuda), direitos do consumidor. A página de visualizações Reels grátis do Terceiro Reels entra como leitura sobre o assunto. Portal com bloco de direitos do consumidor.", "Relacionadas"),
 ("T06", "reels-para-pequeno-negocio-roteiro-de-30-segundos", "aguabrancaemfoco", "aguabrancaemfoco.com.br", H, "Terceiro Reels", "Reels para pequeno negócio",
  "Reels para pequeno negócio: roteiro de 30 segundos para o produto",
  "Roteiro prático de Reels de 30 segundos (gancho, demonstração, prova, fecho), com dado verificado do Sebrae sobre pequenos negócios nas redes. Portal generalista pequeno.", "Leia mais"),
 ("T07", "formato-do-reels-duracao-proporcao-9-16-e-capa", "abadianoticia", "abadianoticia.com.br", H, "Terceiro Reels", "formato do Reels",
  "Formato do Reels: duração, proporção 9:16 e capa do vídeo",
  "Guia técnico: proporção 9:16, duração máxima atual, resolução, capa e grade do perfil, zona segura de texto (conferir Central de Ajuda da Meta). Portal generalista de dúvida prática.", "Veja também"),
 ("T08", "reels-para-oficinas-e-lojas-tecnicas-como-mostrar-o-servico", "cocaisnoticias", "cocaisnoticias.com.br", H, "terceironome.com.br", "Reels para oficinas",
  "Reels para oficinas e lojas técnicas: como mostrar o serviço",
  "Como oficina, assistência técnica e loja de peças podem mostrar serviço em vídeo curto (antes e depois, diagnóstico em 30 s, cuidado com cliente e placa), com dado verificado sobre uso de Instagram por pequenos negócios (Sebrae). A âncora é a URL nua terceironome.com.br. Portal com bloco técnico (tabela de rosca, autos).", "Relacionadas"),
 ("T09", "reels-de-tutorial-faca-voce-mesmo-estrutura-que-prende", "itapecurunoticias", "itapecurunoticias.com.br", None, None, "Reels de tutorial",
  "Reels de tutorial faça você mesmo: estrutura que prende até o fim",
  "Estrutura de vídeo de tutorial em 30 a 60 s (resultado primeiro, materiais, passos na tela, fecho). ESTA MATÉRIA NÃO TEM LINK DO CLIENTE: cite a marca só em texto puro 'Terceiro Reels' (1 menção, sem hyperlink), por exemplo como fonte de um guia do blog do cliente (https://www.terceironome.com.br/blog/como-aumentar-visualizacoes-reels, leia antes de citar). Só os 2 links internos. Portal com bloco faça você mesmo.", "Continue lendo"),
 ("T10", "lojas-de-bairro-de-floriano-e-o-video-curto-no-instagram", "noticiasdefloriano", "noticiasdefloriano.com.br", H + "app", "app do Terceiro Reels", "vídeo curto no Instagram",
  "Lojas de bairro de Floriano e o vídeo curto no Instagram",
  "Comércio de Floriano (PI) e o vídeo curto: dado local verificado do IBGE (população do Censo 2022), exemplos hipotéticos marcados como tal, rotina de Reels de loja de bairro; o app do Terceiro Reels (página /app, instalável pelo navegador) entra como nota de apoio. Portal regional do Piauí.", "Leia também"),
]
CUT = {
 "vivofutebol": ["perfis esportivos estão ganhando destaque", "melhores horários para postar no Instagram"],
 "tcfoco": ["como fazer o Reels bombar", "atrair seguidores no Instagram"],
 "sp2040": ["a evolução do Instagram", "aplicativos de edição de vídeos"],
 "alagoas200": ["alcançar 1.000 pessoas no Instagram", "crescer no Instagram desde o início"],
 "afnewss": ["melhor horário para postar no Instagram", "ganhar visibilidade nas redes sociais"],
 "aguabrancaemfoco": ["oscilação de seguidores no Instagram", "número de seguidores e credibilidade digital"],
 "abadianoticia": ["aumentar sua visibilidade no Instagram", "olhar o Stories no Instagram"],
 "cocaisnoticias": ["faz cair as visualizações do Instagram", "mais atenção para o seu perfil"],
 "itapecurunoticias": ["mesmo começando do zero", "ganhar seguidores de graça"],
 "noticiasdefloriano": ["fazer Stories criativos para vendas", "transformar seguidores em clientes fiéis"],
}
out = []
for n, slug, site, portal, url, anc, kw, tit, tema, rot in P:
    ints = [r for r in R if r['site'] == site]
    assert len(tit) <= 70 and kw.lower() in tit.lower(), n
    out.append(dict(n=n, slug=slug, site=site, portal=portal, url=url, ancora=anc, kw=kw, titulo=tit, tema=tema, rotulo=rot,
                    internos=[dict(url=ints[i]['link'], titulo_destino=ints[i]['titulo'], ancora=CUT[site][i]) for i in range(2)]))
io.open('plano-tn.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
print([(o['n'], len(o['titulo'])) for o in out])
