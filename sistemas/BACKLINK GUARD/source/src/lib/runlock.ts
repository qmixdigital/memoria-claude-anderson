// Lock de execução dos workers de verificação (check-all / indexação paga).
//
// Por que existe: o app roda em DUAS instâncias PM2 (3090/3091) atrás do Nginx.
// O guard antigo era "leio o JSON de status, se running=true eu desisto" — que
// não segura nada: dois cliques quase simultâneos caem em processos diferentes,
// ambos leem running=false e ambos dão spawn. Resultado: duas rodadas pagas em
// paralelo, custo dobrado no DataForSEO.
//
// A garantia aqui vem do flag "wx" do writeFileSync: criação exclusiva é atômica
// no kernel, então só UM processo consegue criar o arquivo de lock.
//
// O lock também guarda o PID do worker, o que resolve o segundo problema: se o
// worker morrer (deploy, pm2 reload, OOM), o status ficava gravado com
// running=true para sempre e o botão nunca mais disparava. Agora um lock cujo
// dono não existe mais é considerado abandonado e pode ser tomado.

import { readFileSync, unlinkSync, writeFileSync } from "node:fs";

export const STATUS_PATH =
  process.env.CHECK_ALL_STATUS ??
  "/var/www/backlinkguard-shared/check-all-status.json";

export const LOCK_PATH =
  process.env.CHECK_ALL_LOCK ?? STATUS_PATH.replace(/\.json$/i, "") + ".lock";

/** Duração máxima plausível de uma rodada. Passou disso, o lock é abandonado. */
const MAX_RUN_MS = 6 * 60 * 60 * 1000; // 6h
/** Prazo que o worker tem pra subir e registrar o próprio PID no lock. */
const BOOT_GRACE_MS = 90 * 1000;

export type RunMode = "free" | "paid";

interface Lock {
  mode: RunMode;
  /** epoch ms de quando o lock foi criado (pelo app, antes do spawn) */
  claimedAt: number;
  /** PID do worker; null enquanto ele ainda não subiu */
  pid: number | null;
}

export interface RunStatus {
  running: boolean;
  total: number;
  done: number;
  startedAt?: string;
  finishedAt?: string | null;
  mode?: RunMode;
}

// ---------------------------------------------------------------------------
// Lock
// ---------------------------------------------------------------------------

function readLock(): Lock | null {
  try {
    const raw = JSON.parse(readFileSync(LOCK_PATH, "utf-8")) as Partial<Lock>;
    if (typeof raw.claimedAt !== "number") return null; // corrompido
    return {
      mode: raw.mode === "paid" ? "paid" : "free",
      claimedAt: raw.claimedAt,
      pid: typeof raw.pid === "number" ? raw.pid : null,
    };
  } catch {
    return null; // não existe ou ilegível
  }
}

/** O processo dono do lock ainda está vivo? (sinal 0 = só testa existência) */
function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // EPERM = existe, mas é de outro usuário. Só ESRCH significa "morreu".
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** O lock foi abandonado (worker morreu, nunca subiu, ou rodada estourou)? */
function isStale(lock: Lock): boolean {
  const age = Date.now() - lock.claimedAt;
  if (age > MAX_RUN_MS) return true; // rodada longa demais pra ser real
  if (lock.pid === null) return age > BOOT_GRACE_MS; // worker não subiu
  return !pidAlive(lock.pid); // worker morreu no meio
}

function tryCreate(lock: Lock): boolean {
  try {
    writeFileSync(LOCK_PATH, JSON.stringify(lock), {
      flag: "wx", // criação exclusiva: falha se o arquivo já existe (atômico)
      encoding: "utf-8",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Tenta reservar a execução. Retorna false se já há uma rodada viva.
 * Chamado pelo app ANTES de dar spawn no worker.
 */
export function claimRun(mode: RunMode): boolean {
  const fresh: Lock = { mode, claimedAt: Date.now(), pid: null };
  if (tryCreate(fresh)) return true;

  // Já existe um lock: só tomamos se o dono anterior sumiu.
  const existing = readLock();
  if (existing && !isStale(existing)) return false;

  try {
    unlinkSync(LOCK_PATH);
  } catch {
    /* outro processo pode ter removido primeiro — tudo bem */
  }
  return tryCreate({ ...fresh, claimedAt: Date.now() });
}

/**
 * Chamado pelo worker ao iniciar: grava o próprio PID no lock, para que uma
 * morte súbita dele seja detectável. Retorna false se outra rodada VIVA já é
 * dona do lock (caso de alguém rodar o script na mão durante uma rodada).
 */
export function adoptRun(mode: RunMode): boolean {
  const existing = readLock();
  if (
    existing &&
    existing.pid !== null &&
    existing.pid !== process.pid &&
    !isStale(existing)
  ) {
    return false;
  }
  try {
    writeFileSync(
      LOCK_PATH,
      JSON.stringify({
        mode,
        claimedAt: existing?.claimedAt ?? Date.now(),
        pid: process.pid,
      } satisfies Lock),
      "utf-8",
    );
    return true;
  } catch {
    return false;
  }
}

/** Libera a execução. Sempre chamar no finally do worker. */
export function releaseRun(): void {
  try {
    unlinkSync(LOCK_PATH);
  } catch {
    /* já removido */
  }
}

/** Há uma rodada realmente viva agora? */
export function isRunning(): boolean {
  const lock = readLock();
  return lock !== null && !isStale(lock);
}

// ---------------------------------------------------------------------------
// Status (progresso exibido na UI)
// ---------------------------------------------------------------------------

export function writeStatus(s: RunStatus): void {
  try {
    writeFileSync(STATUS_PATH, JSON.stringify(s), "utf-8");
  } catch {
    /* ignore */
  }
}

/**
 * Lê o progresso, RECONCILIADO com o lock: se o arquivo diz running=true mas
 * não há mais nenhum worker vivo, reportamos parado. É isso que impede o botão
 * de travar para sempre quando o worker é morto por um deploy.
 */
export function readStatus(): RunStatus {
  let s: RunStatus;
  try {
    s = JSON.parse(readFileSync(STATUS_PATH, "utf-8")) as RunStatus;
  } catch {
    return { running: false, total: 0, done: 0 };
  }
  if (s.running && !isRunning()) {
    return { ...s, running: false, finishedAt: s.finishedAt ?? null };
  }
  return s;
}
