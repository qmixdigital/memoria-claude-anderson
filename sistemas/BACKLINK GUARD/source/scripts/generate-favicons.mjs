// Gera TODAS as variações de favicon do BacklinkGuard a partir da marca
// (escudo esmeralda + check, igual ao logo do header). Fonte: SVG vetorial.
//   bun run scripts/generate-favicons.mjs
//
// Saídas:
//   src/app/icon.svg                 -> favicon vetorial (navegadores modernos)
//   src/app/favicon.ico              -> ICO multi-tamanho 16/32/48
//   src/app/apple-icon.png           -> apple-touch-icon 180
//   public/favicon-16x16.png, -32x32.png
//   public/android-chrome-192x192.png, -512x512.png
//   public/maskable-512.png          -> ícone maskable (safe-zone) p/ Android/PWA
// (o manifest é gerado por src/app/manifest.ts)

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(ROOT, "src", "app");
const PUB = join(ROOT, "public");
mkdirSync(PUB, { recursive: true });

const EM_LIGHT = "#34d399"; // emerald-400
const EM_DARK = "#059669"; // emerald-600

// Escudo-check no grid 24 (mesmo do lucide "shield-check" usado no header).
const shield = (tx, ty, scale, checkStroke) => `
  <g transform="translate(${tx},${ty}) scale(${scale})" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
          fill="#ffffff" stroke="#ffffff" stroke-width="1.4"/>
    <path d="m9 12 2 2 4-4" fill="none" stroke="${checkStroke}" stroke-width="2.6"/>
  </g>`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${EM_LIGHT}"/>
      <stop offset="1" stop-color="${EM_DARK}"/>
    </linearGradient>
    <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.24"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

// Ícone padrão: cantos arredondados (transparente fora), brilho superior.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
${defs}
  <rect width="512" height="512" rx="115" fill="url(#bg)"/>
  <rect width="512" height="512" rx="115" fill="url(#hi)"/>
${shield(88, 88, 14, EM_DARK)}
</svg>`;

// Maskable: quadrado cheio (sem arredondar) e escudo menor, dentro da safe-zone.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
${defs}
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#hi)"/>
${shield(112, 112, 12, EM_DARK)}
</svg>`;

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** Empacota vários PNGs num único .ico (ICO aceita PNG embutido). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const bodies = [];
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // width
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.data.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += e.data.length;
    bodies.push(e.data);
  });
  return Buffer.concat([header, dir, ...bodies]);
}

// --- vetorial ---
writeFileSync(join(APP, "icon.svg"), iconSvg);

// --- PNGs ---
const jobs = [
  [png(iconSvg, 16), join(PUB, "favicon-16x16.png")],
  [png(iconSvg, 32), join(PUB, "favicon-32x32.png")],
  [png(iconSvg, 180), join(APP, "apple-icon.png")],
  [png(iconSvg, 192), join(PUB, "android-chrome-192x192.png")],
  [png(iconSvg, 512), join(PUB, "android-chrome-512x512.png")],
  [png(maskableSvg, 512), join(PUB, "maskable-512.png")],
];
for (const [bufP, path] of jobs) writeFileSync(path, await bufP);

// --- favicon.ico (16/32/48) ---
const ico = buildIco([
  { size: 16, data: await png(iconSvg, 16) },
  { size: 32, data: await png(iconSvg, 32) },
  { size: 48, data: await png(iconSvg, 48) },
]);
writeFileSync(join(APP, "favicon.ico"), ico);

console.log("favicons gerados:");
console.log("  src/app/icon.svg, favicon.ico, apple-icon.png");
console.log(
  "  public/favicon-16x16.png, favicon-32x32.png, android-chrome-192/512, maskable-512.png",
);
