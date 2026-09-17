'use strict';
/* Seed de demonstração (cultura geek) para o portal Todos Somos Geek. */
const RUNWARE = process.env.RUNWARE_KEY, SITE_KEY = process.env.SITE_KEY, ENDPOINT = process.env.ENDPOINT;
const arts = [
  { title: 'Os jogos mais aguardados de 2026 para PC e consoles', categories: ['Games'],
    excerpt: 'De RPGs ambiciosos a indies criativos, veja os lançamentos que prometem dominar o ano.',
    content: '<p>O calendário de 2026 está recheado de lançamentos que prometem agitar a comunidade gamer, com grandes estúdios e produções independentes disputando atenção.</p><p>Entre sequências aguardadas e novas franquias, a diversidade de gêneros mostra um ano forte para quem joga em qualquer plataforma.</p>',
    prompt: 'futuristic gaming setup with neon purple lighting, controller and glowing screens, dark cyberpunk atmosphere, cinematic, no text' },
  { title: 'IA generativa chega aos games e muda a forma de jogar', categories: ['Tecnologia'],
    excerpt: 'NPCs mais inteligentes e mundos que se adaptam ao jogador redefinem a experiência.',
    content: '<p>A inteligência artificial generativa começa a transformar os games, criando personagens que reagem de forma realista e cenários que mudam conforme o estilo de cada jogador.</p><p>A tecnologia abre caminho para experiências mais imersivas, mas também levanta debates sobre criatividade e trabalho humano nos estúdios.</p>',
    prompt: 'glowing neural network and circuit patterns over a game world, purple and violet tones, dark tech aesthetic, cinematic, no text' },
  { title: 'Adaptações de anime para live-action que valeram a pena', categories: ['Cultura Pop'],
    excerpt: 'Por muito tempo um campo minado, as adaptações finalmente começam a acertar.',
    content: '<p>Durante anos as adaptações de anime para live-action foram sinônimo de decepção, mas produções recentes provam que é possível respeitar o material original.</p><p>Elenco afinado, efeitos caprichados e roteiros fiéis mostram um novo padrão de qualidade que anima os fãs.</p>',
    prompt: 'dramatic anime inspired hero silhouette with glowing violet energy, dark cinematic scene, no text' },
  { title: 'Retro gaming: por que os clássicos nunca saem de moda', categories: ['Games'],
    excerpt: 'Coleções, remasters e emulação mantêm vivos os títulos que marcaram gerações.',
    content: '<p>O fascínio pelos jogos clássicos só cresce, impulsionado por coletâneas oficiais, remasters caprichados e uma comunidade dedicada à preservação.</p><p>Mais do que nostalgia, o retro gaming revela como o bom game design resiste ao tempo e continua divertindo.</p>',
    prompt: 'vintage game console and cartridges on a dark desk with purple rim light, nostalgic cinematic photography, no text' },
  { title: 'Quadrinhos independentes que viraram fenômeno cultural', categories: ['Cultura Pop'],
    excerpt: 'Longe das grandes editoras, autores autorais conquistam leitores e telas.',
    content: '<p>Os quadrinhos independentes vivem um momento de ouro, com histórias autorais que conquistam público fiel e chamam a atenção de estúdios de cinema e streaming.</p><p>A liberdade criativa fora das grandes editoras tem revelado narrativas ousadas e personagens inesquecíveis.</p>',
    prompt: 'stack of comic books with dramatic purple lighting on a dark background, cinematic close-up, no text' },
];
function uuid(i) { return 'd3333333-3333-4333-8333-' + String(300000000000 + i); }
(async () => {
  for (let i = 0; i < arts.length; i++) {
    const a = arts[i]; let image_base64 = null;
    try {
      const r = await fetch('https://api.runware.ai/v1', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RUNWARE }, body: JSON.stringify([{ taskType: 'imageInference', taskUUID: uuid(i), model: 'runware:100@1', positivePrompt: a.prompt, width: 1216, height: 832, numberResults: 1, outputType: 'URL', outputFormat: 'WEBP' }]) });
      const j = await r.json(); const url = j.data && j.data[0] && j.data[0].imageURL;
      if (url) { const im = await fetch(url); image_base64 = Buffer.from(await im.arrayBuffer()).toString('base64'); }
    } catch (e) { console.log('img err', e.message); }
    const body = { title: a.title, categories: a.categories, author: 1, excerpt: a.excerpt, content: a.content };
    if (image_base64) { body.image_base64 = image_base64; body.imagem = 'demo-' + i + '.webp'; body.image_alt = a.title; }
    const p = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': SITE_KEY }, body: JSON.stringify(body) });
    console.log(p.status, image_base64 ? '(img)' : '(s/img)', a.title.slice(0, 42));
  }
})();
