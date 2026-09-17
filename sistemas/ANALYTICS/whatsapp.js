// ============================================================
// WhatsApp Report - GA4
// Usa autenticacao compartilhada via localStorage (index.html)
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

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const CORE_BASE = 'https://analyticsdata.googleapis.com/v1beta/properties';
const BATCH_SIZE = 10;
const BATCH_DELAY = 200;

// ============================================================
// ESTADO
// ============================================================

let accessToken = null;
let tokenClient = null;
let trendChart = null;
let hourlyChart = null;
let siteCharts = {};
let currentPeriod = 'today';
let customStart = null;
let customEnd = null;
let dailyOffset = 0; // usado em "today"/"yesterday" para navegar dias
let currentData = []; // [{site, total, daily:[], sources, pages, locations, sessions, hourly, dayHour}]
let loadInProgress = false;

// ============================================================
// ICONES (mesmo set do dashboard)
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
  msgcircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>'
};

function getIcon(name) { return ICONS[name] || ICONS.sparkles; }

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}

// ============================================================
// TRADUCAO — Deixa termos tecnicos do GA4 em PT-BR amigavel
// ============================================================

const MEDIUM_LABELS = {
  'organic': 'Busca orgânica',
  '(none)': 'Direto',
  'referral': 'Outro site',
  'cpc': 'Anúncio pago',
  'ppc': 'Anúncio pago',
  'paid': 'Anúncio pago',
  'social': 'Redes sociais',
  'social-network': 'Redes sociais',
  'email': 'E-mail',
  'display': 'Display',
  'banner': 'Banner',
  'affiliate': 'Afiliado',
  'push': 'Notificação push',
  '(not set)': 'Não identificado',
  '(data deleted)': 'Dados removidos'
};

const DEVICE_LABELS = {
  'desktop': 'Computador',
  'mobile': 'Celular',
  'tablet': 'Tablet',
  'smart tv': 'Smart TV'
};

const COUNTRY_LABELS = {
  'Brazil': 'Brasil',
  'United States': 'Estados Unidos',
  'Portugal': 'Portugal',
  'United Kingdom': 'Reino Unido',
  'Argentina': 'Argentina',
  'Paraguay': 'Paraguai',
  'Spain': 'Espanha',
  'France': 'França',
  'Germany': 'Alemanha',
  'Italy': 'Itália',
  'Japan': 'Japão',
  'Canada': 'Canadá',
  'Mexico': 'México',
  'Colombia': 'Colômbia',
  'Chile': 'Chile',
  'Uruguay': 'Uruguai',
  'Peru': 'Peru',
  'Bolivia': 'Bolívia',
  'Venezuela': 'Venezuela',
  'Angola': 'Angola',
  'Mozambique': 'Moçambique',
  '(not set)': 'Não identificado'
};

function translateSource(v) {
  if (!v || v === '(not set)') return 'Direto / não identificado';
  if (v === '(direct)') return 'Direto';
  return v;
}

function translateMedium(v) {
  if (!v) return 'Direto';
  return MEDIUM_LABELS[v.toLowerCase()] || v;
}

function translateDevice(v) {
  if (!v) return '—';
  return DEVICE_LABELS[v.toLowerCase()] || v;
}

function translateCountry(v) {
  if (!v || v === '(not set)') return 'Não identificado';
  return COUNTRY_LABELS[v] || v;
}

function translateGeneric(v) {
  if (!v || v === '(not set)') return 'Não identificado';
  if (v === '(direct)') return 'Direto';
  if (v === '(none)') return 'Nenhum';
  return v;
}

// ============================================================
// DATAS
// ============================================================

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function dayOfWeekBR(iso) {
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const d = new Date(iso + 'T12:00:00');
  return days[d.getDay()];
}

function resolvePeriod() {
  const today = new Date();
  const base = addDays(today, dailyOffset); // offset é negativo para dias passados
  if (currentPeriod === 'today') {
    const iso = toISO(base);
    return { start: iso, end: iso, mode: 'single' };
  }
  if (currentPeriod === 'yesterday') {
    const d = toISO(addDays(base, -1));
    return { start: d, end: d, mode: 'single' };
  }
  if (currentPeriod === '7d') {
    return { start: toISO(addDays(today, -6)), end: toISO(today), mode: 'range' };
  }
  if (currentPeriod === '30d') {
    return { start: toISO(addDays(today, -29)), end: toISO(today), mode: 'range' };
  }
  if (currentPeriod === '90d') {
    return { start: toISO(addDays(today, -89)), end: toISO(today), mode: 'range' };
  }
  if (currentPeriod === 'custom') {
    return { start: customStart || toISO(today), end: customEnd || toISO(today), mode: 'range' };
  }
  return { start: toISO(today), end: toISO(today), mode: 'single' };
}

