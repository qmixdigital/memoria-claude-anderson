/*
 * Extração do evento a partir do texto (transcrito ou digitado).
 *
 * Usa structured outputs: a resposta do Claude é validada contra o schema
 * Zod antes de chegar aqui, então não existe parse frágil de JSON.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const EventDraftSchema = z.object({
  title: z.string().describe("Título curto do evento, 3 a 8 palavras, em português, começando com verbo ou substantivo. Sem ponto final."),
  description: z.string().describe("Descrição do que precisa ser feito, com todos os detalhes que a pessoa falou (nomes, valores, telefones, contexto). Frases completas."),
  start: z
    .string()
    .describe("Início em ISO 8601 local, sem fuso: 'AAAA-MM-DDTHH:MM' quando tem hora, ou só 'AAAA-MM-DD' quando é dia inteiro."),
  duration_minutes: z
    .number()
    .int()
    .describe("Duração em minutos. Use o que a pessoa disse; senão 60 para compromissos e reuniões, 30 para ligações e tarefas rápidas. 0 quando for dia inteiro."),
  all_day: z.boolean().describe("true quando não há hora definida e o evento vale para o dia todo."),
  confidence_note: z
    .string()
    .nullable()
    .describe("null se a interpretação é segura. Senão, uma frase curta dizendo o que foi assumido (ex.: 'Assumi 15h porque você disse só \"à tarde\"')."),
});

export type EventDraft = z.infer<typeof EventDraftSchema>;

const client = new Anthropic();

function nowInTimezone(timezone: string): { iso: string; weekday: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now); // "2026-09-16 12:34"
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: timezone, weekday: "long" }).format(now);
  return { iso: parts.replace(" ", "T"), weekday };
}

function systemPrompt(timezone: string): string {
  const { iso, weekday } = nowInTimezone(timezone);
  return `Você transforma um recado falado ou digitado em um evento de agenda.

Agora são ${iso} (${weekday}), fuso ${timezone}. Toda data relativa ("amanhã", "sexta", "semana que vem", "daqui a 3 dias", "dia 20") é resolvida a partir desse instante. "Sexta" sem mais nada é a PRÓXIMA sexta-feira, incluindo hoje se hoje for sexta e ainda não passou o horário. "Semana que vem" sem dia é segunda-feira da próxima semana.

Horários por extenso: "de manhã" = 09:00, "meio-dia" = 12:00, "à tarde" = 15:00, "fim da tarde" = 17:00, "à noite" = 19:00. Quando você assumir um horário assim, registre em confidence_note. Sem nenhuma pista de hora, marque all_day = true e start só com a data.

Sem nenhuma pista de data, o evento é hoje. Se a hora já passou hoje, use amanhã e registre em confidence_note.

O texto pode vir de transcrição de áudio com erros de reconhecimento: números trocados, nomes próprios errados, pontuação ausente. Interprete pelo sentido. Não invente detalhes que não foram ditos. A descrição deve preservar tudo o que a pessoa disse, reescrito de forma limpa.

Se receber um rascunho anterior e uma correção, aplique só a correção e mantenha o resto.`;
}

export interface ExtractInput {
  text: string;
  timezone: string;
  /** rascunho anterior, quando a mensagem é uma correção */
  previous?: EventDraft;
}

export async function extractEvent(input: ExtractInput): Promise<EventDraft> {
  const userContent = input.previous
    ? `Rascunho anterior:\n${JSON.stringify(input.previous, null, 2)}\n\nCorreção da pessoa:\n"""${input.text}"""`
    : `Recado:\n"""${input.text}"""`;

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 2048,
    system: systemPrompt(input.timezone),
    output_config: { effort: "medium", format: zodOutputFormat(EventDraftSchema) },
    messages: [{ role: "user", content: userContent }],
  });

  if (!response.parsed_output) {
    throw new Error(`Claude não devolveu um evento válido (stop_reason=${response.stop_reason})`);
  }
  return response.parsed_output;
}
