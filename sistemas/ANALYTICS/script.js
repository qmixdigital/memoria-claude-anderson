// ============================================================
// CONFIGURACAO — Edite aqui
// ============================================================

const CLIENT_ID = '87716177089-u556raioimoknv416e35o82o1c4drgqb.apps.googleusercontent.com';

const SITES = [
  { label: 'Brasil', propertyId: '527989826', color: '#22c55e', icon: 'flag_br' },
  { label: 'Max', propertyId: '527996989', color: '#8b5cf6', icon: 'rocket' },
  { label: 'MOVIE', propertyId: '528051031', color: '#ef4444', icon: 'clapperboard' },
  { label: 'NET', propertyId: '527990697', color: '#3b82f6', icon: 'signal' },
  { label: 'Nexo', propertyId: '527973187', color: '#f59e0b', icon: 'hub' },
  { label: 'Plus', propertyId: '527995494', color: '#06b6d4', icon: 'sparkles' },
  { label: 'PRO', propertyId: '527966865', color: '#ec4899', icon: 'shield' },
  { label: 'TOP', propertyId: '528105306', color: '#f97316', icon: 'trophy' },
  { label: 'ZAP', propertyId: '527996645', color: '#a3e635', icon: 'msgcircle' },
  { label: 'Nexus', propertyId: '533048653', color: '#00aaff', icon: 'hub' },
];

const DEBUG = false;

// ============================================================
// CONSTANTES
// ============================================================

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const REALTIME_BASE = 'https://analyticsdata.googleapis.com/v1beta/properties';
const CORE_BASE = 'https://analyticsdata.googleapis.com/v1beta/properties';
const POLL_INTERVAL = 30000;
const SOURCES_INTERVAL = 300000; // 5 minutos para origens (Core API)
const BATCH_SIZE = 10;
const BATCH_DELAY = 200;
const TOKEN_REFRESH_MINUTES = 55;
const GLOW_THRESHOLD = 50;
const DROP_THRESHOLD = 0.5;

// ============================================================
// ESTADO
// ============================================================

let accessToken = null;
let tokenClient = null;
let pollTimer = null;
let sourcesTimer = null;
let refreshTimer = null;
let charts = {};
let previousData = {};

// ============================================================
// TRADUCAO — termos do GA4 em PT-BR amigavel
// ============================================================

const DEVICE_LABELS = {
  'desktop': 'Computador',
  'mobile': 'Celular',
  'tablet': 'Tablet',
  'smart tv': 'Smart TV'
};

function translateSource(v) {
  if (!v || v === '(not set)') return 'Direto / não identificado';
  if (v === '(direct)') return 'Direto';
  return v;
}

function translateDevice(v) {
  if (!v) return '';
  return DEVICE_LABELS[v.toLowerCase()] || v;
}

// ============================================================
// DATA LOCAL (fuso do navegador, nao UTC)
// ============================================================

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayLocal() {
  return toLocalISO(new Date());
}

// ============================================================
// DEBUG LOG
// ============================================================

function debugLog(msg, type = 'info') {
  if (!DEBUG) return;
  const $log = document.getElementById('debug-log');
  if (!$log) return;
  const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  const color = { info: '#8899aa', ok: '#00ff66', warn: '#ffaa00', error: '#ff4444' }[type] || '#8899aa';
  $log.innerHTML += `<div style="color:${color}">[${time}] ${escapeHtml(msg)}</div>`;
  $log.scrollTop = $log.scrollHeight;
}

// ============================================================
// DOM
// ============================================================

const $grid = document.getElementById('cards-grid');
const $totalUsers = document.getElementById('total-users');
const $clock = document.getElementById('clock');
const $btnLogin = document.getElementById('btn-login');
const $btnLogout = document.getElementById('btn-logout');
const $userInfo = document.getElementById('user-info');
const $userEmail = document.getElementById('user-email');
const $loginMessage = document.getElementById('login-message');
const $lastRefresh = document.getElementById('last-refresh');

// ============================================================
// ICONES SVG
// ============================================================

