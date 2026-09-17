import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env.js';

export { qmixInvest } from '@qmix-invest/db/schema';

export const queryClient = postgres(env.DATABASE_URL, {
  max: 5,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

export type Db = typeof db;
