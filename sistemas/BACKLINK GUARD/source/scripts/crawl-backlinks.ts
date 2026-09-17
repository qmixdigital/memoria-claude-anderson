// Detecção automática de backlinks: para cada site (Client), rastreia o
// sitemap, abre as páginas e registra os links externos como backlinks.
// Colapsa por destino: 1 backlink por (site -> domínio externo), evitando
// duplicar links sitewide (rodapé/menu) que apareceriam em toda página.
//
// Uso:
//   bun run scripts/crawl-backlinks.ts --all            # todos os sites
//   bun run scripts/crawl-backlinks.ts cinemus.com.br   # um domínio (teste)
//   bun run scripts/crawl-backlinks.ts --all --max=200  # limite de páginas/site

import { prisma } from "@/lib/prisma";
import { getDomain } from "tldts";
import { pMap } from "@/lib/utils/concurrency";

const args = process.argv.slice(2);
const ALL = args.includes("--all");
const MAX_PAGES = Number(
  (args.find((a) => a.startsWith("--max=")) ?? "--max=200").split("=")[1],
);
const targets = args.filter((a) => !a.startsWith("--"));
const PAGE_CONCURRENCY = 8;
const UA =
  "Mozilla/5.0 (compatible; BacklinkGuard/1.0; +https://backlinkguard.qmix.com.br)";

const INFRA = new Set([
  "w.org", "gmpg.org", "schema.org", "gravatar.com", "googleapis.com",
  "gstatic.com", "wp.com", "wp.me", "akismet.com", "wordpress.org",
  "cloudflare.com", "cloudflareinsights.com", "jsdelivr.net", "jquery.com",
]);

async function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/xml,*/*" },
    });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) if (m[1]) out.push(m[1]);
  return out;
}

async function discoverPages(domain: string): Promise<string[]> {
  const bases = [
    `https://${domain}/wp-sitemap.xml`,
    `https://${domain}/sitemap_index.xml`,
    `https://${domain}/sitemap.xml`,
  ];
  let rootXml: string | null = null;
  for (const b of bases) {
    const xml = await fetchText(b);
    if (xml && xml.includes("<loc>")) {
      rootXml = xml;
      break;
    }
  }
  if (!rootXml) return [`https://${domain}/`];

  const pages = new Set<string>();
  for (const u of extractLocs(rootXml)) {
    if (pages.size >= MAX_PAGES) break;
    if (/\.xml(\?|$)/i.test(u)) {
      const sub = await fetchText(u);
      if (sub) {
        for (const p of extractLocs(sub)) {
          if (!/\.xml(\?|$)/i.test(p)) pages.add(p);
          if (pages.size >= MAX_PAGES) break;
        }
      }
    } else {
      pages.add(u);
    }
  }
  return [...pages].slice(0, MAX_PAGES);
}

interface Found {
  articleUrl: string;
  targetUrl: string;
  targetDomain: string;
  anchor: string;
}

function extractExternalLinks(html: string, pageUrl: string, siteDomain: string): Found[] {
  const out: Found[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1] ?? "";
    if (!/^https?:\/\//i.test(href)) continue;
    const d = getDomain(href);
    if (!d || d === siteDomain || INFRA.has(d)) continue;
    if (seen.has(d)) continue;
    seen.add(d);
    const anchor = (m[2] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    out.push({ articleUrl: pageUrl, targetUrl: href, targetDomain: d, anchor });
  }
  return out;
}

async function crawlSite(client: { id: string; domain: string; name: string }): Promise<number> {
  const siteDomain = getDomain(client.domain) ?? client.domain;
  const pages = await discoverPages(client.domain);
  const perPage = await pMap(
    pages,
    async (pageUrl) => {
      const html = await fetchText(pageUrl);
      return html ? extractExternalLinks(html, pageUrl, siteDomain) : [];
    },
    PAGE_CONCURRENCY,
  );

  // 1 backlink por domínio de destino (colapsa sitewide)
  const byTarget = new Map<string, Found>();
  for (const f of perPage.flat()) {
    if (!byTarget.has(f.targetDomain)) byTarget.set(f.targetDomain, f);
  }
  const found = [...byTarget.values()];

  // dedup contra o banco (por destino, qualquer origem)
  const existing = await prisma.backlink.findMany({
    where: { clientId: client.id },
    select: { targetDomain: true },
  });
  const have = new Set(existing.map((e) => e.targetDomain));
  const toCreate = found.filter((f) => !have.has(f.targetDomain));

  if (toCreate.length) {
    await prisma.backlink.createMany({
      data: toCreate.map((f) => ({
        clientId: client.id,
        articleUrl: f.articleUrl,
        expectedTarget: f.targetUrl,
        targetDomain: f.targetDomain,
        expectedAnchor: f.anchor || null,
        type: "DIRECT",
        source: "crawl",
      })),
    });
  }
  console.log(`${client.name}: ${pages.length} páginas, ${toCreate.length} novos (${found.length} destinos únicos)`);
  return toCreate.length;
}

const clients = ALL
  ? await prisma.client.findMany({ select: { id: true, domain: true, name: true } })
  : await prisma.client.findMany({
      where: { OR: targets.map((d) => ({ domain: d })) },
      select: { id: true, domain: true, name: true },
    });

console.log(`rastreando ${clients.length} site(s), max ${MAX_PAGES} paginas/site...`);
let total = 0;
let done = 0;
for (const c of clients) {
  try {
    total += await crawlSite(c);
  } catch (e) {
    console.log(`${c.name}: ERRO ${e instanceof Error ? e.message : e}`);
  }
  done++;
  if (done % 25 === 0) console.log(`--- progresso: ${done}/${clients.length} sites, ${total} backlinks ---`);
}
console.log(`\nCONCLUIDO: ${clients.length} sites, ${total} backlinks detectados`);
await prisma.$disconnect();
