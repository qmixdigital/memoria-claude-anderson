'use client';

import { SortableTable, type SortableColumn } from './SortableTable';
import { PurchasePriceCell } from './PurchasePriceCell';
import { WatchlistRowActions } from './WatchlistRowActions';
import { AddPurchaseButton } from './AddPurchaseButton';
import type { WatchlistRow } from '@/lib/queries/watchlist';
import { computeAggregates } from './WatchlistKpis';

function fmtBRL(v: number | null, digits = 2) {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: digits }).format(v);
}
function fmtBRLSign(v: number | null) {
  if (v === null) return '—';
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  return v > 0 ? `+${fmt.format(v)}` : fmt.format(v);
}
function fmtPct(v: number | null) {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
function fmtNum(v: number | null) {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR').format(v);
}
function fmtRelative(d: Date | null) {
  if (!d) return '—';
  const diffMin = Math.round((Date.now() - new Date(d).getTime()) / 60_000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function pctClass(v: number | null) {
  if (v === null) return 'fin-neutral';
  if (v > 0) return 'fin-pos';
  if (v < 0) return 'fin-neg';
  return 'fin-neutral';
}

export function WatchlistTable({ rows }: { rows: WatchlistRow[] }) {
  const columns: SortableColumn<WatchlistRow>[] = [
    {
      key: 'ticker',
      label: 'Ticker',
      sortValue: (r) => r.ticker,
      width: '160px',
      className: 'sticky-col',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontWeight: 700,
                fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                fontSize: '0.92rem',
                letterSpacing: '0.02em',
              }}
            >
              {r.ticker}
            </span>
            {r.isSmallCap && (
              <span style={{ fontSize: '0.58rem', padding: '1px 5px', background: '#1e3a5f', color: '#7dd3fc', borderRadius: '3px', fontWeight: 700 }}>SC</span>
            )}
          </div>
          <span
            title={r.companyName ?? ''}
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {r.companyName ?? '—'}
          </span>
        </div>
      ),
      footer: (rows) => (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-montserrat), Montserrat', fontWeight: 700 }}>
          Total · {rows.length}
        </span>
      ),
    },
    {
      key: 'qty',
      label: 'Qtd',
      sortValue: (r) => r.quantity,
      align: 'right',
      width: '76px',
      render: (r) => <span className="fin-num" style={{ fontSize: '0.82rem' }}>{fmtNum(r.quantity)}</span>,
      footer: (rows) => {
        const total = rows.reduce((s, r) => s + (r.quantity ?? 0), 0);
        return <span className="fin-num" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{fmtNum(total)}</span>;
      },
    },
    {
      key: 'quote',
      label: 'Cotação · dia',
      sortValue: (r) => r.lastQuoteBrl,
      align: 'right',
      width: '120px',
      render: (r) => (
        <div className="cell-stack" style={{ alignItems: 'flex-end' }}>
          <span className="fin-num primary">{fmtBRL(r.lastQuoteBrl)}</span>
          <span className={`fin-num secondary ${pctClass(r.lastQuoteChangePct)}`}>
            {fmtPct(r.lastQuoteChangePct)} · {fmtRelative(r.lastQuoteAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'purchase',
      label: 'Preço médio',
      sortValue: (r) => r.purchasePriceBrl,
      align: 'right',
      width: '110px',
      render: (r) => <PurchasePriceCell ticker={r.ticker} purchasePrice={r.purchasePriceBrl} />,
    },
    {
      key: 'pnl',
      label: 'Lucro · %',
      sortValue: (r) => r.pnlPct,
      align: 'right',
      width: '130px',
      render: (r) => (
        <div className="cell-stack" style={{ alignItems: 'flex-end' }}>
          <span className={`fin-num primary ${pctClass(r.pnlBrl)}`} style={{ fontWeight: 700 }}>{fmtBRLSign(r.pnlBrl)}</span>
          <span className={`fin-num secondary ${pctClass(r.pnlPct)}`} style={{ fontWeight: 600 }}>{fmtPct(r.pnlPct)}</span>
        </div>
      ),
      footer: (rows) => {
        const a = computeAggregates(rows);
        return (
          <div className="cell-stack" style={{ alignItems: 'flex-end' }}>
            <span className={`fin-num primary ${pctClass(a.pnlBrl)}`} style={{ fontWeight: 800 }}>{fmtBRLSign(a.pnlBrl)}</span>
            <span className={`fin-num secondary ${pctClass(a.pnlPct)}`} style={{ fontWeight: 700 }}>{fmtPct(a.pnlPct)}</span>
          </div>
        );
      },
    },
    {
      key: 'monthly',
      label: 'Período · mês',
      sortValue: (r) => r.monthlyReturnPct,
      align: 'right',
      width: '110px',
      render: (r) => (
        <div className="cell-stack" style={{ alignItems: 'flex-end' }} title="Tempo desde a primeira compra · retorno mensal equivalente">
          <span className="fin-num primary fin-neutral" style={{ fontWeight: 600 }}>{r.daysHeld !== null ? `${r.daysHeld}d` : '—'}</span>
          <span className={`fin-num secondary ${pctClass(r.monthlyReturnPct)}`} style={{ fontWeight: 600 }}>{fmtPct(r.monthlyReturnPct)}/mês</span>
        </div>
      ),
      footer: (rows) => {
        const a = computeAggregates(rows);
        return (
          <div className="cell-stack" style={{ alignItems: 'flex-end' }}>
            <span className="fin-num primary fin-neutral" style={{ fontWeight: 700 }}>{a.avgDays !== null ? `${a.avgDays.toFixed(0)}d` : '—'}</span>
            <span className={`fin-num secondary ${pctClass(a.monthlyPct)}`} style={{ fontWeight: 700 }}>{a.monthlyPct !== null ? `${fmtPct(a.monthlyPct)}/mês` : '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'value',
      label: 'Posição',
      sortValue: (r) => r.positionValueBrl,
      align: 'right',
      width: '120px',
      render: (r) => <span className="fin-num" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fmtBRL(r.positionValueBrl)}</span>,
      footer: (rows) => {
        const a = computeAggregates(rows);
        return <span className="fin-num" style={{ fontSize: '0.92rem', fontWeight: 800 }}>{fmtBRL(a.positionValue)}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      sortable: false,
      width: '120px',
      render: (r) => (
        <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
          <AddPurchaseButton ticker={r.ticker} currentQty={r.quantity} currentAvg={r.purchasePriceBrl} />
          <WatchlistRowActions ticker={r.ticker} />
        </span>
      ),
    },
  ];

  return (
    <SortableTable<WatchlistRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.ticker}
      defaultSort={{ key: 'pnl', dir: 'desc' }}
      emptyText="Sua watchlist está vazia"
    />
  );
}
