# -*- coding: utf-8 -*-
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
plano = {x['n']: x for x in json.load(open(os.path.join(D, 'plano-cal.json'), encoding='utf-8'))}

def jean_p(it):
    a, b = it['internos']
    return ('<p><strong>%s:</strong> <a href="%s">%s</a> e <a href="%s">%s</a>.</p>'
            % (it['rotulo'], a['url'], a['ancora'], b['url'], b['ancora']))

C02 = '''<p>Quem joga bola na quarta à noite e no domingo de manhã costuma sentir o mesmo problema na segunda: a perna aguenta, mas o ombro e o peito ficam para trás. Empurrar peso, algo que o futebol quase não pede, entra então na lista, e o dilema é saber onde aprender. Entre os apps e sites de treino de força com peso do corpo, o Calistenia IA traz uma página dedicada a <a href="{destino}">{ancora}</a>, exercício de peito, tríceps e ombro feito entre duas barras paralelas.</p>

<p>A lista abaixo reúne cinco opções para quem quer força sem depender de academia, com o Calistenia IA em primeiro por ser o ponto de partida desta pauta. Os outros quatro foram conferidos nas páginas oficiais ou nas fichas das lojas de aplicativos, e nenhuma nota ou número de usuários foi repetido aqui, porque esses números mudam e variam de loja para loja.</p>

<h2>Apps e sites de treino de força para jogadores de futebol</h2>

<ol>
<li>Calistenia IA</li>
<li>Nike Training Club</li>
<li>Madbarz</li>
<li>Freeletics</li>
<li>Calisteniapp</li>
</ol>

<h3>1. Calistenia IA</h3>

<p>O Calistenia IA é uma ferramenta web gratuita que monta o treino por inteligência artificial a partir de seis perguntas, sobre nível, objetivo, dias livres e equipamento. A página inicial informa que não há cadastro nem pedido de e-mail, e que o resultado é um plano de quatro semanas montado sobre um catálogo de vinte exercícios.</p>

<p>Para o jogador que quer empurrar mais, o interesse está na biblioteca. Cada exercício tem a própria página, com passo a passo, erros comuns, versão mais fácil, versão mais difícil e perguntas frequentes. A página de dips nas paralelas, por exemplo, descreve a descida até os ombros ficarem na linha dos cotovelos ou pouco abaixo, avisa que a amplitude forçada é o erro típico e sugere começar pelo dips no banco ou pelo negativo.</p>

<p>O limite é a especialidade: a ferramenta é de calistenia, não de futebol, e não trata de corrida, velocidade ou treino com bola. A versão gratuita mantém um plano ativo por vez, e a PRO, paga, guarda planos ilimitados no histórico. Quem marca limitação de ombro no questionário não recebe o exercício, segundo a própria página.</p>

<h3>2. Nike Training Club</h3>

<p>O aplicativo da Nike tem outro perfil: é uma biblioteca de aulas conduzidas por treinadores, e não uma ferramenta voltada a uma modalidade. A ficha na App Store lista força, condicionamento, core, ioga, pilates e recuperação, além de uma categoria de sessões sem equipamento, descrita como feita para ganhar músculo.</p>

<p>Para o amador de futebol, a vantagem é a variedade. Dá para trocar um dia de empurrar por uma sessão de core ou de mobilidade sem sair do aplicativo, que aparece com o português entre os idiomas disponíveis. A ficha informa que o app é gratuito e que membros Nike têm acesso ao conteúdo mais recente, sem detalhar o que fica aberto a quem não é membro.</p>

<p>A ressalva está nas plataformas: a ficha consultada lista iPhone e Apple Watch, e quem usa outro aparelho precisa conferir a disponibilidade na própria loja. Também não há foco em calistenia, então o caminho para exercícios como paralelas e barra é menos direto.</p>

<h3>3. Madbarz</h3>

<p>O Madbarz é um aplicativo de treinos com peso do corpo organizado por duração, grupo muscular e nível. A descrição na App Store cita treinos personalizados, tutoriais em vídeo, desafios semanais e um feed social, e as notas de versão registram tradução para o português do Brasil.</p>

<p>Quem tem horário fixo encontra ali uma vantagem. Em uma semana de jogos, com agenda apertada, escolher uma sessão por duração costuma ser mais útil do que montar um plano inteiro. O app é gratuito para baixar e vende assinatura, que acrescenta planos de treino e um guia de nutrição, segundo a ficha.</p>

<p>Como limitação, a loja informa que a assinatura renova sozinha e que as cobranças não são reembolsáveis. Vale ler as condições antes de assinar.</p>

<h3>4. Freeletics</h3>

<p>O Freeletics se apresenta como um aplicativo de treino apenas com peso do corpo, sem halteres, sem elástico e sem academia. A página oficial explica que um coach de inteligência artificial cria um treino novo a cada dia com base no retorno do usuário, e que filtros permitem avisar que falta espaço ou que é preciso treinar em silêncio.</p>

<p>As sessões duram de 15 a 60 minutos, segundo o site, o que combina com quem treina depois do trabalho e antes da pelada. O estilo é intenso e de circuito, mais próximo de condicionamento do que de técnica de um exercício específico como os dips.</p>

<p>A página oficial consultada não informa o que é gratuito e o que é pago. A ficha da loja descreve uma parte gratuita e um coach pago, e por isso o custo exato deve ser conferido no próprio app antes de qualquer decisão.</p>

<h3>5. Calisteniapp</h3>

<p>O Calisteniapp, cuja ficha traz a Calisteniapp, S.L. como desenvolvedora, é voltado de fato à calistenia. A ficha lista mais de 40 programas guiados, tutoriais de habilidades como barra, parada de mão, muscle-up, front lever e planche, calendário de treinos, registro de sessões e um construtor de treinos próprios. O português consta entre os idiomas.</p>

<p>Segundo o desenvolvedor, a biblioteca passa de 700 exercícios, e mais de 500 rotinas avulsas são gratuitas. Programas, desafios e métricas avançadas ficam na assinatura PRO. É a opção mais profunda da lista para quem quer sair do básico e acompanhar a evolução semana a semana.</p>

<p>O limite é justamente o tamanho: tanta oferta pode pesar para quem só quer duas ou três sessões de empurrar por semana. A ficha consultada trata de iPhone e outros aparelhos da Apple, e usuários de Android devem conferir a disponibilidade na loja.</p>

<h2>Onde o treino de empurrar entra na rotina de quem joga</h2>

<p>O futebol exige muito de perna, e a parte de cima do corpo recebe pouco estímulo regular. Por isso, em semanas com jogo no fim de semana, a musculação do tronco costuma funcionar melhor em dias separados da partida, com poucos exercícios bem feitos. Os dips e as flexões ocupam bem esse espaço, e o puxar, com barra ou remada, equilibra o ombro.</p>

<p>Nenhum desses apps e sites de treino promete desempenho em campo, e é assim que deve ser lido. Servem para ensinar e organizar a rotina. O que acontece dentro das quatro linhas depende de outras coisas, como calendário, descanso e preparação específica orientada por quem acompanha o atleta.</p>

<h2>Cuidados com ombro e articulações antes de aumentar a carga</h2>

<p>O ombro é a articulação que mais reclama quando a carga de empurrar sobe de uma vez. O próprio Calistenia IA lembra, na página dos dips, que o movimento exige amplitude e pouco perdoa exagero. A regra prática é descer só até onde a articulação permite sem desconforto e só então subir o nível.</p>

<p>Dor persistente no ombro, no cotovelo ou nas costas, antes ou depois de uma partida, pede avaliação de um profissional de saúde, e não mais repetições. Conteúdo de aplicativo orienta o treino, mas não faz diagnóstico.</p>

<h2>Como escolher entre as cinco opções</h2>

<p>Entre os apps e sites de treino, a melhor escolha depende do objetivo. Quem quer aprender um exercício específico, como os dips, tira mais proveito de uma página dedicada a ele. Quem precisa de variedade e de aulas guiadas se dá bem com uma biblioteca grande. Quem treina com tempo curto prefere filtros por duração, e quem gosta de acompanhar números procura registro de sessões.</p>

<p>Também pesa o custo. A maior parte da lista tem parte gratuita e parte paga, e a ordem em que os nomes aparecem aqui é editorial: a pauta nasceu do Calistenia IA, e o texto não afirma que ele seja superior aos demais.</p>

{jean}

<p>Na prática, vale testar um app ou site por vez, por duas semanas, e observar se os treinos cabem na agenda e se o ombro responde bem. Se cabe, segue. Se não, a troca custa pouco, e o jogo de domingo continua valendo o mesmo.</p>
'''

