# Desarrollo

## Estructura del código

### `styles.css`
- Variables CSS para theming oscuro
- Layout: sidebar (izquierda), preview (centro), panel (derecha)
- Componentes UI (botones, sliders, toggles, thumbnails)
- Keyframes CSS para todas las animaciones
- Estilos de metadata panel (cyan/teal)
- Estilos para manejador de rotación, flecha de dirección, file browser

### `app.js`
- **Presets**: Array de 13 animaciones disponibles
- **Shapes**: 12 SVGs de formas predefinidas
- **File browser**: Carga de SVGs del servidor + folder picker
- **Undo/Redo**: Historial de 50 instantáneas con push/splice
- **Element actions**: Copy, paste, delete, duplicate config
- **Z-order**: Reordenamiento DOM de elementos SVG
- **Metadata panel**: Actualización de etiqueta, ID, visibilidad, bbox, rotación, escala
- **Rotation handle**: Overlay SVG (línea + punto + perilla) con drag pointer
- **Animation engine**: `elementAnimations` map por índice, `applyOneAnimation`, `applyAllAnimations`
- **Multi-preset**: `presetIds` array, combinación CSS con animaciones separadas por coma
- **Pieces mode**: Pointer events para seleccionar y arrastrar elementos
- **Export**: Clon limpio + keyframes embebidos + reglas CSS por elemento
- **Slides**: 6 transiciones (fade, slide-h, slide-v, zoom, flip, blur)

### `index.html`
- Sidebar izquierdo (320px): import, archivos, shapes, presets, controles, óvalo, fade, modo piezas, export, slides
- Preview central con `#preview-area`
- Panel derecho (220px): miniaturas de elementos + z-order
- Metadata section (siempre visible al seleccionar)

### `qt/`
- Versión Qt 5.15 (Widgets, Svg, Xml), C++17, CMake 3.16+
- Misma funcionalidad de animación que la versión web

## Agregar nueva animación

1. Agregar preset en `app.js`:
```js
{ name: 'Mi Animación', id: 'mi-anim', color: '#ff0000', duration: 1, easing: 'ease-in-out' }
```
2. Agregar `@keyframes svgMiAnim { ... }` en `styles.css`
3. Agregar keyframe en el export (`exportKeyframes` en `app.js`)
4. Si usa translación, agregar id en `isTranslateBased` en `applyOneAnimation`
5. Si necesita controles especiales (como fade u oval), agregar HTML en `index.html` + lógica en `loadElementConfig` + event handlers

## Agregar nueva forma

Agregar en el array `shapes` en `app.js`:
```js
{ name: 'Mi Forma', svg: '<svg viewBox="0 0 200 200">...</svg>' }
```

## Servidor de desarrollo

```bash
./serve.sh 8080
# o puerto personalizado: ./serve.sh 3000
```

Los cambios en CSS y JS se reflejan recargando la página (sin hot reload).

## Dependencias

Ninguna. Solo vanilla HTML/CSS/JS.
