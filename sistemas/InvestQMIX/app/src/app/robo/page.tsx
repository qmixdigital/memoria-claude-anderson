import { getRobo } from '@/lib/queries/robo';
import { CurvaCapital } from '@/components/CurvaCapital';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border-hex)',
  borderRadius: 'var(--radius)',
  padding: '20px',
} as const;

const th = {
  textAlign: 'left',
  padding: '9px 11px',
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-hex)',
  whiteSpace: 'nowrap',
} as const;

const td = {
  padding: '11px',
  fontSize: '0.84rem',
  borderBottom: '1px solid var(--border-hex)',
} as const;

const SLOT_LABEL: Record<string, string> = {
  'pre-abertura': 'Antes da abertura',
  abertura: 'Abertura',
  'meio-pregao': 'Meio do pregão',
  revisao: 'Revisão da tarde',
  'pre-fechamento': 'Antes do fechamento',
  'pos-fechamento': 'Após o fechamento',
};

const hora = (d: Date) =>
  d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

export default async function RoboPage() {
  const r = await getRobo();
  const positivo = r.resultado >= 0;

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px' }}>Robô de IA</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, maxWidth: '760px' }}>
          Uma IA operando na B3 com dinheiro fictício, em tempo real. Ela acorda seis vezes por
          pregão, olha as cotações do momento e a própria carteira, decide o que comprar e vender, e
          justifica cada ordem. As ordens executam contra o preço real, com emolumentos e imposto
          descontados.
        </p>
      </div>

      {!r.existe ? (
        <div style={{ ...card, lineHeight: 1.8 }}>
          <strong style={{ fontSize: '0.95rem' }}>O robô ainda não começou a operar.</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 0' }}>
            Ele está desligado por padrão para não gastar API sem você mandar. Para ligar, no
            arquivo <code>.env</code> do servidor:
          </p>
          <pre
            style={{
              background: 'var(--bg-alt)', padding: '12px 14px', borderRadius: '8px',
              fontSize: '0.8rem', overflowX: 'auto', margin: '10px 0 0',
            }}
          >{`ANTHROPIC_API_KEY=sk-ant-...
ROBO_IA_ATIVO=true
ROBO_IA_CAPITAL=100000`}</pre>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
            No primeiro despertar ele cria a conta sozinho e começa. Custa centavos por dia.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={card}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Patrimônio agora
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '5px' }}>
                {brl(r.patrimonio)}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '3px', color: positivo ? 'var(--primary-hex)' : '#ef4444' }}>
                {pct(r.resultadoPct)} · {brl(r.resultado)}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Começou com
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '5px' }}>
                {brl(r.caixaInicial)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {r.diasOperando} {r.diasOperando === 1 ? 'dia operando' : 'dias operando'}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Em caixa
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '5px' }}>{brl(r.caixa)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {brl(r.valorPosicoes)} em ações
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Posições abertas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '5px' }}>
                {r.posicoes.length}
              </div>
            </div>
          </div>

          {r.curva.length > 1 && (
            <div style={{ ...card, marginBottom: '20px' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px' }}>
                Patrimônio dia a dia
              </h2>
              <CurvaCapital pontos={r.curva} />
            </div>
          )}

          {r.posicoes.length > 0 && (
            <div style={{ ...card, padding: 0, marginBottom: '20px', overflow: 'hidden' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, padding: '16px 20px', borderBottom: '1px solid var(--border-hex)' }}>
                O que ele tem agora
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Papel</th>
                      <th style={{ ...th, textAlign: 'right' }}>Qtd</th>
                      <th style={{ ...th, textAlign: 'right' }}>Pagou</th>
                      <th style={{ ...th, textAlign: 'right' }}>Vale hoje</th>
                      <th style={{ ...th, textAlign: 'right' }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.posicoes.map((p) => (
                      <tr key={p.ticker}>
                        <td style={{ ...td, fontWeight: 700 }}>{p.ticker}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{p.quantidade.toLocaleString('pt-BR')}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{brl(p.precoMedio)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{p.cotacao ? brl(p.cotacao) : '—'}</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: p.resultado >= 0 ? 'var(--primary-hex)' : '#ef4444' }}>
                          {brl(p.resultado)} <span style={{ fontSize: '0.75rem' }}>({pct(p.resultadoPct)})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ ...card, marginBottom: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 4px' }}>
              O raciocínio dele
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
              O que a IA escreveu em cada despertar. É aqui que se vê se ela está pensando ou
              inventando.
            </p>
            {r.despertares.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Nenhum despertar ainda. O primeiro acontece às 9h30 do próximo dia útil.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {r.despertares.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      borderLeft: '2px solid var(--border-accent)',
                      paddingLeft: '14px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {SLOT_LABEL[d.slot] ?? d.slot} · {hora(d.criadoEm)}
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.6, marginTop: '3px', whiteSpace: 'pre-line' }}>
                      {d.resumo}
                    </div>
                    {d.proximo && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        Próximo: {d.proximo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {r.ordens.length > 0 && (
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, padding: '16px 20px', borderBottom: '1px solid var(--border-hex)' }}>
                Todas as ordens
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Quando</th>
                      <th style={th}>Ordem</th>
                      <th style={{ ...th, textAlign: 'right' }}>Preço</th>
                      <th style={th}>Situação</th>
                      <th style={th}>Por quê</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.ordens.map((o) => (
                      <tr key={o.id}>
                        <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                          {hora(o.criadoEm)}
                        </td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <span style={{ color: o.side === 'buy' ? 'var(--primary-hex)' : '#fb923c', fontWeight: 700 }}>
                            {o.side === 'buy' ? 'Compra' : 'Venda'}
                          </span>{' '}
                          {o.quantidade.toLocaleString('pt-BR')} {o.ticker}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>{o.precoExec ? brl(o.precoExec) : '—'}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {o.status === 'filled' && <span style={{ color: 'var(--primary-hex)' }}>executada</span>}
                          {o.status === 'pending' && <span style={{ color: '#fb923c' }}>aguardando</span>}
                          {o.status === 'rejected' && (
                            <span style={{ color: '#ef4444' }}>recusada: {o.motivoRejeicao}</span>
                          )}
                          {o.status === 'cancelled' && <span style={{ color: 'var(--text-muted)' }}>cancelada</span>}
                        </td>
                        <td style={{ ...td, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {o.razao ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ ...card, marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground-hex)' }}>Travas que o robô não pode furar</strong>
        <div style={{ marginTop: '6px' }}>
          No máximo 25% do patrimônio num único papel, 6 posições abertas ao mesmo tempo e 4 ordens
          por despertar. Só papéis com giro acima de R$ 20 milhões por dia. Não pode vender o que não
          tem, nem comprar além do caixa. Ordem que violar qualquer uma dessas regras é recusada pelo
          sistema antes de chegar ao mercado, e a recusa aparece na lista acima.
        </div>
        <div style={{ marginTop: '10px' }}>
          A IA decide; o motor executa e calcula. Ela escolhe papel, lado e quantidade, e nunca
          produz preço nem resultado, que saem da cotação real e do cálculo de custo e imposto.
        </div>
      </div>
    </>
  );
}
