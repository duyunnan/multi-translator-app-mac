import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const binName = process.platform === 'win32' ? 'electron-vite.cmd' : 'electron-vite';
const binPath = path.resolve('node_modules', '.bin', binName);

const useShell = process.platform === 'win32';

const buildPreload = spawnSync('node', ['scripts/build-preload-split.mjs'], {
  stdio: 'inherit',
});
if (buildPreload.status !== 0) {
  process.exit(buildPreload.status ?? 1);
}

const dev = spawn(binPath, ['dev', '--watch'], {
  stdio: 'inherit',
  shell: useShell,
  env: {
    ...process.env,
    PRELOAD_SKIP: '1',
    DISABLE_BYTECODE: '1',
  },
});

dev.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

dev.on('close', (code) => {
  process.exit(code ?? 1);
});
