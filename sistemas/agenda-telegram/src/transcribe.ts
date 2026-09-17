/*
 * Transcrição de áudio com Whisper (endpoint compatível com OpenAI).
 * Aceita o .ogg/opus que o Telegram entrega, sem conversão.
 *
 * Provedor escolhido pela chave presente: OPENAI_API_KEY (whisper-1) ou
 * GROQ_API_KEY (whisper-large-v3-turbo). Os dois falam o mesmo formato.
 */

interface Provider {
  url: string;
  model: string;
  key: string;
}

function provider(): Provider | null {
  if (process.env.OPENAI_API_KEY) {
    return { url: "https://api.openai.com/v1/audio/transcriptions", model: "whisper-1", key: process.env.OPENAI_API_KEY };
  }
  if (process.env.GROQ_API_KEY) {
    return { url: "https://api.groq.com/openai/v1/audio/transcriptions", model: "whisper-large-v3-turbo", key: process.env.GROQ_API_KEY };
  }
  return null;
}

export function transcriptionAvailable(): boolean {
  return provider() !== null;
}

export async function transcribe(audio: Buffer, filename = "audio.ogg"): Promise<string> {
  const p = provider();
  if (!p) throw new Error("Nenhuma chave de transcrição (OPENAI_API_KEY ou GROQ_API_KEY)");
  const key = p.key;

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)]), filename);
  form.append("model", p.model);
  form.append("language", "pt");
  form.append("response_format", "json");
  form.append("temperature", "0");

  const res = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Whisper ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { text?: string };
  const text = (data.text ?? "").trim();
  if (!text) throw new Error("Transcrição vazia");
  return text;
}
