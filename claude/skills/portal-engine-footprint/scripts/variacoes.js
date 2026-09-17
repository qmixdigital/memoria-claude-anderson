'use strict';
// ---------- variacoes por portal (anti-footprint) ----------
// A auditoria de 17/09/2026 nos 104 portais achou texto IDENTICO em toda a
// rede nas paginas de privacidade, termos, contato e quem-somos, no 404, no
// 410 e no robots.txt, e a mesma forma de JSON-LD em todos. Sao os sinais que
// uma ferramenta de deteccao compara primeiro, porque nao dependem de layout.
// Aqui cada trecho tem varias redacoes e a escolha e estavel por portal (hash
// do slug com uma marca por trecho), como ja faz o vocabulario do render.js.
// Sem aleatoriedade: o mesmo portal sai sempre igual, e portais diferentes
// combinam trechos diferentes. Sem travessao em lugar nenhum.

function _h(site, marca) {
  let h = 2166136261;
  const s = String((site && (site.slug || site.domain)) || '') + '#' + marca;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// escolhe um item da lista, estavel por portal e por marca
function _um(site, marca, lista) { return lista[_h(site, marca) % lista.length]; }
// embaralha uma lista, estavel por portal
function _mistura(site, marca, lista) {
  const a = lista.slice();
  let h = _h(site, marca);
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ i, 16777619) >>> 0;
    const j = h % (i + 1);
    const x = a[i]; a[i] = a[j]; a[j] = x;
  }
  return a;
}
function _t(s, v) { return s.replace(/\{n\}/g, v.n).replace(/\{de\}/g, v.de); }

// ===================== quem somos =====================
const QS = {
  abre: [
    '<p>O <strong>{n}</strong> é um portal de notícias e conteúdos atualizados sobre os assuntos que mais interessam aos nossos leitores. Reunimos informação de leitura agradável e confiável para informar e inspirar.</p>',
    '<p>O <strong>{n}</strong> publica notícias, análises e guias sobre os temas que fazem parte do dia a dia de quem nos lê. A ideia é simples: explicar bem, sem enrolação, o que importa saber.</p>',
    '<p>Este é o <strong>{n}</strong>, um site de conteúdo feito para quem quer entender os assuntos com calma e sem ruído. Publicamos textos apurados, escritos em português claro, para leitores de todo o país.</p>',
    '<p>O <strong>{n}</strong> nasceu para reunir, em um só lugar, informação útil e bem escrita sobre os temas que acompanhamos. Cada texto passa por revisão antes de ir ao ar.</p>',
    '<p>Bem-vindo ao <strong>{n}</strong>. Aqui você encontra reportagens, explicações e listas sobre os assuntos que acompanhamos de perto, sempre com linguagem direta e fontes indicadas.</p>',
    '<p>O <strong>{n}</strong> é uma publicação digital dedicada a informar com clareza. Selecionamos pautas, apuramos os fatos e escrevemos pensando em quem tem pouco tempo e quer entender o essencial.</p>',
    '<p>Quem chega ao <strong>{n}</strong> encontra conteúdo produzido com cuidado sobre os temas da nossa cobertura. Preferimos textos completos a manchetes vazias, e revisamos o que publicamos.</p>',
  ],
  blocos: {
    proposta: {
      t: ['Nossa proposta', 'O que nos move', 'Por que existimos', 'Nossa missão', 'A ideia por trás do site', 'No que acreditamos'],
      p: [
        '<p>Acreditamos que informação de qualidade aproxima pessoas de ideias e novidades relevantes. Por isso publicamos textos claros, bem apurados e pensados para o leitor brasileiro.</p>',
        '<p>Informação boa é a que se entende na primeira leitura. Escrevemos para explicar, não para impressionar, e cada matéria traz o contexto necessário para quem chega ao assunto agora.</p>',
        '<p>Queremos ser uma referência de leitura tranquila: sem sensacionalismo, sem clickbait e com respeito ao tempo de quem nos lê.</p>',
        '<p>Nossa proposta é cobrir os temas do site com profundidade suficiente para ser útil e linguagem simples o bastante para qualquer pessoa acompanhar.</p>',
        '<p>Partimos de uma pergunta em cada pauta: o que o leitor precisa saber para decidir melhor? A resposta orienta o texto do começo ao fim.</p>',
        '<p>Existimos para transformar informação dispersa em conteúdo organizado, checado e fácil de consultar quando você precisar.</p>',
      ],
    },
    encontra: {
      t: ['O que você encontra aqui', 'O que publicamos', 'Nossas editorias', 'Tipos de conteúdo', 'O que cobrimos', 'Conteúdo do site'],
      p: [
        '<p>Notícias, reportagens e artigos com curadoria e linguagem acessível, atualizados ao longo do dia.</p>',
        '<p>Reportagens, guias explicativos, listas e respostas para as dúvidas mais comuns de cada tema, organizados por editoria para facilitar a navegação.</p>',
        '<p>Textos informativos, análises e conteúdos de serviço que ajudam a entender um assunto ou a tomar uma decisão prática. Tudo fica organizado por editoria e por data.</p>',
        '<p>Notícias do dia, matérias de contexto e artigos permanentes que continuam úteis meses depois de publicados. As editorias no menu mostram os temas que acompanhamos.</p>',
        '<p>Conteúdo escrito para ser lido até o fim: reportagens, explicadores, perguntas e respostas e seleções de dicas, todos revisados antes da publicação.</p>',
        '<p>Cobrimos os temas listados nas editorias com matérias curtas para o dia a dia e textos mais longos quando o assunto pede aprofundamento.</p>',
      ],
    },
    compromisso: {
      t: ['Compromisso editorial', 'Como trabalhamos', 'Nosso compromisso', 'Critérios editoriais', 'Como produzimos o conteúdo', 'Apuração e revisão'],
      p: [
        '<p>Prezamos por precisão, respeito ao leitor e transparência. Nosso conteúdo é revisado e atualizado sempre que necessário. Quer falar com a gente? Acesse a nossa página de <a href="/contato/">contato</a>.</p>',
        '<p>Toda matéria passa por revisão antes de ir ao ar e é corrigida assim que um erro é identificado. Encontrou algo impreciso? Escreva pela página de <a href="/contato/">contato</a> e avisamos quando o ajuste for feito.</p>',
        '<p>Trabalhamos com fontes identificáveis, revisão de texto e atualização das matérias que envelhecem. Sugestões e correções são bem-vindas pelo nosso <a href="/contato/">canal de contato</a>.</p>',
        '<p>Nosso compromisso é com o leitor: informação checada, linguagem sem jargão e correção transparente quando erramos. Para falar com a equipe, use a página de <a href="/contato/">contato</a>.</p>',
        '<p>Separamos opinião de informação, indicamos as fontes usadas e mantemos as matérias atualizadas. Dúvidas, pautas e críticas chegam pelo <a href="/contato/">formulário de contato</a>.</p>',
        '<p>Publicar rápido nunca vale mais do que publicar certo. Revisamos antes de publicar e corrigimos depois, quando necessário. Fale com a redação pela página de <a href="/contato/">contato</a>.</p>',
      ],
    },
    leitor: {
      t: ['Para quem escrevemos', 'Nosso leitor', 'Quem nos lê', 'Público do site'],
      p: [
        '<p>Escrevemos para quem quer se informar sem precisar de conhecimento prévio. Termos técnicos aparecem explicados e os textos vão direto ao ponto.</p>',
        '<p>Nosso público é o leitor curioso, que abre uma matéria para entender um assunto e espera sair com uma resposta. É para ele que organizamos cada página.</p>',
        '<p>Pensamos em quem lê pelo celular, no intervalo, e precisa entender o essencial em poucos minutos. Por isso os textos têm subtítulos, resumo e linguagem simples.</p>',
        '<p>Leitores de todas as regiões do Brasil acompanham o site. Escrevemos em português claro, com exemplos do cotidiano e sem pressupor formação na área.</p>',
        '<p>Falamos com o leitor comum, não com o especialista. Quando um tema exige detalhe técnico, ele vem explicado em seguida, nunca dado como óbvio.</p>',
      ],
    },
    independencia: {
      t: ['Independência e publicidade', 'Publicidade no site', 'Anúncios e conteúdo', 'Como o site se mantém'],
      p: [
        '<p>O site pode exibir anúncios, e eles não interferem nas pautas nem nos textos. Conteúdo publicitário, quando existe, é identificado como tal.</p>',
        '<p>A receita vem de publicidade exibida nas páginas. Anunciante não escolhe pauta, título ou ângulo de matéria, e material patrocinado é sempre sinalizado.</p>',
        '<p>Mantemos o site com anúncios, que aparecem separados do conteúdo editorial. Nenhum texto é escrito para agradar anunciante.</p>',
        '<p>Anúncios ajudam a pagar a operação e ficam claramente separados do conteúdo. Quando um texto é patrocinado, isso vem escrito no início.</p>',
        '<p>A publicidade sustenta a publicação sem participar dela: quem anuncia não lê a matéria antes de sair nem opina sobre o que publicamos.</p>',
      ],
    },
  },
};

