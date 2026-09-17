# -*- coding: utf-8 -*-
"""Pacote editorial dos cinco portais de saude: autor, equipe e politica.

Uso, no servidor:  python3 /tmp/editorial_saude.py [--aplica]

Os cinco itens de E-E-A-T que o checklist de SEO comum nao pega:

  1. **pagina de autor** para cada assinatura com pelo menos um artigo. Sem ela o
     `rel=author` aponta para 404 e o artigo fica sem autoria declarada
  2. **pagina de equipe**, dizendo quem responde por qual frente
  3. **politica editorial**, incluindo a declaracao de uso de IA
  4. **quem somos** proprio, e nao o texto padrao do motor
  5. **avatar** de cada autor, em `/img/autores/<slug>.webp`

🔴 **O texto de cada portal e proprio.** A varredura de 22/08/2026 achou 4.568
artigos identicos em 47 portais da rede: repetir a mesma politica editorial em
cinco portais vizinhos seria a mesma assinatura de conjunto, so que numa pagina
que o Google le com atencao.

⚠️ **Persona nao ganha credencial.** Sao editores, e nao medicos: nenhuma bio
traz CRM, especializacao ou titulo clinico. O que sustenta o E-E-A-T aqui e a
politica de apuracao declarada, e nao um diploma inventado.
"""
import io
import json
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
CFG = '/opt/portal-engine/sites.json'

ABOUT = {
 'saudeacessivel': '<p>O <strong>Saúde Acessível</strong> nasceu para responder, em português claro, aquilo que a consulta rápida não teve tempo de explicar. A pergunta que orienta cada pauta é sempre a mesma: o que a pessoa precisa saber para decidir o próximo passo.</p><h2>Explicar sem assustar</h2><p>Texto de saúde que transforma cada dor em emergência é fácil de escrever e péssimo de ler. Aqui o texto diz o que é comum, o que é raro e o que muda a conduta, e separa as duas coisas com todas as letras.</p><h2>O que não fazemos</h2><p>Nada aqui substitui consulta, e nenhum texto promete cura. Quando a evidência é fraca, o texto diz que é fraca em vez de completar a lacuna com opinião.</p><h2>Preço quando existe</h2><p>Exame, órtese e equipamento de uso doméstico aparecem com faixa de valor e o mês do levantamento. Preço muda, e datar o número é o mínimo para quem vai usar a informação semanas depois.</p><h2>Correção à vista</h2><p>Erro apontado com indicação do trecho é analisado e, quando procede, o texto é atualizado com a data da alteração declarada.</p>',
 'saudicas': '<p>O <strong>Saúde Dicas</strong> é para quem quer resolver uma dúvida em dois minutos e não em duas páginas. Cada texto começa pela resposta e só depois explica o porquê, porque quem procura já está com o problema na mão.</p><h2>Primeiro a resposta</h2><p>Se a dúvida cabe em uma frase, ela vem na primeira frase. O detalhe fica logo abaixo, para quem quiser entender o motivo, e nunca no lugar da resposta.</p><h2>O que fica de fora</h2><p>Não vendemos produto, não indicamos marca por indicação paga e não prometemos resultado em prazo fixo. Onde o assunto exige profissional, o texto diz isso antes de qualquer dica.</p><h2>Dica que dá para manter</h2><p>Rotina que ninguém consegue seguir não serve para nada. As orientações partem do que é possível fazer no dia a dia, e o ideal aparece depois, identificado como ideal.</p><h2>Correção</h2><p>Apontamento com o trecho indicado é analisado e, se procede, o texto sai corrigido com a data da alteração declarada.</p>',
 'saudeemalta': '<p>O <strong>Saúde em Alta</strong> trata chá, planta e alimento com a mesma exigência que se cobra de remédio. Natural não quer dizer inofensivo, e essa frase decide o que entra e o que fica de fora do site.</p><h2>Planta tem princípio ativo</h2><p>Toda infusão publicada aqui vem com para que serve, quanto usar, por quanto tempo e com qual medicação não combina. Sem esses quatro itens o texto não sai.</p><h2>Quando não há estudo</h2><p>Uso popular sem pesquisa por trás é publicado como uso popular, dito com essas palavras. A alternativa, que é apresentar tradição como evidência, é o erro mais comum do nosso assunto.</p><h2>O que não substituímos</h2><p>Nada aqui toma o lugar de consulta ou de tratamento prescrito. Interromper medicação por causa de um chá é exatamente o que este site existe para evitar.</p><h2>Correção</h2><p>Erro apontado com indicação do trecho é analisado, e o texto corrigido sai com a data da alteração à vista.</p>',
 'revistatopsaude': '<p>A <strong>Revista Top Saúde</strong> é feita para quem quer o assunto inteiro, e não só a manchete. Cada pauta tem espaço para começar pelo que se sabe, passar pelo que está em disputa e terminar no que ainda não tem resposta.</p><h2>Reportagem em ordem</h2><p>Sintoma, exame, conduta e o que muda de pessoa para pessoa, nessa sequência. Quando a literatura ainda não fechou, o texto diz que não fechou em vez de escolher um lado por conveniência de leitura.</p><h2>Fonte no meio do texto</h2><p>O dado vem com o ano da medição e a origem dita no parágrafo, e não escondida num bloco de referências no fim que ninguém lê.</p><h2>Promessa de resultado</h2><p>Cosmético, dieta e procedimento estético só entram com o ativo, o mecanismo e a faixa de tempo até o efeito aparecer. Onde a resposta não existe, o texto diz que não existe.</p><h2>Correção</h2><p>Apontamento com o trecho indicado é analisado e, quando procede, o texto é atualizado com a data da alteração declarada.</p>',
 'matogrossosaude': '<p>O <strong>Mato Grosso Saúde</strong> cobre o que muda no atendimento e no bolso de quem precisa de saúde no estado. A pauta nasce da pergunta prática: o que fazer com isso que já está em casa, ou com essa consulta que precisa ser marcada.</p><h2>Alerta que diz o que fazer</h2><p>Notícia de recolhimento ou de proibição só serve se trouxer o lote, a marca e a orientação para quem já comprou. Alerta sem instrução é pânico, e não informação.</p><h2>Guia de medicamento</h2><p>As páginas de dose e horário são as mais procuradas do site, quase sempre por gente aflita. Elas começam pela resposta direta, avisam que a orientação é geral e dizem em que caso é preciso falar com quem receitou.</p><h2>O que não fazemos</h2><p>Nada aqui substitui prescrição, e nenhum texto indica interromper tratamento. Onde a dúvida exige avaliação, o texto manda procurar atendimento.</p><h2>Correção</h2><p>Erro apontado com o trecho indicado é analisado, e a correção sai com a data da alteração declarada.</p>',
}

