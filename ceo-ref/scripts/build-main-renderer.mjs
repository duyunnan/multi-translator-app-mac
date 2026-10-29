import {spawnSync} from 'node:child_process';
import path from 'node:path';

const binName = process.platform === 'win32' ? 'electron-vite.cmd' : 'electron-vite';
const binPath = path.resolve('node_modules', '.bin', binName);
const useShell = process.platform === 'win32';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const shouldX64 = args.has('--x64');

const env = {
    ...process.env,
    PRELOAD_SKIP: '1',
};

if (process.arch === 'arm64' && shouldX64) {
    env.EXEC_PATH = 'node_modules/electron/electron-x64/Electron.app/Contents/MacOS/Electron';
}

const result = spawnSync(binPath, ['build'], {
    stdio: 'inherit',
    shell: useShell,
    env,
});

if (result.error) {
    console.error(result.error);
    process.exit(1);
}
process.exit(result.status ?? 1);
