'use client';

import Link from 'next/link';
import { SortableTable, type SortableColumn } from './SortableTable';
import type { UpcomingProvento, TopYieldRow, PortfolioYieldRow } from '@/lib/queries/proventos';

function fmtBRL(v: number | null, digits = 2): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}
function fmtDateBR(s: string | null): string {
  if (!s) return '—';
  const [y, m, d] = s.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
function fmtPct(v: number | null): string {
  if (v === null) return '—';
  return `${v.toFixed(2)}%`;
}

function eventBadge(eventType: string) {
  const upper = eventType.toUpperCase();
  if (upper.includes('JUROS')) return { color: '#fbbf24', label: 'JCP' };
  if (upper.includes('DIVIDENDO')) return { color: 'var(--primary-hex)', label: 'Dividendo' };
  if (upper.includes('BONIF')) return { color: '#a78bfa', label: 'Bonificação' };
  if (upper.includes('DESDOBR')) return { color: '#60a5fa', label: 'Desdobramento' };
  if (upper.includes('GRUPAM')) return { color: '#f472b6', label: 'Grupamento' };
  return { color: 'var(--text-muted)', label: eventType };
}

// ───────────────────────────────────────────────────────────
// Tabela de proventos (próximos pagamentos)
// ───────────────────────────────────────────────────────────
export function UpcomingProventosTable({
  rows, highlightExpected,
}: {
  rows: UpcomingProvento[];
  highlightExpected: boolean;
}) {
  const columns: SortableColumn<UpcomingProvento>[] = [
    {
      key: 'ticker',
      label: 'Ticker',
      sortValue: (p) => p.ticker,
      render: (p) => (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link href={`/ativo/${p.ticker}`} style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{p.ticker}</Link>
            {p.qtyInPortfolio !== null && p.qtyInPortfolio > 0 && (
              <span title={`${p.qtyInPortfolio} cotas`} style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>💼</span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.companyName ?? '—'}
          </div>
        </>
      ),
    },
    {
      key: 'eventType',
      label: 'Tipo',
      sortValue: (p) => p.eventType,
      render: (p) => {
        const b = eventBadge(p.eventType);
        return (
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: `${b.color}22`, color: b.color, borderRadius: '4px', fontWeight: 700 }}>
            {b.label}
          </span>
        );
      },
    },
    { key: 'comDate', label: 'Data COM', sortValue: (p) => p.comDate ?? '', render: (p) => <span style={{ fontSize: '0.82rem' }}>{fmtDateBR(p.comDate)}</span> },
    { key: 'paymentDate', label: 'Pagamento', sortValue: (p) => p.paymentDate ?? '', render: (p) => <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{fmtDateBR(p.paymentDate)}</span> },
    { key: 'gross', label: 'R$/cota', sortValue: (p) => p.grossPerShareBrl, align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{p.grossPerShareBrl !== null ? `R$ ${p.grossPerShareBrl.toFixed(4)}` : '—'}</span> },
    { key: 'dy', label: 'DY', sortValue: (p) => p.dyEventPct, align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', fontWeight: 600, color: p.dyEventPct ? 'var(--primary-hex)' : 'var(--text-muted)' }}>{fmtPct(p.dyEventPct)}</span> },
  ];

  if (highlightExpected) {
    columns.push({
      key: 'expected', label: 'Receberá', sortValue: (p) => p.expectedValueBrl, align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-hex)' }}>
        {p.expectedValueBrl !== null ? fmtBRL(p.expectedValueBrl) : '—'}
      </span>,
    });
  }

  columns.push({
    key: 'link', label: '', sortable: false, align: 'right',
    render: (p) => p.sourceUrl ? <a href={p.sourceUrl} target="_blank" rel="noopener" style={{ fontSize: '0.72rem' }}>fato →</a> : null,
  });

  return (
    <SortableTable<UpcomingProvento>
      columns={columns}
      rows={rows}
      rowKey={(p) => p.id}
      defaultSort={{ key: 'paymentDate', dir: 'asc' }}
    />
  );
}