// ===================== contato =====================
const CT = {
  abre: [
    '<p>Quer falar com a redação do <strong>{n}</strong>? Envie sua mensagem pelo formulário abaixo: sugestões, dúvidas, correções ou parcerias. Respondemos assim que possível. Antes de escrever, vale conhecer <a href="/quem-somos/">quem faz o {n}</a> e como a redação trabalha.</p>',
    '<p>Este é o canal direto com a equipe do <strong>{n}</strong>. Use o formulário para sugerir uma pauta, apontar um erro, tirar uma dúvida ou propor uma parceria. As mensagens são lidas em dias úteis e respondidas por e-mail. Para saber mais sobre a equipe, veja a página <a href="/quem-somos/">sobre o {n}</a>.</p>',
    '<p>Encontrou um erro, tem uma sugestão ou quer conversar sobre publicidade? Preencha os campos abaixo e a mensagem chega à redação do <strong>{n}</strong>. Retornamos pelo e-mail informado, normalmente em até dois dias úteis. Conheça também <a href="/quem-somos/">quem somos</a>.</p>',
    '<p>A redação do <strong>{n}</strong> recebe pautas, correções, dúvidas e propostas comerciais por este formulário. Escreva com o máximo de detalhe possível, inclusive o link da matéria, se for o caso. Antes de enviar, talvez ajude ler <a href="/quem-somos/">como o {n} funciona</a>.</p>',
    '<p>Fale com a gente. O formulário abaixo é o caminho mais rápido para chegar à equipe do <strong>{n}</strong>, seja para corrigir uma informação, indicar um assunto ou falar sobre parceria. Respondemos a todas as mensagens que trazem um e-mail válido. Saiba mais sobre <a href="/quem-somos/">a equipe {de}</a>.</p>',
    '<p>Sua mensagem é bem-vinda. Correções são prioridade e costumam ser respondidas no mesmo dia; pautas e parcerias, em alguns dias úteis. Preencha o formulário e a equipe do <strong>{n}</strong> retorna pelo e-mail informado. A página <a href="/quem-somos/">quem somos</a> explica como trabalhamos.</p>',
    '<p>Precisa falar com o <strong>{n}</strong>? Este formulário vai direto para a redação. Aceitamos sugestões de tema, pedidos de correção, dúvidas sobre o conteúdo e contato comercial. Leia sobre <a href="/quem-somos/">quem faz o site</a> antes de escrever, se quiser conhecer nossos critérios.</p>',
  ],
  nome: ['Nome', 'Seu nome', 'Como devemos chamá-lo', 'Nome completo', 'Quem escreve'],
  email: ['E-mail', 'Seu e-mail', 'E-mail para resposta', 'Endereço de e-mail', 'E-mail de contato'],
  assunto: ['Assunto', 'Tema da mensagem', 'Sobre o que é', 'Assunto (opcional)', 'Motivo do contato'],
  msg: ['Mensagem', 'Sua mensagem', 'Escreva aqui', 'Texto da mensagem', 'O que você quer dizer'],
  botao: ['Enviar mensagem', 'Enviar', 'Mandar mensagem', 'Enviar para a redação', 'Enviar agora', 'Falar com a redação'],
  enviando: ['Enviando...', 'Enviando', 'Um momento...', 'Aguarde...', 'Mandando...'],
  ok: ['Mensagem enviada! Obrigado pelo contato.', 'Recebemos sua mensagem. Obrigado!', 'Enviado. Responderemos em breve.', 'Pronto, sua mensagem chegou à redação.', 'Mensagem recebida. Retornamos pelo e-mail informado.'],
  erro: ['Não foi possível enviar. Tente novamente.', 'Algo deu errado. Tente mais uma vez.', 'O envio falhou. Confira os campos e tente de novo.', 'Não conseguimos enviar agora. Tente novamente em instantes.'],
  conexao: ['Erro de conexão. Tente novamente.', 'Sem conexão no momento. Tente de novo.', 'Falha de rede. Tente novamente em instantes.', 'A conexão caiu. Tente mais uma vez.'],
};