function updatePeriodLabel() {
  const p = resolvePeriod();
  const $label = document.getElementById('period-label');
  if (currentPeriod === 'today' || currentPeriod === 'yesterday') {
    $label.textContent = `${formatBR(p.start)} (${dayOfWeekBR(p.start)})`;
  } else {
    $label.textContent = `${formatBR(p.start)} até ${formatBR(p.end)}`;
  }

  // Desabilita prev/next quando nao é dia único
  const $prev = document.getElementById('btn-prev-day');
  const $next = document.getElementById('btn-next-day');
  const isDaily = (currentPeriod === 'today' || currentPeriod === 'yesterday');
  $prev.disabled = !isDaily;
  $next.disabled = !isDaily || dailyOffset >= 0;

  // Mostra/oculta barra de navegação
  document.getElementById('period-nav').style.display = isDaily ? 'flex' : 'none';
  document.getElementById('period-custom').style.display = currentPeriod === 'custom' ? 'flex' : 'none';
}

// ============================================================
// API HELPERS
// ============================================================

async function runReport(propertyId, body) {
  const res = await fetch(`${CORE_BASE}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (res.status === 401) {
    handleTokenExpired();
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Filtro: evento 'click' (outbound) cujo linkUrl contenha WhatsApp
function whatsappClickFilter() {
  return {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'click', matchType: 'EXACT' }
          }
        },
        {
          orGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'linkUrl',
                  stringFilter: { value: 'wa.me', matchType: 'CONTAINS' }
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
      ]
    }
  };
}

// Filtro para o evento customizado whatsapp_click
function customWhatsappFilter() {
  return {
    filter: {
      fieldName: 'eventName',
      stringFilter: { value: 'whatsapp_click', matchType: 'EXACT' }
    }
  };
}

// ============================================================
// BUSCAS POR SITE
// ============================================================

async function fetchSiteTotal(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter()
  });
  if (data.rows && data.rows.length > 0) {
    return parseInt(data.rows[0].metricValues[0].value, 10) || 0;
  }
  return 0;
}

async function fetchSiteDaily(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter(),
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });
  const out = {};
  if (data.rows) {
    data.rows.forEach(r => {
      const rawDate = r.dimensionValues[0].value; // YYYYMMDD
      const iso = `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
      out[iso] = parseInt(r.metricValues[0].value, 10) || 0;
    });
  }
  return out;
}

async function fetchSiteSources(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 8
  });
  return (data.rows || []).map(r => ({
    name: translateSource(r.dimensionValues[0].value),
    value: parseInt(r.metricValues[0].value, 10) || 0
  }));
}

async function fetchSitePages(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 8
  });
  return (data.rows || []).map(r => ({
    name: r.dimensionValues[0].value || '/',
    value: parseInt(r.metricValues[0].value, 10) || 0
  }));
}

async function fetchSiteDevices(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter()
  });
  return (data.rows || []).map(r => ({
    name: translateDevice(r.dimensionValues[0].value),
    value: parseInt(r.metricValues[0].value, 10) || 0
  }));
}

async function fetchSiteLocations(propertyId, startDate, endDate) {
  // usa evento customizado whatsapp_click
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'customEvent:button_location' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: customWhatsappFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 15
  });
  return (data.rows || [])
    .filter(r => r.dimensionValues[0].value && r.dimensionValues[0].value !== '(not set)')
    .map(r => ({
      name: r.dimensionValues[0].value,
      value: parseInt(r.metricValues[0].value, 10) || 0
    }));
}

async function fetchSiteCountries(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 6
  });
  return (data.rows || []).map(r => ({
    name: translateCountry(r.dimensionValues[0].value),
    value: parseInt(r.metricValues[0].value, 10) || 0
  }));
}

async function fetchSiteMediums(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'sessionMedium' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter(),
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 6
  });
  return (data.rows || []).map(r => ({
    name: translateMedium(r.dimensionValues[0].value),
    value: parseInt(r.metricValues[0].value, 10) || 0
  }));
}

