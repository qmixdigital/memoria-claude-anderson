'use client';

import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useTransition } from 'react';
import { unfollowTicker } from '@/app/actions/watchlist-follow';

interface Props {
  ticker: string;
  companyName: string | null;
  className: string;
  isSmallCap: boolean;
  lastQuote: number | null;
  changePct: number | null;
  series30d: Array<{ date: string; close: number }>;
}

function fmtBRL(v: number | null): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);
}

function fmtPct(v: number | null): string {
  if (v === null) return '';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

export function WatchlistFollowCard({
  ticker,
  companyName,
  className,
  isSmallCap,
  lastQuote,
  changePct,
  series30d,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const positive = changePct !== null && changePct >= 0;
  const color = positive ? 'var(--primary-hex)' : '#ff6b6b';
  const hasData = series30d.length > 1;

  const handleUnfollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Parar de acompanhar ${ticker}?`)) return;
    const fd = new FormData();
    fd.set('ticker', ticker);
    startTransition(async () => {
      await unfollowTicker(fd);
    });
  };

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hex)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px 10px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <button
        type="button"
        onClick={handleUnfollow}
        disabled={isPending}
        title={`Parar de acompanhar ${ticker}`}
        aria-label={`Parar de acompanhar ${ticker}`}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.95rem',
          padding: '4px 6px',
          borderRadius: '4px',
          opacity: isPending ? 0.4 : 1,
        }}
      >
        ✕
      </button>

      <Link
        href={`/ativo/${ticker}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '6px' }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', paddingRight: '20px' }}>
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              fontFamily: 'var(--font-montserrat), Montserrat',
              letterSpacing: '0.02em',
            }}
          >
            {ticker}
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmtPct(changePct)}
          </span>
        </div>

        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isSmallCap && (
            <span style={{ fontSize: '0.55rem', padding: '1px 4px', background: '#1e3a5f', color: '#7dd3fc', borderRadius: '3px', fontWeight: 700 }}>SC</span>
          )}
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0 }}>{className}</span>
          {companyName && (
            <>
              <span>·</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</span>
            </>
          )}
        </div>

        <div
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--foreground-hex)',
            fontFamily: 'var(--font-montserrat), Montserrat',
            lineHeight: 1.05,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmtBRL(lastQuote)}
        </div>

        <div style={{ height: '50px', marginTop: '2px', marginLeft: '-4px', marginRight: '-4px' }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series30d} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Tooltip
                  contentStyle={{
                    background: '#0a111c',
                    border: `1px solid ${color}55`,
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    padding: '4px 8px',
                  }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                  formatter={(v: number) => [fmtBRL(v), ticker]}
                />
                <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '14px' }}>
              sem histórico
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
