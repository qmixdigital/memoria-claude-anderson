// Troca de dominio (enjai.com.br -> enjai.social) em TODOS os posts/paginas dos portais parceiros do cofre.
// Uso (em /opt/wp-mcp):  bun run scripts/swap-dominio.ts [--aplicar] [--site slug]
// Busca por "enjai" (status=any), troca no content.raw/excerpt.raw/title.raw. Guarda: hrefs antes/depois so mudam nas URLs trocadas.
import { listarSites, obterCredencial } from "../src/vault/sites.ts";
import { wpGet, wpPostJson } from "../src/wp/client.ts";

const aplicar = process.argv.includes("--aplicar");
const so = process.argv.includes("--site") ? process.argv[process.argv.indexOf("--site") + 1] : null;
const PARES: [RegExp, string][] = [
  [/https?:(\?\/){2}(?:www\.)?enjai\.com\.br/gi, "https://enjai.social"],
  [/(?<![A-Za-z0-9-])(?:www\.)?enjai\.com\.br/gi, "enjai.social"],
];
const troca = (s: string) => { let n = 0; let o = s; for (const [re, r] of PARES) o = o.replace(re, () => { n++; return r; }); return { o, n }; };
const hrefs = (s: string) => s.match(/href=["'][^"']+["']/gi) ?? [];
type P = { id: number; link: string; status: string; title?: { raw?: string }; content?: { raw?: string }; excerpt?: { raw?: string } };
const out: Record<string, unknown>[] = [];

for (const s of listarSites(true)) {
  if (so && s.slug !== so) continue;
  const cred = obterCredencial(s.slug);
  const reg: Record<string, unknown> = { slug: s.slug, url: s.url };
  if (!cred) { reg.erro = "fora do cofre"; out.push(reg); continue; }
  let achados = 0, trocas = 0, gravados = 0, guardaFalhou = 0; const links: string[] = []; const erros: string[] = [];
  for (const tipo of ["posts", "pages"]) {
    for (let pg = 1; pg < 30; pg++) {
      let lista: P[];
      try {
        lista = await wpGet<P[]>(cred, `/${tipo}?search=enjai&status=any&context=edit&per_page=100&page=${pg}&_fields=id,link,status,title,content,excerpt`);
      } catch (e) { const m = e instanceof Error ? e.message : String(e); if (!/400|invalid_page/.test(m)) erros.push(`${tipo}: ${m.slice(0, 90)}`); break; }
      if (!Array.isArray(lista) || lista.length === 0) break;
      for (const p of lista) {
        const campos: Record<string, string> = {}; let n = 0; let ok = true;
        for (const f of ["content", "excerpt", "title"] as const) {
          const raw = p[f]?.raw; if (typeof raw !== "string" || !/enjai\.com\.br/i.test(raw)) continue;
          const r = troca(raw); n += r.n; campos[f] = r.o;
          if (f === "content") {
            const esp = hrefs(raw).map((h) => troca(h).o);
            if (JSON.stringify(esp) !== JSON.stringify(hrefs(r.o))) ok = false;
          }
        }
        if (n === 0) continue;
        achados++; trocas += n; links.push(`${p.status}:${p.link}`);
        if (!ok) { guardaFalhou++; continue; }
        if (aplicar) {
          try { await wpPostJson(cred, `/${tipo}/${p.id}`, campos); gravados++; } catch (e) { erros.push(`${p.id}: ${(e instanceof Error ? e.message : String(e)).slice(0, 90)}`); }
        }
      }
      if (lista.length < 100) break;
    }
  }
  Object.assign(reg, { achados, trocas, gravados, guardaFalhou, links: links.slice(0, 50), erros });
  out.push(reg);
  console.error(`${s.slug}: achados=${achados} trocas=${trocas} gravados=${gravados} guarda=${guardaFalhou}${erros.length ? " erros=" + erros.length : ""}`);
}
console.log(JSON.stringify(out));
