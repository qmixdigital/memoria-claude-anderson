import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // DataForSEO é opcional: sem credenciais, o check de indexação é pulado
  // (marcado como "desconhecido") em vez de quebrar a aplicação.
  DATAFORSEO_LOGIN: z.string().optional().default(""),
  DATAFORSEO_PASSWORD: z.string().optional().default(""),
  DEFAULT_LOCATION_CODE: z.coerce.number().default(2076),
  DEFAULT_LANGUAGE_CODE: z.string().default("pt"),
  // UA de navegador real: muitos sites/WAFs devolvem 403 para user-agents que
  // "parecem robô". Usar um Chrome atual derruba a maioria dos falsos bloqueios.
  FETCH_USER_AGENT: z
    .string()
    .default(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    ),
  // Rapid URL Indexer: empurra indexação de URL em site de terceiro, onde não
  // temos Search Console nem IndexNow. Opcional: sem chave, o botão não aparece.
  RAPIDURL_API_KEY: z.string().optional().default(""),
  // Apex custa 3 créditos por URL (1 volta se não indexar) e tenta 3 vezes.
  RAPIDURL_APEX: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
});

export const env = envSchema.parse(process.env);

/** true quando há chave do Rapid URL Indexer. */
export const hasRapidUrl = Boolean(<<REMOVIDO>>);

/** true quando há credenciais para consultar indexação via DataForSEO. */
export const hasDataForSeo = Boolean(
  env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD,
);