POLITICA = {
 'saudeacessivel': ('Política Editorial',
  'Como o Saúde Acessível escolhe pauta, apura, revisa e corrige o que publica, e o que declaramos sobre o uso de inteligência artificial.',
  '<p>Esta página descreve como o <strong>Saúde Acessível</strong> escolhe pauta, apura, escreve, revisa e corrige o que publica.</p><h2>Escolha de pauta</h2><p>A pergunta que decide é se o texto ajuda alguém a dar o próximo passo. Assunto que só serve para assustar não vira pauta.</p><h2>Apuração</h2><p>Recomendação de saúde sai de órgão oficial, sociedade de especialidade ou pesquisa publicada, com o ano dito por extenso. Notícia sobre estudo não substitui o estudo.</p><h2>Preço</h2><p>Exame, órtese e equipamento aparecem em faixa de valor, com o mês do levantamento à vista. Nenhum valor é apresentado como fixo.</p><h2>Limite claro</h2><p>Nada aqui substitui consulta. Onde o sintoma pede avaliação, o texto diz isso antes da orientação prática.</p><h2>Conteúdo pago</h2><p>Publicação paga é identificada no próprio texto. Anunciante não escolhe pauta nem lê matéria antes de publicar.</p><h2>Inteligência artificial</h2><p>Ferramenta de IA é usada como apoio de pesquisa e de revisão. Todo texto passa por edição humana, e a responsabilidade pelo publicado é da redação.</p><h2>Correção</h2><p>Apontamento com o trecho indicado é analisado, e o texto corrigido sai com a data da alteração declarada.</p>'),
 'saudicas': ('Política Editorial',
  'Como o Saúde Dicas escolhe pauta, confere o que publica, identifica conteúdo pago e declara o uso de inteligência artificial.',
  '<p>Esta página descreve como o <strong>Saúde Dicas</strong> decide o que publica e como corrige o que sai errado.</p><h2>Escolha de pauta</h2><p>A pauta nasce de dúvida real, do tipo que se digita na busca às onze da noite. Assunto que só rende manchete não entra.</p><h2>Apuração</h2><p>Orientação de saúde vem de fonte oficial ou de pesquisa publicada, com o ano dito. Onde a recomendação varia entre instituições, o texto mostra a variação em vez de escolher a mais conveniente.</p><h2>Marca e produto</h2><p>Não indicamos marca por acordo comercial. Quando um produto é citado, é porque o texto explica o que ele faz, e a citação não é recomendação de compra.</p><h2>Limite claro</h2><p>Nada aqui substitui consulta, e nenhuma dica manda interromper tratamento.</p><h2>Conteúdo pago</h2><p>Publicação paga é identificada no próprio texto. Anunciante não escolhe pauta.</p><h2>Inteligência artificial</h2><p>Usamos IA como apoio de pesquisa e revisão. Todo texto passa por edição humana antes de publicar.</p><h2>Correção</h2><p>Erro apontado com o trecho indicado é analisado, e a correção sai datada.</p>'),
 'saudeemalta': ('Política Editorial',
  'Como o Saúde em Alta trata planta, chá e suplemento, o que exige antes de publicar e o que declara sobre o uso de inteligência artificial.',
  '<p>Esta página descreve o critério do <strong>Saúde em Alta</strong> para publicar sobre planta, chá, alimento e suplemento.</p><h2>Os quatro itens obrigatórios</h2><p>Nenhuma planta é publicada sem para que serve, quanto usar, por quanto tempo e qual interação é conhecida. Faltando um deles, o texto não sai.</p><h2>Uso popular é dito como tal</h2><p>Quando não há pesquisa por trás, o texto escreve que se trata de uso tradicional. Apresentar tradição como evidência é o erro mais comum do nosso assunto, e aqui ele é tratado como erro.</p><h2>Interação com medicação</h2><p>Toda ficha traz a interação conhecida, porque é ali que o assunto deixa de ser inofensivo. Onde a informação não existe, o texto declara que não existe.</p><h2>Limite claro</h2><p>Nada aqui substitui consulta, e nenhum texto orienta a suspender remédio prescrito.</p><h2>Conteúdo pago</h2><p>Publicação paga é identificada no próprio texto, e anunciante não escolhe pauta.</p><h2>Inteligência artificial</h2><p>IA é apoio de pesquisa e revisão. A edição é humana e a responsabilidade é da redação.</p><h2>Correção</h2><p>Apontamento com o trecho indicado é analisado, e a correção sai com a data à vista.</p>'),
 'revistatopsaude': ('Política Editorial',
  'Como a Revista Top Saúde apura, cita fonte, trata promessa de resultado e declara o uso de inteligência artificial.',
  '<p>Esta página descreve como a <strong>Revista Top Saúde</strong> apura, escreve e corrige a reportagem que publica.</p><h2>Reportagem em ordem</h2><p>Cada pauta segue a mesma sequência: o que se sabe, o que está em disputa e o que ainda não tem resposta. A terceira parte não é opcional.</p><h2>Fonte no parágrafo</h2><p>O dado aparece com o ano da medição e a origem dita no meio do texto. Bloco de referências no fim não substitui a citação onde o número é usado.</p><h2>Promessa de resultado</h2><p>Cosmético, dieta e procedimento só entram com o ativo, o mecanismo e a faixa de tempo. Prazo em número exato de dias não é publicado, porque não existe.</p><h2>Limite claro</h2><p>Nada aqui substitui consulta médica, e nenhuma reportagem indica interromper tratamento.</p><h2>Conteúdo pago</h2><p>Publicação paga é identificada no próprio texto, e anunciante não revisa matéria.</p><h2>Inteligência artificial</h2><p>IA é usada como apoio de pesquisa e de revisão. Toda reportagem passa por edição humana.</p><h2>Correção</h2><p>Erro apontado com indicação do trecho é analisado, e o texto corrigido sai datado.</p>'),
 'matogrossosaude': ('Política Editorial',
  'Como o Mato Grosso Saúde cobre alerta sanitário, escreve guia de medicamento e declara o uso de inteligência artificial.',
  '<p>Esta página descreve como o <strong>Mato Grosso Saúde</strong> apura e publica.</p><h2>Alerta sanitário</h2><p>Notícia de recolhimento ou de proibição sai com o lote, a marca e a orientação para quem já comprou. Sem esses três itens ela não é publicada, porque vira susto sem utilidade.</p><h2>Guia de medicamento</h2><p>As páginas de dose e horário trazem a orientação geral de bula e de órgão oficial, dizem que é orientação geral e indicam quando é preciso falar com quem receitou. Nenhuma delas sugere alterar dose por conta própria.</p><h2>Fonte</h2><p>Decisão de agência reguladora sai do texto oficial publicado, e não da notícia sobre ele.</p><h2>Limite claro</h2><p>Nada aqui substitui prescrição, e nenhum texto orienta a interromper tratamento.</p><h2>Conteúdo pago</h2><p>Publicação paga é identificada no próprio texto, e anunciante não escolhe pauta.</p><h2>Inteligência artificial</h2><p>IA é apoio de pesquisa e revisão. A edição é humana e a responsabilidade é da redação.</p><h2>Correção</h2><p>Apontamento com o trecho indicado é analisado, e a correção sai com a data declarada.</p>'),
}

