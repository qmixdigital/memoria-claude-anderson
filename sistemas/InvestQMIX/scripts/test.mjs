// Roda vitest em cada workspace que existir e tiver script `test`.
// Diferente de `vitest run` no root: delega para os configs (alias @/, etc.)
// definidos por cada workspace.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const WORKSPACES = ['app', 'worker', 'db'];
const existing = WORKSPACES.filter((d) => existsSync(d));

if (existing.length === 0) {
  console.log('test: nenhum workspace existe ainda');
  process.exit(0);
}

console.log(`test: rodando em ${existing.join(', ')}`);
const result = spawnSync('npm', ['--workspaces', '--if-present', 'run', 'test'], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);
