'use strict';
/* Gera posts de demonstração com imagens (Runware) e publica via endpoint do portal.
   Uso: SITE_KEY=... ENDPOINT=... node seed-demo.js  */
const RUNWARE = process.env.RUNWARE_KEY;
const SITE_KEY = process.env.SITE_KEY;
const ENDPOINT = process.env.ENDPOINT;

const arts = [
  { title: 'Releituras de clássicos conquistam uma nova geração de leitores',
    categories: ['Literatura'],
    excerpt: 'Edições caprichadas e adaptações renovam o interesse por obras que atravessam gerações.',
    content: '<p>Clássicos da literatura voltam às listas dos mais lidos com novas edições e capas que encantam colecionadores.</p><p>Para muitos jovens, o primeiro contato com esses títulos tem sido por meio de clubes de leitura e redes sociais.</p>',
    prompt: 'stack of vintage classic hardcover books on a wooden desk with a warm reading lamp, cozy editorial photography, shallow depth of field, no text' },
  { title: 'Cinco livros para quem ama boas histórias de amor',
    categories: ['Resenhas'],
    excerpt: 'Uma seleção de romances que misturam emoção, bom texto e personagens inesquecíveis.',
    content: '<p>Do romance de época ao contemporâneo, estas indicações agradam tanto quem lê muito quanto quem está voltando aos livros.</p><p>Cada título traz uma forma diferente de falar sobre afeto, perdas e recomeços.</p>',
    prompt: 'open romance novel with dried flowers and a cup of tea on a linen cloth, soft warm light, cozy aesthetic, no text' },
  { title: 'Como montar um cantinho de leitura aconchegante em casa',
    categories: ['Cultura'],
    excerpt: 'Poucos elementos bastam para criar um espaço convidativo para ler todos os dias.',
    content: '<p>Uma boa poltrona, luz quente e uma pequena estante já transformam qualquer canto em refúgio de leitura.</p><p>O segredo é manter os livros à vista e o ambiente confortável.</p>',
    prompt: 'cozy home reading nook with a comfortable armchair, blanket, small bookshelf and warm window light, interior photography, no text' },
  { title: 'A volta dos clubes do livro: o prazer de ler em comunidade',
    categories: ['Cultura'],
    excerpt: 'Encontros para debater leituras crescem nas cidades e também no ambiente online.',
    content: '<p>Ler deixou de ser uma atividade solitária para muita gente: os clubes do livro voltaram com força.</p><p>Além das discussões, eles criam laços e ampliam o repertório dos participantes.</p>',
    prompt: 'group of friends discussing books around a table in a cozy cafe, warm ambient light, candid editorial photography, no text' },
  { title: 'Poesia contemporânea brasileira para conhecer agora',
    categories: ['Literatura'],
    excerpt: 'Novos nomes renovam a poesia nacional com linguagem acessível e temas atuais.',
    content: '<p>A poesia vive um bom momento no Brasil, impulsionada por autores que dialogam com o presente.</p><p>Coletâneas recentes são uma porta de entrada para quem quer começar.</p>',
    prompt: 'open poetry book on a windowsill with soft morning light and a small plant, minimalist literary photography, no text' },
];

function uuid(i) { return 'c1111111-1111-4111-8111-' + String(100000000000 + i); }

(async () => {
  for (let i = 0; i < arts.length; i++) {
    const a = arts[i];
    let image_base64 = null;
    try {
      const r = await fetch('https://api.runware.ai/v1', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RUNWARE },
        body: JSON.stringify([{ taskType: 'imageInference', taskUUID: uuid(i), model: 'runware:100@1', positivePrompt: a.prompt, width: 1216, height: 832, numberResults: 1, outputType: 'URL', outputFormat: 'WEBP' }]),
      });
      const j = await r.json();
      const url = j.data && j.data[0] && j.data[0].imageURL;
      if (url) { const im = await fetch(url); image_base64 = Buffer.from(await im.arrayBuffer()).toString('base64'); }
    } catch (e) { console.log('img err', e.message); }
    const body = { title: a.title, categories: a.categories, author: 1, excerpt: a.excerpt, content: a.content };
    if (image_base64) { body.image_base64 = image_base64; body.imagem = 'demo-' + i + '.webp'; body.image_alt = a.title; }
    const p = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': SITE_KEY }, body: JSON.stringify(body) });
    console.log(p.status, image_base64 ? '(com imagem)' : '(sem imagem)', a.title.slice(0, 45));
  }
})();