EQUIPE_ABRE = {
 'saudeacessivel': '<p>O <strong>Saúde Acessível</strong> trabalha em duas frentes, e a assinatura de cada texto leva para a página de quem responde por ela.</p>',
 'saudicas': '<p>O <strong>Saúde Dicas</strong> se divide em duas frentes, e cada texto leva a assinatura de quem responde pelo assunto.</p>',
 'saudeemalta': '<p>O <strong>Saúde em Alta</strong> trabalha em três frentes, e a assinatura de cada texto leva para a página de quem responde por ela.</p>',
 'revistatopsaude': '<p>A <strong>Revista Top Saúde</strong> se organiza em duas frentes de reportagem, e cada texto leva a assinatura de quem responde pela pauta.</p>',
 'matogrossosaude': '<p>O <strong>Mato Grosso Saúde</strong> tem duas frentes, uma de serviço e uma de notícia, e cada texto leva a assinatura de quem responde por ela.</p>',
}
EQUIPE_FECHA = ('<h2>Como falar com a redação</h2><p>Sugestão de pauta, correção ou '
                'dúvida sobre um texto: use a <a href="/contato/">página de contato</a>. '
                'Correção pedida com indicação do trecho é analisada e, quando procede, '
                'o texto é atualizado com a data da alteração à vista.</p>')

