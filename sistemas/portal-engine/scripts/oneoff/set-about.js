// Define o "Quem Somos" (about) e a meta (aboutDesc) por portal no sites.json
const fs = require('fs'), p = '/opt/portal-engine/sites.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));

function set(slug, about, desc) {
  const s = c.sites.find(x => x.slug === slug);
  if (!s) { console.log(slug, 'ausente'); return; }
  s.about = about.replace(/__N__/g, s.name);
  s.aboutDesc = desc.replace(/__N__/g, s.name);
  console.log(slug, '-> about/aboutDesc set');
}

// Projeto B News (musica / cultura / entretenimento)
set('projetob',
  `<p>O <strong>__N__</strong> é um portal de notícias dedicado à música, à cultura e ao entretenimento. Acompanhamos de perto os assuntos que movimentam a cena artística: lançamentos, shows, streaming, cinema, séries e as histórias dos bastidores.</p>
<h2>Nossa proposta</h2><p>Acreditamos que cultura boa merece cobertura de qualidade. Por isso publicamos textos claros, bem apurados e pensados para quem gosta de acompanhar as novidades da música e do entretenimento, no Brasil e no mundo.</p>
<h2>O que você encontra aqui</h2><p>Notícias e reportagens sobre música, artistas, festivais e shows, além de cinema, séries, streaming e tendências da cultura pop, sempre com curadoria e linguagem acessível.</p>
<h2>Nossos valores</h2><p>Trabalhamos com paixão por arte e respeito ao público. Buscamos destacar tanto os grandes nomes quanto novos talentos que merecem atenção, valorizando a diversidade da produção cultural.</p>
<h2>Compromisso editorial</h2><p>Prezamos por precisão, respeito ao leitor e transparência. Nosso conteúdo é revisado e atualizado sempre que necessário. Quer enviar uma pauta ou falar com a equipe? Acesse a página de <a href="/contato/">contato do __N__</a>.</p>`,
  `Conheça o __N__: portal de notícias de música, cultura e entretenimento, com lançamentos, shows, cinema, séries e tendências da cultura pop.`);

// Romances e Leituras (preserva o tom de literatura, sem travessao)
set('romanceseleituras',
  `<p>O <strong>__N__</strong> é um portal dedicado a quem aprecia boas histórias: da literatura à cultura, passando por entretenimento, comportamento e novidades do dia a dia. Reunimos conteúdo de leitura agradável e confiável para informar e inspirar nossos leitores.</p>
<h2>Nossa proposta</h2><p>Acreditamos que a informação de qualidade aproxima pessoas de ideias, livros e referências culturais. Por isso, publicamos textos claros, bem apurados e pensados para o leitor brasileiro.</p>
<h2>O que você encontra aqui</h2><p>Notícias e artigos sobre literatura, lançamentos, resenhas, cultura, música, cinema e entretenimento, sempre com curadoria e linguagem acessível.</p>
<h2>Compromisso editorial</h2><p>Prezamos por precisão, respeito ao leitor e transparência. Conteúdos são revisados e atualizados sempre que necessário. Quer falar com a gente? Acesse a nossa página de <a href="/contato/">contato</a>.</p>`,
  `Conheça o __N__: portal de literatura, cultura e entretenimento, com resenhas, lançamentos e novidades do mundo dos livros.`);

fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('sites.json atualizado');
