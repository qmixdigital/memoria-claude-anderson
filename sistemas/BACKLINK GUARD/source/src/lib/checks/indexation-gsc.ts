import { getGoogleAccessToken, hasGoogleSa } from "@/lib/google/auth";
import { rootDomain } from "@/lib/utils/domain";

// Check de indexação GRÁTIS via Google Search Console (URL Inspection API).
// Só funciona para domínios que são propriedades verificadas da conta de
// serviço (ver scripts/gsc-verify-domains.ts). Se o domínio não for uma
// propriedade, retorna handled=false para o chamador cair no fallback pago.

let verifiedCache: { set: Set<string>; exp: number } | null = null;
const VERIFIED_TTL_MS = 10 * 60 * 1000;

/** Conjunto de domínios (sem prefixo) que são propriedades sc-domain verificadas. */
export async function getVerifiedDomains(): Promise<Set<string>> {
  const now = Date.now();
  if (verifiedCache && verifiedCache.exp > now) return verifiedCache.set;

  const token = await getGoogleAccessToken();
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as {
    siteEntry?: Array<{ siteUrl: string; permissionLevel: string }>;
  };
  const set = new Set<string>();
  for (const e of json.siteEntry ?? []) {
    if (e.siteUrl.startsWith("sc-domain:")) {
      set.add(e.siteUrl.slice("sc-domain:".length));
    }
  }
  verifiedCache = { set, exp: now + VERIFIED_TTL_MS };
  return set;
}

/** Limpa o cache de propriedades (chamar após verificar novos domínios). */
export function invalidateVerifiedCache(): void {
  verifiedCache = null;
}

export interface GscIndexResult {
  handled: boolean; // true se o domínio é propriedade e a consulta rodou
  indexed: boolean | null;
  coverageState: string | null;
  error: string | null;
}

export async function checkIndexationGsc(url: string): Promise<GscIndexResult> {
  if (!hasGoogleSa()) {
    return { handled: false, indexed: null, coverageState: null, error: null };
  }
  const domain = rootDomain(url);
  if (!domain) {
    return { handled: false, indexed: null, coverageState: null, error: null };
  }

  try {
    const verified = await getVerifiedDomains();
    if (!verified.has(domain)) {
      return { handled: false, indexed: null, coverageState: null, error: null };
    }

    const token = await getGoogleAccessToken();
    const res = await fetch(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl: url,
          siteUrl: `sc-domain:${domain}`,
        }),
      },
    );
    if (!res.ok) {
      return {
        handled: true,
        indexed: null,
        coverageState: null,
        error: `GSC inspect HTTP ${res.status}`,
      };
    }
    const json = (await res.json()) as {
      inspectionResult?: {
        indexStatusResult?: { verdict?: string; coverageState?: string };
      };
    };
    const idx = json.inspectionResult?.indexStatusResult;
    const coverageState = idx?.coverageState ?? null;
    // "PASS" = indexado; coverageState "Submitted and indexed" confirma.
    const indexed =
      idx?.verdict === "PASS" || coverageState === "Submitted and indexed";
    return { handled: true, indexed, coverageState, error: null };
  } catch (e) {
    return {
      handled: true,
      indexed: null,
      coverageState: null,
      error: e instanceof Error ? e.message : "falha GSC",
    };
  }
}