// Sessoes totais do site (sem filtro) — base para calcular taxa de conversao
async function fetchSiteSessions(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    metrics: [{ name: 'sessions' }],
    dateRanges: [{ startDate, endDate }]
  });
  if (data.rows && data.rows.length > 0) {
    return parseInt(data.rows[0].metricValues[0].value, 10) || 0;
  }
  return 0;
}

// Cliques por hora (0-23) — agregado ao longo do periodo
async function fetchSiteHourly(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'hour' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter()
  });
  const hourly = new Array(24).fill(0);
  if (data.rows) {
    data.rows.forEach(r => {
      const h = parseInt(r.dimensionValues[0].value, 10);
      if (h >= 0 && h < 24) {
        hourly[h] = parseInt(r.metricValues[0].value, 10) || 0;
      }
    });
  }
  return hourly;
}

// Heatmap dia-da-semana (0=dom) x hora (0-23)
async function fetchSiteDayHour(propertyId, startDate, endDate) {
  const data = await runReport(propertyId, {
    dimensions: [{ name: 'dayOfWeek' }, { name: 'hour' }],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate, endDate }],
    dimensionFilter: whatsappClickFilter()
  });
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0));
  if (data.rows) {
    data.rows.forEach(r => {
      const d = parseInt(r.dimensionValues[0].value, 10);
      const h = parseInt(r.dimensionValues[1].value, 10);
      if (d >= 0 && d < 7 && h >= 0 && h < 24) {
        grid[d][h] = parseInt(r.metricValues[0].value, 10) || 0;
      }
    });
  }
  return grid;
}

// ============================================================
// RENDERIZACAO
// ============================================================

function createSiteCards() {
  const $grid = document.getElementById('sites-grid');
  $grid.innerHTML = '';
  SITES.forEach((site, i) => {
    const card = document.createElement('div');
    card.className = 'wa-card loading';
    card.id = `wa-card-${i}`;
    card.dataset.idx = String(i);
    const color = site.color || '#00ff66';
    card.style.borderColor = color + '30';
    card.innerHTML = `
      <div class="wa-card-toggle" id="wa-toggle-${i}">▼ expandir</div>
      <div class="wa-card-main">
        <div class="wa-card-left">
          <div class="wa-card-icon" style="background:${color}20;color:${color}">${getIcon(site.icon)}</div>
          <div class="wa-card-info">
            <div class="wa-card-label" style="color:${color}">${escapeHtml(site.label)}</div>
            <div class="wa-card-rank" id="wa-rank-${i}">--</div>
            <div class="wa-card-conv" id="wa-conv-${i}" style="display:none">--</div>
          </div>
        </div>
        <div class="wa-card-right">
          <div class="wa-card-value" id="wa-val-${i}">--</div>
          <div class="wa-card-avg" id="wa-avg-${i}"></div>
        </div>
      </div>
      <div class="wa-card-details" id="wa-details-${i}"></div>
    `;
    card.addEventListener('click', () => toggleCard(i));
    $grid.appendChild(card);
  });
}

function toggleCard(idx) {
  const card = document.getElementById(`wa-card-${idx}`);
  if (!card || !card.classList.contains('has-data')) return;
  const wasExpanded = card.classList.contains('expanded');
  card.classList.toggle('expanded');
  const $toggle = document.getElementById(`wa-toggle-${idx}`);
  $toggle.textContent = card.classList.contains('expanded') ? '▲ recolher' : '▼ expandir';

  if (!wasExpanded) {
    // Renderizar gráfico mini quando expandir pela primeira vez
    const data = currentData[idx];
    if (data) renderMiniChart(idx, data);
  }
}

