import { metaGet } from "./meta-client.ts";

export interface InsightLinha {
  data: string;
  impressoes: number;
  cliques: number;
  gastoCentavos: number;
  cpcCentavos: number;
  cpmCentavos: number;
  alcance: number;
}

interface InsightRaw {
  date_start: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  cpm?: string;
  reach?: string;
}

interface InsightResp {
  data: InsightRaw[];
}

const reais = (v: string | undefined): number =>
  v ? Math.round(parseFloat(v) * 100) : 0;

const inteiro = (v: string | undefined): number => (v ? parseInt(v, 10) : 0);

// Puxa insights de qualquer nivel (campaign, adset, ad) pelo metaId.
// preset aceita: today, yesterday, last_7d, last_30d, this_month, etc.
export async function puxarInsights(
  metaId: string,
  preset = "last_7d"
): Promise<InsightLinha[]> {
  const resp = await metaGet<InsightResp>(`${metaId}/insights`, {
    fields: "impressions,clicks,spend,cpc,cpm,reach",
    date_preset: preset,
    time_increment: "1", // quebra dia a dia
  });

  return resp.data.map((r) => ({
    data: r.date_start,
    impressoes: inteiro(r.impressions),
    cliques: inteiro(r.clicks),
    gastoCentavos: reais(r.spend),
    cpcCentavos: reais(r.cpc),
    cpmCentavos: reais(r.cpm),
    alcance: inteiro(r.reach),
  }));
}
