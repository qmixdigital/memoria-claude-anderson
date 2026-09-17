// Regra do snapshot desnormalizado do Backlink (lastPublished/lastLinkOk/
// lastIndexed), que é o que a tabela e o painel leem.
//
// O ponto central: nos 3 checks, `null` quer dizer "não conseguimos verificar
// desta vez" — NUNCA "não". Gravar esse null por cima de um resultado que já
// tinha sido confirmado destrói informação boa.
//
// Foi exatamente isso que zerou o painel: a rodada por cliente ("Verificar
// todos" dentro do cliente) roda a indexação em modo grátis, que devolve null
// para todo site de terceiro — e esse null apagava o `true` que uma rodada paga
// anterior já tinha descoberto.
//
// O histórico (tabela Check) continua gravando o null de verdade: lá o registro
// é do que aconteceu naquela execução. Aqui é o "melhor conhecido até agora".

export interface Snapshot {
  lastPublished: boolean | null;
  lastLinkOk: boolean | null;
  lastIndexed: boolean | null;
  lastLinkRel: string | null;
  lastFoundAnchor: string | null;
  lastFoundTarget: string | null;
}

export interface SnapshotInput {
  articlePublished: boolean | null;
  linkPresent: boolean | null;
  indexed: boolean | null;
  linkRel?: string | null;
  foundAnchor?: string | null;
  foundTarget?: string | null;
}

/** Mantém o valor anterior quando a verificação atual não concluiu nada. */
const manter = (novo: boolean | null, anterior: boolean | null): boolean | null =>
  novo ?? anterior;

/** Versão para texto (rel e âncora encontrada) — mesma regra do booleano. */
const manterTexto = (novo: string | null | undefined, anterior: string | null) =>
  novo ?? anterior;

export function mergeSnapshot(prev: Snapshot, outcome: SnapshotInput): Snapshot {
  return {
    lastPublished: manter(outcome.articlePublished, prev.lastPublished),
    lastLinkOk: manter(outcome.linkPresent, prev.lastLinkOk),
    lastIndexed: manter(outcome.indexed, prev.lastIndexed),
    lastLinkRel: manterTexto(outcome.linkRel, prev.lastLinkRel),
    lastFoundAnchor: manterTexto(outcome.foundAnchor, prev.lastFoundAnchor),
    lastFoundTarget: manterTexto(outcome.foundTarget, prev.lastFoundTarget),
  };
}
