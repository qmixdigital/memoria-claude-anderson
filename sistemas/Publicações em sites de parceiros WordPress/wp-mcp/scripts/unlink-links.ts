// Remove links (mantendo o texto da ancora) no conteudo BRUTO de posts dos portais parceiros (cofre do wp-mcp).
// Uso (no servidor, em /opt/wp-mcp):  bun run scripts/unlink-links.ts /tmp/plano.json [--aplicar]
// Plano: [{ slug, post_id, hrefs: ["https://...", ...] }]
// Guarda: a lista de hrefs depois = lista de antes sem os removidos, e o texto sem tags nao muda. Nao imprime credencial.
import { readFileSync } from "node:fs";
import { obterCredencial } from "../src/vault/sites.ts";
import { wpGet, wpPostJson } from "../src/wp/client.ts";

interface Item { slug: string; post_id: number; hrefs: string[] }
const plano = JSON.parse(readFileSync(process.argv[2], "utf8")) as Item[];
const aplicar = process.argv.includes("--aplicar");
const lista = (s: string) => (s.match(/href=["'][^"']+["']/gi) ?? []).map((h) => h.slice(6, -1));
const texto = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const out: Record<string, unknown>[] = [];

for (const it of plano) {
  const reg: Record<string, unknown> = { slug: it.slug, post_id: it.post_id };
  try {
    const cred = obterCredencial(it.slug);
    if (!cred) { reg.erro = "site fora do cofre"; out.push(reg); continue; }
    const p = await wpGet<{ id: number; status: string; link: string; content: { raw?: string } }>(
      cred, `/posts/${it.post_id}?context=edit&_fields=id,status,link,content`);
    const raw = p.content?.raw;
    if (typeof raw !== "string") { reg.erro = "sem content.raw"; out.push(reg); continue; }
    let n = 0;
    const alvo = new Set(it.hrefs);
    const novo = raw.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (tudo: string, attrs: string, dentro: string) => {
      const m = /href=["']([^"']+)["']/i.exec(attrs);
      if (m && alvo.has(m[1].replace(/&amp;/g, "&"))) { n++; return dentro; }
      return tudo;
    });
    const esperado = lista(raw).filter((h) => !alvo.has(h.replace(/&amp;/g, "&")));
    reg.removidos = n; reg.link = p.link;
    reg.guarda = JSON.stringify(esperado) === JSON.stringify(lista(novo)) && texto(raw) === texto(novo);
    if (n === 0) { reg.erro = "link nao encontrado no bruto"; out.push(reg); continue; }
    if (aplicar && reg.guarda) {
      await wpPostJson<{ id: number }>(cred, `/posts/${it.post_id}`, { content: novo });
      reg.gravado = true;
    }
  } catch (e) {
    reg.erro = e instanceof Error ? e.message.slice(0, 120) : String(e).slice(0, 120);
  }
  out.push(reg);
}
console.log(JSON.stringify(out));
