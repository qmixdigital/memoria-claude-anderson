import { Bot } from 'grammy';
import { env } from '../env';
import { db } from '../db';
import {
  tickers,
  userPortfolio,
  userPreferences,
} from '@qmix-invest/db/schema';
import { GLOSSARIO_AJUDA } from '@qmix-invest/db/glossario';
import { eq } from 'drizzle-orm';

let botInstance: Bot | null = null;

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseDuration(raw: string): number | null {
  const m = raw.trim().match(/^(\d+)(m|h|d)$/i);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  const unit = m[2]!.toLowerCase();
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  if (unit === 'd') return n * 24 * 60 * 60 * 1000;
  return null;
}

async function getOrCreatePrefs(): Promise<{ id: number; pausedUntil: Date | null }> {
  const rows = (await db.select().from(userPreferences).limit(1)) as Array<{
    id: number;
    pausedUntil: Date | null;
  }>;
  if (rows.length > 0) return rows[0]!;
  const inserted = (await db
    .insert(userPreferences)
    .values({} as never)
    .returning()) as Array<{ id: number; pausedUntil: Date | null }>;
  return inserted[0]!;
}

// ─── bot factory ──────────────────────────────────────────────────────────────

export function getBot(): Bot {
  if (botInstance) return botInstance;
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not configured');
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  // Auth filter: only respond to owner
  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id?.toString();
    if (<<REMOVIDO>> || chatId !== env.TELEGRAM_OWNER_CHAT_ID) {
      return; // silently ignore
    }
    await next();
  });

  // ─── /start ───────────────────────────────────────────────────────────────
  bot.command('start', async (ctx) => {
    await ctx.reply(
      `*QMIX Invest Bot*\n\n` +
        `*Carteira*\n` +
        `/carteira — lista suas posições\n` +
        `/carteira\\_add TICKER — adicionar à carteira\n` +
        `/carteira\\_remove TICKER — remover da carteira\n\n` +
        `*Alertas*\n` +
        `/pausar DURAÇÃO — pausar alertas (ex: /pausar 4h, /pausar 1d)\n` +
        `/retomar — retomar alertas\n` +
        `/config — ver status dos alertas\n\n` +
        `*Ajuda*\n` +
        `/ajuda — explica os termos em linguagem simples\n\n` +
        `*Sistema*\n` +
        `/diag — diagnóstico do sistema\n`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /ajuda — glossário em linguagem simples ────────────────────────────────
  bot.command('ajuda', async (ctx) => {
    const linhas = ['📖 *Glossário — termos explicados*\n'];
    for (const { termo, explicacao } of GLOSSARIO_AJUDA) {
      linhas.push(`*${termo}*: ${explicacao}`);
    }
    await ctx.reply(linhas.join('\n'), { parse_mode: 'Markdown' });
  });

  // ─── /diag ────────────────────────────────────────────────────────────────
  bot.command('diag', async (ctx) => {
    const tickerCount = (await db.select().from(tickers)) as Array<unknown>;
    const portfolioCount = (await db.select().from(userPortfolio)) as Array<unknown>;
    await ctx.reply(
      `*Diagnóstico QMIX Invest*\n\n` +
        `Tickers: ${tickerCount.length}\n` +
        `Posições na carteira: ${portfolioCount.length}\n` +
        `Mode: ${env.MODE}\n`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /carteira ────────────────────────────────────────────────────────────
  bot.command(['carteira', 'watchlist'], async (ctx) => {
    const items = (await db.select().from(userPortfolio)) as Array<{
      ticker: string;
      quantity: number | null;
      purchasePriceBrl: string | null;
    }>;
    if (items.length === 0) {
      await ctx.reply(
        'Carteira vazia. Use /carteira\\_add TICKER para adicionar.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const lines: string[] = ['💼 *Sua carteira*\n'];
    for (const item of items) {
      const qty = item.quantity !== null ? `${item.quantity} cotas` : 'qtd —';
      const avg = item.purchasePriceBrl ? ` @ R$ ${Number(item.purchasePriceBrl).toFixed(2)}` : '';
      lines.push(`*${item.ticker}* — ${qty}${avg}`);
    }
    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  });

  // ─── /carteira_add ────────────────────────────────────────────────────────
  bot.command(['carteira_add', 'watchlist_add'], async (ctx) => {
    const ticker = ctx.match.trim().toUpperCase();
    if (!ticker) {
      await ctx.reply('Uso: /carteira\\_add TICKER', { parse_mode: 'Markdown' });
      return;
    }
    const tickerRow = (await db
      .select({ ticker: tickers.ticker })
      .from(tickers)
      .where(eq(tickers.ticker, ticker))
      .limit(1)) as Array<{ ticker: string }>;
    if (tickerRow.length === 0) {
      await ctx.reply(`Ticker *${ticker}* não encontrado no sistema.`, { parse_mode: 'Markdown' });
      return;
    }
    await db.insert(userPortfolio).values({ ticker } as never).onConflictDoNothing();
    await ctx.reply(`✅ *${ticker}* adicionado à carteira.`, { parse_mode: 'Markdown' });
  });

  // ─── /carteira_remove ─────────────────────────────────────────────────────
  bot.command(['carteira_remove', 'watchlist_remove'], async (ctx) => {
    const ticker = ctx.match.trim().toUpperCase();
    if (!ticker) {
      await ctx.reply('Uso: /carteira\\_remove TICKER', { parse_mode: 'Markdown' });
      return;
    }
    const deleted = (await db
      .delete(userPortfolio)
      .where(eq(userPortfolio.ticker, ticker))
      .returning({ ticker: userPortfolio.ticker })) as Array<{ ticker: string }>;

    if (deleted.length === 0) {
      await ctx.reply(`*${ticker}* não está na carteira.`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`✅ *${ticker}* removido da carteira.`, { parse_mode: 'Markdown' });
    }
  });

  // ─── /config ──────────────────────────────────────────────────────────────
  bot.command('config', async (ctx) => {
    const prefs = await getOrCreatePrefs();
    const paused = prefs.pausedUntil && prefs.pausedUntil > new Date();
    const pausedStr = paused
      ? `⏸ Pausado até ${prefs.pausedUntil!.toISOString().replace('T', ' ').slice(0, 16)} UTC`
      : '▶️ Ativo';

    await ctx.reply(
      `⚙️ *Alertas QMIX Invest*\n\n` +
        `Status: ${pausedStr}\n\n` +
        `/pausar 4h | 30m | 1d | 2d\n` +
        `/retomar`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /pausar ──────────────────────────────────────────────────────────────
  bot.command('pausar', async (ctx) => {
    const raw = ctx.match.trim();
    if (!raw) {
      await ctx.reply('Uso: /pausar DURAÇÃO\nEx: /pausar 4h, /pausar 30m, /pausar 1d');
      return;
    }
    const ms = parseDuration(raw);
    if (ms === null) {
      await ctx.reply('Formato inválido. Use: 30m, 4h, 1d, 2d');
      return;
    }
    const until = new Date(Date.now() + ms);
    const prefs = await getOrCreatePrefs();
    await db
      .update(userPreferences)
      .set({ pausedUntil: until, updatedAt: new Date() } as never)
      .where(eq(userPreferences.id, prefs.id));

    await ctx.reply(
      `⏸ Alertas pausados até *${until.toISOString().replace('T', ' ').slice(0, 16)} UTC*.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /retomar ─────────────────────────────────────────────────────────────
  bot.command('retomar', async (ctx) => {
    const prefs = await getOrCreatePrefs();
    await db
      .update(userPreferences)
      .set({ pausedUntil: null, updatedAt: new Date() } as never)
      .where(eq(userPreferences.id, prefs.id));
    await ctx.reply('▶️ Alertas retomados.');
  });

  // ─── Callback: watchlist_add ──────────────────────────────────────────────
  bot.callbackQuery(/^watchlist_add:(.+)$/, async (ctx) => {
    const ticker = ctx.match[1]!;
    await db.insert(userPortfolio).values({ ticker } as never).onConflictDoNothing();
    await ctx.answerCallbackQuery({ text: `${ticker} adicionado à carteira` });
  });

  bot.catch((err) => {
    console.error('grammY error:', err);
  });

  botInstance = bot;
  return bot;
}
