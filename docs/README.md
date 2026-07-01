# SVG Animator

Aplicacion web para animar archivos SVG con una amplia gama de efectos predefinidos y controles avanzados.

## Caracteristicas

- **16 animaciones preset**: Rotar, Rueda, Espiral, Pulsar, Rebotar, Gravedad, Deslizar, Ovalo, Elastico, Wave, Desvanecer, Dibujar, Temblar, Flotar, Girar, Brillar
- **Control de eje de referencia**: Configurar el origen de transformacion (X, Y) para cada animacion
- **Controles avanzados**: Velocidad, retraso, repeticion, direccion, amplitud
- **Modo piezas**: Seleccionar y mover elementos individuales del SVG
- **Generador de formas**: 12 formas predefinidas para generar SVGs
- **Importar SVG**: Drag & drop o seleccion de archivos
- **Exportar**: Descarga SVGs con animaciones CSS embebidas
- **Servidor local**: Script para servir la app en un puerto configurable

## Arquitectura

```
svg_animated/
  index.html       # Estructura HTML
  styles.css       # Estilos y keyframes CSS
  app.js           # Logica JavaScript
  serve.sh         # Script de servidor
  sample.svg       # SVG de ejemplo
  files/           # Directorio de SVGs del servidor
  docs/            # Documentacion
```

## Rapido inicio

```bash
./serve.sh 8080
# Abrir http://localhost:8080
```

## Documentacion

- [Instalacion](INSTALLATION.md)
- [Animaciones](ANIMATIONS.md)
- [Controles](CONTROLS.md)
- [Modo Piezas](PIECES.md)
- [Exportar](EXPORT.md)
- [Desarrollo](DEVELOPMENT.md)
