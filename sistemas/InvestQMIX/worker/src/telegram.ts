import { env } from './env.js';
import { logger } from './logger.js';

type TelegramReplyMarkup = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

async function callSendMessage(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; messageId?: number }> {
  if (!env.TELEGRAM_BOT_TOKEN || <<REMOVIDO>>) {
    logger.warn('telegram not configured, skipping message');
    return { ok: false };
  }
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await resp.json()) as {
      ok: boolean;
      result?: { message_id: number };
      description?: string;
    };
    if (!data.ok) {
      logger.error({ description: data.description }, 'telegram sendMessage failed');
      return { ok: false };
    }
    return { ok: true, messageId: data.result?.message_id };
  } catch (err) {
    logger.error({ err }, 'telegram sendMessage threw');
    return { ok: false };
  }
}

export async function sendTelegramMessage(
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<{ ok: boolean; messageId?: number }> {
  return callSendMessage({
    chat_id: env.TELEGRAM_OWNER_CHAT_ID,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  });
}

export async function sendTelegramMessageWithKeyboard(
  text: string,
  keyboard: TelegramReplyMarkup,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<{ ok: boolean; messageId?: number }> {
  return callSendMessage({
    chat_id: env.TELEGRAM_OWNER_CHAT_ID,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
    reply_markup: keyboard,
  });
}
