/* Gera os ícones PNG do PWA sem depender de nenhuma biblioteca externa.
   Desenha por função matemática, com amostragem 3x3 para suavizar as bordas,
   e escreve o PNG na mão (IHDR + IDAT deflate + IEND).

   Uso: npm run icons */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

/* ------------------------------ cores ------------------------------ */

// Paleta da identidade: fundo quase preto com verde neon, igual ao site.
const FUNDO = [10, 16, 12]
const FUNDO_2 = [5, 8, 6]
const VERDE = [0, 230, 118]

/* --------------------------- geometria ----------------------------- */

/** Distância de um ponto até um retângulo de cantos arredondados. */
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const dx = Math.abs(px - cx) - (hw - r)
  const dy = Math.abs(py - cy) - (hh - r)
  const ax = Math.max(dx, 0)
  const ay = Math.max(dy, 0)
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - r
}

/** Distância de um ponto até um segmento de reta. */
function sdSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)))
  const qx = ax + t * vx - px
  const qy = ay + t * vy - py
  return Math.sqrt(qx * qx + qy * qy)
}

/**
 * Cor do ponto (x, y) em coordenadas 0..1.
 * scale encolhe o desenho para caber na área segura dos ícones maskable.
 * radius é o arredondamento do fundo.
 */
function pixel(x, y, scale, radius) {
  // Fundo escuro com leve degradê na diagonal.
  const t = Math.max(0, Math.min(1, (x + y) / 2))
  let cor = [
    Math.round(FUNDO[0] + (FUNDO_2[0] - FUNDO[0]) * t),
    Math.round(FUNDO[1] + (FUNDO_2[1] - FUNDO[1]) * t),
    Math.round(FUNDO[2] + (FUNDO_2[2] - FUNDO[2]) * t),
  ]
  let alpha = sdRoundRect(x, y, 0.5, 0.5, 0.5, 0.5, radius) <= 0 ? 255 : 0
  if (!alpha) return [0, 0, 0, 0]

  // Coordenadas relativas ao centro, já com a escala aplicada.
  const rx = (x - 0.5) / scale
  const ry = (y - 0.5) / scale

  // Sacola de compras com um visto dentro, no verde da marca.
  const corpo = sdRoundRect(rx, ry, 0, 0.06, 0.24, 0.22, 0.05)
  if (corpo <= 0 && corpo >= -0.028) cor = VERDE

  // Alça: meio anel acima da sacola.
  const raio = Math.sqrt(rx * rx + (ry + 0.16) * (ry + 0.16))
  if (ry < -0.15 && Math.abs(raio - 0.115) <= 0.014) cor = VERDE
  if (ry >= -0.16 && ry <= -0.14 && Math.abs(Math.abs(rx) - 0.115) <= 0.014) cor = VERDE

  // Visto.
  const visto = Math.min(
    sdSegment(rx, ry, -0.1, 0.06, -0.03, 0.13),
    sdSegment(rx, ry, -0.03, 0.13, 0.11, -0.03),
  )
  if (visto <= 0.019) cor = VERDE

  return [cor[0], cor[1], cor[2], alpha]
}

/* ---------------------------- render ------------------------------- */

function render(size, { scale = 1, radius = 0.22 } = {}) {
  const px = Buffer.alloc(size * size * 4)
  const AA = 3
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < AA; sy++) {
        for (let sx = 0; sx < AA; sx++) {
          const c = pixel(
            (x + (sx + 0.5) / AA) / size,
            (y + (sy + 0.5) / AA) / size,
            scale,
            radius,
          )
          r += c[0] * c[3]
          g += c[1] * c[3]
          b += c[2] * c[3]
          a += c[3]
        }
      }
      const i = (y * size + x) * 4
      if (a > 0) {
        px[i] = Math.round(r / a)
        px[i + 1] = Math.round(g / a)
        px[i + 2] = Math.round(b / a)
      }
      px[i + 3] = Math.round(a / (AA * AA))
    }
  }
  return px
}

/* ------------------------- codificação PNG ------------------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // profundidade
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filtro nenhum
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ------------------------------ saída ------------------------------ */

const alvos = [
  ['icon-192.png', 192, { scale: 1, radius: 0.22 }],
  ['icon-512.png', 512, { scale: 1, radius: 0.22 }],
  ['icon-180.png', 180, { scale: 1, radius: 0.22 }],
  // Maskable: fundo quadrado inteiro e desenho dentro da área segura.
  ['icon-maskable-512.png', 512, { scale: 0.62, radius: 0 }],
]

for (const [nome, size, opts] of alvos) {
  writeFileSync(join(OUT, nome), png(size, render(size, opts)))
  console.log('gerado', nome, size + 'px')
}
