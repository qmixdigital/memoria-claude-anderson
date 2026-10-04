// Troca URLs antigas por novas no conteudo BRUTO de posts dos portais parceiros (cofre do wp-mcp).
// Uso (no servidor, em /opt/wp-mcp):  bun run scripts/swap-links.ts /tmp/jean_plano.json [--aplicar]
// Plano: [{ slug, post_id, pares: [[antigo, novo], ...] }]
// Guarda: a lista de hrefs antes e depois tem de ser identica, exceto pelas URLs trocadas. Nao imprime credencial.
import { readFileSync } from "node:fs";
import { obterCredencial } from "../src/vault/sites.ts";
import { wpGet, wpPostJson } from "../src/wp/client.ts";

interface Item { slug: string; post_id: number; pares: [string, string][] }
const plano = JSON.parse(readFileSync(process.argv[2], "utf8")) as Item[];
const aplicar = process.argv.includes("--aplicar");
const hrefs = (s: string) => s.match(/href=["'][^"']+["']/gi) ?? [];
const out: Record<string, unknown>[] = [];

for (const it of plano) {
  const reg: Record<string, unknown> = { slug: it.slug, post_id: it.post_id };
  try {
    const cred = obterCredencial(it.slug);
    if (!cred) { reg.erro = "site fora do cofre"; out.push(reg); continue; }
    const p = await wpGet<{ id: number; status: string; link: string; modified: string; content: { raw?: string } }>(
      cred, `/posts/${it.post_id}?context=edit&_fields=id,status,link,modified,content`);
    const raw = p.content?.raw;
    if (typeof raw !== "string") { reg.erro = "sem content.raw (sem permissao de edicao?)"; out.push(reg); continue; }
    let novo = raw; let n = 0;
    for (const [a, b] of it.pares) {
      const partes = novo.split(a);
      n += partes.length - 1;
      novo = partes.join(b);
    }
    const esperado = hrefs(raw).map((h) => { let x = h; for (const [a, b] of it.pares) x = x.split(a).join(b); return x; });
    const guarda = JSON.stringify(esperado) === JSON.stringify(hrefs(novo));
    reg.status = p.status; reg.link = p.link; reg.trocas = n; reg.guarda = guarda; reg.blocos = raw.includes("<!-- wp:");
    reg.modified_antes = p.modified;
    if (n === 0) { reg.erro = "URL antiga nao encontrada no bruto"; out.push(reg); continue; }
    if (aplicar && guarda) {
      const r = await wpPostJson<{ id: number; modified: string }>(cred, `/posts/${it.post_id}`, { content: novo });
      reg.gravado = true; reg.modified_depois = r.modified;
    }
  } catch (e) {
    reg.erro = e instanceof Error ? e.message.slice(0, 160) : String(e).slice(0, 160);
  }
  out.push(reg);
}
console.log(JSON.stringify(out));
