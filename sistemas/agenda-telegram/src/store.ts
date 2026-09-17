/*
 * Rascunhos pendentes por chat, persistidos em data/pending.json para
 * sobreviver a um reload do PM2 entre o "mostrei o rascunho" e o "confirmar".
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { EventDraft } from "./extract.js";

export interface Pending {
  draft: EventDraft;
  sourceText: string;
  createdAt: number;
}

const FILE = process.env.PENDING_FILE ?? "./data/pending.json";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function loadPending(): Map<number, Pending> {
  const map = new Map<number, Pending>();
  if (!existsSync(FILE)) return map;
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as Record<string, Pending>;
    const cutoff = Date.now() - MAX_AGE_MS;
    for (const [k, v] of Object.entries(raw)) if (v.createdAt > cutoff) map.set(Number(k), v);
  } catch (e) {
    console.error("pending.json ilegível, começando vazio:", e);
  }
  return map;
}

export function savePending(map: Map<number, Pending>): void {
  mkdirSync(FILE.replace(/[\/][^\/]+$/, ""), { recursive: true });
  writeFileSync(FILE, JSON.stringify(Object.fromEntries(map), null, 2));
}
