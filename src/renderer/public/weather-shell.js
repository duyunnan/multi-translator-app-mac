(function () {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const citiesEl = document.getElementById('cities');
  const resultEl = document.getElementById('result');
  const searchBtn = document.getElementById('btn-search');
  let activeKey = '';
  let busy = false;
  let lastCity = null;
  let pinnedCity = null;
  let presetList = [];

  function cityFromWeather(data) {
    if (!data) return null;
    return {
      query: data.query || data.cityEn || data.cityZh || '',
      zh: data.cityZh || data.zh || '',
      en: data.cityEn || data.en || '',
      key: data.key || '',
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone || 'auto',
      admin1: data.admin1 || '',
      country: data.country || ''
    };
  }

  function sameCity(a, b) {
    if (!a || !b) return false;
    if (a.key && b.key && a.key === b.key) return true;
    const latA = Number(a.lat);
    const lonA = Number(a.lon);
    const latB = Number(b.lat);
    const lonB = Number(b.lon);
    if (Number.isFinite(latA) && Number.isFinite(lonA) && Number.isFinite(latB) && Number.isFinite(lonB)) {
      return Math.abs(latA - latB) < 0.08 && Math.abs(lonA - lonB) < 0.08;
    }
    const n1 = String(a.zh || a.cityZh || a.query || '').trim().toLowerCase();
    const n2 = String(b.zh || b.cityZh || b.query || '').trim().toLowerCase();
    return !!(n1 && n1 === n2);
  }

  function isCurrentPinned() {
    return sameCity(lastCity, pinnedCity);
  }

  function setActive(key) {
    activeKey = key || '';
    citiesEl.querySelectorAll('.city-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-key') === activeKey);
    });
  }

  function setBusy(on) {
    busy = !!on;
    searchBtn.disabled = busy;
  }

  function showStatus(text, isError) {
    document.body.className = '';
    resultEl.innerHTML = '<div class="status' + (isError ? ' error' : '') + '"></div>';
    resultEl.firstChild.textContent = text;
  }

  function weatherIconSvg(code, sizeClass) {
    const c = Number(code);
    let kind = 'cloud';
    if (c === 0 || c === 1) kind = 'sun';
    else if (c === 2) kind = 'suncloud';
    else if (c === 3 || c === 45 || c === 48) kind = 'cloud';
    else if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) kind = 'rain';
    else if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) kind = 'snow';
    else if (c >= 95) kind = 'storm';

    const svgs = {
      sun:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<circle cx="32" cy="32" r="12" fill="currentColor" opacity="0.95"/>' +
          '<g stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.75">' +
            '<path d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4.2 4.2M45.8 45.8L50 50M50 14l-4.2 4.2M18.2 45.8L14 50"/>' +
          '</g></svg>',
      suncloud:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<circle cx="40" cy="22" r="9" fill="currentColor" opacity="0.9"/>' +
          '<path d="M18 44c0-6.6 5.2-12 11.6-12 4.2 0 7.9 2.2 10 5.5 1.1-.4 2.3-.6 3.5-.6 5.2 0 9.4 4 9.4 9.1H18z" fill="currentColor" opacity="0.78"/>' +
        '</svg>',
      cloud:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<path d="M16 42c0-7.2 5.7-13 12.7-13 4.6 0 8.6 2.4 10.9 6 1.2-.5 2.6-.7 4-.7 5.7 0 10.4 4.4 10.4 10H16z" fill="currentColor" opacity="0.82"/>' +
        '</svg>',
      rain:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<path d="M16 34c0-7.2 5.7-13 12.7-13 4.6 0 8.6 2.4 10.9 6 1.2-.5 2.6-.7 4-.7 5.7 0 10.4 4.4 10.4 10H16z" fill="currentColor" opacity="0.8"/>' +
          '<g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.7">' +
            '<path d="M24 44v8M32 46v8M40 44v8"/>' +
          '</g></svg>',
      snow:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<path d="M16 34c0-7.2 5.7-13 12.7-13 4.6 0 8.6 2.4 10.9 6 1.2-.5 2.6-.7 4-.7 5.7 0 10.4 4.4 10.4 10H16z" fill="currentColor" opacity="0.8"/>' +
          '<g fill="currentColor" opacity="0.7">' +
            '<circle cx="24" cy="48" r="2"/><circle cx="32" cy="50" r="2"/><circle cx="40" cy="47" r="2"/>' +
          '</g></svg>',
      storm:
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
          '<path d="M16 30c0-7.2 5.7-13 12.7-13 4.6 0 8.6 2.4 10.9 6 1.2-.5 2.6-.7 4-.7 5.7 0 10.4 4.4 10.4 10H16z" fill="currentColor" opacity="0.82"/>' +
          '<path d="M30 40l-6 10h7l-3 10 12-14h-7l4-6z" fill="currentColor" opacity="0.9"/>' +
        '</svg>'
    };
    return '<div class="' + sizeClass + '">' + (svgs[kind] || svgs.cloud) + '</div>';
  }

  function applyTheme(cur) {
    const code = Number(cur && cur.code);
    const tempF = Number(cur && (cur.feelsLikeF != null ? cur.feelsLikeF : cur.tempF));
    let theme = 'theme-cloud';
    if (code === 0 || code === 1) theme = 'theme-clear';
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) theme = 'theme-rain';
    else if (code === 2 || code === 3 || code === 45 || code === 48) theme = 'theme-cloud';
    if (Number.isFinite(tempF) && tempF >= 90 && theme === 'theme-clear') theme = 'theme-hot';
    document.body.className = theme;
  }

  function buildOutdoorAdvice(cur) {
    const tempF = Number(cur.feelsLikeF != null ? cur.feelsLikeF : cur.tempF);
    const humidity = Number(cur.humidity);
    const cond = String(cur.condition || '');
    const windText = String(cur.windText || '');
    const wind = parseInt(windText, 10);
    const rainy = /雨|雪|雷|雹|冻/.test(cond);
    const foggy = /雾/.test(cond);
    const cloudy = /阴|多云/.test(cond);
    const clear = /晴/.test(cond);

    let level = '一般';
    let summary = '';
    const activities = [];

    if (rainy) {
      level = '不适宜';
      summary = '有降水，户外活动受限，建议改期或选择室内。';
      activities.push('室内商场 / 博物馆', '咖啡馆休息', '居家观影');
    } else if (!Number.isFinite(tempF)) {
      level = '一般';
      summary = '暂无法判断气温，请结合体感自行安排。';
      activities.push('短途散步', '室内备选方案');
    } else if (tempF >= 95 || (tempF >= 90 && humidity >= 70)) {
      level = '慎出';
      summary = '高温闷热，注意防暑补水，避免长时间暴晒。';
      activities.push('清晨/傍晚短步行', '水上活动（注意防晒）', '室内空调场所');
    } else if (tempF >= 80 && tempF < 95) {
      level = clear ? '很适合' : '适合';
      summary = clear
        ? '温暖晴好，非常适合户外，注意防晒补水。'
        : '气温偏暖，适合轻量户外，注意防晒。';
      activities.push('公园散步 / 野餐', '骑行', '篮球 / 网球', '户外摄影');
    } else if (tempF >= 60 && tempF < 80) {
      level = clear || cloudy ? '很适合' : '适合';
      summary = '气温舒适，是户外活动的理想天气。';
      activities.push('跑步 / 慢跑', '徒步郊游', '骑行', '露营准备 / 公园休闲', '户外球类');
    } else if (tempF >= 45 && tempF < 60) {
      level = '适合';
      summary = '微凉舒适，适合中等强度户外，建议加一件外套。';
      activities.push('快走 / 慢跑', '城市观光步行', '轻度骑行', '户外咖啡');
    } else if (tempF >= 32 && tempF < 45) {
      level = '一般';
      summary = '偏冷，短时间户外尚可，注意保暖。';
      activities.push('短途散步', '冬日市集逛逛', '室内+户外结合');
    } else {
      level = '不适宜';
      summary = '寒冷，长时间户外不舒适，注意防寒。';
      activities.push('室内运动', '温泉 / 室内场馆', '短时必要外出');
    }

    if (!rainy && Number.isFinite(wind) && wind >= 35) {
      level = level === '很适合' ? '一般' : level;
      summary += ' 风力偏大，慎选高空/水上活动。';
      if (activities.indexOf('避风处短步行') < 0) activities.push('避风处短步行');
    }
    if (!rainy && foggy) {
      summary += ' 有雾，驾车与户外注意能见度。';
    }
    if (!rainy && humidity >= 85 && tempF >= 70) {
      summary += ' 湿度较高，体感可能更闷。';
    }

    return {
      level: level,
      summary: summary.trim(),
      activities: activities.slice(0, 5)
    };
  }

  function formatDayTemp(d) {
    if (d.minF != null || d.maxF != null) {
      return '<span class="lo">' + escapeHtml(String(d.minF != null ? d.minF : '--')) + '°</span>' +
        ' / ' + escapeHtml(String(d.maxF != null ? d.maxF : '--')) + '°F';
    }
    return escapeHtml(d.tempText || '');
  }

  function renderWeather(data) {
    const cur = data.current || {};
    const daily = Array.isArray(data.daily) ? data.daily : [];
    const advice = buildOutdoorAdvice(cur);
    applyTheme(cur);

    const daysHtml = daily.map((d) => (
      '<div class="day-row">' +
        '<span class="day-name">' + escapeHtml(d.label || '') + '</span>' +
        weatherIconSvg(d.code, 'day-icon') +
        '<span class="day-cond">' + escapeHtml(d.condition || '') + '</span>' +
        '<span class="day-temp">' + formatDayTemp(d) + '</span>' +
      '</div>'
    )).join('');
    const actHtml = (advice.activities || []).map((a) =>
      '<span class="advice-chip">' + escapeHtml(a) + '</span>'
    ).join('');

    const metaParts = [];
    if (data.cityEn) metaParts.push(data.cityEn);
    if (data.admin1) metaParts.push(data.admin1);
    if (data.updatedAt) metaParts.push('更新 ' + data.updatedAt);

    lastCity = cityFromWeather(data);
    const pinned = isCurrentPinned();

    resultEl.innerHTML =
      '<div class="card">' +
        '<div class="hero">' +
          '<div class="loc">' +
            '<div class="loc-head">' +
              '<div class="city-name">' + escapeHtml(data.cityZh || data.city || '') + '</div>' +
              '<button type="button" class="pin-btn' + (pinned ? ' pinned' : '') + '" id="btn-pin" title="' +
                (pinned ? '取消置顶' : '置顶后，下次打开天气显示此城市') + '">' +
                (pinned ? '已置顶' : '置顶') +
              '</button>' +
            '</div>' +
            '<div class="city-meta">' + escapeHtml(metaParts.join(' · ')) + '</div>' +
          '</div>' +
          '<div class="now">' +
            '<div class="temp-block">' +
              '<div class="temp-row">' +
                '<div class="temp">' + escapeHtml(String(cur.tempF != null ? cur.tempF : '--')) + '</div>' +
                '<div class="temp-unit">°F</div>' +
              '</div>' +
              '<div class="cond">' + escapeHtml(cur.condition || '—') +
                (cur.tempC != null ? ' · ' + cur.tempC + '°C' : '') +
              '</div>' +
            '</div>' +
            weatherIconSvg(cur.code, 'weather-glyph') +
          '</div>' +
        '</div>' +
        '<div class="grid">' +
          '<div class="stat"><div class="stat-label">体感</div><div class="stat-value">' +
            escapeHtml(cur.feelsLikeF != null ? cur.feelsLikeF + '°F' : (cur.feelsLike != null ? cur.feelsLike + '°C' : '—')) +
          '</div></div>' +
          '<div class="stat"><div class="stat-label">湿度</div><div class="stat-value">' +
            escapeHtml(cur.humidity != null ? cur.humidity + '%' : '—') + '</div></div>' +
          '<div class="stat"><div class="stat-label">风速</div><div class="stat-value">' +
            escapeHtml(cur.windText || '—') + '</div></div>' +
          '<div class="stat"><div class="stat-label">摄氏</div><div class="stat-value">' +
            escapeHtml(cur.tempC != null ? cur.tempC + '°C' : '—') + '</div></div>' +
        '</div>' +
        '<div class="advice">' +
          '<div class="advice-title">户外活动建议' +
            '<span class="advice-level" data-level="' + escapeHtml(advice.level) + '">' + escapeHtml(advice.level) + '</span>' +
          '</div>' +
          '<div class="advice-summary">' + escapeHtml(advice.summary) + '</div>' +
          '<div class="advice-chips">' + actHtml + '</div>' +
        '</div>' +
        (daysHtml
          ? '<div class="daily"><div class="daily-title">未来几天</div>' + daysHtml + '</div>'
          : '') +
      '</div>';

    const pinBtn = document.getElementById('btn-pin');
    if (pinBtn) {
      pinBtn.addEventListener('click', async () => {
        if (!window.weatherApi || !window.weatherApi.pinCity || !lastCity) return;
        pinBtn.disabled = true;
        try {
          const unpin = isCurrentPinned();
          const res = await window.weatherApi.pinCity(unpin ? { unpin: true } : lastCity);
          if (res && res.ok) {
            pinnedCity = res.city || null;
            renderCities(presetList);
            if (pinnedCity && pinnedCity.key) setActive(pinnedCity.key);
            else if (pinnedCity) setActive('pinned');
            renderWeather(data);
          }
        } catch (e) {
        } finally {
          pinBtn.disabled = false;
        }
      });
    }
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadCity(payload) {
    if (!window.weatherApi || busy) return;
    setBusy(true);
    showStatus('正在获取天气…');
    try {
      const res = await window.weatherApi.loadCity(payload);
      if (!res || !res.ok) {
        showStatus((res && res.error) || '获取天气失败', true);
      } else {
        renderWeather(res);
      }
    } catch (e) {
      showStatus((e && e.message) || '获取天气失败', true);
    } finally {
      setBusy(false);
    }
  }

  function renderCities(list) {
    citiesEl.innerHTML = '';
    if (pinnedCity && !pinnedCity.key) {
      const pinChip = document.createElement('button');
      pinChip.type = 'button';
      pinChip.className = 'city-chip pinned-chip';
      pinChip.setAttribute('data-key', 'pinned');
      pinChip.textContent = pinnedCity.zh || pinnedCity.en || '置顶城市';
      pinChip.title = '置顶城市';
      pinChip.addEventListener('click', () => {
        setActive('pinned');
        input.value = pinnedCity.zh || pinnedCity.en || pinnedCity.query || '';
        loadCity({
          query: pinnedCity.query || pinnedCity.en || pinnedCity.zh,
          zh: pinnedCity.zh,
          en: pinnedCity.en,
          lat: pinnedCity.lat,
          lon: pinnedCity.lon,
          timezone: pinnedCity.timezone,
          admin1: pinnedCity.admin1,
          country: pinnedCity.country
        });
      });
      citiesEl.appendChild(pinChip);
    }
    (list || []).forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'city-chip';
      btn.setAttribute('data-key', c.key);
      btn.textContent = c.zh;
      btn.title = c.en + ' / ' + c.zh;
      btn.addEventListener('click', () => {
        setActive(c.key);
        loadCity({ key: c.key, zh: c.zh, en: c.en, query: c.en, lat: c.lat, lon: c.lon, timezone: c.tz });
      });
      citiesEl.appendChild(btn);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = String(input.value || '').trim();
    if (!q) return;
    setActive('');
    loadCity({ query: q });
  });

  (async function init() {
    let list = [];
    try {
      const res = await window.weatherApi.getCities();
      list = (res && res.cities) || [];
    } catch (e) {}
    presetList = list;
    try {
      if (window.weatherApi && window.weatherApi.getPinned) {
        const pinRes = await window.weatherApi.getPinned();
        pinnedCity = (pinRes && pinRes.city) || null;
      }
    } catch (e) {}
    renderCities(list);
    if (pinnedCity) {
      input.value = pinnedCity.zh || pinnedCity.en || pinnedCity.query || '';
      setActive(pinnedCity.key || 'pinned');
      loadCity({
        key: pinnedCity.key,
        zh: pinnedCity.zh,
        en: pinnedCity.en,
        query: pinnedCity.query || pinnedCity.en || pinnedCity.zh,
        lat: pinnedCity.lat,
        lon: pinnedCity.lon,
        timezone: pinnedCity.timezone,
        admin1: pinnedCity.admin1,
        country: pinnedCity.country
      });
    } else if (list.length) {
      setActive(list[0].key);
      loadCity({ key: list[0].key, zh: list[0].zh, en: list[0].en, query: list[0].en, lat: list[0].lat, lon: list[0].lon, timezone: list[0].tz });
    }
    input.focus();
  })();
})();
