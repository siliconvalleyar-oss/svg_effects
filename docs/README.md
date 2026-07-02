# SVG Animator

Aplicación web 100% cliente para animar archivos SVG con efectos predefinidos, modo piezas, slides y exportación.

## Características

- **13 animaciones preset** con soporte multi-preset simultáneo por elemento
- **Panel de propiedades**: etiqueta, ID, visibilidad, posición, tamaño, ángulo, escala
- **Manejador de rotación visual**: arrastrable sobre el elemento en preview
- **Control de opacidad** para el preset Desvanecer (mínimo y máximo configurables)
- **Órden Z**: frente, fondo, subir, bajar
- **Modo piezas**: seleccionar y mover elementos individualmente
- **Historial undo/redo** (Ctrl+Z / Ctrl+Shift+Z, 50 niveles)
- **Copiar/pegar/duplicar/eliminar** config de animación
- **Sentido/ángulo de movimiento** con flecha de trayectoria
- **Exportación** SVG autocontenido con CSS embebido, limpio de residuos del editor
- **Navegador de archivos** del servidor + selector de carpetas
- **Drag & drop** desde lista de archivos y desde el SO
- **SVG por defecto** cargado al inicio
- **Slides** con 6 transiciones y play automático

## Arquitectura

```
svg_animated/
  index.html       # Estructura HTML (sidebar, preview, panel)
  styles.css       # Estilos y keyframes CSS
  app.js           # Lógica completa (motor de animación, piezas, export)
  serve.sh         # Script de servidor HTTP
  VERSION          # Versión semver
  files/           # SVGs de ejemplo servidos por el servidor
  qt/              # Versión Qt (C++17, CMake)
  .opencode/       # Skill reference para opencode
  docs/            # Documentación
```

## Inicio rápido

```bash
./serve.sh 8080
# Abrir http://localhost:8080
```

## Documentación

- [Instalación](INSTALLATION.md)
- [Animaciones](ANIMATIONS.md)
- [Controles](CONTROLS.md)
- [Modo Piezas](PIECES.md)
- [Exportar](EXPORT.md)
- [Desarrollo](DEVELOPMENT.md)
