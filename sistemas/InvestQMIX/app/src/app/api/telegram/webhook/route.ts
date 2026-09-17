import { timingSafeEqual } from 'node:crypto';
import { webhookCallback } from 'grammy';
import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/telegram/bot';
import { env } from '@/lib/env';

/** Comparacao em tempo constante, pra nao vazar o secret byte a byte. */
function secretConfere(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido, 'utf8');
  const b = Buffer.from(esperado, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  // Este endpoint e o UNICO isento de HTTP Basic Auth no vhost do Nginx, porque
  // o Telegram nao consegue mandar credenciais. Toda a protecao mora aqui,
  // entao a verificacao precisa falhar FECHADA: sem secret configurado,
  // ninguem entra. A versao anterior validava `if (SECRET && ...)`, o que
  // deixava o webhook aberto a qualquer POST quando a env estivesse vazia.
  if (!env.TELEGRAM_WEBHOOK_SECRET) {
    return new NextResponse('webhook secret not configured', { status: 503 });
  }

  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (!secret || !secretConfere(secret, env.TELEGRAM_WEBHOOK_SECRET)) {
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
