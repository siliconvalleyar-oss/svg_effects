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
  let currentPreset = null;
  let settings = { speed: 1, delay: 0, iter: 'infinite', dir: 'normal' };
  let ovalSettings = { rx: 80, ry: 40, angle: 0 };
  let isPiecesMode = false;
  let selectedElement = null;
  let dragState = null;
  let animationPlaying = true;

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
  const availableFiles = ['sample.svg'];

  function renderFileList() {
    fileList.innerHTML = '';
    availableFiles.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'file-item';
      btn.innerHTML = `<svg class="file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="1" width="12" height="14" rx="2"/><path d="M5 5h6M5 8h6M5 11h3"/></svg>${name}`;
      btn.addEventListener('click', () => loadFromServer(name));
      fileList.appendChild(btn);
    });
  }

  async function loadFromServer(name) {
    try {
      const res = await fetch('files/' + name);
      if (!res.ok) return;
      const text = await res.text();
      loadSvgString(text);
      $$('.file-item').forEach(b => b.classList.toggle('active', b.textContent.trim() === name));
    } catch (e) {
      console.error('Error loading file:', e);
    }
  }

  renderFileList();

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
    renderElements();
    if (currentPreset) applyAnimation();
  }

  function loadFile(file) {
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) return;
    const reader = new FileReader();
    reader.onload = e => loadSvgString(e.target.result);
    reader.readAsText(file);
  }

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

      // Create mini SVG thumbnail
      const thumbSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      thumbSvg.setAttribute('viewBox', '0 0 200 200');
      thumbSvg.appendChild(el.cloneNode(true));

      const item = document.createElement('div');
      item.className = 'element-thumb';
      item.dataset.index = i;
      item.innerHTML = '';

      const thumbWrap = document.createElement('div');
      thumbWrap.appendChild(thumbSvg);
      item.appendChild(thumbWrap);

      const info = document.createElement('div');
      info.className = 'el-info';
      info.innerHTML = `<div class="el-name">${name}</div><div class="el-type">&lt;${tag}&gt;</div>`;
      item.appendChild(info);

      const visBtn = document.createElement('button');
      visBtn.className = 'el-visibility';
      visBtn.innerHTML = '&#128065;';
      visBtn.title = 'Mostrar/Ocultar';
      visBtn.addEventListener('click', e => {
        e.stopPropagation();
        const original = $$(`#preview-area svg ${tag}`)[i];
        if (!original) return;
        const hidden = original.style.display === 'none';
        original.style.display = hidden ? '' : 'none';
        visBtn.classList.toggle('hidden', !hidden);
        thumbSvg.style.opacity = hidden ? '0.3' : '1';
      });
      item.appendChild(visBtn);

      item.addEventListener('click', () => {
        $$('.element-thumb').forEach(t => t.classList.remove('selected'));
        item.classList.add('selected');
        highlightElement(i);
      });

      grid.appendChild(item);
    });
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

  // ===== PLAYBACK CONTROLS =====

  function playAnimation() {
    const svg = $('#preview-area svg');
    if (!svg || !currentPreset) return;
    animationPlaying = true;
    svg.style.animationPlayState = 'running';
    $('#play-btn').classList.add('active');
    $('#pause-btn').classList.remove('active');
  }

  function pauseAnimation() {
    const svg = $('#preview-area svg');
    if (!svg) return;
    animationPlaying = false;
    svg.style.animationPlayState = 'paused';
    $('#pause-btn').classList.add('active');
    $('#play-btn').classList.remove('active');
  }

  function stopAnimation() {
    const svg = $('#preview-area svg');
    if (!svg || !currentPreset) return;
    animationPlaying = false;
    svg.style.animationPlayState = 'paused';
    svg.style.animation = 'none';
    svg.offsetHeight;
    svg.style.animation = '';
    svg.classList.remove(...presets.map(p => 'anim-' + p.id));
    $('#play-btn').classList.remove('active');
    $('#pause-btn').classList.remove('active');
    setTimeout(() => {
      svg.classList.add('anim-' + currentPreset);
      svg.style.animationPlayState = 'running';
      animationPlaying = true;
      $('#play-btn').classList.add('active');
    }, 50);
  }

  $('#play-btn').addEventListener('click', playAnimation);
  $('#pause-btn').addEventListener('click', pauseAnimation);
  $('#stop-btn').addEventListener('click', stopAnimation);

  // ===== ANIMATION ENGINE =====

  function prepareSvgForAnimation(svg) {
    svg.removeAttribute('class');
    svg.style.transformOrigin = 'center center';
    svg.style.transformBox = 'fill-box';
    if (currentPreset === 'draw') {
      svg.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect').forEach(el => {
        const length = el.getTotalLength ? el.getTotalLength() : 1000;
        el.style.strokeDasharray = length;
        el.style.setProperty('--path-length', length);
      });
    }
  }

  function selectPreset(id) {
    currentPreset = id;
    $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    const preset = presets.find(p => p.id === id);
    $('#speed-slider').value = preset.duration;
    settings.speed = preset.duration;
    updateSpeedDisplay();
    $('#oval-controls').style.display = id === 'oval' ? '' : 'none';
    applyAnimation();
  }

  function applyAnimation() {
    const svg = $('#preview-area svg');
    if (!svg || !currentPreset) return;

    svg.classList.remove(...presets.map(p => 'anim-' + p.id));
    svg.style.removeProperty('--dur');
    svg.style.removeProperty('--easing');
    svg.style.removeProperty('--iter');
    svg.style.removeProperty('--dir');
    svg.style.removeProperty('--oval-rx');
    svg.style.removeProperty('--oval-ry');
    svg.style.animation = 'none';
    svg.offsetHeight;

    const preset = presets.find(p => p.id === currentPreset);
    svg.style.setProperty('--dur', settings.speed + 's');
    svg.style.setProperty('--easing', preset.easing);
    svg.style.setProperty('--iter', settings.iter);
    svg.style.setProperty('--dir', settings.dir);

    if (currentPreset === 'oval') {
      svg.style.setProperty('--oval-rx', ovalSettings.rx + 'px');
      svg.style.setProperty('--oval-ry', ovalSettings.ry + 'px');
    }

    svg.style.animation = '';
    svg.classList.add('anim-' + currentPreset);
    svg.style.animationPlayState = animationPlaying ? 'running' : 'paused';
    prepareSvgForAnimation(svg);
    renderElements();
  }

  function updateSpeedDisplay() { $('#speed-value').textContent = settings.speed.toFixed(1) + 's'; }
  function updateDelayDisplay() { $('#delay-value').textContent = settings.delay.toFixed(1) + 's'; }

  // Controls
  $('#speed-slider').addEventListener('input', e => {
    settings.speed = parseFloat(e.target.value);
    updateSpeedDisplay();
    applyAnimation();
  });

  $('#delay-slider').addEventListener('input', e => {
    settings.delay = parseFloat(e.target.value);
    updateDelayDisplay();
    applyAnimation();
  });

  $$('#iter-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#iter-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.iter = btn.dataset.val;
      applyAnimation();
    });
  });

  $$('#dir-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#dir-group .toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.dir = btn.dataset.val;
      applyAnimation();
    });
  });

  // Oval controls
  $('#oval-rx').addEventListener('input', e => { ovalSettings.rx = parseInt(e.target.value); $('#oval-rx-val').textContent = ovalSettings.rx + 'px'; applyAnimation(); });
  $('#oval-ry').addEventListener('input', e => { ovalSettings.ry = parseInt(e.target.value); $('#oval-ry-val').textContent = ovalSettings.ry + 'px'; applyAnimation(); });
  $('#oval-angle').addEventListener('input', e => { ovalSettings.angle = parseInt(e.target.value); $('#oval-angle-val').textContent = ovalSettings.angle + 'deg'; applyAnimation(); });

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
    if (svg) svg.style.animationPlayState = 'paused';
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.addEventListener('pointerdown', onElementPointerDown);
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
    if (svg) svg.style.animationPlayState = animationPlaying ? 'running' : '';
    if (!svg) return;
    svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, text, g').forEach(el => {
      el.removeEventListener('pointerdown', onElementPointerDown);
      el.classList.remove('element-selected');
      el.style.removeProperty('transform');
    });
    selectedElement = null;
  }

  function onElementPointerDown(e) {
    e.stopPropagation();
    e.preventDefault();
    if (selectedElement) selectedElement.classList.remove('element-selected');
    selectedElement = e.currentTarget;
    selectedElement.classList.add('element-selected');
    const svgEl = $('#preview-area svg');
    dragState = { element: selectedElement, startClientX: e.clientX, startClientY: e.clientY, svgRect: svgEl.getBoundingClientRect() };
    document.addEventListener('pointermove', onElementPointerMove);
    document.addEventListener('pointerup', onElementPointerUp);
  }

  function onElementPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startClientX;
    const dy = e.clientY - dragState.startClientY;
    const svgRect = dragState.svgRect;
    dragState.element.style.transform = `translate(${dx * 200 / svgRect.width}px, ${dy * 200 / svgRect.height}px)`;
  }

  function onElementPointerUp() {
    if (!dragState) return;
    document.removeEventListener('pointermove', onElementPointerMove);
    document.removeEventListener('pointerup', onElementPointerUp);
    dragState = null;
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isPiecesMode && selectedElement) {
      selectedElement.classList.remove('element-selected');
      selectedElement.style.removeProperty('transform');
      selectedElement = null;
    }
  });

  // Export
  $('#export-btn').addEventListener('click', () => {
    if (!currentSvg || !currentPreset) return;
    const svg = $('#preview-area svg');
    const clone = svg.cloneNode(true);
    clone.removeAttribute('class');
    clone.style.animationPlayState = '';

    const preset = presets.find(p => p.id === currentPreset);
    const keyframeMap = {
      rotate: `@keyframes svgRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
      wheel:  `@keyframes svgWheel { 0% { transform: rotate(0deg); } 25% { transform: rotate(90deg); } 50% { transform: rotate(180deg); } 75% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }`,
      pulse:  `@keyframes svgPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }`,
      bounce: `@keyframes svgBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`,
      gravity: `@keyframes svgGravity { 0% { transform: translateY(-100px); } 30% { transform: translateY(80px); } 50% { transform: translateY(-40px); } 70% { transform: translateY(30px); } 85% { transform: translateY(-10px); } 100% { transform: translateY(0); } }`,
      slide:  `@keyframes svgSlide { 0%, 100% { transform: translateX(-80px); } 50% { transform: translateX(80px); } }`,
      oval:   `@keyframes svgOval { 0% { transform: translate(0,0); } 25% { transform: translate(var(--oval-rx,80px),0); } 50% { transform: translate(0,var(--oval-ry,40px)); } 75% { transform: translate(calc(-1*var(--oval-rx,80px)),0); } 100% { transform: translate(0,0); } }`,
      fade:   `@keyframes svgFade { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }`,
      draw:   `@keyframes svgDraw { from { stroke-dashoffset: var(--path-length, 1000); } to { stroke-dashoffset: 0; } }`,
      shake:  `@keyframes svgShake { 0%, 100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-8px); } 20%,40%,60%,80% { transform: translateX(8px); } }`,
      float:  `@keyframes svgFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }`,
      spin:   `@keyframes svgSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.85); } 100% { transform: rotate(360deg) scale(1); } }`,
      glow:   `@keyframes svgGlow { 0%, 100% { filter: drop-shadow(0 0 4px rgba(108,92,231,0.3)); } 50% { filter: drop-shadow(0 0 24px rgba(108,92,231,0.9)); } }`,
    };

    const ovalVars = currentPreset === 'oval' ? `--oval-rx: ${ovalSettings.rx}px; --oval-ry: ${ovalSettings.ry}px;` : '';
    const animCSS = `svg { transform-origin: center center; transform-box: fill-box; ${ovalVars} animation: svg${currentPreset.charAt(0).toUpperCase() + currentPreset.slice(1)} ${settings.speed}s ${preset.easing} ${settings.iter} ${settings.dir}; } ${keyframeMap[currentPreset]}`;
    let drawStyles = currentPreset === 'draw' ? `path, line, polyline, polygon, circle, ellipse, rect { stroke-dasharray: 1000; --path-length: 1000; }` : '';

    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = animCSS + drawStyles;
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

})();