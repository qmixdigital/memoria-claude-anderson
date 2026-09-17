import Link from 'next/link';
import { WidgetCard, pctColor, fmtPct } from './WidgetCard';
import type { SectorRow } from '@/lib/queries/dashboard';

interface Props {
  sectors: SectorRow[];
}

export function SectorHeatmap({ sectors }: Props) {
  return (
    <WidgetCard title="Heat map setorial" subtitle="Variação média por setor (apenas com cotação intraday)">
      {sectors.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Aguardando classificação setorial dos tickers
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px',
            padding: '14px',
          }}
        >
          {sectors.map((s) => {
            const intensity = Math.min(Math.abs(s.avgChangePct) / 3, 1);
            const bg = s.avgChangePct > 0
              ? `rgba(0, 255, 102, ${0.08 + intensity * 0.18})`
              : s.avgChangePct < 0
                ? `rgba(239, 68, 68, ${0.08 + intensity * 0.18})`
                : 'var(--card-hover)';
            return (
              <div
                key={s.sector}
                style={{
                  background: bg,
                  border: '1px solid var(--border-hex)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.sector}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: pctColor(s.avgChangePct), fontVariantNumeric: 'tabular-nums', fontFamily: 'Montserrat, sans-serif' }}>
                    {fmtPct(s.avgChangePct)}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.tickerCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {s.topUpTicker && <Link href={`/ativo/${s.topUpTicker}`} style={{ color: 'var(--primary-hex)' }}>▲ {s.topUpTicker}</Link>}
                  {s.topDownTicker && <Link href={`/ativo/${s.topDownTicker}`} style={{ color: '#ff6b6b' }}>▼ {s.topDownTicker}</Link>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
