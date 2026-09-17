/**
 * Geocoding PRECISO por CEP (BrasilAPI) — sobe o pin do centroide da cidade para o
 * endereço real. Só para empresas que valem a precisão: PAGAS ou REIVINDICADAS.
 * (O painel já faz isso quando uma empresa paga troca o CEP; este script é para
 *  rodar em lote/cron e cobrir as que não passaram pelo painel.)
 *
 * Uso (VPS):
 *   export PATH=/root/.nvm/versions/node/v20.20.2/bin:$PATH
 *   cd /home/user/web/desentupidora.pro/app
 *   pnpm tsx --env-file=.env.local scripts/geocode-precise.ts                 # todas pagas + reivindicadas
 *   pnpm tsx --env-file=.env.local scripts/geocode-precise.ts -- --slug=nome  # uma específica
 */
import "dotenv/config"
import { db } from "../src/lib/db"
import { companies } from "../src/lib/db/schema"
import { and, or, eq, isNotNull, gt, sql } from "drizzle-orm"
import { geocodarPorCep } from "../src/lib/geocoding"

const slugArg = process.argv.find(a => a.startsWith("--slug="))?.split("=")[1]
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  const where = slugArg
    ? eq(companies.slug, slugArg)
    : and(
        isNotNull(companies.cep),
        or(isNotNull(companies.owner_user_id), gt(companies.plan_paid_until, sql`now()`)),
      )

  const rows = await db
    .select({ id: companies.id, slug: companies.slug, cep: companies.cep })
    .from(companies)
    .where(where)

  console.log(`[geo-preciso] empresas alvo: ${rows.length}`)
  let ok = 0, miss = 0
  for (const r of rows) {
    if (!r.cep) { miss++; continue }
    const geo = await geocodarPorCep(r.cep)
    if (geo?.lat && geo?.lng) {
      await db.update(companies)
        .set({ latitude: String(geo.lat), longitude: String(geo.lng), updated_at: new Date() })
        .where(eq(companies.id, r.id))
      ok++
      console.log(`  ✓ ${r.slug} -> ${geo.lat},${geo.lng}`)
    } else {
      miss++
    }
    await sleep(150) // gentil com a BrasilAPI
  }
  console.log(`[geo-preciso] precisos: ${ok} | CEP sem coords: ${miss}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => process.exit(0))