C04 = '''<p>Quem já passou da barra fixa de principiante conhece o platô: as repetições param de subir, o treino perde direção e surgem as perguntas sobre o que vem depois. Entre os apps e sites de calistenia que ajudam nessa fase, o Calistenia IA tem uma página sobre <a href="{destino}">{ancora}</a>, habilidade em que o corpo fica na horizontal, suspenso, de frente para cima.</p>

<p>A seguir, cinco opções para evoluir nas barras, com o Calistenia IA em primeiro porque a pauta parte dele. Os outros quatro nomes foram conferidos em páginas oficiais ou nas fichas das lojas de aplicativos. Notas de usuários e quantidade de downloads ficaram de fora, já que mudam de uma loja para outra e não dizem muito sobre o treino em si.</p>

<h2>Apps e sites de calistenia para quem treina na barra</h2>

<ol>
<li>Calistenia IA</li>
<li>Thenics</li>
<li>Calisteniapp</li>
<li>Madbarz</li>
<li>Freeletics</li>
</ol>

<h3>1. Calistenia IA</h3>

<p>Gratuito e direto no navegador, o Calistenia IA pede só isto: seis perguntas, sem cadastro, e sai um plano de quatro semanas montado sobre um catálogo de vinte exercícios. Os níveis vão de um primeiro dia no chão até o domínio, passando por uma etapa dedicada ao muscle-up.</p>

<p>Quem busca evolução na barra olha para a progressão. Cada página de exercício aponta um degrau mais fácil e um mais difícil. No front lever, a descrição cita o tuck, o tuck avançado e a versão com uma perna estendida antes do exercício completo, e define a dificuldade como 5 de 5. A página também diz que a habilidade é um objetivo de médio prazo e que não existe prazo honesto para alcançá-la.</p>

<p>O limite é o tamanho do catálogo. São vinte exercícios, o que serve bem para organizar a base, mas não cobre todas as habilidades avançadas que um praticante experiente possa querer. A versão PRO, paga, guarda planos ilimitados e inclui ajuste semanal conforme a evolução.</p>

<h3>2. Thenics</h3>

<p>O Thenics é um aplicativo feito para habilidades. Segundo a ficha da App Store, a versão gratuita traz muscle-up, planche, front lever, back lever, pistol squat, handstand push-up e V-sit, e a assinatura Pro acrescenta itens como bandeira humana, barra fixa com um braço e dragon flag.</p>

<p>Cada habilidade é dividida em progressões, e cada progressão tem seus treinos. A lógica é a de domínio de um movimento por vez, sem a preocupação de somar carga. Há também um treinador pago que monta planos personalizados.</p>

<p>Dois limites aparecem na ficha: o aplicativo está disponível só em inglês, e avaliações de usuários mencionam saltos grandes entre algumas progressões. Para quem não lê o idioma com tranquilidade, o ritmo de aprendizado muda. Em troca, o foco em habilidades é mais fechado do que nos demais apps da lista, e isso agrada a quem já escolheu o objetivo.</p>

<h3>3. Calisteniapp</h3>

<p>O Calisteniapp, cuja desenvolvedora na loja é a Calisteniapp, S.L., cobre calistenia de ponta a ponta. A loja informa mais de 40 programas, tutoriais de barra, parada de mão, muscle-up, front lever e planche, calendário, registro de treinos e um construtor de rotinas. Há versão em português.</p>

<p>O desenvolvedor afirma que a biblioteca ultrapassa 700 exercícios e que mais de 500 rotinas avulsas são gratuitas, enquanto programas, desafios e métricas avançadas dependem da assinatura PRO. Existe ainda um tipo de rotina que ajusta a carga conforme o desempenho.</p>

<p>Críticas citadas na ficha são pontuais: em avaliações de usuários, há queixa sobre treinos que não podem ser repetidos e sobre falta de cronômetro individual. Quem usa Android deve verificar a disponibilidade, já que a ficha consultada é a da App Store.</p>

<h3>4. Madbarz</h3>

<p>O Madbarz tem foco em treinos com peso do corpo, filtrados por duração, grupo muscular e nível, com tutoriais em vídeo e desafios semanais. A App Store cita também um feed social, e as notas de versão registram tradução para o português do Brasil.</p>

<p>No contexto de evolução nas barras, serve como complemento: dá ritmo e variedade em dias em que a prioridade não é treinar uma habilidade específica. O download é gratuito, e a assinatura Premium inclui planos de treino e um guia de nutrição com receitas.</p>

<p>A ressalva é financeira. A ficha lembra que a assinatura renova sozinha e que as cobranças não são reembolsáveis, o que pede atenção na hora de testar.</p>

<h3>5. Freeletics</h3>

<p>O Freeletics trabalha só com peso do corpo e, segundo a página oficial, usa um coach de inteligência artificial para gerar um treino novo a cada dia, ajustado ao retorno de quem treina. Sessões de 15 a 60 minutos e filtros para pouco espaço ou treino silencioso fazem parte da proposta.</p>

<p>É um treino de condicionamento em circuito, e não de técnica de habilidades. Ajuda quem quer manter fôlego e consistência entre blocos de barra, mas não substitui um guia de progressão de um movimento como o front lever.</p>

<p>O que é gratuito e o que é pago não aparece na página consultada. A loja descreve uma parte gratuita e um coach pago, então o custo deve ser verificado dentro do aplicativo.</p>

<h2>Barra fixa, paralelas e habilidades: o que cada tipo de recurso ensina</h2>

<p>Nas barras, nem tudo é a mesma coisa, e os apps e sites de calistenia se dividem em tipos. Há recursos que ensinam a técnica de um movimento, outros que organizam a semana e outros que mantêm o condicionamento. Um site com uma página por exercício responde bem à dúvida pontual, como o ângulo do quadril ou o erro mais comum. Um aplicativo de habilidades, por sua vez, serve para quem já escolheu o movimento e quer um caminho em etapas.</p>

<p>A progressão por estágios tem uma lógica simples. Sobe-se um degrau quando a forma está limpa, e não quando a série fica fácil. O Calistenia IA usa essa regra em todas as páginas, e o Thenics a aplica por habilidade. Em qualquer um, pular etapas costuma custar tempo, e não o contrário.</p>

<h2>Cotovelos e ombros pedem paciência em habilidades de isometria</h2>

<p>Habilidades que exigem sustentar o corpo na horizontal colocam carga alta nos cotovelos e nos ombros. A página do front lever no Calistenia IA lista como erro comum dobrar os cotovelos para facilitar e sustentar com os ombros passivos. O alerta vale para qualquer aplicativo: linha limpa vem antes de tempo de sustentação.</p>

<p>Dor persistente nas articulações, formigamento ou perda de força não são parte do processo, e a recomendação é procurar um profissional de saúde antes de seguir treinando. Os aplicativos orientam o exercício, mas não avaliam o corpo de quem está do outro lado da tela.</p>

<h2>Como escolher entre os cinco</h2>

<p>Entre apps e sites de calistenia, a melhor escolha depende do objetivo. Para entender uma progressão em português e sem custo, um site com páginas de exercício resolve. Para estudar várias habilidades em inglês, com treinos por etapa, o Thenics é uma opção. Para uma biblioteca grande com calendário e registro, o Calisteniapp tem mais recursos, e para variar o ritmo do treino, Madbarz e Freeletics entram como apoio.</p>

<p>A ordem desta lista é editorial. A pauta nasceu do Calistenia IA, e o texto não sugere que ele seja melhor que os demais. O que decide é o ponto em que cada praticante está na barra.</p>

{jean}

<p>Um teste simples resolve a dúvida: escolher uma habilidade só, usar um dos recursos por três ou quatro semanas e anotar o que mudou na forma, e não só no tempo sustentado. Se a progressão parar, vale trocar de recurso. Se a dor aparecer, vale parar e procurar avaliação.</p>
'''

