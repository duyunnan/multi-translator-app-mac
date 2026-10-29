(function () {
  const backBtn = document.getElementById('btn-back');
  const homeBtn = document.getElementById('btn-home');
  const content = document.getElementById('content');
  const overlay = document.getElementById('overlay');

  function setBackEnabled(on) {
    backBtn.disabled = !on;
  }

  function showOverlay(on, text) {
    overlay.classList.toggle('show', !!on);
    if (text) overlay.lastChild.textContent = text;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function retryLoad() {
    content.innerHTML = '';
    showOverlay(true, '正在加载新闻…');
    if (window.newsApi) {
      if (window.newsApi.goHome) window.newsApi.goHome();
      else if (window.newsApi.reload) window.newsApi.reload();
    }
  }

  function showError(msg) {
    showOverlay(false);
    content.innerHTML =
      '<div class="error-box">' + escapeHtml(msg || '新闻加载失败') +
      '<div><button type="button" class="retry" id="btn-retry">重试</button></div></div>';
    const btn = document.getElementById('btn-retry');
    if (btn) btn.addEventListener('click', retryLoad);
  }

  backBtn.addEventListener('click', () => {
    if (window.newsApi) window.newsApi.goBack();
  });
  homeBtn.addEventListener('click', retryLoad);

  if (window.newsApi && typeof window.newsApi.onNavState === 'function') {
    window.newsApi.onNavState((state) => {
      setBackEnabled(!!(state && state.canGoBack));
    });
  }
  if (window.newsApi && typeof window.newsApi.onPageState === 'function') {
    window.newsApi.onPageState((state) => {
      if (state && state.loading) {
        content.innerHTML = '';
        showOverlay(true, '正在加载新闻…');
      } else if (state && state.failed) {
        showError(state.error || '新闻加载失败');
      } else if (state && state.loading === false) {
        showOverlay(false);
        content.innerHTML = '';
      }
    });
  }

  showOverlay(true, '正在加载新闻…');
})();
