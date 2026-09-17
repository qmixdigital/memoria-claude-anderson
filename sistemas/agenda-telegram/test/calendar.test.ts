import test from "node:test";
import assert from "node:assert/strict";
import { toCalendarEvent } from "../src/calendar.js";

const tz = "America/Sao_Paulo";

test("evento com hora vira dateTime com fuso e duração", () => {
  const ev = toCalendarEvent(
    { title: "Ligar pro dentista", description: "Remarcar limpeza", start: "2026-09-18T15:00", duration_minutes: 30, all_day: false, confidence_note: null },
    tz,
    "recado"
  );
  assert.equal(ev.start?.dateTime, "2026-09-18T15:00:00");
  assert.equal(ev.end?.dateTime, "2026-09-18T15:30:00");
  assert.equal(ev.start?.timeZone, tz);
  assert.match(ev.description ?? "", /Recado original: recado/);
});

test("duração cruza a meia-noite sem quebrar", () => {
  const ev = toCalendarEvent(
    { title: "x", description: "", start: "2026-09-30T23:30", duration_minutes: 60, all_day: false, confidence_note: null },
    tz, ""
  );
  assert.equal(ev.end?.dateTime, "2026-10-01T00:30:00");
});

test("dia inteiro usa date e fim exclusivo no dia seguinte", () => {
  const ev = toCalendarEvent(
    { title: "Pagar boleto", description: "", start: "2026-09-30", duration_minutes: 0, all_day: true, confidence_note: null },
    tz, ""
  );
  assert.equal(ev.start?.date, "2026-09-30");
  assert.equal(ev.end?.date, "2026-10-01");
  assert.equal(ev.start?.dateTime, undefined);
});
