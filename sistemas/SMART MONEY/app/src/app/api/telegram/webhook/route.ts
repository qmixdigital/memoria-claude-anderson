import { webhookCallback } from 'grammy';
import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/telegram/bot';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  // Validate Telegram secret token
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (env.TELEGRAM_WEBHOOK_SECRET && secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new NextResponse('forbidden', { status: 403 });
  }

  if (!env.TELEGRAM_BOT_TOKEN) {
    return new NextResponse('telegram not configured', { status: 503 });
  }

  const bot = getBot();
  const handler = webhookCallback(bot, 'std/http');
  return handler(req);
}

export const dynamic = 'force-dynamic';