// ───────────────────────────────────────────────────────────
// Top rendimento 12m
// ───────────────────────────────────────────────────────────
export function TopYieldTable({ rows }: { rows: TopYieldRow[] }) {
  const columns: SortableColumn<TopYieldRow>[] = [
    { key: 'ticker', label: 'Ticker', sortValue: (r) => r.ticker, render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link href={`/ativo/${r.ticker}`} style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{r.ticker}</Link>
        {r.isMyPortfolio && <span title="Sua carteira" style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>💼</span>}
        {r.inWatchlist && !r.isMyPortfolio && <span title="Watchlist" style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>★</span>}
      </div>
    )},
    { key: 'company', label: 'Empresa', sortValue: (r) => r.companyName ?? '',
      render: (r) => <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.companyName ?? '—'}</span> },
    { key: 'dy', label: 'DY 12m', sortValue: (r) => r.totalDyPct12m, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-hex)' }}>{fmtPct(r.totalDyPct12m)}</span> },
    { key: 'gross', label: 'R$/cota total', sortValue: (r) => r.totalGrossPerShare, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{r.totalGrossPerShare.toFixed(4)}</span> },
    { key: 'events', label: 'Eventos', sortValue: (r) => r.numEvents12m, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.numEvents12m}</span> },
    { key: 'close', label: 'Cotação', sortValue: (r) => r.lastClose, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{fmtBRL(r.lastClose)}</span> },
    { key: 'link', label: '', sortable: false, align: 'right',
      render: (r) => <Link href={`/ativo/${r.ticker}`} style={{ fontSize: '0.75rem' }}>analisar →</Link> },
  ];

  return (
    <SortableTable<TopYieldRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.ticker}
      defaultSort={{ key: 'dy', dir: 'desc' }}
    />
  );
}

// ───────────────────────────────────────────────────────────
// Sua carteira — yield by ticker
// ───────────────────────────────────────────────────────────
export function PortfolioYieldTable({ rows }: { rows: PortfolioYieldRow[] }) {
  const columns: SortableColumn<PortfolioYieldRow>[] = [
    { key: 'ticker', label: 'Ticker', sortValue: (r) => r.ticker,
      render: (r) => <Link href={`/ativo/${r.ticker}`} style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{r.ticker}</Link> },
    { key: 'company', label: 'Empresa', sortValue: (r) => r.companyName ?? '',
      render: (r) => <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.companyName ?? '—'}</span> },
    { key: 'qty', label: 'Qtd', sortValue: (r) => r.qty, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{r.qty.toLocaleString('pt-BR')}</span> },
    { key: 'next30', label: 'Receber 30d', sortValue: (r) => r.expectedNext30d, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', fontWeight: r.expectedNext30d > 0 ? 700 : 400, color: r.expectedNext30d > 0 ? 'var(--primary-hex)' : 'var(--text-muted)' }}>
        {r.expectedNext30d > 0 ? fmtBRL(r.expectedNext30d) : '—'}
      </span> },
    { key: 'last12', label: 'Recebido 12m', sortValue: (r) => r.receivedLast12m, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{fmtBRL(r.receivedLast12m)}</span> },
    { key: 'events', label: 'Eventos 12m', sortValue: (r) => r.numEvents12m, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.numEvents12m}</span> },
    { key: 'yieldOnCost', label: 'Yield on Cost', sortValue: (r) => r.yieldOnCostPct, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', fontWeight: 600, color: r.yieldOnCostPct ? 'var(--primary-hex)' : 'var(--text-muted)' }}>
        {r.yieldOnCostPct !== null ? fmtPct(r.yieldOnCostPct) : '— informar preço'}
      </span> },
  ];

  return (
    <SortableTable<PortfolioYieldRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.ticker}
      defaultSort={{ key: 'last12', dir: 'desc' }}
    />
  );
}
