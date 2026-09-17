// Aplica a identidade dark do portal projetob (Sonora) no sites.json
const fs = require('fs'), p = '/opt/portal-engine/sites.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
const s = c.sites.find(x => x.slug === 'projetob');
if (!s) { console.error('projetob nao encontrado no sites.json'); process.exit(1); }
s.name = 'Sonora';
s.description = 'Música, cultura e entretenimento';
s.tagline = 'Som, cena e cultura';
s.defaultCategory = 'Notícias';
s.categoryMap = { '1': 'Notícias', '2': 'Entretenimento' };
s.theme = {
  primary: '#f2b84b', onPrimary: '#14110a',
  ink: '#eceef3', paper: '#0d0f14', surface: '#161a22', ph: '#1b2029',
  dek: '#aab1be', muted: '#8b93a1', line: '#262c38',
  barBg: '#08090d', barTx: '#cfd3dc', footerBg: '#08090d', footerTx: '#8b93a1',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"Manrope", system-ui, -apple-system, sans-serif',
  googleUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:<<REMOVIDO>>;500;600;700&display=swap',
};
fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('projetob -> tema dark (Sonora) aplicado; categoryMap:', JSON.stringify(s.categoryMap));