const ICONS = {
  flag_br: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="12,6 21,12 12,18 3,12" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',
  rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  clapperboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6L3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M6.2 5.3l3.1 3.9"/><path d="M12.4 3.4l3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  signal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 20V4"/></svg>',
  hub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="3" r="1.5"/><circle cx="21" cy="12" r="1.5"/><circle cx="12" cy="21" r="1.5"/><circle cx="3" cy="12" r="1.5"/><line x1="12" y1="6" x2="12" y2="9"/><line x1="18" y1="12" x2="15" y2="12"/><line x1="12" y1="15" x2="12" y2="18"/><line x1="6" y1="12" x2="9" y2="12"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  msgcircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
};

function getIcon(name) {
  return ICONS[name] || ICONS.globe;
}

// ============================================================
// RELOGIO
// ============================================================

function updateClock() {
  const now = new Date();
  $clock.textContent = now.toLocaleTimeString('pt-BR', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// CARDS
// ============================================================

function createCards() {
  $grid.innerHTML = '';
  charts = {};
  previousData = {};

  SITES.forEach((site, i) => {
    const card = document.createElement('div');
    card.className = 'card loading';
    card.id = `card-${i}`;
    const siteColor = site.color || '#00ff66';
    card.style.borderColor = siteColor + '30';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-label-group">
          <div class="card-icon" style="background:${siteColor}20;color:${siteColor}">${getIcon(site.icon)}</div>
          <div class="card-label" style="color:${siteColor}">${escapeHtml(site.label)}</div>
        </div>
        <span class="card-trend stable" id="trend-${i}">--</span>
      </div>
      <div class="card-metrics">
        <div class="metric-30m" id="m30-${i}" style="color:${siteColor}">--</div>
        <div class="metric-5m">5min: <span id="m5-${i}">--</span></div>
      </div>
      <div class="card-history" id="history-${i}">
        <div class="card-history-item">
          <span class="card-history-label">Ontem</span>
          <span class="card-history-value" id="hist-day-${i}">--</span>
        </div>
        <div class="card-history-item">
          <span class="card-history-label">7 dias</span>
          <span class="card-history-value" id="hist-week-${i}">--</span>
        </div>
        <div class="card-history-item">
          <span class="card-history-label">30 dias</span>
          <span class="card-history-value" id="hist-month-${i}">--</span>
        </div>
      </div>
      <div class="card-whatsapp" id="whatsapp-${i}">
        <span class="card-whatsapp-icon">${getIcon('whatsapp')}</span>
        <span class="card-whatsapp-value" id="wa-val-${i}">--</span>
        <span class="card-whatsapp-label">cliques WhatsApp (hoje)</span>
      </div>
      <div class="card-devices" id="devices-${i}"></div>
      <div class="card-page" id="page-${i}"></div>
      <div class="card-chart">
        <canvas id="chart-${i}"></canvas>
      </div>
      <div class="card-sources" id="sources-${i}">
        <div class="card-sources-title">Origens (hoje)</div>
        <div class="card-source-item"><span class="card-source-name">aguardando...</span></div>
      </div>
    `;
    $grid.appendChild(card);

    const ctx = document.getElementById(`chart-${i}`).getContext('2d');
    charts[i] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 30 }, (_, j) => 29 - j),
        datasets: [{
          data: new Array(30).fill(0),
          backgroundColor: siteColor + '99',
          borderRadius: 2,
          barPercentage: 0.8,
          categoryPercentage: 0.9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true }
        }
      }
    });
  });
}

function updateCard(index, minuteData) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;

  card.classList.remove('loading');

  const total30 = minuteData.reduce((sum, v) => sum + v, 0);
  const total5 = minuteData.slice(0, 5).reduce((sum, v) => sum + v, 0);
  const prev5 = minuteData.slice(5, 10).reduce((sum, v) => sum + v, 0);

  document.getElementById(`m30-${index}`).textContent = total30;
  document.getElementById(`m5-${index}`).textContent = total5;

  const $trend = document.getElementById(`trend-${index}`);
  if (prev5 === 0 && total5 === 0) {
    $trend.textContent = '--';
    $trend.className = 'card-trend stable';
  } else if (total5 > prev5) {
    const pct = prev5 > 0 ? Math.round(((total5 - prev5) / prev5) * 100) : 100;
    $trend.textContent = `+${pct}%`;
    $trend.className = 'card-trend up';
  } else if (total5 < prev5) {
    const pct = Math.round(((prev5 - total5) / prev5) * 100);
    $trend.textContent = `-${pct}%`;
    $trend.className = 'card-trend down';
  } else {
    $trend.textContent = '0%';
    $trend.className = 'card-trend stable';
  }

  const chartData = [...minuteData].reverse();
  charts[index].data.datasets[0].data = chartData;
  charts[index].update('none');

  if (total30 > GLOW_THRESHOLD) {
    card.classList.add('glow');
  } else {
    card.classList.remove('glow');
  }

  const prevTotal = previousData[index];
  if (prevTotal !== undefined && prevTotal > 10 && total30 < prevTotal * DROP_THRESHOLD) {
    card.classList.add('alert');
  } else {
    card.classList.remove('alert');
  }

  previousData[index] = total30;
  return total30;
}

function setCardError(index) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;
  card.classList.remove('loading');
  document.getElementById(`m30-${index}`).textContent = '--';
  document.getElementById(`m5-${index}`).textContent = '--';
}

// ============================================================
// ORDENACAO POR TRAFEGO
// ============================================================

function sortCardsByTraffic() {
  const cards = Array.from($grid.children);
  cards.sort((a, b) => {
    const aVal = parseInt(a.querySelector('.metric-30m').textContent) || 0;
    const bVal = parseInt(b.querySelector('.metric-30m').textContent) || 0;
    return bVal - aVal;
  });
  cards.forEach(card => $grid.appendChild(card));
}

// ============================================================
// API — Realtime (por minuto, dispositivos, paginas)
// ============================================================

async function fetchRealtime(propertyId, dimensions, metrics, limit) {
  const res = await fetch(`${REALTIME_BASE}/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dimensions: dimensions.map(d => ({ name: d })),
      metrics: metrics.map(m => ({ name: m })),
      minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }],
      ...(limit ? { limit } : {})
    })
  });

  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// ============================================================
