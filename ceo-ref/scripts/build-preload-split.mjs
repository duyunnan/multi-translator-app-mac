import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const shouldZip = args.has('--zip');
const shouldX64 = args.has('--x64');

const preloadTargets = [
    'index',
    'whatsapp',
    'telegram',
    'line',
    'zalo',
    'lineWorks',
    'lineBusiness',
    'messenger',
    'metaBusiness',
    'facebook',
    'twitter',
    'tiktok',
    'telegramZh',
    'googleMessages',
    'instagram',
    'signal',
    // 'snapchat',
    // 'teams',
    // 'tinder',
];

const binName = process.platform === 'win32' ? 'electron-vite.cmd' : 'electron-vite';
const binPath = path.resolve('node_modules', '.bin', binName);
const preloadOutDir = path.resolve('out', 'preload');
const useShell = process.platform === 'win32';
const maxConcurrentBuilds = 8;

fs.rmSync(preloadOutDir, {recursive: true, force: true});

const loadVersions = () => {
    const file = path.resolve('preload-versions.json');
    if (!fs.existsSync(file)) return {};
    try {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const versions = loadVersions();

const createBuildEnv = (target) => {
    const env = {
        ...process.env,
        PRELOAD_ONLY: '1',
        PRELOAD_TARGET: target,
        PRELOAD_OUT_BASE: preloadOutDir,
    };
    if (process.env.DISABLE_BYTECODE === '1') {
        env.DISABLE_BYTECODE = '1';
    }
    if (process.arch === 'arm64' && shouldX64) {
        env.EXEC_PATH = 'node_modules/electron/electron-x64/Electron.app/Contents/MacOS/Electron';
    }

    return env;
};

const runBuild = (target) => {
    return new Promise((resolve, reject) => {
        console.log(`[preload:${target}] build start`);

        const child = spawn(binPath, ['build'], {
            stdio: 'inherit',
            shell: useShell,
            env: createBuildEnv(target),
        });

        child.once('error', (error) => {
            reject(new Error(`[preload:${target}] build spawn failed: ${error.message}`));
        });
        child.once('close', (code, signal) => {
            if (code === 0) {
                console.log(`[preload:${target}] build done`);
                resolve();
                return;
            }

            reject(new Error(`[preload:${target}] build failed: ${signal ? `signal ${signal}` : `exit code ${code ?? 1}`}`));
        });
    });
};

const buildPreloads = async () => {
    let nextIndex = 0;
    let failed = false;
    const workerCount = Math.min(maxConcurrentBuilds, preloadTargets.length);

    const workers = Array.from({length: workerCount}, async () => {
        while (!failed) {
            const target = preloadTargets[nextIndex];
            nextIndex += 1;

            if (!target) return;

            try {
                await runBuild(target);
            } catch (error) {
                failed = true;
                throw error;
            }
        }
    });

    await Promise.all(workers);
};

try {
    await buildPreloads();
} catch (error) {
    console.error(error);
    process.exit(1);
}

fs.mkdirSync(preloadOutDir, {recursive: true});
const manifest = {
    build: new Date().toISOString(),
    preloads: preloadTargets.reduce((acc, name) => {
        const entry = versions[name];
        const version =
            entry && typeof entry === 'object' && typeof entry.version === 'string' && entry.version.trim()
                ? entry.version.trim()
                : '1.0.0';
        const updatedAt =
            entry && typeof entry === 'object' && typeof entry.updatedAt === 'string' && entry.updatedAt.trim()
                ? entry.updatedAt.trim()
                : '';
        acc[name] = {version, updatedAt};
        return acc;
    }, {}),
};
fs.writeFileSync(path.join(preloadOutDir, 'preload-manifest.json'), JSON.stringify(manifest, null, 2));

if (shouldZip) {
    for (const name of preloadTargets) {
        const folder = path.join(preloadOutDir, name);
        if (!fs.existsSync(folder)) continue;
        const zip = new AdmZip();
        zip.addLocalFolder(folder);
        zip.writeZip(path.join(preloadOutDir, `${name}.zip`));
    }
}