// ===================== privacidade =====================
const PV = {
  abre: [
    '<p>O {n} respeita a sua privacidade e está comprometido em proteger os dados pessoais dos visitantes, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).</p>',
    '<p>Esta página explica quais dados o {n} coleta, para que os usa e como você pode exercer seus direitos. O tratamento segue a Lei Geral de Proteção de Dados Pessoais, a LGPD (Lei nº 13.709/2018).</p>',
    '<p>Ao navegar no {n} você compartilha algumas informações com o site. Aqui descrevemos, em linguagem direta, o que é coletado, por quê e por quanto tempo, conforme a LGPD (Lei nº 13.709/2018).</p>',
    '<p>Levamos a sério os dados de quem nos visita. Este aviso descreve as práticas de privacidade do {n} e os direitos garantidos pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>',
    '<p>O {n} trata dados pessoais apenas no que é necessário para o site funcionar, medir audiência e exibir publicidade. As regras abaixo seguem a LGPD (Lei nº 13.709/2018) e valem para todas as páginas do site.</p>',
    '<p>Esta política vale para todo o {n}. Ela explica o que registramos quando você acessa o site, com quem essas informações podem ser compartilhadas e como pedir acesso, correção ou exclusão, nos termos da LGPD (Lei nº 13.709/2018).</p>',
  ],
  blocos: {
    coleta: {
      t: ['Dados que coletamos', 'O que registramos', 'Informações coletadas', 'Dados de navegação', 'Quais dados tratamos'],
      p: [
        '<p>Ao navegar no {n}, podemos coletar automaticamente informações como endereço IP, tipo de navegador, páginas visitadas, tempo de permanência e dados de cookies. Não solicitamos dados pessoais identificáveis para a simples leitura do conteúdo.</p>',
        '<p>Para ler o {n} não é preciso cadastro. O que fica registrado é o que qualquer acesso a um site gera: endereço IP, navegador e sistema usados, páginas abertas, horário da visita e cookies técnicos.</p>',
        '<p>Registramos dados técnicos do acesso (IP, navegador, dispositivo, páginas visitadas e duração da visita) de forma automática. Dados como nome e e-mail só chegam até nós se você os enviar pelo formulário de contato.</p>',
        '<p>A leitura é livre e anônima. O servidor e as ferramentas de medição guardam informações técnicas da visita, como endereço IP, tipo de aparelho, página de origem e páginas vistas. Nada disso identifica você pelo nome.</p>',
        '<p>Coletamos apenas o necessário para o site funcionar e para entender a audiência: endereço IP, dados do navegador, páginas acessadas e cookies. Informações pessoais identificáveis só são tratadas quando você mesmo as fornece.</p>',
        '<p>Durante a navegação ficam registrados o endereço IP, o navegador, o dispositivo, as páginas visitadas e o tempo em cada uma. Esses dados são técnicos e usados de forma agregada; não pedimos cadastro para ler o conteúdo.</p>',
      ],
    },
    cookies: {
      t: ['Cookies e tecnologias semelhantes', 'Uso de cookies', 'Cookies', 'Como usamos cookies', 'Cookies e armazenamento local'],
      p: [
        '<p>Utilizamos cookies para melhorar a experiência de navegação, lembrar preferências e gerar estatísticas de acesso. Você pode gerenciar ou desativar os cookies nas configurações do seu navegador.</p>',
        '<p>Cookies são pequenos arquivos gravados no seu navegador. Usamos os essenciais para o site funcionar e, com o seu aceite no aviso exibido na primeira visita, os de medição de audiência e de conteúdo de terceiros. A escolha pode ser alterada limpando os cookies do navegador.</p>',
        '<p>O site usa cookies técnicos, que não dependem de consentimento, e cookies de estatística e publicidade, que só entram se você autorizar no banner. É possível apagar ou bloquear cookies a qualquer momento nas configurações do navegador.</p>',
        '<p>Guardamos sua escolha sobre cookies em um cookie próprio, válido por um ano. Os demais cookies servem para medir audiência e exibir anúncios, e só são ativados após o aceite. O navegador permite bloqueá-los ou removê-los quando quiser.</p>',
        '<p>Há dois grupos de cookies no {n}: os necessários, sem os quais o site não funciona direito, e os opcionais, de análise e publicidade, que dependem da sua permissão. Recusar os opcionais não impede a leitura de nenhuma página.</p>',
        '<p>Empregamos cookies e armazenamento local para lembrar preferências, contar visitas e viabilizar anúncios. O aviso exibido na primeira visita permite aceitar todos ou manter só os necessários, e a decisão pode ser revista limpando os dados do site no navegador.</p>',
      ],
    },
    analise: {
      t: ['Ferramentas de análise', 'Medição de audiência', 'Estatísticas de acesso', 'Análise de tráfego', 'Métricas de uso'],
      p: [
        '<p>Podemos utilizar serviços de análise de tráfego para entender como os visitantes interagem com o site. Esses serviços podem coletar dados de forma anonimizada.</p>',
        '<p>Para saber quais matérias são mais lidas e de onde vêm os acessos, usamos ferramentas de estatística. Os relatórios são agregados e não identificam pessoas.</p>',
        '<p>Contamos visitas e páginas vistas com serviços de medição de audiência. Os dados chegam a nós de forma resumida, por página e por período, sem identificar leitores individualmente.</p>',
        '<p>Ferramentas de análise nos mostram o volume de acessos, as páginas mais visitadas e o tipo de dispositivo usado. Esse tratamento é estatístico e serve para melhorar o conteúdo e o desempenho do site.</p>',
        '<p>Utilizamos serviços de terceiros para medir a audiência. Eles podem gravar cookies e registrar dados técnicos do acesso, sempre de forma anonimizada e apenas com o seu aceite quando a lei exige.</p>',
        '<p>A audiência do site é medida por ferramentas de estatística que trabalham com dados agregados. Não cruzamos esses registros com nome, e-mail ou qualquer outro dado que identifique você.</p>',
      ],
    },
    anuncios: {
      t: ['Publicidade de terceiros', 'Anúncios', 'Redes de publicidade', 'Publicidade e anunciantes', 'Anúncios exibidos no site'],
      p: [
        '<p>O {n} pode exibir anúncios veiculados por redes de publicidade parceiras. Essas redes utilizam cookies e identificadores próprios para medir audiência e selecionar o anúncio exibido, e esse tratamento é feito por elas, sob as políticas delas. Você pode desativar a personalização de anúncios do Google em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a> e gerenciar cookies nas configurações do seu navegador. A recusa não impede a leitura do conteúdo.</p>',
        '<p>Os anúncios exibidos no {n} são servidos por redes de publicidade, como o Google, que usam cookies e identificadores próprios para escolher o anúncio e medir resultados. Esse tratamento segue as políticas dessas redes. A personalização pode ser desligada em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a>, e o site continua legível sem ela.</p>',
        '<p>Para se manter, o site exibe publicidade de redes parceiras. Elas podem gravar cookies e usar identificadores para selecionar anúncios e contabilizar exibições, de acordo com as próprias políticas de privacidade. Quem preferir anúncios não personalizados pode ajustar isso em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a> ou bloquear cookies no navegador.</p>',
        '<p>Redes de publicidade parceiras veiculam anúncios nas páginas do {n} e, para isso, podem usar cookies e identificadores de dispositivo. Nós não temos acesso aos dados que elas coletam; o tratamento é responsabilidade de cada rede. É possível desativar anúncios personalizados do Google em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a>.</p>',
        '<p>Anúncios são exibidos por terceiros, principalmente pelo Google, que aplica cookies e identificadores próprios para escolher o anúncio e medir cliques. Esses parceiros seguem as políticas deles, não a nossa. A personalização pode ser desligada em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a>, e recusar cookies não bloqueia o acesso ao conteúdo.</p>',
        '<p>O {n} exibe publicidade servida por redes parceiras. Elas utilizam cookies e identificadores para medir audiência e escolher o anúncio, dentro das políticas de privacidade de cada uma. Você controla a personalização de anúncios do Google em <a href="https://adssettings.google.com/" rel="nofollow noopener" target="_blank">adssettings.google.com</a> e os cookies nas configurações do navegador.</p>',
      ],
    },
    compartilha: {
      t: ['Compartilhamento de dados', 'Com quem compartilhamos', 'Transferência de dados', 'Compartilhamento com terceiros', 'Quem tem acesso aos dados'],
      p: [
        '<p>O {n} não vende nem aluga seus dados pessoais. Informações podem ser compartilhadas apenas com prestadores de serviço essenciais à operação do site ou quando exigido por lei.</p>',
        '<p>Não vendemos dados de leitores. O que é registrado pode ser acessado apenas por fornecedores que mantêm o site no ar (hospedagem, medição, publicidade) e por autoridades, quando houver obrigação legal.</p>',
        '<p>Dados pessoais só saem do {n} em duas situações: para prestadores de serviço que operam a infraestrutura e as ferramentas do site, ou por determinação legal. Nunca são comercializados.</p>',
        '<p>Compartilhamos informações apenas com os serviços necessários para publicar o site e medir sua audiência, e com autoridades quando a lei obrigar. Não há venda, aluguel ou troca de dados de visitantes.</p>',
        '<p>Os dados de navegação ficam com o {n} e com os fornecedores que mantêm o site funcionando, cada um responsável pela própria política. Fora isso, só entregamos informação a terceiros por exigência legal.</p>',
        '<p>Nenhum dado de leitor é vendido. O acesso é restrito aos prestadores de serviço indispensáveis à operação do site, sob contrato, e a autoridades competentes quando houver ordem legal.</p>',
      ],
    },
    direitos: {
      t: ['Seus direitos (LGPD)', 'Direitos do titular', 'O que você pode pedir', 'Seus direitos sobre os dados', 'Direitos garantidos pela LGPD'],
      p: [
        '<p>Você tem o direito de confirmar a existência de tratamento, acessar, corrigir, anonimizar, portar ou solicitar a exclusão dos seus dados, além de revogar o consentimento a qualquer momento.</p>',
        '<p>A LGPD garante a você o direito de saber se tratamos seus dados, acessá-los, corrigi-los, pedir a anonimização ou a exclusão e retirar o consentimento dado. Os pedidos são atendidos pelo canal de contato do site.</p>',
        '<p>Como titular dos dados, você pode pedir acesso ao que temos sobre você, correção de informações incompletas, exclusão, portabilidade e informação sobre com quem os dados foram compartilhados. Também pode revogar o consentimento quando quiser.</p>',
        '<p>Você pode, a qualquer momento, solicitar acesso, correção, anonimização, bloqueio ou eliminação dos dados, além de se opor a tratamentos feitos com base no consentimento. Basta escrever pela página de contato.</p>',
        '<p>Seus direitos incluem confirmar o tratamento, acessar e corrigir dados, pedir exclusão ou anonimização, solicitar portabilidade e revogar consentimentos. Respondemos aos pedidos nos prazos da lei.</p>',
        '<p>Nos termos da LGPD, o leitor pode pedir a confirmação do tratamento, o acesso aos dados, a correção, a exclusão, a portabilidade e a revogação do consentimento. O pedido é feito pelos canais de contato do {n}.</p>',
      ],
    },
    seguranca: {
      t: ['Segurança', 'Proteção dos dados', 'Medidas de segurança', 'Como protegemos os dados', 'Segurança da informação'],
      p: [
        '<p>Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou alteração.</p>',
        '<p>O site é servido por conexão criptografada (HTTPS) e os dados de contato ficam em ambiente com acesso restrito. Revisamos periodicamente as configurações de segurança.</p>',
        '<p>Usamos criptografia na transmissão, controle de acesso aos sistemas e fornecedores com práticas reconhecidas de segurança. Nenhum sistema é infalível, mas o risco é tratado com seriedade.</p>',
        '<p>As informações trafegam por HTTPS e ficam armazenadas em serviços com controle de acesso. Apenas a equipe responsável pela operação do site alcança os dados enviados pelo formulário de contato.</p>',
        '<p>Protegemos os dados com medidas proporcionais ao risco: conexão segura, acesso restrito e fornecedores que seguem boas práticas de segurança da informação.</p>',
        '<p>Aplicamos controles técnicos e de processo para evitar acesso indevido, vazamento ou alteração dos dados. Em caso de incidente relevante, os afetados e a autoridade competente são comunicados conforme a lei.</p>',
      ],
    },
    retencao: {
      t: ['Retenção', 'Por quanto tempo guardamos', 'Prazo de armazenamento', 'Tempo de guarda dos dados', 'Retenção e descarte'],
      p: [
        '<p>Os dados são mantidos apenas pelo tempo necessário às finalidades descritas ou conforme exigência legal.</p>',
        '<p>Registros de acesso são mantidos pelo prazo exigido pelo Marco Civil da Internet; mensagens enviadas pelo contato ficam guardadas enquanto o atendimento durar. Depois disso, os dados são apagados ou anonimizados.</p>',
        '<p>Guardamos cada dado apenas enquanto ele serve à finalidade para a qual foi coletado ou enquanto a lei exigir. Passado esse prazo, o registro é excluído.</p>',
        '<p>Não acumulamos dados sem necessidade. Informações técnicas de acesso são descartadas após o prazo legal, e os contatos recebidos são apagados depois de resolvidos.</p>',
        '<p>O tempo de guarda depende da finalidade: logs de acesso seguem o prazo legal, cookies têm validade própria informada no navegador e mensagens de contato ficam pelo tempo do atendimento.</p>',
        '<p>Mantemos os dados pelo período necessário ao que foi descrito nesta política e ao cumprimento de obrigações legais. Ao fim do prazo, eliminamos ou anonimizamos os registros.</p>',
      ],
    },
    alteracoes: {
      t: ['Alterações nesta política', 'Atualizações deste aviso', 'Mudanças na política', 'Revisões desta página', 'Atualizações'],
      p: [
        '<p>Esta Política de Privacidade pode ser atualizada periodicamente. A versão vigente estará sempre disponível nesta página.</p>',
        '<p>Este texto pode mudar quando o site adotar novas ferramentas ou quando a legislação for atualizada. A data no topo da página indica a última revisão.</p>',
        '<p>Revisamos este aviso sempre que uma prática do site muda. A versão publicada aqui é a que vale; recomendamos consultá-la de tempos em tempos.</p>',
        '<p>Podemos atualizar esta política a qualquer momento, sem aviso individual. A data de atualização fica visível na página e a versão mais recente substitui as anteriores.</p>',
        '<p>Mudanças relevantes nas práticas de privacidade são refletidas aqui. Continuar usando o site após uma atualização significa que você tomou conhecimento do novo texto.</p>',
        '<p>Este documento é revisado periodicamente. Ao publicar uma nova versão, atualizamos a data indicada na página; o texto em vigor é sempre o que está publicado aqui.</p>',
      ],
    },
    contato: {
      t: ['Contato', 'Dúvidas sobre privacidade', 'Como falar conosco', 'Canal para pedidos', 'Fale sobre seus dados'],
      p: [
        '<p>Em caso de dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato pelos canais oficiais do {n}.</p>',
        '<p>Pedidos de acesso, correção ou exclusão, e qualquer dúvida sobre este aviso, podem ser enviados pela <a href="/contato/">página de contato</a>. Respondemos pelo e-mail informado.</p>',
        '<p>Para exercer seus direitos ou perguntar sobre esta política, use o <a href="/contato/">formulário de contato</a> do site, informando o que deseja e um e-mail para retorno.</p>',
        '<p>Se algo nesta página não ficou claro, ou se você quer pedir a exclusão dos seus dados, escreva para a equipe pela <a href="/contato/">página de contato</a>.</p>',
        '<p>O canal para questões de privacidade é o <a href="/contato/">contato do {n}</a>. Identifique o assunto como "dados pessoais" para que o pedido seja tratado com prioridade.</p>',
        '<p>Dúvidas e solicitações sobre dados pessoais são recebidas pelo <a href="/contato/">formulário de contato</a>. Respondemos dentro dos prazos previstos na LGPD.</p>',
      ],
    },
  },
  fecha: [
    '<p>Este documento faz parte das políticas do {n}. Veja também os <a href="/termos-de-uso/">termos de uso do {n}</a>.</p>',
    '<p>Esta política se aplica junto com os <a href="/termos-de-uso/">termos de uso</a> do site.</p>',
    '<p>Leia também as <a href="/termos-de-uso/">condições de uso do {n}</a>, que completam este aviso.</p>',
    '<p>As regras de uso do site estão nos <a href="/termos-de-uso/">termos de uso</a>, que devem ser lidos em conjunto com esta política.</p>',
    '<p>Para as condições gerais de utilização do site, consulte os <a href="/termos-de-uso/">termos de uso do {n}</a>.</p>',
    '',
  ],
};

