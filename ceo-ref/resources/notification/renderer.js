const titleEl = document.getElementById('title');
const messageEl = document.getElementById('message');
const closeBtn = document.getElementById('closeBtn');
const timerBar = document.getElementById('timerBar');
const timerFill = document.getElementById('timerFill');

let closeTimer = null;
let timerAnimation = null;

function clearCloseTimer() {
  if (!closeTimer) return;
  clearTimeout(closeTimer);
  closeTimer = null;
}

function resetTimerAnimation(duration) {
  if (!timerFill || !timerBar) return;

  if (timerAnimation) {
    timerAnimation.cancel();
    timerAnimation = null;
  }

  timerBar.style.display = 'block';
  timerFill.style.transformOrigin = 'left center';
  timerFill.style.transform = 'scaleX(1)';
  timerAnimation = timerFill.animate(
    [
      { transform: 'scaleX(1)' },
      { transform: 'scaleX(0)' }
    ],
    {
      duration,
      easing: 'linear',
      fill: 'forwards'
    }
  );
}

function closeNotification() {
  clearCloseTimer();
  if (window.notification && typeof window.notification.close === 'function') {
    window.notification.close();
  }
}

if (closeBtn) {
  closeBtn.addEventListener('click', closeNotification);
}

if (window.notification && typeof window.notification.onUpdate === 'function') {
  window.notification.onUpdate((payload) => {
    const title = (payload && payload.title ? String(payload.title) : '通知').trim() || '通知';
    const message = (payload && payload.message ? String(payload.message) : '').trim();
    const durationNumber = Number(payload?.duration);
    const duration = Number.isFinite(durationNumber) ? Math.max(0, Math.floor(durationNumber)) : 3000;

    titleEl.textContent = title;
    messageEl.textContent = message;
    clearCloseTimer();
    if (duration === 0) {
      if (timerAnimation) {
        timerAnimation.cancel();
        timerAnimation = null;
      }
      if (timerBar) timerBar.style.display = 'none';
      return;
    }

    resetTimerAnimation(duration);

    closeTimer = setTimeout(() => {
      closeNotification();
    }, duration);
  });
}
