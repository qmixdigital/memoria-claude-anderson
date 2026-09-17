import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findBySlug, INDICES } from '@/lib/indices';
import { MacroPriceChart } from '@/components/MacroPriceChart';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface YahooMeta {
  current: number;
  previousClose: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  marketTime: number | null;
}

async function fetchYahooMeta(symbol: string): Promise<YahooMeta | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  try {
    const resp = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            chartPreviousClose?: number;
            previousClose?: number;
            fiftyTwoWeekHigh?: number;
            fiftyTwoWeekLow?: number;
            regularMarketTime?: number;
          };
        }>;
      };
    };
    const m = json.chart?.result?.[0]?.meta;
    if (!m || typeof m.regularMarketPrice !== 'number') return null;
    return {
      current: m.regularMarketPrice,
      previousClose: m.chartPreviousClose ?? m.previousClose ?? null,
      fiftyTwoWeekHigh: m.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: m.fiftyTwoWeekLow ?? null,
      marketTime: m.regularMarketTime ?? null,
    };
  } catch {
    return null;
  }
}

function fmtNum(v: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

function fmtPct(v: number): string {
  const s = v > 0 ? '+' : '';
  return `${s}${v.toFixed(2)}%`;
}

function fmtMarketTime(t: number | null): string {
  if (!t) return '—';
  const dt = new Date(t * 1000);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(dt);
}

export async function generateStaticParams() {
  return INDICES.map((i) => ({ slug: i.slug }));
}

export default async function IndexDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = findBySlug(slug);
  if (!config) notFound();

  const meta = await fetchYahooMeta(config.symbol);

  const changePct = meta && meta.previousClose && meta.previousClose > 0
    ? ((meta.current - meta.previousClose) / meta.previousClose) * 100
    : null;
  const positive = changePct !== null && changePct >= 0;
  const color = changePct === null ? 'var(--text-muted)' : positive ? 'var(--primary-hex)' : '#ff6b6b';

  const isLargeNumber = meta !== null && meta.current > 1000;
  const decimals = isLargeNumber ? 0 : config.currency === 'USD' && meta !== null && meta.current < 10 ? 4 : 2;
  const currencyPrefix = config.currency === 'BRL' ? 'R$' : 'US$';

  const others = INDICES.filter((i) => i.slug !== config.slug);

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <Link href="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Painel de Decisão
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-montserrat), Montserrat', letterSpacing: '-0.02em' }}>
            {config.label}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 0', maxWidth: '720px', lineHeight: 1.5 }}>
            {config.description}
          </p>
        </div>
        {meta && (
          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-montserrat), Montserrat', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
              {currencyPrefix} {fmtNum(meta.current, decimals)}
            </div>
            {changePct !== null && (
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', marginTop: '4px' }}>
                {fmtPct(changePct)}
                {meta.previousClose && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                    fech. {fmtNum(meta.previousClose, decimals)}
                  </span>
                )}
              </div>
            )}
            {meta.marketTime && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {fmtMarketTime(meta.marketTime)} BRT
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPIs adicionais */}
      {meta && (meta.fiftyTwoWeekHigh !== null || meta.fiftyTwoWeekLow !== null) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {meta.fiftyTwoWeekHigh !== null && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Máxima 52s
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                {currencyPrefix} {fmtNum(meta.fiftyTwoWeekHigh, decimals)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(((meta.current - meta.fiftyTwoWeekHigh) / meta.fiftyTwoWeekHigh) * 100).toFixed(1)}% até hoje
              </div>
            </div>
          )}
          {meta.fiftyTwoWeekLow !== null && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Mínima 52s
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
                {currencyPrefix} {fmtNum(meta.fiftyTwoWeekLow, decimals)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(((meta.current - meta.fiftyTwoWeekLow) / meta.fiftyTwoWeekLow) * 100).toFixed(1)}% acima
              </div>
            </div>
          )}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Símbolo Yahoo
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace', marginTop: '2px' }}>
              {config.symbol}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
              {config.category === 'index' ? 'índice' : config.category === 'fx' ? 'câmbio' : 'criptomoeda'}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico interativo com seletor de período */}
      <MacroPriceChart symbol={config.symbol} currency={config.currency} defaultPeriod="1y" />

      {/* Outros índices/criptos */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '0.78rem', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontFamily: 'Montserrat, sans-serif' }}>
          Outros índices e ativos macro
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/indices/${o.slug}`}
              style={{
                padding: '6px 12px',
                background: 'var(--card)',
                border: '1px solid var(--border-hex)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
