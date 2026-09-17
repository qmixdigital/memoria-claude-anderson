/*
 * Google Calendar via service account.
 *
 * A agenda do usuário precisa estar compartilhada com o client_email da
 * service account com permissão "Fazer alterações em eventos", e a API
 * Google Calendar precisa estar ativada no projeto da service account.
 */
import { readFileSync } from "node:fs";
import { google, type calendar_v3 } from "googleapis";
import type { EventDraft } from "./extract.js";

let cached: calendar_v3.Calendar | null = null;

function client(): calendar_v3.Calendar {
  if (cached) return cached;
  const path = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "./service-account.json";
  const sa = JSON.parse(readFileSync(path, "utf8")) as { client_email: string; private_key: string };
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  cached = google.calendar({ version: "v3", auth });
  return cached;
}

/** Soma minutos a um "AAAA-MM-DDTHH:MM" local sem converter fuso. */
function addMinutesLocal(startLocal: string, minutes: number): string {
  const [date, time] = startLocal.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi) + minutes * 60_000; // aritmética em UTC só para o cálculo
  const r = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${r.getUTCFullYear()}-${p(r.getUTCMonth() + 1)}-${p(r.getUTCDate())}T${p(r.getUTCHours())}:${p(r.getUTCMinutes())}`;
}

function addDaysDate(date: string, days: number): string {
  const [y, mo, d] = date.split("-").map(Number);
  const r = new Date(Date.UTC(y, mo - 1, d + days));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${r.getUTCFullYear()}-${p(r.getUTCMonth() + 1)}-${p(r.getUTCDate())}`;
}

export function toCalendarEvent(draft: EventDraft, timezone: string, sourceText: string): calendar_v3.Schema$Event {
  const description = `${draft.description}\n\n---\nRecado original: ${sourceText}`;
  if (draft.all_day || !draft.start.includes("T")) {
    const date = draft.start.slice(0, 10);
    return {
      summary: draft.title,
      description,
      start: { date },
      end: { date: addDaysDate(date, 1) }, // fim exclusivo, exigência da API
      // Em evento de dia inteiro os minutos contam da meia-noite: 15h antes = 9h da manhã do dia anterior.
      reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 * 60 }] },
    };
  }
  const start = draft.start.length === 16 ? draft.start + ":00" : draft.start;
  const durationMin = draft.duration_minutes > 0 ? draft.duration_minutes : 60;
  const end = addMinutesLocal(draft.start.slice(0, 16), durationMin) + ":00";
  return {
    summary: draft.title,
    description,
    start: { dateTime: start, timeZone: timezone },
    end: { dateTime: end, timeZone: timezone },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
  };
}

export interface CreatedEvent {
  id: string;
  htmlLink: string;
}

export async function createEvent(event: calendar_v3.Schema$Event): Promise<CreatedEvent> {
  const calendarId = process.env.CALENDAR_ID;
  if (!calendarId) throw new Error("CALENDAR_ID não configurado");
  const res = await client().events.insert({ calendarId, requestBody: event });
  return { id: res.data.id ?? "", htmlLink: res.data.htmlLink ?? "" };
}
