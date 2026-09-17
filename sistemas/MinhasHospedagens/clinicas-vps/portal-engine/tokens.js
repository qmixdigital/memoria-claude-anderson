'use strict';
/**
 * tokens.js — sistema de "fingerprint roll" da rede (anti-PBN).
 *
 * Cada portal recebe uma IDENTIDADE COMPLETA e divergente dos vizinhos em TODAS
 * as camadas que detectores (Ahrefs/Spamzilla/Wappalyzer/analistas) usam pra
 * agrupar sites: arquetipo de DOM, nomes de classe CSS, paleta, par de fontes,
 * raio de borda, sombra, escala de espacamento, largura do container, tamanho de
 * fonte base, proporcao das imagens e letter-spacing. Portado da metodologia da
 * skill wp-news-frontpage para o motor Node (HTML estatico).
 *
 * `rollFingerprint(slug, neighbors)` é deterministico por slug (mesmo slug => mesma
 * identidade, estavel entre rebuilds) e escolhe valores que NAO colidem com os
 * vizinhos. O resultado vira o objeto `fp` salvo em sites.json.
 */

// ---------- arquetipos estruturais ----------
const ARCH_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

// ---------- paletas (16) — light editorial + dark magazine/news ----------
// chaves compativeis com theme() do render.js
function L(primary, onPrimary, ink, paper, surface, ph, dek, muted, line) {
  return { primary, onPrimary, ink, paper, surface, ph, dek, muted, line,
    barBg: ink, barTx: '#f4efe6', footerBg: ink, footerTx: '#cfc8bc' };
}
function D(primary, onPrimary, ink, paper, surface, ph, dek, muted, line, bar, footTx) {
  return { primary, onPrimary, ink, paper, surface, ph, dek, muted, line,
    barBg: bar, barTx: '#cfd3dc', footerBg: bar, footerTx: footTx || '#8b93a1' };
}
const PALETTES = [
  { name: 'red-light', mode: 'light', theme: L('#b4232a', '#ffffff', '#1a1714', '#fbf9f5', '#ffffff', '#eceae4', '#3b352e', '#4f483f', '#e7e1d6') },
  { name: 'navy-light', mode: 'light', theme: L('#1c5f8c', '#ffffff', '#16202b', '#f7f6f1', '#ffffff', '#e6e8ea', '#3a4753', '#5a6573', '#e0e2e0') },
  { name: 'rose-light', mode: 'light', theme: L('#a32a4e', '#ffffff', '#2a1620', '#fbf6f4', '#ffffff', '#efe4e6', '#4a3038', '#6a4e56', '#ebdfe1') },
  { name: 'forest-light', mode: 'light', theme: L('#1f7a4d', '#ffffff', '#13201a', '#f6f8f4', '#ffffff', '#e4eae3', '#36473d', '#56655b', '#dfe6df') },
  { name: 'ink-light', mode: 'light', theme: L('#b8632a', '#ffffff', '#1c1a17', '#faf8f3', '#ffffff', '#ece8e0', '#3d3830', '#5b5448', '#e6e0d4') },
  { name: 'indigo-light', mode: 'light', theme: L('#3b3fb0', '#ffffff', '#1a1a2b', '#f6f6fb', '#ffffff', '#e6e6f0', '#393a52', '#585a72', '#e0e0ea') },
  { name: 'teal-light', mode: 'light', theme: L('#0d7a83', '#ffffff', '#112426', '#f3f8f8', '#ffffff', '#e0eced', '#33484a', '#536567', '#d9e7e7') },
  { name: 'plum-light', mode: 'light', theme: L('#7b3aa0', '#ffffff', '#221829', '#f9f6fb', '#ffffff', '#ece4f0', '#42384a', '#62566a', '#e7dfeb') },
  { name: 'amber-dark', mode: 'dark', theme: D('#f2b84b', '#14110a', '#eceef3', '#0d0f14', '#161a22', '#1b2029', '#aab1be', '#8b93a1', '#262c38', '#08090d') },
  { name: 'violet-dark', mode: 'dark', theme: D('#a07bff', '#0b0712', '#e8e9f0', '#0b0e16', '#141926', '#1a2030', '#a3acc2', '#7e879e', '#222a3c', '#06080f', '#8a93ab') },
  { name: 'emerald-dark', mode: 'dark', theme: D('#25c281', '#04140d', '#e9f1ec', '#0b1310', '#122019', '#16241d', '#a6bcb1', '#87a294', '#1f3329', '#060d0a', '#88a596') },
  { name: 'cyan-dark', mode: 'dark', theme: D('#34c6e6', '#021016', '#e6eef2', '#091016', '#121c24', '#172430', '#9fb2bd', '#7a8b96', '#203038', '#050b10', '#86959e') },
  { name: 'crimson-dark', mode: 'dark', theme: D('#ff5d5d', '#150708', '#efe9ea', '#120d0e', '#1d1618', '#241b1d', '#bda9ab', '#9a8688', '#352629', '#0c0809', '#a18a8c') },
  { name: 'lime-dark', mode: 'dark', theme: D('#b6e34a', '#0e1304', '#eaeee2', '#0e1208', '#191f12', '#1f2616', '#b0bba0', '#909a80', '#2c3520', '#080b04', '#909a80') },
  { name: 'sky-dark', mode: 'dark', theme: D('#4d8cff', '#040a16', '#e7ebf2', '#0a0e16', '#141a26', '#1a2230', '#a3abbd', '#7d8597', '#222c3c', '#05080f', '#868fa1') },
  { name: 'magenta-dark', mode: 'dark', theme: D('#ff5db0', '#160710', '#efe8ec', '#120c10', '#1d1620', '#241b28', '#bda6b3', '#9a8392', '#352636', '#0c070a', '#a18a98') },
];

