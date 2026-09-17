'use client';

import Link from 'next/link';
import { SortableTable, type SortableColumn } from './SortableTable';
import type { ProventoAReceber, PayerRanking } from '@/lib/queries/proventos';

function fmtBRL(v: number, digits = 2): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}
function fmtDateBR(s: string | null): string {
  if (!s) return 'Sem data';
  const [y, m, d] = s.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function eventBadge(eventType: string): { color: string; label: string; tooltip: string } {
  const upper = eventType.toUpperCase();
  if (upper.includes('JUROS')) return {
    color: '#fbbf24',
    label: 'JCP',
    tooltip: 'Juros sobre Capital Próprio — pago como despesa financeira da empresa, com IR de 15% retido na fonte. O valor mostrado já é líquido (após IR).',
  };
  if (upper.includes('DIVIDENDO')) return {
    color: 'var(--primary-hex)',
    label: 'Dividendo',
    tooltip: 'Dividendo — distribuição de lucro líquido da empresa. Isento de IR para pessoa física. Bruto = Líquido.',
  };
  if (upper.includes('BONIF')) return { color: '#a78bfa', label: 'Bonificação', tooltip: 'Bonificação — distribuição de novas ações sem custo.' };
  return { color: 'var(--text-muted)', label: eventType, tooltip: '' };
}

// ─────────────────────────────────────────────────────────
// Tabela "Proventos a receber" (líquido, com totalizador)
// ─────────────────────────────────────────────────────────
export function ProventosAReceberTable({ rows }: { rows: ProventoAReceber[] }) {
  const columns: SortableColumn<ProventoAReceber>[] = [
    {
      key: 'ticker', label: 'Ticker', sortValue: (p) => p.ticker,
      render: (p) => (
        <>
          <Link href={`/ativo/${p.ticker}`} style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{p.ticker}</Link>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.companyName ?? '—'}
          </div>
        </>
      ),
      footer: (rows) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Montserrat, sans-serif' }}>
          Total ({rows.length})
        </span>
      ),
    },
    {
      key: 'eventType', label: 'Tipo', sortValue: (p) => p.eventType,
      render: (p) => {
        const b = eventBadge(p.eventType);
        return (
          <span title={b.tooltip} style={{ fontSize: '0.7rem', padding: '2px 8px', background: `${b.color}22`, color: b.color, borderRadius: '4px', fontWeight: 700, cursor: 'help' }}>
            {b.label}
          </span>
        );
      },
    },
    {
      key: 'payment', label: 'Pagamento', sortValue: (p) => p.paymentDate ?? '9999',
      render: (p) => <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{fmtDateBR(p.paymentDate)}</span>,
    },
    {
      key: 'qty', label: 'Qtd', sortValue: (p) => p.quantity, align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}>{p.quantity.toLocaleString('pt-BR')}</span>,
    },
    {
      key: 'gross', label: 'R$/cota', sortValue: (p) => p.grossPerShareBrl, align: 'right',
      render: (p) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}>
        {p.grossPerShareBrl !== null ? `R$ ${p.grossPerShareBrl.toFixed(4)}` : '—'}
      </span>,
    },
    {
      key: 'net', label: 'Líquido R$', sortValue: (p) => p.netValueBrl, align: 'right',
      render: (p) => <span title="Valor líquido — JCP já com IR de 15% descontado" style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-hex)' }}>
        {fmtBRL(p.netValueBrl)}
      </span>,
      footer: (rows) => {
        const total = rows.reduce((s, r) => s + r.netValueBrl, 0);
        return (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 800, color: 'var(--primary-hex)' }}>
            {fmtBRL(total)}
          </span>
        );
      },
    },
  ];

  return (
    <SortableTable<ProventoAReceber>
      columns={columns}
      rows={rows}
      rowKey={(p) => p.id}
      defaultSort={{ key: 'payment', dir: 'asc' }}
      emptyText="Nenhum provento declarado a receber"
    />
  );
}

