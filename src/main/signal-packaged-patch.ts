// @ts-nocheck
// Patch to make the bundled Signal asar behave as a *packaged* app.
//
// Why: Signal's locale loader (main.js `Cv({ isPackaged })`) picks the locale
// file based on `app.isPackaged`:
//   isPackaged === true  -> _locales/<locale>/values.json   (exists in our asar)
//   isPackaged === false -> _locales/<locale>/messages.json (DEV path, NOT in asar)
// When we launch via "electron.exe signal-app.asar", Electron treats it as a
// dev run, so app.isPackaged is false and Signal crashes with:
//   "ENOENT, _locales\zh-CN\messages.json not found in signal-app.asar"
//
// Removing process.defaultApp alone is NOT enough on modern Electron (isPackaged
// is no longer derived from it), so we override app.isPackaged directly and also
// normalise the environment to production.
//
// This file is injected via `electron -r signal-packaged-patch.js signal-app.asar`,
// so it runs in the Signal child's main process BEFORE Signal's own main.js.

'use strict';

// --- URLPattern polyfill ---
// Signal's notification service worker code (chunks/notifications.std-*.js)
// uses `new URLPattern(...)` at module top-level. URLPattern is a browser
// Web API and is not available in Node.js / the Electron main process, so
// Signal crashes on load with "ReferenceError: URLPattern is not defined".
// The `urlpattern-polyfill` package (installed in this project) auto-registers
// `URLPattern` on globalThis on require, so loading it here is enough.
import 'urlpattern-polyfill';

// Full-featured Signal renderer enhancement script (send CN→EN translation on
// Enter, inbound EN→ZH auto-translate badges, smart-reply ↩ buttons, unread
// count, login-modal killer). Kept as a standalone .js file and inlined here
// via ?raw — same behaviour as the multi-translator-app2 build. Unlike app2,
// its translate/reply requests hit OUR host local-server directly
// (127.0.0.1:17890 / 17891, see services/local-server.ts): the host relaxed
// Signal's CSP — the response-header CSP is dropped below, and background.html's
// <meta http-equiv="Content-Security-Policy"> is rewritten in-place by
// scripts/patch-signal-asar.js (wired into build/afterpack.js) to allow http: —
// so renderer-side fetch() works, and no main-process queue-drain LLM bridge is needed.
import SIGNAL_RENDERER_INJECT_JS from './signal-renderer-inject.js?raw';

// ─── Suppress Signal's own system tray icons ────────────────────────────────
// 每个内置 Signal 子进程都会通过 SystemTrayService 创建自己的 NotifyIcon：
// 多账号时托盘里会冒出多个重复的 Signal 图标，进程被 taskkill /F 强杀时还会
// 残留成"幽灵图标"（TerminateProcess 没机会调 tray.destroy()）。
// 这里在 Signal main 加载之前把 electron.Tray 换成 no-op，Signal 拿到的是空壳
// 对象，不会向 explorer 注册任何图标。
// 宿主（翻译器主程序）的托盘不受影响——那是另一个进程、另一份 electron 模块。
// 与主进程 signal-manager 的 disableSignalSystemTray(config.json) 形成双保险。
(function stubSignalTray() {
  try {
    const { EventEmitter } = require('events');
    const electron = require('electron');
    class NoopTray extends EventEmitter {
      constructor() { super(); }
      setImage() {}
      setToolTip() {}
      setContextMenu() {}
      setTitle() {}
      setIgnoreDoubleClickEvents() {}
      displayBalloon() {}
      removeBalloon() {}
      destroy() {}
      isDestroyed() { return false; }
      getBounds() { return { x: 0, y: 0, width: 0, height: 0 }; }
      on() { return this; }
      once() { return this; }
      emit() { return false; }
    }
    try {
      Object.defineProperty(electron, 'Tray', {
        configurable: true,
        enumerable: true,
        get() { return NoopTray; },
        set() { /* 忽略 Signal 侧可能的重赋值 */ },
      });
    } catch (eDef) {
      try { electron.Tray = NoopTray; } catch (eAssign) {}
    }
    console.log('[signal-patch] Tray stubbed (no Signal tray icons)');
  } catch (e) {
    console.error('[signal-patch] Tray stub failed:', e && e.message);
  }
})();

// Normalise environment hints Signal / the `config` package read.
// 注意：SIGNAL_DISABLE_UPDATES 在新版 Signal 内核里已无任何引用（实测无效），
// 自动更新改由 scripts/patch-signal-asar.js 在打包 signal-app.asar 时关闭，此处不再设置。
process.env.NODE_ENV = 'production';
process.env.SIGNAL_ENV = 'production';

// Legacy hint (harmless on newer Electron).
try {
  Object.defineProperty(process, 'defaultApp', {
    value: undefined,
    writable: true,
    configurable: true,
  });
} catch (e) {}

