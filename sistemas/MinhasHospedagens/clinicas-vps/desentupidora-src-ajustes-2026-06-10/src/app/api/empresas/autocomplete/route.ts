// src/app/api/empresas/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { companies } from "@/lib/db/schema"
import { eq, and, ilike, or, desc } from "drizzle-orm"
import { tituloEmpresa, cidadeLabel } from "@/lib/empresas/utils"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ data: [] })

  const pattern = `%${q}%`
  const rows = await db
    .select({
      slug: companies.slug,
      nome: companies.nome,
      uf: companies.uf,
      cidade: companies.cidade,
      verificada: companies.verificada,
    })
    .from(companies)
    .where(and(
      eq(companies.status, "active"),
      or(ilike(companies.nome, pattern), ilike(companies.razao_social, pattern), ilike(companies.cnpj, pattern)),
    ))
    .orderBy(desc(companies.verificada), desc(companies.destaque), companies.nome)
    .limit(8)

  return NextResponse.json({
    data: rows.map(r => ({
      slug: r.slug,
      nome: tituloEmpresa(r.nome),
      local: r.cidade && r.uf ? `${cidadeLabel(r.cidade, r.uf)}/${r.uf}` : r.uf || "",
      verificada: r.verificada,
    })),
  })
}
