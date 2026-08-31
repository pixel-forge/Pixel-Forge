import { spawnSync } from 'node:child_process';

const flag = '--use-system-ca';
if (!process.env.NODE_OPTIONS?.includes(flag)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, flag]
    .filter(Boolean)
    .join(' ');
}

const result = spawnSync('pnpm build && changeset publish', {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