// ===================== termos =====================
const TM = {
  abre: [
    '<p>Ao acessar e utilizar o {n}, você concorda com os termos descritos abaixo. Caso não concorde, recomendamos que não utilize o site.</p>',
    '<p>Estes termos regulam o uso do {n}. Ao navegar pelo site você aceita as condições aqui descritas; se discordar de alguma delas, o melhor é não continuar a navegação.</p>',
    '<p>Bem-vindo ao {n}. O uso do site implica a aceitação das regras abaixo, escritas de forma direta para que qualquer leitor as entenda.</p>',
    '<p>Antes de usar o {n}, leia estas condições. Elas definem o que você pode fazer com o conteúdo, os limites de responsabilidade do site e a lei que se aplica.</p>',
    '<p>O acesso ao {n} é gratuito e está sujeito aos termos a seguir. A permanência no site significa concordância com eles.</p>',
    '<p>Este documento estabelece as condições de uso do {n}. Continuar navegando equivale a aceitar o que está escrito aqui.</p>',
  ],
  blocos: {
    uso: {
      t: ['Uso do site', 'Condições de uso', 'Uso permitido', 'Finalidade do conteúdo', 'Como usar o site'],
      p: [
        '<p>O conteúdo do {n} tem caráter informativo e jornalístico. O uso é permitido para fins pessoais e não comerciais, salvo autorização expressa.</p>',
        '<p>Tudo o que publicamos tem finalidade informativa. Você pode ler, compartilhar links e citar trechos com indicação da fonte; uso comercial depende de autorização prévia.</p>',
        '<p>O site existe para informar. Leitura, compartilhamento de links e citação com crédito são livres. Reproduzir páginas inteiras ou usar o material comercialmente exige nossa autorização.</p>',
        '<p>O acesso é livre para uso pessoal. Não é permitido copiar o conteúdo para outros sites, revendê-lo ou usá-lo em produto comercial sem combinação prévia com a redação.</p>',
        '<p>O conteúdo é oferecido para leitura e consulta pessoal. Qualquer uso além disso, especialmente reprodução em massa ou fins comerciais, precisa de autorização por escrito.</p>',
        '<p>Você pode usar o {n} para se informar, guardar links e compartilhar matérias nas redes. O uso automatizado para extrair conteúdo e a republicação sem crédito não são permitidos.</p>',
      ],
    },
    pi: {
      t: ['Propriedade intelectual', 'Direitos autorais', 'Direitos sobre o conteúdo', 'Marcas e conteúdo', 'Autoria e reprodução'],
      p: [
        '<p>Textos, imagens, marcas e demais materiais publicados são protegidos por direitos autorais. A reprodução total ou parcial sem autorização é proibida.</p>',
        '<p>Os textos, títulos, imagens e a marca do {n} pertencem ao site ou a quem os licenciou. Citar um trecho curto com link para a matéria é permitido; copiar o texto inteiro, não.</p>',
        '<p>O material publicado é protegido pela Lei de Direitos Autorais. Reprodução integral, tradução ou adaptação dependem de autorização; a citação com crédito e link é bem-vinda.</p>',
        '<p>Todo conteúdo do site, incluindo textos, fotos, ilustrações e logotipo, tem proteção legal. Republicar sem permissão, mesmo com crédito, não é autorizado.</p>',
        '<p>Os direitos sobre o que publicamos são do {n} ou de terceiros que nos cederam uso. É permitido compartilhar o link e citar trechos com fonte; a cópia do texto completo é proibida.</p>',
        '<p>Marcas, textos e imagens do site são protegidos por direito autoral e de propriedade industrial. Para reutilizar qualquer material, fale antes com a redação.</p>',
      ],
    },
    terceiros: {
      t: ['Conteúdo de terceiros e links', 'Links externos', 'Sites de terceiros', 'Links para outros sites', 'Conteúdo externo'],
      p: [
        '<p>O site pode conter links para páginas externas. Não nos responsabilizamos pelo conteúdo, políticas ou práticas de sites de terceiros.</p>',
        '<p>Algumas matérias apontam para sites de fora. Esses links são indicados como referência e não significam endosso; o conteúdo e as regras de privacidade de cada um são de responsabilidade dos respectivos donos.</p>',
        '<p>Links para outros sites aparecem quando ajudam o leitor a se aprofundar. Não controlamos essas páginas e não respondemos pelo que elas publicam ou pelos dados que coletam.</p>',
        '<p>O {n} pode incorporar vídeos, mapas e links de terceiros. Esses serviços têm políticas próprias, e o uso deles é regido pelas condições de cada fornecedor.</p>',
        '<p>Indicamos links externos como complemento ao texto. Ao clicar, você sai do {n} e passa a estar sujeito aos termos do site de destino, sobre o qual não temos controle.</p>',
        '<p>Referências a sites externos são informativas. Não garantimos a disponibilidade, a exatidão ou a segurança dessas páginas, nem respondemos por elas.</p>',
      ],
    },
    responsab: {
      t: ['Isenção de responsabilidade', 'Limitação de responsabilidade', 'Responsabilidade pelo conteúdo', 'Exatidão das informações', 'Limites do site'],
      p: [
        '<p>Empenhamo-nos para manter as informações corretas e atualizadas, mas não garantimos a ausência de erros. O {n} não se responsabiliza por decisões tomadas com base no conteúdo publicado.</p>',
        '<p>Apuramos com cuidado, mas erros acontecem e informações envelhecem. O conteúdo não substitui orientação profissional, e decisões tomadas a partir dele são de responsabilidade do leitor.</p>',
        '<p>Fazemos o possível para publicar informação correta e atual; ainda assim, não garantimos que todo texto esteja livre de imprecisões. O site não responde por prejuízos decorrentes do uso do conteúdo.</p>',
        '<p>As matérias têm caráter geral e informativo. Antes de tomar uma decisão de saúde, financeira, jurídica ou de qualquer área especializada, consulte um profissional. O {n} não se responsabiliza por escolhas feitas com base no site.</p>',
        '<p>Trabalhamos para manter o conteúdo preciso e revisamos o que está desatualizado, mas o site é oferecido como está, sem garantia de exatidão absoluta. O uso das informações é por conta e risco do leitor.</p>',
        '<p>Nenhum texto do site substitui atendimento profissional. Corrigimos erros assim que os identificamos, mas não respondemos por decisões tomadas exclusivamente com base no que publicamos.</p>',
      ],
    },
    alteracoes: {
      t: ['Alterações', 'Mudanças nestes termos', 'Atualização dos termos', 'Revisão das condições', 'Alterações nos termos'],
      p: [
        '<p>Estes Termos podem ser modificados a qualquer momento, sendo a versão atualizada publicada nesta página.</p>',
        '<p>Podemos alterar estas condições sem aviso prévio. A data de atualização aparece na página, e a versão publicada aqui é a que vale.</p>',
        '<p>Os termos são revisados de tempos em tempos. Ao continuar usando o site depois de uma mudança, você concorda com a nova redação.</p>',
        '<p>Reservamo-nos o direito de atualizar este documento sempre que necessário. Recomendamos conferir esta página periodicamente.</p>',
        '<p>Mudanças nestes termos entram em vigor na data da publicação, indicada no topo da página, e substituem as versões anteriores.</p>',
        '<p>Este texto pode ser atualizado a qualquer momento. A versão vigente é sempre a que está publicada nesta página.</p>',
      ],
    },
    lei: {
      t: ['Legislação aplicável', 'Lei e foro', 'Legislação e foro competente', 'Lei aplicável', 'Foro'],
      p: [
        '<p>Estes Termos são regidos pela legislação brasileira, elegendo-se o foro competente para dirimir eventuais conflitos.</p>',
        '<p>Aplica-se a lei brasileira a estes termos. Eventuais disputas serão resolvidas pelo foro competente no Brasil, com renúncia a qualquer outro.</p>',
        '<p>Este documento segue as leis do Brasil, em especial o Marco Civil da Internet, o Código de Defesa do Consumidor e a LGPD. Conflitos serão levados ao foro competente no país.</p>',
        '<p>A legislação brasileira rege estes termos. Questões não resolvidas de forma amigável serão decididas pela Justiça brasileira.</p>',
        '<p>Para qualquer controvérsia relacionada ao site vale a lei do Brasil, e o foro competente será o definido pela legislação aplicável.</p>',
        '<p>Estes termos são interpretados conforme a lei brasileira. Antes de qualquer medida judicial, incentivamos a solução pelo canal de contato do site.</p>',
      ],
    },
  },
  fecha: [
    '<p>Este documento faz parte das políticas do {n}. Veja também a <a href="/politica-de-privacidade/">política de privacidade do {n}</a>.</p>',
    '<p>Estes termos se completam com a <a href="/politica-de-privacidade/">política de privacidade</a> do site.</p>',
    '<p>Sobre dados pessoais e cookies, consulte o <a href="/politica-de-privacidade/">aviso de privacidade do {n}</a>.</p>',
    '<p>A forma como tratamos seus dados está descrita na <a href="/politica-de-privacidade/">política de privacidade</a>.</p>',
    '<p>Leia também a <a href="/politica-de-privacidade/">política de privacidade do {n}</a>, parte destas condições.</p>',
    '',
  ],
};

