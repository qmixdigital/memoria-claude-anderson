'use client';

import { useState } from 'react';
import { WidgetCard, fmtPct, pctColor } from './WidgetCard';
import type { MoverRow } from '@/lib/queries/dashboard';

interface Props {
  ups: MoverRow[];
  downs: MoverRow[];
  initialLimit?: number;
}

function MoverRow({ r }: { r: MoverRow }) {
  return (
    <li
      style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border-hex)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', minWidth: '70px' }}>
        {r.ticker}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {r.companyName ?? ''}
      </span>
      {r.inWatchlist && <span title="Watchlist" style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>★</span>}
      <div style={{ textAlign: 'right', minWidth: '90px' }}>
        <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}>R$ {r.lastQuote.toFixed(2)}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: pctColor(r.changePct), fontVariantNumeric: 'tabular-nums' }}>
          {fmtPct(r.changePct)}
        </div>
      </div>
    </li>
  );
}

export function IntradayMovers({ ups, downs, initialLimit = 8 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const upsVisible = expanded ? ups : ups.slice(0, initialLimit);
  const downsVisible = expanded ? downs : downs.slice(0, initialLimit);
  const total = Math.max(ups.length, downs.length);

  return (
    <WidgetCard title="Movers do dia" subtitle="Maiores altas e baixas intraday">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
        <div>
          <div style={{ padding: '10px 20px', fontSize: '0.7rem', color: 'var(--primary-hex)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-hex)' }}>
            ▲ Maiores altas ({ups.length})
          </div>
          {ups.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {upsVisible.map((r) => <MoverRow key={r.ticker} r={r} />)}
            </ul>
          )}
        </div>
        <div style={{ borderLeft: '1px solid var(--border-hex)' }}>
          <div style={{ padding: '10px 20px', fontSize: '0.7rem', color: '#ff6b6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-hex)' }}>
            ▼ Maiores baixas ({downs.length})
          </div>
          {downs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {downsVisible.map((r) => <MoverRow key={r.ticker} r={r} />)}
            </ul>
          )}
        </div>
      </div>
      {total > initialLimit && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--card-hover)',
            border: 'none',
            borderTop: '1px solid var(--border-hex)',
            color: 'var(--primary-hex)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {expanded ? `Mostrar menos ↑` : `Ver todas (${ups.length} altas + ${downs.length} baixas) ↓`}
        </button>
      )}
    </WidgetCard>
  );
}
