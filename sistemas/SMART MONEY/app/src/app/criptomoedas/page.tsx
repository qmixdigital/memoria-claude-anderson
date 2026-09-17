import { CryptoMarketsTable } from '@/components/CryptoMarketsTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CriptomoedasPage() {
  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-montserrat), Montserrat, sans-serif', letterSpacing: '-0.02em' }}>
          ₿ Criptomoedas
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          Top 30 por capitalização · BRL · 24h, 7d, 30d
        </p>
      </div>
      <CryptoMarketsTable />
    </>
  );
}
