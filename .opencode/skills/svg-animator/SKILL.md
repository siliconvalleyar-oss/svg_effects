---
name: svg-animator
description: Use when working on the SVG Animator project (svg_animated). A vanilla JS web app for animating SVGs with presets, multi-preset per element, undo/redo, rotation handle, metadata panel, z-order, file browser, pieces mode, slideshow, clean export, and fade opacity controls.
---

# SVG Animator — Skill Reference

App web 100% cliente para animar SVGs. Sin dependencias, sin build tools. Vanilla HTML/CSS/JS + versión Qt (C++17/CMake).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vanilla JS (ES6), HTML5, CSS3 |
| Layout | Flexbox, CSS Grid, CSS Custom Properties |
| Animaciones | CSS `@keyframes`, multi-preset por elemento |
| Servidor | Python 3 (`python3 -m http.server`) |
| Qt | Qt 5.15 (Widgets, Svg, Xml), C++17, CMake 3.16+ |
| Dependencias | **Ninguna** |

## Archivos principales

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Estructura HTML: sidebar, preview, panel, metadata |
| `styles.css` | Tema oscuro, keyframes, layout, metadata cyan |
| `app.js` | ~1736 líneas: motor animación, multi-preset, undo/redo, rotación, z-order, file browser, pieces, slides, export |
| `VERSION` | `1.2.0` |
| `RULES.md` | Reglas de versionado y push |
| `docs/` | Documentación completa en español |
| `files/` | SVGs de ejemplo: `index-octonaut.svg`, `index-portal-blue.svg`, etc. |
| `qt/` | Versión Qt (C++17, CMake) |

## Características implementadas

### Animaciones (13 presets)
`rotate`, `wheel`, `pulse`, `bounce`, `gravity`, `slide`, `oval`, `fade`, `draw`, `shake`, `float`, `spin`, `glow`

### Multi-preset por elemento
- `presetIds` array en lugar de `presetId` string
- Varios presets simultáneos por elemento
- Propiedades en conflicto: el último en `presetIds` tiene prioridad
- `applyOneAnimation(index)`: aplica CSS animation combinada (comma-separated)

### Panel de propiedades (metadata)
- Siempre visible al seleccionar elemento
- Muestra: tag, ID, visibilidad (con botón de ojo), posición X/Y, ancho/alto, ángulo (-180° a 180°), escala (10–300%)
- Texto cyan/teal (`#5dade2` / `#85c1e9`)
- Visibilidad sincronizada con miniaturas vía `origElRefs[index]`

### Rotación visual
- Manejador overlay SVG: línea + punto central + perilla arrastrable
- `visualRotation` en config (persistido en undo/redo)
- `applyElementVisual()` con `transform-box: fill-box` y `transform-origin: center center`
- Durante drag: pausa animación CSS; al soltar: reanuda si hay preset
- Slider de rotación en metadata se actualiza en tiempo real

### Escala
- `scale` en config (0.1–3.0, slider en metadata 10–300%)
- Aplicada como parte del `transform` visual

### Control de opacidad (Desvanecer)
- Sliders Min/Max (0–100%) visibles al activar preset `fade`
- `fadeMin`/`fadeMax` en config (0–1 float)
- Keyframes usan `var(--fade-min, 0.15)` / `var(--fade-max, 1)`

### Órden Z
- Botones: frente, fondo, subir, bajar
- `_reorderElement(el, fn)`: reordena DOM + reindexa `elementAnimations`

### File browser
- Fetch de `files/` desde servidor HTTP
- Fallback a lista hardcoded si falla
- Folder picker: `<input type="file" webkitdirectory>`
- Drag desde lista al preview
- SVG por defecto: `files/index-octonaut.svg` al inicio

### Undo/Redo
- `actionHistory` (50 instantáneas)
- `pushHistory()`, `undo()`, `redo()`
- Ctrl+Z / Ctrl+Shift+Z
- `afterHistoryRestore()`: reaplica animaciones + transforms visuales

### Copy/Paste/Duplicate/Delete
- `copiedConfig` clipboard por elemento
- Ctrl+C / Ctrl+V / Ctrl+D / Delete
- `deleteElement()` reindexa `elementAnimations`

### Modo piezas
- PointerEvents para seleccionar/arrastrar elementos
- `visualX`/`visualY` en config (persistente al salir del modo)
- Pausa/reanuda animaciones al entrar/salir
- Ya no elimina transforms al salir (fix: no pierde rotación/escala)

### Export limpio
- Clona SVG, elimina `element-selected`, `outline`, `outline-offset`, `filter`
- Mantiene `display:none` y transforms visuales
- Keyframes embedidos con custom properties
- Reglas `tag:nth-child(n)` por elemento

### Estructura clave del código (`app.js`)

| Función | Ubicación | Propósito |
|---------|-----------|-----------|
| `getDefaultElementConfig()` | L330 | Config base con `presetIds`, `visualRotation`, `fadeMin`, etc. |
| `applyElementVisual(el, cfg)` | L334 | Transform visual: translate + rotate + scale |
| `loadSvgString(svgStr)` | L350 | Carga SVG, resetea `origElRefs`, setup preview |
| `renderElements()` | L433 | Miniaturas + visibilidad + z-order |
| `selectElement(index)` | ~L680 | Selección, highlight, rotation handle, metadata |
| `loadElementConfig(index)` | L689 | Puebla controles desde config |
| `updateMetadata(el, cfg, index)` | L765 | Actualiza panel propiedades |
| `applyAllAnimations()` | L900 | Aplica animaciones a todos los elementos |
| `applyOneAnimation(index)` | L909 | Aplica presetIds como CSS animation al elemento |
| `showRotationHandle(idx)` | L1219 | Crea overlay SVG de rotación |
| `onRotationPointerMove(e)` | L1316 | Arrastre: actualiza angle + pausa animación |
| `enterPiecesMode()` | L1145 | Activa pieces, pausa anims, agrega outlines |
| `exitPiecesMode()` | L1163 | Desactiva pieces, reanuda anims (NO borra transform) |
| `exportAnimatedSvg()` | L1397 | Clona, limpia, genera CSS + keyframes |

### Atajos de teclado

| Tecla | Acción |
|-------|--------|
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copiar config |
| Ctrl+V | Pegar config |
| Ctrl+D | Duplicar elemento |
| Delete/Backspace | Eliminar elemento |
| ESC | Deseleccionar en pieces mode |
| Space | Play/Pause |

### VERSION

Incrementar VERSION (semver) antes de cada push:
```bash
echo "1.2.0" > VERSION
git tag $(cat VERSION)
```
