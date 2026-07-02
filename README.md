# SVG Animator

Aplicación web 100% cliente para animar SVGs con presets, modo piezas, slides y exportación. Sin dependencias, sin build tools.

## Características

- **13 animaciones preset**: Rotar, Rueda, Pulsar, Rebotar, Gravedad, Deslizar, Óvalo, Desvanecer, Dibujar, Temblar, Flotar, Girar, Brillar
- **Múltiples presets simultáneos** por elemento (`presetIds` array)
- **Panel de propiedades**: etiqueta, ID, visibilidad (ocultar/mostrar), posición X/Y, ancho/alto, ángulo (slider), escala (slider)
- **Manejador de rotación visual**: línea + punto central + perilla arrastrable sobre cada elemento
- **Control de escala** por elemento (10%–300%)
- **Control de opacidad** para preset Desvanecer (sliders Min/Max 0%–100%)
- **Órden Z**: traer al frente, enviar al fondo, subir, bajar
- **Modo piezas**: seleccionar y arrastrar elementos individualmente con `transform` visual
- **Historial undo/redo** (Ctrl+Z / Ctrl+Shift+Z, 50 instantáneas)
- **Copiar/pegar/duplicar/eliminar** configuración de animación entre elementos
- **Sentido/ángulo de movimiento** (0–360°, flecha de trayectoria)
- **Exportación limpia**: SVG autocontenido con CSS embebido, sin residuos del editor
- **Navegador de archivos** del servidor (`files/`) + selector de carpetas (`webkitdirectory`)
- **Drag & drop**: desde la lista de archivos y desde el explorador del SO
- **SVG por defecto** `files/index-octonaut.svg` cargado al inicio
- **Previsualización ampliada** con `overflow: visible`
- **Slides**: agregar SVG como slide, 6 transiciones, reordenar, play automático

## Inicio rápido

```bash
./serve.sh 8080
# Abrir http://localhost:8080
```

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | Instalación y requisitos |
| [`docs/ANIMATIONS.md`](docs/ANIMATIONS.md) | Lista de animaciones con controles |
| [`docs/CONTROLS.md`](docs/CONTROLS.md) | Todos los controles y atajos |
| [`docs/PIECES.md`](docs/PIECES.md) | Modo piezas detallado |
| [`docs/EXPORT.md`](docs/EXPORT.md) | Formato de exportación |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Guía para desarrolladores |
