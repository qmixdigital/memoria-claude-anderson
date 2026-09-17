import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

export { qmixInvest } from '@qmix-invest/db/schema';

const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 10 : 3,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);
export type Db = typeof db;
