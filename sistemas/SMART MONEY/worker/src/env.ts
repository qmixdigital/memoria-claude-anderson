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
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid worker env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