// monta uma pagina institucional: abertura, blocos (ordem, titulo e paragrafo por
// portal), numeracao opcional e fechamento. `fixos` sao blocos que precisam de
// posicao (primeiro/ultimos); `extra` entra depois do ultimo bloco livre.
function _pagina(site, v, def, marca, ordem, extra) {
  const numera = _h(site, marca + '#num') % 3 === 0;   // um terco dos portais numera as secoes
  const partes = [_t(_um(site, marca + '#abre', def.abre), v)];
  let i = 0;
  const chaves = ordem(_mistura(site, marca + '#ordem', Object.keys(def.blocos)));
  for (const k of chaves) {
    const b = def.blocos[k];
    i++;
    const titulo = _um(site, marca + '#t#' + k, b.t);
    partes.push('<h2>' + (numera ? i + '. ' : '') + titulo + '</h2>' + _t(_um(site, marca + '#p#' + k, b.p), v));
    if (extra && k === chaves[chaves.length - 3]) partes.push(extra);
  }
  if (def.fecha) partes.push(_t(_um(site, marca + '#fecha', def.fecha), v));
  return partes.filter(Boolean).join('\n');
}

function quemSomos(site, v) {
  // 3 dos 5 blocos, sempre com proposta ou compromisso presente
  return _pagina(site, v, QS, 'qs', (ks) => {
    const sel = ks.slice(0, 3);
    if (!sel.includes('compromisso') && !sel.includes('proposta')) sel[2] = 'compromisso';
    return sel;
  });
}
function privacidade(site, v, extraDiretorio) {
  return _pagina(site, v, PV, 'pv', (ks) => {
    // coleta primeiro; alteracoes e contato por ultimo, nesta ordem
    const meio = ks.filter(k => !['coleta', 'alteracoes', 'contato'].includes(k));
    return ['coleta'].concat(meio, ['alteracoes', 'contato']);
  }, extraDiretorio || '');
}
function termos(site, v) {
  return _pagina(site, v, TM, 'tm', (ks) => {
    const meio = ks.filter(k => !['uso', 'alteracoes', 'lei'].includes(k));
    return ['uso'].concat(meio, ['alteracoes', 'lei']);
  });
}
function contato(site, v) {
  const c = (k) => _um(site, 'ct#' + k, CT[k]);
  const js = "(function(){var f=document.getElementById('contato-form');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('button'),m=f.querySelector('.cform-msg'),t=b.textContent;b.disabled=true;b.textContent=" + JSON.stringify(c('enviando')) + ";fetch('/api/contato',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:f.nome.value,email:f.email.value,assunto:f.assunto.value,mensagem:f.mensagem.value})}).then(function(r){return r.json()}).then(function(j){m.hidden=false;if(j&&j.success){m.textContent=" + JSON.stringify(c('ok')) + ";m.className='cform-msg ok';f.reset();}else{m.textContent=(j&&j.message)||" + JSON.stringify(c('erro')) + ";m.className='cform-msg err';}}).catch(function(){m.hidden=false;m.textContent=" + JSON.stringify(c('conexao')) + ";m.className='cform-msg err';}).finally(function(){b.disabled=false;b.textContent=t;});});})();";
  return _t(c('abre'), v) + `
<form id="contato-form" class="cform" novalidate>
<label>${c('nome')}<input name="nome" type="text" required maxlength="120" autocomplete="name"></label>
<label>${c('email')}<input name="email" type="email" required maxlength="160" autocomplete="email"></label>
<label>${c('assunto')}<input name="assunto" type="text" maxlength="160"></label>
<label>${c('msg')}<textarea name="mensagem" rows="6" required maxlength="4000"></textarea></label>
<button type="submit">${c('botao')}</button>
<p class="cform-msg" hidden></p>
</form>
<script>${js}</script>`;
}

