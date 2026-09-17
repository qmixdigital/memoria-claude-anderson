import { resumoDeCustos, saldosAoVivo, USD_POR_CREDITO } from "@/lib/custos";
import { sessaoAtual } from "@/lib/sessao";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const usd = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "USD" });

function Cartao({
  titulo,
  valor,
  detalhe,
  tom = "normal",
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
  tom?: "normal" | "bom" | "alerta";
}) {
  const cor =
    tom === "bom"
      ? "text-emerald-400"
      : tom === "alerta"
        ? "text-amber-400"
        : "text-[#e7f1ff]";
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wider text-[#8899aa]">{titulo}</div>
      <div className={`mt-1 text-2xl font-semibold ${cor}`}>{valor}</div>
      {detalhe && <div className="mt-1 text-xs text-[#8899aa]">{detalhe}</div>}
    </div>
  );
}

export default async function CustosPage() {
  // Custo é informação de gestão: exige sessão, como o resto do app.
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/login?next=/custos");

  const [r, saldos] = await Promise.all([resumoDeCustos(), saldosAoVivo()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#e7f1ff]">Custos das APIs</h1>
        <p className="mt-1 text-sm text-[#8899aa]">
          Tudo que a ferramenta gasta com serviços pagos, desde o começo e no mês
          corrente. Crédito do Rapid URL convertido a {usd(USD_POR_CREDITO)} cada.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          titulo="Gasto total"
          valor={usd(r.totalUsd)}
          detalhe={`${usd(r.totalMesUsd)} neste mês`}
        />
        <Cartao
          titulo="DataForSEO"
          valor={usd(r.dfs.usd)}
          detalhe={`${r.dfs.consultas.toLocaleString("pt-BR")} consultas pagas · ${r.dfs.consultasMes} no mês`}
        />
        <Cartao
          titulo="Rapid URL Indexer"
          valor={usd(r.rapid.usd)}
          detalhe={`${r.rapid.envios} URL(s) enviada(s) · ${r.rapid.creditos} crédito(s)`}
        />
        <Cartao
          titulo="Economizado no grátis"
          valor={usd(r.gratis.economiaUsd)}
          tom="bom"
          detalhe={`${r.gratis.consultas.toLocaleString("pt-BR")} conferências pelo Search Console`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-wider text-[#8899aa]">
            Saldo DataForSEO
          </div>
          <div className="mt-1 text-2xl font-semibold text-[#e7f1ff]">
            {saldos.dfsUsd === null ? "—" : usd(saldos.dfsUsd)}
          </div>
          {saldos.dfsErro && (
            <div className="mt-1 text-xs text-amber-400">{saldos.dfsErro}</div>
          )}
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-wider text-[#8899aa]">
            Saldo Rapid URL Indexer
          </div>
          <div className="mt-1 text-2xl font-semibold text-[#e7f1ff]">
            {saldos.rapidCreditos === null
              ? "—"
              : `${saldos.rapidCreditos.toLocaleString("pt-BR")} créditos`}
          </div>
          <div className="mt-1 text-xs text-[#8899aa]">
            {saldos.rapidCreditos !== null
              ? `equivale a ${usd(saldos.rapidCreditos * USD_POR_CREDITO)}`
              : ""}
            {saldos.rapidErro && (
              <span className="text-amber-400">{saldos.rapidErro}</span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[#8899aa]">
            <tr>
              <th className="px-3 py-2.5">Cliente</th>
              <th className="px-3 py-2.5 text-right">Consultas pagas</th>
              <th className="px-3 py-2.5 text-right">Grátis</th>
              <th className="px-3 py-2.5 text-right">DataForSEO</th>
              <th className="px-3 py-2.5 text-right">Créditos</th>
              <th className="px-3 py-2.5 text-right">Rapid URL</th>
              <th className="px-3 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-[#c8d6e5]">
            {r.porCliente.map((l) => (
              <tr key={l.cliente}>
                <td className="px-3 py-2.5 font-medium text-[#e7f1ff]">{l.cliente}</td>
                <td className="px-3 py-2.5 text-right">{l.consultasPagas.toLocaleString("pt-BR")}</td>
                <td className="px-3 py-2.5 text-right text-emerald-400/80">
                  {l.consultasGratis.toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2.5 text-right">{usd(l.dfsUsd)}</td>
                <td className="px-3 py-2.5 text-right">{l.creditos || "—"}</td>
                <td className="px-3 py-2.5 text-right">
                  {l.rapidUsd > 0 ? usd(l.rapidUsd) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-[#e7f1ff]">
                  {usd(l.totalUsd)}
                </td>
              </tr>
            ))}
            {r.porCliente.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[#8899aa]">
                  Nenhum custo registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#8899aa]">
        A conversão do crédito usa {usd(USD_POR_CREDITO)}, o preço do pacote menor.
        Em pacote maior o crédito sai por US$ 0,04, então o número aqui é o teto.
        Ajustável em <code className="text-[#c8d6e5]">RAPIDURL_CREDIT_USD</code> no
        .env. Crédito devolvido (URL que não indexou em 14 dias) não é descontado
        deste total: ele mostra o que foi gasto, não o líquido.
      </p>
    </div>
  );
}
