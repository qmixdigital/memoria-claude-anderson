import { getWatchlistFollow } from '@/lib/queries/watchlist-follow';
import { WatchlistFollowCard } from '@/components/WatchlistFollowCard';
import { TickerSearch } from '@/components/TickerSearch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WatchlistPage() {
  const items = await getWatchlistFollow();

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-montserrat), Montserrat', letterSpacing: '-0.02em' }}>
            Watchlist
            {items.length > 0 && (
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '12px' }}>
                {items.length} {items.length === 1 ? 'ação acompanhada' : 'ações acompanhadas'}
              </span>
            )}
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Ações em observação — sem posição. Use a busca pra adicionar via página da ação.
          </p>
        </div>
      </div>

      {/* Atalho de busca pra adicionar — mesma do dashboard */}
      <div style={{ marginBottom: '20px', maxWidth: '560px' }}>
        <TickerSearch />
      </div>

      {items.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {items.map((item) => (
            <WatchlistFollowCard
              key={item.ticker}
              ticker={item.ticker}
              companyName={item.companyName}
              className={item.className}
              isSmallCap={item.isSmallCap}
              lastQuote={item.lastQuote}
              changePct={item.changePct}
              series30d={item.series30d}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px dashed var(--border-hex)',
            borderRadius: 'var(--radius)',
            padding: '48px 32px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>★</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground-hex)' }}>
            Sua watchlist está vazia
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            Pesquise uma ação acima, abra a página dela e clique no botão <strong>★ Acompanhar</strong> pra adicionar aqui.
          </div>
        </div>
      )}
    </>
  );
}
