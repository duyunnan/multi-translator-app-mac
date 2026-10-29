// 就地修补 signal-app.asar：① 放行渲染页 meta CSP 的 http:；② 关闭内置 Signal 自动更新。
//
// 背景：Signal 主窗口加载的是 background.html，它用 <meta http-equiv="Content-Security-Policy">
// 声明 connect-src：
//     connect-src 'self' https: wss: attachment: bundles:;
// signal-packaged-patch.ts 只能删除「响应头」里的 CSP，删不掉 HTML 里的 meta CSP，
// 于是渲染层（注入的 signal-renderer-inject.js）直连宿主本地翻译服务
//     fetch('http://127.0.0.1:17890/translate')
// 会被 CSP 拦下，浏览器只抛出 TypeError: Failed to fetch，
// 界面表现为「Signal 回车翻译失败：failed to fetch」。
//
// 做法：在 connect-src 白名单里补一个 http:，同时把该指令前的一段缩进空白压缩掉相同
// 字节数，保证总长度完全不变 —— 这样无需重建 90MB 的 asar，
// asar header 里的 offset/size 全部保持不变，直接在原偏移处覆盖写入即可。
//
// 【为什么不写死整行字节串】早期版本是精确匹配
//     "            connect-src 'self' https: wss: attachment: bundles:;"
// 这在 Windows 的 signal-app.asar 上一直有效，但 mac 版的 asar 是从官方 Signal Desktop
// 现场提取的，缩进、指令顺序、Signal 版本都可能不同，精确串一旦不匹配就直接抛异常，
// 连带 afterpack 失败、打包中断。现在只锚定 "connect-src" 关键字与指令结束的 ';'，
// 对排版差异免疫；对原有的 Windows asar 仍产出逐字节相同的结果。
//
// 用法：node scripts/patch-signal-asar.js [asar 路径 ...]
// 也可 require 后调用 patchSignalAsar(path)，构建钩子 build/afterpack.js 就是这么用的。
'use strict';

const fs = require('fs');
const path = require('path');

// 保留旧导出，避免其它脚本直接引用这些常量时报错
const OLD = Buffer.from("            connect-src 'self' https: wss: attachment: bundles:;", 'utf8');
const NEW = Buffer.from("      connect-src 'self' https: wss: http: attachment: bundles:;", 'utf8');

// ── 关闭内置 Signal 的自动更新 ────────────────────────────────────────────────
// Signal 主进程启动更新检查前会判断（bundles/main.js）：
//     function shouldSkipUpdates() { return !app.isPackaged || !Config.get('updatesEnabled') }
// signal-packaged-patch.ts 为了修 locale 崩溃把 app.isPackaged 强制成 true，于是
// 唯一开关就落在 Config.get('updatesEnabled') 上——它读的是 asar 内
// config/production.json（patch 里 SIGNAL_ENV=production），值是 true。
//
// 我们的内置 Signal 是宿主整包分发的，版本随宿主走，绝不能让它自己去
// updates2.signal.org 拉新版：实测它会把 128MB 的官方安装包静默下载进 profile 的
// update-cache，弹出"有可用更新，点击重启 Signal"，而安装器在 asar 环境里根本起不来，
// 点下去毫无反应，用户只会以为软件坏了。
//
// 同样用等长覆盖："true"→"false" 多 1 字节，靠去掉冒号后的那个空格补回来。
const UPD_OLD = Buffer.from('"updatesEnabled": true', 'utf8');
const UPD_NEW = Buffer.from('"updatesEnabled":false', 'utf8');

const KEY_CONNECT_SRC = Buffer.from('connect-src', 'utf8');
const SEMI = 0x3b; // ';'
/** 要插入的 token：" http:" —— 注意 CSP 里指令之间必须以空白分隔 */
const INSERT = Buffer.from(' http:', 'utf8');

function isSpaceByte(b) {
  // CSP 的前导空白只可能是空格 / 制表符 / 换行 / 回车，别把 \0 之类算进来
  return b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d;
}