// API — Core Reporting (dados do dia, com origens)
// ============================================================

async function fetchCoreReport(propertyId, dimensions, metrics, limit) {
  const today = todayLocal();
  const res = await fetch(`${CORE_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dimensions: dimensions.map(d => ({ name: d })),
      metrics: metrics.map(m => ({ name: m })),
      dateRanges: [{ startDate: today, endDate: today }],
      limit: limit || 5,
      orderBys: [{ metric: { metricName: metrics[0] }, desc: true }]
    })
  });

  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// ============================================================
// RENDER — Detalhes nos cards
// ============================================================

function renderSources(index, data) {
  const $el = document.getElementById(`sources-${index}`);
  if (!data || !data.rows || data.rows.length === 0) {
    $el.innerHTML = '<div class="card-sources-title">Origens (hoje)</div><div class="card-source-item"><span class="card-source-name">sem dados</span></div>';
    return;
  }

  let html = '<div class="card-sources-title">Origens (hoje)</div>';
  data.rows.forEach(row => {
    const name = translateSource(row.dimensionValues[0].value);
    const value = row.metricValues[0].value;
    html += `<div class="card-source-item"><span class="card-source-name">${escapeHtml(name)}</span><span class="card-source-value">${value}</span></div>`;
  });
  $el.innerHTML = html;
}

function renderDevices(index, data) {
  const $el = document.getElementById(`devices-${index}`);
  if (!data || !data.rows || data.rows.length === 0) {
    $el.innerHTML = '';
    return;
  }

  const total = data.rows.reduce((sum, r) => sum + parseInt(r.metricValues[0].value, 10), 0);
  let html = '';
  data.rows.forEach(row => {
    const name = row.dimensionValues[0].value;
    const value = parseInt(row.metricValues[0].value, 10);
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const cls = (name || '').toLowerCase();
    const displayName = translateDevice(name);
    html += `<div class="card-device-item"><span class="card-device-dot ${cls}"></span>${displayName} ${pct}%</div>`;
  });
  $el.innerHTML = html;
}

function renderTopPages(index, data) {
  const $el = document.getElementById(`page-${index}`);
  if (!data || !data.rows || data.rows.length === 0) {
    $el.innerHTML = '';
    return;
  }

  let html = '<div class="card-pages-title">Paginas ativas</div>';
  data.rows.forEach(row => {
    const name = row.dimensionValues[0].value;
    const value = row.metricValues[0].value;
    html += `<div class="card-source-item"><span class="card-source-name">${escapeHtml(name)}</span><span class="card-pages-value">${value}</span></div>`;
  });
  $el.innerHTML = html;
}

// ============================================================
// HISTORICO — Dados diario/semanal/mensal
// ============================================================

function getDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toLocalISO(d);
}

async function fetchHistory(propertyId, startDate, endDate) {
  const res = await fetch(`${CORE_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      metrics: [{ name: 'sessions' }],
      dateRanges: [{ startDate, endDate }]
    })
  });

  if (!res.ok) return 0;
  const data = await res.json();
  if (data.rows && data.rows.length > 0) {
    return parseInt(data.rows[0].metricValues[0].value, 10);
  }
  return 0;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return n.toString();
}

