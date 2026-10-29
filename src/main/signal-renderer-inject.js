/* Injected into Signal renderer on dom-ready. Do not use require/import. */
(function mtSignalCleanup() {
  if (window.__mtSignalCleanupV10) return;
  window.__mtSignalCleanupV10 = true;
  window.__mtSignalCleanupV9 = true;
  window.__mtSignalCleanup = true;
  window.__mtSignalDebug = window.__mtSignalDebug || { scans: 0, queued: 0, ok: 0, fail: 0, lastError: '' };
  // 翻译/回复请求由本页直连宿主 local-server(127.0.0.1:17890/17891)，无需主进程队列桥。
  window.__mtCacheStats = window.__mtCacheStats || { hits: 0, misses: 0 };

  function kickSignalPaint() {
    try {
      var root = document.documentElement;
      if (!root) return;
      root.style.transform = 'translateZ(0)';
      requestAnimationFrame(function () {
        try { root.style.transform = ''; } catch (e2) {}
      });
    } catch (e) {}
  }
  try {
    window.addEventListener('resize', function () {
      kickSignalPaint();
      mtApplyVisibility();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) kickSignalPaint();
      mtApplyVisibility();
    });
    setTimeout(kickSignalPaint, 400);
    setTimeout(kickSignalPaint, 1600);
  } catch (eKick) {}

  /* ── 可见性门控（多开省 CPU 的关键） ──
     宿主切走账号 / 打开浮层 / 最小化时会把本窗口 SW_HIDE，Chromium 随即把
     页面判为 hidden。若不停掉扫描，后台账号的 MutationObserver 仍会随 Signal
     的 DOM 变动反复触发（它**不受**隐藏页定时器节流限制），再叠加下面几个
     setInterval 全 DOM 扫描，开 3~5 个账号就是几倍的空转 → 整机发卡。
     这里在页面隐藏时把所有周期任务一并卸掉，窗口重新可见
     （宿主 ShowWindow(SW_SHOW) 会让 Chromium 派发 visibilitychange）时再武装。
     未读采样是例外：卡片红点要靠它，隐藏时只降频不停。 */
  var mtGate = { armed: false, arms: [], timers: [], observers: [] };

  function mtGatedInterval(fn, ms) {
    var id = setInterval(function () {
      if (mtGate.armed) fn();
    }, ms);
    mtGate.timers.push(id);
    return id;
  }

  /**
   * 门控 + 合并节流的 MutationObserver。
   *
   * 为什么必须节流：Signal 的 DOM 变动极其频繁 —— 输入框每敲一个字、消息列表
   * 增量渲染、typing 指示器、时间戳刷新、动画节点进出，都会产生 childList 记录，
   * 而 subtree: true 覆盖整个应用。若每次变动都同步跑一遍全 DOM 的
   * querySelectorAll 扫描，**单个账号就能把一个核吃满**，这正是「开几个号 CPU
   * 就 90%」的直接来源。这里把 wait 毫秒内的所有变动合并成一次扫描（默认 400ms，
   * 传 0 表示只做同轮合并，适合自身已带 debounce 的回调）。
   */
  function mtGatedObserver(target, cb, opts, waitMs) {
    var timer = null;
    var wait = typeof waitMs === 'number' ? waitMs : 400;
    var o = new MutationObserver(function () {
      if (!mtGate.armed) return;
      if (timer) return; // 已排队：合并进这一次
      timer = setTimeout(function () {
        timer = null;
        if (!mtGate.armed) return; // 排队期间被隐藏/暂停：这次直接丢弃
        try {
          cb();
        } catch (eThr) {}
      }, wait);
    });
    o.observe(target, opts);
    mtGate.observers.push(o);
    return o;
  }

  /** 登记一份「武装动作」：mtArm 时调用，负责重新挂上定时器/观察器 */
  function mtRegisterArm(fn) {
    mtGate.arms.push(fn);
  }

  function mtDisarm() {
    if (!mtGate.armed) return;
    mtGate.armed = false;
    for (var i = 0; i < mtGate.timers.length; i++) {
      try {
        clearInterval(mtGate.timers[i]);
      } catch (eT) {}
    }
    for (var j = 0; j < mtGate.observers.length; j++) {
      try {
        mtGate.observers[j].disconnect();
      } catch (eO) {}
    }
    mtGate.timers = [];
    mtGate.observers = [];
    dbg('scanners paused (window hidden)');
  }

  function mtArm() {
    if (mtGate.armed) return;
    mtGate.armed = true;
    for (var i = 0; i < mtGate.arms.length; i++) {
      try {
        mtGate.arms[i]();
      } catch (eA) {}
    }
    dbg('scanners armed (window visible)');
  }

  function mtApplyVisibility() {
    if (document.hidden) mtDisarm();
    else mtArm();
  }

  function dbg() {
    try {
      var a = ['[mt-signal]'].concat([].slice.call(arguments));
      console.log.apply(console, a);
    } catch (e) {}
  }

  function killLoginModal() {
    try {
      var inputs = document.querySelectorAll('input[placeholder="请输入账号"]');
      for (var i = 0; i < inputs.length; i++) {
        var node = inputs[i];
        while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
        if (node && node.parentElement === document.body) node.remove();
      }
    } catch (e) {}
  }

  // 直连宿主主程序的本地翻译服务（127.0.0.1:17890 / 17891，与 local-server.ts 同协议）。
  // 宿主已在 Signal 子进程删除 CSP，renderer fetch 可用；不再依赖主进程 LLM 队列桥。
  async function translateViaBridge(text, targetLang) {
    var body = { text: String(text || ''), targetLang: targetLang || 'zh-CN' };
    var ports = [17890, 17891];
    var lastErr = '';
    for (var i = 0; i < ports.length; i++) {
      try {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var to = setTimeout(function () { try { if (ctrl) ctrl.abort(); } catch (e) {} }, 22000);
        var resp = await fetch('http://127.0.0.1:' + ports[i] + '/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl ? ctrl.signal : undefined
        });
        clearTimeout(to);
        var data = null;
        try { data = await resp.json(); } catch (eJ) {}
        if (data && data.success) {
          return { success: true, translated: data.translated || '', via: 'local:' + ports[i] };
        }
        lastErr = (data && data.error) || ('HTTP ' + resp.status);
      } catch (eF) {
        lastErr = (eF && eF.message) || String(eF);
      }
    }
    return { success: false, error: String(lastErr || 'translate failed'), translated: '' };
  }

  function translateViaLocalServer(text, targetLang) {
    // 兼容旧调用名：实际全部走主进程 LLM 桥
    return translateViaBridge(text, targetLang);
  }

  function showMtToast(message, duration) {
    duration = duration || 2500;
    var toast = document.getElementById('mt-signal-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mt-signal-toast';
      toast.style.cssText =
        'position:fixed;top:60px;right:20px;background:rgba(37,211,102,0.92);color:#fff;padding:10px 18px;' +
        'border-radius:8px;z-index:99999;font-size:14px;font-weight:500;pointer-events:none;white-space:nowrap;' +
        'transition:opacity .4s;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast.__mtTimer);
    toast.__mtTimer = setTimeout(function () { toast.style.opacity = '0'; }, duration);
  }

  function chineseRatio(text) {
    var t = String(text || '');
    if (!t.length) return 0;
    var cn = (t.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    return cn / t.length;
  }

  function hasChineseText(text) {
    return chineseRatio(text) >= 0.08 || /[\u4e00-\u9fff]/.test(text || '');
  }

  function isChineseEnough(text) {
    return chineseRatio(text) >= 0.12 || ((text.match(/[\u4e00-\u9fff]/g) || []).length >= 2);
  }

  // Signal：只英→中；中文保持原状，不翻成英文
  function shouldSkipAutoTranslate(text) {
    return isChineseEnough(text);
  }

  function pickTargetLang(text) {
    if (shouldSkipAutoTranslate(text)) return null;
    return 'zh-CN';
  }

  function normCmp(s) {
    return String(s || '').replace(/\s+/g, '').toLowerCase();
  }

  function stripTrailingBubbleClock(text) {
    return String(text || '')
      .replace(/(?:\s+\d{1,2}:\d{2}(?::\d{2})?){1,2}\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ── Compose: CN→EN with preview bar (WhatsApp-style confirm) ──
  function findComposeBox() {
    var selectors = [
      '.CompositionArea__input [contenteditable="true"]',
      '.CompositionArea__input .ql-editor',
      '.module-composition-input__input [contenteditable="true"]',
      '.module-composition-input__input .ql-editor',
      '[class*="CompositionArea__input"] [contenteditable="true"]',
      '[class*="composition-input"] [contenteditable="true"]',
      '.composition-area [contenteditable="true"]',
      '.ql-editor[contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
      '[contenteditable="true"].ql-editor',
      'div[contenteditable="true"]'
    ];
    var best = null;
    for (var i = 0; i < selectors.length; i++) {
      var els = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        if (!el || el.offsetWidth < 40 || el.offsetHeight < 12) continue;
        if (el.closest && el.closest('.mt-signal-badge, .mt-signal-preview, [class*="Quote"]')) continue;
        // Prefer the visually lowest (main compose) editable
        if (!best) best = el;
        else {
          try {
            var br = best.getBoundingClientRect();
            var er = el.getBoundingClientRect();
            if (er.top >= br.top) best = el;
          } catch (e) {}
        }
      }
      if (best && i < 6) return best; // strong selectors: take best found
    }
    return best;
  }

  function getComposeText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return (el.value || '').trim();
    return (el.innerText || el.textContent || '').replace(/\u00a0/g, ' ').trim();
  }

  function setComposeText(el, text) {
    if (!el) return false;
    try {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        var desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc && desc.set) desc.set.call(el, text);
        else el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      var ok = document.execCommand('insertText', false, text);
      if (!ok || getComposeText(el) !== text) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function findComposeFooterHost() {
    return (
      document.querySelector('.CompositionArea__row--control-row') ||
      document.querySelector('.CompositionArea__input') ||
      document.querySelector('[class*="CompositionArea__input"]') ||
      document.querySelector('.module-composition-input__input') ||
      (findComposeBox() && findComposeBox().parentElement) ||
      null
    );
  }

  var __mtPreviewEl = null;
  function hidePreviewBar() {
    if (__mtPreviewEl && __mtPreviewEl.isConnected) __mtPreviewEl.style.display = 'none';
  }

  function getOrCreatePreviewBar() {
    if (__mtPreviewEl && __mtPreviewEl.isConnected) return __mtPreviewEl;
    var host = findComposeFooterHost();
    if (!host) return null;
    var bar = document.createElement('div');
    bar.id = 'mt-translate-preview';
    bar.className = 'mt-signal-preview';
    bar.style.cssText =
      'position:relative;display:none;align-items:flex-start;gap:8px;z-index:50;' +
      'background:linear-gradient(90deg,#e8f5e9,#e3f2fd);border:1px solid #c8e6c9;border-radius:8px;' +
      'padding:6px 10px;margin:6px 8px 4px;font-size:13px;line-height:1.4;color:#1b5e20;' +
      'box-shadow:0 -1px 4px rgba(0,0,0,.06);';
    var content = document.createElement('div');
    content.style.cssText = 'flex:1;min-width:0;';
    content.innerHTML =
      '<div style="font-size:11px;color:#666;margin-bottom:2px">翻译预览 <span id="mt-preview-src" style="color:#888"></span></div>' +
      '<div id="mt-preview-text" style="color:#1a237e;font-weight:500;word-break:break-word;"></div>';
    bar.appendChild(content);
    var closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.title = '关闭预览 / Esc 恢复原文';
    closeBtn.style.cssText = 'cursor:pointer;color:#999;font-size:14px;padding:2px 4px;flex-shrink:0;line-height:1;';
    closeBtn.addEventListener('click', function () {
      if (mtSendConfirming && mtOriginalText) {
        var box = findComposeBox();
        if (box) setComposeText(box, mtOriginalText);
        mtSendConfirming = false;
        mtOriginalText = '';
        mtPendingEnglish = '';
      }
      hidePreviewBar();
    });
    bar.appendChild(closeBtn);
    try {
      host.parentElement
        ? host.parentElement.insertBefore(bar, host)
        : host.insertBefore(bar, host.firstChild);
    } catch (e) {
      try { document.body.appendChild(bar); } catch (e2) {}
    }
    __mtPreviewEl = bar;
    return bar;
  }

  function showPreviewBar(sourceText, translatedText) {
    var bar = getOrCreatePreviewBar();
    if (!bar) return;
    var srcEl = bar.querySelector('#mt-preview-src');
    var textEl = bar.querySelector('#mt-preview-text');
    if (srcEl) srcEl.textContent = '（原文: ' + (sourceText.length > 40 ? sourceText.slice(0, 40) + '…' : sourceText) + '）';
    if (textEl) textEl.textContent = translatedText;
    bar.style.display = 'flex';
  }

  var mtSendTranslating = false;
  var mtSendConfirming = false;
  var mtOriginalText = '';
  var mtPendingEnglish = '';

  function normalizeEnglishOutput(text) {
    return String(text || '')
      .replace(/[\u4e00-\u9fff\u3400-\u4dbf]+/g, ' ')
      .replace(/[\u2012-\u2015\u2212\uFE58\uFF0D\u2500\u2501\u2E3A\u2E3B]+/g, ' ')
      .replace(/-{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function stageChineseToEnglish(chineseText) {
    if (mtSendTranslating) {
      showMtToast('翻译中，请稍候...');
      return false;
    }
    mtSendTranslating = true;
    showMtToast('翻译中...', 8000);
    try {
      var result = await translateViaBridge(chineseText, 'en');
      if (!(result && result.success && result.translated)) {
        showMtToast('翻译失败: ' + ((result && result.error) || '未知错误'));
        return false;
      }
      var english = normalizeEnglishOutput(result.translated);
      if (!english) {
        showMtToast('翻译结果异常');
        return false;
      }
      var box = findComposeBox();
      if (!box) {
        showMtToast('未找到输入框');
        return false;
      }
      mtOriginalText = chineseText;
      mtPendingEnglish = english;
      setComposeText(box, english);
      mtSendConfirming = true;
      showPreviewBar(chineseText, english);
      showMtToast('已替换为英文，再按 Enter 发送，Esc 恢复原文');
      return true;
    } finally {
      mtSendTranslating = false;
    }
  }

  function isSendButton(el) {
    if (!el || !el.closest) return false;
    var btn =
      el.closest('button') ||
      el.closest('[role="button"]') ||
      el.closest('[class*="send"]') ||
      el;
    if (!btn) return false;
    var label = (
      (btn.getAttribute && (btn.getAttribute('aria-label') || btn.getAttribute('title'))) ||
      btn.textContent ||
      ''
    ).toLowerCase();
    var cls = String(btn.className || '').toLowerCase();
    if (/send|发送/.test(label)) return true;
    if (/send|compositionarea__button/.test(cls) && !/attach|emoji|sticker|gif|mic|voice/.test(cls + label)) {
      // Heuristic: bottom-right circular send near compose
      try {
        var r = btn.getBoundingClientRect();
        if (r.width && r.width < 64 && r.bottom > window.innerHeight - 120) return true;
      } catch (e) {}
    }
    return false;
  }

  async function handleOutboundTranslate(ev) {
    if (mtSendTranslating) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
      return true;
    }
    var box = findComposeBox();
    var text = getComposeText(box);
    if (!text) return false;

    if (mtSendConfirming) {
      // 第二次 Enter：已是英文则放行发送
      if (!isChineseEnough(text) || (mtPendingEnglish && normCmp(text) === normCmp(mtPendingEnglish))) {
        mtSendConfirming = false;
        mtOriginalText = '';
        mtPendingEnglish = '';
        hidePreviewBar();
        return false;
      }
    }

    if (!isChineseEnough(text)) return false;

    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    }
    await stageChineseToEnglish(text);
    return true;
  }

  function setupSendTranslation() {
    // 强制重绑：V5 曾关掉输入英译
    window.__mtSignalSendBound = true;

    document.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape' && mtSendConfirming) {
          e.preventDefault();
          e.stopPropagation();
          var box = findComposeBox();
          if (box && mtOriginalText) setComposeText(box, mtOriginalText);
          mtSendConfirming = false;
          mtOriginalText = '';
          mtPendingEnglish = '';
          hidePreviewBar();
          showMtToast('已恢复原文');
          return;
        }
        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.isComposing || e.keyCode === 229) return;
        var t = e.target;
        if (!t) return;
        var inCompose =
          (t.isContentEditable || t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') &&
          (!t.closest || !t.closest('.mt-signal-badge, .mt-signal-preview'));
        if (!inCompose) {
          // 焦点可能在 compose 内层节点
          var box = findComposeBox();
          if (!box || !(box === t || (box.contains && box.contains(t)))) return;
        }
        handleOutboundTranslate(e);
      },
      true
    );

    document.addEventListener(
      'click',
      function (e) {
        if (!isSendButton(e.target)) return;
        var box = findComposeBox();
        var text = getComposeText(box);
        if (!text || !isChineseEnough(text)) return;
        if (mtSendConfirming && mtPendingEnglish && normCmp(text) === normCmp(mtPendingEnglish)) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleOutboundTranslate(e);
      },
      true
    );

    // 输入框内容变化：清空（或手动改掉预览英文）时同步收起预览框。
    // 之前只在"第二次 Enter / Esc / 点✕ / 已发送"时收起，用户把输入框删空后
    // 预览框会一直残留且 mtSendConfirming 状态不复位。
    document.addEventListener(
      'input',
      function (e) {
        if (!mtSendConfirming) return;
        var t = e.target;
        if (t && t.closest && t.closest('.mt-signal-preview')) return;
        var box = findComposeBox();
        if (!box) return;
        // 焦点/事件来自输入框之外（Signal 内部其它 input）则忽略
        if (t && t !== box && box.contains && !box.contains(t)) return;
        var text = getComposeText(box);
        // 1) 输入框被清空 → 预览失效
        // 2) 用户手动改动了英文 → 预览不再准确，且不应再用 Esc 覆盖用户输入
        var stale = !text || (mtPendingEnglish && normCmp(text) !== normCmp(mtPendingEnglish));
        if (!stale) return;
        mtSendConfirming = false;
        mtOriginalText = '';
        mtPendingEnglish = '';
        hidePreviewBar();
      },
      true
    );

    dbg('send-translation listeners armed (CN→EN preview)');
  }

  // ── Smart reply (keep orange ↩) ──
  async function generateReplyViaLocal(messages, context) {
    var ports = [17890, 17891];
    var lastErr = '';
    for (var i = 0; i < ports.length; i++) {
      try {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var to = setTimeout(function () { try { if (ctrl) ctrl.abort(); } catch (e) {} }, 25000);
        var resp = await fetch('http://127.0.0.1:' + ports[i] + '/generate-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages || [], context: context || '' }),
          signal: ctrl ? ctrl.signal : undefined
        });
        clearTimeout(to);
        var data = null;
        try { data = await resp.json(); } catch (eJ) {}
        if (data && data.success) {
          return { success: true, reply: data.reply || '', via: 'local:' + ports[i] };
        }
        lastErr = (data && data.error) || ('HTTP ' + resp.status);
      } catch (eF) {
        lastErr = (eF && eF.message) || String(eF);
      }
    }
    return { success: false, error: String(lastErr || 'reply failed'), reply: '' };
  }

  function findReadMoreButton(msgEl) {
    if (!msgEl || !msgEl.querySelector) return null;
    var btn =
      msgEl.querySelector('button.MessageBody__read-more') ||
      msgEl.querySelector('.MessageBody__read-more') ||
      msgEl.querySelector('[class*="MessageBody__read-more"]');
    if (btn) return btn;
    var buttons = msgEl.querySelectorAll('button, a, span[role="button"]');
    for (var i = 0; i < buttons.length; i++) {
      var t = (buttons[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (/^(?:\.\.\.|…)?\s*(阅读全文|Read more)$/i.test(t) || /阅读全文|Read more/i.test(t)) {
        return buttons[i];
      }
    }
    return null;
  }

  function expandSignalMessageFull(msgEl) {
    return new Promise(function (resolve) {
      var tries = 0;
      function tick() {
        var btn = findReadMoreButton(msgEl);
        if (!btn || tries >= 25) {
          resolve(tries > 0);
          return;
        }
        tries++;
        try { btn.click(); } catch (e) {}
        setTimeout(tick, 70);
      }
      tick();
    });
  }

  function cleanExtractedMessageText(raw) {
    return stripTrailingBubbleClock(String(raw || ''))
      .replace(/\s*(?:\.\.\.|…)?\s*(阅读全文|Read more)\s*$/gi, '')
      .replace(/\s*(?:\.\.\.|…)\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getMessageTextEl(msgEl) {
    if (!msgEl || !msgEl.querySelector) return null;
    return (
      msgEl.querySelector('.module-message__text') ||
      msgEl.querySelector('.module-message__text--outgoing') ||
      msgEl.querySelector('.module-message__text--incoming') ||
      msgEl.querySelector('[class*="module-message__text"]') ||
      msgEl.querySelector('.text-content') ||
      null
    );
  }

  function getMessageRawText(msgEl) {
    var textEl = getMessageTextEl(msgEl);
    var raw = '';
    if (textEl) {
      try {
        var clone = textEl.cloneNode(true);
        var drop = clone.querySelectorAll(
          '.mt-signal-badge, .mt-signal-reply-btn, [class*="Quote"], [class*="quote"], time, button, .MessageBody__read-more, [class*="MessageBody__read-more"]'
        );
        for (var i = 0; i < drop.length; i++) {
          try { drop[i].remove(); } catch (e) {}
        }
        raw = (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
      } catch (e) {
        raw = (textEl.textContent || '').replace(/\s+/g, ' ').trim();
      }
    } else {
      try {
        var c2 = msgEl.cloneNode(true);
        var kill = c2.querySelectorAll(
          '.mt-signal-badge, .mt-signal-reply-btn, button, time, [class*="metadata"], [class*="reaction"], [class*="Quote"], [class*="quote"], .MessageBody__read-more'
        );
        for (var k = 0; k < kill.length; k++) {
          try { kill[k].remove(); } catch (eK) {}
        }
        raw = (c2.textContent || '').replace(/\s+/g, ' ').trim();
      } catch (e2) {
        raw = '';
      }
    }
    return cleanExtractedMessageText(raw);
  }

  async function retranslateBadgeFull(msgEl, badge, preferredLang) {
    if (!msgEl) return;
    showMtToast('正在展开并重新翻译...', 8000);
    await expandSignalMessageFull(msgEl);
    await new Promise(function (r) { setTimeout(r, 120); });
    var text = getMessageRawText(msgEl);
    if (!text || text.length < 2) {
      showMtToast('未获取到全文');
      return;
    }
    if (shouldSkipAutoTranslate(text)) {
      showMtToast('中文消息无需翻译');
      return;
    }
    var lang = preferredLang || 'zh-CN';
    try {
      delete __mtTranslateCache[cacheKey(text, lang)];
      // also clear old truncated keys
      if (badge) {
        var oldSrc = badge.getAttribute('data-mt-src') || '';
        if (oldSrc) delete __mtTranslateCache[cacheKey(oldSrc, lang)];
      }
    } catch (eC) {}
    if (badge) {
      try { badge.remove(); } catch (eB) {}
    }
    msgEl.dataset.mtTranslated = '';
    msgEl.dataset.mtQueued = '1';
    var result = await translateForBadge(text, lang);
    msgEl.dataset.mtQueued = '';
    if (!(result && result.success && result.translated)) {
      showMtToast('重新翻译失败: ' + ((result && result.error) || ''));
      return;
    }
    addTranslationBadge(msgEl, result.translated, text, lang, { forceExpand: true });
    showMtToast('已展示全文翻译');
  }

  function isSignalIncoming(el) {
    if (!el) return false;
    var cls = String(el.className || '');
    if (/incoming/i.test(cls)) return true;
    if (/outgoing/i.test(cls)) return false;
    if (el.closest && el.closest('.module-message--incoming, [class*="incoming"]')) return true;
    if (el.closest && el.closest('.module-message--outgoing, [class*="outgoing"]')) return false;
    return true;
  }

  function collectRecentTexts(limit) {
    limit = limit || 8;
    var msgs = collectSignalMessageEls();
    var out = [];
    for (var i = Math.max(0, msgs.length - 20); i < msgs.length; i++) {
      var t = getMessageRawText(msgs[i]);
      if (!t || t.length < 1) continue;
      out.push({ role: isSignalIncoming(msgs[i]) ? 'them' : 'me', text: t });
    }
    return out.slice(-limit);
  }

  function addReplyBtnToMsg(msgEl) {
    if (!msgEl || msgEl.querySelector('.mt-signal-reply-btn')) return;
    if (!isSignalIncoming(msgEl)) return;
    var btn = document.createElement('button');
    btn.className = 'mt-signal-reply-btn';
    btn.type = 'button';
    btn.title = '智能回复';
    btn.textContent = '↩';
    btn.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin:4px 0 0 0;' +
      'border-radius:50%;border:1px solid rgba(255,152,0,.55);background:#fff3e0;color:#e65100;' +
      'font-size:12px;cursor:pointer;line-height:1;padding:0;';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      showMtToast('生成回复中...', 8000);
      var recent = collectRecentTexts(8);
      generateReplyViaLocal(recent, '').then(function (result) {
        if (!(result && result.success && result.reply)) {
          showMtToast('回复生成失败');
          return;
        }
        var box = findComposeBox();
        if (!box) {
          showMtToast('未找到输入框');
          return;
        }
        setComposeText(box, result.reply);
        box.focus();
        showMtToast('已填入回复，确认后按 Enter 翻译发送');
      });
    });
    try {
      var meta = msgEl.querySelector('.module-message__metadata, [class*="metadata"]');
      if (meta && meta.parentElement) meta.parentElement.appendChild(btn);
      else msgEl.appendChild(btn);
    } catch (e) {
      try { msgEl.appendChild(btn); } catch (e2) {}
    }
  }

  function setupSignalReplyButtons() {
    function scan() {
      try {
        var msgs = document.querySelectorAll('.module-message, [class*="module-message--incoming"]');
        for (var i = 0; i < msgs.length; i++) addReplyBtnToMsg(msgs[i]);
      } catch (e) {}
    }
    scan();
    mtRegisterArm(function () {
      scan();
      mtGatedObserver(document.body, scan, { childList: true, subtree: true });
      mtGatedInterval(scan, 3000);
    });
  }

  // ── Auto-translate badges ──
  var __mtTranslateQueue = [];
  var __mtTranslating = false;
  var __mtTranslateCache = Object.create(null);
  window.__mtTranslateCacheN = window.__mtTranslateCacheN || 0;

  function formatEnglishClockToZh(hourStr, minuteStr, ampm) {
    var h = parseInt(hourStr, 10);
    var m = String(minuteStr || '00');
    if (!Number.isFinite(h) || h < 0 || h > 23) return '';
    if (m.length === 1) m = '0' + m;
    var ap = String(ampm || '').replace(/\./g, '').toLowerCase();
    var period = '';
    if (ap === 'pm' || ap === 'p') period = '下午';
    else if (ap === 'am' || ap === 'a') period = '上午';
    else if (h < 6) period = '凌晨';
    else if (h < 12) period = '上午';
    else if (h === 12) period = '中午';
    else period = '下午';
    var displayH = h;
    if (ap === 'pm' || ap === 'p' || ap === 'am' || ap === 'a') displayH = h === 0 ? 12 : h;
    return displayH + ':' + m + (period ? ' ' + period : '');
  }

  function restoreClocksInChineseTranslation(original, translated) {
    var src = String(original || '');
    var out = String(translated || '');
    if (!src || !out) return out;
    var clocks = [];
    var re = /\b(\d{1,2}):(\d{2})(?::\d{2})?\s*(A\.?M\.?|P\.?M\.?|am|pm|a\.m\.|p\.m\.)\b/gi;
    var m;
    while ((m = re.exec(src)) !== null) {
      var zh = formatEnglishClockToZh(m[1], m[2], m[3]);
      if (zh) clocks.push({ raw: m[0], zh: zh });
    }
    if (!clocks.length) return out;
    var missing = clocks.filter(function (c) { return out.indexOf(c.zh) < 0; });
    if (!missing.length) return out;
    if (/…{1,}|……|\.{3,}/.test(out) && missing[0]) {
      out = out.replace(/…{1,}|……|\.{3,}/, missing[0].zh);
      missing = missing.slice(1);
    }
    for (var i = 0; i < clocks.length; i++) {
      var c = clocks[i];
      var engRe = new RegExp('\\b' + c.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+') + '\\b', 'i');
      if (engRe.test(out)) out = out.replace(engRe, c.zh);
    }
    return out;
  }

  function cacheKey(text, lang) {
    return lang + '|' + String(text || '').slice(0, 500);
  }

  async function translateForBadge(text, targetLang) {
    var key = cacheKey(text, targetLang);
    if (__mtTranslateCache[key]) {
      try { window.__mtCacheStats.hits++; } catch (eHit) {}
      return { success: true, translated: __mtTranslateCache[key], via: 'cache' };
    }
    try { window.__mtCacheStats.misses++; } catch (eMiss) {}
    var result = await translateViaBridge(text, targetLang);
    if (result && result.success && result.translated) {
      // If EN→ZH somehow still English, retry once via bridge
      if (/^zh/i.test(String(targetLang || '')) && chineseRatio(result.translated) < 0.08 && chineseRatio(text) < 0.08) {
        try {
          var g = await translateViaBridge(text, targetLang);
          if (g && g.success && g.translated && chineseRatio(g.translated) >= 0.08) result = g;
        } catch (e2) {}
      }
      if (/^zh/i.test(String(targetLang || 'zh-CN'))) {
        result.translated = restoreClocksInChineseTranslation(text, result.translated);
      }
      if (window.__mtTranslateCacheN > 800) {
        __mtTranslateCache = Object.create(null);
        window.__mtTranslateCacheN = 0;
      }
      __mtTranslateCache[key] = result.translated;
      window.__mtTranslateCacheN++;
    }
    return result;
  }

  function addTranslationBadge(msgEl, translatedText, originalText, targetLang, options) {
    if (!msgEl || !translatedText) return;
    options = options || {};
    var existing = msgEl.querySelector('.mt-signal-badge');
    if (existing) {
      if ((existing.getAttribute('data-mt-text') || '') === translatedText && !options.forceExpand) return;
      try { existing.remove(); } catch (eR) {}
    }

    var fullText = String(translatedText || '');
    var LONG_CHARS = 160;
    var isLong = fullText.length > LONG_CHARS || fullText.split(/\n/).length > 5;
    var startCollapsed = isLong && !options.forceExpand;

    var badge = document.createElement('div');
    badge.className = 'mt-signal-badge';
    badge.title = '点击重新翻译并展示全文';
    badge.setAttribute('data-mt-text', fullText);
    badge.setAttribute('data-mt-lang', targetLang || '');
    badge.setAttribute('data-mt-src', String(originalText || '').slice(0, 200));
    badge.style.cssText =
      'display:block;font-size:13px;line-height:1.45;margin:6px 0 2px;padding:6px 8px;' +
      'border-radius:8px;word-break:break-word;overflow-wrap:anywhere;white-space:pre-wrap;' +
      'user-select:text;max-width:100%;max-height:none;overflow:visible;position:relative;z-index:5;cursor:pointer;' +
      'background:rgba(33,150,243,0.12);color:#0d47a1;border:1px solid rgba(33,150,243,0.28);';

    var label = document.createElement('div');
    label.style.cssText = 'font-size:10px;opacity:0.7;margin-bottom:2px;';
    label.textContent = targetLang === 'en' ? 'EN' : '中文';
    badge.appendChild(label);

    var body = document.createElement('div');
    body.className = 'mt-signal-badge-text';
    body.textContent = fullText;
    body.style.cssText = 'white-space:pre-wrap;word-break:break-word;overflow:visible;max-height:none;';
    badge.appendChild(body);

    var actions = document.createElement('div');
    actions.style.cssText = 'margin-top:4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;';

    var copyBtn = document.createElement('span');
    copyBtn.textContent = '复制';
    copyBtn.style.cssText = 'cursor:pointer;color:#1565c0;font-size:11px;';
    copyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        navigator.clipboard.writeText(fullText);
        showMtToast('已复制');
      } catch (ex) {}
    });
    actions.appendChild(copyBtn);

    var refreshBtn = document.createElement('span');
    refreshBtn.textContent = '刷新全文';
    refreshBtn.style.cssText = 'cursor:pointer;color:#1565c0;font-size:11px;font-weight:600;';
    refreshBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      retranslateBadgeFull(msgEl, badge, targetLang || 'zh-CN');
    });
    actions.appendChild(refreshBtn);

    function applyCollapsed(collapsed) {
      if (collapsed) {
        body.style.display = '-webkit-box';
        body.style.webkitBoxOrient = 'vertical';
        body.style.webkitLineClamp = '4';
        body.style.overflow = 'hidden';
        body.style.maxHeight = '5.8em';
        badge.dataset.collapsed = '1';
        if (toggle) toggle.textContent = '展开';
      } else {
        body.style.display = 'block';
        body.style.webkitBoxOrient = '';
        body.style.webkitLineClamp = 'unset';
        body.style.overflow = 'visible';
        body.style.maxHeight = 'none';
        badge.dataset.collapsed = '';
        if (toggle) toggle.textContent = '折叠';
      }
    }

    var toggle = null;
    if (isLong) {
      toggle = document.createElement('span');
      toggle.className = 'mt-signal-badge-expand';
      toggle.style.cssText = 'cursor:pointer;color:#1565c0;font-size:11px;font-weight:600;';
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        // 展开：若当前是折叠预览，先本地展开；再点则重新拉全文翻译
        if (badge.dataset.collapsed === '1') {
          applyCollapsed(false);
        } else {
          retranslateBadgeFull(msgEl, badge, targetLang || 'zh-CN');
        }
      });
      actions.appendChild(toggle);
      applyCollapsed(startCollapsed);
    } else {
      toggle = document.createElement('span');
      toggle.textContent = '折叠';
      toggle.style.cssText = 'cursor:pointer;color:#78909c;font-size:11px;';
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (badge.dataset.collapsed === '1') {
          body.style.display = 'block';
          label.style.display = '';
          badge.dataset.collapsed = '';
          toggle.textContent = '折叠';
        } else {
          body.style.display = 'none';
          label.style.display = 'none';
          badge.dataset.collapsed = '1';
          toggle.textContent = '展开';
        }
      });
      actions.appendChild(toggle);
    }

    badge.appendChild(actions);

    // 点击蓝色徽章主体 → 展开原文「阅读全文」并重新翻译展示全文
    badge.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('span') && e.target !== badge) {
        // 操作按钮已自行 stopPropagation；兜底忽略
        var tag = (e.target.textContent || '').trim();
        if (/复制|刷新|展开|折叠/.test(tag)) return;
      }
      e.preventDefault();
      e.stopPropagation();
      retranslateBadgeFull(msgEl, badge, targetLang || 'zh-CN');
    });

    // Mount OUTSIDE React text node
    var mounted = false;
    try {
      var container =
        msgEl.querySelector('.module-message__container') ||
        msgEl.querySelector('[class*="module-message__container"]');
      if (container && container.parentElement) {
        try {
          container.parentElement.style.overflow = 'visible';
          if (msgEl.style) msgEl.style.overflow = 'visible';
        } catch (eO) {}
        if (container.nextSibling) container.parentElement.insertBefore(badge, container.nextSibling);
        else container.parentElement.appendChild(badge);
        mounted = true;
      }
    } catch (e1) {}
    if (!mounted) {
      try {
        msgEl.appendChild(badge);
        mounted = true;
      } catch (e2) {}
    }

    msgEl.dataset.mtTranslated = '1';
    msgEl.dataset.mtTargetLang = targetLang || '';
    msgEl.__mtBadgeText = fullText;
    msgEl.__mtBadgeSrc = originalText;
    msgEl.__mtBadgeLang = targetLang;
  }

  async function processTranslateQueue() {
    if (__mtTranslating) return;
    __mtTranslating = true;
    try {
      while (__mtTranslateQueue.length > 0) {
        var batch = __mtTranslateQueue.splice(0, 6);
        await Promise.all(batch.map(async function (item) {
          try {
            if (!item || !item.el || !item.el.isConnected) return;
            if (item.el.querySelector('.mt-signal-badge')) {
              item.el.dataset.mtTranslated = '1';
              return;
            }
            var lang = item.targetLang || pickTargetLang(item.text) || 'zh-CN';
            if (findReadMoreButton(item.el)) {
              await expandSignalMessageFull(item.el);
              await new Promise(function (r) { setTimeout(r, 60); });
              var fullSrc = getMessageRawText(item.el);
              if (fullSrc && fullSrc.length > item.text.length) item.text = fullSrc;
            }
            if (shouldSkipAutoTranslate(item.text)) {
              item.el.dataset.mtTranslated = '1';
              item.el.dataset.mtQueued = '';
              return;
            }
            var result = await translateForBadge(item.text, lang);
            if (result && result.success && result.translated) {
              var same = normCmp(result.translated) === normCmp(item.text);
              var weakZh = /^zh/i.test(lang) && chineseRatio(result.translated) < 0.08 && chineseRatio(item.text) < 0.08;
              if (same || weakZh) {
                var fails = Number(item.el.dataset.mtSameSkip || '0') + 1;
                item.el.dataset.mtSameSkip = String(fails);
                item.el.dataset.mtQueued = '';
                window.__mtSignalDebug.fail++;
                window.__mtSignalDebug.lastError = 'same-or-weak:' + (result.via || '');
                dbg('skip weak translation', item.text.slice(0, 40), '=>', result.translated.slice(0, 40));
                if (fails < 3) {
                  setTimeout(function () {
                    if (!item.el.isConnected || item.el.querySelector('.mt-signal-badge')) return;
                    item.el.dataset.mtQueued = '1';
                    __mtTranslateQueue.push(item);
                    processTranslateQueue();
                  }, 1800 * fails);
                } else {
                  item.el.dataset.mtTranslated = '1';
                }
                return;
              }
              addTranslationBadge(item.el, result.translated, item.text, lang);
              item.el.dataset.mtQueued = '';
              window.__mtSignalDebug.ok++;
              dbg('badge ok via', result.via, item.text.slice(0, 36));
            } else {
              item.el.dataset.mtTranslateFail = String((result && result.error) || 'fail').slice(0, 80);
              item.el.dataset.mtQueued = '';
              window.__mtSignalDebug.fail++;
              window.__mtSignalDebug.lastError = item.el.dataset.mtTranslateFail;
              dbg('badge fail', item.el.dataset.mtTranslateFail);
            }
          } catch (e) {
            try { item.el.dataset.mtQueued = ''; } catch (e2) {}
            window.__mtSignalDebug.lastError = String(e && e.message || e);
          }
        }));
      }
    } finally {
      __mtTranslating = false;
      if (__mtTranslateQueue.length) processTranslateQueue();
    }
  }

  function collectSignalMessageEls() {
    var sels = [
      '.module-message',
      '.module-message--incoming',
      '.module-message--outgoing',
      '[class*="module-message--incoming"]',
      '[class*="module-message--outgoing"]'
    ];
    var out = [];
    var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
    var seenArr = [];
    for (var s = 0; s < sels.length; s++) {
      var nodes = document.querySelectorAll(sels[s]);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var root =
          (el.closest && (el.closest('.module-message') || el.closest('[class*="module-message--"]'))) || el;
        if (seen) {
          if (seen.has(root)) continue;
          seen.add(root);
        } else {
          if (seenArr.indexOf(root) >= 0) continue;
          seenArr.push(root);
        }
        out.push(root);
      }
    }
    return out;
  }

  function scanSignalMessagesForTranslation() {
    try {
      window.__mtSignalDebug.scans++;
      var msgs = collectSignalMessageEls();
      for (var i = 0; i < msgs.length; i++) {
        var el = msgs[i];
        if (!el) continue;

        // Reattach wiped badge from memory
        if (el.dataset.mtTranslated === '1' && !el.querySelector('.mt-signal-badge') && el.__mtBadgeText) {
          addTranslationBadge(el, el.__mtBadgeText, el.__mtBadgeSrc || '', el.__mtBadgeLang || 'zh-CN');
          continue;
        }
        if (el.querySelector('.mt-signal-badge')) {
          el.dataset.mtTranslated = '1';
          continue;
        }
        if (el.dataset.mtTranslated === '1' && !el.querySelector('.mt-signal-badge')) {
          el.dataset.mtTranslated = '';
        }
        if (el.dataset.mtTranslated === '1') continue;
        if (el.dataset.mtQueued === '1') continue;

        var text = getMessageRawText(el);
        if (!text || text.length < 2) continue;
        if (/^(今天|昨天|Today|Yesterday|\d{1,2}:\d{2})$/i.test(text)) continue;

        // 中文保持原状，不挂徽章、不送翻
        if (shouldSkipAutoTranslate(text)) {
          el.dataset.mtTranslated = '1';
          el.dataset.mtSkipZh = '1';
          continue;
        }

        var lang = pickTargetLang(text) || 'zh-CN';
        el.dataset.mtQueued = '1';
        window.__mtSignalDebug.queued++;
        __mtTranslateQueue.push({ el: el, text: text, targetLang: lang });
      }
      processTranslateQueue();
    } catch (e) {
      window.__mtSignalDebug.lastError = String(e && e.message || e);
    }
  }

  function setupAutoTranslation() {
    scanSignalMessagesForTranslation();
    var debounce;
    mtRegisterArm(function () {
      // 切回账号时立刻把后台期间攒下的新消息补翻一遍，不用等 2.5s 周期
      scanSignalMessagesForTranslation();
      mtGatedObserver(
        document.body,
        function () {
          clearTimeout(debounce);
          debounce = setTimeout(scanSignalMessagesForTranslation, 400);
        },
        { childList: true, subtree: true },
        0 // 回调自带 400ms debounce，这里只需合并同一轮的多次变动
      );
      mtGatedInterval(scanSignalMessagesForTranslation, 2500);
    });
    dbg('auto-translate armed');
  }

  // Unread counter for host
  function setupUnread() {
    window.__mtUnreadCount = 0;
    var zeroStreak = 0;
    var lastStable = 0;
    function computeUnread() {
      try {
        var total = 0;
        var badges = document.querySelectorAll(
          '.module-conversation-list__item--contact-or-conversation__unread-indicator,' +
            '.module-conversation-list-item__unread-count'
        );
        for (var i = 0; i < badges.length; i++) {
          var b = badges[i];
          try {
            var bst = window.getComputedStyle(b);
            if (bst && (bst.display === 'none' || bst.visibility === 'hidden')) continue;
          } catch (eSt) {}
          var row = b.closest(
            '.module-conversation-list__item--contact-or-conversation, .module-conversation-list-item'
          );
          if (row) {
            var cls = row.className || '';
            if (/--selected|--is-selected|is-selected|--active/.test(cls)) continue;
            if (row.getAttribute('aria-selected') === 'true') continue;
          }
          var t = (b.textContent || '').replace(/[^0-9]/g, '');
          if (t) total += Number(t);
        }
        if (total === 0) {
          var rows = document.querySelectorAll(
            '.module-conversation-list__item--contact-or-conversation, .module-conversation-list-item, [role="button"][aria-label]'
          );
          for (var r = 0; r < rows.length; r++) {
            var row2 = rows[r];
            var cls2 = row2.className || '';
            if (/--selected|--is-selected|is-selected|--active/.test(cls2)) continue;
            if (row2.getAttribute('aria-selected') === 'true') continue;
            var al = row2.getAttribute('aria-label') || '';
            var mm = al.match(/(\d+)\s*(?:unread|未读|条未读|new message)/i);
            if (mm) total += Number(mm[1]);
          }
        }
        if (total === 0) {
          zeroStreak++;
          if (zeroStreak >= 2) lastStable = 0;
        } else {
          zeroStreak = 0;
          lastStable = total;
        }
        window.__mtUnreadCount = lastStable;
      } catch (e) {}
    }
    computeUnread();
    // 未读计数是账号卡片红点的数据源：窗口隐藏时也**必须**继续采（多开时用户正是靠
    // 它判断哪个号来了消息），所以这个定时器不进可见性门控，只把隐藏时的采样频率
    // 放宽到 16s 一次（Chromium 对隐藏页本就会节流，这里显式降频更可控）。
    var tick = 0;
    setInterval(function () {
      tick++;
      if (document.hidden && tick % 4 !== 0) return;
      computeUnread();
    }, 4000);
  }

  function start() {
    if (!document.body) {
      setTimeout(start, 300);
      return;
    }
    killLoginModal();
    mtRegisterArm(function () {
      killLoginModal();
      mtGatedObserver(document.body, killLoginModal, { childList: true, subtree: true });
      mtGatedInterval(killLoginModal, 2000);
    });
    setupUnread();
    setupSendTranslation();
    setupSignalReplyButtons();
    setupAutoTranslation();
    // 所有武装动作登记完毕后按当前可见性启动：窗口还没显示（宿主尚未 embed）时
    // 就先不武装，等 ShowWindow(SW_SHOW) 触发的 visibilitychange 再上。
    mtApplyVisibility();
    dbg('cleanup v8 started (click badge → full retranslate)');
  }

  start();
})();
