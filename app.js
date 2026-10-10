(() => {
  'use strict';

  const DEPARTMENTS = ['RPL', 'TBKR', 'Akuntansi', 'TSM'];
  const DEPARTMENT_LABELS = {
    RPL: 'Rekayasa Perangkat Lunak',
    TBKR: 'Teknik Bodi Kendaraan Ringan',
    Akuntansi: 'Akuntansi',
    TSM: 'Teknik Sepeda Motor'
  };
  const PAGE_SIZE = 30;
  const FAVORITES_KEY = 'sakuarab:favorites:v1';
  const THEME_KEY = 'sakuarab:theme:v1';
  const DISPLAY_KEY = 'sakuarab:display:v1';
  const DEFAULT_SETTINGS = Object.freeze({ arabicSize: 32, font: 'naskh', density: 'comfortable', accent: 'emerald', theme: 'auto' });
  const FONT_STACKS = {
    naskh: '"Noto Naskh Arabic", "Traditional Arabic", serif',
    amiri: '"Amiri", "Noto Naskh Arabic", serif',
    scheherazade: '"Scheherazade New", "Noto Naskh Arabic", serif',
    sans: '"Noto Sans Arabic", "Noto Naskh Arabic", sans-serif',
    system: '"Traditional Arabic", "Times New Roman", serif'
  };
  const FONT_LABELS = { naskh: 'Noto Naskh Arabic', amiri: 'Amiri', scheherazade: 'Scheherazade New', sans: 'Noto Sans Arabic', system: 'Font bawaan perangkat' };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const iconPaths = {
    grid: '<rect x="3.5" y="3.5" width="6.2" height="6.2" rx="1.2"/><rect x="14.3" y="3.5" width="6.2" height="6.2" rx="1.2"/><rect x="3.5" y="14.3" width="6.2" height="6.2" rx="1.2"/><rect x="14.3" y="14.3" width="6.2" height="6.2" rx="1.2"/>',
    bookmark: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z"/>',
    book: '<path d="M12 7v14M12 7C9.5 4.8 6.3 4.3 3 5.5v13c3.3-1.2 6.5-.7 9 1.5M12 7c2.5-2.2 5.7-2.7 9-1.5v13c-3.3-1.2-6.5-.7-9 1.5"/>',
    moon: '<path d="M20.8 14.2A8.5 8.5 0 0 1 9.8 3.2 8.7 8.7 0 1 0 20.8 14.2Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.4 4.4"/>',
    x: '<path d="m18 6-12 12M6 6l12 12"/>',
    layers: '<path d="m12 3 9 4.7-9 4.7-9-4.7L12 3Z"/><path d="m3 12 9 4.7 9-4.7M3 16.3l9 4.7 9-4.7"/>',
    sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/>',
    message: '<path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 21 11.5Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/>',
    building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>'
  };

  function icon(name, className = '') {
    const paths = iconPaths[name] || iconPaths.book;
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
  }

  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach((node) => {
      const name = node.dataset.icon;
      node.innerHTML = icon(name);
    });
  }

  const state = {
    entries: [],
    filtered: [],
    department: 'Semua',
    query: '',
    favoritesOnly: false,
    favorites: new Set(),
    visibleCount: PAGE_SIZE,
    activeEntry: null,
    previousFocus: null,
    toastTimer: null,
    isLoaded: false,
    settings: { ...DEFAULT_SETTINGS },
    previousSettingsFocus: null,
    settingsPreviousOverflow: ''
  };

  const els = {
    grid: $('#word-grid'), loading: $('#loading-state'), error: $('#error-state'), empty: $('#empty-state'),
    errorMessage: $('#error-message'), search: $('#search-input'), clearSearch: $('#clear-search'),
    resultTotal: $('#result-total'), totalWords: $('#total-words'), activeDescription: $('#active-description'),
    favoritesToggle: $('#favorites-toggle'), savedShortcut: $('#saved-shortcut'), savedCount: $('#saved-count'),
    metaSaved: $('#meta-saved'), activeFilters: $('#active-filters'), filterSummary: $('#filter-summary'),
    resetFilters: $('#reset-filters'), emptyTitle: $('#empty-title'), emptyMessage: $('#empty-message'),
    loadMoreWrap: $('#load-more-wrap'), loadMore: $('#load-more'), shownCount: $('#shown-count'),
    modal: $('#word-modal'), modalClose: $('#modal-close'), modalDone: $('#modal-done'), modalFavorite: $('#modal-favorite'),
    modalCategory: $('#modal-category'), modalTitle: $('#modal-title'), modalMeaning: $('#modal-meaning'),
    modalTransliteration: $('#modal-transliteration'), modalExampleArabic: $('#modal-example-arabic'),
    modalExampleTranslation: $('#modal-example-translation'), modalDepartment: $('#modal-department'),
    themeToggle: $('#theme-toggle'), toast: $('#toast'),
    settingsToggle: $('#settings-toggle'), settingsModal: $('#settings-modal'), settingsDialog: $('.settings-dialog'),
    settingsClose: $('#settings-close'), settingsDone: $('#settings-done'), settingsReset: $('#settings-reset'),
    arabicSize: $('#setting-arabic-size'), arabicSizeOutput: $('#setting-arabic-size-output'),
    arabicFont: $('#setting-arabic-font'), accent: $('#setting-accent'), theme: $('#setting-theme'),
    fontPreview: $('#font-preview-arabic'), fontPreviewName: $('#font-preview-name')
  };

  function loadFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      state.favorites = new Set(Array.isArray(stored) ? stored.filter((value) => typeof value === 'string') : []);
    } catch (error) {
      state.favorites = new Set();
      showToast('Penyimpanan lokal tidak tersedia di browser ini.');
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
    } catch (error) {
      showToast('Favorit belum bisa disimpan di browser ini.');
    }
    updateFavoriteCounts();
  }

  function normalizeEntry(row, department, index) {
    // Format asli file: [arab, transliterasi, arti, kategori, contohArab, contohIndonesia].
    let values;
    if (Array.isArray(row)) {
      values = row;
    } else if (row && typeof row === 'object') {
      // Fallback defensif bila sumber suatu saat berupa objek dengan nama properti yang dijelaskan.
      values = [row.arab, row.transliterasi, row.indonesia, row.kategori || row.category || '', row.contohArab || row.contoh_arab || row.contoh || '', row.contohIndonesia || row.contoh_indonesia || row.terjemahanContoh || ''];
    } else {
      return null;
    }

    const [arab, transliterasi, indonesia, kategori, contohArab, contohIndonesia] = values;
    if (typeof arab !== 'string' || typeof indonesia !== 'string' || !arab.trim() || !indonesia.trim()) return null;
    return {
      id: `${department}:${index + 1}`,
      department,
      arab: arab.trim(),
      transliterasi: typeof transliterasi === 'string' ? transliterasi.trim() : '',
      indonesia: indonesia.trim(),
      kategori: typeof kategori === 'string' ? kategori.trim() : '',
      contohArab: typeof contohArab === 'string' ? contohArab.trim() : '',
      contohIndonesia: typeof contohIndonesia === 'string' ? contohIndonesia.trim() : ''
    };
  }

  async function loadData() {
    setLoading(true);
    hideError();
    try {
      const response = await fetch('./words.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`words.json tidak dapat diakses (HTTP ${response.status}).`);
      const data = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Struktur words.json harus berupa objek yang berisi daftar tiap jurusan.');
      }

      const entries = [];
      const missingDepartments = [];
      for (const department of DEPARTMENTS) {
        if (!Array.isArray(data[department])) {
          missingDepartments.push(department);
          continue;
        }
        data[department].forEach((row, index) => {
          const entry = normalizeEntry(row, department, index);
          if (entry) entries.push(entry);
        });
      }
      if (entries.length === 0) {
        const missingText = missingDepartments.length ? ` Daftar jurusan tidak ditemukan: ${missingDepartments.join(', ')}.` : '';
        throw new Error(`Tidak ada kosakata valid dari empat jurusan yang dipilih.${missingText}`);
      }
      state.entries = entries;
      const showcase = entries[0];
      if (showcase) {
        $('#hero-arabic').textContent = showcase.arab;
        $('#hero-translation').textContent = showcase.indonesia;
        els.fontPreview.textContent = showcase.arab;
      }
      state.isLoaded = true;
      syncDepartmentCounts();
      setLoading(false);
      render();
    } catch (error) {
      setLoading(false);
      showError(error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui saat membaca data.');
    }
  }

  function setLoading(isLoading) {
    els.loading.hidden = !isLoading;
    els.grid.setAttribute('aria-busy', String(isLoading));
  }

  function showError(message) {
    els.errorMessage.textContent = message;
    els.error.hidden = false;
    els.grid.hidden = true;
    els.empty.hidden = true;
    els.loadMoreWrap.hidden = true;
    els.resultTotal.textContent = 'Data belum tersedia';
    els.totalWords.textContent = 'Kosakata belum tersedia';
  }

  function hideError() {
    els.error.hidden = true;
    els.grid.hidden = false;
  }

  function syncDepartmentCounts() {
    const counts = { Semua: state.entries.length };
    DEPARTMENTS.forEach((dept) => { counts[dept] = state.entries.filter((entry) => entry.department === dept).length; });
    $$('[data-count]').forEach((node) => {
      node.textContent = new Intl.NumberFormat('id-ID').format(counts[node.dataset.count] || 0);
    });
    els.totalWords.textContent = `${new Intl.NumberFormat('id-ID').format(state.entries.length)} kosakata`;
    updateFavoriteCounts();
  }

  function updateFavoriteCounts() {
    // Favorit dari data yang sudah tidak tersedia dihapus agar penghitung tetap akurat.
    const validIds = new Set(state.entries.map((entry) => entry.id));
    const validFavorites = [...state.favorites].filter((id) => validIds.has(id));
    if (validFavorites.length !== state.favorites.size) {
      state.favorites = new Set(validFavorites);
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(validFavorites)); } catch (_) { /* Non-fatal. */ }
    }
    const total = state.favorites.size;
    els.savedCount.textContent = new Intl.NumberFormat('id-ID').format(total);
    els.metaSaved.textContent = new Intl.NumberFormat('id-ID').format(total);
    els.favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
    els.savedShortcut.setAttribute('aria-pressed', String(state.favoritesOnly));
  }

  function setDepartment(department) {
    if (department !== 'Semua' && !DEPARTMENTS.includes(department)) return;
    state.department = department;
    state.visibleCount = PAGE_SIZE;
    $$('#department-nav [data-department], #mobile-department-nav [data-department]').forEach((button) => {
      const active = button.dataset.department === department;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const activeName = department === 'Semua' ? 'semua empat jurusan' : DEPARTMENT_LABELS[department];
    els.activeDescription.textContent = state.favoritesOnly
      ? `Kata yang kamu simpan${department === 'Semua' ? '' : ` dari ${activeName}`}.`
      : department === 'Semua' ? 'Semua istilah dari empat jurusan pilihan.' : `Istilah pilihan untuk ${activeName}.`;
    render();
  }

  function simplify(value) {
    // Hilangkan harakat/tanda baca gabungan agar pencarian Arab tanpa harakat tetap cocok.
    // NFD juga membuat transliterasi beraksen (ḥāsūb) bisa dicari sebagai (hasub).
    return String(value ?? '').normalize('NFKC').normalize('NFD').replace(/[\u0640]/g, '').replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '').toLocaleLowerCase('id-ID').trim();
  }

  function filterEntries() {
    const query = simplify(state.query);
    const tokens = query.split(/\s+/).filter(Boolean);
    return state.entries.filter((entry) => {
      if (state.department !== 'Semua' && entry.department !== state.department) return false;
      if (state.favoritesOnly && !state.favorites.has(entry.id)) return false;
      if (!tokens.length) return true;
      const searchable = simplify([entry.arab, entry.transliterasi, entry.indonesia, entry.kategori, entry.contohArab, entry.contohIndonesia, entry.department].join(' '));
      return tokens.every((token) => searchable.includes(token));
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function renderCard(entry, index) {
    const saved = state.favorites.has(entry.id);
    const safeId = escapeHtml(entry.id);
    const department = escapeHtml(entry.department);
    const category = escapeHtml(entry.kategori || DEPARTMENT_LABELS[entry.department]);
    const arab = escapeHtml(entry.arab);
    const meaning = escapeHtml(entry.indonesia);
    const translit = escapeHtml(entry.transliterasi);
    const exampleArabic = escapeHtml(entry.contohArab);
    const exampleTranslation = escapeHtml(entry.contohIndonesia);
    const saveLabel = saved ? `Hapus ${meaning} dari kata tersimpan` : `Simpan ${meaning}`;

    return `<article class="word-card" data-entry-id="${safeId}" style="animation-delay:${Math.min(index % 12, 11) * 18}ms">
      <div class="word-card-top"><span class="word-category" title="${category}">${category}</span><button class="card-save" type="button" data-favorite-id="${safeId}" aria-pressed="${String(saved)}" aria-label="${escapeHtml(saveLabel)}" title="${escapeHtml(saveLabel)}">${icon('bookmark')}</button></div>
      <button class="word-open" type="button" data-open-id="${safeId}" aria-haspopup="dialog" aria-label="Lihat detail kata ${meaning}">
        <span class="card-arabic" lang="ar" dir="rtl">${arab}</span>
        <span class="card-meaning">${meaning}</span>
        ${translit ? `<span class="card-transliteration">${translit}</span>` : ''}
        ${exampleArabic ? `<span class="card-separator"></span><span class="card-example-label">${icon('message')} CONTOH KALIMAT</span><span class="card-example-arabic" lang="ar" dir="rtl">${exampleArabic}</span>${exampleTranslation ? `<span class="card-example-translation">${exampleTranslation}</span>` : ''}` : ''}
        <span class="card-open-hint">Lihat detail ${icon('arrow-right')}</span>
      </button>
    </article>`;
  }

  function render() {
    if (!state.isLoaded) return;
    state.filtered = filterEntries();
    const total = state.filtered.length;
    const shown = state.filtered.slice(0, state.visibleCount);
    els.grid.innerHTML = shown.map(renderCard).join('');
    els.grid.hidden = total === 0;
    els.empty.hidden = total > 0;
    els.resultTotal.textContent = `${new Intl.NumberFormat('id-ID').format(total)} ${total === 1 ? 'kata' : 'kata'}`;
    els.loadMoreWrap.hidden = total <= shown.length;
    els.shownCount.textContent = `Menampilkan ${new Intl.NumberFormat('id-ID').format(shown.length)} dari ${new Intl.NumberFormat('id-ID').format(total)} kata`;
    els.loadMore.disabled = shown.length >= total;
    updateEmptyState(total);
    updateActiveFilters();
    updateFavoriteCounts();
    hydrateIcons(els.grid);
    if (state.favoritesOnly) {
      els.activeDescription.textContent = `Kata yang kamu simpan${state.department === 'Semua' ? '' : ` dari ${DEPARTMENT_LABELS[state.department]}`}.`;
    } else {
      els.activeDescription.textContent = state.department === 'Semua' ? 'Semua istilah dari empat jurusan pilihan.' : `Istilah pilihan untuk ${DEPARTMENT_LABELS[state.department]}.`;
    }
  }

  function updateEmptyState(total) {
    if (total > 0) return;
    if (state.favoritesOnly && state.favorites.size === 0) {
      els.emptyTitle.textContent = 'Belum ada kata tersimpan';
      els.emptyMessage.textContent = 'Tekan ikon penanda pada kosakata yang ingin kamu pelajari lagi.';
    } else if (state.favoritesOnly) {
      els.emptyTitle.textContent = 'Kata tersimpan tidak ditemukan';
      els.emptyMessage.textContent = 'Tidak ada kata tersimpan yang cocok dengan pencarian atau jurusan ini.';
    } else if (state.query.trim()) {
      els.emptyTitle.textContent = 'Belum ada kata yang cocok';
      els.emptyMessage.textContent = 'Coba ejaan lain atau cari dengan bahasa Arab, Indonesia, atau transliterasi.';
    } else {
      els.emptyTitle.textContent = 'Belum ada kosakata di sini';
      els.emptyMessage.textContent = 'Pilih jurusan lain untuk menjelajahi daftar kosakata.';
    }
  }

  function updateActiveFilters() {
    const active = Boolean(state.query.trim() || state.department !== 'Semua' || state.favoritesOnly);
    els.activeFilters.hidden = !active;
    if (!active) return;
    const pieces = [];
    if (state.query.trim()) pieces.push(`Pencarian: “${state.query.trim()}”`);
    if (state.department !== 'Semua') pieces.push(state.department);
    if (state.favoritesOnly) pieces.push('Kata tersimpan');
    els.filterSummary.textContent = pieces.join(' · ');
  }

  function resetFilters() {
    state.query = '';
    state.favoritesOnly = false;
    els.search.value = '';
    els.clearSearch.hidden = true;
    setDepartment('Semua');
    els.search.focus();
  }

  function setFavorite(id) {
    const entry = state.entries.find((item) => item.id === id);
    if (!entry) return;
    const wasSaved = state.favorites.has(id);
    if (wasSaved) state.favorites.delete(id); else state.favorites.add(id);
    saveFavorites();
    if (state.activeEntry?.id === id) updateModalFavorite();
    render();
    showToast(wasSaved ? `“${entry.indonesia}” dihapus dari kata tersimpan.` : `“${entry.indonesia}” disimpan untuk dipelajari.`);
  }

  function showToast(message) {
    clearTimeout(state.toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    state.toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2600);
  }

  function openModal(id, trigger) {
    const entry = state.entries.find((item) => item.id === id);
    if (!entry) return;
    state.activeEntry = entry;
    state.previousFocus = trigger || document.activeElement;
    els.modalCategory.textContent = entry.kategori || DEPARTMENT_LABELS[entry.department];
    els.modalTitle.textContent = entry.arab;
    els.modalMeaning.textContent = entry.indonesia;
    els.modalTransliteration.textContent = entry.transliterasi || '—';
    els.modalExampleArabic.textContent = entry.contohArab || 'Contoh belum tersedia pada data.';
    els.modalExampleTranslation.textContent = entry.contohIndonesia || '';
    els.modalDepartment.textContent = DEPARTMENT_LABELS[entry.department];
    els.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    updateModalFavorite();
    els.modalClose.focus();
  }

  function closeModal() {
    if (els.modal.hidden) return;
    els.modal.hidden = true;
    document.body.style.overflow = '';
    state.activeEntry = null;
    if (state.previousFocus && typeof state.previousFocus.focus === 'function' && document.contains(state.previousFocus)) {
      state.previousFocus.focus();
    }
  }

  function updateModalFavorite() {
    if (!state.activeEntry) return;
    const saved = state.favorites.has(state.activeEntry.id);
    els.modalFavorite.setAttribute('aria-pressed', String(saved));
    els.modalFavorite.innerHTML = `${icon('bookmark')}<span>${saved ? 'Hapus dari tersimpan' : 'Simpan kata'}</span>`;
  }

  function persistSettings() {
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(state.settings));
      localStorage.setItem(THEME_KEY, state.settings.theme);
    } catch (_) {
      showToast('Pengaturan berlaku untuk sesi ini, tetapi penyimpanan browser tidak tersedia.');
    }
  }

  function syncSettingsUI() {
    els.arabicSize.value = String(state.settings.arabicSize);
    els.arabicSizeOutput.value = `${state.settings.arabicSize} px`;
    els.arabicSizeOutput.textContent = `${state.settings.arabicSize} px`;
    els.arabicFont.value = state.settings.font;
    els.accent.value = state.settings.accent;
    els.theme.value = state.settings.theme;
    $$('[data-density]', els.settingsModal).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.density === state.settings.density));
    });
    els.fontPreview.style.fontFamily = FONT_STACKS[state.settings.font] || FONT_STACKS.naskh;
    els.fontPreviewName.textContent = FONT_LABELS[state.settings.font] || FONT_LABELS.naskh;
  }

  function applyTheme(theme, persist = true) {
    const allowed = ['light', 'dark', 'auto'];
    state.settings.theme = allowed.includes(theme) ? theme : 'auto';
    const isDark = state.settings.theme === 'dark' || (state.settings.theme === 'auto' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches));
    document.body.classList.toggle('dark-theme', isDark);
    els.themeToggle.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    els.themeToggle.setAttribute('title', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    els.themeToggle.innerHTML = icon(isDark ? 'sun' : 'moon');
    if (persist) persistSettings();
  }

  function applySettings() {
    const size = Math.max(22, Math.min(48, Number(state.settings.arabicSize) || DEFAULT_SETTINGS.arabicSize));
    state.settings.arabicSize = size;
    if (!FONT_STACKS[state.settings.font]) state.settings.font = DEFAULT_SETTINGS.font;
    if (!['comfortable', 'compact'].includes(state.settings.density)) state.settings.density = DEFAULT_SETTINGS.density;
    if (!['emerald', 'ocean', 'clay', 'indigo'].includes(state.settings.accent)) state.settings.accent = DEFAULT_SETTINGS.accent;
    document.documentElement.style.setProperty('--arabic-word-size', `${size}px`);
    document.documentElement.style.setProperty('--arabic-font-family', FONT_STACKS[state.settings.font]);
    document.documentElement.dataset.accent = state.settings.accent;
    document.body.classList.toggle('density-compact', state.settings.density === 'compact');
    applyTheme(state.settings.theme, false);
    syncSettingsUI();
    if (state.entries.length && els.fontPreview) els.fontPreview.textContent = state.entries[0].arab;
  }

  function initSettings() {
    let loaded = null;
    try {
      const raw = localStorage.getItem(DISPLAY_KEY);
      if (raw) loaded = JSON.parse(raw);
      if (!loaded || typeof loaded !== 'object') {
        const legacyTheme = localStorage.getItem(THEME_KEY);
        if (['light', 'dark', 'auto'].includes(legacyTheme)) loaded = { theme: legacyTheme };
      }
    } catch (_) { loaded = null; }
    state.settings = { ...DEFAULT_SETTINGS, ...(loaded && typeof loaded === 'object' ? loaded : {}) };
    if (!['light', 'dark', 'auto'].includes(state.settings.theme)) state.settings.theme = 'auto';
    applySettings();
  }

  function openSettings() {
    state.previousSettingsFocus = document.activeElement;
    state.settingsPreviousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    els.settingsModal.hidden = false;
    syncSettingsUI();
    els.settingsClose.focus();
  }

  function closeSettings() {
    if (els.settingsModal.hidden) return;
    els.settingsModal.hidden = true;
    document.body.style.overflow = state.settingsPreviousOverflow;
    if (state.previousSettingsFocus && typeof state.previousSettingsFocus.focus === 'function' && document.contains(state.previousSettingsFocus)) {
      state.previousSettingsFocus.focus();
    }
  }

  function resetSettings() {
    state.settings = { ...DEFAULT_SETTINGS };
    applySettings();
    persistSettings();
    showToast('Pengaturan tampilan dikembalikan ke default.');
  }

  function bindEvents() {
    $$('#department-nav [data-department], #mobile-department-nav [data-department]').forEach((button) => {
      button.addEventListener('click', () => setDepartment(button.dataset.department));
    });

    els.search.addEventListener('input', () => {
      state.query = els.search.value;
      state.visibleCount = PAGE_SIZE;
      els.clearSearch.hidden = !state.query;
      render();
    });
    els.clearSearch.addEventListener('click', () => {
      els.search.value = '';
      state.query = '';
      state.visibleCount = PAGE_SIZE;
      els.clearSearch.hidden = true;
      render();
      els.search.focus();
    });
    $$('.search-suggestion').forEach((button) => button.addEventListener('click', () => {
      els.search.value = button.dataset.query || '';
      state.query = els.search.value;
      state.visibleCount = PAGE_SIZE;
      els.clearSearch.hidden = !state.query;
      render();
      els.search.focus();
    }));

    els.favoritesToggle.addEventListener('click', () => {
      state.favoritesOnly = !state.favoritesOnly;
      state.visibleCount = PAGE_SIZE;
      render();
    });
    els.savedShortcut.addEventListener('click', () => {
      state.favoritesOnly = !state.favoritesOnly;
      state.visibleCount = PAGE_SIZE;
      render();
      if (window.matchMedia('(max-width: 700px)').matches) $('#results-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    els.resetFilters.addEventListener('click', resetFilters);
    $('#empty-reset').addEventListener('click', resetFilters);
    els.loadMore.addEventListener('click', () => {
      state.visibleCount += PAGE_SIZE;
      render();
    });
    $('#retry-load').addEventListener('click', loadData);
    els.themeToggle.addEventListener('click', () => applyTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark'));
    els.settingsToggle.addEventListener('click', openSettings);
    els.settingsClose.addEventListener('click', closeSettings);
    els.settingsDone.addEventListener('click', closeSettings);
    els.settingsReset.addEventListener('click', resetSettings);
    els.settingsModal.addEventListener('click', (event) => { if (event.target === els.settingsModal) closeSettings(); });

    els.arabicSize.addEventListener('input', () => {
      state.settings.arabicSize = Number(els.arabicSize.value);
      applySettings();
    });
    els.arabicSize.addEventListener('change', persistSettings);
    els.arabicFont.addEventListener('change', () => {
      state.settings.font = els.arabicFont.value;
      applySettings();
      persistSettings();
    });
    els.accent.addEventListener('change', () => {
      state.settings.accent = els.accent.value;
      applySettings();
      persistSettings();
    });
    els.theme.addEventListener('change', () => {
      state.settings.theme = els.theme.value;
      applySettings();
      persistSettings();
    });
    $$('[data-density]', els.settingsModal).forEach((button) => button.addEventListener('click', () => {
      state.settings.density = button.dataset.density;
      applySettings();
      persistSettings();
    }));

    els.grid.addEventListener('click', (event) => {
      const favoriteButton = event.target.closest('[data-favorite-id]');
      if (favoriteButton) {
        event.stopPropagation();
        setFavorite(favoriteButton.dataset.favoriteId);
        return;
      }
      const openButton = event.target.closest('[data-open-id]');
      if (openButton) openModal(openButton.dataset.openId, openButton);
    });

    els.modalClose.addEventListener('click', closeModal);
    els.modalDone.addEventListener('click', closeModal);
    els.modalFavorite.addEventListener('click', () => {
      if (state.activeEntry) setFavorite(state.activeEntry.id);
    });
    els.modal.addEventListener('click', (event) => { if (event.target === els.modal) closeModal(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.settingsModal.hidden) {
        closeSettings();
        return;
      }
      if (event.key === 'Escape' && !els.modal.hidden) {
        closeModal();
        return;
      }
      const activeDialog = !els.settingsModal.hidden ? els.settingsDialog : (!els.modal.hidden ? $('.word-dialog') : null);
      if (event.key === 'Tab' && activeDialog) {
        const focusable = $$('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', activeDialog)
          .filter((item) => !item.hidden && item.getClientRects().length > 0);
        if (!focusable.length) { event.preventDefault(); activeDialog.focus(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        els.search.focus();
      }
    });
  }

  function boot() {
    hydrateIcons();
    loadFavorites();
    initSettings();
    bindEvents();
    loadData();
  }

  boot();
})();