// ===================== 404 e 410 =====================
const NF = {
  404: {
    title: ['Página não encontrada', 'Essa página não existe', 'Não achamos essa página', 'Endereço não encontrado', 'Página inexistente', 'Nada por aqui', 'Esta página não está mais aqui', 'Link quebrado ou página movida'],
    p: ['A página que você procura pode ter sido movida ou não existe mais.', 'O endereço pode estar errado, ou a página foi retirada do ar. Use a busca ou volte para a capa.', 'Não encontramos nada neste endereço. Confira o link ou comece de novo pela página inicial.', 'Talvez o link tenha sido digitado errado, ou a matéria mudou de lugar. A capa e a busca ajudam a encontrar o que procura.', 'Esta URL não corresponde a nenhuma página do site. Volte à capa ou procure pelo assunto.', 'Não há conteúdo neste endereço. Se você chegou por um link, ele pode estar desatualizado.', 'A página pode ter sido removida ou nunca existiu com este endereço.'],
    link: ['Ir para a home {de}', 'Voltar para a capa {de}', 'Ir para a página inicial', 'Abrir a capa {de}', 'Voltar ao início', 'Ver as últimas notícias {de}', 'Ir para o início do site'],
    desc: ['A página que você procura não existe ou foi removida.', 'Endereço não encontrado no site.', 'Não há conteúdo neste endereço.', 'Página inexistente ou removida.'],
  },
  410: {
    title: ['Conteúdo removido', 'Esta página foi retirada do ar', 'Página removida em definitivo', 'Conteúdo não está mais disponível', 'Matéria retirada', 'Página descontinuada', 'Este endereço foi desativado', 'Conteúdo excluído'],
    p: ['Esta página foi removida em definitivo.', 'O conteúdo que existia neste endereço foi retirado e não voltará ao ar.', 'A página foi excluída do site de forma permanente. Os demais conteúdos continuam disponíveis na capa.', 'Este endereço já teve uma página, que foi removida em caráter definitivo.', 'A matéria que ficava aqui saiu do ar de forma permanente. Use a busca para encontrar outros textos sobre o assunto.', 'Removemos esta página e ela não será republicada.', 'O conteúdo deste endereço foi descontinuado e não está mais disponível.'],
    link: ['Ir para a página inicial', 'Voltar para a capa {de}', 'Ir para a home {de}', 'Ver as últimas publicações', 'Voltar ao início', 'Abrir a capa {de}', 'Ir para o início do site'],
    desc: ['Esta página foi removida em definitivo.', 'Conteúdo retirado do ar de forma permanente.', 'Página excluída do site.', 'Este endereço foi desativado.'],
  },
};
function naoEncontrado(site, v, codigo) {
  const d = NF[codigo] || NF[404];
  const m = 'nf' + codigo;
  return {
    title: _um(site, m + '#t', d.title),
    p: _t(_um(site, m + '#p', d.p), v),
    link: _t(_um(site, m + '#l', d.link), v),
    desc: _t(_um(site, m + '#d', d.desc), v),
  };
}