function renderSiteCard(idx, data) {
  const site = SITES[idx];
  const card = document.getElementById(`wa-card-${idx}`);
  if (!card) return;

  card.classList.remove('loading');
  const total = data.total;

  document.getElementById(`wa-val-${idx}`).textContent = formatNumber(total);

  // Média diária (só faz sentido em ranges)
  const p = resolvePeriod();
  if (p.mode === 'range' && data.dailyList && data.dailyList.length > 0) {
    const avg = Math.round(total / data.dailyList.length);
    document.getElementById(`wa-avg-${idx}`).textContent = `${avg}/dia`;
  } else {
    document.getElementById(`wa-avg-${idx}`).textContent = '';
  }

  if (total === 0) {
    card.classList.add('zero');
    card.classList.remove('has-data');
  } else {
    card.classList.remove('zero');
    card.classList.add('has-data');
  }

  // Taxa de conversao (cliques / sessoes)
  const $conv = document.getElementById(`wa-conv-${idx}`);
  if ($conv) {
    if (data.sessions > 0) {
      const rate = data.convRate;
      $conv.style.display = 'inline-block';
      $conv.classList.toggle('zero', total === 0);
      $conv.textContent = `${rate.toFixed(2)}% · ${formatNumber(data.sessions)} ses.`;
      $conv.title = `${total} cliques / ${data.sessions} sessões = ${rate.toFixed(2)}% de conversão`;
    } else {
      $conv.style.display = 'none';
    }
  }

  // Monta HTML de detalhes
  const $details = document.getElementById(`wa-details-${idx}`);
  let html = '';

  // Chart diário (se range)
  if (p.mode === 'range') {
    html += `<div class="wa-detail-section">
      <div class="wa-detail-title">Cliques por dia</div>
      <div class="wa-detail-mini-chart"><canvas id="wa-chart-${idx}"></canvas></div>
    </div>`;
  }

  html += renderDetailList('Origens (fonte)', data.sources);
  html += renderDetailList('Mídia', data.mediums);
  html += renderDetailList('Localização do botão', data.locations);
  html += renderDetailList('Páginas', data.pages);
  html += renderDetailList('Dispositivos', data.devices);
  html += renderDetailList('Países', data.countries);

  $details.innerHTML = html;
}

function renderDetailList(title, items) {
  if (!items || items.length === 0) {
    return `<div class="wa-detail-section">
      <div class="wa-detail-title">${escapeHtml(title)}</div>
      <div class="wa-detail-empty">sem dados no período</div>
    </div>`;
  }
  const max = Math.max(...items.map(i => i.value));
  let html = `<div class="wa-detail-section">
    <div class="wa-detail-title">${escapeHtml(title)}</div>`;
  items.forEach(it => {
    const pct = max > 0 ? (it.value / max) * 100 : 0;
    html += `<div class="wa-detail-item">
      <span class="wa-detail-name" title="${escapeHtml(it.name)}">${escapeHtml(it.name)}</span>
      <span class="wa-detail-value">${formatNumber(it.value)}</span>
    </div>
    <div class="wa-detail-bar"><div class="wa-detail-bar-fill" style="width:${pct}%"></div></div>`;
  });
  html += '</div>';
  return html;
}

function renderMiniChart(idx, data) {
  const canvas = document.getElementById(`wa-chart-${idx}`);
  if (!canvas || !data.dailyList) return;
  if (siteCharts[idx]) {
    siteCharts[idx].destroy();
  }
  const color = SITES[idx].color || '#00ff66';
  siteCharts[idx] = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: data.dailyList.map(d => d.date.slice(5)),
      datasets: [{
        data: data.dailyList.map(d => d.value),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#556677', font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: '#556677', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
      }
    }
  });
}

function sortCards() {
  const $grid = document.getElementById('sites-grid');
  const cards = Array.from($grid.children);
  cards.sort((a, b) => {
    const aVal = parseInt(currentData[parseInt(a.dataset.idx)]?.total || 0, 10);
    const bVal = parseInt(currentData[parseInt(b.dataset.idx)]?.total || 0, 10);
    return bVal - aVal;
  });
  // Atribui rank
  cards.forEach((card, rank) => {
    const i = parseInt(card.dataset.idx);
    const $rank = document.getElementById(`wa-rank-${i}`);
    const data = currentData[i];
    if ($rank) {
      if (data && data.total > 0) {
        $rank.textContent = `#${rank + 1}`;
      } else {
        $rank.textContent = '--';
      }
    }
    $grid.appendChild(card);
  });
}

// ============================================================
// CHART PRINCIPAL (tendência total)
// ============================================================

function renderTrendChart(dailyTotals) {
  const $wrap = document.getElementById('chart-wrap');
  const p = resolvePeriod();
  if (p.mode !== 'range' || !dailyTotals || Object.keys(dailyTotals).length === 0) {
    $wrap.style.display = 'none';
    return;
  }
  $wrap.style.display = 'block';

  // Ordena por data
  const entries = Object.entries(dailyTotals).sort((a, b) => a[0].localeCompare(b[0]));
  const labels = entries.map(([d]) => formatBR(d));
  const values = entries.map(([, v]) => v);

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(document.getElementById('trend-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cliques WhatsApp',
        data: values,
        borderColor: '#00ff66',
        backgroundColor: 'rgba(0,255,102,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#030810', borderColor: '#00ff66', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { color: '#8899aa', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8899aa', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
      }
    }
  });
}

