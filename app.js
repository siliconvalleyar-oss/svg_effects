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
    { name: 'Levitar',    id: 'levitate',color: '#1abc9c', duration: 3.5, easing: 'ease-in-out' },
    { name: 'Arco',       id: 'arc',    color: '#f39c12', duration: 4,   easing: 'ease-in-out' },
    { name: 'Radiar',     id: 'radiate',color: '#e67e22', duration: 4,   easing: 'ease-in-out' },
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

  // Group system
  let elementGroups = {}; // { groupId: { name, elements: [indices], presetId, config } }
  let selectedGroupElements = []; // multi-select indices
  let isMultiSelectMode = false;
  let nextGroupId = 1;

  // Undo/redo history
  let undoStack = [];
  let undoIndex = -1;
  const MAX_UNDO = 50;

  function pushHistory() {
    if (undoIndex < undoStack.length - 1) undoStack = undoStack.slice(0, undoIndex + 1);
    undoStack.push({
      animations: JSON.parse(JSON.stringify(elementAnimations)),
      groups: JSON.parse(JSON.stringify(elementGroups))
    });
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    undoIndex = undoStack.length - 1;
    updateUndoButtons();
  }

  function undo() {
    if (undoIndex <= 0) return;
    undoIndex--;
    restoreHistory(undoStack[undoIndex]);
  }

  function redo() {
    if (undoIndex >= undoStack.length - 1) return;
    undoIndex++;
    restoreHistory(undoStack[undoIndex]);
  }

  function restoreHistory(state) {
    elementAnimations = JSON.parse(JSON.stringify(state.animations));
    elementGroups = JSON.parse(JSON.stringify(state.groups));
    if (selectedElementIndex !== null) loadElementConfig(selectedElementIndex);
    renderElements();
    applyAllAnimations();
    updateUndoButtons();
  }

  function updateUndoButtons() {
    const undoBtn = $('#undo-btn');
    const redoBtn = $('#redo-btn');
    if (undoBtn) undoBtn.disabled = undoIndex <= 0;
    if (redoBtn) redoBtn.disabled = undoIndex >= undoStack.length - 1;
  }

  // Zoom
  let zoomLevel = 1;
  function setupZoom() {
    const area = $('#preview-area');
    if (!area) return;
    let zoomBar = $('#zoom-bar');
    if (!zoomBar) {
      zoomBar = document.createElement('div');
      zoomBar.id = 'zoom-bar';
      zoomBar.innerHTML = '<button class="zoom-btn" id="zoom-out" title="Alejar">−</button><span id="zoom-level">100%</span><button class="zoom-btn" id="zoom-in" title="Acercar">+</button>';
      area.appendChild(zoomBar);
      $('#zoom-out').addEventListener('click', () => { zoomLevel = Math.max(0.2, zoomLevel / 1.3); applyZoom(); });
      $('#zoom-in').addEventListener('click', () => { zoomLevel = Math.min(5, zoomLevel * 1.3); applyZoom(); });
      // Dragging to reposition
      let drag = null;
      zoomBar.addEventListener('pointerdown', e => {
        if (e.target.tagName === 'BUTTON') return;
        drag = { startX: e.clientX, startY: e.clientY, left: zoomBar.offsetLeft, top: zoomBar.offsetTop };
        zoomBar.setPointerCapture(e.pointerId);
      });
      zoomBar.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        zoomBar.style.right = '';
        zoomBar.style.bottom = '';
        zoomBar.style.left = (drag.left + dx) + 'px';
        zoomBar.style.top = (drag.top + dy) + 'px';
      });
      zoomBar.addEventListener('pointerup', () => { drag = null; });
      zoomBar.addEventListener('pointercancel', () => { drag = null; });
    }
  }
  function applyZoom() {
    const svg = $('#preview-area svg');
    if (svg) svg.style.transform = `scale(${zoomLevel})`;
    const zl = $('#zoom-level');
    if (zl) zl.textContent = Math.round(zoomLevel * 100) + '%';
  }

  // Boundary frame (viewBox visual guide)
  let boundaryActive = false;
  function toggleBoundary() {
    boundaryActive = !boundaryActive;
    const frame = $('#boundary-frame');
    if (frame) frame.style.display = boundaryActive ? '' : 'none';
    const btn = $('#boundary-toggle');
    if (btn) btn.classList.toggle('active', boundaryActive);
  }

  function setupBoundary() {
    const area = $('#preview-area');
    if (!area || $('#boundary-frame')) return;
    const frame = document.createElement('div');
    frame.id = 'boundary-frame';
    frame.className = 'boundary-frame';
    frame.style.display = boundaryActive ? '' : 'none';
    area.appendChild(frame);
    // Resize handles
    for (const pos of ['nw', 'ne', 'sw', 'se']) {
      const handle = document.createElement('div');
      handle.className = 'boundary-handle ' + pos;
      handle.addEventListener('pointerdown', e => startBoundaryResize(e, pos));
      frame.appendChild(handle);
    }
  }

  function updateBoundary() {
    const frame = $('#boundary-frame');
    if (!frame) return;
    const svg = $('#preview-area svg');
    if (!svg) { frame.style.display = 'none'; return; }
    const vb = svg.getAttribute('viewBox');
    if (!vb) return;
    const parts = vb.trim().split(/\s+/).map(Number);
    if (parts.length < 4) return;
    const svgRect = svg.getBoundingClientRect();
    const areaRect = $('#preview-area').getBoundingClientRect();
    const scaleX = svgRect.width / parts[2];
    const scaleY = svgRect.height / parts[3];
    frame.style.left = (svgRect.left - areaRect.left) + 'px';
    frame.style.top = (svgRect.top - areaRect.top) + 'px';
    frame.style.width = svgRect.width + 'px';
    frame.style.height = svgRect.height + 'px';
  }

  let boundaryDrag = null;
  function startBoundaryResize(e, pos) {
    e.preventDefault();
    const svg = $('#preview-area svg');
    if (!svg) return;
    const vb = svg.getAttribute('viewBox');
    if (!vb) return;
    const parts = vb.trim().split(/\s+/).map(Number);
    const startX = e.clientX, startY = e.clientY;
    const startVb = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    const svgRect = svg.getBoundingClientRect();
    const scaleX = svgRect.width / startVb.w;
    const scaleY = svgRect.height / startVb.h;
    boundaryDrag = { pos, startX, startY, startVb, scaleX, scaleY };
    document.addEventListener('pointermove', onBoundaryMove);
    document.addEventListener('pointerup', stopBoundaryResize);
  }

  function onBoundaryMove(e) {
    if (!boundaryDrag) return;
    const dx = (e.clientX - boundaryDrag.startX) / boundaryDrag.scaleX;
    const dy = (e.clientY - boundaryDrag.startY) / boundaryDrag.scaleY;
    const vb = { ...boundaryDrag.startVb };
    const p = boundaryDrag.pos;
    if (p.includes('w')) { vb.x += dx; vb.w -= dx; }
    if (p.includes('e')) vb.w += dx;
    if (p.includes('n')) { vb.y += dy; vb.h -= dy; }
    if (p.includes('s')) vb.h += dy;
    if (vb.w < 10) vb.w = 10;
    if (vb.h < 10) vb.h = 10;
    const svg = $('#preview-area svg');
    if (svg) svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    updateBoundary();
  }

  function stopBoundaryResize() {
    boundaryDrag = null;
    document.removeEventListener('pointermove', onBoundaryMove);
    document.removeEventListener('pointerup', stopBoundaryResize);
  }

  // Background images
  let backgroundImages = [];
  function addBackgroundImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const id = 'bg_' + Date.now();
      backgroundImages.push({ id, name: file.name, dataUrl: e.target.result, zIndex: 0 });
      renderBackgrounds();
    };
    reader.readAsDataURL(file);
  }
  function removeBackgroundImage(id) {
    backgroundImages = backgroundImages.filter(b => b.id !== id);
    renderBackgrounds();
  }
  function moveBackground(id, dir) {
    const idx = backgroundImages.findIndex(b => b.id === id);
    if (idx === -1) return;
    if (dir === 'up' && idx < backgroundImages.length - 1) { [backgroundImages[idx], backgroundImages[idx+1]] = [backgroundImages[idx+1], backgroundImages[idx]]; }
    if (dir === 'down' && idx > 0) { [backgroundImages[idx], backgroundImages[idx-1]] = [backgroundImages[idx-1], backgroundImages[idx]]; }
    if (dir === 'front') { const b = backgroundImages.splice(idx, 1)[0]; backgroundImages.push(b); }
    if (dir === 'back') { const b = backgroundImages.splice(idx, 1)[0]; backgroundImages.unshift(b); }
    renderBackgrounds();
  }
  function renderBackgrounds() {
    const container = $('#bg-container');
    if (!container) return;
    container.innerHTML = '';
    backgroundImages.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'bg-item';
      item.innerHTML = `
        <img src="${img.dataUrl}" class="bg-thumb">
        <span class="bg-name">${img.name}</span>
        <div class="bg-controls">
          <button class="bg-btn" data-action="back" title="Al fondo">⬇</button>
          <button class="bg-btn" data-action="down" title="Bajar">↓</button>
          <span class="bg-z">${i + 1}</span>
          <button class="bg-btn" data-action="up" title="Subir">↑</button>
          <button class="bg-btn" data-action="front" title="Al frente">⬆</button>
          <button class="bg-btn danger" data-action="remove" title="Eliminar">✕</button>
        </div>`;
      item.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const action = btn.dataset.action;
          if (action === 'remove') removeBackgroundImage(img.id);
          else moveBackground(img.id, action);
        });
      });
      container.appendChild(item);
    });
    // Render actual background images in preview
    renderBgLayers();
  }

  function renderBgLayers() {
    const area = $('#preview-area');
    let bgLayer = $('#bg-layer');
    if (!bgLayer) {
      bgLayer = document.createElement('div');
      bgLayer.id = 'bg-layer';
      bgLayer.className = 'bg-layer';
      area.insertBefore(bgLayer, area.firstChild);
    }
    bgLayer.innerHTML = '';
    backgroundImages.forEach((img, i) => {
      const el = document.createElement('img');
      el.className = 'bg-image';
      el.src = img.dataUrl;
      el.style.zIndex = i;
      bgLayer.appendChild(el);
    });
  }

  // Reset state
  let originalSvgString = null;

  function resetAll() {
    if (!originalSvgString) return;
    if (!confirm('¿Resetear todo a su estado original?')) return;
    elementAnimations = {};
    elementGroups = {};
    selectedElementIndex = null;
    selectedGroupElements = [];
    selectedGroupId = null;
    isMultiSelectMode = false;
    nextGroupId = 1;
    undoStack = [];
    undoIndex = -1;
    updateUndoButtons();
    loadSvgString(originalSvgString);
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
  let currentRive = null;

  function renderFileList(files) {
    fileList.innerHTML = '';
    if (files.length === 0) {
      fileList.innerHTML = '<span style="color:#666;font-size:12px;padding:8px">No hay archivos</span>';
      return;
    }
    files.forEach(file => {
      const name = file.name || file;
      const type = file.type || (name.endsWith('.riv') ? 'rive' : 'svg');
      const btn = document.createElement('button');
      btn.className = 'file-item';
      btn.dataset.name = name;
      btn.dataset.type = type;
      const displayName = name.includes('/') ? name.split('/').pop() : name;
      const icon = type === 'rive'
        ? '<svg class="file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M5 8h6"/></svg>'
        : '<svg class="file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="12" height="14" rx="2"/><path d="M5 5h6M5 8h6M5 11h3"/></svg>';
      btn.innerHTML = `${icon}${displayName}`;
      btn.addEventListener('click', () => loadFromServer(name, type));
      fileList.appendChild(btn);
    });
  }

  async function fetchFileList() {
    try {
      const res = await fetch('/api/files');
      if (!res.ok) {
        renderFileList([{ name: 'sample.svg', type: 'svg' }]);
        return;
      }
      const files = await res.json();
      renderFileList(files.length ? files : [{ name: 'sample.svg', type: 'svg' }]);
    } catch (e) {
      renderFileList([{ name: 'sample.svg', type: 'svg' }]);
    }
  }

  function stopRive() {
    if (currentRive) {
      currentRive.stop();
      currentRive = null;
    }
    $('#rive-area').style.display = 'none';
  }

  async function loadFromServer(name, type) {
    try {
      stopRive();
      if (type === 'rive') {
        await loadRiveFile(name);
      } else {
        const res = await fetch('files/' + name);
        if (!res.ok) return;
        const text = await res.text();
        loadSvgString(text);
      }
      $$('.file-item').forEach(b => b.classList.toggle('active', b.dataset.name === name));
    } catch (e) {
      console.error('Error loading file:', e);
    }
  }

  async function loadRiveFile(name) {
    const area = $('#preview-area');
    const riveArea = $('#rive-area');
    area.style.display = 'none';
    riveArea.style.display = 'flex';
    $('#empty-state').style.display = 'none';
    $('#presets-section').style.display = 'none';
    $('#controls-section').style.display = 'none';
    $('#export-section').style.display = 'none';
    $('#mode-section').style.display = 'none';
    $('#elements-panel').classList.remove('visible');

    const canvas = $('#rive-canvas');
    try {
      currentRive = new Rive.Rive({
        src: 'files/' + name,
        canvas: canvas,
        autoplay: true,
        stateMachines: 'default',
        onLoad: () => {
          currentRive.resizeDrawingSurfaceToCanvas();
        }
      });
    } catch (e) {
      console.error('Error loading Rive file:', e);
      riveArea.style.display = 'none';
      area.style.display = 'flex';
      $('#empty-state').style.display = '';
    }
  }

  // Rive controls
  $('#rive-play-btn').addEventListener('click', () => { if (currentRive) currentRive.play(); });
  $('#rive-pause-btn').addEventListener('click', () => { if (currentRive) currentRive.pause(); });
  $('#rive-stop-btn').addEventListener('click', () => { if (currentRive) currentRive.stop(); });

  fetchFileList();

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
  let lastPresetId = null;
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.dataset.id = p.id;
    btn.innerHTML = `<span class="dot" style="background:${p.color}"></span>${p.name}`;
    btn.addEventListener('click', () => {
      lastPresetId = p.id;
      togglePreset(p.id);
    });
    presetGrid.appendChild(btn);
  });

  // Apply to all elements
  $('#apply-all-btn').addEventListener('click', () => {
    if (!lastPresetId) return;
    pushHistory();
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const preset = presets.find(p => p.id === lastPresetId);
    elements.forEach((el, i) => {
      if (!elementAnimations[i]) elementAnimations[i] = getDefaultElementConfig();
      elementAnimations[i].presetId = lastPresetId;

      // Update group config if element belongs to a group
      const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(i));
      if (groupId && elementGroups[groupId].elements[0] === i) {
        elementGroups[groupId].config = { ...elementAnimations[i] };
        elementGroups[groupId].color = preset.color;
      }

      applyOneAnimation(i);
    });
    selectedElementIndex = 0;
    renderElements();
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

  function getDefaultElementConfig() {
    return { presetId: null, speed: 16, delay: 0, iter: 'infinite', dir: 'normal', ovalRx: 80, ovalRy: 40, ovalAngle: 0, arcRx: 80, arcRy: 80, directionAngle: 0, pivotX: null, pivotY: null, extraPresets: [] };
  }

  function loadSvgString(svgStr) {
    originalSvgString = svgStr;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return;
    currentSvg = svg;

    const area = $('#preview-area');
    if (area.classList.contains('slides-mode')) return;

    area.innerHTML = '';
    area.appendChild(document.importNode(svg, true));

    setTimeout(updateBoundary, 50);

    $('#empty-state').style.display = 'none';
    area.style.display = 'flex';
    $('#presets-section').style.display = '';
    $('#controls-section').style.display = '';
    $('#export-section').style.display = '';
    $('#history-section').style.display = '';
    $('#bg-section').style.display = '';
    $('#mode-section').style.display = '';
    $('#slides-section').classList.add('visible');
    $('#elements-panel').classList.add('visible');

    exitPiecesMode();
    zoomLevel = 1;
    applyZoom();
    setupZoom();
    setupBoundary();
    elementAnimations = {};
    selectedElementIndex = null;
    elementGroups = {};
    selectedGroupElements = [];
    selectedGroupId = null;
    nextGroupId = 1;
    renderElements();
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
    const scrollContainer = $('#elements-panel');
    const savedScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    grid.innerHTML = '';
    const svg = $('#preview-area svg');
    if (!svg) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    if (!elements.length) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    // Group controls header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-controls';
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'group-btn';
    toggleBtn.textContent = '☰ Seleccionar';
    toggleBtn.title = 'Seleccionar múltiples piezas';
    toggleBtn.addEventListener('click', toggleMultiSelectMode);
    groupHeader.appendChild(toggleBtn);

    const createBtn = document.createElement('button');
    createBtn.className = 'group-btn';
    createBtn.textContent = 'Grupo +';
    createBtn.title = 'Crear grupo con selección';
    createBtn.style.display = 'none';
    createBtn.addEventListener('click', createGroupFromSelection);
    groupHeader.appendChild(createBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'group-btn';
    clearBtn.textContent = '✕';
    clearBtn.title = 'Limpiar selección';
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', clearGroupSelection);
    groupHeader.appendChild(clearBtn);

    grid.appendChild(groupHeader);

    const origElements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');

    elements.forEach((el, i) => {
      const tag = el.tagName.toLowerCase();
      const name = el.getAttribute('id') || el.getAttribute('class') || `${tag} ${i + 1}`;

      if (!elementAnimations[i]) elementAnimations[i] = getDefaultElementConfig();

      const cfg = elementAnimations[i];
      const preset = cfg.presetId ? presets.find(p => p.id === cfg.presetId) : null;

      // Find which group this element belongs to
      const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(i));
      const group = groupId ? elementGroups[groupId] : null;

      const thumbSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      thumbSvg.setAttribute('viewBox', '0 0 200 200');
      const clone = el.cloneNode(true);
      try {
        const bbox = el.getBBox();
        if (bbox.width > 0 && bbox.height > 0) {
          const pad = 10;
          const scale = Math.min(180 / bbox.width, 180 / bbox.height, 5);
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('transform', `translate(100, 100) scale(${scale}) translate(${-cx}, ${-cy})`);
          g.appendChild(clone);
          thumbSvg.appendChild(g);
        } else {
          thumbSvg.appendChild(clone);
        }
      } catch (e) {
        thumbSvg.appendChild(clone);
      }

      const item = document.createElement('div');
      item.className = 'element-thumb' + (selectedElementIndex === i ? ' selected' : '');
      if (selectedGroupElements.includes(i)) item.classList.add('multi-selected');
      if (group) item.classList.add('grouped');
      item.dataset.index = i;

      const dot = document.createElement('span');
      dot.className = 'el-preset-dot';
      dot.style.background = preset ? preset.color : (group ? '#fff' : 'transparent');
      dot.style.border = preset ? 'none' : (group ? '2px solid ' + (group.color || '#666') : '1px dashed var(--border)');
      item.appendChild(dot);

      const thumbWrap = document.createElement('div');
      thumbWrap.appendChild(thumbSvg);
      item.appendChild(thumbWrap);

      const info = document.createElement('div');
      info.className = 'el-info';
      const groupLabel = group ? ` <span class="group-badge" style="background:${group.color || '#666'}">${group.name}</span>` : '';
      info.innerHTML = `<div class="el-name">${name}${groupLabel}</div><div class="el-type">${preset ? preset.name : (group ? group.name : '—')}</div>`;
      item.appendChild(info);

      const visBtn = document.createElement('button');
      visBtn.className = 'el-visibility';
      visBtn.innerHTML = '&#128065;';
      visBtn.title = 'Mostrar/Ocultar';
      visBtn.addEventListener('click', e => {
        e.stopPropagation();
        const original = origElements[i];
        if (!original) return;
        const hidden = original.style.display === 'none';
        original.style.display = hidden ? '' : 'none';
        visBtn.classList.toggle('hidden', !hidden);
        thumbSvg.style.opacity = hidden ? '0.3' : '1';
      });
      item.appendChild(visBtn);

      item.addEventListener('click', e => {
        // Toggle selection: click same element deselects
        if (selectedElementIndex === i) {
          selectedElementIndex = null;
          $$('.element-thumb').forEach(t => t.classList.remove('selected'));
          svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => el.classList.remove('element-selected'));
          return;
        }
        selectedElementIndex = i;
        selectElement(i);
      });
      item.addEventListener('contextmenu', e => {
        e.preventDefault();
        showContextMenu(e, selectedGroupElements.length >= 1 ? [...selectedGroupElements] : [i]);
      });

      grid.appendChild(item);
    });

    // Show existing groups
    if (Object.keys(elementGroups).length > 0) {
      const groupsSection = document.createElement('div');
      groupsSection.className = 'groups-section';
      groupsSection.innerHTML = '<div class="groups-title">Grupos</div>';
      Object.entries(elementGroups).forEach(([gid, group]) => {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        groupItem.style.borderLeftColor = group.color || '#666';
        groupItem.dataset.groupId = gid;
        if (selectedGroupId === gid) groupItem.classList.add('active');
        groupItem.innerHTML = `
          <span class="group-item-name">${group.name} (${group.elements.length} piezas)</span>
          <button class="group-delete-btn" title="Eliminar grupo">✕</button>
        `;
        groupItem.querySelector('.group-delete-btn').addEventListener('click', e => { e.stopPropagation(); deleteGroup(gid); });
        groupItem.addEventListener('click', () => selectGroup(gid));
        groupsSection.appendChild(groupItem);
      });
      grid.appendChild(groupsSection);
    }
    // Restore scroll position
    requestAnimationFrame(() => { if (scrollContainer) scrollContainer.scrollTop = savedScrollTop; });
  }

  // ===== GROUP MANAGEMENT =====

  const groupColors = ['#6c5ce7', '#e74c3c', '#2ecc71', '#f39c12', '#1abc9c', '#9b59b6', '#3498db', '#e67e22'];

  function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    const toggleBtn = $('#toggle-multiselect');
    const createBtn = $('#create-group-btn');
    const clearBtn = $('#clear-selection-btn');
    if (toggleBtn) toggleBtn.classList.toggle('active', isMultiSelectMode);
    if (isMultiSelectMode) {
      const svg = $('#preview-area svg');
      if (svg) {
        const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
        selectedGroupElements = Array.from(elements).map((_, i) => i);
      }
      if (createBtn) createBtn.style.display = selectedGroupElements.length >= 2 ? '' : 'none';
      if (clearBtn) clearBtn.style.display = '';
    } else {
      selectedGroupElements = [];
      if (createBtn) createBtn.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
    }
    updateSvgElementSelection();
    renderElements();
  }

  function toggleElementSelection(index) {
    const idx = selectedGroupElements.indexOf(index);
    if (idx === -1) {
      selectedGroupElements.push(index);
    } else {
      selectedGroupElements.splice(idx, 1);
    }
    updateSvgElementSelection();
    const createBtn = $('#create-group-btn');
    if (createBtn) createBtn.style.display = selectedGroupElements.length >= 2 ? '' : 'none';
    if (selectedGroupElements.length === 0 && isMultiSelectMode) {
      isMultiSelectMode = false;
      const toggleBtn = $('#toggle-multiselect');
      if (toggleBtn) toggleBtn.classList.remove('active');
      if (createBtn) createBtn.style.display = 'none';
      const clearBtn = $('#clear-selection-btn');
      if (clearBtn) clearBtn.style.display = 'none';
    }
    renderElements();
  }

  function updateSvgElementSelection() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    elements.forEach((el, i) => {
      el.classList.toggle('element-selected', selectedGroupElements.includes(i));
    });
  }

  function clearGroupSelection() {
    selectedGroupElements = [];
    const svg = $('#preview-area svg');
    if (svg) svg.querySelectorAll('.element-selected').forEach(el => el.classList.remove('element-selected'));
    isMultiSelectMode = false;
    const toggleBtn = $('#toggle-multiselect');
    if (toggleBtn) toggleBtn.classList.remove('active');
    const createBtn = $('#create-group-btn');
    if (createBtn) createBtn.style.display = 'none';
    const clearBtn = $('#clear-selection-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    renderElements();
  }

  function createGroupFromSelection(indices) {
    const items = indices || selectedGroupElements;
    if (items.length < 2) return;
    const name = prompt('Nombre del grupo:', `Grupo ${nextGroupId}`);
    if (!name) return;
    pushHistory();

    const color = groupColors[(nextGroupId - 1) % groupColors.length];
    const groupId = 'g' + nextGroupId++;

    // Get config from first selected element as template
    const firstIdx = items[0];
    const templateConfig = elementAnimations[firstIdx] ? { ...elementAnimations[firstIdx] } : getDefaultElementConfig();

    elementGroups[groupId] = {
      name: name,
      color: color,
      elements: [...items],
      config: templateConfig
    };

    // Apply same animation config to all elements in group
    items.forEach(idx => {
      elementAnimations[idx] = { ...templateConfig };
    });

    selectedGroupElements = [];
    isMultiSelectMode = false;
    selectedGroupId = groupId;
    renderElements();

    // Apply animations to group
    applyGroupAnimation(groupId);
    selectGroup(groupId);
  }

  function deleteGroup(groupId) {
    const group = elementGroups[groupId];
    if (!group) return;
    pushHistory();
    delete elementGroups[groupId];
    if (selectedGroupId === groupId) selectedGroupId = null;
    renderElements();
  }

  let selectedGroupId = null;

  function selectGroup(groupId) {
    const group = elementGroups[groupId];
    if (!group) return;

    selectedGroupId = groupId;

    // Highlight all elements in the group
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    svg.querySelectorAll('*').forEach(el => el.classList.remove('element-selected'));
    group.elements.forEach(idx => {
      if (elements[idx]) elements[idx].classList.add('element-selected');
    });

    // Show group config in controls
    if (group.config && group.config.presetId) {
      const preset = presets.find(p => p.id === group.config.presetId);
      if (preset) {
        $('#speed-slider').value = group.config.speed;
        updateSpeedDisplay(group.elements[0]);
        $('#delay-slider').value = group.config.delay;
        updateDelayDisplay(group.elements[0]);
        const translateBased = ['slide', 'bounce', 'shake', 'float', 'gravity', 'levitate', 'arc', 'radiate'];
        $('#oval-controls').style.display = group.config.presetId === 'oval' ? '' : 'none';
        $('#arc-controls').style.display = (group.config.presetId === 'arc' || group.config.presetId === 'radiate') ? '' : 'none';
        $('#direction-controls').style.display = translateBased.includes(group.config.presetId) ? '' : 'none';
      }
    }

    // Mark group items in the panel
    $$('.group-item').forEach(el => el.classList.toggle('active', el.dataset.groupId === groupId));

    // Select first element to show config
    if (group.elements.length > 0) {
      selectElement(group.elements[0]);
    }
  }

  function applyGroupAnimation(groupId) {
    const group = elementGroups[groupId];
    if (!group || !group.config || !group.config.presetId) return;

    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');

    group.elements.forEach(idx => {
      if (elements[idx]) {
        elementAnimations[idx] = { ...group.config };
        applyOneAnimation(idx);
      }
    });
  }

  function applyAllGroupAnimations() {
    Object.keys(elementGroups).forEach(gid => applyGroupAnimation(gid));
  }

  function selectElement(index) {
    selectedElementIndex = index;
    $$('.element-thumb').forEach(t => t.classList.toggle('selected', parseInt(t.dataset.index) === index));
    highlightElement(index);
    loadElementConfig(index);
    updatePivotMarker(index);
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
    if (index === null || index === undefined) return;
    const cfg = elementAnimations[index];
    if (!cfg) return;

    const activePresetIds = getAllActivePresets(cfg);
    if (activePresetIds.length > 0) {
      $$('.preset-btn').forEach(b => b.classList.toggle('active', activePresetIds.includes(b.dataset.id)));
    } else {
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    $('#speed-slider').value = cfg.speed;
    updateSpeedDisplay(index);
    $('#delay-slider').value = cfg.delay;
    updateDelayDisplay(index);

    $$('#iter-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === cfg.iter));
    $$('#dir-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === cfg.dir));

    const arcPresets = ['arc', 'radiate'];
    $('#oval-controls').style.display = cfg.presetId === 'oval' ? '' : 'none';
    $('#arc-controls').style.display = arcPresets.includes(cfg.presetId) ? '' : 'none';
    if (cfg.presetId === 'oval') {
      $('#oval-rx').value = cfg.ovalRx;
      $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
      $('#oval-ry').value = cfg.ovalRy;
      $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
      $('#oval-angle').value = cfg.ovalAngle;
      $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    }
    if (arcPresets.includes(cfg.presetId)) {
      $('#arc-rx').value = cfg.arcRx;
      $('#arc-rx-val').textContent = cfg.arcRx + 'px';
      $('#arc-ry').value = cfg.arcRy;
      $('#arc-ry-val').textContent = cfg.arcRy + 'px';
    }

    const translateBased = ['slide', 'bounce', 'shake', 'float', 'gravity', 'levitate', 'arc', 'radiate'];
    const showDirection = hasPreset && translateBased.includes(cfg.presetId);
    $('#direction-controls').style.display = showDirection ? '' : 'none';
    if (showDirection) {
      $('#direction-slider').value = cfg.directionAngle;
      $('#direction-value').textContent = cfg.directionAngle + '°';
      updateDirectionArrow(cfg.directionAngle);
    }
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
    if (selectedElementIndex === null && !Object.values(elementAnimations).some(c => c.presetId)) return;
    animationPlaying = true;
    applyAllAnimations();
    setAllAnimationsPlayState('running');
    $('#play-btn').classList.add('active');
    $('#pause-btn').classList.remove('active');
  }

  function pauseAnimation() {
    animationPlaying = false;
    setAllAnimationsPlayState('paused');
    $('#pause-btn').classList.add('active');
    $('#play-btn').classList.remove('active');
  }

  function stopAnimation() {
    animationPlaying = false;
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      el.style.animation = 'none';
    });
    void svg.offsetHeight;
    $('#play-btn').classList.remove('active');
    $('#pause-btn').classList.remove('active');

    requestAnimationFrame(() => {
      applyAllAnimations();
      if (animationPlaying) {
        setAllAnimationsPlayState('running');
        $('#play-btn').classList.add('active');
      }
    });
  }

  $('#play-btn').addEventListener('click', playAnimation);
  $('#pause-btn').addEventListener('click', pauseAnimation);
  $('#stop-btn').addEventListener('click', stopAnimation);

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
      case 'levitate':
        kf = `@keyframes ${name} { 0%,100% { transform: translate(0,0); } 25% { transform: translate(${-12*cos}px,${-12*sin}px); } 50% { transform: translate(${-25*cos}px,${-25*sin}px); } 75% { transform: translate(${-12*cos}px,${-12*sin}px); } }`;
        break;
      case 'arc':
        kf = `@keyframes ${name} { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-sin})); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); } 50% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-ry,80px) * ${sin}), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * ${-cos})); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${sin})); } }`;
        break;
      case 'radiate':
        kf = `@keyframes ${name} { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-sin})); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 50% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-ry,80px) * ${sin}), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * ${-cos})); filter: drop-shadow(0 0 24px rgba(230,126,34,0.9)); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${sin})); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } }`;
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

  function getElementCenter(el) {
    try {
      const bbox = el.getBBox();
      return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
    } catch (e) {
      return { x: 100, y: 100 };
    }
  }

  function applyOneAnimation(index) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = elements[index];
    if (!el) return;
    const cfg = elementAnimations[index];
    if (!cfg || !cfg.presetId) {
      el.style.removeProperty('animation');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
      return;
    }

    const center = getElementCenter(el);
    el.style.transformOrigin = `${center.x}px ${center.y}px`;
    el.style.transformBox = 'view-box';

    const activeIds = getAllActivePresets(cfg);
    const easingMap = {};
    activeIds.forEach(id => {
      const p = presets.find(pr => pr.id === id);
      if (p) easingMap[id] = p.easing;
    });
    const mainEasing = easingMap[cfg.presetId] || 'ease-in-out';

    // Build comma-separated animation string for all active presets
    const parts = [];
    activeIds.forEach(id => {
      const e = easingMap[id] || 'ease-in-out';
      const animName = getAnimationName(id, cfg.directionAngle);
      parts.push(`${animName} ${cfg.speed}s ${e} ${cfg.iter} ${cfg.dir}`);
    });
    el.style.animation = parts.join(', ');
    el.style.animationDelay = cfg.delay + 's';
    el.style.animationPlayState = animationPlaying ? 'running' : 'paused';

    // Set CSS vars for configurable presets (check all active presets)
    const hasArc = activeIds.some(isArcPreset);
    const hasOval = activeIds.includes('oval');
    if (hasOval) {
      el.style.setProperty('--oval-rx', cfg.ovalRx + 'px');
      el.style.setProperty('--oval-ry', cfg.ovalRy + 'px');
    }
    if (hasArc) {
      el.style.setProperty('--arc-rx', cfg.arcRx + 'px');
      el.style.setProperty('--arc-ry', cfg.arcRy + 'px');
      const pivotCx = cfg.pivotX !== null ? cfg.pivotX : center.x;
      const pivotCy = cfg.pivotY !== null ? cfg.pivotY : center.y;
      el.style.setProperty('--arc-offset-x', (pivotCx - center.x) + 'px');
      el.style.setProperty('--arc-offset-y', (pivotCy - center.y) + 'px');
    }

    if (cfg.presetId === 'draw') {
      const length = el.getTotalLength ? el.getTotalLength() : 1000;
      el.style.strokeDasharray = length;
      el.style.setProperty('--path-length', length);
    }

    updatePivotMarker(index);
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

  function togglePreset(id) {
    if (selectedElementIndex === null) {
      const first = $('#element-grid .element-thumb');
      if (first) selectElement(parseInt(first.dataset.index));
      else return;
    }
    pushHistory();
    const cfg = getConfigForSelected();
    if (!cfg) return;

    // Toggle logic
    if (cfg.presetId === id) {
      // Toggle off primary
      if (cfg.extraPresets && cfg.extraPresets.length > 0) {
        cfg.presetId = cfg.extraPresets.shift();
      } else {
        cfg.presetId = null;
      }
    } else if (cfg.extraPresets && cfg.extraPresets.includes(id)) {
      // Remove from extras
      cfg.extraPresets = cfg.extraPresets.filter(pid => pid !== id);
    } else {
      // Add new preset: make it primary, push old primary to extras
      if (cfg.presetId) {
        cfg.extraPresets = cfg.extraPresets || [];
        if (!cfg.extraPresets.includes(cfg.presetId)) cfg.extraPresets.push(cfg.presetId);
      }
      cfg.presetId = id;
    }

    updateControlsForPreset(cfg.presetId);

    // Apply to group or single
    const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(selectedElementIndex));
    if (groupId) {
      const group = elementGroups[groupId];
      group.config = { ...cfg };
      group.elements.forEach(idx => {
        elementAnimations[idx] = { ...cfg };
        applyOneAnimation(idx);
      });
    } else {
      applyOneAnimation(selectedElementIndex);
    }
    renderElements();
  }

  function updateControlsForPreset(primaryId) {
    if (primaryId) {
      $('#speed-slider').value = elementAnimations[selectedElementIndex]?.speed || 16;
      updateSpeedDisplay(selectedElementIndex);
    }
    $('#oval-controls').style.display = primaryId === 'oval' ? '' : 'none';
    $('#arc-controls').style.display = isArcPreset(primaryId) ? '' : 'none';
    $('#direction-controls').style.display = isTranslateBased(primaryId) ? '' : 'none';
  }

  function updateSpeedDisplay(index) {
    const cfg = index !== undefined ? elementAnimations[index] : getConfigForSelected();
    if (cfg) $('#speed-value').textContent = cfg.speed.toFixed(1) + 's';
    else $('#speed-value').textContent = '1.0s';
  }
  function updateDelayDisplay(index) {
    const cfg = index !== undefined ? elementAnimations[index] : getConfigForSelected();
    if (cfg) $('#delay-value').textContent = cfg.delay.toFixed(1) + 's';
    else $('#delay-value').textContent = '0.0s';
  }

  // Controls
  function syncGroupValue(index, key, value) {
    const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(index));
    if (!groupId) return;
    const group = elementGroups[groupId];
    group.config[key] = value;
    group.elements.forEach(idx => {
      if (elementAnimations[idx]) elementAnimations[idx][key] = value;
    });
  }

  function saveSliderHistory() { pushHistory(); }

  $('#speed-slider').addEventListener('input', e => {
    if (selectedElementIndex === null) return;
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.speed = parseFloat(e.target.value);
    syncGroupValue(selectedElementIndex, 'speed', cfg.speed);
    updateSpeedDisplay(selectedElementIndex);
    applyOneAnimation(selectedElementIndex);
  });
  $('#speed-slider').addEventListener('change', saveSliderHistory);
  $('#speed-max').addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    if (val > 0) {
      $('#speed-slider').max = val;
      if (parseFloat($('#speed-slider').value) > val) $('#speed-slider').value = val;
    }
  });

  $('#delay-slider').addEventListener('input', e => {
    if (selectedElementIndex === null) return;
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.delay = parseFloat(e.target.value);
    syncGroupValue(selectedElementIndex, 'delay', cfg.delay);
    updateDelayDisplay(selectedElementIndex);
    applyOneAnimation(selectedElementIndex);
  });
  $('#delay-slider').addEventListener('change', saveSliderHistory);

  $$('#iter-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedElementIndex === null) return;
      pushHistory();
      const cfg = getConfigForSelected();
      if (!cfg) return;
      $$('#iter-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cfg.iter = btn.dataset.val;
      syncGroupValue(selectedElementIndex, 'iter', cfg.iter);
      applyOneAnimation(selectedElementIndex);
    });
  });

  $$('#dir-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedElementIndex === null) return;
      pushHistory();
      const cfg = getConfigForSelected();
      if (!cfg) return;
      $$('#dir-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cfg.dir = btn.dataset.val;
      syncGroupValue(selectedElementIndex, 'dir', cfg.dir);
      applyOneAnimation(selectedElementIndex);
    });
  });

  // Direction angle slider
  $('#direction-slider').addEventListener('input', e => {
    if (selectedElementIndex === null) return;
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.directionAngle = parseFloat(e.target.value);
    syncGroupValue(selectedElementIndex, 'directionAngle', cfg.directionAngle);
    $('#direction-value').textContent = cfg.directionAngle + '°';
    updateDirectionArrow(cfg.directionAngle);
    applyOneAnimation(selectedElementIndex);
    renderElements();
  });
  $('#direction-slider').addEventListener('change', saveSliderHistory);

  // Oval controls
  $('#oval-rx').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRx = parseInt(e.target.value);
    $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#oval-rx').addEventListener('change', saveSliderHistory);
  $('#oval-ry').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRy = parseInt(e.target.value);
    $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#oval-ry').addEventListener('change', saveSliderHistory);
  $('#oval-angle').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalAngle = parseInt(e.target.value);
    $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    applyOneAnimation(selectedElementIndex);
  });
  $('#oval-angle').addEventListener('change', saveSliderHistory);

  // Arc controls
  $('#arc-rx').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.arcRx = parseInt(e.target.value);
    $('#arc-rx-val').textContent = cfg.arcRx + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#arc-rx').addEventListener('change', saveSliderHistory);
  $('#arc-ry').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.arcRy = parseInt(e.target.value);
    $('#arc-ry-val').textContent = cfg.arcRy + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#arc-ry').addEventListener('change', saveSliderHistory);

  // Pieces mode
  $('#mode-toggle').addEventListener('click', () => {
    if (isPiecesMode) exitPiecesMode();
    else enterPiecesMode();
  });

  function bakeAnimations() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      if (el.style.animation) {
        const computed = getComputedStyle(el).transform;
        el.dataset.savedAnim = el.style.animation;
        el.dataset.savedOrigin = el.style.transformOrigin;
        el.style.animation = 'none';
        el.style.transform = computed !== 'none' ? computed : '';
      }
    });
  }

  function restoreAnimations() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text').forEach(el => {
      if (el.dataset.savedAnim) {
        el.style.animation = el.dataset.savedAnim;
        el.style.transformOrigin = el.dataset.savedOrigin || 'center center';
        delete el.dataset.savedAnim;
        delete el.dataset.savedOrigin;
      }
    });
  }

  function enterPiecesMode() {
    isPiecesMode = true;
    $('#mode-toggle').classList.add('active');
    $('#mode-toggle').textContent = 'Salir del modo piezas';
    $('#mode-hint').textContent = 'Click para seleccionar, arrastrar para mover. ESC para deseleccionar.';
    const area = $('#preview-area');
    area.classList.add('mode-select');
    const svg = area.querySelector('svg');
    if (!svg) return;
    bakeAnimations();
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.addEventListener('pointerdown', onElementPointerDown);
      el.addEventListener('contextmenu', onElementContextMenu);
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
    if (!svg) { selectedElement = null; return; }
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.removeEventListener('pointerdown', onElementPointerDown);
      el.removeEventListener('contextmenu', onElementContextMenu);
      el.classList.remove('element-selected');
      el.style.removeProperty('transform');
    });
    restoreAnimations();
    const marker = $('#pivot-marker');
    if (marker) marker.style.display = 'none';
    setAllAnimationsPlayState(animationPlaying ? 'running' : 'paused');
    selectedElement = null;
  }

  function getSvgViewBox(svgEl) {
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
      const parts = vb.trim().split(/\s+/).map(Number);
      if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) return { w: parts[2], h: parts[3] };
    }
    return { w: 200, h: 200 };
  }

  function onElementPointerDown(e) {
    e.stopPropagation();
    e.preventDefault();
    const el = e.currentTarget;
    if (e.ctrlKey || e.metaKey) {
      const i = getElementIndex(el);
      if (i !== -1) toggleElementSelection(i);
    }
    if (selectedElement && selectedElement !== el) selectedElement.classList.remove('element-selected');
    selectedElement = el;
    selectedElement.classList.add('element-selected');
    const svgEl = $('#preview-area svg');
    const vb = getSvgViewBox(svgEl);
    dragState = { element: selectedElement, startClientX: e.clientX, startClientY: e.clientY, svgRect: svgEl.getBoundingClientRect(), vbW: vb.w, vbH: vb.h };
    document.addEventListener('pointermove', onElementPointerMove);
    document.addEventListener('pointerup', onElementPointerUp);
  }

  function onElementPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startClientX;
    const dy = e.clientY - dragState.startClientY;
    const svgRect = dragState.svgRect;
    dragState.element.style.transform = `translate(${dx * dragState.vbW / svgRect.width}px, ${dy * dragState.vbH / svgRect.height}px)`;
  }

  function onElementPointerUp() {
    if (!dragState) return;
    document.removeEventListener('pointermove', onElementPointerMove);
    document.removeEventListener('pointerup', onElementPointerUp);
    dragState = null;
  }

  function getElementIndex(el) {
    const svg = $('#preview-area svg');
    if (!svg) return -1;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === el) return i;
    }
    return -1;
  }

  function getElementByIndex(index) {
    const svg = $('#preview-area svg');
    if (!svg) return null;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    return elements[index] || null;
  }

  // ===== PIVOT MARKER =====

  let pivotDragState = null;

  function isArcPreset(id) { return id === 'arc' || id === 'radiate'; }
  function isTranslateBased(id) { return ['slide', 'bounce', 'shake', 'float', 'gravity', 'levitate', 'arc', 'radiate'].includes(id); }

  function updatePivotMarker(index) {
    const marker = $('#pivot-marker');
    if (!marker) return;
    const el = getElementByIndex(index);
    const cfg = elementAnimations[index];
    const activeIds = getAllActivePresets(cfg);
    if (!el || !cfg || !activeIds.some(isArcPreset) || !isPiecesMode) {
      marker.style.display = 'none';
      return;
    }
    const center = getElementCenter(el);
    const px = cfg.pivotX !== null ? cfg.pivotX : center.x;
    const py = cfg.pivotY !== null ? cfg.pivotY : center.y;
    const svgEl = $('#preview-area svg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const vb = getSvgViewBox(svgEl);
    const scaleX = rect.width / vb.w;
    const scaleY = rect.height / vb.h;
    marker.style.left = (rect.left + px * scaleX) + 'px';
    marker.style.top = (rect.top + py * scaleY) + 'px';
    marker.dataset.pivotIndex = index;
    marker.style.display = 'block';
  }

  // Pivot drag with pointer events
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#pivot-marker')) return;
    e.preventDefault();
    e.stopPropagation();
    const marker = $('#pivot-marker');
    if (!marker || marker.style.display === 'none') return;
    const idx = parseInt(marker.dataset.pivotIndex);
    if (isNaN(idx)) return;
    const svgEl = $('#preview-area svg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const vb = getSvgViewBox(svgEl);
    pivotDragState = { index: idx, svgRect: rect, vbW: vb.w, vbH: vb.h, lastX: e.clientX, lastY: e.clientY };
    document.addEventListener('pointermove', onPivotPointerMove);
    document.addEventListener('pointerup', onPivotPointerUp);
  });

  function syncGroupPivot(index, pivotX, pivotY) {
    const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(index));
    if (!groupId) return;
    const group = elementGroups[groupId];
    group.config.pivotX = pivotX;
    group.config.pivotY = pivotY;
    group.elements.forEach(idx => {
      if (elementAnimations[idx]) {
        elementAnimations[idx].pivotX = pivotX;
        elementAnimations[idx].pivotY = pivotY;
        applyOneAnimation(idx);
      }
    });
  }

  function onPivotPointerMove(e) {
    if (!pivotDragState) return;
    e.preventDefault();
    const ds = pivotDragState;
    const dx = (e.clientX - ds.lastX) * ds.vbW / ds.svgRect.width;
    const dy = (e.clientY - ds.lastY) * ds.vbH / ds.svgRect.height;
    const cfg = elementAnimations[ds.index];
    const el = getElementByIndex(ds.index);
    if (!cfg || !el) return;
    const center = getElementCenter(el);
    const newPivotX = (cfg.pivotX !== null ? cfg.pivotX : center.x) + dx;
    const newPivotY = (cfg.pivotY !== null ? cfg.pivotY : center.y) + dy;
    cfg.pivotX = newPivotX;
    cfg.pivotY = newPivotY;
    pivotDragState.lastX = e.clientX;
    pivotDragState.lastY = e.clientY;
    syncGroupPivot(ds.index, newPivotX, newPivotY);
    applyOneAnimation(ds.index);
    updatePivotMarker(ds.index);
  }

  function onPivotPointerUp() {
    if (!pivotDragState) return;
    document.removeEventListener('pointermove', onPivotPointerMove);
    document.removeEventListener('pointerup', onPivotPointerUp);
    pushHistory();
    pivotDragState = null;
  }

  function getAnimationName(presetId, angle) {
    const hasAngle = angle && angle !== 0;
    if (isTranslateBased(presetId) && hasAngle) {
      return ensureDirectionKeyframes(presetId, angle);
    }
    return 'svg' + presetId.charAt(0).toUpperCase() + presetId.slice(1);
  }

  function getAllActivePresets(cfg) {
    const presets = [];
    if (cfg.presetId) presets.push(cfg.presetId);
    if (cfg.extraPresets) cfg.extraPresets.forEach(id => { if (!presets.includes(id)) presets.push(id); });
    return presets;
  }

  // ===== CONTEXT MENU =====

  let contextMenuTargets = [];

  function showContextMenu(e, indices) {
    e.preventDefault();
    e.stopPropagation();
    hideContextMenu();
    contextMenuTargets = indices;
    const menu = $('#context-menu');
    if (!menu) return;

    menu.innerHTML = '';

    addMenuItem(menu, 'Agrupar', () => {
      if (contextMenuTargets.length >= 2) createGroupFromSelection(contextMenuTargets);
      hideContextMenu();
    });
    addMenuItem(menu, 'Desagrupar', () => {
      contextMenuTargets.forEach(i => {
        Object.keys(elementGroups).forEach(gid => {
          const g = elementGroups[gid];
          const pos = g.elements.indexOf(i);
          if (pos !== -1) {
            g.elements.splice(pos, 1);
            if (g.elements.length < 2) delete elementGroups[gid];
          }
        });
      });
      hideContextMenu();
      renderElements();
    });
    addMenuItem(menu, 'Ver', () => {
      contextMenuTargets.forEach(i => { const el = getElementByIndex(i); if (el) el.style.display = ''; });
      hideContextMenu();
      renderElements();
    });
    addMenuItem(menu, 'Ocultar', () => {
      contextMenuTargets.forEach(i => { const el = getElementByIndex(i); if (el) el.style.display = 'none'; });
      hideContextMenu();
      renderElements();
    });
    addMenuItem(menu, 'Eliminar', () => { contextMenuTargets.forEach(i => removeElement(i)); hideContextMenu(); renderElements(); });

    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    let x = e.clientX, y = e.clientY;
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 10;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  function addMenuItem(menu, label, fn) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', fn);
    menu.appendChild(btn);
  }

  function hideContextMenu() {
    const menu = $('#context-menu');
    if (menu) menu.style.display = 'none';
    contextMenuTargets = [];
  }

  function removeElement(index) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const el = elements[index];
    if (el) {
      el.remove();
      delete elementAnimations[index];
      // Remove element from any groups
      Object.keys(elementGroups).forEach(gid => {
        const g = elementGroups[gid];
        const pos = g.elements.indexOf(index);
        if (pos !== -1) g.elements.splice(pos, 1);
        if (g.elements.length < 2) delete elementGroups[gid];
      });
    }
    renderElements();
    applyAllAnimations();
  }

  function toggleVisibility(indices) {
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    indices.forEach(i => {
      const el = elements[i];
      if (!el) return;
      el.style.display = el.style.display === 'none' ? '' : 'none';
    });
  }

  function onElementContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    const idx = getElementIndex(el);
    if (idx === -1) return;
    if (e.ctrlKey || e.metaKey) {
      if (!selectedGroupElements.includes(idx)) toggleElementSelection(idx);
      showContextMenu(e, [...selectedGroupElements]);
      return;
    }
    // If clicked element is in current selection, act on all selected
    if (selectedGroupElements.includes(idx) && selectedGroupElements.length >= 2) {
      showContextMenu(e, [...selectedGroupElements]);
    } else {
      // Otherwise act only on the clicked element
      selectedGroupElements = [idx];
      updateSvgElementSelection();
      renderElements();
      showContextMenu(e, [idx]);
    }
  }

  // Close context menu on click outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#context-menu')) hideContextMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideContextMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isPiecesMode) {
      if (selectedGroupElements.length) {
        clearGroupSelection();
      } else if (selectedElement) {
        selectedElement.classList.remove('element-selected');
        selectedElement.style.removeProperty('transform');
        selectedElement = null;
      }
    }
  });

  // ===== EXPORT =====

  $('#export-btn').addEventListener('click', () => {
    if (!currentSvg) return;
    const svg = $('#preview-area svg');
    const clone = svg.cloneNode(true);
    clone.removeAttribute('class');
    clone.querySelectorAll('style#dir-keyframes').forEach(s => s.remove());

    const elements = clone.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');

    let embeddedStyle = '';
    let elementStyles = '';

    function getExportKeyframe(id, angle) {
      const hasAngle = angle && angle !== 0;
      if (!hasAngle) return null;
      const rad = angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      switch (id) {
        case 'slide': return `@keyframes ${id}_export_${i}_${angle} { 0%,100% { transform: translate(${-80*cos}px,${-80*sin}px); } 50% { transform: translate(${80*cos}px,${80*sin}px); } }`;
        case 'bounce': return `@keyframes ${id}_export_${i}_${angle} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${20*cos}px,${20*sin}px); } }`;
        case 'shake': return `@keyframes ${id}_export_${i}_${angle} { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(${-8*cos}px,${-8*sin}px); } 20%,40%,60%,80% { transform: translate(${8*cos}px,${8*sin}px); } }`;
        case 'float': return `@keyframes ${id}_export_${i}_${angle} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${15*cos}px,${15*sin}px); } }`;
        case 'levitate': return `@keyframes ${id}_export_${i}_${angle} { 0%,100% { transform: translate(0,0); } 25% { transform: translate(${-12*cos}px,${-12*sin}px); } 50% { transform: translate(${-25*cos}px,${-25*sin}px); } 75% { transform: translate(${-12*cos}px,${-12*sin}px); } }`;
        case 'arc': return `@keyframes ${id}_export_${i}_${angle} { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-sin})); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); } 50% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-ry,80px) * ${sin}), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * ${-cos})); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${sin})); } }`;
        case 'radiate': return `@keyframes ${id}_export_${i}_${angle} { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-sin})); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${-0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${-0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 50% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-ry,80px) * ${sin}), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * ${-cos})); filter: drop-shadow(0 0 24px rgba(230,126,34,0.9)); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${0.7071*cos} + var(--arc-ry,80px) * ${0.7071*sin}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${0.7071*sin} + var(--arc-ry,80px) * ${-0.7071*cos})); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * ${cos}), calc(var(--arc-offset-y,0px) + var(--arc-rx,80px) * ${sin})); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } }`;
        case 'gravity': return `@keyframes ${id}_export_${i}_${angle} { 0% { transform: translate(${-100*cos}px,${-100*sin}px); } 30% { transform: translate(${80*cos}px,${80*sin}px); } 50% { transform: translate(${-40*cos}px,${-40*sin}px); } 70% { transform: translate(${30*cos}px,${30*sin}px); } 85% { transform: translate(${-10*cos}px,${-10*sin}px); } 100% { transform: translate(0,0); } }`;
      }
      return null;
    }

    function getBaseKeyframeName(id) {
      const map = { rotate: 'svgRotate', wheel: 'svgWheel', pulse: 'svgPulse', bounce: 'svgBounce', gravity: 'svgGravity', slide: 'svgSlide', oval: 'svgOval', fade: 'svgFade', draw: 'svgDraw', shake: 'svgShake', float: 'svgFloat', levitate: 'svgLevitate', arc: 'svgArc', radiate: 'svgRadiate', spin: 'svgSpin', glow: 'svgGlow' };
      return map[id] || null;
    }

    function ensureExportKeyframe(id) {
      const name = getBaseKeyframeName(id);
      if (!name || embeddedStyle.includes(name)) return name;
      const kfs = {
        svgRotate: `@keyframes svgRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
        svgWheel: `@keyframes svgWheel { 0% { transform: rotate(0deg); } 25% { transform: rotate(90deg); } 50% { transform: rotate(180deg); } 75% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }`,
        svgPulse: `@keyframes svgPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }`,
        svgBounce: `@keyframes svgBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`,
        svgGravity: `@keyframes svgGravity { 0% { transform: translateY(-100px); } 30% { transform: translateY(80px); } 50% { transform: translateY(-40px); } 70% { transform: translateY(30px); } 85% { transform: translateY(-10px); } 100% { transform: translateY(0); } }`,
        svgSlide: `@keyframes svgSlide { 0%,100% { transform: translateX(-80px); } 50% { transform: translateX(80px); } }`,
        svgOval: `@keyframes svgOval { 0% { transform: translate(0,0); } 25% { transform: translate(var(--oval-rx,80px),0); } 50% { transform: translate(0,var(--oval-ry,40px)); } 75% { transform: translate(calc(-1*var(--oval-rx,80px)),0); } 100% { transform: translate(0,0); } }`,
        svgFade: `@keyframes svgFade { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }`,
        svgDraw: `@keyframes svgDraw { from { stroke-dashoffset: var(--path-length,1000); } to { stroke-dashoffset: 0; } }`,
        svgShake: `@keyframes svgShake { 0%,100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-8px); } 20%,40%,60%,80% { transform: translateX(8px); } }`,
        svgFloat: `@keyframes svgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`,
        svgLevitate: `@keyframes svgLevitate { 0%,100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-12px) scale(1.02); } 50% { transform: translateY(-25px) scale(0.98); } 75% { transform: translateY(-12px) scale(1.01); } }`,
        svgArc: `@keyframes svgArc { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * -1), calc(var(--arc-offset-y,0px))); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * -0.7071), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -0.7071)); } 50% { transform: translate(calc(var(--arc-offset-x,0px)), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -1)); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * 0.7071), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -0.7071)); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * 1), calc(var(--arc-offset-y,0px))); } }`,
        svgRadiate: `@keyframes svgRadiate { 0% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * -1), calc(var(--arc-offset-y,0px))); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } 25% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * -0.7071), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -0.7071)); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 50% { transform: translate(calc(var(--arc-offset-x,0px)), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -1)); filter: drop-shadow(0 0 24px rgba(230,126,34,0.9)); } 75% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * 0.7071), calc(var(--arc-offset-y,0px) + var(--arc-ry,80px) * -0.7071)); filter: drop-shadow(0 0 8px rgba(230,126,34,0.4)); } 100% { transform: translate(calc(var(--arc-offset-x,0px) + var(--arc-rx,80px) * 1), calc(var(--arc-offset-y,0px))); filter: drop-shadow(0 0 2px rgba(230,126,34,0.2)); } }`,
        svgSpin: `@keyframes svgSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.85); } 100% { transform: rotate(360deg) scale(1); } }`,
        svgGlow: `@keyframes svgGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(108,92,231,0.3)); } 50% { filter: drop-shadow(0 0 24px rgba(108,92,231,0.9)); } }`,
      };
      if (kfs[name]) { embeddedStyle += kfs[name] + '\n'; }
      return name;
    }

    elements.forEach((el, i) => {
      const cfg = elementAnimations[i];
      if (!cfg || !cfg.presetId) return;
      const activeIds = getAllActivePresets(cfg);

      // Build vars from applicable presets
      let varsStr = '';
      const center = getElementCenter(svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text')[i]);
      activeIds.forEach(id => {
        if (id === 'oval') varsStr += `--oval-rx: ${cfg.ovalRx}px; --oval-ry: ${cfg.ovalRy}px; `;
        if (isArcPreset(id)) {
          varsStr += `--arc-rx: ${cfg.arcRx}px; --arc-ry: ${cfg.arcRy}px; `;
          const pivotCx = cfg.pivotX !== null ? cfg.pivotX : center.x;
          const pivotCy = cfg.pivotY !== null ? cfg.pivotY : center.y;
          varsStr += `--arc-offset-x: ${(pivotCx - center.x)}px; --arc-offset-y: ${(pivotCy - center.y)}px; `;
        }
        if (id === 'draw') varsStr += 'stroke-dasharray: 1000; --path-length: 1000; ';
      });

      // Build comma-separated animation string
      const animParts = activeIds.map(id => {
        const isTB = isTranslateBased(id);
        const hasAngle = cfg.directionAngle && cfg.directionAngle !== 0;
        let aName;
        if (isTB && hasAngle) {
          const kf = getExportKeyframe(id, cfg.directionAngle);
          if (kf && !embeddedStyle.includes(`${id}_export_${i}_${cfg.directionAngle}`)) embeddedStyle += kf + '\n';
          aName = `${id}_export_${i}_${cfg.directionAngle}`;
        } else {
          aName = ensureExportKeyframe(id);
        }
        const p = presets.find(pr => pr.id === id);
        const e = p ? p.easing : 'ease-in-out';
        return `${aName} ${cfg.speed}s ${e} ${cfg.iter} ${cfg.dir}`;
      });

      const easing = animParts.length > 0 ? 'ease-in-out' : '';

      el.setAttribute('data-anim-index', i);

      let originCx = 100, originCy = 100;
      const origEl = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text')[i];
      if (origEl) {
        try {
          const bbox = origEl.getBBox();
          originCx = bbox.x + bbox.width / 2;
          originCy = bbox.y + bbox.height / 2;
        } catch (e) {}
      }

      elementStyles += `[data-anim-index="${i}"] { transform-origin: ${originCx}px ${originCy}px; transform-box: view-box; ${varsStr}animation: ${animParts.join(', ')}; animation-delay: ${cfg.delay}s; }\n`;
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
  $('#transition-speed').addEventListener('input', e => {
    transitionSpeed = parseFloat(e.target.value);
    $('#transition-speed-val').textContent = transitionSpeed.toFixed(1) + 's';
    const preview = $('#preview-area');
    if (preview) preview.style.setProperty('--transition-speed', transitionSpeed + 's');
  });

  // Undo/Redo/Reset button handlers
  $('#undo-btn').addEventListener('click', undo);
  $('#redo-btn').addEventListener('click', redo);
  $('#reset-btn').addEventListener('click', resetAll);

  // Boundary toggle
  $('#boundary-toggle').addEventListener('click', toggleBoundary);

  // Background image upload
  $('#bg-upload-btn').addEventListener('click', () => $('#bg-file-input').click());
  $('#bg-file-input').addEventListener('change', e => {
    if (e.target.files.length) { addBackgroundImage(e.target.files[0]); e.target.value = ''; }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.ctrlKey && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
    else if (e.ctrlKey && e.key === 'Z' && e.shiftKey) { e.preventDefault(); redo(); }
    else if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    else if (e.ctrlKey && e.key === 'Z') { e.preventDefault(); undo(); }
  });

  // Keyboard shortcut for play/pause
  document.addEventListener('keydown', e => {
    if (e.key === ' ' && !isPiecesMode && !e.target.matches('input, button, textarea')) {
      e.preventDefault();
      if (animationPlaying) pauseAnimation();
      else playAnimation();
    }
  });

})();
