const fs = require('fs'), path = require('path');
const { rebuildIndexes } = require('/opt/portal-engine/src/render');
const DATA = '/srv/portais/romanceseleituras/data';
const PUB = '/srv/portais/romanceseleituras/public';
const c = JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json'));
const site = c.sites.find(x => x.slug === 'romanceseleituras');

// 1) remover posts de demonstracao
const demos = [
  'a-volta-dos-clubes-do-livro-o-prazer-de-ler-em-comunidade',
  'cinco-livros-para-quem-ama-boas-historias-de-amor',
  'como-montar-um-cantinho-de-leitura-aconchegante-em-casa',
  'poesia-contemporanea-brasileira-para-conhecer-agora',
  'releituras-de-classicos-conquistam-uma-nova-geracao-de-leitores',
];
for (const s of demos) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(DATA, s + '.json')));
    fs.rmSync(path.join(DATA, s + '.json'), { force: true });
    fs.rmSync(path.join(PUB, d.category.slug, s), { recursive: true, force: true });
    if (d.image && d.image.file) fs.rmSync(path.join(PUB, 'img', d.image.file), { force: true });
    console.log('demo removido:', s);
  } catch (e) { console.log('skip demo', s, e.message); }
}

// 2) traduzir/otimizar o artigo de jazz
const oldSlug = 'brazil-turns-jazz-into-an-art-of-transforming-the-unexpected';
const newSlug = 'brasil-transforma-o-jazz-em-arte-de-reinventar-o-inesperado';
const a = JSON.parse(fs.readFileSync(path.join(DATA, oldSlug + '.json')));
a.title = 'Brasil transforma o jazz em arte de reinventar o inesperado';
a.dek = 'Do swing das big bands ao jazz brasileiro contemporâneo, oito momentos mostram como o gênero transforma o inesperado em arte.';
a.excerpt = a.dek;
a.slug = newSlug;
a.content = `<p>O jazz há muito é descrito como mais do que um gênero musical. É uma forma de diálogo, um jeito de entender o tempo e uma prática enraizada na criação coletiva. Nascido das raízes negras norte-americanas no início do século XX, o jazz une técnica e liberdade, estrutura e risco, tensão e harmonia.</p>
<p>No jazz, improvisar não é simplesmente tocar sem regras. É entender que o inesperado pode abrir novos caminhos. Uma nota tocada fora do plano não precisa ser um erro: pode se tornar uma descoberta. Em uma época obcecada por controle, o jazz propõe outra lógica — há força no desvio, no instante, naquilo que não foi planejado. Por meio de solos, pausas e síncopes, o gênero sugere que viver talvez tenha menos a ver com perfeição e mais com presença, escuta e adaptação.</p>
<p>Ouvir jazz é aceitar o movimento. Exige atenção à mudança. Cada fase de sua história revela uma maneira diferente de lidar com liberdade, criatividade e expressão. Da energia das big bands ao encontro com a música brasileira, a trajetória do jazz mostra como diferentes épocas transformaram inquietação em som.</p>
<h2>Big Band | Duke Ellington — Take the "A" Train (1941)</h2>
<p>Antes de o jazz se associar à ruptura e à experimentação, ele também foi celebração coletiva. Nos anos 1930 e início dos 1940, o swing tomava os salões de dança por meio das big bands: grandes orquestras que combinavam sofisticação, energia e precisão. Nesse contexto, Duke Ellington se tornou um dos nomes mais importantes da música do século XX. "Take the 'A' Train", composta por Billy Strayhorn, captura o refinamento urbano da era do swing — um tempo em que o jazz era popular sem perder complexidade, e dançante sem perder elegância.</p>
<h2>Bebop | Charlie Parker — Ko-Ko (1945)</h2>
<p>Enquanto as big bands ofereciam o swing dançante, o bebop levou o jazz a outra direção. Em meados dos anos 1940, músicos como Charlie Parker romperam com estruturas previsíveis para criar uma música veloz, sofisticada e desafiadora. "Ko-Ko" é um exemplo poderoso dessa mudança. O saxofone de Parker se torna uma força inquieta, conduzindo harmonias complexas e improvisação intensa. O jazz deixava de ser apenas trilha para dançar e virava uma linguagem artística ousada, testando limites técnicos e criativos.</p>
<h2>Cool Jazz | Miles Davis — Boplicity (1949/1950)</h2>
<p>Depois da intensidade do bebop, alguns artistas passaram a explorar novas atmosferas. O cool jazz não abandonou a sofisticação, mas encontrou força na contenção, no espaço e na sutileza. Com Miles Davis à frente, "Boplicity", das sessões de "Birth of the Cool", tornou-se um marco dessa virada. A faixa troca a urgência pela delicadeza, mostrando que o jazz podia desacelerar sem perder profundidade.</p>
<h2>Vocal Jazz | Ella Fitzgerald & Louis Armstrong — Cheek to Cheek (1956)</h2>
<p>O jazz também encontrou uma de suas expressões mais potentes na voz humana. Quando Ella Fitzgerald e Louis Armstrong se uniram no álbum "Ella and Louis", criaram um encontro que segue como referência de sensibilidade, técnica e comunicação musical. Em "Cheek to Cheek", clássico de Irving Berlin reinterpretado com elegância e leveza, o vocal jazz mostra sua força na combinação de sofisticação e emoção, unindo o controle melódico impecável de Fitzgerald ao charme inconfundível de Armstrong.</p>
<h2>Modal Jazz | John Coltrane — My Favorite Things (1960)</h2>
<p>Nos anos 1960, o jazz ampliou novamente suas possibilidades. O modal jazz abriu espaço para construções menos presas a mudanças harmônicas rápidas, privilegiando a exploração melódica e novas formas de desenvolvimento. Nesse cenário, John Coltrane reinventou "My Favorite Things", faixa central do álbum de mesmo nome. Ao transformar uma canção conhecida em uma experiência expansiva, Coltrane mostra como o jazz pode revisitar o familiar e ainda criar algo inteiramente novo.</p>
<h2>Bossa Nova / Jazz Brasileiro | Tom Jobim — Wave (1967)</h2>
<p>Quando o jazz encontrou a música brasileira, nasceu uma das fusões mais sofisticadas do século. A bossa nova apresentou ao mundo uma nova relação entre suavidade, harmonia e ritmo. Em "Wave", do álbum homônimo, Tom Jobim captura esse diálogo em sua fase mais madura. A faixa representa um momento em que a música brasileira não apenas absorveu influências do jazz, mas também ofereceu novos caminhos para o gênero.</p>
<h2>Jazz Fusion + MPB | Wayne Shorter & Milton Nascimento — Native Dancer (1975)</h2>
<p>Nos anos 1970, o jazz passou a incorporar mais referências, expandindo seus horizontes sonoros. Um dos encontros mais notáveis desse período é "Native Dancer". A parceria entre Wayne Shorter e Milton Nascimento cria uma obra em que o jazz contemporâneo e a musicalidade brasileira se entrelaçam de maneira única. O álbum representa não apenas uma fusão de estilos, mas um encontro entre músicos excepcionais.</p>
<h2>Jazz Fusion | Weather Report, Jaco Pastorius & Herbie Hancock — Birdland (1977)</h2>
<p>O jazz começou como uma música acústica, mas os anos 1970 mostraram que ele também podia dialogar com a eletricidade, a tecnologia e novas linguagens sem perder a identidade. "Birdland", do álbum "Heavy Weather", captura esse momento com precisão. A presença revolucionária do baixista Jaco Pastorius, ao lado de artistas como Herbie Hancock, revela um jazz que continua a se transformar, incorporando novas ferramentas sem abandonar seu núcleo inventivo.</p>
<h2>Jazz Brasileiro Contemporâneo | Josiel Konrad — Boca no Trombone (2023)</h2>
<p>Ao longo de sua história, o jazz sempre encontrou novas formas de dialogar com diferentes territórios. O presente da música brasileira mostra que esse movimento segue vivo. No Brasil de hoje, o jazz continua a se reinventar ao atravessar periferias, tradições afro-brasileiras, música instrumental e debates sociais contemporâneos. Entre os nomes que ajudam a expandir esse caminho está Josiel Konrad. Em "Boca no Trombone", o artista apresenta um trabalho que conecta jazz, samba, funk, afrobeat e a experiência urbana brasileira de forma potente e atual. Trombonista da Baixada Fluminense, Konrad constrói um som que preserva a sofisticação instrumental do jazz ao mesmo tempo em que o aproxima de questões sociais, da identidade negra e das vivências periféricas. Mais do que revisitar tradições, "Boca no Trombone" revela como o jazz brasileiro contemporâneo segue sendo um espaço de invenção e pertencimento. Ao incorporar múltiplas influências sem perder consistência estética, Josiel Konrad reafirma a capacidade de renovação permanente do gênero.</p>`;

// renomear a imagem para o novo slug
if (a.image && a.image.file) {
  const ext = path.extname(a.image.file);
  const nf = newSlug + ext;
  try { fs.renameSync(path.join(PUB, 'img', a.image.file), path.join(PUB, 'img', nf)); a.image.file = nf; } catch (e) { console.log('img rename skip', e.message); }
}

// gravar novo, remover antigo (data + html dir)
fs.writeFileSync(path.join(DATA, newSlug + '.json'), JSON.stringify(a, null, 2));
fs.rmSync(path.join(DATA, oldSlug + '.json'), { force: true });
fs.rmSync(path.join(PUB, 'noticias', oldSlug), { recursive: true, force: true });
console.log('jazz traduzido + reslug:', newSlug);

rebuildIndexes(c, site);
console.log('rebuild OK');
