'use strict';
/* Seed de demonstração (música/cultura) para o portal projetob (Sonora). */
const RUNWARE = process.env.RUNWARE_KEY, SITE_KEY = process.env.SITE_KEY, ENDPOINT = process.env.ENDPOINT;
const arts = [
  { title: 'O renascimento do jazz instrumental nas casas de show', categories: ['Notícias'],
    excerpt: 'Pequenos clubes voltam a apostar em grupos autorais e plateias atentas à improvisação.',
    content: '<p>O jazz instrumental vive um novo fôlego nas casas de show, com grupos autorais ocupando palcos antes dominados por covers.</p><p>A proximidade entre músicos e plateia tem atraído um público que busca escuta atenta e experiência ao vivo.</p>',
    prompt: 'moody jazz club stage with warm spotlights and a guitar silhouette, dark atmospheric cinematic photography, no text' },
  { title: 'Vinil cresce de novo e reaproxima gerações da música', categories: ['Notícias'],
    excerpt: 'Lançamentos em vinil e toca-discos acessíveis impulsionam o consumo físico entre jovens.',
    content: '<p>O formato físico volta a crescer: o vinil reconquista colecionadores e atrai uma geração que nunca o viveu.</p><p>Lojas independentes relatam aumento na procura por edições especiais e clássicos remasterizados.</p>',
    prompt: 'close-up of a vinyl record spinning on a turntable, warm rim light, dark background, cinematic, no text' },
  { title: 'Os festivais independentes que movimentam a cena em 2026', categories: ['Entretenimento'],
    excerpt: 'Eventos de menor porte ganham força e revelam novos nomes da música autoral brasileira.',
    content: '<p>Longe dos grandes circuitos, festivais independentes se firmam como vitrine para artistas autorais.</p><p>Curadoria ousada e ingressos acessíveis transformam esses encontros em pontos de descoberta musical.</p>',
    prompt: 'crowd at an indie music festival at night with colorful stage lights, cinematic dark photography, no text' },
  { title: 'Como o streaming mudou a forma de descobrir novos artistas', categories: ['Notícias'],
    excerpt: 'Algoritmos e playlists redesenham o caminho entre o artista emergente e o ouvinte.',
    content: '<p>As plataformas de streaming reorganizaram a descoberta musical: playlists e recomendações viraram a nova rádio.</p><p>Para artistas independentes, isso abre portas, mas também exige entender como a curadoria algorítmica funciona.</p>',
    prompt: 'person wearing headphones in a dark room lit by colorful screen glow, moody cinematic, no text' },
  { title: 'Trilhas sonoras de cinema que viraram clássicos atemporais', categories: ['Entretenimento'],
    excerpt: 'Composições feitas para a tela ganharam vida própria e seguem emocionando fora dos filmes.',
    content: '<p>Algumas trilhas sonoras transcenderam os filmes que as originaram e se tornaram peças de concerto.</p><p>A força dessas composições mostra como a música de cinema dialoga com a memória afetiva do público.</p>',
    prompt: 'vintage film reel and a grand piano in dramatic low key lighting, cinematic, no text' },
];
function uuid(i) { return 'd2222222-2222-4222-8222-' + String(200000000000 + i); }
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
