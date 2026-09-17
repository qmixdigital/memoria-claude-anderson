import { getMovers, getSectorHeatmap } from '@/lib/queries/dashboard';
import { IntradayMovers } from '@/components/widgets/IntradayMovers';
import { SectorHeatmap } from '@/components/widgets/SectorHeatmap';
import { MarketIndexChart } from '@/components/widgets/MarketIndexChart';
import { TickerSearch } from '@/components/TickerSearch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(d);
}

export default async function Home() {
  const [moversUp, moversDown, sectors] = await Promise.all([
    getMovers('up', 50),
    getMovers('down', 50),
    getSectorHeatmap(),
  ]);

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
            Painel
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Mercado em tempo real · {fmtDateTime(new Date())} BRT
          </p>
        </div>
      </div>

      {/* Busca rápida de qualquer ação da B3 */}
      <div style={{ marginBottom: '24px', maxWidth: '720px' }}>
        <TickerSearch size="large" />
      </div>

      {/* Mini gráficos de índices — contexto macro */}
      <MarketIndexChart />

      {/* Movers do dia — full width pra densidade */}
      <div style={{ marginBottom: '20px' }}>
        <IntradayMovers ups={moversUp} downs={moversDown} initialLimit={8} />
      </div>

      {/* Heat map setorial — full width */}
      {sectors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <SectorHeatmap sectors={sectors} />
        </div>
      )}
    </>
  );
}