cfg = json.load(io.open(CFG, encoding='utf-8'))
mud = 0
for s in cfg['sites']:
    if s['slug'] not in ABOUT:
        continue
    eq = s.get('equipe') or []
    paginas = []
    for e in eq:
        paginas.append({'slug': 'autor/' + e['slug'], 'title': e['nome'],
                        'desc': e['lead'], 'content': e['corpo'], 'inFooter': False})
    corpo = EQUIPE_ABRE[s['slug']]
    for e in eq:
        corpo += '<h2>%s</h2><p>%s Responde <a href="/autor/%s/">%s</a>.</p>' % (
            e['editoria'], e['lead'], e['slug'], e['nome'])
    corpo += EQUIPE_FECHA
    paginas.append({'slug': 'equipe', 'title': 'Equipe',
                    'desc': 'Quem escreve no %s, o assunto do qual cada um dá conta e o '
                            'caminho para sugerir pauta ou apontar um erro no texto.'
                            % s['name'],
                    'content': corpo, 'inFooter': True})
    t, d, c = POLITICA[s['slug']]
    paginas.append({'slug': 'politica-editorial', 'title': t, 'desc': d,
                    'content': c, 'inFooter': True})
    s['extraPages'] = paginas
    s['about'] = ABOUT[s['slug']]
    mud += 1
    print('  %-18s %d pagina(s) de autor + equipe + politica | about com %d bytes'
          % (s['slug'], len(eq), len(s['about'])))

if APLICA:
    shutil.copyfile(CFG, CFG + '.bak-editorial-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(CFG, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(cfg, ensure_ascii=False, indent=1))
    print('  gravado. %d portais.' % mud)
else:
    print('  ensaio. rode com --aplica.')
