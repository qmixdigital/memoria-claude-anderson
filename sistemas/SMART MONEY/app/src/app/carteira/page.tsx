import { getWatchlistWithLatest } from '@/lib/queries/watchlist';
import { WatchlistForm } from '@/components/WatchlistForm';
import { RefreshAllButton } from '@/components/RefreshAllButton';
import { ImportWatchlistButton } from '@/components/ImportWatchlistButton';
import { WatchlistTable } from '@/components/WatchlistTable';
import { WatchlistKpis } from '@/components/WatchlistKpis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CarteiraPage() {
  const items = await getWatchlistWithLatest();

  // Timestamp da cotação mais antiga (representa "última atualização da página")
  const validQuoteTimes = items
    .map((i) => {
      if (!i.lastQuoteAt) return null;
      const t = new Date(i.lastQuoteAt).getTime();
      return Number.isFinite(t) ? t : null;
    })
    .filter((t): t is number => t !== null);
  const oldestQuote = validQuoteTimes.length > 0
    ? new Date(Math.min(...validQuoteTimes))
    : null;
  const newestQuote = validQuoteTimes.length > 0
    ? new Date(Math.max(...validQuoteTimes))
    : null;

  function fmtRelative(d: Date | null): string {
    if (!d) return 'nunca';
    const diffMin = Math.round((Date.now() - new Date(d).getTime()) / 60_000);
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const h = Math.round(diffMin / 60);
    if (h < 24) return `há ${h} h`;
    return `há ${Math.round(h / 24)} dias`;
  }

  function fmtAbsolute(d: Date | null): string {
    if (!d) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  }

  const ageMin = oldestQuote
    ? Math.round((Date.now() - new Date(oldestQuote).getTime()) / 60_000)
    : null;
  const freshnessColor =
    ageMin === null ? 'var(--text-muted)' :
    ageMin < 10 ? 'var(--primary-hex)' :
    ageMin < 60 ? '#fbbf24' :
    '#ff6b6b';

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-montserrat), Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
            Carteira
            {items.length > 0 && (
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '12px' }}>
                {items.length} ticker{items.length !== 1 ? 's' : ''} · {items.filter((i) => i.purchasePriceBrl !== null).length} com preço
              </span>
            )}
          </h1>
          {oldestQuote && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}
              title={`Cotação mais recente: ${fmtAbsolute(newestQuote)} BRT · Mais antiga: ${fmtAbsolute(oldestQuote)} BRT. Engine de cotação roda a cada 5 min durante pregão.`}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: freshnessColor,
                  boxShadow: ageMin !== null && ageMin < 10 ? `0 0 8px ${freshnessColor}` : undefined,
                  animation: ageMin !== null && ageMin < 10 ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
              />
              <span style={{ fontWeight: 600, color: freshnessColor }}>
                Atualizado {fmtRelative(oldestQuote)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                · {fmtAbsolute(newestQuote)} BRT
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <ImportWatchlistButton />
          <RefreshAllButton count={items.length} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>

      <details style={{ marginBottom: '20px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            padding: '10px 14px',
            background: 'var(--card)',
            border: '1px solid var(--border-hex)',
            borderRadius: 'var(--radius)',
          }}
        >
          + Adicionar ticker manualmente
        </summary>
        <div style={{ padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--border-hex)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)' }}>
          <WatchlistForm />
        </div>
      </details>

      {items.length > 0 && <WatchlistKpis rows={items} />}

      {items.length > 0 ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border-hex)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}
        >
          <WatchlistTable rows={items} />
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1px dashed var(--border-hex)',
            borderRadius: 'var(--radius)',
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Sua carteira está vazia. Use o formulário acima para começar a registrar posições.
        </div>
      )}
    </>
  );
}