// ===================== robots.txt =====================
function robots(site, extras) {
  const base = site.baseUrl;
  const k = _h(site, 'robots') % 6;
  const ex = (extras || []).filter(Boolean);
  const semNews = ex.includes('SEM_NEWS');
  const sm = ['Sitemap: ' + base + '/sitemap.xml'].concat(semNews ? [] : ['Sitemap: ' + base + '/news-sitemap.xml'], ex.filter(x => x !== 'SEM_NEWS'));
  const ordem = _h(site, 'robots#ordem') % 2 ? sm : sm.slice().reverse();
  const linhas = [];
  if (k === 1) linhas.push('# ' + site.name);
  if (k === 4) linhas.push('# robots.txt');
  linhas.push('User-agent: *');
  if (k === 0 || k === 3) linhas.push('Allow: /');
  if (k === 2) linhas.push('Disallow:');
  if (k === 5) { linhas.push('Disallow: /busca/'); linhas.push('Allow: /'); }
  if (k === 3) linhas.push('');
  if (k === 1 || k === 4) { linhas.push('Disallow: /busca'); linhas.push(''); }
  linhas.push(...ordem);
  return linhas.join('\n') + '\n';
}

// ===================== JSON-LD: ordem das chaves =====================
// A forma (chaves e ordem) do JSON-LD saia identica na rede. O conteudo nao
// muda; so a ordem das chaves, estavel por portal. @context e @type ficam na
// frente para leitura humana e das ferramentas.
function ordenaLd(site, o, prof) {
  prof = prof || 0;
  if (Array.isArray(o)) return o.map(x => ordenaLd(site, x, prof + 1));
  if (!o || typeof o !== 'object') return o;
  const chaves = Object.keys(o);
  const frente = chaves.filter(k => k === '@context' || k === '@type');
  const resto = _mistura(site, 'ld#' + prof + '#' + chaves.length, chaves.filter(k => !frente.includes(k)));
  const r = {};
  for (const k of frente.concat(resto)) r[k] = ordenaLd(site, o[k], prof + 1);
  return r;
}