async function fetchAllHistory() {
  debugLog('Buscando historico...', 'info');
  const yesterday = getDateStr(1);
  const weekAgo = getDateStr(7);
  const monthAgo = getDateStr(30);

  for (let start = 0; start < SITES.length; start += BATCH_SIZE) {
    const batch = SITES.slice(start, start + BATCH_SIZE);

    const promises = batch.map((site, j) => {
      const index = start + j;
      return Promise.all([
        fetchHistory(site.propertyId, yesterday, yesterday),
        fetchHistory(site.propertyId, weekAgo, yesterday),
        fetchHistory(site.propertyId, monthAgo, yesterday)
      ]).then(([day, week, month]) => {
        document.getElementById(`hist-day-${index}`).textContent = formatNumber(day);
        document.getElementById(`hist-week-${index}`).textContent = formatNumber(week);
        document.getElementById(`hist-month-${index}`).textContent = formatNumber(month);
        debugLog(`${site.label} historico: ontem=${day} 7d=${week} 30d=${month}`, 'ok');
      }).catch(e => {
        debugLog(`${site.label} historico ERRO: ${e.message}`, 'error');
      });
    });

    await Promise.all(promises);

    if (start + BATCH_SIZE < SITES.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  debugLog('Historico atualizado', 'ok');
}

// ============================================================
// WHATSAPP — Cliques do dia
// ============================================================

async function fetchWhatsAppClicks(propertyId) {
  const today = todayLocal();
  const res = await fetch(`${CORE_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      metrics: [{ name: 'eventCount' }],
      dateRanges: [{ startDate: today, endDate: today }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'eventName',
                stringFilter: { value: 'click', matchType: 'EXACT' }
              }
            },
            {
              filter: {
                fieldName: 'linkUrl',
                stringFilter: { value: 'wa.me', matchType: 'CONTAINS' }
              }
            }
          ]
        }
      }
    })
  });

  if (!res.ok) return 0;
  const data = await res.json();

  let total = 0;
  if (data.rows && data.rows.length > 0) {
    total += parseInt(data.rows[0].metricValues[0].value, 10);
  }

  // Tambem buscar whatsapp.com
  const res2 = await fetch(`${CORE_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      metrics: [{ name: 'eventCount' }],
      dateRanges: [{ startDate: today, endDate: today }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'eventName',
                stringFilter: { value: 'click', matchType: 'EXACT' }
              }
            },
            {
              filter: {
                fieldName: 'linkUrl',
                stringFilter: { value: 'whatsapp.com', matchType: 'CONTAINS' }
              }
            }
          ]
        }
      }
    })
  });

  if (res2.ok) {
    const data2 = await res2.json();
    if (data2.rows && data2.rows.length > 0) {
      total += parseInt(data2.rows[0].metricValues[0].value, 10);
    }
  }

  return total;
}