/**
 * 规划「给 CSP 的 connect-src 放行 http:」的等长替换。
 *
 * 算法：
 *   1. 在整份 asar 字节流里找所有 "connect-src"；
 *   2. 取它到下一个 ';' 之间的一段（即 CSP 里的一条指令），只处理看起来真的像
 *      connect-src 的段（含 'self' 或 https:）；
 *   3. 里面若已有独立的 http: token，视为已修补；
 *   4. 否则在其 https:（没有的话就用 'self'）后面插入 " http:"，
 *      再把该段**前面**的连续空白压缩掉同样多的字节来保持总长不变
 *      —— CSP 里空白的数量没有语义，压缩缩进是安全的。
 *
 * Signal 里不止一处 CSP：background.html 主窗口有一条，另有辅助页面也各有一条
 * （实测同一份 asar 里有 `connect-src 'self' https: wss: …` 和 `connect-src 'self' https:;`
 * 两种形态）。注入脚本会打到**每一个** webContents 上，所以这里对命中处一律放行，
 * 而不是像早期那样要求"只能命中一处"。
 *
 * @returns {{jobs: {at:number, data:Buffer, text:string}[], sawCandidate: boolean}}
 */
function planCspRelax(buf, asarPath) {
  const jobs = [];
  let sawCandidate = false;
  let cursor = 0;

  for (;;) {
    const at = buf.indexOf(KEY_CONNECT_SRC, cursor);
    if (at === -1) break;
    cursor = at + KEY_CONNECT_SRC.length;
    const semi = buf.indexOf(SEMI, at);
    if (semi === -1) continue; // 没有 ';' 结尾，不是完整的 CSP 指令
    const text = buf.toString('utf8', at, semi);
    if (!/'self'|https:/.test(text)) continue; // 大概率不是 CSP（可能是代码标识符）
    sawCandidate = true;
    // 注意 "https:" 不含 "http:" 子串（http 后面是 s），所以下面这个判断是安全的
    if (/http:/.test(text)) continue; // 这一处已经放过 http:，保持幂等

    const anchor = /https:/.test(text) ? 'https:' : "'self'";
    const occurrences = text.split(anchor).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `[patch-signal-asar] CSP connect-src 里出现 ${occurrences} 处 ${anchor}，放弃修改: ${asarPath}`
      );
    }
    const textNew = text.replace(anchor, `${anchor}${INSERT.toString('utf8')}`);

    // 向前吞掉连续空白，用来抵掉多出来的 INSERT.length 字节
    // （CSP 里空白数量没有语义，压缩缩进是安全的）
    let wsStart = at;
    while (wsStart > 0 && isSpaceByte(buf[wsStart - 1])) wsStart -= 1;
    const wsLen = at - wsStart;
    const keep = wsLen - INSERT.length;
    if (keep < 0) {
      throw new Error(
        `[patch-signal-asar] connect-src @${at} 前只有 ${wsLen} 字节空白，不足 ${INSERT.length} 字节，无法等长替换: ${asarPath}`
      );
    }

    const data = Buffer.concat([
      buf.subarray(wsStart, wsStart + keep),
      Buffer.from(textNew, 'utf8'),
    ]);
    // 防御：长度必须与覆盖区间完全一致，否则会错位破坏 asar
    if (data.length !== semi - wsStart) {
      throw new Error(
        `[patch-signal-asar] 内部错误：替换段长度 ${data.length} != ${semi - wsStart}: ${asarPath}`
      );
    }
    jobs.push({ at: wsStart, data, text: textNew });
  }

  return { jobs, sawCandidate };
}

