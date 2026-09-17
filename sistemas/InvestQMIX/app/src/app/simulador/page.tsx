import {
  listarRodadas,
  compararRodadas,
  curvaDaRodada,
  coberturaDados,
  type RodadaComparada,
} from '@/lib/queries/simulador';
import { rodarSimulacao, removerRodada } from '@/app/actions/simulador';
import { CurvaCapital } from '@/components/CurvaCapital';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const brl = (v: number | null | undefined) =>
  v === null || v === undefined
    ? '—'
    : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? '—' : `${v.toFixed(2)}%`;

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border-hex)',
  borderRadius: 'var(--radius)',
  padding: '20px',
} as const;

const label = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--foreground-hex)',
  marginBottom: '4px',
} as const;

const dica = {
  display: 'block',
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  lineHeight: 1.5,
} as const;

const input = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-alt)',
  border: '1px solid var(--border-hex)',
  borderRadius: '8px',
  color: 'var(--foreground-hex)',
  fontSize: '0.88rem',
  minHeight: '44px',
} as const;

/** Métrica com a explicação junto, porque o nome sozinho não diz nada. */
function Metrica({
  rotulo,
  valor,
  explica,
  cor,
}: {
  rotulo: string;
  valor: string;
  explica: string;
  cor?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{rotulo}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0', color: cor }}>{valor}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {explica}
      </div>
    </div>
  );
}

