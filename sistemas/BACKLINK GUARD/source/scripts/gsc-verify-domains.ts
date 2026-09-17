// Verifica domínios como propriedades do Google Search Console, de forma
// automatizada, usando a conta de serviço + os tokens Cloudflare (DNS TXT).
// Deixa o registro TXT no lugar (o Google revalida periodicamente).
//
// Uso (LOCAL, tem acesso ao contas.json e à chave SA):
//   SA_PATH=.../google-sa.json CONTAS=.../contas.json \
//     bun run scripts/gsc-verify-domains.ts dominio1.com.br dominio2.com.br
//
// Idempotente: pode rodar de novo; domínios já verificados são pulados.

import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const SA_PATH = process.env.SA_PATH!;
const CONTAS = process.env.CONTAS!;
const domains = process.argv.slice(2);
if (domains.length === 0) {
  console.error("informe ao menos um domínio");
  process.exit(1);
}

const sa = JSON.parse(readFileSync(SA_PATH, "utf-8"));
const accounts: Array<{ nome: string; token: string }> = JSON.parse(
  readFileSync(CONTAS, "utf-8"),
);

function b64url(b: Buffer | string) {
  return Buffer.from(b).toString("base64url");
}
let tokenCache: { t: string; exp: number } | null = null;
async function gToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.t;
  const h = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const c = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope:
        "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/siteverification",
      aud: sa.token_uri,
      exp: now + 3600,
      iat: now,
    }),
  );
  const s = crypto.createSign("RSA-SHA256");
  s.update(`${h}.${c}`);
  const jwt = `${h}.${c}.${s.sign(sa.private_key).toString("base64url")}`;
  const r = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const j = await r.json();
  tokenCache = { t: j.access_token, exp: now + 3500 };
  return j.access_token;
}

// Todos os tokens Cloudflare que enxergam a zona (pode haver read-only + edit).
async function findCfCandidates(
  domain: string,
): Promise<Array<{ token: string; zoneId: string; nome: string }>> {
  const out: Array<{ token: string; zoneId: string; nome: string }> = [];
  for (const a of accounts) {
    if (!a.token) continue;
    try {
      const r = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=${domain}`,
        { headers: { Authorization: `Bearer ${a.token}` } },
      );
      const j = await r.json();
      if (j.success && j.result?.length) {
        out.push({ token: a.token, zoneId: j.result[0].id, nome: a.nome });
      }
    } catch {
      /* ignore */
    }
  }
  // tenta os "-edit" primeiro
  return out.sort((a, b) => (b.nome.includes("edit") ? 1 : 0) - (a.nome.includes("edit") ? 1 : 0));
}

// Garante o TXT via um token que REALMENTE escreve. Retorna a conta usada ou null.
async function ensureTxt(
  candidates: Array<{ token: string; zoneId: string; nome: string }>,
  name: string,
  content: string,
): Promise<string | null> {
  for (const cf of candidates) {
    const h = { Authorization: `Bearer ${cf.token}`, "Content-Type": "application/json" };
    // já existe?
    const list = await (
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cf.zoneId}/dns_records?type=TXT&name=${name}`,
        { headers: h },
      )
    ).json();
    const exists = (list.result ?? []).some((d: { content: string }) =>
      d.content.includes(content),
    );
    if (exists) return cf.nome;
    const c = await (
      await fetch(`https://api.cloudflare.com/client/v4/zones/${cf.zoneId}/dns_records`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ type: "TXT", name, content, ttl: 60 }),
      })
    ).json();
    if (c.success) return cf.nome; // escreveu de verdade
    // senão tenta o próximo token (ex.: read-only -> tenta o -edit)
  }
  return null;
}

async function isVerified(domain: string, token: string): Promise<boolean> {
  const r = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("sc-domain:" + domain)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return r.status === 200;
}

async function verifyDomain(domain: string): Promise<string> {
  const token = await gToken();
  if (await isVerified(domain, token)) return "já verificado";

  const candidates = await findCfCandidates(domain);
  if (candidates.length === 0) return "SEM zona Cloudflare";

  // 1) token DNS_TXT
  const tk = await (
    await fetch("https://www.googleapis.com/siteVerification/v1/token", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        site: { type: "INET_DOMAIN", identifier: domain },
        verificationMethod: "DNS_TXT",
      }),
    })
  ).json();
  if (!tk.token) return "falha ao obter token DNS: " + JSON.stringify(tk).slice(0, 120);

  // 2) TXT no Cloudflare (usando um token que ESCREVE de verdade)
  const usedAccount = await ensureTxt(candidates, domain, tk.token);
  if (!usedAccount) return "nenhum token Cloudflare conseguiu escrever o DNS";
  await new Promise((r) => setTimeout(r, 8000)); // propagar

  // 3) verificar (com tentativas)
  let verified = false;
  for (let i = 0; i < 6 && !verified; i++) {
    const v = await fetch(
      "https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ site: { type: "INET_DOMAIN", identifier: domain } }),
      },
    );
    if (v.status === 200) verified = true;
    else await new Promise((r) => setTimeout(r, 5000));
  }
  if (!verified) return `via ${usedAccount}: TXT posto mas não verificou (propagação?)`;

  // 4) adiciona como propriedade sc-domain
  await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("sc-domain:" + domain)}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
  );
  return `VERIFICADO (via ${usedAccount})`;
}

for (const d of domains) {
  try {
    console.log(`${d}: ${await verifyDomain(d)}`);
  } catch (e) {
    console.log(`${d}: ERRO ${e instanceof Error ? e.message : e}`);
  }
}
