import { getTaxView, type MesApurado } from '@/lib/queries/tax';
import { salvarDarf, removerDarf } from '@/app/actions/darfs';
import { getJanelaFiscal } from '@/lib/queries/janela';
import { JanelaFiscalCard } from '@/components/JanelaFiscalCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fmtBRL(v: number | null): string {
  if (v === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(v);
}

function fmtDateBR(s: string | null): string {
  if (!s) return '—';
  const [y, m, d] = s.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function fmtCompetencia(mes: string): string {
  const [a, m] = mes.split('-');
  return `${MESES[Number(m) - 1]}/${a}`;
}

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border-hex)',
  borderRadius: 'var(--radius)',
  padding: '20px',
} as const;

const rotulo = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
} as const;

const th = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-hex)',
  whiteSpace: 'nowrap',
  fontWeight: 600,
} as const;

const td = {
  padding: '12px',
  fontSize: '0.85rem',
  borderBottom: '1px solid var(--border-hex)',
} as const;

const input = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-alt)',
  border: '1px solid var(--border-hex)',
  borderRadius: '8px',
  color: 'var(--foreground-hex)',
  fontSize: '0.85rem',
  minHeight: '44px',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

/** Barra de consumo do teto de isenção de R$ 20 mil. */
function BarraTeto({ pct, isento }: { pct: number; isento: boolean }) {
  const largura = Math.min(100, pct);
  const cor = !isento ? '#ef4444' : pct > 90 ? '#fb923c' : 'var(--primary-hex)';
  return (
    <div style={{ minWidth: '110px' }}>
      <div style={{ height: '6px', background: 'var(--bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${largura}%`, height: '100%', background: cor }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pct.toFixed(0)}% do teto</span>
    </div>
  );
}

function StatusMes({ m }: { m: MesApurado }) {
  if (m.vendidoAcao === 0 && m.lucroFii === 0) {
    return <span style={{ color: 'var(--text-muted)' }}>sem venda</span>;
  }
  if (m.impostoTotal > 0) {
    return <span style={{ color: '#fb923c', fontWeight: 600 }}>tributável</span>;
  }
  if (m.isento) {
    return <span style={{ color: 'var(--primary-hex)', fontWeight: 600 }}>isento</span>;
  }
  return <span style={{ color: 'var(--text-secondary)' }}>sem imposto</span>;
}

export default async function ImpostoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { ok, erro } = await searchParams;
  const [v, janela] = await Promise.all([getTaxView(), getJanelaFiscal()]);

  const mesesComDarf = v.meses.filter((m) => m.darfValor !== null);
  const darfEmAberto = mesesComDarf.filter((m) => !m.darfPaga?.dataPagamento);

  return (
    <>
      {(ok || erro) && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '0.85rem',
            background: erro ? 'rgba(239,68,68,0.12)' : 'rgba(0,255,102,0.10)',
            border: `1px solid ${erro ? 'rgba(239,68,68,0.4)' : 'var(--border-accent)'}`,
            color: erro ? '#fca5a5' : 'var(--foreground-hex)',
          }}
        >
          {erro ?? ok}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px' }}>Imposto de renda</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Apuração mensal de ganho de capital, calculada a partir do ledger de operações. Venda de ação
          até {fmtBRL(v.limiteIsencao)} no mês é isenta; passar disso tributa o lucro do mês inteiro em 15%.
          FII paga 20% sempre, sem isenção.
        </p>
      </div>

      {v.semOperacoes && (
        <div style={{ ...card, marginBottom: '24px', borderColor: 'rgba(251,146,60,0.4)' }}>
          <strong style={{ color: '#fb923c' }}>Ledger vazio.</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.6 }}>
            Não há operações registradas em <code>trades</code>, então não há o que apurar. A apuração
            depende do registro de cada compra e venda, com data, quantidade e preço.
          </p>
        </div>
      )}

      {v.darfsNaoConciliadas.length > 0 && (
        <div style={{ ...card, marginBottom: '24px', borderColor: 'rgba(251,146,60,0.4)' }}>
          <strong style={{ color: '#fb923c' }}>DARF paga sem operação correspondente</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.6 }}>
            {v.darfsNaoConciliadas.map((d) => fmtCompetencia(d.competencia.slice(0, 7))).join(', ')} tem DARF
            registrada, mas o ledger não tem venda nessa competência. Provavelmente falta lançar a operação
            que gerou o imposto, e sem ela o preço médio e o prejuízo a compensar ficam errados daqui pra frente.
          </p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={card}>
          <div style={rotulo}>Mês corrente</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
            {fmtBRL(v.mesCorrente?.vendidoAcao ?? 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            vendido em ação, de {fmtBRL(v.limiteIsencao)}
          </div>
          {v.mesCorrente && (
            <div style={{ marginTop: '10px' }}>
              <BarraTeto pct={v.mesCorrente.pctDoTeto} isento={v.mesCorrente.isento} />
            </div>
          )}
        </div>

        <div style={card}>
          <div style={rotulo}>Prejuízo a compensar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
            {fmtBRL(v.prejuizoAcumulado)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            abate lucro futuro, sem prazo de validade
          </div>
          {v.divergenciaCarryforward && (
            <div style={{ fontSize: '0.72rem', color: '#fb923c', marginTop: '6px', lineHeight: 1.5 }}>
              Gravado no banco: {fmtBRL(v.prejuizoAcumuladoGravado)}. O valor acima vem do ledger e
              é o que vale; a rotina de fim de mês ainda não sincronizou.
            </div>
          )}
        </div>

        <div style={card}>
          <div style={rotulo}>Imposto acumulado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
            {fmtBRL(v.impostoPendente)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            abaixo de R$ 10, só recolhe ao atingir o piso
          </div>
        </div>

        <div style={card}>
          <div style={rotulo}>DARF paga</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '6px' }}>
            {fmtBRL(v.totalDarfPago)}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              marginTop: '4px',
              color: darfEmAberto.length > 0 ? '#fb923c' : 'var(--text-muted)',
            }}
          >
            {darfEmAberto.length > 0
              ? `${darfEmAberto.length} competência(s) em aberto`
              : 'nada em aberto'}
          </div>
        </div>
      </div>

      <JanelaFiscalCard j={janela} />

      <div style={{ ...card, padding: 0, marginBottom: '24px', overflow: 'hidden' }}>
        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            margin: 0,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-hex)',
          }}
        >
          Apuração mês a mês
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr>
                <th style={th}>Competência</th>
                <th style={th}>Situação</th>
                <th style={{ ...th, textAlign: 'right' }}>Vendido (ação)</th>
                <th style={th}>Teto</th>
                <th style={{ ...th, textAlign: 'right' }}>Lucro</th>
                <th style={{ ...th, textAlign: 'right' }}>Prejuízo usado</th>
                <th style={{ ...th, textAlign: 'right' }}>Imposto</th>
                <th style={{ ...th, textAlign: 'right' }}>DARF</th>
              </tr>
            </thead>
            <tbody>
              {v.meses.length === 0 ? (
                <tr>
                  <td style={{ ...td, color: 'var(--text-muted)' }} colSpan={8}>
                    Nenhum mês apurado.
                  </td>
                </tr>
              ) : (
                v.meses.map((m) => (
                  <tr key={m.mes}>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {fmtCompetencia(m.mes)}
                      {m.temDayTrade && (
                        <div style={{ fontSize: '0.7rem', color: '#fb923c' }}>day trade detectado</div>
                      )}
                    </td>
                    <td style={td}>
                      <StatusMes m={m} />
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>{fmtBRL(m.vendidoAcao)}</td>
                    <td style={td}>
                      <BarraTeto pct={m.pctDoTeto} isento={m.isento} />
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: 'right',
                        color: m.lucroAcao < 0 ? '#ef4444' : 'var(--foreground-hex)',
                      }}
                    >
                      {fmtBRL(m.lucroAcao)}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {m.prejuizoUsado > 0 ? fmtBRL(m.prejuizoUsado) : '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                      {m.impostoTotal > 0 ? fmtBRL(m.impostoTotal) : '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {m.darfPaga?.dataPagamento ? (
                        <span style={{ color: 'var(--primary-hex)' }}>
                          pago {fmtDateBR(m.darfPaga.dataPagamento)}
                        </span>
                      ) : m.darfValor ? (
                        <span style={{ color: '#fb923c' }}>
                          {fmtBRL(m.darfValor)}
                          <div style={{ fontSize: '0.7rem' }}>vence {fmtDateBR(m.darfVencimento)}</div>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...card, marginBottom: '24px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px' }}>Registrar DARF paga</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Reenviar a mesma competência e código sobrescreve o registro anterior.
        </p>
        <form action={salvarDarf}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="competencia">Competência</label>
              <input style={input} id="competencia" name="competencia" placeholder="30/06/2026" required />
            </div>
            <div>
              <label style={labelStyle} htmlFor="codigoReceita">Código</label>
              <input style={input} id="codigoReceita" name="codigoReceita" defaultValue="6015" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="valorPrincipal">Principal</label>
              <input style={input} id="valorPrincipal" name="valorPrincipal" placeholder="1.295,63" required />
            </div>
            <div>
              <label style={labelStyle} htmlFor="valorMulta">Multa</label>
              <input style={input} id="valorMulta" name="valorMulta" placeholder="0,00" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="valorJuros">Juros</label>
              <input style={input} id="valorJuros" name="valorJuros" placeholder="0,00" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="dataPagamento">Pagamento</label>
              <input style={input} id="dataPagamento" name="dataPagamento" placeholder="24/07/2026" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="dataVencimento">Vencimento</label>
              <input style={input} id="dataVencimento" name="dataVencimento" placeholder="31/07/2026" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contribuinte">Contribuinte</label>
              <input style={input} id="contribuinte" name="contribuinte" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="cpfCnpj">CPF</label>
              <input style={input} id="cpfCnpj" name="cpfCnpj" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="observacoes">Observações</label>
              <input style={input} id="observacoes" name="observacoes" />
            </div>
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: 'var(--primary-hex)',
              color: 'var(--primary-fg)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Salvar DARF
          </button>
        </form>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            margin: 0,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-hex)',
          }}
        >
          DARFs registradas
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={th}>Competência</th>
                <th style={th}>Código</th>
                <th style={{ ...th, textAlign: 'right' }}>Valor</th>
                <th style={th}>Pagamento</th>
                <th style={th}>Observações</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {v.meses.every((m) => !m.darfPaga) && v.darfsNaoConciliadas.length === 0 ? (
                <tr>
                  <td style={{ ...td, color: 'var(--text-muted)' }} colSpan={6}>
                    Nenhuma DARF registrada.
                  </td>
                </tr>
              ) : (
                [
                  ...v.meses.map((m) => m.darfPaga).filter((d) => d !== null),
                  ...v.darfsNaoConciliadas,
                ].map((d) => (
                  <tr key={d.id}>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {fmtCompetencia(d.competencia.slice(0, 7))}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace' }}>{d.codigoReceita}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtBRL(d.valorTotal)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {d.dataPagamento ? (
                        <span style={{ color: 'var(--primary-hex)' }}>{fmtDateBR(d.dataPagamento)}</span>
                      ) : (
                        <span style={{ color: '#fb923c' }}>em aberto</span>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {d.observacoes ?? '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <form action={removerDarf}>
                        <input type="hidden" name="id" value={d.id} />
                        <button
                          type="submit"
                          aria-label={`Remover DARF de ${fmtCompetencia(d.competencia.slice(0, 7))}`}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-hex)',
                            borderRadius: '6px',
                            color: 'var(--text-muted)',
                            padding: '8px 14px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            minHeight: '36px',
                          }}
                        >
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
