// electron-builder afterPack 钩子，做两件事：
//
// 1) electron-builder 复制 extraResources 时不会带进 signal-app.asar.unpacked\node_modules
//    （Signal 的原生模块 libsignal 等），会导致打包后的 Signal 报
//    "The specified module could not be found"。此钩子把项目 resources 里的
//    signal-app.asar.unpacked\node_modules 复制进 appOutDir 的对应目录。
//
// 2) 对 signal-app.asar 做两处"等长就地替换"（不改动 asar 结构，幂等）：
//    a. 放行渲染层 CSP 的 http:（渲染注入脚本要 fetch 宿主本地翻译服务
//       http://127.0.0.1:17890/translate，否则被 CSP 拦成 "Failed to fetch"）；
//    b. 关闭内置 Signal 的自动更新（config/production.json 的 updatesEnabled），
//       避免它静默下载 128MB 官方安装包并弹出点了没反应的"重启更新"。
//    详见 scripts/patch-signal-asar.js。
//
// 两个平台都需要这两件事 —— macOS 版内置 Signal 同样要过 CSP 放行与禁用自更新，
// 只是原生模块的 prebuilds 变成 darwin-arm64 / darwin-x64。
const { existsSync, cpSync } = require('fs');
const { join } = require('path');
const { patchSignalAsar } = require('../scripts/patch-signal-asar.js');

/**
 * 平台相关的源 / 目标资源目录。
 *
 * 目标（打包产物内）布局两平台不同，且 electron-builder 各版本给的 appOutDir
 * 层级也不完全一致（有时是 <App>.app，有时已经到 Contents），因此统一按
 * "哪个候选中存在 signal-app.asar" 来判定，避免写死一层结构。
 *
 * @returns {{ src: string, dst: string }|null} 打包产物里没有内置 Signal 时返回 null
 */
function resolveSignalResources(appOutDir, electronPlatformName) {
  const isMac = electronPlatformName === 'darwin';
  const src = isMac
    ? join(__dirname, '..', 'resources', 'mac')
    : join(__dirname, '..', 'resources');

  const candidates = isMac
    ? [
        join(appOutDir, 'Contents', 'Resources'), // appOutDir = <App>.app
        join(appOutDir, 'Resources'), // appOutDir = <App>.app/Contents
        appOutDir, // 已经指向资源目录
      ]
    : [join(appOutDir, 'resources'), appOutDir];

  const dst = candidates.find((d) => existsSync(join(d, 'signal-app.asar')));
  if (!dst) {
    console.log(
      `[afterpack] ${electronPlatformName}: 打包产物中没有内置 Signal（appOutDir=${appOutDir}），跳过`
    );
    return null;
  }
  return { src, dst };
}

/**
 * @param {object} context electron-builder afterPack context
 * @param {object} context.appOutDir 打包输出目录
 * @param {string} context.electronPlatformName 'win32' | 'darwin' | 'linux'
 */
module.exports = async function afterPack(context) {
  const { appOutDir, electronPlatformName } = context;
  if (!appOutDir) return;

  const dirs = resolveSignalResources(appOutDir, electronPlatformName);
  if (!dirs) return;
  const { src, dst } = dirs;

  const srcNode = join(src, 'signal-app.asar.unpacked', 'node_modules');
  const dstNode = join(dst, 'signal-app.asar.unpacked', 'node_modules');
  if (!existsSync(srcNode)) {
    console.log('[afterpack] 源 signal-app.asar.unpacked/node_modules 不存在，跳过');
  } else if (existsSync(dstNode)) {
    console.log('[afterpack] 目标 node_modules 已存在，跳过');
  } else {
    try {
      cpSync(srcNode, dstNode, { recursive: true });
      console.log(`[afterpack] 已把 signal-app.asar.unpacked/node_modules 复制到打包目录 (${dst})`);
    } catch (e) {
      console.log('[afterpack] 复制失败:', e && e.message ? e.message : e);
    }
  }

  // 就地修补：CSP 放行 http: + 关闭内置 Signal 自动更新。
  //
  // 这里不再因"找不到目标字节"而中断出包（patchSignalAsar 已把未命中降级为告警）；
  // 但 Windows 的 signal-app.asar 是逐版本验证过的，它一旦异常说明有人动过 asar，
  // 必须让构建失败引起注意。mac 版是从官方 Signal 现场提取的，版本不可控，
  // 最多是 CSP 没放行（表现为 Signal 里翻译报 failed to fetch），不该拦住打包。
  try {
    const res = patchSignalAsar(join(dst, 'signal-app.asar'));
    for (const w of res.warnings) console.log(`[afterpack] ⚠️  ${w}`);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    if (electronPlatformName === 'darwin') {
      console.log('[afterpack] ⚠️  修补 macOS 版 Signal asar 失败，继续出包：' + msg);
      console.log('[afterpack]     （若 Signal 翻译报 failed to fetch，就是这个 CSP 没放行）');
    } else {
      console.log('[afterpack] 修补 signal-app.asar 失败:', msg);
      throw e;
    }
  }
};