// ===================== fontes locais =====================
// fontes_locais.js baixa as fontes do Google para public/<pasta>/ e grava
// <raiz>/fontes.json. Se o manifesto cobre a googleUrl atual, o head linka o CSS
// local e nao fala com fonts.googleapis.com (igual nos 104 portais). Se nao
// cobre (tema trocou, script nao rodou), sai o bloco do Google como antes.
const fs = require('fs'), path = require('path');
const _fontesCache = new Map();
function fontes(site, googleUrl, esc, raiz) {
  const slug = String((site && site.slug) || '');
  const agora = Date.now();
  let m = _fontesCache.get(slug);
  if (!m || agora - m.em > 60000) {
    let dados = null;
    try { dados = JSON.parse(fs.readFileSync(path.join(raiz || '/srv/portais', slug, 'fontes.json'), 'utf8')); } catch (e) {}
    m = { em: agora, dados };
    _fontesCache.set(slug, m);
  }
  const d = m.dados;
  if (d && d.googleUrl === googleUrl && d.css) {
    const k = _h(site, 'fontes#modo') % 3;
    if (k === 0) return `<link rel="stylesheet" href="${esc(d.css)}">`;
    if (k === 1) return `<link rel="preload" as="style" href="${esc(d.css)}">\n<link rel="stylesheet" href="${esc(d.css)}">`;
    return `<link rel="stylesheet" href="${esc(d.css)}" media="print" onload="this.media='all'">\n<noscript><link rel="stylesheet" href="${esc(d.css)}"></noscript>`;
  }
  return [
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="preload" as="style" href="${esc(googleUrl)}">`,
    `<link rel="stylesheet" href="${esc(googleUrl)}" media="print" onload="this.media='all'">`,
    `<noscript><link rel="stylesheet" href="${esc(googleUrl)}"></noscript>`,
  ].join('\n');
}

// ===================== passada final no HTML =====================
// Chamada pelo _renomClasses depois de tudo: (a) a frase de direitos do rodape,
// que saia "Todos os direitos reservados" em 71 portais; (b) os nomes das
// variaveis CSS (--fb, --ink, --paper...), que o renomeador de classes nao
// alcancava e apareciam iguais em 42 portais. Os nomes novos vem de um
// vocabulario de CSS comum, estavel por portal, para nao parecer gerado.
const DIREITOS = [
  'Todos os direitos reservados', 'Direitos reservados', 'Conteúdo protegido por direitos autorais',
  'Reprodução proibida sem autorização', 'Todos os direitos sobre o conteúdo reservados',
  'Publicação independente', 'Conteúdo jornalístico protegido', 'Reprodução somente com crédito e link',
  'Marca e conteúdo protegidos', 'Direitos autorais reservados', 'Uso do conteúdo sujeito aos termos',
  'Todos os direitos deste site reservados', 'Conteúdo original, reprodução mediante autorização',
];
const VOC_CSS = ['ink', 'text', 'fg', 'tone', 'base', 'main', 'body', 'head', 'title', 'sans', 'serif',
  'face', 'type', 'font', 'bg', 'paper', 'sheet', 'canvas', 'panel', 'soft', 'muted', 'dim', 'accent',
  'brand', 'hue', 'line', 'edge', 'rule', 'gap', 'space', 'pad', 'rad', 'round', 'shade', 'cast', 'tint',
  'wash', 'glow', 'grid', 'col', 'wide', 'lead', 'dek', 'kick', 'sub', 'meta', 'note', 'tag', 'chip',
  'pill', 'btn', 'cta', 'nav', 'bar', 'foot', 'top', 'surf', 'card', 'box', 'frame', 'ring', 'halo',
  'mark', 'pop', 'deep', 'light', 'dark', 'warm', 'cool', 'hi', 'lo', 'alt', 'aux', 'sec', 'pri',
  'ter', 'ink2', 'text2', 'bg2', 'line2', 'tone2', 'face2', 'sans2', 'serif2', 'mono', 'code',
  'lg', 'md', 'sm', 'xs', 'xl', 'gutter', 'measure', 'lh', 'ls', 'fw', 'fs', 'radius', 'shadow',
  'depth', 'lift', 'blur', 'veil', 'mist', 'fog', 'sky', 'sea', 'leaf', 'sand', 'clay', 'stone',
  'slate', 'coal', 'snow', 'milk', 'cream', 'bone', 'rose', 'plum', 'wine', 'rust', 'moss', 'pine'];
const _varsCache = new Map();
function _mapaVars(site, nomes) {
  const slug = String((site && site.slug) || '');
  const chave = slug + '|' + nomes.join(',');
  if (_varsCache.has(chave)) return _varsCache.get(chave);
  const usados = new Set(nomes);
  const mapa = {};
  for (const n of nomes) {
    let h = _h(site, 'cssvar#' + n), novo = null;
    for (let i = 0; i < 40 && !novo; i++) {
      const cand = VOC_CSS[(h + i * 7) % VOC_CSS.length];
      if (!usados.has(cand)) { novo = cand; usados.add(cand); }
    }
    mapa[n] = novo || (n + 'x');
  }
  _varsCache.set(chave, mapa);
  return mapa;
}
function passadaFinal(site, html) {
  // (a) direitos no rodape
  const frase = _um(site, 'direitos', DIREITOS);
  html = html.replace(/Todos os direitos reservados\.?/g, frase ? frase + '.' : '');
  // (b) variaveis CSS: so as definidas em <style> (nao mexe em --tw- ou similar vindo de terceiros)
  const defs = new Set();
  const estilos = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  for (const st of estilos) {
    const re = /--([a-z][a-z0-9-]*)\s*:/g; let m;
    while ((m = re.exec(st))) defs.add(m[1]);
  }
  if (!defs.size) return html;
  const nomes = [...defs].sort((a, b) => b.length - a.length);
  const mapa = _mapaVars(site, nomes);
  const re = new RegExp('--(' + nomes.map(n => n.replace(/[-]/g, '\\-')).join('|') + ')(?![a-z0-9-])', 'g');
  return html.replace(re, (t, n) => '--' + mapa[n]);
}

// ===================== esqueleto das paginas do motor =====================
// A pagina de autor e as institucionais saiam com a MESMA sequencia de tags em
// todos os portais da maquina (main > article.page > img, h1, p.upd, conteudo):
// 27 portais identicos na clinicas, 25 na opengravity. A classe `page` continua
// (o CSS e por classe), mas a tag do envelope, a posicao e a forma da linha de
// atualizacao, o envelope do avatar e o bloco "Ultimas de" variam por portal.
const ATUALIZ = ['Última atualização: {d}', 'Atualizado em {d}', 'Revisado em {d}', 'Última revisão: {d}',
  'Atualização: {d}', 'Texto atualizado em {d}', 'Conferido em {d}', 'Versão de {d}'];
const ULTIMAS = ['Últimas de {n}', 'Textos recentes de {n}', 'O que {n} publicou', 'Publicações de {n}',
  'Mais recentes de {n}', 'Assinados por {n}', 'Últimos textos de {n}', 'Matérias de {n}'];
function esqueleto(site, p) {
  // p = { avatar (html do <img> ou ''), h1 (html), updated (texto ou ''), content, semTopo (mapa/busca) }
  const env = _um(site, 'esq#env', ['article', 'article', 'section', 'div']);
  const abre = '<main>' + (_h(site, 'esq#miolo') % 3 === 0 ? '<div>' : '') + '<' + env + ' class="page">';
  const fecha = '</' + env + '>' + (_h(site, 'esq#miolo') % 3 === 0 ? '</div>' : '') + '</main>';
  if (p.semTopo) return abre + '\n' + (p.h1 || '') + '\n' + p.content + '\n' + fecha;
  const rot = _um(site, 'esq#upd', ATUALIZ).replace('{d}', p.updated || '');
  const updTag = _um(site, 'esq#updtag', ['p', 'p', 'div', 'small']);
  const upd = p.updated ? (updTag === 'small' ? '<p class="upd"><small>' + rot + '</small></p>' : '<' + updTag + ' class="upd">' + rot + '</' + updTag + '>') : '';
  let av = p.avatar || '';
  if (av) av = _um(site, 'esq#av', [av, '<div>' + av + '</div>', '<p>' + av + '</p>', av]);
  const h1 = p.h1 || '';
  const modo = _um(site, 'esq#modo', ['A', 'B', 'C', 'D', 'A', 'B']);
  const hr = _h(site, 'esq#hr') % 3 === 0 ? '<hr>' : '';
  let topo;
  if (modo === 'A') topo = av + '\n' + h1 + '\n' + upd;                       // img, h1, upd
  else if (modo === 'B') topo = '<header>' + av + '\n' + h1 + '\n' + upd + '</header>';   // tudo num header
  else if (modo === 'C') topo = av + '\n' + upd + '\n' + h1;                  // upd antes do titulo
  else topo = av + '\n' + h1;                                                   // upd vai para o fim
  const fim = modo === 'D' ? '\n' + upd : '';
  return abre + '\n' + topo + (hr ? '\n' + hr : '') + '\n' + p.content + fim + '\n' + fecha;
}
function ultimasDe(site, nome, itensLi, classeUl) {
  const t = _um(site, 'ult#t', ULTIMAS).replace('{n}', nome);
  const lista = _um(site, 'ult#lista', ['ul', 'ul', 'ol']);
  const cls = classeUl ? ' class="' + classeUl + '"' : '';
  const bloco = '<h2>' + t + '</h2><' + lista + cls + '>' + itensLi + '</' + lista + '>';
  return _um(site, 'ult#env', [bloco, '<section>' + bloco + '</section>', bloco, '<aside>' + bloco + '</aside>']);
}

module.exports = { quemSomos, contato, privacidade, termos, naoEncontrado, robots, ordenaLd, fontes, passadaFinal, esqueleto, ultimasDe };