// The real fix: force app.isPackaged === true.
try {
  const { app } = require('electron');
  try { app.disableHardwareAcceleration(); } catch (e) {}

  let overridden = false;
  try {
    Object.defineProperty(app, 'isPackaged', {
      configurable: true,
      enumerable: true,
      get() { return true; },
    });
    overridden = app.isPackaged === true;
  } catch (e) {
    // Own property may be a non-configurable value prop on some builds; fall
    // back to patching the prototype, which the instance inherits from.
  }

  if (!overridden) {
    try {
      const proto = Object.getPrototypeOf(app);
      Object.defineProperty(proto, 'isPackaged', {
        configurable: true,
        enumerable: true,
        get() { return true; },
      });
      overridden = app.isPackaged === true;
    } catch (e2) {}
  }

  if (!overridden) {
    console.error('[signal-patch] WARNING: failed to force app.isPackaged=true; Signal may crash on locale load');
  } else {
    console.log('[signal-patch] app.isPackaged forced to true (packaged mode)');
  }
} catch (e) {
  console.error('[signal-patch] could not require electron:', e && e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Make the bundled (modified) Signal translate via free Google Translate.
//
// The bundled Signal funnels ALL translation (auto-translate, 点击翻译, send
// translation) through one function, Jat(), which originally POSTed to the
// third-party relay api.heiyt.com/hyt/dcfy/dcFyCollect and required an account
// login (账号/密码/服务器 高速线路). That relay is the source of the "点击翻译"
// error and the nag login modal.
//
// We already rewrote Jat() inside signal-app.asar to call
// translate.googleapis.com directly (returning the same {code,data} shape), so
// every existing translation feature now runs on Google with no login. Here we
// only need to:
//   1) strip Signal's Content-Security-Policy so the renderer-side fetch() used
//      by the patched Jat() is allowed to reach Google;
//   2) remove the leftover heiyt login modal whenever it pops up.
// ─────────────────────────────────────────────────────────────────────────────
try {
  const { app, session } = require('electron');

  const rendererRecoveryAttempts = new WeakMap();
  app.on('web-contents-created', (event, wc) => {
    wc.on('render-process-gone', (goneEvent, details) => {
      if (wc.isDestroyed()) return;
      const attempts = rendererRecoveryAttempts.get(wc) || 0;
      if (attempts >= 3) return;
      rendererRecoveryAttempts.set(wc, attempts + 1);
      try { process.stdout.write('\n[MT-RENDER-RECOVER] ' + String(details && details.reason || 'crashed') + '\n'); } catch (e) {}
      setTimeout(() => {
        if (wc.isDestroyed()) return;
        try { wc.reloadIgnoringCache(); } catch (e) {}
      }, 800 + attempts * 1200);
    });
    wc.on('did-finish-load', () => rendererRecoveryAttempts.set(wc, 0));
  });

  // (1) Relax CSP so the patched Jat()'s fetch() to Google is permitted.
  app.whenReady().then(() => {
    try {
      session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
        const headers = details.responseHeaders || {};
        for (const key of Object.keys(headers)) {
          if (/^content-security-policy(-report-only)?$/i.test(key)) {
            delete headers[key];
          }
        }
        cb({ responseHeaders: headers });
      });
      console.log('[signal-patch] CSP relaxed for Google translation');
    } catch (e) {
      console.error('[signal-patch] failed to relax CSP:', e && e.message);
    }

    // (1b) Session-level polyfill preload: Signal 8.x renderer (bundles/preload/main.js)
    // uses newer Web APIs (RegExp.escape, etc.) that this Electron may not ship yet,
    // causing "Preload error in wrapper.js: RegExp.escape is not a function" and a stuck
    // loading/logo screen. Preloads added via session.setPreloads run BEFORE the page's
    // own preload, so defining the polyfills here makes them available to wrapper.js.
    try {
      const fs = require('fs') as typeof import('fs');
      const path = require('path') as typeof import('path');
      const polyfill = `
'use strict';
// Polyfills injected by host before Signal's own preload runs.
if (typeof RegExp.escape !== 'function') {
  Object.defineProperty(RegExp, 'escape', {
    configurable: true,
    writable: true,
    value: function (s) {
      return String(s).replace(/[\\\\^$.*+?()[\\]{}|/]/g, '\\\\$&');
    }
  });
}
`;
      const polyPath = path.join(app.getPath('userData'), 'mt-polyfill-preload.js');
      fs.writeFileSync(polyPath, polyfill, 'utf8');
      session.defaultSession.setPreloads([polyPath]);
      console.log('[signal-patch] session polyfill preload set (RegExp.escape)');
    } catch (e) {
      console.error('[signal-patch] failed to set polyfill preload:', e && e.message);
    }

    // (1c) Signal 在 packaged 模式下会拦截 http/https/ws/wss，把所有这类请求直接
    // 以 ERR_ACCESS_DENIED(-10) 结束（asar 里 Lg({enableHttp:false}) →
    // protocol.interceptFileProtocol('http', Ig)，Ig 就是 t({error:-10})）。
    // 于是注入脚本 fetch('http://127.0.0.1:17890/translate') 会在 1ms 内抛
    // TypeError: Failed to fetch —— 与 CSP 无关，改 CSP 补丁无法解决。
    // Signal 自身业务走主进程，不受影响；这里只放行渲染层到宿主本地翻译服务的连接。
    //
    // 注意：Signal 的 Lg()/intercept 调用发生在它自己的 app.on('ready') 回调里，
    // 我们无法预知确切时机（可能晚于固定 setTimeout）。因此不能用"单次延迟解除"，
    // 也不能用"发现未拦截就立即停止"——那样会在 Signal 注册之前误判为已完成。
    // 这里在启动后的一段窗口内持续轮询（默认 30s，每 500ms 一次），只要发现某
    // scheme 被拦截就立即解除，窗口结束才停止，确保捕获到迟到的注册。
    try {
      const MT_SCHEMES = ['http', 'https', 'ws', 'wss'];
      const ses = session.defaultSession;
      const mtHasQuery =
        typeof ses.protocol.isProtocolIntercepted === 'function';

      const mtReleaseInterceptions = () => {
        let released = 0;
        for (const scheme of MT_SCHEMES) {
          try {
            // 有查询 API 时只在确实被拦截时解除，避免无谓调用报错。
            if (mtHasQuery && !ses.protocol.isProtocolIntercepted(scheme)) continue;
            ses.protocol.uninterceptProtocol(scheme);
            released += 1;
            console.log(`[signal-patch] protocol interception removed: ${scheme}`);
          } catch (e) {
            // 未被拦截（或该 Electron 版本不支持查询 API）时抛错，忽略即可。
          }
        }
        return released;
      };

      // 先立刻试一次，覆盖 Signal 在 ready 之前就完成注册的情况。
      mtReleaseInterceptions();

      let mtTicks = 0;
      const MT_TICKS_MAX = 60; // 60 * 500ms ≈ 30s
      const mtTimer = setInterval(() => {
        mtTicks += 1;
        const released = mtReleaseInterceptions();
        if (released > 0) {
          console.log(`[signal-patch] protocol interception released (tick=${mtTicks})`);
        }
        if (mtTicks >= MT_TICKS_MAX) {
          clearInterval(mtTimer);
          console.log('[signal-patch] protocol interception guard window closed');
        }
      }, 500);
      console.log('[signal-patch] protocol interception guard armed (30s window)');
    } catch (e) {
      console.error('[signal-patch] failed to remove protocol interception:', e && e.message);
    }
  }).catch(() => {});

  // (2) Full-featured Signal renderer enhancement — kill the heiyt login modal
  //     whenever it appears; outbound send-translation (Enter: CN→EN, preview
  //     bar + confirm-on-second-Enter + Esc restore); inbound auto-translate
  //     (EN→ZH badges with caching / read-more expansion / weak-result retry /
  //     clock restore); smart-reply ↩ buttons; unread count for the card UI.
  //     Script lives in src/main/signal-renderer-inject.js (inlined via ?raw)
  //     and talks straight to the host local-server (17890/17891) — no LLM
  //     queue-drain bridge needed in this process.
  const CLEANUP_JS = SIGNAL_RENDERER_INJECT_JS;

  app.on('web-contents-created', (event, wc) => {
    const inject = () => { wc.executeJavaScript(CLEANUP_JS).catch(() => {}); };
    wc.on('dom-ready', inject);

    // Pull the renderer-computed unread count and emit it on stdout so our host
    // (signal-process.js) can forward it to the card UI. Only top-level windows
    // report; webviews / devtools / background pages are ignored.
    let lastReported = -1;
    let poll = null;
    try {
      if (wc.getType && wc.getType() === 'window') {
        poll = setInterval(() => {
          if (wc.isDestroyed()) { clearInterval(poll); return; }
          wc.executeJavaScript('window.__mtUnreadCount||0', true)
            .then((count) => {
              const n = Number(count) || 0;
              if (n === lastReported) return;
              lastReported = n;
              try { process.stdout.write('\n[MT-UNREAD] ' + n + '\n'); } catch (e) {}
            })
            .catch(() => {});
        }, 2500);
        wc.on('destroyed', () => { if (poll) clearInterval(poll); });
      }
    } catch (e) {}
  });
  console.log('[signal-patch] Google-translate mode armed (login modal suppressed)');
} catch (e) {
  console.error('[signal-patch] cleanup setup failed:', e && e.message);
}

// 作为副作用模块被 signal-mode.ts 导入（export 标记模块边界）
export {};
