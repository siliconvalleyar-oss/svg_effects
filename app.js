(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const presets = [
    { name: 'Rotar',      id: 'rotate', color: '#6c5ce7', duration: 2,   easing: 'linear' },
    { name: 'Rueda',      id: 'wheel',  color: '#e74c3c', duration: 3,   easing: 'linear' },
    { name: 'Pulsar',     id: 'pulse',  color: '#e67e22', duration: 1.5, easing: 'ease-in-out' },
    { name: 'Rebotar',    id: 'bounce', color: '#2ecc71', duration: 0.8, easing: 'ease-in-out' },
    { name: 'Gravedad',   id: 'gravity',color: '#1abc9c', duration: 1.5, easing: 'ease-out' },
    { name: 'Deslizar',   id: 'slide',  color: '#f39c12', duration: 2,   easing: 'ease-in-out' },
    { name: 'Ovalo',      id: 'oval',   color: '#9b59b6', duration: 3,   easing: 'linear' },
    { name: 'Desvanecer', id: 'fade',   color: '#e74c3c', duration: 2,   easing: 'ease-in-out' },
    { name: 'Dibujar',    id: 'draw',   color: '#1abc9c', duration: 2,   easing: 'ease-in-out' },
    { name: 'Temblar',    id: 'shake',  color: '#e67e22', duration: 0.5, easing: 'ease-in-out' },
    { name: 'Flotar',     id: 'float',  color: '#9b59b6', duration: 3,   easing: 'ease-in-out' },
    { name: 'Girar',      id: 'spin',   color: '#3498db', duration: 1.2, easing: 'ease-in-out' },
    { name: 'Brillar',    id: 'glow',   color: '#e74c3c', duration: 2,   easing: 'ease-in-out' },
  ];

  const shapes = [
    { name: 'Circulo',   svg: '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="70" fill="none" stroke="#6c5ce7" stroke-width="3"/></svg>' },
    { name: 'Cuadrado',  svg: '<svg viewBox="0 0 200 200"><rect x="30" y="30" width="140" height="140" rx="8" fill="none" stroke="#e74c3c" stroke-width="3"/></svg>' },
    { name: 'Triangulo', svg: '<svg viewBox="0 0 200 200"><polygon points="100,20 180,170 20,170" fill="none" stroke="#2ecc71" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Estrella',  svg: '<svg viewBox="0 0 200 200"><polygon points="100,15 125,75 190,80 140,125 155,190 100,155 45,190 60,125 10,80 75,75" fill="none" stroke="#f39c12" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Corazon',   svg: '<svg viewBox="0 0 200 200"><path d="M100 170 C60 130 20 100 20 65 C20 35 45 15 70 15 C85 15 95 25 100 35 C105 25 115 15 130 15 C155 15 180 35 180 65 C180 100 140 130 100 170Z" fill="none" stroke="#e74c3c" stroke-width="3"/></svg>' },
    { name: 'Hexagono',  svg: '<svg viewBox="0 0 200 200"><polygon points="100,15 175,50 175,140 100,180 25,140 25,50" fill="none" stroke="#1abc9c" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Rombo',     svg: '<svg viewBox="0 0 200 200"><polygon points="100,15 185,100 100,185 15,100" fill="none" stroke="#9b59b6" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Cruz',      svg: '<svg viewBox="0 0 200 200"><path d="M70 30 H130 V70 H170 V130 H130 V170 H70 V130 H30 V70 H70 Z" fill="none" stroke="#3498db" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Onda',      svg: '<svg viewBox="0 0 200 200"><path d="M20 100 Q50 60 80 100 Q110 140 140 100 Q170 60 200 100" fill="none" stroke="#e67e22" stroke-width="3" stroke-linecap="round"/></svg>' },
    { name: 'Flecha',    svg: '<svg viewBox="0 0 200 200"><path d="M100 30 L170 100 L130 100 L130 170 L70 170 L70 100 L30 100 Z" fill="none" stroke="#6c5ce7" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Rayo',      svg: '<svg viewBox="0 0 200 200"><polygon points="115,15 50,105 90,105 80,185 155,90 110,90" fill="none" stroke="#f1c40f" stroke-width="3" stroke-linejoin="round"/></svg>' },
    { name: 'Luna',      svg: '<svg viewBox="0 0 200 200"><path d="M120 30 A65 65 0 1 0 120 170 A50 50 0 1 1 120 30" fill="none" stroke="#8e44ad" stroke-width="3"/></svg>' },
  ];

  let currentSvg = null;
  let isPiecesMode = false;
  let selectedElement = null;
  let dragState = null;
  let animationPlaying = true;

  // Per-element animation state
  let elementAnimations = {};
  let selectedElementIndex = null;
  let origElRefs = {};  // element index -> SVG DOM element reference

  // --- History / Undo/Redo ---
  const actionHistory = [];
  let historyIndex = -1;
  const MAX_HISTORY = 50;
  let copiedConfig = null;  // clipboard for copy/paste
  let currentFilePath = null;  // current loaded file path

  function pushHistory() {
    actionHistory.splice(historyIndex + 1);
    const snap = JSON.parse(JSON.stringify(elementAnimations));
    actionHistory.push(snap);
    if (actionHistory.length > MAX_HISTORY) actionHistory.shift();
    historyIndex = actionHistory.length - 1;
    updateUndoButtons();
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    elementAnimations = JSON.parse(JSON.stringify(actionHistory[historyIndex]));
    afterHistoryRestore();
  }

  function redo() {
    if (historyIndex >= actionHistory.length - 1) return;
    historyIndex++;
    elementAnimations = JSON.parse(JSON.stringify(actionHistory[historyIndex]));
    afterHistoryRestore();
  }

  function afterHistoryRestore() {
    applyAllAnimations();
    // Restore visual transforms (position + rotation)
    const svg = $('#preview-area svg');
    if (svg) {
      const allEls = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
      Object.keys(elementAnimations).forEach(idx => {
        if (allEls[idx] && elementAnimations[idx])
          applyElementVisual(allEls[idx], elementAnimations[idx]);
      });
    }
    renderElements();
    if (selectedElementIndex !== null &&
        selectedElementIndex < Object.keys(elementAnimations).length) {
      loadElementConfig(selectedElementIndex);
    } else {
      selectedElementIndex = null;
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
      $('#direction-controls').style.display = 'none';
      $('#oval-controls').style.display = 'none';
      $('#fade-controls').style.display = 'none';
      const ms = $('#metadata-section');
      if (ms) ms.style.display = 'none';
    }
    updateUndoButtons();
  }

  function updateUndoButtons() {
    $('#undo-btn').style.opacity = historyIndex > 0 ? '1' : '0.35';
    $('#redo-btn').style.opacity = historyIndex < actionHistory.length - 1 ? '1' : '0.35';
  }

  // Slides state
  let slides = [];
  let currentSlideIndex = -1;
  let slideTransition = 'fade';
  let slideDuration = 3;
  let transitionSpeed = 0.6;
  let slideInterval = null;
  let isSlidePlaying = false;

  // File list
  const fileList = $('#file-list');
  let availableFiles = [];

  async function fetchFileList() {
    try {
      const res = await fetch('files/');
      if (!res.ok) return [];
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('a[href]');
      const svgs = [];
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.endsWith('.svg') && !href.startsWith('?')) {
          svgs.push(decodeURIComponent(href));
        }
      });
      return svgs;
    } catch (e) {
      console.warn('Could not fetch file list from server, using defaults');
      return [];
    }
  }

  function renderFileList() {
    fileList.innerHTML = '';
    if (availableFiles.length === 0) {
      fileList.innerHTML = '<div class="file-loading">No se encontraron archivos</div>';
      return;
    }
    availableFiles.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.className = 'file-item';
      if (idx === 0) btn.classList.add('active');
      const displayName = name.replace(/^.*[\/\\]/, '');
      btn.innerHTML = `<svg class="file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="12" height="14" rx="2"/><path d="M5 5h6M5 8h6M5 11h3"/></svg>${displayName}`;
      btn.dataset.path = name;
      btn.addEventListener('click', () => loadFromServer(name));
      // Enable drag from file list
      btn.draggable = true;
      btn.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', name);
        e.dataTransfer.effectAllowed = 'copy';
      });
      fileList.appendChild(btn);
    });
  }

  let isFolderMode = false;

  function renderFileList() {
    fileList.innerHTML = '';
    if (isFolderMode) {
      const backBtn = document.createElement('button');
      backBtn.className = 'file-item';
      backBtn.innerHTML = '&#8592; Archivos del servidor';
      backBtn.addEventListener('click', async () => {
        isFolderMode = false;
        const serverFiles = await fetchFileList();
        if (serverFiles.length > 0) availableFiles = serverFiles;
        else availableFiles = ['sample.svg', 'index-octonaut.svg', 'index-portal-blue.svg', '1299642.svg'];
        renderFileList();
      });
      fileList.appendChild(backBtn);
    }
    if (availableFiles.length === 0) {
      fileList.innerHTML += '<div class="file-loading">No se encontraron archivos</div>';
      return;
    }
    availableFiles.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.className = 'file-item';
      if (!isFolderMode && idx === 0 && !currentFilePath) btn.classList.add('active');
      const displayName = name.replace(/^.*[\/\\]/, '');
      btn.innerHTML = `<svg class="file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="12" height="14" rx="2"/><path d="M5 5h6M5 8h6M5 11h3"/></svg>${displayName}`;
      btn.dataset.path = name;
      btn.addEventListener('click', () => loadFromServer(name));
      btn.draggable = true;
      btn.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', isFolderMode ? 'folder:' + name : name);
        e.dataTransfer.effectAllowed = 'copy';
      });
      fileList.appendChild(btn);
    });
  }

  async function loadFromServer(name) {
    try {
      const fullPath = name.startsWith('files/') ? name : 'files/' + name;
      const res = await fetch(fullPath);
      if (!res.ok) return;
      const text = await res.text();
      currentFilePath = fullPath;
      loadSvgString(text);
      $$('.file-item').forEach(b => b.classList.toggle('active', b.dataset.path === name));
    } catch (e) {
      console.error('Error loading file:', e);
    }
  }

  // Initialize file list: try server, then fallback defaults
  (async function initFileList() {
    const serverFiles = await fetchFileList();
    if (serverFiles.length > 0) {
      availableFiles = serverFiles;
    } else {
      // Fallback known files
      availableFiles = ['sample.svg', 'index-octonaut.svg', 'index-portal-blue.svg', '1299642.svg'];
    }
    renderFileList();
    // Load default SVG
    const defaultFile = 'index-octonaut.svg';
    if (availableFiles.includes('index-octonaut.svg')) {
      await loadFromServer('index-octonaut.svg');
    } else if (availableFiles.length > 0) {
      await loadFromServer(availableFiles[0]);
    }
  })();

  // Build shape grid
  const shapeGrid = $('#shape-grid');
  shapes.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'shape-btn';
    btn.innerHTML = s.svg + s.name;
    btn.addEventListener('click', () => loadSvgString(s.svg));
    shapeGrid.appendChild(btn);
  });

  // Build preset grid
  const presetGrid = $('#preset-grid');
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.dataset.id = p.id;
    btn.innerHTML = `<span class="dot" style="background:${p.color}"></span>${p.name}`;
    btn.addEventListener('click', () => selectPreset(p.id));
    presetGrid.appendChild(btn);
  });

  // Upload handlers
  const uploadZone = $('#upload-zone');
  const fileInput = $('#file-input');

  $('#browse-btn').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) loadFile(fileInput.files[0]);
  });

  // Global drop on preview area (accept files and file-list drags)
  const previewEl = $('#preview');
  previewEl.addEventListener('dragover', e => { e.preventDefault(); previewEl.style.outline = '2px dashed var(--accent)'; });
  previewEl.addEventListener('dragleave', () => { previewEl.style.outline = ''; });
  previewEl.addEventListener('drop', e => {
    e.preventDefault();
    previewEl.style.outline = '';
    // Check for text data from file-list drag
    const textData = e.dataTransfer.getData('text/plain');
    if (textData) {
      if (textData.startsWith('folder:')) {
        // Folder mode: find and load this file from the available list by matching name
        const name = textData.slice(7);
        const match = document.querySelector(`.file-item[data-path="${name}"]`);
        if (match) match.click();
      } else {
        loadFromServer(textData);
      }
      return;
    }
    // Check for actual files
    if (e.dataTransfer.files.length) {
      loadFile(e.dataTransfer.files[0]);
    }
  });

  // Folder picker
  const folderBtn = $('#folder-btn');
  const folderInput = $('#folder-input');
  folderBtn.addEventListener('click', () => folderInput.click());
  folderInput.addEventListener('change', () => {
    const files = folderInput.files;
    if (!files.length) return;
    const svgFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.endsWith('.svg')) {
        svgFiles.push(files[i]);
      }
    }
    if (svgFiles.length === 0) return;
    isFolderMode = true;
    availableFiles = svgFiles.map(f => f.name);
    renderFileList();
    // Read and load the first SVG
    const reader = new FileReader();
    reader.onload = e => {
      currentFilePath = svgFiles[0].name;
      loadSvgString(e.target.result);
    };
    reader.readAsText(svgFiles[0]);
  });

  function getDefaultElementConfig() {
    return { presetIds: [], speed: 1, delay: 0, iter: 'infinite', dir: 'normal', ovalRx: 80, ovalRy: 40, ovalAngle: 0, directionAngle: 0, visualX: 0, visualY: 0, visualRotation: 0, scale: 1, fadeMin: 0.15, fadeMax: 1 };
  }

  function applyElementVisual(el, cfg) {
    if (!el || !cfg) return;
    const tx = cfg.visualX || 0;
    const ty = cfg.visualY || 0;
    const rot = cfg.visualRotation || 0;
    const scale = cfg.scale || 1;
    const hasTx = tx !== 0 || ty !== 0 || rot !== 0 || scale !== 1;
    if (hasTx) {
      el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
      el.style.transformOrigin = 'center center';
      el.style.transformBox = 'fill-box';
    } else {
      el.style.removeProperty('transform');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
    }
  }

  function loadSvgString(svgStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return;
    currentSvg = svg;

    const area = $('#preview-area');
    if (area.classList.contains('slides-mode')) return;

    area.innerHTML = '';
    area.appendChild(document.importNode(svg, true));

    $('#empty-state').style.display = 'none';
    area.style.display = 'flex';
    $('#presets-section').style.display = '';
    $('#controls-section').style.display = '';
    $('#export-section').style.display = '';
    $('#mode-section').style.display = '';
    $('#slides-section').classList.add('visible');
    $('#elements-panel').classList.add('visible');

    exitPiecesMode();
    hideRotationHandle();
    elementAnimations = {};
    origElRefs = {};
    selectedElementIndex = null;
    actionHistory.splice(0);
    historyIndex = -1;
    updateUndoButtons();
    updateElementActions();
    renderElements();
    setTimeout(setupPreviewSelection, 0);
  }

  function loadFile(file) {
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) return;
    const reader = new FileReader();
    reader.onload = e => loadSvgString(e.target.result);
    reader.readAsText(file);
  }

  // ===== DIRECTION PRESETS (quick angle buttons) =====
  const directionPresets = [
    { label: '→', angle: 0 },
    { label: '↗', angle: 45 },
    { label: '↑', angle: 90 },
    { label: '↖', angle: 135 },
    { label: '←', angle: 180 },
    { label: '↙', angle: 225 },
    { label: '↓', angle: 270 },
    { label: '↘', angle: 315 },
  ];

  function setupDirectionPresets() {
    const container = $('#direction-presets');
    if (!container) return;
    container.innerHTML = '';
    directionPresets.forEach(dp => {
      const btn = document.createElement('button');
      btn.className = 'dir-preset-btn';
      btn.textContent = dp.label;
      btn.dataset.angle = dp.angle;
      btn.addEventListener('click', () => {
        const cfg = getConfigForSelected();
        if (!cfg) return;
        pushHistory();
        cfg.directionAngle = dp.angle;
        $('#direction-slider').value = dp.angle;
        $('#direction-value').textContent = dp.angle + '°';
        updateDirectionArrow(dp.angle);
        applyOneAnimation(selectedElementIndex);
        renderElements();
      });
      container.appendChild(btn);
    });
  }
  setupDirectionPresets();

  // ===== ELEMENTS PANEL =====

  function renderElements() {
    const grid = $('#element-grid');
    grid.innerHTML = '';
    const svg = $('#preview-area svg');
    if (!svg) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    if (!elements.length) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    elements.forEach((el, i) => {
      const tag = el.tagName.toLowerCase();
      const name = el.getAttribute('id') || el.getAttribute('class') || `${tag} ${i + 1}`;

      if (!elementAnimations[i]) elementAnimations[i] = getDefaultElementConfig();

      const cfg = elementAnimations[i];
      const firstPid = cfg.presetIds && cfg.presetIds.length > 0 ? cfg.presetIds[0] : null;
      const preset = firstPid ? presets.find(p => p.id === firstPid) : null;

      const thumbSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      thumbSvg.setAttribute('viewBox', '0 0 200 200');
      thumbSvg.appendChild(el.cloneNode(true));

      const item = document.createElement('div');
      item.className = 'element-thumb' + (selectedElementIndex === i ? ' selected' : '');
      item.dataset.index = i;

      const dot = document.createElement('span');
      dot.className = 'el-preset-dot';
      dot.style.background = preset ? preset.color : 'transparent';
      dot.style.border = preset ? 'none' : '1px dashed var(--border)';
      item.appendChild(dot);

      const thumbWrap = document.createElement('div');
      thumbWrap.appendChild(thumbSvg);
      item.appendChild(thumbWrap);

      const info = document.createElement('div');
      info.className = 'el-info';
      info.innerHTML = `<div class="el-name">${name}</div><div class="el-type">${preset ? preset.name : '—'}</div>`;
      item.appendChild(info);

      const visBtn = document.createElement('button');
      visBtn.className = 'el-visibility';
      visBtn.innerHTML = '&#128065;';
      visBtn.title = 'Mostrar/Ocultar';
      origElRefs[i] = el;
      visBtn.addEventListener('click', e => {
        e.stopPropagation();
        const orig = origElRefs[i];
        if (!orig) return;
        const hidden = orig.style.display === 'none';
        orig.style.display = hidden ? '' : 'none';
        visBtn.classList.toggle('hidden', !hidden);
        thumbSvg.style.opacity = hidden ? '0.3' : '1';
        if (selectedElementIndex === i && $('#meta-visibility')) {
          $('#meta-visibility').textContent = hidden ? 'Oculto' : 'Visible';
        }
      });
      item.appendChild(visBtn);

      item.addEventListener('click', () => {
        selectElement(i);
      });

      grid.appendChild(item);
    });
  }

  // ---- Copy / Paste / Delete / Duplicate ----

  function copyElementConfig() {
    if (selectedElementIndex === null) return;
    copiedConfig = JSON.parse(JSON.stringify(elementAnimations[selectedElementIndex]));
    $('#paste-el-btn').style.opacity = '1';
  }

  function pasteElementConfig() {
    if (selectedElementIndex === null || !copiedConfig) return;
    pushHistory();
    elementAnimations[selectedElementIndex] = JSON.parse(JSON.stringify(copiedConfig));
    applyOneAnimation(selectedElementIndex);
    renderElements();
    loadElementConfig(selectedElementIndex);
  }

  function deleteElement() {
    if (selectedElementIndex === null) return;
    pushHistory();
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = elements[selectedElementIndex];
    if (el) el.remove();

    // Re-index animations
    const newAnims = {};
    const allEls = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < elements.length; readIdx++) {
      if (readIdx === selectedElementIndex) continue;
      if (elementAnimations[readIdx]) newAnims[writeIdx] = elementAnimations[readIdx];
      writeIdx++;
    }
    elementAnimations = newAnims;
    selectedElementIndex = Math.min(selectedElementIndex, allEls.length - 1);
    if (selectedElementIndex < 0) selectedElementIndex = null;
    renderElements();
    if (selectedElementIndex !== null) loadElementConfig(selectedElementIndex);
    updateElementActions();
  }

  function duplicateElement() {
    if (selectedElementIndex === null) return;
    pushHistory();
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = elements[selectedElementIndex];
    if (!el) return;
    const clone = el.cloneNode(true);
    el.parentNode.insertBefore(clone, el.nextSibling);

    // Copy config to new index
    const newIdx = elements.length;
    if (elementAnimations[selectedElementIndex]) {
      elementAnimations[newIdx] = JSON.parse(JSON.stringify(elementAnimations[selectedElementIndex]));
    }
    renderElements();
    selectElement(newIdx);
    updateElementActions();
  }

  // ---- Z-order (bring to front / send to back) ----

  function _reorderElement(el, fn) {
    if (!el || !el.parentNode) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    // Build config map by element reference before reordering
    const allEls = Array.from(svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text'));
    const configMap = new Map();
    allEls.forEach((e, i) => {
      if (elementAnimations[i]) configMap.set(e, JSON.parse(JSON.stringify(elementAnimations[i])));
    });
    // Perform the reorder
    fn(el, svg, allEls);
    // Re-index elementAnimations by new DOM order
    const newEls = Array.from(svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text'));
    const newAnims = {};
    newEls.forEach((e, i) => {
      newAnims[i] = configMap.has(e) ? configMap.get(e) : getDefaultElementConfig();
    });
    elementAnimations = newAnims;
    selectedElementIndex = newEls.indexOf(el);
  }

  function bringToFront() {
    if (selectedElementIndex === null) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[selectedElementIndex];
    if (!el || el === svg.lastElementChild) return;
    pushHistory();
    _reorderElement(el, (e, s) => { s.appendChild(e); });
    renderElements();
    if (selectedElementIndex !== null) selectElement(selectedElementIndex);
  }

  function sendToBack() {
    if (selectedElementIndex === null) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[selectedElementIndex];
    if (!el || el === svg.firstElementChild) return;
    pushHistory();
    _reorderElement(el, (e, s) => { s.insertBefore(e, s.firstChild); });
    renderElements();
    if (selectedElementIndex !== null) selectElement(selectedElementIndex);
  }

  function bringForward() {
    if (selectedElementIndex === null) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[selectedElementIndex];
    if (!el || !el.nextElementSibling) return;
    // Ensure next sibling is also an SVG drawing element
    const next = el.nextElementSibling;
    if (!next.matches('circle, rect, ellipse, path, line, polyline, polygon, g, text')) return;
    pushHistory();
    _reorderElement(el, (e) => { e.parentNode.insertBefore(e.nextElementSibling, e); });
    renderElements();
    if (selectedElementIndex !== null) selectElement(selectedElementIndex);
  }

  function sendBackward() {
    if (selectedElementIndex === null) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[selectedElementIndex];
    if (!el || !el.previousElementSibling) return;
    const prev = el.previousElementSibling;
    if (!prev.matches('circle, rect, ellipse, path, line, polyline, polygon, g, text')) return;
    pushHistory();
    _reorderElement(el, (e) => { e.parentNode.insertBefore(e, e.previousElementSibling); });
    renderElements();
    if (selectedElementIndex !== null) selectElement(selectedElementIndex);
  }

  function updateElementActions() {
    const hasSel = selectedElementIndex !== null &&
                   selectedElementIndex < Object.keys(elementAnimations).length;
    $('#element-actions').style.display = hasSel ? 'flex' : 'none';
    $('#paste-el-btn').style.opacity = copiedConfig ? '1' : '0.35';
    // Z-order buttons
    const hasZ = hasSel && selectedElementIndex >= 0;
    if (hasZ) {
      const svg = $('#preview-area svg');
      const allEls = svg ? svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text') : [];
      $('#to-front-btn').style.opacity = selectedElementIndex < allEls.length - 1 ? '1' : '0.35';
      $('#to-back-btn').style.opacity = selectedElementIndex > 0 ? '1' : '0.35';
      $('#fwd-btn').style.opacity = selectedElementIndex < allEls.length - 1 ? '1' : '0.35';
      $('#bwd-btn').style.opacity = selectedElementIndex > 0 ? '1' : '0.35';
    }
    $('#zorder-actions').style.display = hasZ ? 'flex' : 'none';
  }

  // ---- Selection ----

  function selectElement(index) {
    selectedElementIndex = index;
    $$('.element-thumb').forEach(t => t.classList.toggle('selected', parseInt(t.dataset.index) === index));
    highlightElement(index);
    if (index !== null && index >= 0)
      showRotationHandle(index);
    else
      hideRotationHandle();
    loadElementConfig(index);
    updateElementActions();
  }

  function highlightElement(index) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('*').forEach(el => el.classList.remove('element-selected'));
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    if (elements[index]) {
      elements[index].classList.add('element-selected');
    }
  }

  function loadElementConfig(index) {
    // Hide metadata section if no selection
    if (index === null || index < 0) {
      $('#metadata-section').style.display = 'none';
      return;
    }
    const cfg = elementAnimations[index];
    if (!cfg) return;

    $('#metadata-section').style.display = '';

    const hasPreset = cfg.presetIds && cfg.presetIds.length > 0;
    if (hasPreset) {
      $$('.preset-btn').forEach(b => b.classList.toggle('active', cfg.presetIds.includes(b.dataset.id)));
      const firstId = cfg.presetIds[0];
      const preset = presets.find(p => p.id === firstId);
      if (preset) {
        $('#speed-slider').value = preset.duration;
        cfg.speed = preset.duration;
        updateSpeedDisplay();
      }
    } else {
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    $('#speed-slider').value = cfg.speed;
    updateSpeedDisplay();
    $('#delay-slider').value = cfg.delay;
    updateDelayDisplay();

    $$('#iter-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === cfg.iter));
    $$('#dir-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === cfg.dir));

    const hasOval = cfg.presetIds && cfg.presetIds.includes('oval');
    $('#oval-controls').style.display = hasOval ? '' : 'none';
    if (hasOval) {
      $('#oval-rx').value = cfg.ovalRx;
      $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
      $('#oval-ry').value = cfg.ovalRy;
      $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
      $('#oval-angle').value = cfg.ovalAngle;
      $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    }

    const hasFade = cfg.presetIds && cfg.presetIds.includes('fade');
    $('#fade-controls').style.display = hasFade ? '' : 'none';
    if (hasFade) {
      const fm = cfg.fadeMin ?? 0.15;
      const fM = cfg.fadeMax ?? 1;
      $('#fade-min').value = Math.round(fm * 100);
      $('#fade-min-val').textContent = Math.round(fm * 100) + '%';
      $('#fade-max').value = Math.round(fM * 100);
      $('#fade-max-val').textContent = Math.round(fM * 100) + '%';
    }

    $('#direction-controls').style.display = hasPreset ? '' : 'none';
    if (hasPreset) {
      $('#direction-slider').value = cfg.directionAngle;
      $('#direction-value').textContent = cfg.directionAngle + '°';
      updateDirectionArrow(cfg.directionAngle);
    }
    // Metadata panel
    const metaSection = $('#metadata-section');
    if (metaSection) {
      metaSection.style.display = '';
      const svg = $('#preview-area svg');
      if (svg) {
        const allEls = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
        const el = allEls[index];
        if (el) {
          updateMetadata(el, cfg, index);
        }
      }
    }
  }

  // ---- Metadata panel ----

  function updateMetadata(el, cfg, index) {
    if (!el) return;
    const bbox = el.getBBox ? el.getBBox() : { x: 0, y: 0, width: 0, height: 0 };
    $('#meta-tag').textContent = el.tagName;
    $('#meta-id').textContent = el.getAttribute('id') || el.getAttribute('class') || '—';
    const hidden = el.style.display === 'none';
    $('#meta-visibility').textContent = hidden ? 'Oculto' : 'Visible';
    const visBtn = $('#meta-vis-toggle');
    visBtn.classList.toggle('hidden', hidden);
    visBtn.onclick = () => {
      const orig = origElRefs[index];
      if (!orig) return;
      const h = orig.style.display === 'none';
      orig.style.display = h ? '' : 'none';
      $('#meta-visibility').textContent = h ? 'Visible' : 'Oculto';
      visBtn.classList.toggle('hidden', !h);
      // Sync thumbnail visibility button
      const thumbVis = document.querySelector(`.element-thumb[data-index="${index}"] .el-visibility`);
      if (thumbVis) thumbVis.classList.toggle('hidden', !h);
    };
    $('#meta-x').textContent = Math.round(bbox.x);
    $('#meta-y').textContent = Math.round(bbox.y);
    $('#meta-w').textContent = Math.round(bbox.width);
    $('#meta-h').textContent = Math.round(bbox.height);
    const rot = cfg ? Math.round(cfg.visualRotation || 0) : 0;
    $('#meta-rotation-slider').value = rot;
    $('#meta-rotation-val').textContent = rot + '\u00B0';
    const scale = cfg && cfg.scale ? Math.round(cfg.scale * 100) : 100;
    $('#meta-scale-slider').value = scale;
    $('#meta-scale-val').textContent = scale + '%';
  }

  function getConfigForSelected() {
    if (selectedElementIndex === null) return null;
    if (!elementAnimations[selectedElementIndex]) {
      elementAnimations[selectedElementIndex] = getDefaultElementConfig();
    }
    return elementAnimations[selectedElementIndex];
  }

  // ===== PLAYBACK CONTROLS =====

  function setAllAnimationsPlayState(state) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      el.style.animationPlayState = state;
    });
  }

  function playAnimation() {
    if (selectedElementIndex === null && !Object.values(elementAnimations).some(c => c.presetIds && c.presetIds.length > 0)) return;
    animationPlaying = true;
    setAllAnimationsPlayState('running');
    $('#play-btn').classList.add('active');
    $('#reset-btn').classList.remove('active');
    $('#pause-btn').classList.remove('active');
  }

  function pauseAnimation() {
    animationPlaying = false;
    setAllAnimationsPlayState('paused');
    $('#pause-btn').classList.add('active');
    $('#play-btn').classList.remove('active');
    $('#reset-btn').classList.remove('active');
  }

  function resetAnimation() {
    animationPlaying = false;
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      el.style.removeProperty('animation');
      el.style.removeProperty('animation-delay');
      el.style.removeProperty('animation-play-state');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
      el.style.removeProperty('stroke-dasharray');
      el.style.removeProperty('--path-length');
    });
    $('#play-btn').classList.remove('active');
    $('#reset-btn').classList.add('active');
    $('#pause-btn').classList.remove('active');
  }

  $('#play-btn').addEventListener('click', playAnimation);
  $('#reset-btn').addEventListener('click', resetAnimation);
  $('#pause-btn').addEventListener('click', pauseAnimation);

  // ===== ANIMATION ENGINE =====

  function getDirectionKeyframesName(presetId, angle) {
    return presetId + '_dir_' + Math.round(angle);
  }

  function ensureDirectionKeyframes(presetId, angle) {
    const name = getDirectionKeyframesName(presetId, angle);
    const existing = $('#preview-area svg style#dir-keyframes');
    if (existing && existing.textContent.includes(name)) return name;

    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let kf = '';
    switch (presetId) {
      case 'slide':
        kf = `@keyframes ${name} { 0%,100% { transform: translate(${-80*cos}px,${-80*sin}px); } 50% { transform: translate(${80*cos}px,${80*sin}px); } }`;
        break;
      case 'bounce':
        kf = `@keyframes ${name} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${20*cos}px,${20*sin}px); } }`;
        break;
      case 'shake':
        kf = `@keyframes ${name} { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(${-8*cos}px,${-8*sin}px); } 20%,40%,60%,80% { transform: translate(${8*cos}px,${8*sin}px); } }`;
        break;
      case 'float':
        kf = `@keyframes ${name} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${15*cos}px,${15*sin}px); } }`;
        break;
      case 'gravity':
        kf = `@keyframes ${name} { 0% { transform: translate(${-100*cos}px,${-100*sin}px); } 30% { transform: translate(${80*cos}px,${80*sin}px); } 50% { transform: translate(${-40*cos}px,${-40*sin}px); } 70% { transform: translate(${30*cos}px,${30*sin}px); } 85% { transform: translate(${-10*cos}px,${-10*sin}px); } 100% { transform: translate(0,0); } }`;
        break;
    }

    if (kf) {
      let styleEl = $('#preview-area svg style#dir-keyframes');
      if (!styleEl) {
        styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.id = 'dir-keyframes';
        $('#preview-area svg').insertBefore(styleEl, $('#preview-area svg').firstChild);
      }
      styleEl.textContent += '\n' + kf;
    }
    return name;
  }

  function applyAllAnimations() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    elements.forEach((el, i) => {
      applyOneAnimation(i);
    });
  }

  function applyOneAnimation(index) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = elements[index];
    if (!el) return;
    const cfg = elementAnimations[index];
    if (!cfg || !cfg.presetIds || cfg.presetIds.length === 0) {
      el.style.removeProperty('animation');
      el.style.removeProperty('animation-delay');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
      el.style.removeProperty('--oval-rx');
      el.style.removeProperty('--oval-ry');
      el.style.removeProperty('--path-length');
      el.style.removeProperty('--fade-min');
      el.style.removeProperty('--fade-max');
      el.style.removeProperty('stroke-dasharray');
      return;
    }

    el.style.transformOrigin = 'center center';
    el.style.transformBox = 'fill-box';

    // Build comma-separated animation value for all active presets
    const animParts = [];
    const delayParts = [];
    const usedProps = new Set();

    cfg.presetIds.forEach(pid => {
      const preset = presets.find(p => p.id === pid);
      const isTranslateBased = ['slide', 'bounce', 'shake', 'float', 'gravity'].includes(pid);
      const hasAngle = cfg.directionAngle && cfg.directionAngle !== 0;

      let animName;
      if (isTranslateBased && hasAngle) {
        animName = ensureDirectionKeyframes(pid, cfg.directionAngle);
      } else {
        animName = 'svg' + pid.charAt(0).toUpperCase() + pid.slice(1);
      }

      const easing = preset ? preset.easing : 'ease-in-out';
      animParts.push(`${animName} ${cfg.speed}s ${easing} ${cfg.iter} ${cfg.dir}`);
      delayParts.push(cfg.delay + 's');

      if (pid === 'oval') {
        el.style.setProperty('--oval-rx', cfg.ovalRx + 'px');
        el.style.setProperty('--oval-ry', cfg.ovalRy + 'px');
        usedProps.add('oval');
      }

      if (pid === 'draw') {
        const length = el.getTotalLength ? el.getTotalLength() : 1000;
        el.style.strokeDasharray = length;
        el.style.setProperty('--path-length', length);
        usedProps.add('draw');
      }

      if (pid === 'fade') {
        el.style.setProperty('--fade-min', (cfg.fadeMin ?? 0.15) + '');
        el.style.setProperty('--fade-max', (cfg.fadeMax ?? 1) + '');
        usedProps.add('fade');
      }
    });

    el.style.animation = animParts.join(', ');
    el.style.animationDelay = delayParts.join(', ');
    el.style.animationPlayState = animationPlaying ? 'running' : 'paused';
  }

  // ===== TRAJECTORY ARROW =====

  function updateDirectionArrow(angle) {
    let container = $('#direction-arrow-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'direction-arrow-container';
      container.className = 'direction-arrow';
      const area = $('#preview-area');
      if (area) area.appendChild(container);
    }
    const rad = angle * Math.PI / 180;
    const len = 30;
    const x2 = 50 + len * Math.cos(rad);
    const y2 = 50 - len * Math.sin(rad);
    const headSize = 8;
    const headAngle = 0.5;
    const hx1 = x2 - headSize * Math.cos(rad - headAngle);
    const hy1 = y2 + headSize * Math.sin(rad - headAngle);
    const hx2 = x2 - headSize * Math.cos(rad + headAngle);
    const hy2 = y2 + headSize * Math.sin(rad + headAngle);
    container.innerHTML = `<svg viewBox="0 0 100 100" width="100" height="100">
      <line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
      <polygon points="${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}" fill="var(--accent)"/>
      <circle cx="50" cy="50" r="4" fill="var(--accent)" opacity="0.4"/>
    </svg>`;
  }

  function selectPreset(id) {
    if (selectedElementIndex === null) {
      const first = $('#element-grid .element-thumb');
      if (first) selectElement(parseInt(first.dataset.index));
      else return;
    }
    const cfg = getConfigForSelected();
    if (!cfg) return;
    pushHistory();
    // Toggle in presetIds array
    if (cfg.presetIds.includes(id)) {
      cfg.presetIds = cfg.presetIds.filter(p => p !== id);
    } else {
      cfg.presetIds.push(id);
    }
    applyOneAnimation(selectedElementIndex);
    loadElementConfig(selectedElementIndex);
    renderElements();
  }

  function updateSpeedDisplay() {
    const cfg = getConfigForSelected();
    if (cfg) $('#speed-value').textContent = cfg.speed.toFixed(1) + 's';
    else $('#speed-value').textContent = '1.0s';
  }
  function updateDelayDisplay() {
    const cfg = getConfigForSelected();
    if (cfg) $('#delay-value').textContent = cfg.delay.toFixed(1) + 's';
    else $('#delay-value').textContent = '0.0s';
  }

  // Metadata rotation slider
  $('#meta-rotation-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    const val = parseInt(e.target.value);
    cfg.visualRotation = val;
    $('#meta-rotation-val').textContent = val + '\u00B0';
    applyElementVisual(getSelectedSvgElement(), cfg);
    showRotationHandle(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  // Metadata scale slider
  $('#meta-scale-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    const val = parseInt(e.target.value);
    cfg.scale = val / 100;
    $('#meta-scale-val').textContent = val + '%';
    applyElementVisual(getSelectedSvgElement(), cfg);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  function getSelectedSvgElement() {
    const svg = $('#preview-area svg');
    if (!svg || selectedElementIndex === null) return null;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    return els[selectedElementIndex] || null;
  }

  // Controls
  let sliderChangeTimer = null;
  $('#speed-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.speed = parseFloat(e.target.value);
    updateSpeedDisplay();
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  $('#delay-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.delay = parseFloat(e.target.value);
    updateDelayDisplay();
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  $$('#iter-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cfg = getConfigForSelected();
      if (!cfg) return;
      pushHistory();
      $$('#iter-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cfg.iter = btn.dataset.val;
      applyOneAnimation(selectedElementIndex);
    });
  });

  $$('#dir-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cfg = getConfigForSelected();
      if (!cfg) return;
      pushHistory();
      $$('#dir-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cfg.dir = btn.dataset.val;
      applyOneAnimation(selectedElementIndex);
    });
  });

  // Direction angle slider
  $('#direction-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.directionAngle = parseFloat(e.target.value);
    $('#direction-value').textContent = cfg.directionAngle + '°';
    updateDirectionArrow(cfg.directionAngle);
    applyOneAnimation(selectedElementIndex);
    renderElements();
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  // Oval controls
  $('#oval-rx').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRx = parseInt(e.target.value);
    $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });
  $('#oval-ry').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRy = parseInt(e.target.value);
    $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });
  $('#oval-angle').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalAngle = parseInt(e.target.value);
    $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  // Fade min slider
  $('#fade-min').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.fadeMin = parseInt(e.target.value) / 100;
    $('#fade-min-val').textContent = e.target.value + '%';
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });
  // Fade max slider
  $('#fade-max').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.fadeMax = parseInt(e.target.value) / 100;
    $('#fade-max-val').textContent = e.target.value + '%';
    applyOneAnimation(selectedElementIndex);
    clearTimeout(sliderChangeTimer);
    sliderChangeTimer = setTimeout(pushHistory, 400);
  });

  // Pieces mode
  $('#mode-toggle').addEventListener('click', () => {
    if (isPiecesMode) exitPiecesMode();
    else enterPiecesMode();
  });

  function enterPiecesMode() {
    isPiecesMode = true;
    $('#mode-toggle').classList.add('active');
    $('#mode-toggle').textContent = 'Salir del modo piezas';
    $('#mode-hint').textContent = 'Click para seleccionar, arrastrar para mover. ESC para deseleccionar.';
    const area = $('#preview-area');
    area.classList.add('mode-select');
    const svg = area.querySelector('svg');
    if (svg) setAllAnimationsPlayState('paused');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.addEventListener('pointerdown', onElementPointerDown);
      // Visual outline for each piece
      el.style.outline = '1.5px dashed rgba(108,92,231,0.5)';
      el.style.outlineOffset = '-1px';
    });
  }

  function exitPiecesMode() {
    isPiecesMode = false;
    $('#mode-toggle').classList.remove('active');
    $('#mode-toggle').textContent = 'Mover piezas por separado';
    $('#mode-hint').textContent = 'Activa para seleccionar y arrastrar elementos individuales';
    const area = $('#preview-area');
    area.classList.remove('mode-select');
    const svg = area.querySelector('svg');
    if (svg) setAllAnimationsPlayState(animationPlaying ? 'running' : 'paused');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.removeEventListener('pointerdown', onElementPointerDown);
      el.style.removeProperty('outline');
      el.style.removeProperty('outline-offset');
      el.classList.remove('element-selected');
    });
    selectedElement = null;
  }

  // ---- Always-on preview selection (click SVG element to select) ----

  function setupPreviewSelection() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.addEventListener('click', onPreviewElementClick);
    });
  }

  function onPreviewElementClick(e) {
    e.stopPropagation();
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    let idx = -1;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === e.currentTarget) { idx = i; break; }
    }
    if (idx >= 0) selectElement(idx);
  }

  // ---- Rotation handle overlay ----
  let rotHandleState = null; // { svg, line, center, knob, elementIndex, startAngle, startClientX, startClientY, cx, cy, elCenterX, elCenterY }

  function showRotationHandle(elementIndex) {
    hideRotationHandle();
    const svg = $('#preview-area svg');
    if (!svg || elementIndex === null || elementIndex === undefined) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[elementIndex];
    if (!el) return;
    const bbox = el.getBBox ? el.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const handleDist = Math.max(bbox.width, bbox.height) * 0.6 + 20;
    const cfg = elementAnimations[elementIndex];
    const rotRad = (cfg ? (cfg.visualRotation || 0) : 0) * Math.PI / 180;
    const hx = cx + handleDist * Math.sin(rotRad);
    const hy = cy - handleDist * Math.cos(rotRad);

    // Create rotation handle SVG overlay
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
    container.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 200 200');
    container.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', hx); line.setAttribute('y2', hy);
    line.setAttribute('stroke', '#6c5ce7'); line.setAttribute('stroke-width', '2');

    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', cx); center.setAttribute('cy', cy);
    center.setAttribute('r', '4'); center.setAttribute('fill', '#6c5ce7');

    const knob = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    knob.setAttribute('cx', hx); knob.setAttribute('cy', hy);
    knob.setAttribute('r', '8');
    knob.setAttribute('fill', 'rgba(108,92,231,0.3)');
    knob.setAttribute('stroke', '#6c5ce7'); knob.setAttribute('stroke-width', '2');
    knob.style.cursor = 'grab';
    knob.style.pointerEvents = 'all';

    // Convert element center to window coords for drag tracking
    const svgRect = svg.getBoundingClientRect();
    const vb = (svg.getAttribute('viewBox') || '0 0 200 200').split(' ').map(Number);
    const scaleX = svgRect.width / (vb[2] || 200);
    const scaleY = svgRect.height / (vb[3] || 200);

    const elCenterX = svgRect.left + cx * scaleX;
    const elCenterY = svgRect.top + cy * scaleY;

    container.appendChild(line);
    container.appendChild(center);
    container.appendChild(knob);
    svg.parentElement.appendChild(container);

    // Store non-drag state (element references for cleanup)
    rotHandleState = { svg: container, line, knob, elementIndex, cx, cy, elCenterX, elCenterY, scaleX, scaleY };

    knob.addEventListener('pointerdown', e => {
      e.stopPropagation();
      e.preventDefault();
      knob.style.cursor = 'grabbing';
      // Compute current center for rotation
      const cfg2 = elementAnimations[elementIndex];
      const bbox2 = el.getBBox ? el.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
      const cx2 = bbox2.x + bbox2.width / 2;
      const cy2 = bbox2.y + bbox2.height / 2;
      const rect2 = svg.getBoundingClientRect();
      const startAngle2 = cfg2 ? (cfg2.visualRotation || 0) : 0;
      rotHandleState.startClientX = e.clientX;
      rotHandleState.startClientY = e.clientY;
      rotHandleState.startAngle = startAngle2;
      rotHandleState.cx = cx2;
      rotHandleState.cy = cy2;
      rotHandleState.elCenterX = rect2.left + cx2 * scaleX;
      rotHandleState.elCenterY = rect2.top + cy2 * scaleY;
      document.addEventListener('pointermove', onRotationPointerMove);
      document.addEventListener('pointerup', onRotationPointerUp);
    });
  }

  function hideRotationHandle() {
    if (rotHandleState && rotHandleState.svg && rotHandleState.svg.parentElement) {
      rotHandleState.svg.parentElement.removeChild(rotHandleState.svg);
    }
    rotHandleState = null;
  }

  function onRotationPointerMove(e) {
    if (!rotHandleState) return;
    e.preventDefault();
    const dx = e.clientX - rotHandleState.elCenterX;
    const dy = e.clientY - rotHandleState.elCenterY;
    const angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = els[rotHandleState.elementIndex];
    if (!el) return;
    const idx = rotHandleState.elementIndex;
    if (!elementAnimations[idx]) elementAnimations[idx] = getDefaultElementConfig();
    elementAnimations[idx].visualRotation = angle;

    // Pause animation on this element during drag so visual transform shows through
    el.style.animationPlayState = 'paused';
    applyElementVisual(el, elementAnimations[idx]);

    // Update handle position
    const cfg = elementAnimations[idx];
    const bbox = el.getBBox ? el.getBBox() : { x: 0, y: 0, width: 100, height: 100 };
    const ecx = bbox.x + bbox.width / 2;
    const ecy = bbox.y + bbox.height / 2;
    const handleDist = Math.max(bbox.width, bbox.height) * 0.6 + 20;
    const rotRad = angle * Math.PI / 180;
    const nhx = ecx + handleDist * Math.sin(rotRad);
    const nhy = ecy - handleDist * Math.cos(rotRad);
    rotHandleState.line.setAttribute('x2', nhx);
    rotHandleState.line.setAttribute('y2', nhy);
    rotHandleState.knob.setAttribute('cx', nhx);
    rotHandleState.knob.setAttribute('cy', nhy);

    // Update metadata rotation slider / value
    $('#meta-rotation-slider').value = Math.round(angle);
    $('#meta-rotation-val').textContent = Math.round(angle) + '\u00B0';
  }

  function onRotationPointerUp(e) {
    if (!rotHandleState) return;
    document.removeEventListener('pointermove', onRotationPointerMove);
    document.removeEventListener('pointerup', onRotationPointerUp);
    if (rotHandleState.knob) rotHandleState.knob.style.cursor = 'grab';
    // Resume animation on the element (paused during drag)
    const svg = $('#preview-area svg');
    if (svg) {
      const els = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
      const el = els[rotHandleState.elementIndex];
      if (el) {
        // If the element has an animation preset, re-apply animation on top of visual transform
        if (elementAnimations[rotHandleState.elementIndex] &&
            elementAnimations[rotHandleState.elementIndex].presetIds &&
            elementAnimations[rotHandleState.elementIndex].presetIds.length > 0) {
          applyOneAnimation(rotHandleState.elementIndex);
        } else {
          el.style.animationPlayState = 'running';
        }
      }
    }
    pushHistory();
    rotHandleState = null;
  }

  // ---- Pieces mode drag ----

  function onElementPointerDown(e) {
    e.stopPropagation();
    e.preventDefault();
    if (selectedElement) selectedElement.classList.remove('element-selected');
    selectedElement = e.currentTarget;
    selectedElement.classList.add('element-selected');
    const svgEl = $('#preview-area svg');
    const allEls = svgEl.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    let svx = 0, svy = 0;
    for (let i = 0; i < allEls.length; i++) {
      if (allEls[i] === selectedElement) {
        const c = elementAnimations[i];
        if (c) { svx = c.visualX || 0; svy = c.visualY || 0; }
        break;
      }
    }
    dragState = { element: selectedElement, startClientX: e.clientX, startClientY: e.clientY, svgRect: svgEl.getBoundingClientRect(), startVX: svx, startVY: svy };
    document.addEventListener('pointermove', onElementPointerMove);
    document.addEventListener('pointerup', onElementPointerUp);
  }

  function onElementPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startClientX;
    const dy = e.clientY - dragState.startClientY;
    const svgRect = dragState.svgRect;
    const tx = dx * 200 / svgRect.width;
    const ty = dy * 200 / svgRect.height;
    // Find config index for this element
    const svg = $('#preview-area svg');
    if (svg) {
      const allEls = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
      for (let i = 0; i < allEls.length; i++) {
        if (allEls[i] === dragState.element) {
          if (!elementAnimations[i]) elementAnimations[i] = getDefaultElementConfig();
          elementAnimations[i].visualX = dragState.startVX + tx;
          elementAnimations[i].visualY = dragState.startVY + ty;
          applyElementVisual(dragState.element, elementAnimations[i]);
          break;
        }
      }
    }
  }

  function onElementPointerUp() {
    if (!dragState) return;
    document.removeEventListener('pointermove', onElementPointerMove);
    document.removeEventListener('pointerup', onElementPointerUp);
    pushHistory();
    dragState = null;
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isPiecesMode && selectedElement) {
      selectedElement.classList.remove('element-selected');
      selectedElement = null;
    }
  });

  // ===== EXPORT =====

  $('#export-btn').addEventListener('click', () => {
    if (!currentSvg) return;
    const svg = $('#preview-area svg');
    const clone = svg.cloneNode(true);
    clone.removeAttribute('class');

    // Clean up visual-only artifacts from the clone
    clone.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      el.classList.remove('element-selected');
      // Remove editor-only inline styles (selection outline, piece drag, highlight filter)
      el.style.removeProperty('outline');
      el.style.removeProperty('outline-offset');
      el.style.removeProperty('filter');
      // Keep animation and visual transform (those are intentional user edits)
    });
    // Remove any leftover dir-keyframes styles
    clone.querySelectorAll('style#dir-keyframes').forEach(s => s.remove());

    const usedPresets = new Set();
    const elements = clone.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const origElements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');

    let embeddedStyle = '';
    let elementStyles = '';

    function exportAnimName(pid, i, angle) {
      const isTB = ['slide', 'bounce', 'shake', 'float', 'gravity'].includes(pid);
      return (isTB && angle) ? pid + '_e' + i : 'svg' + pid.charAt(0).toUpperCase() + pid.slice(1);
    }

    function exportKeyframes(pid, i, angle, usedSet) {
      const isTB = ['slide', 'bounce', 'shake', 'float', 'gravity'].includes(pid);
      if (isTB && angle) {
        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const dn = pid + '_e' + i;
        const map = {
          slide: `@keyframes ${dn} { 0%,100% { transform: translate(${-80*cos}px,${-80*sin}px); } 50% { transform: translate(${80*cos}px,${80*sin}px); } }`,
          bounce: `@keyframes ${dn} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${20*cos}px,${20*sin}px); } }`,
          shake: `@keyframes ${dn} { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(${-8*cos}px,${-8*sin}px); } 20%,40%,60%,80% { transform: translate(${8*cos}px,${8*sin}px); } }`,
          float: `@keyframes ${dn} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${15*cos}px,${15*sin}px); } }`,
          gravity: `@keyframes ${dn} { 0% { transform: translate(${-100*cos}px,${-100*sin}px); } 30% { transform: translate(${80*cos}px,${80*sin}px); } 50% { transform: translate(${-40*cos}px,${-40*sin}px); } 70% { transform: translate(${30*cos}px,${30*sin}px); } 85% { transform: translate(${-10*cos}px,${-10*sin}px); } 100% { transform: translate(0,0); } }`
        };
        return map[pid] || '';
      }
      const key = pid + (angle ? '_a' + Math.round(angle) : '');
      if (usedSet.has(key)) return '';
      usedSet.add(key);
      const kfMap = {
        rotate: '@keyframes svgRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
        wheel: '@keyframes svgWheel { 0% { transform: rotate(0deg); } 25% { transform: rotate(90deg); } 50% { transform: rotate(180deg); } 75% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }',
        pulse: '@keyframes svgPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }',
        bounce: '@keyframes svgBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }',
        gravity: '@keyframes svgGravity { 0% { transform: translateY(-100px); } 30% { transform: translateY(80px); } 50% { transform: translateY(-40px); } 70% { transform: translateY(30px); } 85% { transform: translateY(-10px); } 100% { transform: translateY(0); } }',
        slide: '@keyframes svgSlide { 0%,100% { transform: translateX(-80px); } 50% { transform: translateX(80px); } }',
        oval: '@keyframes svgOval { 0% { transform: translate(0,0); } 25% { transform: translate(var(--oval-rx,80px),0); } 50% { transform: translate(0,var(--oval-ry,40px)); } 75% { transform: translate(calc(-1*var(--oval-rx,80px)),0); } 100% { transform: translate(0,0); } }',
        fade: '@keyframes svgFade { 0%,100% { opacity: var(--fade-max, 1); } 50% { opacity: var(--fade-min, 0.15); } }',
        draw: '@keyframes svgDraw { from { stroke-dashoffset: var(--path-length,1000); } to { stroke-dashoffset: 0; } }',
        shake: '@keyframes svgShake { 0%,100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-8px); } 20%,40%,60%,80% { transform: translateX(8px); } }',
        float: '@keyframes svgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }',
        spin: '@keyframes svgSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.85); } 100% { transform: rotate(360deg) scale(1); } }',
        glow: '@keyframes svgGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(108,92,231,0.3)); } 50% { filter: drop-shadow(0 0 24px rgba(108,92,231,0.9)); } }'
      };
      return kfMap[pid] || '';
    }

    const usedKf = new Set();
    elements.forEach((el, i) => {
      const cfg = elementAnimations[i];
      if (!cfg || !cfg.presetIds || !cfg.presetIds.length) return;
      cfg.presetIds.forEach(pid => { usedPresets.add(pid); });
      const origEl = origElements[i];
      const tag = origEl ? origEl.tagName.toLowerCase() : el.tagName.toLowerCase();

      const animNames = [];
      const animValues = [];

      cfg.presetIds.forEach(pid => {
        const preset = presets.find(p => p.id === pid);
        const animName = exportAnimName(pid, i, cfg.directionAngle);
        const kf = exportKeyframes(pid, i, cfg.directionAngle, usedKf);
        if (kf) embeddedStyle += kf + '\n';
        animNames.push(animName);
        const easing = preset ? preset.easing : 'ease-in-out';
        animValues.push(`${animName} ${cfg.speed}s ${easing} ${cfg.iter} ${cfg.dir}`);
      });

      const isOval = cfg.presetIds.includes('oval');
      const isDraw = cfg.presetIds.includes('draw');
      const isFade = cfg.presetIds.includes('fade');
      const ovalVars = isOval ? `--oval-rx: ${cfg.ovalRx}px; --oval-ry: ${cfg.ovalRy}px;` : '';
      const drawExtra = isDraw ? ' stroke-dasharray: 1000; --path-length: 1000;' : '';
      const fadeVars = isFade ? `--fade-min: ${cfg.fadeMin ?? 0.15}; --fade-max: ${cfg.fadeMax ?? 1};` : '';
      elementStyles += `${tag}:nth-child(${i + 1}) { transform-origin: center center; transform-box: fill-box; ${ovalVars} ${fadeVars} animation: ${animValues.join(', ')}; animation-delay: ${cfg.delay}s;${drawExtra} }\n`;
    });

    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = embeddedStyle + '\n' + elementStyles;
    clone.insertBefore(styleEl, clone.firstChild);

    let svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'animated.svg'; a.click();
    URL.revokeObjectURL(url);
  });

  // ===== SLIDES =====

  function renderSlideList() {
    const list = $('#slide-list');
    list.innerHTML = '';
    slides.forEach((slide, i) => {
      const item = document.createElement('div');
      item.className = 'slide-item' + (i === currentSlideIndex ? ' active' : '');
      item.draggable = true;
      item.dataset.index = i;
      item.innerHTML = `<span class="slide-num">${i + 1}</span><span class="slide-name">${slide.name}</span><button class="slide-remove">&times;</button>`;
      item.addEventListener('click', e => { if (!e.target.classList.contains('slide-remove')) goToSlide(i); });
      item.querySelector('.slide-remove').addEventListener('click', e => { e.stopPropagation(); removeSlide(i); });
      item.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', i); item.style.opacity = '0.4'; });
      item.addEventListener('dragend', () => { item.style.opacity = ''; });
      item.addEventListener('dragover', e => { e.preventDefault(); });
      item.addEventListener('drop', e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'));
        if (from !== i) {
          const [moved] = slides.splice(from, 1);
          slides.splice(i, 0, moved);
          if (currentSlideIndex === from) currentSlideIndex = i;
          renderSlideList();
        }
      });
      list.appendChild(item);
    });
  }

  function addCurrentAsSlide() {
    if (!currentSvg) return;
    slides.push({ name: 'Slide ' + (slides.length + 1), svgStr: new XMLSerializer().serializeToString(currentSvg) });
    renderSlideList();
    if (slides.length === 1) goToSlide(0);
  }

  function removeSlide(index) {
    slides.splice(index, 1);
    if (!slides.length) { currentSlideIndex = -1; stopSlideShow(); $('#preview-area').classList.remove('slides-mode'); $('#preview-area').innerHTML = ''; $('#empty-state').style.display = ''; $('#preview-area').style.display = 'none'; }
    else if (index <= currentSlideIndex) { currentSlideIndex = Math.min(currentSlideIndex, slides.length - 1); goToSlide(currentSlideIndex); }
    renderSlideList();
  }

  function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    const area = $('#preview-area');
    if (!area.classList.contains('slides-mode')) { area.classList.add('slides-mode'); area.innerHTML = ''; $('#empty-state').style.display = 'none'; area.style.display = 'flex'; }
    const oldIndex = currentSlideIndex;
    currentSlideIndex = index;
    if (oldIndex === index && area.querySelector('.active-slide')) { renderSlideList(); return; }

    const doc = new DOMParser().parseFromString(slides[index].svgStr, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return;

    const container = document.createElement('div');
    container.className = 'slide-container';
    container.appendChild(document.importNode(svg, true));

    const t = slideTransition;
    let exitClass = 'exit-fade', enterClass = 'enter-fade';
    if (t === 'slide-h') { exitClass = 'exit-left'; enterClass = 'enter-right'; }
    else if (t === 'slide-v') { exitClass = 'exit-up'; enterClass = 'enter-down'; }
    else if (t === 'zoom') { exitClass = 'exit-zoom'; enterClass = 'enter-zoom'; }
    else if (t === 'flip') { exitClass = 'exit-flip'; enterClass = 'enter-flip'; }
    else if (t === 'blur') { exitClass = 'exit-blur'; enterClass = 'enter-blur'; }

    const oldSlide = area.querySelector('.slide-container.active-slide');
    if (oldSlide) { oldSlide.classList.remove('active-slide'); oldSlide.classList.add(exitClass); setTimeout(() => oldSlide.remove(), transitionSpeed * 1000); }

    container.classList.add(enterClass);
    area.appendChild(container);
    container.offsetHeight;
    requestAnimationFrame(() => { container.classList.remove(enterClass); container.classList.add('active-slide'); });
    renderSlideList();
  }

  function nextSlide() { if (slides.length) goToSlide((currentSlideIndex + 1) % slides.length); }
  function prevSlide() { if (slides.length) goToSlide((currentSlideIndex - 1 + slides.length) % slides.length); }

  function startSlideShow() {
    if (slides.length < 2) return;
    isSlidePlaying = true;
    $('#slide-play').textContent = '⏸ Pausa';
    $('#slide-play').classList.add('active');
    slideInterval = setInterval(nextSlide, slideDuration * 1000);
  }

  function stopSlideShow() {
    isSlidePlaying = false;
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = null;
    $('#slide-play').textContent = '▶ Play';
    $('#slide-play').classList.remove('active');
  }

  $('#add-slide-btn').addEventListener('click', addCurrentAsSlide);
  $('#slide-prev').addEventListener('click', prevSlide);
  $('#slide-next').addEventListener('click', nextSlide);
  $('#slide-play').addEventListener('click', () => { if (isSlidePlaying) stopSlideShow(); else startSlideShow(); });

  function setupTransitionGroup(groupId) {
    $$('#' + groupId + ' .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#' + groupId + ' .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        slideTransition = btn.dataset.val;
      });
    });
  }
  setupTransitionGroup('transition-group');
  setupTransitionGroup('transition-group2');

  $('#slide-duration').addEventListener('input', e => { slideDuration = parseFloat(e.target.value); $('#slide-duration-val').textContent = slideDuration.toFixed(1) + 's'; if (isSlidePlaying) { stopSlideShow(); startSlideShow(); } });
  $('#transition-speed').addEventListener('input', e => { transitionSpeed = parseFloat(e.target.value); $('#transition-speed-val').textContent = transitionSpeed.toFixed(1) + 's'; });

  // ---- Undo/Redo buttons ----
  $('#undo-btn').addEventListener('click', undo);
  $('#redo-btn').addEventListener('click', redo);

  // ---- Element action buttons ----
  $('#copy-el-btn').addEventListener('click', copyElementConfig);
  $('#paste-el-btn').addEventListener('click', pasteElementConfig);
  $('#delete-el-btn').addEventListener('click', deleteElement);
  $('#duplicate-el-btn').addEventListener('click', duplicateElement);
  $('#to-front-btn').addEventListener('click', bringToFront);
  $('#to-back-btn').addEventListener('click', sendToBack);
  $('#fwd-btn').addEventListener('click', bringForward);
  $('#bwd-btn').addEventListener('click', sendBackward);

  // ---- Element drag from preview (always on) ----
  document.addEventListener('pointerdown', function(e) {
    const target = e.target;
    if (!target || !target.closest) return;
    const svgEl = target.closest('#preview-area svg *');
    if (!svgEl) return;
    // Allow native SVG interaction (click-to-select) but capture for drag
  });

  // ---- Keyboard shortcuts ----
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }
    if (ctrl && e.key === 'z') {
      e.preventDefault();
      undo();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!e.target.matches('input, textarea')) {
        deleteElement();
        return;
      }
    }
    if (e.key === ' ' && !isPiecesMode && !e.target.matches('input, button, textarea')) {
      e.preventDefault();
      if (animationPlaying) pauseAnimation();
      else playAnimation();
    }
  });

})();
