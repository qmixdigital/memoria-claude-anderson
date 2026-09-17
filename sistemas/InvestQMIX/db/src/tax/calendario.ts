// Calendário de dias úteis da B3 (feriados nacionais + pregão).
// Necessário para o vencimento do DARF (último dia útil do mês seguinte) e
// para o DIA_ALERTA (penúltimo dia útil do mês). Manter a lista por ano.

export const FERIADOS_B3: ReadonlySet<string> = new Set([
  // 2026
  '2026-01-01', // Confraternização Universal
  '2026-02-16', // Carnaval (segunda)
  '2026-02-17', // Carnaval (terça)
  '2026-04-03', // Sexta-feira Santa
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-06-04', // Corpus Christi
  '2026-09-07', // Independência
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-11-20', // Consciência Negra
  '2026-12-24', // B3 não opera
  '2026-12-25', // Natal
  '2026-12-31', // B3 não opera
  // 2027 (parcial — completar conforme calendário oficial)
  '2027-01-01',
]);

function iso(year: number, month1to12: number, day: number): string {
  const m = String(month1to12).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

// Dia da semana 0=domingo..6=sábado, em UTC (datas tratadas como civis, sem fuso).
function weekday(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

export function isBusinessDay(dateIso: string, feriados: ReadonlySet<string> = FERIADOS_B3): boolean {
  const wd = weekday(dateIso);
  if (wd === 0 || wd === 6) return false; // fim de semana
  return !feriados.has(dateIso);
}

function daysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

// Último dia útil do mês (year, month 1-12).
export function lastBusinessDayOfMonth(
  year: number,
  month1to12: number,
  feriados: ReadonlySet<string> = FERIADOS_B3,
): string {
  for (let d = daysInMonth(year, month1to12); d >= 1; d--) {
    const date = iso(year, month1to12, d);
    if (isBusinessDay(date, feriados)) return date;
  }
  return iso(year, month1to12, daysInMonth(year, month1to12)); // fallback (não deve ocorrer)
}

// N-ésimo último dia útil (1 = último, 2 = penúltimo, ...).
export function nthLastBusinessDayOfMonth(
  year: number,
  month1to12: number,
  n: number,
  feriados: ReadonlySet<string> = FERIADOS_B3,
): string {
  let count = 0;
  for (let d = daysInMonth(year, month1to12); d >= 1; d--) {
    const date = iso(year, month1to12, d);
    if (isBusinessDay(date, feriados)) {
      count++;
      if (count === n) return date;
    }
  }
  return lastBusinessDayOfMonth(year, month1to12, feriados);
}

// Próximo dia útil após a data dada (data-ex = dia útil seguinte à data-com).
export function nextBusinessDay(dateIso: string, feriados: ReadonlySet<string> = FERIADOS_B3): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const cur = new Date(Date.UTC(y!, m! - 1, d!));
  do {
    cur.setUTCDate(cur.getUTCDate() + 1);
  } while (!isBusinessDay(cur.toISOString().slice(0, 10), feriados));
  return cur.toISOString().slice(0, 10);
}

// Quantidade de dias úteis estritamente entre duas datas (exclui a inicial, inclui a final).
export function businessDaysBetween(
  fromIso: string,
  toIso: string,
  feriados: ReadonlySet<string> = FERIADOS_B3,
): number {
  if (fromIso >= toIso) return 0;
  let count = 0;
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const cur = new Date(Date.UTC(fy!, fm! - 1, fd!));
  for (;;) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const iso = cur.toISOString().slice(0, 10);
    if (iso > toIso) break;
    if (isBusinessDay(iso, feriados)) count++;
  }
  return count;
}

// Vencimento do DARF: último dia útil do mês SEGUINTE ao mês de apuração.
export function darfDueDate(
  apuracaoYear: number,
  apuracaoMonth1to12: number,
  feriados: ReadonlySet<string> = FERIADOS_B3,
): string {
  let y = apuracaoYear;
  let m = apuracaoMonth1to12 + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return lastBusinessDayOfMonth(y, m, feriados);
}
