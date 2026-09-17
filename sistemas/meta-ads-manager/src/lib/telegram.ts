// Envia mensagem para o bot do Telegram (reaproveita o bot OpenGravity).
// Precisa de TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

export async function enviarTelegram(texto: string): Promise<void> {
  if (!TOKEN || !CHAT) {
    throw new Error("TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID nao definido no .env");
  }
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT,
      text: texto,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) {
    throw new Error(`Telegram erro: ${json.description ?? "desconhecido"}`);
  }
}