// ============================================================
// GRAFICO DE HORA
// ============================================================

function renderHourlyChart(hourlyTotals) {
  const $wrap = document.getElementById('hourly-wrap');
  const total = hourlyTotals.reduce((s, v) => s + v, 0);
  if (total === 0) {
    $wrap.style.display = 'none';
    return;
  }
  $wrap.style.display = 'block';

  const labels = hourlyTotals.map((_, h) => `${String(h).padStart(2, '0')}h`);

  if (hourlyChart) hourlyChart.destroy();
  hourlyChart = new Chart(document.getElementById('hourly-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Cliques',
        data: hourlyTotals,
        backgroundColor: 'rgba(0,255,102,0.7)',
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#030810',
          borderColor: '#00ff66',
          borderWidth: 1,
          callbacks: {
            title: items => `${items[0].label}`,
            label: item => `${item.parsed.y} cliques`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#8899aa', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8899aa', font: { size: 10 }, precision: 0 }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
      }
    }
  });
}

// ============================================================
// HEATMAP DIA x HORA
// ============================================================

const DAYS_BR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function renderHeatmap(grid) {
  const $wrap = document.getElementById('heatmap-wrap');
  const $heat = document.getElementById('heatmap');
  const totalAll = grid.flat().reduce((s, v) => s + v, 0);
  if (totalAll === 0) {
    $wrap.style.display = 'none';
    return;
  }
  $wrap.style.display = 'block';

  const max = Math.max(...grid.flat());

  let html = '';
  // Cabecalho com horas (00..23)
  html += '<div class="heatmap-head"></div>';
  for (let h = 0; h < 24; h++) {
    html += `<div class="heatmap-head">${String(h).padStart(2, '0')}</div>`;
  }
  // 7 linhas (Dom..Sab)
  for (let d = 0; d < 7; d++) {
    html += `<div class="heatmap-row-label">${DAYS_BR[d]}</div>`;
    for (let h = 0; h < 24; h++) {
      const v = grid[d][h];
      const rel = max > 0 ? v / max : 0;
      // Curva suave (sqrt) para destacar diferencas em valores baixos
      const smooth = Math.sqrt(rel).toFixed(3);
      const title = `${DAYS_BR[d]} ${String(h).padStart(2, '0')}h — ${v} clique${v === 1 ? '' : 's'}`;
      html += `<div class="heatmap-cell" style="--rel:${smooth}" title="${title}"></div>`;
    }
  }
  $heat.innerHTML = html;
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

async function loadReport() {
  if (loadInProgress) return;
  loadInProgress = true;
  document.getElementById('sites-loading').style.display = 'block';
  document.getElementById('sites-grid').style.opacity = '0.4';
  document.getElementById('summary-total').textContent = '...';
  document.getElementById('summary-sites').textContent = '...';
  document.getElementById('summary-avg').textContent = '...';
  document.getElementById('summary-best-day').textContent = '...';

  const p = resolvePeriod();
  currentData = new Array(SITES.length).fill(null);

  // Zera refresh text
  const now = new Date();
  document.getElementById('last-refresh').textContent = `Atualizando...`;

  const dailyTotalsAll = {}; // soma por dia entre todos os sites

  for (let start = 0; start < SITES.length; start += BATCH_SIZE) {
    const batch = SITES.slice(start, start + BATCH_SIZE);
    const promises = batch.map((site, j) => {
      const idx = start + j;
      return loadSiteData(idx, site, p).then(data => {
        currentData[idx] = data;
        renderSiteCard(idx, data);
        // Agrega diário
        if (data.daily) {
          for (const [d, v] of Object.entries(data.daily)) {
            dailyTotalsAll[d] = (dailyTotalsAll[d] || 0) + v;
          }
        }
      }).catch(err => {
        console.error(`${site.label}: ${err.message}`);
        const card = document.getElementById(`wa-card-${idx}`);
        if (card) {
          card.classList.remove('loading');
          document.getElementById(`wa-val-${idx}`).textContent = 'erro';
        }
      });
    });
    await Promise.all(promises);
    if (start + BATCH_SIZE < SITES.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
  }

  // Totais
  const total = currentData.reduce((s, d) => s + (d?.total || 0), 0);
  const totalSessions = currentData.reduce((s, d) => s + (d?.sessions || 0), 0);
  const activeSites = currentData.filter(d => d && d.total > 0).length;

  document.getElementById('total-clicks').textContent = formatNumber(total);
  document.getElementById('summary-total').textContent = formatNumber(total);
  document.getElementById('summary-sites').textContent = `${activeSites}/${SITES.length}`;

  // Taxa de conversao geral
  const overallConv = totalSessions > 0 ? (total / totalSessions) * 100 : 0;
  document.getElementById('summary-conv').textContent = totalSessions > 0 ? `${overallConv.toFixed(2)}%` : '--';
  document.getElementById('summary-conv-sub').textContent = totalSessions > 0
    ? `${formatNumber(total)} / ${formatNumber(totalSessions)} sessões`
    : 'sem sessões';

  if (p.mode === 'range') {
    const days = Object.keys(dailyTotalsAll).length || 1;
    document.getElementById('summary-avg').textContent = `${formatNumber(Math.round(total / days))}/dia`;
    // Melhor dia
    let bestDay = null, bestVal = 0;
    for (const [d, v] of Object.entries(dailyTotalsAll)) {
      if (v > bestVal) { bestVal = v; bestDay = d; }
    }
    if (bestDay) {
      document.getElementById('summary-best-day').textContent = `${formatBR(bestDay)}: ${bestVal}`;
    } else {
      document.getElementById('summary-best-day').textContent = '--';
    }
  } else {
    document.getElementById('summary-avg').textContent = '--';
    document.getElementById('summary-best-day').textContent = '--';
  }

  // Agrega hora e heatmap entre todos os sites
  const hourlyTotals = new Array(24).fill(0);
  const heatmapTotals = Array.from({ length: 7 }, () => new Array(24).fill(0));
  currentData.forEach(d => {
    if (!d) return;
    if (d.hourly) d.hourly.forEach((v, h) => { hourlyTotals[h] += v; });
    if (d.dayHour) {
      d.dayHour.forEach((row, day) => {
        row.forEach((v, h) => { heatmapTotals[day][h] += v; });
      });
    }
  });

  // Melhor horario
  let bestHour = -1, bestHourVal = 0;
  hourlyTotals.forEach((v, h) => {
    if (v > bestHourVal) { bestHourVal = v; bestHour = h; }
  });
  if (bestHour >= 0 && bestHourVal > 0) {
    document.getElementById('summary-best-hour').textContent = `${String(bestHour).padStart(2, '0')}h`;
    document.getElementById('summary-best-hour-sub').textContent = `${bestHourVal} cliques`;
  } else {
    document.getElementById('summary-best-hour').textContent = '--';
    document.getElementById('summary-best-hour-sub').textContent = 'sem dados';
  }

  renderTrendChart(dailyTotalsAll);
  renderHourlyChart(hourlyTotals);
  renderHeatmap(heatmapTotals);
  sortCards();

  document.getElementById('sites-loading').style.display = 'none';
  document.getElementById('sites-grid').style.opacity = '1';
  document.getElementById('last-refresh').textContent = `Atualizado ${now.toLocaleTimeString('pt-BR', { hour12: false })}`;

  loadInProgress = false;
}

async function loadSiteData(idx, site, period) {
  const { start, end, mode } = period;
  // Busca todos os dados em paralelo (por site)
  const [total, sessions, sources, pages, devices, locations, countries, mediums, daily, hourly, dayHour] = await Promise.all([
    fetchSiteTotal(site.propertyId, start, end).catch(() => 0),
    fetchSiteSessions(site.propertyId, start, end).catch(() => 0),
    fetchSiteSources(site.propertyId, start, end).catch(() => []),
    fetchSitePages(site.propertyId, start, end).catch(() => []),
    fetchSiteDevices(site.propertyId, start, end).catch(() => []),
    fetchSiteLocations(site.propertyId, start, end).catch(() => []),
    fetchSiteCountries(site.propertyId, start, end).catch(() => []),
    fetchSiteMediums(site.propertyId, start, end).catch(() => []),
    mode === 'range' ? fetchSiteDaily(site.propertyId, start, end).catch(() => ({})) : Promise.resolve({}),
    fetchSiteHourly(site.propertyId, start, end).catch(() => new Array(24).fill(0)),
    fetchSiteDayHour(site.propertyId, start, end).catch(() => Array.from({ length: 7 }, () => new Array(24).fill(0)))
  ]);

  const dailyList = Object.entries(daily)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));

  const convRate = sessions > 0 ? (total / sessions) * 100 : 0;

  return { total, sessions, convRate, sources, pages, devices, locations, countries, mediums, daily, dailyList, hourly, dayHour };
}

