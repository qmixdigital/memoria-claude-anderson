import { getAllPriceAlerts, countActiveAlerts } from '@/lib/queries/price-alerts';
import { PriceAlertsManager } from '@/components/PriceAlertsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const params = await searchParams;
  const [rows, count] = await Promise.all([getAllPriceAlerts(), countActiveAlerts()]);
  const defaultTicker = params.ticker?.toUpperCase();

  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-montserrat), Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
          🎯 Alertas de preço
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {count.active} ativos · {count.triggered30d} disparados nos últimos 30d · Telegram automático ao atingir
        </p>
      </div>
      <PriceAlertsManager rows={rows} defaultTicker={defaultTicker} />
    </>
  );
}
