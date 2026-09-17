// Roda `tsc --noEmit` em cada workspace que existir e tiver script `typecheck`.
// Se nenhum workspace existir ainda (Phase 0 antes da Task 2), exit 0.
// Se algum workspace existir e seu typecheck falhar, propaga o exit code.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const WORKSPACES = ['app', 'worker', 'db'];
const existing = WORKSPACES.filter((d) => existsSync(d));

if (existing.length === 0) {
  console.log('typecheck: nenhum workspace existe ainda (Phase 0 scaffolding) — pulando');
  process.exit(0);
}

console.log(`typecheck: rodando em ${existing.join(', ')}`);
const result = spawnSync('npm', ['--workspaces', '--if-present', 'run', 'typecheck'], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);