// ============================================================
// PERIODO — HANDLERS
// ============================================================

function setupPeriodHandlers() {
  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      dailyOffset = 0;
      if (currentPeriod === 'custom') {
        // Preenche os inputs com últimos 7 dias por padrão
        const today = new Date();
        const weekAgo = addDays(today, -6);
        const $s = document.getElementById('custom-start');
        const $e = document.getElementById('custom-end');
        if (!$s.value) $s.value = toISO(weekAgo);
        if (!$e.value) $e.value = toISO(today);
        customStart = $s.value;
        customEnd = $e.value;
      }
      updatePeriodLabel();
      loadReport();
    });
  });

  document.getElementById('btn-prev-day').addEventListener('click', () => {
    dailyOffset -= 1;
    updatePeriodLabel();
    loadReport();
  });
  document.getElementById('btn-next-day').addEventListener('click', () => {
    if (dailyOffset >= 0) return;
    dailyOffset += 1;
    updatePeriodLabel();
    loadReport();
  });

  document.getElementById('btn-apply-custom').addEventListener('click', () => {
    customStart = document.getElementById('custom-start').value;
    customEnd = document.getElementById('custom-end').value;
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      alert('A data inicial deve ser anterior à final.');
      return;
    }
    updatePeriodLabel();
    loadReport();
  });
}

