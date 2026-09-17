import type { JanelaFiscalView } from '@/lib/queries/janela';

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border-hex)',
  borderRadius: 'var(--radius)',
  padding: '20px',
} as const;

const th = {
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-hex)',
  whiteSpace: 'nowrap',
} as const;

const td = {
  padding: '10px',
  fontSize: '0.82rem',
  borderBottom: '1px solid var(--border-hex)',
} as const;

/**
 * Painel da janela fiscal: quanto da pra realizar de lucro sem imposto neste
 * mes, e onde vender no prejuizo queimaria o prejuizo.
 */
export function JanelaFiscalCard({ j }: { j: JanelaFiscalView }) {
  const pctTeto = Math.min(100, (j.vendidoNoMes / j.limiteLegal) * 100);
  const queimam = j.avisos.filter((a) => a.queimaSeSozinho);

  return (
    <div style={{ ...card, marginBottom: '24px' }}>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px' }}>
        Janela fiscal deste mês
      </h2>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
        Quanto dá para realizar de lucro sem pagar imposto, e onde vender no prejuízo
        desperdiçaria o prejuízo.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vendas do mês
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '3px' }}>
            {brl(j.vendidoNoMes)}
          </div>
          <div style={{ height: '5px', background: 'var(--bg-alt)', borderRadius: '3px', marginTop: '7px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${pctTeto}%`,
                height: '100%',
                background: j.mesJaTributavel ? '#fb923c' : 'var(--primary-hex)',
              }}
            />
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {j.mesJaTributavel ? 'acima do teto, mês tributável' : `restam ${brl(j.margemIsenta)}`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Crédito de prejuízo
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '3px' }}>
            {brl(j.creditoDisponivel)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lucro não realizado
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '3px', color: 'var(--primary-hex)' }}>
            {brl(j.lucroNaoRealizado)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Prejuízo não realizado
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '3px', color: '#ef4444' }}>
            {brl(j.prejuizoNaoRealizado)}
          </div>
        </div>
      </div>

      {(j.janelaCredito.length > 0 || j.janelaIsenta.length > 0) && (
        <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
            {j.mesJaTributavel && j.janelaCredito.length > 0
              ? `Coberto pelo crédito: até ${brl(j.lucroCobertoPeloCredito)} de lucro sem imposto`
              : `Cabe na isenção: ${brl(j.lucroIsentoPossivel)} de lucro sem tocar no crédito`}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
            <thead>
              <tr>
                <th style={th}>Papel</th>
                <th style={{ ...th, textAlign: 'right' }}>Qtd</th>
                <th style={{ ...th, textAlign: 'right' }}>Venda</th>
                <th style={{ ...th, textAlign: 'right' }}>Lucro</th>
                <th style={{ ...th, textAlign: 'right' }}>Custo do giro</th>
              </tr>
            </thead>
            <tbody>
              {(j.mesJaTributavel && j.janelaCredito.length > 0 ? j.janelaCredito : j.janelaIsenta).map((s) => (
                <tr key={s.ticker}>
                  <td style={{ ...td, fontWeight: 600 }}>{s.ticker}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{s.quantidade.toLocaleString('pt-BR')}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{brl(s.valorVenda)}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--primary-hex)' }}>{brl(s.lucro)}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{brl(s.custoGiro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {queimam.length > 0 && (
        <div
          style={{
            background: 'rgba(251,146,60,0.10)',
            border: '1px solid rgba(251,146,60,0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '14px',
          }}
        >
          <strong style={{ color: '#fb923c', fontSize: '0.82rem' }}>
            Prejuízo que se perde se o mês ficar isento
          </strong>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '6px 0 8px', lineHeight: 1.6 }}>
            Prejuízo realizado em mês isento não vira crédito. Estas vendas ficariam sob o teto:
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', lineHeight: 1.8 }}>
            {queimam.slice(0, 4).map((a) => (
              <li key={a.ticker}>
                <strong>{a.ticker}</strong>: venda {brl(a.valorVenda)}, prejuízo {brl(a.prejuizo)} — faltam{' '}
                {brl(a.faltaParaTributavel)} de vendas no mês para ele contar
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          paddingTop: '12px',
          borderTop: '1px solid var(--border-hex)',
        }}
      >
        {j.veredito}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        Se for girar, recompre só no pregão seguinte: vender e comprar o mesmo papel no mesmo dia
        vira day trade, com 20% e sem isenção.
      </div>
    </div>
  );
}
