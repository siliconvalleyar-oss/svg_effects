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

  // Group system
  let elementGroups = {}; // { groupId: { name, elements: [indices], presetId, config } }
  let selectedGroupElements = []; // multi-select indices
  let isMultiSelectMode = false;
  let nextGroupId = 1;

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
      selectPreset(p.id);
    });
    presetGrid.appendChild(btn);
  });

  // Apply to all elements
  $('#apply-all-btn').addEventListener('click', () => {
    if (!lastPresetId) return;
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const preset = presets.find(p => p.id === lastPresetId);
    elements.forEach((el, i) => {
      if (!elementAnimations[i]) elementAnimations[i] = getDefaultElementConfig();
      elementAnimations[i].presetId = lastPresetId;
      elementAnimations[i].speed = preset.duration;

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
    return { presetId: null, speed: 1, delay: 0, iter: 'infinite', dir: 'normal', ovalRx: 80, ovalRy: 40, ovalAngle: 0, directionAngle: 0 };
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
    elementAnimations = {};
    selectedElementIndex = null;
    elementGroups = {};
    selectedGroupElements = [];
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
    grid.innerHTML = '';
    const svg = $('#preview-area svg');
    if (!svg) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    if (!elements.length) { grid.innerHTML = '<div class="file-empty">Sin elementos</div>'; return; }

    // Group controls header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-controls';
    groupHeader.innerHTML = `
      <button class="group-btn" id="toggle-multiselect" title="Seleccionar múltiples piezas">☰ Seleccionar</button>
      <button class="group-btn" id="create-group-btn" title="Crear grupo con selección" style="display:none">Grupo +</button>
      <button class="group-btn" id="clear-selection-btn" title="Limpiar selección" style="display:none">✕</button>
    `;
    grid.appendChild(groupHeader);

    setTimeout(() => {
      const toggleBtn = $('#toggle-multiselect');
      const createBtn = $('#create-group-btn');
      const clearBtn = $('#clear-selection-btn');
      if (toggleBtn) toggleBtn.addEventListener('click', toggleMultiSelectMode);
      if (createBtn) createBtn.addEventListener('click', createGroupFromSelection);
      if (clearBtn) clearBtn.addEventListener('click', clearGroupSelection);
    }, 0);

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
      thumbSvg.appendChild(el.cloneNode(true));

      const item = document.createElement('div');
      item.className = 'element-thumb' + (selectedElementIndex === i ? ' selected' : '');
      if (selectedGroupElements.includes(i)) item.classList.add('multi-selected');
      if (group) item.classList.add('grouped');
      item.dataset.index = i;

      // Checkbox for multi-select
      if (isMultiSelectMode) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'el-checkbox';
        checkbox.checked = selectedGroupElements.includes(i);
        checkbox.addEventListener('click', e => {
          e.stopPropagation();
          toggleElementSelection(i);
        });
        item.appendChild(checkbox);
      }

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
        const original = $$(`#preview-area svg ${tag}`)[i];
        if (!original) return;
        const hidden = original.style.display === 'none';
        original.style.display = hidden ? '' : 'none';
        visBtn.classList.toggle('hidden', !hidden);
        thumbSvg.style.opacity = hidden ? '0.3' : '1';
      });
      item.appendChild(visBtn);

      item.addEventListener('click', () => {
        if (isMultiSelectMode) {
          toggleElementSelection(i);
        } else {
          selectElement(i);
        }
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
        groupItem.innerHTML = `
          <span class="group-item-name">${group.name} (${group.elements.length} piezas)</span>
          <button class="group-delete-btn" title="Eliminar grupo">✕</button>
        `;
        groupItem.querySelector('.group-delete-btn').addEventListener('click', () => deleteGroup(gid));
        groupItem.addEventListener('click', () => selectGroup(gid));
        groupsSection.appendChild(groupItem);
      });
      grid.appendChild(groupsSection);
    }
  }

  // ===== GROUP MANAGEMENT =====

  const groupColors = ['#6c5ce7', '#e74c3c', '#2ecc71', '#f39c12', '#1abc9c', '#9b59b6', '#3498db', '#e67e22'];

  function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    selectedGroupElements = [];
    const toggleBtn = $('#toggle-multiselect');
    const createBtn = $('#create-group-btn');
    const clearBtn = $('#clear-selection-btn');
    if (toggleBtn) toggleBtn.classList.toggle('active', isMultiSelectMode);
    if (createBtn) createBtn.style.display = isMultiSelectMode ? '' : 'none';
    if (clearBtn) clearBtn.style.display = isMultiSelectMode ? '' : 'none';
    renderElements();
  }

  function toggleElementSelection(index) {
    const idx = selectedGroupElements.indexOf(index);
    if (idx === -1) {
      selectedGroupElements.push(index);
    } else {
      selectedGroupElements.splice(idx, 1);
    }
    const createBtn = $('#create-group-btn');
    if (createBtn) createBtn.style.display = selectedGroupElements.length >= 2 ? '' : 'none';
    renderElements();
  }

  function clearGroupSelection() {
    selectedGroupElements = [];
    const createBtn = $('#create-group-btn');
    if (createBtn) createBtn.style.display = 'none';
    renderElements();
  }

  function createGroupFromSelection() {
    if (selectedGroupElements.length < 2) return;
    const name = prompt('Nombre del grupo:', `Grupo ${nextGroupId}`);
    if (!name) return;

    const color = groupColors[(nextGroupId - 1) % groupColors.length];
    const groupId = 'g' + nextGroupId++;

    // Get config from first selected element as template
    const firstIdx = selectedGroupElements[0];
    const templateConfig = elementAnimations[firstIdx] ? { ...elementAnimations[firstIdx] } : getDefaultElementConfig();

    elementGroups[groupId] = {
      name: name,
      color: color,
      elements: [...selectedGroupElements],
      config: templateConfig
    };

    // Apply same animation config to all elements in group
    selectedGroupElements.forEach(idx => {
      elementAnimations[idx] = { ...templateConfig };
    });

    selectedGroupElements = [];
    isMultiSelectMode = false;
    renderElements();

    // Apply animations to group
    applyGroupAnimation(groupId);
  }

  function deleteGroup(groupId) {
    const group = elementGroups[groupId];
    if (!group) return;
    delete elementGroups[groupId];
    renderElements();
  }

  function selectGroup(groupId) {
    const group = elementGroups[groupId];
    if (!group) return;

    // Highlight all elements in the group
    const svg = $('#preview-area svg');
    if (!svg) return;
    const elements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    svg.querySelectorAll('*').forEach(el => el.classList.remove('element-selected'));
    group.elements.forEach(idx => {
      if (elements[idx]) elements[idx].classList.add('element-selected');
    });

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
    const cfg = elementAnimations[index];
    if (!cfg) return;

    const hasPreset = !!cfg.presetId;
    if (hasPreset) {
      $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.id === cfg.presetId));
      const preset = presets.find(p => p.id === cfg.presetId);
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

    $('#oval-controls').style.display = cfg.presetId === 'oval' ? '' : 'none';
    if (cfg.presetId === 'oval') {
      $('#oval-rx').value = cfg.ovalRx;
      $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
      $('#oval-ry').value = cfg.ovalRy;
      $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
      $('#oval-angle').value = cfg.ovalAngle;
      $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    }

    $('#direction-controls').style.display = hasPreset ? '' : 'none';
    if (hasPreset) {
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

    setTimeout(() => {
      applyAllAnimations();
      if (animationPlaying) {
        setAllAnimationsPlayState('running');
        $('#play-btn').classList.add('active');
      }
    }, 50);
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
    if (!cfg || !cfg.presetId) {
      el.style.removeProperty('animation');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
      return;
    }

    el.style.transformOrigin = 'center center';
    el.style.transformBox = 'fill-box';

    const preset = presets.find(p => p.id === cfg.presetId);
    const isTranslateBased = ['slide', 'bounce', 'shake', 'float', 'gravity'].includes(cfg.presetId);
    const hasAngle = cfg.directionAngle && cfg.directionAngle !== 0;

    let animName;
    if (isTranslateBased && hasAngle) {
      animName = ensureDirectionKeyframes(cfg.presetId, cfg.directionAngle);
    } else {
      animName = 'svg' + cfg.presetId.charAt(0).toUpperCase() + cfg.presetId.slice(1);
    }

    const easing = preset ? preset.easing : 'ease-in-out';
    el.style.animation = `${animName} ${cfg.speed}s ${easing} ${cfg.iter} ${cfg.dir}`;
    el.style.animationDelay = cfg.delay + 's';
    el.style.animationPlayState = animationPlaying ? 'running' : 'paused';

    if (cfg.presetId === 'oval') {
      el.style.setProperty('--oval-rx', cfg.ovalRx + 'px');
      el.style.setProperty('--oval-ry', cfg.ovalRy + 'px');
    }

    if (cfg.presetId === 'draw') {
      const length = el.getTotalLength ? el.getTotalLength() : 1000;
      el.style.strokeDasharray = length;
      el.style.setProperty('--path-length', length);
    }
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
    cfg.presetId = id;
    const preset = presets.find(p => p.id === id);
    $('#speed-slider').value = preset.duration;
    cfg.speed = preset.duration;
    updateSpeedDisplay();
    $('#oval-controls').style.display = id === 'oval' ? '' : 'none';
    $('#direction-controls').style.display = '';

    // Check if element belongs to a group
    const groupId = Object.keys(elementGroups).find(gid => elementGroups[gid].elements.includes(selectedElementIndex));
    if (groupId) {
      // Apply to all elements in the group
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

  // Controls
  $('#speed-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.speed = parseFloat(e.target.value);
    updateSpeedDisplay();
    applyOneAnimation(selectedElementIndex);
  });

  $('#delay-slider').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.delay = parseFloat(e.target.value);
    updateDelayDisplay();
    applyOneAnimation(selectedElementIndex);
  });

  $$('#iter-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cfg = getConfigForSelected();
      if (!cfg) return;
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
  });

  // Oval controls
  $('#oval-rx').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRx = parseInt(e.target.value);
    $('#oval-rx-val').textContent = cfg.ovalRx + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#oval-ry').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalRy = parseInt(e.target.value);
    $('#oval-ry-val').textContent = cfg.ovalRy + 'px';
    applyOneAnimation(selectedElementIndex);
  });
  $('#oval-angle').addEventListener('input', e => {
    const cfg = getConfigForSelected();
    if (!cfg) return;
    cfg.ovalAngle = parseInt(e.target.value);
    $('#oval-angle-val').textContent = cfg.ovalAngle + 'deg';
    applyOneAnimation(selectedElementIndex);
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

  // ===== EXPORT =====

  $('#export-btn').addEventListener('click', () => {
    if (!currentSvg) return;
    const svg = $('#preview-area svg');
    const clone = svg.cloneNode(true);
    clone.removeAttribute('class');
    clone.querySelectorAll('style#dir-keyframes').forEach(s => s.remove());

    const usedPresets = new Set();
    const elements = clone.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');
    const origElements = svg.querySelectorAll('circle, rect, ellipse, path, line, polyline, polygon, g, text');

    let embeddedStyle = '';
    let elementStyles = '';

    elements.forEach((el, i) => {
      const cfg = elementAnimations[i];
      if (!cfg || !cfg.presetId) return;
      usedPresets.add(cfg.presetId);
      const preset = presets.find(p => p.id === cfg.presetId);
      const origEl = origElements[i];
      const tag = origEl ? origEl.tagName.toLowerCase() : el.tagName.toLowerCase();

      const isTranslateBased = ['slide', 'bounce', 'shake', 'float', 'gravity'].includes(cfg.presetId);
      const hasAngle = cfg.directionAngle && cfg.directionAngle !== 0;

      let animName;
      if (isTranslateBased && hasAngle) {
        const rad = cfg.directionAngle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const dirName = cfg.presetId + '_export_' + i;
        animName = dirName;
        let kf = '';
        switch (cfg.presetId) {
          case 'slide':
            kf = `@keyframes ${dirName} { 0%,100% { transform: translate(${-80*cos}px,${-80*sin}px); } 50% { transform: translate(${80*cos}px,${80*sin}px); } }`;
            break;
          case 'bounce':
            kf = `@keyframes ${dirName} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${20*cos}px,${20*sin}px); } }`;
            break;
          case 'shake':
            kf = `@keyframes ${dirName} { 0%,100% { transform: translate(0,0); } 10%,30%,50%,70%,90% { transform: translate(${-8*cos}px,${-8*sin}px); } 20%,40%,60%,80% { transform: translate(${8*cos}px,${8*sin}px); } }`;
            break;
          case 'float':
            kf = `@keyframes ${dirName} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(${15*cos}px,${15*sin}px); } }`;
            break;
          case 'gravity':
            kf = `@keyframes ${dirName} { 0% { transform: translate(${-100*cos}px,${-100*sin}px); } 30% { transform: translate(${80*cos}px,${80*sin}px); } 50% { transform: translate(${-40*cos}px,${-40*sin}px); } 70% { transform: translate(${30*cos}px,${30*sin}px); } 85% { transform: translate(${-10*cos}px,${-10*sin}px); } 100% { transform: translate(0,0); } }`;
            break;
        }
        embeddedStyle += kf + '\n';
      } else {
        switch (cfg.presetId) {
          case 'rotate': animName = 'svgRotate'; embeddedStyle += `@keyframes svgRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n`; break;
          case 'wheel': animName = 'svgWheel'; embeddedStyle += `@keyframes svgWheel { 0% { transform: rotate(0deg); } 25% { transform: rotate(90deg); } 50% { transform: rotate(180deg); } 75% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }\n`; break;
          case 'pulse': animName = 'svgPulse'; embeddedStyle += `@keyframes svgPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }\n`; break;
          case 'bounce': animName = 'svgBounce'; embeddedStyle += `@keyframes svgBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }\n`; break;
          case 'gravity': animName = 'svgGravity'; embeddedStyle += `@keyframes svgGravity { 0% { transform: translateY(-100px); } 30% { transform: translateY(80px); } 50% { transform: translateY(-40px); } 70% { transform: translateY(30px); } 85% { transform: translateY(-10px); } 100% { transform: translateY(0); } }\n`; break;
          case 'slide': animName = 'svgSlide'; embeddedStyle += `@keyframes svgSlide { 0%,100% { transform: translateX(-80px); } 50% { transform: translateX(80px); } }\n`; break;
          case 'oval': animName = 'svgOval'; embeddedStyle += `@keyframes svgOval { 0% { transform: translate(0,0); } 25% { transform: translate(var(--oval-rx,80px),0); } 50% { transform: translate(0,var(--oval-ry,40px)); } 75% { transform: translate(calc(-1*var(--oval-rx,80px)),0); } 100% { transform: translate(0,0); } }\n`; break;
          case 'fade': animName = 'svgFade'; embeddedStyle += `@keyframes svgFade { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }\n`; break;
          case 'draw': animName = 'svgDraw'; embeddedStyle += `@keyframes svgDraw { from { stroke-dashoffset: var(--path-length,1000); } to { stroke-dashoffset: 0; } }\n`; break;
          case 'shake': animName = 'svgShake'; embeddedStyle += `@keyframes svgShake { 0%,100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-8px); } 20%,40%,60%,80% { transform: translateX(8px); } }\n`; break;
          case 'float': animName = 'svgFloat'; embeddedStyle += `@keyframes svgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }\n`; break;
          case 'spin': animName = 'svgSpin'; embeddedStyle += `@keyframes svgSpin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(0.85); } 100% { transform: rotate(360deg) scale(1); } }\n`; break;
          case 'glow': animName = 'svgGlow'; embeddedStyle += `@keyframes svgGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(108,92,231,0.3)); } 50% { filter: drop-shadow(0 0 24px rgba(108,92,231,0.9)); } }\n`; break;
        }
      }

      const easing = preset ? preset.easing : 'ease-in-out';
      const ovalVars = cfg.presetId === 'oval' ? `--oval-rx: ${cfg.ovalRx}px; --oval-ry: ${cfg.ovalRy}px;` : '';
      const drawExtra = cfg.presetId === 'draw' ? ' stroke-dasharray: 1000; --path-length: 1000;' : '';
      elementStyles += `${tag}:nth-child(${i + 1}) { transform-origin: center center; transform-box: fill-box; ${ovalVars} animation: ${animName} ${cfg.speed}s ${easing} ${cfg.iter} ${cfg.dir}; animation-delay: ${cfg.delay}s;${drawExtra} }\n`;
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

  // Keyboard shortcut for play/pause
  document.addEventListener('keydown', e => {
    if (e.key === ' ' && !isPiecesMode && !e.target.matches('input, button, textarea')) {
      e.preventDefault();
      if (animationPlaying) pauseAnimation();
      else playAnimation();
    }
  });

})();