/**
 * 就地修补 signal-app.asar（幂等）。两个等长替换互相独立判断，任一已打过不影响另一个。
 *
 * 与旧版的差别：**不再因 asar 版本不符而抛异常**。找不到目标时只记录警告并返回
 * { patched:false, warnings:[…] } —— 因为这个是打包流程的一环，不该让"某个 Signal
 * 版本的字符串不一样"直接中断出包；是否致命由调用方（afterpack）按平台决定。
 *
 * @param {string} asarPath signal-app.asar 路径
 * @param {(msg: string) => void} [log]
 * @returns {{patched: boolean, warnings: string[]}} 是否实际写入
 */
function patchSignalAsar(asarPath, log) {
  const say = typeof log === 'function' ? log : console.log;
  const warnings = [];
  const name = path.basename(asarPath || '');
  if (!asarPath || !fs.existsSync(asarPath)) {
    say(`[patch-signal-asar] 文件不存在，跳过: ${asarPath}`);
    return { patched: false, warnings };
  }

  const buf = fs.readFileSync(asarPath);
  const jobs = [];

  // ① CSP 放行 http:（渲染层要 fetch 宿主本地翻译服务）
  const csp = planCspRelax(buf, asarPath);
  for (const job of csp.jobs) {
    jobs.push({ at: job.at, data: job.data, what: `放行 http: @${job.at}` });
  }
  if (!csp.sawCandidate) {
    warnings.push(
      'CSP connect-src 未命中：未能在 asar 里找到 connect-src 指令。' +
        '若这是新版本的 Signal，请确认主窗口的 meta CSP 是否已放行 http: —— ' +
        '否则渲染层 fetch("http://127.0.0.1:17890/translate") 会被拦，Signal 实时翻译失效。'
    );
  }

  // ② 关闭内置 Signal 自动更新
  if (UPD_OLD.length !== UPD_NEW.length) {
    throw new Error('[patch-signal-asar] updatesEnabled：替换串长度不一致，拒绝修改');
  }
  const updAt = buf.indexOf(UPD_OLD);
  if (updAt !== -1) {
    if (buf.indexOf(UPD_OLD, updAt + 1) !== -1) {
      warnings.push('updatesEnabled 命中多处，跳过（需人工确认）');
    } else {
      jobs.push({ at: updAt, data: UPD_NEW, what: '关闭内置 Signal 自动更新' });
    }
  } else if (buf.indexOf(UPD_NEW) === -1) {
    warnings.push(
      'updatesEnabled 未命中：config/production.json 里没找到 "updatesEnabled": true。' +
        '内置 Signal 可能会自更新并下载官方安装包。'
    );
  }

  if (jobs.length === 0) {
    say(`[patch-signal-asar] 补丁均已应用，无需修改: ${name}`);
    for (const w of warnings) say(`[patch-signal-asar] ⚠️  ${w}`);
    return { patched: false, warnings };
  }

  const fd = fs.openSync(asarPath, 'r+');
  try {
    for (const job of jobs) fs.writeSync(fd, job.data, 0, job.data.length, job.at);
  } finally {
    fs.closeSync(fd);
  }
  for (const job of jobs) {
    say(
      `[patch-signal-asar] 已${job.what}（offset=${job.at}，覆盖 ${job.data.length} 字节，asar 结构未变）: ${name}`
    );
  }
  for (const w of warnings) say(`[patch-signal-asar] ⚠️  ${w}`);
  return { patched: true, warnings };
}

module.exports = { patchSignalAsar, planCspRelax, OLD, NEW, UPD_OLD, UPD_NEW };

if (require.main === module) {
  const targets = process.argv.slice(2);
  const list = targets.length
    ? targets
    : [path.join(__dirname, '..', 'resources', 'signal-app.asar')];
  let changed = 0;
  const missed = [];
  for (const t of list) {
    try {
      const r = patchSignalAsar(t);
      if (r.patched) changed += 1;
      if (r.warnings.length) missed.push(path.basename(t));
    } catch (e) {
      console.error(String((e && e.message) || e));
      process.exitCode = 1;
    }
  }
  console.log(`[patch-signal-asar] 完成，改写 ${changed} 个文件${missed.length ? `，有告警: ${missed.join(', ')}` : ''}`);
}
