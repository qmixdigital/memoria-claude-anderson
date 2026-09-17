import Link from 'next/link';
import {
  getUpcomingProventos,
  getTopYield12m,
  getPortfolioProventos,
  getProventosCount,
  getProventosAReceber,
  getTopPayersOfMyPortfolio,
} from '@/lib/queries/proventos';
import { ImportProventosButton } from '@/components/ImportProventosButton';
import {
  UpcomingProventosTable,
  TopYieldTable,
  PortfolioYieldTable,
} from '@/components/ProventosTables';
import {
  ProventosAReceberTable,
  TopPayersTable,
  DividendVsJcpExplainer,
} from '@/components/ProventosAReceberSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fmtBRL(v: number | null, digits = 2): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
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

function eventBadge(eventType: string): { color: string; label: string } {
  const upper = eventType.toUpperCase();
  if (upper.includes('JUROS')) return { color: '#fbbf24', label: 'JCP' };
  if (upper.includes('DIVIDENDO')) return { color: 'var(--primary-hex)', label: 'Dividendo' };
  if (upper.includes('BONIF')) return { color: '#a78bfa', label: 'Bonificação' };
  if (upper.includes('DESDOBR')) return { color: '#60a5fa', label: 'Desdobramento' };
  if (upper.includes('GRUPAM')) return { color: '#f472b6', label: 'Grupamento' };
  return { color: 'var(--text-muted)', label: eventType };
}

export default async function ProventosPage() {
  const [upcoming, topYield, portfolio, count, aReceber, topPayers] = await Promise.all([
    getUpcomingProventos(80),
    getTopYield12m(25),
    getPortfolioProventos(),
    getProventosCount(),
    getProventosAReceber(),
    getTopPayersOfMyPortfolio(),
  ]);

  const totalAReceberLiquido = aReceber.reduce((s, r) => s + r.netValueBrl, 0);
  const totalDividendoLiquido = aReceber.filter((r) => r.eventType.toUpperCase().includes('DIVIDENDO')).reduce((s, r) => s + r.netValueBrl, 0);
  const totalJcpLiquido = aReceber.filter((r) => r.eventType.toUpperCase().includes('JUROS')).reduce((s, r) => s + r.netValueBrl, 0);

  // Filtros default: só ações + minha carteira no topo
  const upcomingPortfolio = upcoming.filter((p) => p.qtyInPortfolio !== null && p.qtyInPortfolio > 0);
  const upcomingWatchlist = upcoming.filter((p) => p.inWatchlist && (p.qtyInPortfolio === null || p.qtyInPortfolio === 0));
  const upcomingOthers = upcoming.filter((p) => !p.inWatchlist).slice(0, 30);

  const totalExpectedNext = portfolio.reduce((s, p) => s + p.expectedNext30d, 0);
  const totalReceived12m = portfolio.reduce((s, p) => s + p.receivedLast12m, 0);

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px', fontFamily: 'Montserrat, sans-serif' }}>
            💰 Proventos
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            {count.total} eventos cadastrados · {count.upcoming} futuros · {count.carteira} dos seus tickers
          </p>
        </div>
        <ImportProventosButton />
      </div>

      {/* 💰 PROVENTOS A RECEBER (líquido) — destaque máximo */}
      {aReceber.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            💰 Proventos declarados a receber
          </h2>

          {/* Mini cards de resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius)', padding: '14px 18px', boxShadow: 'var(--shadow), var(--glow)' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                Total líquido a receber
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-hex)', fontFamily: 'Montserrat, sans-serif' }}>
                {fmtBRL(totalAReceberLiquido)}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {aReceber.length} eventos · IR já descontado
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '14px 18px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary-hex)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                Dividendos
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground-hex)', fontFamily: 'Montserrat, sans-serif' }}>
                {fmtBRL(totalDividendoLiquido)}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Isento de IR (bruto = líquido)
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '14px 18px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#fbbf24', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                JCP (líquido)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground-hex)', fontFamily: 'Montserrat, sans-serif' }}>
                {fmtBRL(totalJcpLiquido)}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Já com 15% de IR retido
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <ProventosAReceberTable rows={aReceber} />
          </div>
        </section>
      )}

      {/* 🥇 Top pagadores da carteira */}
      {topPayers.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            🥇 Campeões pagadores — sua carteira (24m)
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <TopPayersTable rows={topPayers} />
          </div>
        </section>
      )}

      {/* Resumo carteira */}
      {portfolio.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius)', padding: '18px', boxShadow: 'var(--shadow), var(--glow)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
              A receber em 30 dias
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-hex)', fontFamily: 'Montserrat, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
              {fmtBRL(totalExpectedNext)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Baseado nas qtd. da watchlist
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
              Recebido nos últimos 12m
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--foreground-hex)', fontFamily: 'Montserrat, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
              {fmtBRL(totalReceived12m)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Soma estimada (qtd × R$/cota)
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', padding: '18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
              Tickers pagadores
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--foreground-hex)', fontFamily: 'Montserrat, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
              {portfolio.filter((p) => p.numEvents12m > 0).length} / {portfolio.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Da sua carteira (últimos 12m)
            </div>
          </div>
        </div>
      )}

      {/* Sua carteira */}
      {portfolio.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            💼 Sua carteira — rendimento por ticker
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <PortfolioYieldTable rows={portfolio} />
            <div style={{ padding: '8px 14px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hex)' }}>
              * Yield on Cost = total recebido 12m ÷ preço de compra. Informe o preço na watchlist pra calcular.
            </div>
          </div>
        </section>
      )}

      {/* Próximos pagamentos da carteira */}
      {upcomingPortfolio.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            ⭐ Próximos pagamentos da sua carteira
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <UpcomingProventosTable rows={upcomingPortfolio} highlightExpected={true} />
          </div>
        </section>
      )}

      {/* Próximos da watchlist */}
      {upcomingWatchlist.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            👁 Próximos da watchlist (sem posição cadastrada)
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <UpcomingProventosTable rows={upcomingWatchlist} highlightExpected={false} />
          </div>
        </section>
      )}

      {/* Top rendimento mercado */}
      {topYield.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            🏆 Top rendimento dos últimos 12 meses
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <TopYieldTable rows={topYield} />
          </div>
        </section>
      )}

      {/* Outros próximos */}
      {upcomingOthers.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
            📅 Outros próximos pagamentos do mercado
          </h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-hex)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <UpcomingProventosTable rows={upcomingOthers} highlightExpected={false} />
          </div>
        </section>
      )}

      {/* 📚 Explicador: Dividendo vs JCP */}
      <section style={{ marginTop: '40px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif' }}>
          📚 Entenda os tipos de provento
        </h2>
        <DividendVsJcpExplainer />
      </section>

      {count.total === 0 && (
        <div style={{ background: 'var(--card)', border: '1px dashed var(--border-hex)', borderRadius: 'var(--radius)', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum provento cadastrado. Use <strong>📥 Importar XLSX da B3</strong> acima — baixe em investidor.b3.com.br → Eventos → Calendário de Eventos → Exportar.
        </div>
      )}
    </>
  );
}