// ─────────────────────────────────────────────────────────
// Top pagadores da carteira
// ─────────────────────────────────────────────────────────
export function TopPayersTable({ rows }: { rows: PayerRanking[] }) {
  const columns: SortableColumn<PayerRanking>[] = [
    {
      key: 'ticker', label: '#', sortable: false,
      render: () => null,
    },
    {
      key: 'tickerName', label: 'Ticker', sortValue: (r) => r.ticker,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link href={`/ativo/${r.ticker}`} style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{r.ticker}</Link>
          {r.isMyPortfolio && <span title="Carteira atual" style={{ fontSize: '0.7rem', color: 'var(--primary-hex)' }}>💼</span>}
        </div>
      ),
    },
    {
      key: 'company', label: 'Empresa', sortValue: (r) => r.companyName ?? '',
      render: (r) => <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.companyName ?? '—'}</span>,
    },
    {
      key: 'numEvents', label: 'Eventos', sortValue: (r) => r.numEvents, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.numEvents}</span>,
    },
    {
      key: 'total', label: 'Total recebido', sortValue: (r) => r.totalNetReceived, align: 'right',
      render: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-hex)' }}>{fmtBRL(r.totalNetReceived)}</span>,
      footer: (rows) => {
        const total = rows.reduce((s, r) => s + r.totalNetReceived, 0);
        return (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 800, color: 'var(--primary-hex)' }}>
            {fmtBRL(total)}
          </span>
        );
      },
    },
  ];

  return (
    <SortableTable<PayerRanking>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.ticker}
      defaultSort={{ key: 'total', dir: 'desc' }}
      emptyText="Sem histórico de proventos"
    />
  );
}

// ─────────────────────────────────────────────────────────
// Explicador Dividendo vs JCP (educativo)
// ─────────────────────────────────────────────────────────
export function DividendVsJcpExplainer() {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hex)',
        borderRadius: 'var(--radius)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      <div>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            margin: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#00ff6622', color: 'var(--primary-hex)', borderRadius: '4px', fontWeight: 700 }}>Dividendo</span>
        </h3>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li>Distribuição de <strong>lucro líquido</strong> da empresa</li>
          <li><strong>Isento de IR</strong> para pessoa física</li>
          <li>Valor <strong>bruto = líquido</strong>: você recebe 100% do que foi anunciado</li>
          <li>Empresa não tem benefício fiscal — é lucro pós-imposto</li>
          <li>Comum em empresas maduras com fluxo de caixa estável</li>
        </ul>
      </div>
      <div>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            margin: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#fbbf2422', color: '#fbbf24', borderRadius: '4px', fontWeight: 700 }}>JCP</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>Juros sobre Capital Próprio</span>
        </h3>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li>Pago como <strong>despesa financeira</strong> da empresa</li>
          <li><strong>Tributado em 15% na fonte</strong> (IR retido)</li>
          <li>Você recebe o líquido (bruto × 0,85). Ex: R$ 1,00 bruto → R$ 0,85 líquido</li>
          <li>Empresa <strong>economiza imposto</strong>, então JCP costuma vir maior em bruto</li>
          <li>Comum em bancos e empresas com forte estrutura de capital</li>
        </ul>
      </div>
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px', fontFamily: 'Montserrat, sans-serif' }}>
          🎯 Qual rende mais?
        </h3>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Para o investidor, <strong style={{ color: 'var(--primary-hex)' }}>dividendo é mais eficiente</strong> em equivalente líquido. Mas empresas costumam misturar: distribuem JCP até o limite fiscal e o resto via dividendo. <strong>Compare sempre o líquido</strong>, não o bruto. Empresas que pagam <strong>muito JCP</strong> (Itaú, Bradesco, Itaúsa) têm payout grande mas você fica com 85%. Empresas que <strong>só pagam dividendo</strong> (Petro, Vale, MELK) você fica com 100%.
        </p>
      </div>
    </div>
  );
}
