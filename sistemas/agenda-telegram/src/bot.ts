/*
 * Bot Telegram: áudio ou texto -> rascunho -> confirmação -> Google Calendar.
 *
 * Só responde ao chat autorizado. Mantém um rascunho pendente por chat: uma
 * nova mensagem enquanto há rascunho é tratada como correção ("não, é às
 * 16h"), e os botões Confirmar / Cancelar fecham o ciclo.
 */
import { Bot, InlineKeyboard, type Context } from "grammy";
import { extractEvent, type EventDraft } from "./extract.js";
import { transcribe, transcriptionAvailable } from "./transcribe.js";
import { createEvent, toCalendarEvent } from "./calendar.js";
import { loadPending, savePending, type Pending } from "./store.js";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function formatWhen(draft: EventDraft): string {
  const [date, time] = draft.start.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const day = `${wd} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  if (draft.all_day || !time) return `${day} · dia inteiro`;
  const dur = draft.duration_minutes >= 60 ? `${draft.duration_minutes / 60}h` : `${draft.duration_minutes}min`;
  return `${day} · ${time.slice(0, 5)} (${dur})`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderCard(draft: EventDraft, transcript: string | null): string {
  const lines = [
    `📅 <b>${escapeHtml(draft.title)}</b>`,
    `🕒 ${escapeHtml(formatWhen(draft))}`,
    ``,
    escapeHtml(draft.description),
  ];
  if (draft.confidence_note) lines.push(``, `⚠️ ${escapeHtml(draft.confidence_note)}`);
  if (transcript) lines.push(``, `<i>🎙 "${escapeHtml(transcript)}"</i>`);
  lines.push(``, `Confirmar? Ou mande a correção por áudio ou texto.`);
  return lines.join("\n");
}

const keyboard = new InlineKeyboard().text("✅ Confirmar", "confirm").text("❌ Cancelar", "cancel");

export function createBot(): Bot {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const allowed = Number(process.env.ALLOWED_CHAT_ID);
  const timezone = process.env.TIMEZONE ?? "America/Sao_Paulo";
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN não configurado");
  if (!allowed) throw new Error("ALLOWED_CHAT_ID não configurado");

  const bot = new Bot(token);
  const pending = loadPending(); // chatId -> rascunho

  // Porteiro: qualquer chat que não seja o autorizado é ignorado em silêncio.
  bot.use(async (ctx, next) => {
    if (ctx.chat?.id !== allowed) return;
    await next();
  });

  bot.command("start", (ctx) =>
    ctx.reply(
      "Manda um áudio ou texto com o que precisa entrar na agenda. Eu mostro como entendi, você confirma, e o evento vai pro Google Calendar." +
        (transcriptionAvailable() ? "" : "\n\n(Transcrição de áudio ainda não configurada: por enquanto só texto.)")
    )
  );

  bot.command("cancelar", async (ctx) => {
    if (pending.delete(ctx.chat.id)) savePending(pending);
    await ctx.reply("Rascunho descartado.");
  });

  async function handleText(ctx: Context, text: string, transcript: string | null) {
    const chatId = ctx.chat!.id;
    const previous = pending.get(chatId)?.draft;
    await ctx.replyWithChatAction("typing");
    let draft: EventDraft;
    try {
      draft = await extractEvent({ text, timezone, previous });
    } catch (e) {
      console.error("extract:", e);
      await ctx.reply("Não consegui interpretar. Tenta de novo com data e hora mais claras.");
      return;
    }
    const sourceText = previous ? `${pending.get(chatId)!.sourceText} | correção: ${text}` : text;
    const entry: Pending = { draft, sourceText, createdAt: Date.now() };
    pending.set(chatId, entry);
    savePending(pending);
    await ctx.reply(renderCard(draft, transcript), { parse_mode: "HTML", reply_markup: keyboard });
  }

  bot.on("message:text", (ctx) => handleText(ctx, ctx.message.text, null));

  bot.on(["message:voice", "message:audio"], async (ctx) => {
    if (!transcriptionAvailable()) {
      await ctx.reply("Transcrição de áudio ainda não está configurada. Manda em texto por enquanto.");
      return;
    }
    await ctx.replyWithChatAction("typing");
    try {
      const file = await ctx.getFile();
      const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const audio = Buffer.from(await res.arrayBuffer());
      const name = file.file_path?.split("/").pop() ?? "audio.ogg";
      const text = await transcribe(audio, name);
      await handleText(ctx, text, text);
    } catch (e) {
      console.error("voice:", e);
      await ctx.reply("Não consegui transcrever esse áudio. Tenta de novo ou manda em texto.");
    }
  });

  bot.callbackQuery("cancel", async (ctx) => {
    const chatId = ctx.chat!.id;
    if (pending.delete(chatId)) savePending(pending);
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.reply("Cancelado.");
  });

  bot.callbackQuery("confirm", async (ctx) => {
    const chatId = ctx.chat!.id;
    const entry = pending.get(chatId);
    await ctx.answerCallbackQuery();
    if (!entry) {
      await ctx.reply("Não tem rascunho pendente. Manda o recado de novo.");
      return;
    }
    try {
      const event = toCalendarEvent(entry.draft, timezone, entry.sourceText);
      const created = await createEvent(event);
      pending.delete(chatId);
      savePending(pending);
      await ctx.editMessageReplyMarkup({ reply_markup: undefined });
      await ctx.reply(
        `✅ Agendado: <b>${escapeHtml(entry.draft.title)}</b>\n${escapeHtml(formatWhen(entry.draft))}\n<a href="${created.htmlLink}">Abrir no Google Calendar</a>`,
        { parse_mode: "HTML", link_preview_options: { is_disabled: true } }
      );
    } catch (e) {
      console.error("calendar:", e);
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(`Não consegui criar o evento no Google Calendar.\n<code>${escapeHtml(msg.slice(0, 300))}</code>\nO rascunho continua salvo: toque em Confirmar de novo depois de corrigir o acesso.`, {
        parse_mode: "HTML",
      });
    }
  });

  bot.catch((err) => console.error("bot:", err.error));
  return bot;
}
