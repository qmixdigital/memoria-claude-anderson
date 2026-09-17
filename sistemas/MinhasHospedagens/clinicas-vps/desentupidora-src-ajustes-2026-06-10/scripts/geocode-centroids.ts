/**
 * Geocoding por centroide de município (IBGE) — preenche companies.latitude/longitude
 * para empresas que estão sem coordenada, usando o centro da cidade + um jitter
 * determinístico por empresa (estável entre runs) para os pins espalharem no mapa.
 *
 * Uso (na VPS):
 *   export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH
 *   cd /home/user/web/desentupidora.pro/app
 *   CENTROIDS_PATH=/tmp/centroids.json pnpm tsx --env-file=.env.local scripts/geocode-centroids.ts -- --dry-run
 *   CENTROIDS_PATH=/tmp/centroids.json pnpm tsx --env-file=.env.local scripts/geocode-centroids.ts
 */
import "dotenv/config"
import fs from "node:fs"
import { db } from "../src/lib/db"
import { companies } from "../src/lib/db/schema"
import { sql as dsql, and, isNull } from "drizzle-orm"

const CENTROIDS: Record<string, Record<string, [number, number]>> =
  JSON.parse(fs.readFileSync(process.env.CENTROIDS_PATH ?? "/tmp/centroids.json", "utf8"))
const DRY = process.argv.includes("--dry-run")
const JIT = 0.018 // ~2 km de raio de espalhamento

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim()

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

async function main() {
  const rows = await db
    .select({ id: companies.id, cidade: companies.cidade, uf: companies.uf })
    .from(companies)
    .where(and(isNull(companies.latitude), dsql`${companies.cidade} IS NOT NULL AND ${companies.uf} IS NOT NULL`))

  console.log(`[geo] empresas sem coordenada: ${rows.length}`)

  const ids: string[] = [], lats: string[] = [], lngs: string[] = []
  let missed = 0
  for (const r of rows) {
    const c = CENTROIDS[r.uf!]?.[norm(r.cidade!)]
    if (!c) { missed++; continue }
    const h = hash(r.id)
    const jLat = ((h % 2001) / 1000 - 1) * JIT
    const jLng = ((Math.floor(h / 2048) % 2001) / 1000 - 1) * JIT
    ids.push(r.id)
    lats.push((c[0] + jLat).toFixed(6))
    lngs.push((c[1] + jLng).toFixed(6))
  }
  console.log(`[geo] com centroide: ${ids.length} | sem match: ${missed}`)

  if (DRY) { console.log("[geo] DRY-RUN — nenhum update feito."); return }

  // Escreve CSV; o bulk UPDATE é via psql \copy + temp table (evita o limite de params do driver).
  const outPath = process.env.GEO_CSV ?? "/tmp/geo.csv"
  fs.writeFileSync(outPath, "id,lat,lng\n" + ids.map((id, i) => `${id},${lats[i]},${lngs[i]}`).join("\n") + "\n")
  console.log(`[geo] CSV escrito: ${outPath} (${ids.length} linhas)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => process.exit(0))
