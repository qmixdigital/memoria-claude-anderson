import { readFileSync, writeFileSync, existsSync } from "fs";
import { obterCredencial } from "/opt/wp-mcp/src/vault/sites.ts";
import { wpPostBinary, wpPostJson } from "/opt/wp-mcp/src/wp/client.ts";
import { criarPost, atualizarPost } from "/opt/wp-mcp/src/wp/posts.ts";
import { listarCategorias } from "/opt/wp-mcp/src/wp/taxonomies.ts";

const DIR = "/tmp/casasrec";
const manifest: any[] = JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8"));
const outPath = `${DIR}/resultado.json`;
const out: Record<string, any> = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};

function extrairHrefs(html: string): string[] {
  const re = /<a\s+href="([^"]+)"/g;
  const r: string[] = [];
  let m;
  while ((m = re.exec(html))) r.push(m[1]);
  return r;
}

for (const item of manifest) {
  const n = item.n;
  if (out[n]?.status === "publish") { console.log(n, "ja publicado, pulando"); continue; }
  const cred = obterCredencial(item.site);
  if (!cred) { console.log(n, "SEM CREDENCIAL", item.site); out[n] = { erro: "sem_credencial" }; continue; }
  try {
    const bytes = readFileSync(`${DIR}/${item.img}`);
    const legenda = `Imagem de ${item.autor} via ${item.fonte}`;
    const mediaResp: any = await wpPostBinary(cred, "/media", new Uint8Array(bytes), "image/webp", item.img);
    await wpPostJson(cred, `/media/${mediaResp.id}`, { alt_text: item.alt, caption: legenda });

    const cats: any[] = await listarCategorias(cred);
    const saude = cats.find((c: any) => /sa[uú]de/i.test(c.name));
    const categorias = saude ? [saude.id] : [];

    const r = await criarPost(cred, {
      titulo: item.titulo,
      conteudo_html: item.html,
      resumo: item.resumo,
      slug: item.slug,
      categorias,
      tags: [],
      imagem_destaque_id: mediaResp.id,
      status: "publish",
    });

    // confere se a legenda aparece ao vivo; senao injeta fallback na primeira linha
    const liveRes = await fetch(r.link, { headers: { "User-Agent": "Mozilla/5.0" } });
    const liveHtml = await liveRes.text();
    let figura = false;
    if (!liveHtml.includes("Imagem de ")) {
      const fallback = `<figure class="wp-block-image"><figcaption class="wp-element-caption">${legenda}</figcaption></figure>\n\n`;
      await atualizarPost(cred, r.post_id, { conteudo_html: fallback + item.html });
      figura = true;
    }

    out[n] = {
      site: item.site, post_id: r.post_id, link: r.link, status: r.status,
      link_edicao: r.link_edicao, media_id: mediaResp.id, legenda, figura,
      ancora: item.ancora, destino: item.destino,
    };
    console.log(n, "OK", item.site, r.link);
  } catch (e: any) {
    console.log(n, "ERRO", item.site, e?.message || String(e));
    out[n] = { erro: e?.message || String(e) };
  }
  writeFileSync(outPath, JSON.stringify(out, null, 1));
}
console.log("FIM");
