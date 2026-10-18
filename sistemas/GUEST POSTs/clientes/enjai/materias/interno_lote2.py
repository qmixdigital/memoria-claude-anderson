# -*- coding: utf-8 -*-
import json, io, re, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8")
V = r"C:\Users\User\.claude\skills\materias-jornalisticas-linkbuilding\scripts\validador_materia.py"
I = {
 "E01": ("Leia também", [("https://achixclip.com.br/redes-sociais/como-olhar-o-stories-do-instagram-e-nao-ser-visto/", "Stories do Instagram"), ("https://achixclip.com.br/redes-sociais/curtidas-no-facebook-gratis/", "curtidas no Facebook grátis")]),
 "E02": ("Veja também", [("https://itapenoticias.com.br/marketing/o-que-os-perfis-populares-estao-fazendo-que-voce-ainda-nao-faz/", "o que os perfis populares estão fazendo"), ("https://itapenoticias.com.br/marketing/assessoria-de-imprensa-digital-o-que-contratar-para-divulgar-sua-empresa-na-internet/", "assessoria de imprensa digital")]),
 "E03": ("Mais sobre o tema", [("https://astralassessoria.com.br/marketing/quantas-postagens-por-dia-no-instagram/", "quantas postagens por dia no Instagram"), ("https://astralassessoria.com.br/marketing/a-estrategia-por-tras-dos-perfis-que-disparam-em-seguidores/", "perfis que disparam em seguidores")]),
 "E04": ("Continue lendo", [("https://xthor.com.br/como-alcancar-mais-pessoas-no-instagram-sem-depender-so-do-algoritmo/", "alcançar mais pessoas no Instagram"), ("https://xthor.com.br/escolher-o-melhor-nicho-para-trabalhar-com-revenda-digital/", "nicho para trabalhar com revenda digital")]),
 "E05": ("Relacionadas", [("https://apucarananoticias.com.br/geral/crm-tiktok-lanca-integracao-para-transformar-engajamento-no-tiktok-em-vendas/", "transformar engajamento no TikTok em vendas"), ("https://apucarananoticias.com.br/negocios/dicas-uteis-para-contratar-uma-consultoria-de-vendas/", "contratar uma consultoria de vendas")]),
 "E06": ("Leia mais", [("https://alertasocial.com.br/marketing/como-ganhar-destaque-nas-redes-sociais-mesmo-com-perfil-novo/", "ganhar destaque nas redes sociais"), ("https://alertasocial.com.br/rede-social/instagram-bloqueou-minha-conta-guia-de-recuperacao-e-direitos/", "Instagram bloqueou minha conta")]),
 "E07": ("Veja também", [("https://luiziananoticias.com.br/marketing/campanhas-para-aumentar-seguidores-no-instagram/", "campanhas para aumentar seguidores no Instagram"), ("https://luiziananoticias.com.br/crescimento/por-que-alguns-reels-tem-mais-visualizacoes/", "por que alguns Reels têm mais visualizações")]),
 "E08": ("Leia também", [("https://agenciadivulgar.com.br/geral/o-que-fazer-para-ter-mais-curtidas-no-tiktok-2/", "mais curtidas no TikTok"), ("https://agenciadivulgar.com.br/marketing/como-funciona-o-crescimento-acelerado-de-perfis-nas-redes-sociais/", "crescimento acelerado de perfis nas redes sociais")]),
 "E09": ("Relacionadas", [("https://noticiasdetimon.com.br/marketing/qual-estrategia-esta-sendo-usada-por-quem-bomba-no-instagram/", "quem bomba no Instagram"), ("https://noticiasdetimon.com.br/marketing/o-que-postar-no-instagram-para-chamar-atencao/", "o que postar no Instagram")]),
 "E10": ("Mais sobre o tema", [("https://portalgc.com.br/marketing/como-fazer-o-algoritmo-trabalhar-a-favor-do-seu-crescimento-nas-redes-sociais/", "fazer o algoritmo trabalhar a favor do seu crescimento"), ("https://portalgc.com.br/marketing/postagens-inteligentes-no-instagram/", "postagens inteligentes no Instagram")]),
}
for m in json.load(open("plano-lote2.json", encoding="utf-8")):
    s = m["slug"]; rot, ls = I[m["n"]]
    j = json.load(open(s + ".json", encoding="utf-8"))
    h = io.open(s + ".html", encoding="utf-8").read()
    if "Imagem de" in h[:300]: raise SystemExit("html ja alterado " + s)
    par = "<p><strong>%s:</strong> <a href=\"%s\">%s</a> e <a href=\"%s\">%s</a>.</p>" % (rot, ls[0][0], ls[0][1], ls[1][0], ls[1][1])
    k = h.rstrip().rfind("<p")
    nh = h[:k] + par + "\n\n" + h[k:]
    io.open(s + ".v2.html", "w", encoding="utf-8", newline="\n").write(nh)
    r = subprocess.run(["python", V, s + ".v2.html", "--links", "3", "--titulo", j["titulo"], "--kw", m["kw"], "--resumo", j["linha_fina"]], capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(m["n"], [l.strip() for l in r.stdout.splitlines() if "RESULTADO" in l or l.startswith("XX") or "XX " in l][:3])