async function fetchAllWhatsApp() {
  debugLog('Buscando cliques WhatsApp...', 'info');

  for (let start = 0; start < SITES.length; start += BATCH_SIZE) {
    const batch = SITES.slice(start, start + BATCH_SIZE);

    const promises = batch.map((site, j) => {
      const index = start + j;
      return fetchWhatsAppClicks(site.propertyId)
        .then(count => {
          document.getElementById(`wa-val-${index}`).textContent = count;
          debugLog(`${site.label} WhatsApp: ${count} cliques`, 'ok');
        })
        .catch(e => {
          debugLog(`${site.label} WhatsApp ERRO: ${e.message}`, 'error');
        });
    });

    await Promise.all(promises);

    if (start + BATCH_SIZE < SITES.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  debugLog('WhatsApp atualizado', 'ok');
}

// ============================================================
// POLLING — Dados em tempo real (30s)
// ============================================================

async function fetchAllSites() {
  debugLog('Iniciando polling realtime...', 'info');
  let grandTotal = 0;
  let tokenExpired = false;

  for (let start = 0; start < SITES.length; start += BATCH_SIZE) {
    const batch = SITES.slice(start, start + BATCH_SIZE);

    const mainPromises = batch.map((site, j) => {
      const index = start + j;
      return fetchRealtime(site.propertyId, ['minutesAgo'], ['activeUsers'])
        .then(data => {
          const minutes = parseMinutes(data);
          const total = updateCard(index, minutes);
          grandTotal += total;
          debugLog(`${site.label}: ${total} usuarios`, 'ok');
        })
        .catch(err => {
          if (err.message === 'TOKEN_EXPIRED') tokenExpired = true;
          setCardError(index);
          debugLog(`${site.label}: ERRO - ${err.message}`, 'error');
        });
    });

    await Promise.all(mainPromises);

    if (tokenExpired) {
      debugLog('Token expirado, renovando...', 'warn');
      handleTokenExpired();
      return;
    }

    await new Promise(r => setTimeout(r, BATCH_DELAY));

    // Dispositivos e pagina top (Realtime API)
    const detailPromises = batch.map((site, j) => {
      const index = start + j;
      return Promise.all([
        fetchRealtime(site.propertyId, ['deviceCategory'], ['activeUsers'], 5)
          .then(d => renderDevices(index, d))
          .catch(e => debugLog(`${site.label} devices: ${e.message}`, 'warn')),
        fetchRealtime(site.propertyId, ['unifiedScreenName'], ['activeUsers'], 10)
          .then(d => renderTopPages(index, d))
          .catch(e => debugLog(`${site.label} pages: ${e.message}`, 'warn'))
      ]);
    });

    await Promise.all(detailPromises);

    if (start + BATCH_SIZE < SITES.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  $totalUsers.textContent = grandTotal;
  sortCardsByTraffic();

  const now = new Date();
  $lastRefresh.textContent = `Atualizado ${now.toLocaleTimeString('pt-BR', { hour12: false })}`;
  debugLog(`Total: ${grandTotal} usuarios ativos`, 'ok');
  removeError();
}

function parseMinutes(data) {
  const minutes = new Array(30).fill(0);
  if (data.rows) {
    data.rows.forEach(row => {
      const minuteAgo = parseInt(row.dimensionValues[0].value, 10);
      const users = parseInt(row.metricValues[0].value, 10);
      if (minuteAgo >= 0 && minuteAgo < 30) {
        minutes[minuteAgo] = users;
      }
    });
  }
  return minutes;
}

// ============================================================
// POLLING — Origens via Core API (5min)
// ============================================================

async function fetchAllSources() {
  debugLog('Buscando origens via Core API...', 'info');

  for (let start = 0; start < SITES.length; start += BATCH_SIZE) {
    const batch = SITES.slice(start, start + BATCH_SIZE);

    const promises = batch.map((site, j) => {
      const index = start + j;
      return fetchCoreReport(site.propertyId, ['sessionSource'], ['sessions'], 10)
        .then(data => {
          renderSources(index, data);
          const sources = data.rows ? data.rows.map(r => r.dimensionValues[0].value).join(', ') : 'vazio';
          debugLog(`${site.label} origens: ${sources}`, 'ok');
        })
        .catch(e => {
          debugLog(`${site.label} origens ERRO: ${e.message}`, 'error');
          const $el = document.getElementById(`sources-${index}`);
          if ($el) $el.innerHTML = `<div class="card-sources-title">Origens (hoje)</div><div class="card-source-item"><span class="card-source-name">erro</span></div>`;
        });
    });

    await Promise.all(promises);

    if (start + BATCH_SIZE < SITES.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  debugLog('Origens atualizadas', 'ok');
}

// ============================================================
// POLLING CONTROL
// ============================================================

function startPolling() {
  stopPolling();
  fetchAllSites();
  pollTimer = setInterval(fetchAllSites, POLL_INTERVAL);

  // Origens, historico e WhatsApp: buscar agora e a cada 5 minutos
  fetchAllSources();
  fetchAllHistory();
  fetchAllWhatsApp();
  sourcesTimer = setInterval(() => {
    fetchAllSources();
    fetchAllHistory();
    fetchAllWhatsApp();
  }, SOURCES_INTERVAL);
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (sourcesTimer) { clearInterval(sourcesTimer); sourcesTimer = null; }
}

// ============================================================
// AUTENTICACAO
// ============================================================

function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: handleTokenResponse
  });

  $btnLogin.addEventListener('click', () => {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });

  $btnLogout.addEventListener('click', logout);
}

function handleTokenResponse(response) {
  if (response.error) {
    showError('Erro na autenticacao: ' + response.error);
    debugLog('Erro auth: ' + response.error, 'error');
    return;
  }

  accessToken = <<REMOVIDO>>;
  debugLog('Login OK, token obtido', 'ok');

  // Compartilha token com outras paginas (whatsapp.html) via localStorage
  try {
    localStorage.setItem('ga4_access_token', accessToken);
    localStorage.setItem('ga4_token_expires', String(Date.now() + (response.expires_in || 3600) * 1000));
  } catch (e) {}

  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    debugLog('Renovando token...', 'warn');
    tokenClient.requestAccessToken({ prompt: '' });
  }, TOKEN_REFRESH_MINUTES * 60 * 1000);

  $btnLogin.style.display = 'none';
  $userInfo.style.display = 'flex';
  $loginMessage.style.display = 'none';

  fetchUserEmail();
  createCards();
  startPolling();
}

async function fetchUserEmail() {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await res.json();
    $userEmail.textContent = data.email || '';
    debugLog(`Logado como ${data.email}`, 'ok');
  } catch {
    $userEmail.textContent = '';
  }
}