items = {
 'C02': dict(txt=C02, linha='Cinco apps e sites de treino de força com peso do corpo, conferidos um a um, para quem equilibra o campo com o ombro e o peito.',
   alt='Homem treinando em barras paralelas num parque, em apps e sites de treino de força com peso do corpo',
   img='c02.img.txt'),
 'C04': dict(txt=C04, linha='Guia com cinco apps e sites de calistenia para sair do platô na barra, com limites e custos conferidos nas fontes oficiais.',
   alt='Homem de costas fazendo barra fixa, imagem para apps e sites de calistenia para evoluir nas barras',
   img='c04.img.txt'),
}
for n, it in items.items():
    p = plano[n]
    html = it['txt'].replace('{destino}', p['destino']).replace('{ancora}', p['ancora']).replace('{jean}', jean_p(p))
    # jean paragraph must be one before last: already placed
    open(os.path.join(D, p['slug'] + '.html'), 'w', encoding='utf-8').write(html)
    img = json.loads(open(os.path.join(D, it['img']), encoding='utf-8').read())
    open(os.path.join(D, p['slug'] + '.ficha.json'), 'w', encoding='utf-8').write(json.dumps(img, ensure_ascii=False, indent=1))
    j = dict(titulo=p['titulo'], linha_fina=it['linha'], meta_description='', html=html, portal=p['domain'],
             cliente='Calistenia IA', links=[dict(ancora=p['ancora'], url=p['destino'])], palavra_chave=p['kw'],
             imagem=p['slug'] + '.webp', imagem_alt=it['alt'], imagem_fonte=img['fonte'].capitalize(),
             imagem_fonte_url=img['pagina_url'])
    open(os.path.join(D, p['slug'] + '.json'), 'w', encoding='utf-8').write(json.dumps(j, ensure_ascii=False, indent=1))
    words = len(re.sub(r'<[^>]+>', ' ', html).split())
    print(n, p['slug'], words)
