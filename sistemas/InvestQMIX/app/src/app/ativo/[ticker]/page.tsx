import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tickers, companies } from '@qmix-invest/db/schema';
import { TickerPriceChart } from '@/components/TickerPriceChart';
import { FollowButton } from '@/components/FollowButton';
import { isFollowing } from '@/app/actions/watchlist-follow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fmtBRL(v: number | null): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function fmtPct(v: number | null): string {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

async function getTickerInfo(ticker: string) {
  const rows = await db
    .select({
      ticker: tickers.ticker,
      class: tickers.class,
      isSmallCap: tickers.isSmallCap,
      companyName: companies.name,
      sector: companies.sector,
      lastQuoteBrl: tickers.lastQuoteBrl,
      lastQuoteChangePct: tickers.lastQuoteChangePct,
      lastQuoteAt: tickers.lastQuoteAt,
    })
    .from(tickers)
    .leftJoin(companies, eq(companies.cnpj, tickers.cnpj))
    .where(eq(tickers.ticker, ticker))
    .limit(1);
  return rows[0] ?? null;
}

export default async function AtivoPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker).toUpperCase();

  const info = await getTickerInfo(ticker);
  if (!info) notFound();

  const following = await isFollowing(ticker);
  const quote = info.lastQuoteBrl ? Number(info.lastQuoteBrl) : null;
  const changePct = info.lastQuoteChangePct ? Number(info.lastQuoteChangePct) : null;
  const changeColor = changePct === null ? 'var(--text-muted)' : changePct > 0 ? 'var(--primary-hex)' : changePct < 0 ? '#ff6b6b' : 'var(--text-muted)';

  return (
    <>
      <div style={{ marginBottom: '8px' }}>
        <Link href="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>← Painel</Link>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
              {info.ticker}
            </h1>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {info.class}
            </span>
            {info.isSmallCap && (
              <span style={{ fontSize: '0.62rem', padding: '2px 7px', background: '#1e3a5f', color: '#7dd3fc', borderRadius: '4px', fontWeight: 700 }}>SMALL CAP</span>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            {info.companyName ?? '—'}{info.sector ? ` · ${info.sector}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontFamily: 'Montserrat, sans-serif' }}>
              {fmtBRL(quote)}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: changeColor, fontVariantNumeric: 'tabular-nums' }}>
              {fmtPct(changePct)}
            </div>
          </div>
          <FollowButton ticker={info.ticker} initialFollowing={following} />
        </div>
      </div>

      <TickerPriceChart ticker={info.ticker} />
    </>
  );
}
