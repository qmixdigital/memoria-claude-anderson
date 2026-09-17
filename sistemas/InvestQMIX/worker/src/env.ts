import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url().refine(
    (s) => s.startsWith('postgres://') || s.startsWith('postgresql://'),
    { message: 'DATABASE_URL must be a postgres:// URL' }
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MODE: z.enum(['dry-run', 'live']).default('dry-run'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  PROXY_POOL: z.string().default(''),
  TELEGRAM_BOT_TOKEN: z.string().default(''),
  TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
  TELEGRAM_OWNER_CHAT_ID: z.string().default(''),
  // Agente de pesquisa de estrategia (simulador). Desligado por padrao: so roda
  // quando as duas coisas estiverem presentes, pra ninguem ligar gasto de API
  // sem querer ao subir um deploy.
  ANTHROPIC_API_KEY: z.string().default(''),
  AGENTE_PESQUISA_ATIVO: z.coerce.boolean().default(false),
  // Robo de IA operando ao vivo. Desligado por padrao pelo mesmo motivo:
  // ninguem liga gasto de API sem querer num deploy.
  ROBO_IA_ATIVO: z.coerce.boolean().default(false),
  ROBO_IA_CAPITAL: z.coerce.number().default(100000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid worker env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
