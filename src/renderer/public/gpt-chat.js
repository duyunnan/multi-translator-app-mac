(function () {
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('btn-send');
  const clearBtn = document.getElementById('btn-clear');
  const modelLabel = document.getElementById('model-label');
  const attachRow = document.getElementById('attach-row');
  const attachThumb = document.getElementById('attach-thumb');
  const attachClear = document.getElementById('attach-clear');
  const ctxHint = document.getElementById('ctx-hint');

  // 只带最近几轮，显著降低 token；旧图不再重发
  const MAX_HISTORY_TURNS = 8;
  const MAX_PAYLOAD_MSGS = 12;

  let pendingImage = null;
  let busy = false;
  const history = [];

  const brandTitle = document.getElementById('brand-title');
  let chatProvider = 'openai';
  let supportsImage = true;

  function applyProviderUi(provider, model, viaProxy, hasKey) {
    chatProvider = provider === 'deepseek' ? 'deepseek' : 'openai';
    supportsImage = chatProvider !== 'deepseek';
    const isDs = chatProvider === 'deepseek';
    if (brandTitle) brandTitle.textContent = isDs ? 'Deepseek' : 'OpenAI';
    try { document.title = isDs ? 'Deepseek 对话' : 'OpenAI 对话'; } catch (eT) {}
    modelLabel.textContent = (model || (isDs ? 'deepseek-chat' : 'gpt-4o-mini')) + (viaProxy ? ' · VPN' : ' · 直连');
    if (inputEl) {
      inputEl.placeholder = supportsImage ? '输入问题；可粘贴/拖入图片' : '输入问题（Deepseek 不支持识图）';
    }
    return isDs;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 轻量 Markdown：段落 / 粗体 / 列表 / 行内代码（防 XSS） */
  function renderMarkdown(text) {
    const raw = String(text || '');
    const blocks = raw.split(/\n{2,}/);
    return blocks.map((block) => {
      let b = escapeHtml(block.trim());
      if (!b) return '';
      const lines = b.split('\n');
      const isOl = lines.every((l) => /^\d+\.\s+/.test(l));
      const isUl = lines.every((l) => /^[-*]\s+/.test(l));
      const inline = (s) => s
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      if (isOl) {
        return '<ol>' + lines.map((l) =>
          '<li>' + inline(l.replace(/^\d+\.\s+/, '')) + '</li>'
        ).join('') + '</ol>';
      }
      if (isUl) {
        return '<ul>' + lines.map((l) =>
          '<li>' + inline(l.replace(/^[-*]\s+/, '')) + '</li>'
        ).join('') + '</ul>';
      }
      return '<p class="md-p">' + inline(lines.join('<br>')) + '</p>';
    }).join('');
  }

  function updateCtxHint() {
    const n = history.length;
    ctxHint.textContent = n
      ? ('上下文 ' + n + ' 条 · 请求仅带最近 ' + MAX_PAYLOAD_MSGS + ' 条，旧图片不重发')
      : '新对话 · 仅最近几轮计入请求，点「新对话」可清空上下文省额度';
  }

  function addBubble(role, text, imageDataUrl) {
    const div = document.createElement('div');
    div.className = 'msg ' + role;
    if (imageDataUrl) {
      const img = document.createElement('img');
      img.className = 'msg-img';
      img.src = imageDataUrl;
      div.appendChild(img);
    }
    if (text) {
      const span = document.createElement('div');
      if (role === 'assistant') span.innerHTML = renderMarkdown(text);
      else span.textContent = text;
      div.appendChild(span);
    }
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function setPendingImage(dataUrl) {
    if (!dataUrl || !/^data:image\//i.test(dataUrl)) return;
    pendingImage = dataUrl;
    attachThumb.src = dataUrl;
    attachRow.classList.add('show');
  }

  function clearPendingImage() {
    pendingImage = null;
    attachThumb.removeAttribute('src');
    attachRow.classList.remove('show');
  }

  function clearConversation() {
    if (busy) return;
    history.length = 0;
    messagesEl.innerHTML = '';
    clearPendingImage();
    addBubble('system', '已开始新对话。上下文已清空，不会再带上旧消息。');
    updateCtxHint();
    try { window.gptApi.clearHistory(); } catch (e) {}
    inputEl.focus();
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function compressImageDataUrl(dataUrl, maxSide, quality) {
    maxSide = maxSide || 1024;
    quality = quality || 0.78;
    return new Promise((resolve) => {
      if (!dataUrl || dataUrl.length < 8000) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = function () {
        try {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (!w || !h) {
            resolve(dataUrl);
            return;
          }
          const scale = Math.min(1, maxSide / Math.max(w, h));
          w = Math.max(1, Math.round(w * scale));
          h = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out && out.length < dataUrl.length ? out : dataUrl);
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  /** 构造请求：截断轮次 + 仅保留最后一张图 */
  function buildPayloadMessages() {
    let slice = history.slice(-MAX_PAYLOAD_MSGS);
    // 尽量成对保留，避免截断后第一条是 assistant
    while (slice.length && slice[0].role === 'assistant') slice = slice.slice(1);
    if (slice.length > MAX_HISTORY_TURNS * 2) {
      slice = slice.slice(-(MAX_HISTORY_TURNS * 2));
      while (slice.length && slice[0].role === 'assistant') slice = slice.slice(1);
    }

    let lastImageIdx = -1;
    for (let i = slice.length - 1; i >= 0; i--) {
      if (slice[i].image) {
        lastImageIdx = i;
        break;
      }
    }

    return slice.map((m, i) => ({
      role: m.role,
      text: m.text || '',
      // 旧图不重发：视觉 token 很贵
      image: (i === lastImageIdx && m.image) ? m.image : null
    }));
  }

  async function refreshConfig() {
    try {
      const cfg = await window.gptApi.getConfig();
      if (!cfg || !cfg.ok) {
        modelLabel.textContent = (cfg && cfg.error) || '未配置 Key';
        return;
      }
      const isDs = applyProviderUi(cfg.provider, cfg.model, cfg.viaProxy, cfg.hasKey);
      if (!cfg.hasKey) {
        addBubble('system', isDs ? '请先在设置中填写 Deepseek API Key' : '请先在设置中填写 OpenAI API Key');
      }
    } catch (e) {
      modelLabel.textContent = '配置读取失败';
    }
  }

  async function send() {
    if (busy) return;
    const text = String(inputEl.value || '').trim();
    let image = pendingImage;
    if (!supportsImage && image) {
      addBubble('error', 'Deepseek 暂不支持识图，请只发送文字');
      clearPendingImage();
      image = null;
      if (!text) return;
    }
    if (!text && !image) return;

    busy = true;
    sendBtn.disabled = true;
    inputEl.value = '';
    clearPendingImage();

    if (image) {
      try { image = await compressImageDataUrl(image); } catch (e) {}
    }

    addBubble('user', text || '（仅图片）', image);
    history.push({
      role: 'user',
      text: text,
      image: image || null
    });
    updateCtxHint();

    const thinking = addBubble('thinking', '思考中…');

    try {
      const payloadMsgs = buildPayloadMessages();
      const res = await window.gptApi.sendChat({ messages: payloadMsgs });
      thinking.remove();
      if (!res || !res.success) {
        addBubble('error', (res && res.error) || '请求失败');
      } else {
        const reply = String(res.reply || '').trim() || '（空回复）';
        addBubble('assistant', reply);
        history.push({ role: 'assistant', text: reply, image: null });
        updateCtxHint();
        if (res.model) {
          modelLabel.textContent = res.model + (res.viaProxy ? ' · VPN' : ' · 直连');
        }
      }
    } catch (e) {
      thinking.remove();
      addBubble('error', (e && e.message) || String(e));
    } finally {
      busy = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', send);
  clearBtn.addEventListener('click', clearConversation);
  attachClear.addEventListener('click', clearPendingImage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  inputEl.addEventListener('paste', async (e) => {
    if (!supportsImage) return;
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type && item.type.indexOf('image/') === 0) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        try {
          const dataUrl = await fileToDataUrl(file);
          setPendingImage(await compressImageDataUrl(dataUrl));
        } catch (err) {}
        break;
      }
    }
  });

  document.addEventListener('dragover', (e) => { e.preventDefault(); });
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!supportsImage) return;
    const files = e.dataTransfer && e.dataTransfer.files;
    if (!files || !files.length) return;
    const file = files[0];
    if (!file || !/^image\//i.test(file.type)) return;
    try {
      setPendingImage(await compressImageDataUrl(await fileToDataUrl(file)));
    } catch (err) {}
  });

  addBubble('system', '输入问题开始对话。点右上角「新对话」可清空上下文，避免浪费额度。');
  updateCtxHint();
  refreshConfig();
  inputEl.focus();
})();
