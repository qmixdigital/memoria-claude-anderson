# -*- coding: utf-8 -*-
"""Escreve o alt das 42 imagens de corpo que estavam sem descricao.

Uso, no servidor:  python3 /tmp/poe_alt.py [--aplica]

⚠️ **Alt descreve a FOTO, para quem nao a ve.** Escrever ali o titulo do artigo
ou o nome do arquivo e informacao falsa, e informacao falsa e pior do que alt
vazio. Cada uma destas frases saiu de olhar a imagem numa folha de contato com o
numero desenhado POR CIMA do quadro: com a legenda embaixo, a leitura em coluna
troca o numero e o alt sai do vizinho.

🔴 **Uma imagem sai em vez de ganhar alt.** A de numero 18 e um banner de
farmacia gerado por IA cujo texto saiu como garatuja ("DISSCOUT RAGNTS OE
CHSIIENT"). Nao ha alt honesto para ela, porque o que ela mostra e texto que nao
quer dizer nada, e ela veio assim da origem.
"""
import glob
import io
import json
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv

ALT = {
 1: 'Mulher de blazer claro sentada à mesa de um consultório, com o letreiro da terapeuta na parede ao fundo',
 2: 'Mochila cinza de nylon vista de frente, com alças acolchoadas e bolso frontal',
 3: 'Duas canetas pretas com acabamento prateado e o estojo aberto que as acompanha',
 4: 'Grupo de pessoas conversando ao redor de uma mesa de pebolim, numa sala de convivência clara',
 5: 'Homem de blazer preto, de braços cruzados, diante da parede com o nome da clínica',
 6: 'Logotipo dourado da Clínica Ibelli sobre fundo verde-claro',
 7: 'Atendente de uniforme verde-água retirando uma caixa de medicamento da prateleira da farmácia',
 8: 'Arte de divulgação de um pote de ômega 3, com a lista de características ao lado',
 9: 'Jogador de futebol sentado no gramado segurando o tornozelo, com a bola ao lado',
 10: 'Mesa vista de cima com salmão, castanhas, folhas verdes, laranja e copos de leite',
 11: 'Mulher em posição de afundo sobre um tapete de ioga azul',
 12: 'Arte com idosos conversando à mesa de um espaço de convivência e a frase sobre solidão',
 13: 'Prato branco dividido em porções de legumes, carne e massa, ao lado de um copo de leite',
 14: 'Bancada branca com legumes, frutas, ovos, castanhas, massas e carnes espalhados',
 15: 'Mochila preta antifurto vista de frente, de costas e acoplada à haste de uma mala',
 16: 'Guarda-chuva encostado na parede ao lado de vasos de planta sobre degraus de madeira',
 17: 'Mulher de blazer verde-água lendo uma receita diante da prateleira de medicamentos',
 18: None,   # 🔴 banner com texto ilegivel: sai do corpo
 19: 'Homem de jaleco branco e estetoscópio no pescoço, de braços cruzados',
 20: 'Estetoscópio apoiado sobre notas de cem dólares',
 21: 'Duas pessoas de jaleco e óculos de proteção manipulando uma pipeta em laboratório',
 22: 'Profissional de touca e máscara trabalhando com amostras numa bancada de laboratório',
 23: 'Mochila branca com a estampa Urban Green Style na frente',
 24: 'Pasta preta com elástico azul e a marca Camsay gravada na capa',
 25: 'Mulher de blusa verde-água segurando uma caixa de remédio diante da prateleira',
 26: 'Atendente de uniforme verde-água sorrindo no balcão de uma farmácia popular',
 27: 'Atendente de uniforme verde-água sorrindo diante da prateleira de medicamentos',
 28: 'Formulários de plano de saúde sobre a mesa, com estetoscópio, prancheta e teclado',
 29: 'Mão segurando um frasco azul de medicamento diante de uma lista impressa de preços',
 30: 'Mulher de cardigã branco digitando no notebook, com uma xícara ao lado',
 31: 'Homem visto de costas com o ombro destacado em vermelho, indicando dor',
 32: 'Homem de camiseta azul com expressão de dor, sentado numa sala clara',
 33: 'Pessoa de suéter claro com as duas mãos apoiadas na lombar',
 34: 'Arte de divulgação de um colágeno em pó, com copos de vitamina e a embalagem',
 35: 'Banner escuro de anúncio sobre investimento em clínica odontológica',
 36: 'Ilustração de um braço com o cotovelo destacado em azul, indicando inflamação',
 37: 'Mulher idosa sentada numa poltrona junto à janela segurando uma xícara, com flores ao lado',
 38: 'Homem de camiseta preta visto de costas, com uma bolsa transversal no ombro',
 39: 'Homem guardando um notebook dentro de uma mochila azul, num escritório',
 40: 'Arte com a fachada de um residencial sênior e a pergunta sobre morar sozinho após os 75 anos',
 41: 'Frasco de protetor solar, óculos escuros e chapéu de palha sobre a areia, com o mar ao fundo',
 42: 'Logotipo da PowerMocho, agência de marketing odontológico',
}

alvos = [l.rstrip('\n').split('\t') for l in io.open('/tmp/alt-lista.tsv', encoding='utf-8')
         if l.strip()]
assert len(alvos) == len(ALT), 'a lista mudou: %d na lista, %d descritas' % (len(alvos), len(ALT))

RX_IMGTAG = re.compile(r'<img\b[^>]*>', re.I)
RX_FIG = re.compile(r'(?is)<figure[^>]*>\s*<img\b[^>]*src="/img/%s"[^>]*>.*?</figure>')

postos = removidos = 0
por_arquivo = {}
for i, (portal, slug, arq, titulo) in enumerate(alvos, 1):
    por_arquivo.setdefault((portal, slug), []).append((arq, ALT[i]))

for (portal, slug), itens in por_arquivo.items():
    p = '/srv/portais/%s/data/%s.json' % (portal, slug)
    d = json.load(io.open(p, encoding='utf-8'))
    c = d.get('content') or ''
    antes = c
    for arq, alt in itens:
        if alt is None:
            # o `figure` que embrulha sai junto: sem ele fica uma legenda solta
            rx = re.compile(r'(?is)<figure[^>]*>\s*<img\b[^>]*src="/img/%s"[^>]*>.*?</figure>'
                            r'|<img\b[^>]*src="/img/%s"[^>]*>'
                            % (re.escape(arq), re.escape(arq)))
            novo = rx.sub('', c)
            if novo != c:
                removidos += 1
                c = novo
            continue

        def troca(m):
            global postos
            tag = m.group(0)
            if ('src="/img/%s"' % arq) not in tag:
                return tag
            if re.search(r'\balt="[^"]', tag):
                return tag
            postos += 1
            if 'alt=' in tag:
                return re.sub(r'\balt="[^"]*"', 'alt="%s"' % alt, tag, count=1)
            return tag[:-1].rstrip('/').rstrip() + ' alt="%s">' % alt
        c = RX_IMGTAG.sub(troca, c)
    if c != antes:
        d['content'] = c
        if APLICA:
            io.open(p, 'w', encoding='utf-8', newline='\n').write(
                json.dumps(d, ensure_ascii=False, indent=2))

print('  alt escrito em %d imagem(ns) | %d imagem(ns) removida(s) por texto ilegivel'
      % (postos, removidos))
if not APLICA:
    print('  ensaio. rode com --aplica.')
