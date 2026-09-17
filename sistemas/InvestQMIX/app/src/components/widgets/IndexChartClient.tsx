'use client';

import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';
import { findBySymbol } from '@/lib/indices';

interface IndexQuote {
  symbol: string;
  label: string;
  current: number;
  previousClose: number;
  changePct: number;
  marketTime: number | null;
  series: Array<{ date: string; close: number }>;
}

function fmtMarketTime(t: number | null): string {
  if (!t) return '';
  const dt = new Date(t * 1000);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(dt);
}

function fmtNum(v: number): string {
  if (v >= 1000) return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function fmtPct(v: number): string {
  const s = v > 0 ? '+' : '';
  return `${s}${v.toFixed(2)}%`;
}

export function IndexChartClient({ indexes }: { indexes: IndexQuote[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {indexes.map((idx) => {
        const positive = idx.changePct >= 0;
        const color = positive ? 'var(--primary-hex)' : '#ff6b6b';
        const config = findBySymbol(idx.symbol);
        const href = config ? `/indices/${config.slug}` : null;

        const containerStyle = {
          background: 'var(--card)',
          border: '1px solid var(--border-hex)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px 8px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '4px',
          textDecoration: 'none',
          color: 'inherit',
          cursor: href ? 'pointer' : 'default',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        };

        const cardContent = (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--text-muted)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {idx.label}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
                {fmtPct(idx.changePct)}
              </span>
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--foreground-hex)',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmtNum(idx.current)}
            </div>
            <div style={{ height: '60px', marginTop: '4px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={idx.series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Tooltip
                    contentStyle={{
                      background: '#0a111c',
                      border: `1px solid ${color}55`,
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      padding: '4px 8px',
                    }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                    formatter={(v: number) => [fmtNum(v), idx.label]}
                  />
                  <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>30d · fech. {fmtNum(idx.previousClose)}</span>
              {idx.marketTime && (
                <span title={`Última cotação Yahoo: ${fmtMarketTime(idx.marketTime)} BRT · cache 60s`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color, animation: 'pulseDot 2s ease-in-out infinite' }} />
                  {fmtMarketTime(idx.marketTime).split(', ')[1] ?? ''}
                </span>
              )}
            </div>
          </>
        );

        return href ? (
          <Link key={idx.symbol} href={href} style={containerStyle}>
            {cardContent}
          </Link>
        ) : (
          <div key={idx.symbol} style={containerStyle}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}
