/* ===== QMIX Indexation — App Logic ===== */

const App = (() => {
  // Google search time filters: param &tbs=qdr:X
  const TIME_FILTERS = [
    { label: 'Última Hora', param: 'h', icon: 'clock' },
    { label: '24 Horas', param: 'd', icon: 'day' },
    { label: 'Semana', param: 'w', icon: 'week' },
    { label: 'Mês', param: 'm', icon: 'month' },
    { label: 'Ano', param: 'y', icon: 'year' },
    { label: 'Tudo', param: '', icon: 'all' }
  ];

  const CATEGORY_ICONS = {
    portal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    project: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    client: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    custom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  const TIME_ICONS = {
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    day: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    week: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    month: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>`,
    year: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    all: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
  };

  let data = { categories: [] };
  let domainStatus = {};
  let engineHtml = new Set();
  let engineNext = new Set();
  let engineWp = new Set();
  let engineShopify = new Set();
  let gscData = null;
  let currentTab = 'indexation';  // indexation | reports
  let currentView = 'home';
  let currentCategory = null;
  let currentDomain = null;
  let currentReportCategory = null;
  let favorites = {};
  let reportSort = { key: 'name', dir: 'asc' };
  let reportSubview = 'overview';   // overview | domains
  let domainGroup = 'none';         // none | status | stack

  const ACCESS_KEY = '<<REMOVIDO>>';
  // Sempre mesma origem. O host api-indexation.qmix.com.br continua no ar
  // por compatibilidade, mas NAO serve para o frontend: o Nginx dele injeta
  // Access-Control-Allow-Origin e o Express (cors) injeta outro, e o
  // navegador recusa resposta com esse header duplicado ("Failed to fetch").
  const API_BASE = '';  // mesma origem via /api/*
  let refreshPollTimer = null;

  // ===== Deep link da página de domínio (#/d/dominio.com.br) =====
  // Permite abrir o detalhe de um domínio direto numa aba nova.

  function detailUrl(domain) {
    return '#/d/' + encodeURIComponent(domain);
  }

  // URL sem hash, para quando a view não é o detalhe
  function baseUrl() {
    return location.pathname + location.search;
  }

  function parseDeepLink() {
    const m = location.hash.match(/^#\/d\/(.+)$/);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return null;
    }
  }

  // Aplica o deep link depois que domains.json já carregou.
  // Semeia duas entradas no histórico para que "voltar" caia na lista
  // da categoria em vez de sair do app.
  function applyDeepLink(domain) {
    if (!domain) return false;
    const idx = data.categories.findIndex(c => c.domains.includes(domain));
    if (idx < 0) return false;

    currentTab = 'indexation';
    currentView = 'detail';
    currentCategory = idx;
    currentDomain = domain;
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'indexation'));

    history.replaceState({ view: 'domains', category: idx, tab: 'indexation' }, '', baseUrl());
    history.pushState({ view: 'detail', category: idx, domain, tab: 'indexation' }, '', detailUrl(domain));
    return true;
  }

  function loadFavorites() {
    try {
      favorites = JSON.parse(localStorage.getItem('qmix_favorites') || '{}');
    } catch {
      favorites = {};
    }
  }

  function saveFavorites() {
    localStorage.setItem('qmix_favorites', JSON.stringify(favorites));
  }

  // Critérios de ordenação dos relatórios.
  // blank = valor que significa "sem dado" e por isso vai sempre para o fim,
  // independente da direção (ex.: posição 0 = domínio sem impressão nenhuma).
  const REPORT_SORTS = {
    name:        { label: 'Nome',       dir: 'asc',  arrows: ['A-Z', 'Z-A'] },
    clicks:      { label: 'Cliques',    dir: 'desc', get: i => i.clicks || 0 },
    impressions: { label: 'Impressões', dir: 'desc', get: i => i.impressions || 0 },
    ctr:         { label: 'CTR',        dir: 'desc', get: i => i.ctr || 0 },
    position:    { label: 'Posição',    dir: 'asc',  get: i => i.position || 0, blank: v => !v },
  };

  function loadReportSort() {
    try {
      const s = JSON.parse(localStorage.getItem('qmix_report_sort') || 'null');
      if (s && REPORT_SORTS[s.key] && (s.dir === 'asc' || s.dir === 'desc')) reportSort = s;
    } catch {
      /* mantém o padrão */
    }
  }

  function saveReportSort() {
    localStorage.setItem('qmix_report_sort', JSON.stringify(reportSort));
  }

  function sortReportDomains(entries) {
    const byName = (a, b) => a[0].localeCompare(b[0], 'pt-BR');
    const sort = REPORT_SORTS[reportSort.key] || REPORT_SORTS.name;
    const mult = reportSort.dir === 'asc' ? 1 : -1;

    if (!sort.get) return entries.slice().sort((a, b) => byName(a, b) * mult);

    // Sem GSC, com erro ou sem dado no critério: sempre no fim, em ordem alfabética
    const hasValue = ([, i]) => i.authorized && !i.error && !(sort.blank && sort.blank(sort.get(i)));
    const withData = entries.filter(hasValue);
    const without = entries.filter(e => !hasValue(e));

    withData.sort((a, b) => {
      const diff = (sort.get(a[1]) - sort.get(b[1])) * mult;
      return diff !== 0 ? diff : byName(a, b);
    });
    without.sort(byName);

    return withData.concat(without);
  }

  function renderReportSortBar() {
    const bar = $('#report-sort-bar');
    if (!bar) return;

    bar.innerHTML = Object.entries(REPORT_SORTS).map(([key, s]) => {
      const active = key === reportSort.key;
      const arrows = s.arrows || ['↑', '↓'];
      const arrow = active ? ` <span class="sort-arrow">${reportSort.dir === 'asc' ? arrows[0] : arrows[1]}</span>` : '';
      return `<button type="button" class="sort-chip${active ? ' is-active' : ''}" data-sort="${key}"
                aria-pressed="${active}">${s.label}${arrow}</button>`;
    }).join('');

    bar.querySelectorAll('.sort-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.sort;
        if (key === reportSort.key) {
          // Reclicar o critério ativo inverte a direção
          reportSort.dir = reportSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          reportSort = { key, dir: REPORT_SORTS[key].dir };
        }
        saveReportSort();
        renderReports();
      });
    });
  }

  function isFavorite(categoryIdx, domain) {
    const key = categoryIdx + ':' + domain;
    return !!favorites[key];
  }

  function toggleFavorite(categoryIdx, domain) {
    const key = categoryIdx + ':' + domain;
    if (favorites[key]) {
      delete favorites[key];
    } else {
      favorites[key] = true;
    }
    saveFavorites();
  }

  function sortDomains(domains, categoryIdx) {
    const favs = domains.filter((d) => isFavorite(categoryIdx, d)).sort((a, b) => a.localeCompare(b));
    const rest = domains.filter((d) => !isFavorite(categoryIdx, d)).sort((a, b) => a.localeCompare(b));
    return [...favs, ...rest];
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  async function init() {
    registerSW();

    // localStorage (e não sessionStorage) porque sessionStorage é por aba:
    // abrir a página de um domínio em aba nova pediria a senha de novo.
    if (localStorage.getItem('qmix_auth') === '1' || sessionStorage.getItem('qmix_auth') === '1') {
      unlockApp();
    } else {
      setupLogin();
    }
  }

  function setupLogin() {
    const loginBtn = $('#login-btn');
    const loginInput = $('#login-input');
    const loginError = $('#login-error');

    function tryLogin() {
      if (loginInput.value === ACCESS_KEY) {
        localStorage.setItem('qmix_auth', '1');
        unlockApp();
      } else {
        loginInput.classList.add('error');
        loginError.classList.add('visible');
        setTimeout(() => {
          loginInput.classList.remove('error');
          loginError.classList.remove('visible');
        }, 2000);
        loginInput.value = '';
        loginInput.focus();
      }
    }

    loginBtn.addEventListener('click', tryLogin);
    loginInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryLogin();
    });
    loginInput.focus();
  }

  async function unlockApp() {
    $('#login-screen').classList.add('hidden');
    $('#app-header').style.display = '';
    $('#search-bar').style.display = '';
    $('#app-main').style.display = '';
    $('#bottom-nav').style.display = '';

    // Lido antes de bindEvents, que reescreve o estado inicial do histórico
    const deepLink = parseDeepLink();

    loadFavorites();
    loadReportSort();
    loadOverviewPrefs();
    loadDomainGroup();
    await loadDomains();
    await loadStatus();
    loadGsc();
    bindEvents();
    applyDeepLink(deepLink);
    render();

    // Atualiza status em background a cada 60s e re-renderiza
    setInterval(async () => {
      await loadStatus();
      render();
    }, 60000);
  }

  async function loadDomains() {
    try {
      const res = await fetch('/domains.json?t=' + Date.now());
      data = await res.json();
    } catch {
      // Fallback: use cached or empty
      data = { categories: [] };
    }
    // Carrega engine-status.json para o badge HTML
    try {
      const res = await fetch('/engine-status.json?t=' + Date.now());
      const engineData = await res.json();
      engineHtml = new Set(engineData.html || []);
      engineNext = new Set(engineData.next || []);
      engineWp = new Set(engineData.wp || []);
      engineShopify = new Set(engineData.shopify || []);
    } catch {
      engineHtml = new Set();
      engineNext = new Set();
      engineWp = new Set();
      engineShopify = new Set();
    }
  }

  async function loadStatus() {
    // Lê dados embutidos no window.__QMIX_STATUS__ (carregado via status.js)
    if (window.__QMIX_STATUS__) {
      domainStatus = window.__QMIX_STATUS__;
      console.log(`Status: ${Object.keys(domainStatus).length} domínios carregados`);
    } else {
      console.warn('window.__QMIX_STATUS__ não definido');
    }
  }

  function loadGsc() {
    // Dados do Google Search Console (window.__QMIX_GSC__)
    if (window.__QMIX_GSC__) {
      gscData = window.__QMIX_GSC__;
      console.log(`GSC: ${gscData.stats.authorized} domínios com dados`);
    } else {
      gscData = null;
    }
  }

  function daysSince(timestamp) {
    if (!timestamp) return null;
    return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  }

  function getStatusBadge(domain) {
    const s = domainStatus[domain];
    if (!s || !s.last_check) return { class: 'unknown', text: 'sem dados' };
    const status = s.display_status || (s.has_recent_indexing ? 'green' : 'red');
    const count = s.transition_count || 0;
    const labels = {
      green: 'indexando',
      red: 'sem indexação',
      orange: `recuperando (${count}/3)`,
      blue: `caindo (${count}/3)`,
      unknown: 'sem dados',
    };
    return { class: status, text: labels[status] || 'sem dados' };
  }

  function bindEvents() {
    $('#btn-back').addEventListener('click', () => history.back());
    $('#search-input').addEventListener('input', (e) => filterDomains(e.target.value));

    // Refresh button
    const refreshBtn = $('#btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', handleRefreshClick);
      // Verifica se já tem refresh em andamento
      checkRefreshStatus();
    }

    // Bottom nav
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    window.addEventListener('popstate', (e) => {
      if (e.state) {
        currentView = e.state.view || 'home';
        currentCategory = e.state.category ?? null;
        currentDomain = e.state.domain ?? null;
        currentReportCategory = e.state.reportCat ?? null;
        if (e.state.tab && e.state.tab !== currentTab) {
          currentTab = e.state.tab;
          $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
        }
      } else {
        currentView = currentTab === 'reports' ? 'reports' : 'home';
        currentCategory = null;
        currentDomain = null;
        currentReportCategory = null;
      }
      render();
    });

    // Set initial state
    history.replaceState({ view: 'home', tab: 'indexation' }, '');
  }

  function goBack() {
    history.back();
  }

  function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;
    currentView = tab === 'reports' ? 'reports' : 'home';
    currentCategory = null;
    currentDomain = null;
    currentReportCategory = null;
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    history.replaceState({ view: currentView, tab }, '', baseUrl());
    render();
  }

  function navigate(view, categoryIdx, domain) {
    if (view === 'domains') {
      currentView = 'domains';
      currentCategory = categoryIdx;
      currentDomain = null;
      $('#search-input').value = '';
      history.pushState({ view: 'domains', category: categoryIdx }, '', baseUrl());
    } else if (view === 'detail') {
      currentView = 'detail';
      currentDomain = domain;
      // URL com o deep link para que recarregar ou copiar o link funcione
      history.pushState({ view: 'detail', category: currentCategory, domain: domain }, '', detailUrl(domain));
    }
    render();
  }

  function render() {
    // Update back button
    const btnBack = $('#btn-back');
    if (currentView === 'home') {
      btnBack.classList.remove('visible');
    } else {
      btnBack.classList.add('visible');
    }

    // Update subtitle
    const subtitle = $('#header-subtitle');
    if (currentView === 'home') {
      subtitle.textContent = 'Monitoramento de Indexação';
    } else if (currentView === 'domains') {
      subtitle.textContent = data.categories[currentCategory].name;
    } else if (currentView === 'detail') {
      subtitle.textContent = 'Verificar Indexação';
    } else if (currentView === 'reports') {
      subtitle.textContent = currentReportCategory
        ? `Relatórios — ${currentReportCategory}`
        : 'Relatórios GSC';
    }

    // Toggle search
    const searchBar = $('.search-bar');
    if (currentView === 'domains') {
      searchBar.classList.add('visible');
    } else {
      searchBar.classList.remove('visible');
    }

    // Show active view
    $$('.view').forEach((v) => v.classList.remove('active'));

    if (currentView === 'home') {
      renderHome();
      $('#view-home').classList.add('active');
    } else if (currentView === 'domains') {
      renderDomains();
      $('#view-domains').classList.add('active');
    } else if (currentView === 'detail') {
      renderDetail();
      $('#view-detail').classList.add('active');
    } else if (currentView === 'reports') {
      renderReports();
      $('#view-reports').classList.add('active');
    }
  }

  function renderHome() {
    const totalDomains = data.categories.reduce((sum, c) => sum + c.domains.length, 0);
    const totalCategories = data.categories.length;

    // Stats
    $('#stat-domains').textContent = totalDomains;
    $('#stat-categories').textContent = totalCategories;

    // Category cards
    const grid = $('#category-grid');
    grid.innerHTML = '';

    data.categories.forEach((cat, idx) => {
      const iconSvg = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.custom;
      const card = document.createElement('div');
      card.className = 'category-card animate-in';
      card.innerHTML = `
        <div class="category-icon">${iconSvg}</div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.domains.length} domínio${cat.domains.length !== 1 ? 's' : ''}</div>
      `;
      card.addEventListener('click', () => navigate('domains', idx));
      grid.appendChild(card);
    });

    if (data.categories.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <p>Nenhuma categoria encontrada.<br>Adicione domínios no <strong>domains.json</strong></p>
        </div>
      `;
    }
  }

  // Etiqueta da stack do domínio. As listas vêm da detecção em
  // engine-status.json e são mutuamente exclusivas por construção.
  const ENGINE_BADGES = [
    { set: () => engineNext,    cls: 'is-next',    label: 'NEXT',    title: 'Site em Next.js' },
    { set: () => engineWp,      cls: 'is-wp',      label: 'WP',      title: 'Site em WordPress' },
    { set: () => engineShopify, cls: 'is-shopify', label: 'SHOPIFY', title: 'Loja em Shopify' },
    { set: () => engineHtml,    cls: '',           label: 'HTML',    title: 'Site em HTML estático' },
  ];

  function engineBadge(domain, extraClass = '') {
    for (const b of ENGINE_BADGES) {
      if (!b.set().has(domain)) continue;
      const cls = ['engine-badge', b.cls, extraClass].filter(Boolean).join(' ');
      return `<span class="${cls}" title="${b.title}">${b.label}</span>`;
    }
    return '';
  }

  // ===== Agrupamento da lista de domínios =====
  // A ordem dos grupos é a ordem de leitura: o que exige ação primeiro.

  const GRUPOS = {
    none: { label: 'Sem agrupar' },
    status: {
      label: 'Status',
      chave: d => getStatusBadge(d).class,
      ordem: ['red', 'blue', 'orange', 'green', 'unknown'],
      titulos: {
        red: 'Sem indexação',
        blue: 'Caindo',
        orange: 'Recuperando',
        green: 'Indexando',
        unknown: 'Sem dados',
      },
    },
    stack: {
      label: 'Stack',
      chave: d => engineNext.has(d) ? 'next'
        : engineWp.has(d) ? 'wp'
        : engineShopify.has(d) ? 'shopify'
        : engineHtml.has(d) ? 'html'
        : 'outro',
      ordem: ['html', 'next', 'wp', 'shopify', 'outro'],
      titulos: { html: 'HTML', next: 'Next.js', wp: 'WordPress', shopify: 'Shopify', outro: 'Sem etiqueta' },
    },
  };

  function loadDomainGroup() {
    const g = localStorage.getItem('qmix_domain_group');
    if (g && GRUPOS[g]) domainGroup = g;
  }

  // Divide a lista em blocos na ordem definida. Grupo vazio não aparece.
  function agruparDominios(domains) {
    const g = GRUPOS[domainGroup];
    if (!g || !g.chave) return [{ titulo: null, domains }];
    const baldes = {};
    for (const d of domains) {
      const k = g.chave(d);
      (baldes[k] = baldes[k] || []).push(d);
    }
    return g.ordem
      .filter(k => baldes[k] && baldes[k].length)
      .map(k => ({ titulo: g.titulos[k], chave: k, domains: baldes[k] }));
  }

  function renderGroupBar(filter) {
    const bar = $('#domain-group-bar');
    if (!bar) return;
    bar.innerHTML = Object.entries(GRUPOS).map(([k, g]) =>
      `<button type="button" class="group-chip${k === domainGroup ? ' is-active' : ''}"
         data-group="${k}" aria-pressed="${k === domainGroup}">${g.label}</button>`).join('');
    bar.querySelectorAll('[data-group]').forEach(b => b.addEventListener('click', () => {
      if (domainGroup === b.dataset.group) return;
      domainGroup = b.dataset.group;
      localStorage.setItem('qmix_domain_group', domainGroup);
      renderDomains(filter);
    }));
  }

  function renderDomains(filter = '') {
    const cat = data.categories[currentCategory];
    const list = $('#domain-list');
    list.innerHTML = '';

    let domains = filter
      ? cat.domains.filter((d) => d.toLowerCase().includes(filter.toLowerCase()))
      : [...cat.domains];

    domains = sortDomains(domains, currentCategory);

    // Cabeçalho com contagem total da categoria
    const totalInCat = cat.domains.length;
    const shown = domains.length;
    const header = document.createElement('div');
    header.className = 'domain-list-header';
    header.innerHTML = filter
      ? `<span class="list-count">${shown} de ${totalInCat}</span>`
      : `<span class="list-count">${totalInCat} domínio${totalInCat !== 1 ? 's' : ''}</span>`;
    list.appendChild(header);

    const bar = document.createElement('div');
    bar.className = 'domain-group-bar';
    bar.id = 'domain-group-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Agrupar domínios');
    list.appendChild(bar);
    renderGroupBar(filter);

    // Numeração contínua: o número segue sendo a posição na categoria
    let idx = -1;
    for (const bloco of agruparDominios(domains)) {
      if (bloco.titulo) {
        const h = document.createElement('div');
        h.className = 'group-head' + (bloco.chave ? ' g-' + bloco.chave : '');
        h.innerHTML = `<span class="gh-nome">${bloco.titulo}</span><span class="gh-cont">${bloco.domains.length}</span>`;
        list.appendChild(h);
      }
      bloco.domains.forEach((domain) => {
      idx++;
      const fav = isFavorite(currentCategory, domain);
      const badge = getStatusBadge(domain);
      const card = document.createElement('div');
      card.className = 'domain-card animate-in' + (fav ? ' is-favorite' : '');
      const htmlBadge = engineBadge(domain);
      card.innerHTML = `
        <span class="domain-number">${idx + 1}</span>
        <button class="btn-star ${fav ? 'active' : ''}" aria-label="Favoritar ${domain}">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="${fav ? 'currentColor' : 'none'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <span class="status-dot dot-${badge.class}" title="${badge.text}"></span>
        ${htmlBadge}
        <a class="domain-link" href="${detailUrl(domain)}" target="_blank" rel="noopener"
           title="Abrir a página de ${domain} em nova aba">
          <span class="domain-name">${domain}</span>
        </a>
        <a class="domain-live" href="https://${encodeURI(domain)}" target="_blank" rel="noopener noreferrer"
           title="Abrir ${domain} ao vivo" aria-label="Abrir o site ${domain} ao vivo">
          <span class="dl-pill"><span class="dl-txt">AO VIVO</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
        </a>
        <svg class="domain-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      `;

      // O nome abre a página do domínio em nova aba; o resto do card
      // navega pro detalhe na própria aba
      card.querySelectorAll('.domain-link, .domain-live')
        .forEach(a => a.addEventListener('click', e => e.stopPropagation()));

      const starBtn = card.querySelector('.btn-star');
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
        showConfirm(`${action}?\n${domain}`, () => {
          toggleFavorite(currentCategory, domain);
          renderDomains(filter);
        });
      });

      card.addEventListener('click', () => navigate('detail', currentCategory, domain));
      list.appendChild(card);
      });
    }

    if (domains.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>${filter ? 'Nenhum domínio encontrado para essa busca.' : 'Nenhum domínio nesta categoria.<br>Adicione no <strong>domains.json</strong>'}</p>
        </div>
      `;
    }
  }

  function filterDomains(query) {
    renderDomains(query);
  }

  function fmtNum(n) {
    if (n === undefined || n === null) return '—';
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (a >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(Math.round(n));
  }

  // Quantos dias a janela do GSC cobre. Datas vêm como 'AAAA-MM-DD';
  // interpreta em UTC para o horário de verão não tirar/dar um dia.
  function periodDays(period) {
    if (!period || !period.start || !period.end) return null;
    const a = Date.parse(period.start + 'T00:00:00Z');
    const b = Date.parse(period.end + 'T00:00:00Z');
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    return Math.round((b - a) / 86400000) || null;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // ===================== VISÃO GERAL DA CATEGORIA =====================
  // Série diária vinda do GSC (gsc.series), agregada por categoria.
  // Um gráfico por vez, uma métrica por vez: nunca dois eixos y no mesmo plot.

  const REPORT_PERIODS = [
    { d: 7,   label: '7 dias' },
    { d: 28,  label: '28 dias' },
    { d: 90,  label: '3 meses' },
    { d: 180, label: '6 meses' },
    { d: 365, label: '12 meses' },
  ];

  const REPORT_METRICS = {
    clicks:      { label: 'Cliques',    fmt: v => fmtNum(v),                    melhor: 'maior' },
    impressions: { label: 'Impressões', fmt: v => fmtNum(v),                    melhor: 'maior' },
    ctr:         { label: 'CTR',        fmt: v => (v * 100).toFixed(1) + '%',   melhor: 'maior' },
    position:    { label: 'Posição',    fmt: v => v ? v.toFixed(1) : '—',       melhor: 'menor' },
  };

  let overviewPeriod = 28;
  let overviewMetric = 'clicks';

  function loadOverviewPrefs() {
    const sub = localStorage.getItem('qmix_report_subview');
    if (sub === 'overview' || sub === 'domains') reportSubview = sub;
    try {
      const s = JSON.parse(localStorage.getItem('qmix_overview') || 'null');
      if (s && REPORT_PERIODS.some(p => p.d === s.period)) overviewPeriod = s.period;
      if (s && REPORT_METRICS[s.metric]) overviewMetric = s.metric;
    } catch {
      /* mantém o padrão */
    }
  }

  function saveOverviewPrefs() {
    localStorage.setItem('qmix_overview', JSON.stringify({ period: overviewPeriod, metric: overviewMetric }));
  }

  const DIA_MS = 86400000;
  const isoParaMs = iso => Date.parse(iso + 'T00:00:00Z');
  const msParaIso = ms => new Date(ms).toISOString().slice(0, 10);

  function seriesDaCategoria(cat) {
    const s = gscData && gscData.series;
    if (!s || !s.categories || !s.categories[cat]) return null;
    const arr = s.categories[cat];
    // O GSC atrasa 2 a 3 dias; ancorar no ultimo dia COM dado evita que o
    // periodo comece com dias vazios e falseie a comparacao.
    const fim = Math.round((isoParaMs(s.last_data || s.end) - isoParaMs(s.start)) / DIA_MS);
    return { meta: s, arr, fim: Math.min(fim, arr.c.length - 1) };
  }

  // Totais de um intervalo fechado de índices. Posição sai ponderada por
  // impressão, que é como o próprio GSC calcula a média do período.
  function totaisIntervalo(arr, a, b) {
    let c = 0, i = 0, p = 0;
    for (let k = Math.max(0, a); k <= b && k < arr.c.length; k++) {
      c += arr.c[k] || 0;
      i += arr.i[k] || 0;
      p += arr.p[k] || 0;
    }
    return { clicks: c, impressions: i, ctr: i ? c / i : 0, position: i ? p / i : 0 };
  }

  // Agrupa em baldes para o gráfico não virar serrilhado em períodos longos
  function baldes(arr, meta, a, b) {
    const n = b - a + 1;
    const tam = n <= 31 ? 1 : n <= 120 ? 7 : 30;
    const out = [];
    for (let ini = a; ini <= b; ini += tam) {
      const fim = Math.min(ini + tam - 1, b);
      const t = totaisIntervalo(arr, ini, fim);
      out.push({
        de: msParaIso(isoParaMs(meta.start) + Math.max(0, ini) * DIA_MS),
        ate: msParaIso(isoParaMs(meta.start) + fim * DIA_MS),
        dias: fim - Math.max(0, ini) + 1,
        ...t,
      });
    }
    return { pontos: out, tam };
  }

  function valorDaMetrica(p, metric) {
    return metric === 'ctr' ? p.ctr : metric === 'position' ? p.position : p[metric];
  }

  function variacao(atual, anterior) {
    if (!anterior) return null;
    return (atual - anterior) / anterior;
  }

  const dataCurta = iso => {
    const [a, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  function renderReportOverview(container, cat) {
    const s = seriesDaCategoria(cat);
    if (!s) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><polyline points="19 9 13 15 9 11 5 15"/></svg>
          <p>Série histórica ainda não coletada.<br>Toque em atualizar para gerar os dados do Search Console.</p>
        </div>`;
      return;
    }

    const { meta, arr, fim } = s;
    const n = overviewPeriod;
    const a = fim - n + 1;
    const atual = totaisIntervalo(arr, a, fim);
    const anterior = totaisIntervalo(arr, a - n, a - 1);
    const temAnterior = anterior.impressions > 0;

    const chips = REPORT_PERIODS.map(p =>
      `<button type="button" class="ov-chip${p.d === overviewPeriod ? ' is-active' : ''}" data-per="${p.d}" aria-pressed="${p.d === overviewPeriod}">${p.label}</button>`
    ).join('');

    const tiles = Object.entries(REPORT_METRICS).map(([k, m]) => {
      const v = valorDaMetrica(atual, k);
      const va = valorDaMetrica(anterior, k);
      const dif = temAnterior ? variacao(v, va) : null;
      let cls = 'neutro', seta = '', txt = 'sem base anterior';
      if (dif !== null && isFinite(dif)) {
        const subiu = dif > 0;
        // Em posição, número menor é melhor — a cor segue o que é bom, não o sinal
        const bom = m.melhor === 'maior' ? subiu : !subiu;
        const estavel = Math.abs(dif) < 0.005;
        cls = estavel ? 'neutro' : bom ? 'bom' : 'ruim';
        seta = estavel ? '' : subiu ? '▲' : '▼';
        txt = estavel ? 'estável' : (dif > 0 ? '+' : '') + (dif * 100).toFixed(1) + '%';
      }
      return `
        <div class="ov-tile${k === overviewMetric ? ' is-sel' : ''}">
          <div class="ov-t-label">${m.label}</div>
          <div class="ov-t-value">${m.fmt(v)}</div>
          <div class="ov-t-delta ${cls}">${seta} ${txt}</div>
        </div>`;
    }).join('');

    const metricChips = Object.entries(REPORT_METRICS).map(([k, m]) =>
      `<button type="button" class="ov-chip${k === overviewMetric ? ' is-active' : ''}" data-met="${k}" aria-pressed="${k === overviewMetric}">${m.label}</button>`
    ).join('');

    const de = msParaIso(isoParaMs(meta.start) + Math.max(0, a) * DIA_MS);
    const ate = meta.last_data || meta.end;

    container.innerHTML = `
      <div class="ov-head animate-in">
        <div class="ov-title">${esc(cat)}</div>
        <div class="ov-sub">${de} → ${ate} · comparado com os ${n} dias anteriores</div>
      </div>

      <div class="ov-chips" role="group" aria-label="Período">${chips}</div>

      <div class="ov-tiles animate-in">${tiles}</div>

      <div class="ov-chart-card animate-in">
        <div class="ov-chart-head">
          <span class="ov-chart-title">Evolução de ${REPORT_METRICS[overviewMetric].label}</span>
          ${overviewMetric === 'position' ? '<span class="ov-chart-nota">eixo invertido: mais alto é melhor</span>' : ''}
        </div>
        <div class="ov-chips ov-chips-metric" role="group" aria-label="Métrica do gráfico">${metricChips}</div>
        <div class="ov-chart" id="ov-chart"></div>
      </div>

      <details class="ov-table-wrap">
        <summary>Ver os números em tabela</summary>
        <div class="ov-table-scroll" id="ov-table"></div>
      </details>
    `;

    container.querySelectorAll('[data-per]').forEach(b => b.addEventListener('click', () => {
      overviewPeriod = Number(b.dataset.per);
      saveOverviewPrefs();
      renderReports();
    }));
    container.querySelectorAll('[data-met]').forEach(b => b.addEventListener('click', () => {
      overviewMetric = b.dataset.met;
      saveOverviewPrefs();
      renderReports();
    }));

    const dados = baldes(arr, meta, a, fim);
    desenharGrafico($('#ov-chart'), dados, overviewMetric);
    montarTabela($('#ov-table'), dados);
  }

  function montarTabela(box, dados) {
    if (!box) return;
    const linhas = dados.pontos.map(p => `
      <tr>
        <td>${p.dias > 1 ? dataCurta(p.de) + '–' + dataCurta(p.ate) : dataCurta(p.de)}</td>
        <td>${fmtNum(p.clicks)}</td>
        <td>${fmtNum(p.impressions)}</td>
        <td>${(p.ctr * 100).toFixed(1)}%</td>
        <td>${p.position ? p.position.toFixed(1) : '—'}</td>
      </tr>`).join('');
    box.innerHTML = `
      <table class="ov-table">
        <caption class="sr-only">Cliques, impressões, CTR e posição média por período</caption>
        <thead><tr><th scope="col">Período</th><th scope="col">Cliques</th><th scope="col">Impressões</th><th scope="col">CTR</th><th scope="col">Posição</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>`;
  }

  // ---- Gráfico de linha, uma métrica por vez (nunca dois eixos y) ----
  // Cor da série: #25b06a, validada para a superfície escura do app
  // (banda de luminosidade, croma e contraste >= 3:1).

  const CH = { padL: 44, padR: 14, padT: 14, padB: 26, alt: 190 };

  function niceTicks(min, max, alvo) {
    if (max === min) { max = min + 1; }
    const bruto = (max - min) / alvo;
    const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
    const passo = [1, 2, 2.5, 5, 10].map(m => m * mag).find(p => p >= bruto) || 10 * mag;
    const ini = Math.floor(min / passo) * passo;
    const out = [];
    for (let v = ini; v <= max + passo * 0.001; v += passo) out.push(v);
    return out;
  }

  function desenharGrafico(box, dados, metric) {
    if (!box) return;
    const m = REPORT_METRICS[metric];
    const pts = dados.pontos;
    if (!pts.length) { box.innerHTML = '<div class="ov-vazio">Sem dados no período.</div>'; return; }

    const L = box.clientWidth || 320;
    const A = CH.alt;
    const x0 = CH.padL, x1 = L - CH.padR, y0 = CH.padT, y1 = A - CH.padB;
    const larg = Math.max(1, x1 - x0), altu = Math.max(1, y1 - y0);

    const vals = pts.map(p => valorDaMetrica(p, metric));
    const inverso = metric === 'position';           // posição menor é melhor
    let vmin = Math.min(...vals), vmax = Math.max(...vals);
    if (metric === 'position') { vmin = Math.max(0, vmin - 1); vmax = vmax + 1; }
    else { vmin = 0; }
    if (vmax === vmin) vmax = vmin + 1;

    const ticks = niceTicks(vmin, vmax, 4);
    const lo = Math.min(vmin, ticks[0]);
    const hi = Math.max(vmax, ticks[ticks.length - 1]);

    const px = k => pts.length === 1 ? x0 + larg / 2 : x0 + (k / (pts.length - 1)) * larg;
    const py = v => {
      const t = (v - lo) / (hi - lo);
      return inverso ? y0 + t * altu : y1 - t * altu;
    };

    const linha = vals.map((v, k) => `${k ? 'L' : 'M'}${px(k).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    const area = `${linha} L${px(vals.length - 1).toFixed(1)},${y1} L${px(0).toFixed(1)},${y1} Z`;

    const grade = ticks.map(t => {
      const y = py(t).toFixed(1);
      return `<line class="ov-grid" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>
              <text class="ov-tick" x="${x0 - 8}" y="${y}" text-anchor="end" dominant-baseline="middle">${m.fmt(t)}</text>`;
    }).join('');

    // No máximo 4 rótulos no eixo x, para não colidirem no celular
    const passoX = Math.max(1, Math.ceil(pts.length / 4));
    const eixoX = pts.map((p, k) => (k % passoX === 0 || k === pts.length - 1)
      ? `<text class="ov-tick" x="${px(k).toFixed(1)}" y="${A - 8}" text-anchor="${k === 0 ? 'start' : k === pts.length - 1 ? 'end' : 'middle'}">${dataCurta(p.de)}</text>`
      : '').join('');

    // Rótulo direto só no último ponto — nunca um número em cada ponto
    const ultimo = vals.length - 1;
    const lx = px(ultimo), ly = py(vals[ultimo]);

    box.innerHTML = `
      <svg class="ov-svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}" role="img"
           aria-label="Evolução de ${m.label}: ${m.fmt(vals[0])} em ${dataCurta(pts[0].de)} a ${m.fmt(vals[ultimo])} em ${dataCurta(pts[ultimo].de)}">
        <defs>
          <linearGradient id="ovFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#25b06a" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#25b06a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grade}
        ${eixoX}
        ${inverso ? '' : `<path d="${area}" fill="url(#ovFill)"/>`}
        <path class="ov-line" d="${linha}"/>
        <circle class="ov-fim" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4"/>
        <g class="ov-hover" style="display:none">
          <line class="ov-cross" y1="${y0}" y2="${y1}"/>
          <circle class="ov-dot" r="5"/>
        </g>
        <rect class="ov-captura" x="${x0}" y="${y0}" width="${larg}" height="${altu}" fill="transparent"/>
      </svg>
      <div class="ov-tip" hidden></div>
    `;

    const svg = box.querySelector('svg');
    const hov = box.querySelector('.ov-hover');
    const cross = box.querySelector('.ov-cross');
    const dot = box.querySelector('.ov-dot');
    const tip = box.querySelector('.ov-tip');

    function mover(ev) {
      const r = svg.getBoundingClientRect();
      const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      const k = pts.length === 1 ? 0
        : Math.max(0, Math.min(pts.length - 1, Math.round(((cx - x0) / larg) * (pts.length - 1))));
      const p = pts[k], vx = px(k), vy = py(valorDaMetrica(p, metric));
      hov.style.display = '';
      cross.setAttribute('x1', vx); cross.setAttribute('x2', vx);
      dot.setAttribute('cx', vx); dot.setAttribute('cy', vy);
      tip.hidden = false;
      // O ultimo balde costuma ter menos dias que os demais; sem avisar, a
      // ponta do grafico parece uma queda real em vez de periodo incompleto.
      const parcial = dados.tam > 1 && p.dias < dados.tam;
      tip.innerHTML = `<strong>${p.dias > 1 ? dataCurta(p.de) + ' – ' + dataCurta(p.ate) : dataCurta(p.de)}`
        + `${parcial ? ` <em>(${p.dias} de ${dados.tam} dias)</em>` : ''}</strong>`
        + `<span>${fmtNum(p.clicks)} cliques</span>`
        + `<span>${fmtNum(p.impressions)} impressões</span>`
        + `<span>CTR ${(p.ctr * 100).toFixed(1)}%</span>`
        + `<span>Posição ${p.position ? p.position.toFixed(1) : '—'}</span>`;
      const tw = tip.offsetWidth || 150;
      tip.style.left = Math.max(4, Math.min(L - tw - 4, vx - tw / 2)) + 'px';
      tip.style.top = Math.max(0, vy - tip.offsetHeight - 12) + 'px';
    }
    function sair() { hov.style.display = 'none'; tip.hidden = true; }

    const alvo = box.querySelector('.ov-captura');
    alvo.addEventListener('mousemove', mover);
    alvo.addEventListener('mouseleave', sair);
    alvo.addEventListener('touchstart', mover, { passive: true });
    alvo.addEventListener('touchmove', mover, { passive: true });
    alvo.addEventListener('touchend', sair);
  }

  // Redesenha ao girar a tela / redimensionar (o SVG é medido em pixels)
  let ovResizeTimer = null;
  window.addEventListener('resize', () => {
    if (currentTab !== 'reports' || !currentReportCategory || reportSubview !== 'overview') return;
    clearTimeout(ovResizeTimer);
    ovResizeTimer = setTimeout(renderReports, 200);
  });


  // Variação de cliques contra o período anterior de mesmo tamanho.
  // Verde para cima, vermelho para baixo, "=" quando não mudou.
  // Sem base de comparação (domínio novo no GSC) não mostra nada — zero e
  // "não dá para saber" são coisas diferentes.
  function renderDelta(atual, anterior) {
    if (anterior === undefined || anterior === null) return '';
    const d = Math.round(atual || 0) - Math.round(anterior || 0);
    if (d === 0) {
      return `<span class="rd-delta igual" title="sem alteração no período">=</span>`;
    }
    const cls = d > 0 ? 'sobe' : 'desce';
    const seta = d > 0 ? '▲' : '▼';
    const sinal = d > 0 ? '+' : '-';
    const titulo = `${d > 0 ? 'subiu' : 'caiu'} ${Math.abs(d)} clique${Math.abs(d) === 1 ? '' : 's'} contra o período anterior`;
    return `<span class="rd-delta ${cls}" title="${titulo}">${seta}${sinal}${fmtNum(Math.abs(d))}</span>`;
  }

  function renderReports() {
    const container = $('#view-reports');

    if (!gscData) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Dados do Google Search Console ainda não coletados.<br>Aguarde a primeira execução do cron (segunda-feira 5h).</p>
        </div>
      `;
      return;
    }

    // View 1: home dos relatórios — cards por categoria
    if (!currentReportCategory) {
      const catStats = {};
      for (const cat of data.categories) {
        catStats[cat.name] = { clicks: 0, impressions: 0, count: 0, authorized: 0 };
      }
      for (const [domain, info] of Object.entries(gscData.domains)) {
        if (!catStats[info.category]) continue;
        catStats[info.category].count++;
        if (info.authorized && !info.error) {
          catStats[info.category].authorized++;
          catStats[info.category].clicks += info.clicks || 0;
          catStats[info.category].impressions += info.impressions || 0;
        }
      }

      const fetchedDate = new Date(gscData.fetched_at).toLocaleDateString('pt-BR');
      const period = `${gscData.period.start} → ${gscData.period.end}`;
      // Rótulo derivado do próprio período — se a janela do coletor mudar,
      // o texto acompanha sem precisar de edição aqui.
      const days = periodDays(gscData.period);
      const daysLabel = days ? `Últimos ${days} dias · ` : '';

      container.innerHTML = `
        <div class="reports-header animate-in">
          <div class="reports-title">Google Search Console</div>
          <div class="reports-period">${daysLabel}${period}</div>
          <div class="reports-fetched">Atualizado em ${fetchedDate}</div>
        </div>

        <div class="reports-summary animate-in">
          <div class="summary-item">
            <div class="summary-value">${gscData.stats.authorized}</div>
            <div class="summary-label">com GSC</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${gscData.stats.unauthorized}</div>
            <div class="summary-label">sem acesso</div>
          </div>
        </div>

        <div class="section-title">Por Categoria</div>
        <div class="report-cat-list" id="report-cat-list"></div>
      `;

      const list = $('#report-cat-list');
      for (const cat of data.categories) {
        const s = catStats[cat.name];
        const card = document.createElement('div');
        card.className = 'report-cat-card animate-in';
        card.innerHTML = `
          <div class="report-cat-name">${cat.name}</div>
          <div class="report-cat-stats">
            <div class="rc-stat">
              <span class="rc-value">${fmtNum(s.clicks)}</span>
              <span class="rc-label">cliques</span>
            </div>
            <div class="rc-stat">
              <span class="rc-value">${fmtNum(s.impressions)}</span>
              <span class="rc-label">impressões</span>
            </div>
            <div class="rc-stat">
              <span class="rc-value">${s.authorized}/${s.count}</span>
              <span class="rc-label">com GSC</span>
            </div>
          </div>
          <svg class="report-cat-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        `;
        card.addEventListener('click', () => {
          currentReportCategory = cat.name;
          history.pushState({ view: 'reports', tab: 'reports', reportCat: cat.name }, '');
          render();
        });
        list.appendChild(card);
      }
      return;
    }

    // View 2: a categoria tem duas abas — o resumo com grafico e a lista
    const abas = `
      <div class="ov-tabs" role="tablist" aria-label="Visão da categoria">
        <button type="button" class="ov-tab${reportSubview === 'overview' ? ' is-active' : ''}"
                data-sub="overview" role="tab" aria-selected="${reportSubview === 'overview'}">Visão geral</button>
        <button type="button" class="ov-tab${reportSubview === 'domains' ? ' is-active' : ''}"
                data-sub="domains" role="tab" aria-selected="${reportSubview === 'domains'}">Domínios</button>
      </div>`;

    const ligarAbas = () => container.querySelectorAll('[data-sub]').forEach(b =>
      b.addEventListener('click', () => {
        if (reportSubview === b.dataset.sub) return;
        reportSubview = b.dataset.sub;
        localStorage.setItem('qmix_report_subview', reportSubview);
        renderReports();
      }));

    if (reportSubview === 'overview') {
      container.innerHTML = abas + '<div id="ov-body"></div>';
      ligarAbas();
      renderReportOverview($('#ov-body'), currentReportCategory);
      return;
    }

    // Lista de domínios da categoria, na ordenação escolhida.
    // Cada card começa fechado e expande no clique (accordion).
    const domainsInCat = sortReportDomains(
      Object.entries(gscData.domains).filter(([, info]) => info.category === currentReportCategory)
    );

    container.innerHTML = abas + `
      <div class="report-sort-bar" id="report-sort-bar" role="group" aria-label="Ordenar domínios"></div>
      <div class="report-domain-list" id="report-domain-list"></div>
    `;
    ligarAbas();
    renderReportSortBar();
    const list = $('#report-domain-list');

    let counter = 0;
    for (const [domain, info] of domainsInCat) {
      counter++;
      const card = document.createElement('div');
      card.className = 'report-dom-card animate-in';

      // Sem GSC ou com erro: não há o que expandir, fica só a linha
      if (!info.authorized || info.error) {
        card.classList.add('is-static');
        card.innerHTML = `
          <div class="rd-header">
            <span class="rd-num">${counter}</span>
            <span class="rd-name">${esc(domain)}</span>
            <span class="rd-badge no-gsc">${info.authorized ? 'erro' : 'sem GSC'}</span>
          </div>
        `;
        list.appendChild(card);
        continue;
      }

      const posStr = info.position ? info.position.toFixed(1) : '—';
      const ctrStr = info.ctr ? (info.ctr * 100).toFixed(1) + '%' : '—';
      const deltaCliques = renderDelta(info.clicks, info.prev && info.prev.clicks);
      const bodyId = `rd-body-${currentReportCategory.replace(/\W+/g, '')}-${counter}`;

      // Ordenando por CTR ou posição, mostra o valor já no card fechado —
      // senão a ordem parece aleatória com o card fechado.
      const peekExtra = reportSort.key === 'ctr' ? ` · ${ctrStr}`
        : reportSort.key === 'position' ? ` · ${posStr}#`
        : '';

      let extras = '';
      if (info.topQueries && info.topQueries.length > 0) {
        extras += `<div class="rd-queries"><div class="rd-sub">Top consultas</div>` +
          info.topQueries.map(q => `
            <div class="rd-q">
              <span class="rd-q-txt">${esc(q.q)}</span>
              <span class="rd-q-num">${fmtNum(q.clicks)}👆 ${fmtNum(q.impressions)}👁 ${q.position ? q.position.toFixed(1) : '—'}#</span>
            </div>`).join('') + `</div>`;
      }
      if (info.topPages && info.topPages.length > 0) {
        extras += `<div class="rd-queries"><div class="rd-sub">Top páginas</div>` +
          info.topPages.map(p => `
            <div class="rd-q">
              <span class="rd-q-txt">${esc(shortPath(p.url))}</span>
              <span class="rd-q-num">${fmtNum(p.clicks)}👆 ${fmtNum(p.impressions)}👁 ${p.position ? p.position.toFixed(1) : '—'}#</span>
            </div>`).join('') + `</div>`;
      }

      card.innerHTML = `
        <button type="button" class="rd-header" aria-expanded="false" aria-controls="${bodyId}">
          <span class="rd-num">${counter}</span>
          <span class="rd-name">${esc(domain)}</span>
          <span class="rd-peek">${fmtNum(info.clicks)}👆${deltaCliques} · ${fmtNum(info.impressions)}👁${peekExtra}</span>
          <svg class="rd-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="rd-body" id="${bodyId}">
          <div class="rd-body-inner">
            <div class="rd-metrics">
              <div class="rd-metric">
                <div class="rd-m-value">${fmtNum(info.clicks)}</div>
                <div class="rd-m-label">Cliques</div>
                ${deltaCliques ? `<div class="rd-m-delta">${deltaCliques}</div>` : ''}
              </div>
              <div class="rd-metric">
                <div class="rd-m-value">${fmtNum(info.impressions)}</div>
                <div class="rd-m-label">Impressões</div>
              </div>
              <div class="rd-metric">
                <div class="rd-m-value">${ctrStr}</div>
                <div class="rd-m-label">CTR</div>
              </div>
              <div class="rd-metric">
                <div class="rd-m-value">${posStr}</div>
                <div class="rd-m-label">Posição</div>
              </div>
            </div>
            ${extras}
          </div>
        </div>
      `;

      const btn = card.querySelector('.rd-header');
      btn.addEventListener('click', () => {
        const open = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      list.appendChild(card);
    }
  }

  // https://dominio.com.br/algum/caminho/ → /algum/caminho/
  function shortPath(url) {
    try {
      const u = new URL(url);
      return u.pathname === '/' ? u.hostname : u.pathname + u.search;
    } catch {
      return url;
    }
  }

  function renderAlerts() {
    const alertsBox = $('#alerts-section');
    if (!alertsBox) return;

    const problems = [];
    data.categories.forEach((cat, idx) => {
      cat.domains.forEach(d => {
        const s = domainStatus[d];
        if (s && s.last_check && !s.has_recent_indexing) {
          problems.push({ domain: d, categoryIdx: idx, category: cat.name });
        }
      });
    });

    if (problems.length === 0) {
      alertsBox.style.display = 'none';
      return;
    }

    alertsBox.style.display = '';
    const list = problems.slice(0, 5).map(p => `
      <div class="alert-item" data-cat="${p.categoryIdx}" data-domain="${p.domain}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="alert-info">
          <div class="alert-domain">${p.domain}</div>
          <div class="alert-cat">${p.category}</div>
        </div>
      </div>
    `).join('');

    alertsBox.innerHTML = `
      <div class="alert-header">
        <span class="alert-title">⚠ Sem indexação 7 dias</span>
        <span class="alert-count">${problems.length}</span>
      </div>
      <div class="alert-list">${list}</div>
      ${problems.length > 5 ? `<div class="alert-more">+ ${problems.length - 5} domínios</div>` : ''}
    `;

    alertsBox.querySelectorAll('.alert-item').forEach(el => {
      el.addEventListener('click', () => {
        const catIdx = parseInt(el.dataset.cat);
        const domain = el.dataset.domain;
        currentCategory = catIdx;
        navigate('detail', catIdx, domain);
      });
    });
  }

  // ==================== REFRESH MANUAL ====================

  function showToast(message, type = 'info', duration = 4000, withSpinner = false) {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    if (withSpinner) {
      toast.innerHTML = `<div class="toast-spinner"></div><span>${message}</span>`;
    } else {
      toast.textContent = message;
    }
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 250);
      }, duration);
    }
    return toast;
  }

  function handleRefreshClick() {
    showActionSheet('Atualizar dados', [
      {
        label: 'Atualizar Relatórios',
        sub: 'Google Search Console · grátis · ~1 min',
        icon: 'chart',
        color: 'primary',
        action: () => startRefresh('gsc', 'Coletando relatórios...'),
      },
      {
        label: 'Atualizar Indexação',
        sub: 'Serper API · consome créditos · ~4 min',
        icon: 'warning',
        color: 'warning',
        action: () => showConfirm(
          'Atualizar indexação de todos os domínios?\n\nEssa operação consome ~294 créditos da API Serper (paga).',
          () => startRefresh('full', 'Iniciando verificação...')
        ),
      },
    ]);
  }

  async function startRefresh(kind, initialMsg) {
    const btn = $('#btn-refresh');
    btn.classList.add('spinning');
    const toast = showToast(initialMsg, 'info', 0, true);
    const endpoint = kind === 'gsc' ? '/api/refresh/gsc' : '/api/refresh/full';

    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ACCESS_KEY,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.remove();
          showToast('Já existe uma atualização em andamento', 'info');
          startRefreshPolling(showToast('Aguardando conclusão...', 'info', 0, true));
          return;
        }
        throw new Error(data.error || 'Erro ao iniciar');
      }
      startRefreshPolling(toast);
    } catch (e) {
      btn.classList.remove('spinning');
      if (toast) toast.remove();
      showToast('Erro: ' + e.message, 'error');
    }
  }

  async function checkRefreshStatus() {
    // Ao abrir o app, checa se tem refresh em andamento pra continuar polling
    try {
      const res = await fetch(API_BASE + '/api/refresh-status', { cache: 'no-store' });
      const state = await res.json();
      if (state.status === 'running') {
        const btn = $('#btn-refresh');
        btn.classList.add('spinning');
        const toast = showToast(state.message || 'Atualização em andamento...', 'info', 0, true);
        startRefreshPolling(toast);
      }
    } catch {}
  }

  function startRefreshPolling(progressToast) {
    if (refreshPollTimer) clearInterval(refreshPollTimer);
    let lastMessage = '';
    refreshPollTimer = setInterval(async () => {
      try {
        const res = await fetch(API_BASE + '/api/refresh-status?cb=' + Date.now(), { cache: 'no-store' });
        const state = await res.json();

        // Atualiza texto do toast se mudou
        if (state.message && state.message !== lastMessage && progressToast) {
          const span = progressToast.querySelector('span');
          if (span) span.textContent = state.message;
          lastMessage = state.message;
        }

        if (state.status === 'done') {
          clearInterval(refreshPollTimer);
          refreshPollTimer = null;
          $('#btn-refresh').classList.remove('spinning');
          if (progressToast) {
            progressToast.classList.add('leaving');
            setTimeout(() => progressToast.remove(), 250);
          }
          showToast('✓ Atualização concluída. Recarregando...', 'success', 2000);
          setTimeout(() => window.location.reload(), 2000);
        } else if (state.status === 'error') {
          clearInterval(refreshPollTimer);
          refreshPollTimer = null;
          $('#btn-refresh').classList.remove('spinning');
          if (progressToast) progressToast.remove();
          showToast('Erro na atualização: ' + (state.message || 'desconhecido'), 'error');
        }
      } catch (e) {
        // Continua tentando
      }
    }, 5000);
  }

  function showActionSheet(title, actions) {
    const overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';

    const iconSvgs = {
      chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };

    overlay.innerHTML = `
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">${title}</div>
        <div class="sheet-actions">
          ${actions.map((a, i) => `
            <button class="sheet-btn sheet-btn-${a.color || 'default'}" data-idx="${i}">
              <div class="sheet-btn-icon">${iconSvgs[a.icon] || ''}</div>
              <div class="sheet-btn-text">
                <div class="sheet-btn-label">${a.label}</div>
                <div class="sheet-btn-sub">${a.sub || ''}</div>
              </div>
            </button>
          `).join('')}
        </div>
        <button class="sheet-cancel">Cancelar</button>
      </div>
    `;

    function close() {
      overlay.classList.add('leaving');
      setTimeout(() => overlay.remove(), 250);
    }

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.sheet-cancel').addEventListener('click', close);
    overlay.querySelectorAll('.sheet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        close();
        setTimeout(() => actions[idx].action(), 150);
      });
    });

    document.body.appendChild(overlay);
  }

  function showConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <p class="confirm-msg">${message.replace(/\n/g, '<br>')}</p>
        <div class="confirm-actions">
          <button class="confirm-btn cancel">Cancelar</button>
          <button class="confirm-btn ok">Confirmar</button>
        </div>
      </div>
    `;

    overlay.querySelector('.cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.ok').addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  function renderDetail() {
    const container = $('#view-detail');
    const catName = data.categories[currentCategory].name;
    const fav = isFavorite(currentCategory, currentDomain);
    const badge = getStatusBadge(currentDomain);
    const s = domainStatus[currentDomain] || {};
    const lastCheckDays = daysSince(s.last_check);
    const lastCheckLabel = lastCheckDays === null ? 'nunca'
      : lastCheckDays === 0 ? 'hoje'
      : lastCheckDays === 1 ? 'ontem'
      : `há ${lastCheckDays} dias`;

    container.innerHTML = `
      <div class="detail-header-row animate-in">
        <div class="detail-domain-name">
          <span class="status-dot dot-${badge.class} dot-large" title="${badge.text}"></span>
          ${currentDomain}
        </div>
        <button class="btn-star-detail ${fav ? 'active' : ''}" id="detail-star" aria-label="Favoritar">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="${fav ? 'currentColor' : 'none'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      </div>
      <div class="detail-status animate-in">${badge.text}</div>
      <div class="detail-badges-row animate-in">
        <span class="detail-category-badge">${catName}</span>
        ${engineBadge(currentDomain, 'detail-engine')}
      </div>

      <a class="detail-visit animate-in" href="https://${encodeURI(currentDomain)}"
         target="_blank" rel="noopener noreferrer">
        <svg class="dv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>
        <span class="dv-label">Abrir site ao vivo</span>
        <svg class="dv-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>

      <div class="detail-info-grid animate-in">
        <div class="detail-info-item">
          <div class="detail-info-label">Última verificação</div>
          <div class="detail-info-value">${lastCheckLabel}</div>
        </div>
        <div class="detail-info-item">
          <div class="detail-info-label">Indexação 7 dias</div>
          <div class="detail-info-value">${s.has_recent_indexing ? 'Sim' : 'Não'}</div>
        </div>
      </div>

      <div class="time-filters-title animate-in">Verificar indexação no Google</div>
      <div class="time-filters" id="time-filters"></div>
    `;

    $('#detail-star').addEventListener('click', () => {
      const action = fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
      showConfirm(`${action}?\n${currentDomain}`, () => {
        toggleFavorite(currentCategory, currentDomain);
        renderDetail();
      });
    });

    const filtersContainer = $('#time-filters');

    TIME_FILTERS.forEach((filter) => {
      const url = buildGoogleUrl(currentDomain, filter.param);
      const btn = document.createElement('a');
      btn.className = 'time-btn animate-in';
      btn.href = url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = `
        <div class="time-btn-label">
          <div class="time-btn-icon">${TIME_ICONS[filter.icon]}</div>
          <span>${filter.label}</span>
        </div>
        <svg class="time-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
      filtersContainer.appendChild(btn);
    });
  }

  function buildGoogleUrl(domain, period) {
    // period: '' (tudo), 'h', 'd', 'w', 'm', 'y'
    let url = `https://www.google.com/search?q=site%3A${encodeURIComponent(domain)}`;
    url += '&gl=br&hl=pt-BR&num=100';
    if (period) {
      // tbs=qdr:X + sbd:1 força ordenação por data
      url += `&tbs=qdr:${period},sbd:1`;
      // as_qdr redundante mas aumenta a chance de o filtro ser respeitado
      url += `&as_qdr=${period}`;
    } else {
      // Sem filtro de tempo — só ordena por data para ver mais recentes primeiro
      url += `&tbs=sbd:1`;
    }
    return url;
  }

  async function registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        // Força verificação de update a cada carregamento
        reg.update();
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível — recarrega
              console.log('Nova versão detectada, recarregando...');
              window.location.reload();
            }
          });
        });
      } catch {
        // SW registration failed silently
      }
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