async function CartaoRodada({ r }: { r: RodadaComparada }) {
  const curva = await curvaDaRodada(r.id);
  const s = r.resumo;
  const b = r.benchmark?.resumo;
  const corVeredito = r.venceu === null ? 'var(--text-muted)' : r.venceu ? 'var(--primary-hex)' : '#fb923c';

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, wordBreak: 'break-word' }}>
            {r.nome}
          </h3>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {r.inicio} a {r.fim}
            {s?.pregoes ? ` · ${s.pregoes} dias de pregão` : ''}
          </div>
        </div>
        <form action={removerRodada}>
          <input type="hidden" name="id" value={r.id} />
          <button
            type="submit"
            aria-label={`Remover a simulação ${r.nome}`}
            style={{
              background: 'transparent', border: '1px solid var(--border-hex)', borderRadius: '6px',
              color: 'var(--text-muted)', padding: '6px 10px', fontSize: '0.72rem', cursor: 'pointer',
              minHeight: '32px', whiteSpace: 'nowrap',
            }}
          >
            Apagar
          </button>
        </form>
      </div>

      {s?.falhou ? (
        <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#fca5a5' }}>
          Falhou: {s.erro ?? 'erro desconhecido'}
        </div>
      ) : (
        <>
          {/* O veredito vem PRIMEIRO: é a resposta à pergunta que a pessoa fez. */}
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: r.venceu ? 'rgba(0,255,102,0.08)' : 'rgba(251,146,60,0.10)',
              border: `1px solid ${r.venceu ? 'var(--border-accent)' : 'rgba(251,146,60,0.35)'}`,
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: corVeredito,
            }}
          >
            {r.veredito}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', margin: '14px 0 10px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Esta estratégia</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {brl(r.caixaInicial)} → {brl(r.caixaInicial + (s?.resultadoLiquido ?? 0))}
              </div>
            </div>
            {b && (
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Se tivesse só comprado e segurado
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {brl(r.caixaInicial)} → {brl(r.caixaInicial + b.resultadoLiquido)}
                </div>
              </div>
            )}
          </div>

          <CurvaCapital pontos={curva} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '14px',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-hex)',
            }}
          >
            <Metrica
              rotulo="Maior queda no caminho"
              valor={pct(s?.maxDrawdownPct)}
              explica="quanto o dinheiro chegou a cair do topo até o fundo"
              cor={(s?.maxDrawdownPct ?? 0) > 20 ? '#fb923c' : undefined}
            />
            <Metrica
              rotulo="Operações"
              valor={String(s?.totalTrades ?? 0)}
              explica={`${s?.taxaAcertoPct != null ? `${s.taxaAcertoPct.toFixed(0)}% deram lucro` : 'nenhuma venda'}`}
            />
            <Metrica
              rotulo="Ganhou por real perdido"
              valor={s?.profitFactor != null ? `R$ ${s.profitFactor.toFixed(2)}` : '—'}
              explica="abaixo de R$ 1,00 significa que perdeu dinheiro"
              cor={s?.profitFactor != null && s.profitFactor < 1 ? '#ef4444' : undefined}
            />
            <Metrica
              rotulo="Imposto pago"
              valor={brl(s?.impostoTotal)}
              explica={
                s?.mesesIsentos != null
                  ? `${s.mesesIsentos} meses ficaram isentos`
                  : 'IR sobre o lucro realizado'
              }
            />
            <Metrica
              rotulo="Custo das ordens"
              valor={brl(s?.custoTotal)}
              explica="emolumentos da B3 em cada compra e venda"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default async function SimuladorPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { ok, erro } = await searchParams;
  const [rodadas, cobertura] = await Promise.all([listarRodadas(), coberturaDados()]);
  const comparadas = compararRodadas(rodadas);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <>
      {(ok || erro) && (
        <div
          role="status"
          style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.85rem',
            background: erro ? 'rgba(239,68,68,0.12)' : 'rgba(0,255,102,0.10)',
            border: `1px solid ${erro ? 'rgba(239,68,68,0.4)' : 'var(--border-accent)'}`,
            color: erro ? '#fca5a5' : 'var(--foreground-hex)',
          }}
        >
          {erro ?? ok}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px' }}>Simulador</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, maxWidth: '760px' }}>
          Aqui você testa uma ideia de investimento contra o que <strong>de fato aconteceu</strong> na
          bolsa. O sistema pega os preços reais de {cobertura.diarioDe} até hoje, finge que você
          seguiu aquela regra o tempo todo, e mostra com quanto dinheiro você teria terminado. Sem
          dinheiro de verdade e sem tocar na sua carteira.
        </p>
      </div>

      <div style={{ ...card, marginBottom: '20px', background: 'var(--bg-alt)' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 10px' }}>
          Como ler o resultado
        </h2>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Toda simulação roda <strong>duas</strong> coisas ao mesmo tempo: a sua estratégia e a
          alternativa preguiçosa de simplesmente <strong>comprar os mesmos papéis no primeiro dia e
          não mexer mais</strong>.
          <br />
          Se a sua estratégia não render mais que essa alternativa, ela não vale o trabalho. Essa é a
          única pergunta que importa, e a resposta aparece escrita em cada resultado.
        </div>
      </div>

      <div style={{ ...card, marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>Testar uma ideia</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 18px' }}>
          Já vem preenchido com um exemplo. Se estiver começando, clique direto em Rodar e veja o que
          acontece.
        </p>

        <form action={rodarSimulacao}>
          <div style={{ marginBottom: '16px' }}>
            <label style={label} htmlFor="tickers">Quais papéis</label>
            <span style={dica}>
              Separe por vírgula. Podem ser os seus ou quaisquer outros da bolsa.
            </span>
            <input style={input} id="tickers" name="tickers" required
                   defaultValue="PETR4, VALE3, ITUB4, BBAS3" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label} htmlFor="tipo">Qual regra seguir</label>
            <span style={dica}>
              A regra que decide quando comprar e quando vender.
            </span>
            <select style={input} id="tipo" name="tipo" defaultValue="swing">
              <option value="swing">Comprar quando cair, vender quando subir o quanto eu definir</option>
              <option value="cruzamento">Comprar quando a tendência virar para cima, vender quando virar para baixo</option>
              <option value="buy-and-hold">Comprar no primeiro dia e nunca mais mexer</option>
              <option value="day-trade">Comprar e vender no mesmo dia (day trade)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label} htmlFor="alvo">Vender com quantos % de lucro</label>
              <span style={dica}>Subiu isso, vende.</span>
              <input style={input} id="alvo" name="alvo" defaultValue="15" inputMode="decimal" />
            </div>
            <div>
              <label style={label} htmlFor="stop">Vender com quantos % de prejuízo</label>
              <span style={dica}>Caiu isso, sai fora para não perder mais.</span>
              <input style={input} id="stop" name="stop" defaultValue="8" inputMode="decimal" />
            </div>
            <div>
              <label style={label} htmlFor="caixaInicial">Começar com quanto</label>
              <span style={dica}>Dinheiro imaginário.</span>
              <input style={input} id="caixaInicial" name="caixaInicial" defaultValue="100000" inputMode="numeric" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label} htmlFor="inicio">Testar a partir de</label>
              <span style={dica}>Temos preços desde {cobertura.diarioDe}.</span>
              <input style={input} id="inicio" name="inicio" required
                     defaultValue={cobertura.diarioDe ?? '2022-01-03'} />
            </div>
            <div>
              <label style={label} htmlFor="fim">Até</label>
              <span style={dica}>Deixe hoje para testar tudo.</span>
              <input style={input} id="fim" name="fim" required defaultValue={hoje} />
            </div>
          </div>

          <details style={{ marginBottom: '18px' }}>
            <summary
              style={{
                cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)',
                padding: '10px 0', minHeight: '44px', display: 'flex', alignItems: 'center',
              }}
            >
              Ajustes finos (não precisa mexer para começar)
            </summary>
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px', paddingTop: '10px',
              }}
            >
              <div>
                <label style={label} htmlFor="criterio">O que conta como &quot;caiu&quot;</label>
                <span style={dica}>Como o sistema decide que o papel está barato.</span>
                <select style={input} id="criterio" name="criterio" defaultValue="queda-do-topo">
                  <option value="queda-do-topo">Caiu bastante desde a máxima dos últimos 3 meses</option>
                  <option value="rsi">Caiu muito rápido nos últimos dias (RSI)</option>
                  <option value="abaixo-da-media">Está abaixo da média de preço recente</option>
                </select>
              </div>
              <div>
                <label style={label} htmlFor="maxPosicoes">Quantos papéis ao mesmo tempo</label>
                <span style={dica}>Limite de posições abertas juntas.</span>
                <input style={input} id="maxPosicoes" name="maxPosicoes" defaultValue="5" inputMode="numeric" />
              </div>
              <div>
                <label style={label} htmlFor="fracaoCapital">% do dinheiro em cada compra</label>
                <span style={dica}>20% significa dividir em cinco.</span>
                <input style={input} id="fracaoCapital" name="fracaoCapital" defaultValue="20" inputMode="numeric" />
              </div>
              <div>
                <label style={label} htmlFor="prazoMaximo">Desistir depois de quantos dias</label>
                <span style={dica}>Se não subiu nem caiu o suficiente, vende assim mesmo.</span>
                <input style={input} id="prazoMaximo" name="prazoMaximo" defaultValue="60" inputMode="numeric" />
              </div>
              <div>
                <label style={label} htmlFor="orcamentoMensalVendas">Vender no máximo R$ por mês</label>
                <span style={dica}>
                  Abaixo de R$ 20 mil por mês o lucro é isento de imposto. Deixe 0 para não limitar.
                </span>
                <input style={input} id="orcamentoMensalVendas" name="orcamentoMensalVendas"
                       defaultValue="0" inputMode="numeric" />
              </div>
              <div>
                <label style={label} htmlFor="nome">Nome da simulação</label>
                <span style={dica}>Para achar depois na lista. Pode deixar vazio.</span>
                <input style={input} id="nome" name="nome" />
              </div>
            </div>
          </details>

          <input type="hidden" name="comBenchmark" value="1" />

          <button
            type="submit"
            style={{
              padding: '14px 30px', background: 'var(--primary-hex)', color: 'var(--primary-fg)',
              border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem',
              cursor: 'pointer', minHeight: '48px',
            }}
          >
            Rodar simulação
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.6 }}>
            Leva alguns segundos. <strong>Atualize a página</strong> depois para ver o resultado
            aparecer aqui embaixo.
          </p>
        </form>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>
        Suas simulações ({comparadas.length})
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
        O gráfico verde mostra o dinheiro ao longo do tempo. A faixa vermelha embaixo mostra o quanto
        ele estava abaixo do melhor momento.
      </p>

      {comparadas.length === 0 ? (
        <div style={{ ...card, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          Nenhuma simulação ainda. O formulário acima já está preenchido com um exemplo pronto: clique
          em <strong>Rodar simulação</strong> e atualize a página em alguns segundos.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '18px' }}>
          {comparadas.map((r) => (
            <CartaoRodada key={r.id} r={r} />
          ))}
        </div>
      )}

      <div style={{ ...card, marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground-hex)' }}>O que a simulação já desconta</strong>
        <div style={{ marginTop: '6px' }}>
          Emolumentos da B3 em cada ordem, a diferença de preço entre a decisão e a execução, e o
          imposto de renda de verdade: 15% sobre o lucro em ações, com a isenção de R$ 20 mil de
          vendas por mês, e 20% no day trade sem isenção nenhuma. Por isso o número que aparece é
          menor, e mais honesto, que o de qualquer planilha.
        </div>
        <div style={{ marginTop: '10px' }}>
          Dados disponíveis: {cobertura.diarioTickers.toLocaleString('pt-BR')} papéis com preço de
          fechamento diário de {cobertura.diarioDe} a {cobertura.diarioAte}. Para day trade, só{' '}
          {cobertura.intradayTickers} papéis nos últimos {cobertura.intradayPregoes} pregões.
        </div>
      </div>
    </>
  );
}
