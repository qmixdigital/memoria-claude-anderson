import type { WatchlistRow } from '@/lib/queries/watchlist';

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);
}
function fmtBRLSign(v: number) {
  return v > 0 ? `+${fmtBRL(v)}` : fmtBRL(v);
}
function fmtPct(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
function color(v: number) {
  if (v > 0.001) return 'var(--primary-hex)';
  if (v < -0.001) return '#ff6b6b';
  return 'var(--text-secondary)';
}

export function computeAggregates(rows: WatchlistRow[]) {
  let invested = 0;
  let positionValue = 0;
  let pnlBrl = 0;
  let weightedDays = 0;
  let dayPnlBrl = 0;
  let weightSum = 0;

  for (const r of rows) {
    if (r.purchasePriceBrl !== null && r.quantity !== null) {
      const cap = r.purchasePriceBrl * r.quantity;
      invested += cap;
      if (r.daysHeld !== null) {
        weightedDays += r.daysHeld * cap;
        weightSum += cap;
      }
    }
    if (r.lastQuoteBrl !== null && r.quantity !== null) {
      positionValue += r.lastQuoteBrl * r.quantity;
    }
    if (r.pnlBrl !== null) pnlBrl += r.pnlBrl;
    if (r.lastQuoteBrl !== null && r.lastQuoteChangePct !== null && r.quantity !== null) {
      const yesterday = r.lastQuoteBrl / (1 + r.lastQuoteChangePct / 100);
      dayPnlBrl += (r.lastQuoteBrl - yesterday) * r.quantity;
    }
  }

  const pnlPct = invested > 0 ? (pnlBrl / invested) * 100 : 0;
  const avgDays = weightSum > 0 ? weightedDays / weightSum : null;
  const monthlyPct = avgDays && avgDays > 0 ? (pnlPct / avgDays) * 30 : null;
  const dayPctOnPosition = positionValue > 0 ? (dayPnlBrl / (positionValue - dayPnlBrl)) * 100 : 0;

  return { invested, positionValue, pnlBrl, pnlPct, avgDays, monthlyPct, dayPnlBrl, dayPctOnPosition };
}

interface KpiCardProps {
  label: string;
  primary: string;
  secondary?: string;
  accent?: 'green' | 'red' | 'neutral';
  hint?: string;
  emphasis?: boolean;
}

function KpiCard({ label, primary, secondary, accent = 'neutral', hint, emphasis }: KpiCardProps) {
  const c = accent === 'green' ? 'var(--primary-hex)' : accent === 'red' ? '#ff6b6b' : 'var(--foreground-hex)';
  return (
    <div
      title={hint}
      style={{
        background: 'var(--card)',
        border: emphasis ? '1px solid var(--border-accent)' : '1px solid var(--border-hex)',
        borderRadius: 'var(--radius)',
        padding: '14px 18px',
        boxShadow: emphasis ? 'var(--shadow), var(--glow)' : 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <span
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: c,
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {primary}
      </span>
      {secondary && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {secondary}
        </span>
      )}
    </div>
  );
}

export function WatchlistKpis({ rows }: { rows: WatchlistRow[] }) {
  const a = computeAggregates(rows);

  return (
    <div
      className="grid-kpi"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      <KpiCard
        label="Capital investido"
        primary={fmtBRL(a.invested)}
        secondary={`em ${rows.filter((r) => r.purchasePriceBrl !== null).length} posições`}
        hint="Soma de (preço médio × quantidade) de todas as posições"
      />
      <KpiCard
        label="Patrimônio atual"
        primary={fmtBRL(a.positionValue)}
        secondary={a.avgDays ? `${a.avgDays.toFixed(0)} dias médios na carteira` : undefined}
        hint="Soma de (cotação × quantidade) — valor de mercado da carteira hoje"
      />
      <KpiCard
        label="Resultado total"
        primary={fmtBRLSign(a.pnlBrl)}
        secondary={fmtPct(a.pnlPct)}
        accent={a.pnlBrl > 0 ? 'green' : a.pnlBrl < 0 ? 'red' : 'neutral'}
        hint="Patrimônio − Capital investido"
        emphasis
      />
      <KpiCard
        label="Resultado / mês"
        primary={a.monthlyPct !== null ? fmtPct(a.monthlyPct) : '—'}
        secondary={a.avgDays ? `equivalente em ${a.avgDays.toFixed(0)}d médios` : undefined}
        accent={(a.monthlyPct ?? 0) > 0 ? 'green' : (a.monthlyPct ?? 0) < 0 ? 'red' : 'neutral'}
        hint="Retorno % ÷ dias médios ponderados × 30"
      />
      <KpiCard
        label="Movimento de hoje"
        primary={fmtBRLSign(a.dayPnlBrl)}
        secondary={fmtPct(a.dayPctOnPosition)}
        accent={a.dayPnlBrl > 0 ? 'green' : a.dayPnlBrl < 0 ? 'red' : 'neutral'}
        hint="Quanto sua carteira movimentou hoje (cotação atual vs fechamento de ontem × quantidade)"
      />
    </div>
  );
}