// ---------- pares de fonte (15) — display + corpo ----------
const G = 'https://fonts.googleapis.com/css2?family=';
const FONTS = [
  { name: 'fraunces-plex', fontDisplay: '"Fraunces", Georgia, "Times New Roman", serif', fontBody: '"IBM Plex Sans", system-ui, -apple-system, sans-serif', googleUrl: G + 'Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=IBM+Plex+Sans:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'syne-manrope', fontDisplay: '"Syne", system-ui, sans-serif', fontBody: '"Manrope", system-ui, -apple-system, sans-serif', googleUrl: G + 'Syne:wght@600;700;800&family=Manrope:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'chakra-mulish', fontDisplay: '"Chakra Petch", system-ui, sans-serif', fontBody: '"Mulish", system-ui, -apple-system, sans-serif', googleUrl: G + 'Chakra+Petch:wght@500;600;700&family=Mulish:<<REMOVIDO>>;500;600;700;800&display=swap' },
  { name: 'playfair-source', fontDisplay: '"Playfair Display", Georgia, serif', fontBody: '"Source Sans 3", system-ui, -apple-system, sans-serif', googleUrl: G + 'Playfair+Display:wght@600;700;800;900&family=Source+Sans+3:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'sora-figtree', fontDisplay: '"Sora", system-ui, sans-serif', fontBody: '"Figtree", system-ui, -apple-system, sans-serif', googleUrl: G + 'Sora:wght@600;700;800&family=Figtree:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'spectral-worksans', fontDisplay: '"Spectral", Georgia, serif', fontBody: '"Work Sans", system-ui, -apple-system, sans-serif', googleUrl: G + 'Spectral:wght@600;700;800&family=Work+Sans:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'bricolage-manrope', fontDisplay: '"Bricolage Grotesque", system-ui, sans-serif', fontBody: '"Manrope", system-ui, -apple-system, sans-serif', googleUrl: G + 'Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Manrope:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'newsreader-archivo', fontDisplay: '"Newsreader", Georgia, serif', fontBody: '"Archivo", system-ui, -apple-system, sans-serif', googleUrl: G + 'Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&family=Archivo:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'spacegrotesk-inter', fontDisplay: '"Space Grotesk", system-ui, sans-serif', fontBody: '"Inter", system-ui, -apple-system, sans-serif', googleUrl: G + 'Space+Grotesk:wght@500;600;700&family=Inter:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'dmserif-dmsans', fontDisplay: '"DM Serif Display", Georgia, serif', fontBody: '"DM Sans", system-ui, -apple-system, sans-serif', googleUrl: G + 'DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
  { name: 'epilogue-lora', fontDisplay: '"Epilogue", system-ui, sans-serif', fontBody: '"Lora", Georgia, serif', googleUrl: G + 'Epilogue:wght@600;700;800&family=Lora:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'unbounded-outfit', fontDisplay: '"Unbounded", system-ui, sans-serif', fontBody: '"Outfit", system-ui, -apple-system, sans-serif', googleUrl: G + 'Unbounded:wght@600;700;800&family=Outfit:<<REMOVIDO>>;500;600;700&display=swap' },
  { name: 'librefranklin-libre', fontDisplay: '"Libre Franklin", system-ui, sans-serif', fontBody: '"Libre Baskerville", Georgia, serif', googleUrl: G + 'Libre+Franklin:wght@600;700;800;900&family=Libre+Baskerville:<<REMOVIDO>>;700&display=swap' },
  { name: 'schibsted-sourceserif', fontDisplay: '"Schibsted Grotesk", system-ui, sans-serif', fontBody: '"Source Serif 4", Georgia, serif', googleUrl: G + 'Schibsted+Grotesk:wght@600;700;800;900&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap' },
  { name: 'instrument-jakarta', fontDisplay: '"Instrument Serif", Georgia, serif', fontBody: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', googleUrl: G + 'Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:<<REMOVIDO>>;500;600;700&display=swap' },
];

// ---------- escalas de design (computed-style hash diverge) ----------
const RADIUS = [
  { name: 'sharp', sm: '0', md: '0', lg: '0' },
  { name: 'subtle', sm: '2px', md: '4px', lg: '6px' },
  { name: 'soft', sm: '4px', md: '8px', lg: '14px' },
  { name: 'round', sm: '6px', md: '12px', lg: '20px' },
  { name: 'pill', sm: '8px', md: '16px', lg: '26px' },
];
const SHADOW = [
  { name: 'none', card: 'none', soft: 'none' },
  { name: 'hairline', card: '0 1px 2px rgba(0,0,0,.06)', soft: '0 1px 3px rgba(0,0,0,.08)' },
  { name: 'lift', card: '0 6px 18px -8px rgba(0,0,0,.18)', soft: '0 10px 30px -14px rgba(0,0,0,.22)' },
  { name: 'hard', card: '4px 4px 0 rgba(0,0,0,.16)', soft: '6px 6px 0 rgba(0,0,0,.14)' },
  { name: 'glow', card: '0 0 0 1px rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.30)', soft: '0 0 24px -6px rgba(0,0,0,.20)' },
];
const SPACING = [
  { name: 'compact', gap: '22px', col: '26px', sec: '30px', block: '46px' },
  { name: 'normal', gap: '28px', col: '34px', sec: '40px', block: '56px' },
  { name: 'airy', gap: '34px', col: '46px', sec: '52px', block: '68px' },
];
const CONTAINER = ['1100px', '1180px', '1240px', '1320px', '1160px'];
const BASE_FS = ['17px', '18px', '19px'];
const HERO_AR = ['16/9', '3/2', '16/10', '21/9'];
const CARD_AR = ['4/3', '16/10', '1/1', '3/2'];
const KICKER_LS = ['.08em', '.12em', '.14em', '.18em', '.22em'];

// prefixos de classe (3 letras) — divergem o nome das classes entre portais da mesma arch
const PREFIXES = ['nwz', 'edx', 'vrt', 'qzn', 'mbo', 'rtl', 'lyk', 'zcp', 'pxm', 'awr', 'krs', 'svn', 'gmx', 'bdl', 'fnt', 'okr', 'jvn', 'tld', 'wcp', 'hax'];

// ---------- hash deterministico ----------
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
// gerador de inteiros derivados do seed (com "sal" por eixo)
function picker(seed) {
  return (salt, len) => {
    const h = hashSeed(seed + '::' + salt);
    return len ? (h % len) : h;
  };
}

// escolhe um item de `pool` divergindo dos `usedNames` (Set). Determinístico via salt.
function pickDivergent(pool, nameOf, usedNames, pick, salt) {
  const start = pick(salt, pool.length);
  for (let i = 0; i < pool.length; i++) {
    const cand = pool[(start + i) % pool.length];
    if (!usedNames.has(nameOf(cand))) return cand;
  }
  return pool[start]; // todos usados: aceita repeticao (rede grande)
}

/**
 * rollFingerprint(slug, neighbors)
 *  neighbors: array de fp's já existentes (ou {arch,paletteName,fontName,prefix,...})
 *  retorna o objeto fp completo (deterministico por slug, divergente dos vizinhos)
 */
function rollFingerprint(slug, neighbors) {
  const nb = Array.isArray(neighbors) ? neighbors.filter(Boolean) : [];
  const pick = picker(slug);

  // arch: menos usado pelos vizinhos (empate => hash)
  const archCount = Object.fromEntries(ARCH_LETTERS.map(a => [a, 0]));
  nb.forEach(n => { if (n.arch && archCount[n.arch] != null) archCount[n.arch]++; });
  const minUse = Math.min(...ARCH_LETTERS.map(a => archCount[a]));
  const archCandidates = ARCH_LETTERS.filter(a => archCount[a] === minUse);
  const arch = archCandidates[pick('arch', archCandidates.length)];

  const usedPal = new Set(nb.map(n => n.paletteName));
  const usedFont = new Set(nb.map(n => n.fontName));
  const usedPrefix = new Set(nb.map(n => n.prefix));

  const palette = pickDivergent(PALETTES, p => p.name, usedPal, pick, 'pal');
  const font = pickDivergent(FONTS, f => f.name, usedFont, pick, 'font');
  const prefix = pickDivergent(PREFIXES.map(p => ({ name: p })), p => p.name, usedPrefix, pick, 'prefix').name;

  const radius = RADIUS[pick('radius', RADIUS.length)];
  const shadow = SHADOW[pick('shadow', SHADOW.length)];
  const spacing = SPACING[pick('spacing', SPACING.length)];
  const container = CONTAINER[pick('container', CONTAINER.length)];
  const baseFs = BASE_FS[pick('basefs', BASE_FS.length)];
  const heroAr = HERO_AR[pick('heroar', HERO_AR.length)];
  const cardAr = CARD_AR[pick('cardar', CARD_AR.length)];
  const kickerLs = KICKER_LS[pick('kls', KICKER_LS.length)];
  // ordem do <head> e variantes de schema também rolam (0..2)
  const headOrder = pick('head', 3);
  const schemaVariant = pick('schema', 3);

  return {
    arch, prefix,
    paletteName: palette.name, paletteMode: palette.mode,
    fontName: font.name,
    theme: Object.assign({}, palette.theme, { fontDisplay: font.fontDisplay, fontBody: font.fontBody, googleUrl: font.googleUrl }),
    radius: radius.name, shadow: shadow.name, spacing: spacing.name,
    container, baseFs, heroAr, cardAr, kickerLs, headOrder, schemaVariant,
  };
}

// resolve os tokens CSS a partir do fp (usado pelo render)
function resolveTokens(fp) {
  const f = fp || {};
  const radius = RADIUS.find(r => r.name === f.radius) || RADIUS[2];
  const shadow = SHADOW.find(s => s.name === f.shadow) || SHADOW[1];
  const spacing = SPACING.find(s => s.name === f.spacing) || SPACING[1];
  return {
    radius, shadow, spacing,
    container: f.container || '1180px',
    baseFs: f.baseFs || '18px',
    heroAr: f.heroAr || '3/2',
    cardAr: f.cardAr || '16/10',
    kickerLs: f.kickerLs || '.14em',
    headOrder: typeof f.headOrder === 'number' ? f.headOrder : 0,
    schemaVariant: typeof f.schemaVariant === 'number' ? f.schemaVariant : 0,
  };
}

module.exports = {
  ARCH_LETTERS, PALETTES, FONTS, RADIUS, SHADOW, SPACING, CONTAINER, BASE_FS, HERO_AR, CARD_AR, KICKER_LS, PREFIXES,
  hashSeed, rollFingerprint, resolveTokens,
};
