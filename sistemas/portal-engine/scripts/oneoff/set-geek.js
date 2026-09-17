// Identidade do portal Todos Somos Geek (dark violeta, nicho geek)
const fs = require('fs'), p = '/opt/portal-engine/sites.json';
const { PRESETS } = require('/opt/portal-engine/src/presets.js');
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
const s = c.sites.find(x => x.slug === 'todossomosgeek');
if (!s) { console.error('todossomosgeek ausente'); process.exit(1); }
const preset = PRESETS.find(x => x.name === 'zine-violet-dark');
s.layout = { arch: preset.arch };
s.theme = preset.theme;
s.name = 'Todos Somos Geek';
s.description = 'Games, tecnologia e cultura pop';
s.tagline = 'Notícias geek sem firula';
s.defaultCategory = 'Notícias';
s.categoryMap = { '1': 'Notícias', '2': 'Games', '3': 'Tecnologia', '4': 'Cultura Pop' };
s.metaDescription = 'Notícias geek no Todos Somos Geek: games, tecnologia, anime, filmes, séries e cultura pop, com análises, lançamentos e novidades atualizadas todos os dias.';
s.about = `<p>O <strong>Todos Somos Geek</strong> é um portal de notícias dedicado à cultura geek em todas as suas formas: games, tecnologia, anime, quadrinhos, filmes e séries. Cobrimos os lançamentos, as novidades e as discussões que movimentam a comunidade nerd.</p>
<h2>Nossa proposta</h2><p>Acreditamos que ser geek é levar a sério aquilo que a gente ama. Por isso publicamos textos claros, bem apurados e sem enrolação, feitos por quem realmente curte o assunto.</p>
<h2>O que você encontra aqui</h2><p>Notícias e análises de games e consoles, novidades de tecnologia e gadgets, estreias de filmes e séries, anime e mangá, quadrinhos e tudo que envolve a cultura pop.</p>
<h2>Nossos valores</h2><p>Informação honesta, paixão por tecnologia e entretenimento, e respeito pela comunidade. Damos espaço tanto para os grandes lançamentos quanto para as joias independentes.</p>
<h2>Compromisso editorial</h2><p>Prezamos por precisão, respeito ao leitor e transparência. Nosso conteúdo é revisado e atualizado sempre que necessário. Tem uma dica ou quer falar com a equipe? Acesse a página de <a href="/contato/">contato do Todos Somos Geek</a>.</p>`;
s.aboutDesc = 'Conheça o Todos Somos Geek: portal de notícias de games, tecnologia, anime, filmes, séries e cultura pop, feito por quem curte de verdade.';
fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('todossomosgeek ->', s.name, '| arch', s.layout.arch, '| primary', s.theme.primary, '| fonts', s.theme.fontDisplay);