// ============================================================
// AUTH
// ============================================================

function loadCachedToken() {
  const tok = localStorage.getItem('ga4_access_token');
  const exp = parseInt(localStorage.getItem('ga4_token_expires') || '0', 10);
  if (tok && Date.now() < exp - 60 * 1000) {
    accessToken = tok;
    return true;
  }
  return false;
}

function saveToken(token, expiresIn) {
  localStorage.setItem('ga4_access_token', token);
  localStorage.setItem('ga4_token_expires', String(Date.now() + (expiresIn || 3600) * 1000));
}

function initAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: handleTokenResponse
  });

  document.getElementById('btn-login').addEventListener('click', () => {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });

  document.getElementById('btn-logout').addEventListener('click', logout);
}

function handleTokenResponse(response) {
  if (response.error) {
    document.getElementById('login-message').textContent = 'Erro na autenticação: ' + response.error;
    return;
  }
  accessToken = <<REMOVIDO>>;
  saveToken(accessToken, response.expires_in);
  showAuthenticated();
  fetchUserEmail();
  createSiteCards();
  loadReport();
}

async function fetchUserEmail() {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await res.json();
    document.getElementById('user-email').textContent = data.email || '';
  } catch { /* ignore */ }
}

function showAuthenticated() {
  document.getElementById('btn-login').style.display = 'none';
  document.getElementById('user-info').style.display = 'flex';
  document.getElementById('login-message').style.display = 'none';
  document.getElementById('report-container').style.display = 'block';
}

function handleTokenExpired() {
  accessToken = null;
  localStorage.removeItem('ga4_access_token');
  localStorage.removeItem('ga4_token_expires');
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

function logout() {
  if (accessToken) {
    try { google.accounts.oauth2.revoke(accessToken); } catch {}
  }
  accessToken = null;
  localStorage.removeItem('ga4_access_token');
  localStorage.removeItem('ga4_token_expires');
  document.getElementById('btn-login').style.display = '';
  document.getElementById('user-info').style.display = 'none';
  document.getElementById('report-container').style.display = 'none';
  document.getElementById('login-message').style.display = '';
}

// ============================================================
// INIT
// ============================================================

window.addEventListener('load', () => {
  setupPeriodHandlers();
  updatePeriodLabel();

  // Se já tem token válido em localStorage, pula login
  if (loadCachedToken()) {
    // Aguarda gsi/client carregar pra ter tokenClient disponível (para renovação)
    const wait = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(wait);
        initAuth();
        showAuthenticated();
        fetchUserEmail();
        createSiteCards();
        loadReport();
      }
    }, 100);
  } else {
    const wait = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(wait);
        initAuth();
      }
    }, 100);
  }
});