function handleTokenExpired() {
  stopPolling();
  if (refreshTimer) clearTimeout(refreshTimer);
  try {
    tokenClient.requestAccessToken({ prompt: '' });
  } catch {
    logout();
    showError('Sessao expirada. Faca login novamente.');
  }
}

function logout() {
  stopPolling();
  if (refreshTimer) clearTimeout(refreshTimer);
  if (accessToken) google.accounts.oauth2.revoke(accessToken);
  accessToken = null;

  $btnLogin.style.display = '';
  $userInfo.style.display = 'none';
  $userEmail.textContent = '';
  $loginMessage.style.display = '';
  $totalUsers.textContent = '--';
  $lastRefresh.textContent = '';
  $grid.innerHTML = '';
  charts = {};
  previousData = {};
  removeError();
  debugLog('Logout realizado', 'info');
}

// ============================================================
// ERROS
// ============================================================

function showError(message) {
  removeError();
  const el = document.createElement('div');
  el.className = 'header-error';
  el.id = 'error-banner';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(removeError, 8000);
}

function removeError() {
  const el = document.getElementById('error-banner');
  if (el) el.remove();
}

// ============================================================
// UTILS
// ============================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// INIT
// ============================================================

window.addEventListener('load', () => {
  if (SITES.length === 0) {
    $loginMessage.textContent = 'Configure o array SITES no arquivo script.js';
    return;
  }

  if (CLIENT_ID === 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com') {
    $loginMessage.textContent = 'Configure o CLIENT_ID no arquivo script.js';
    return;
  }

  initAuth();
});
